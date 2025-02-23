// 防止重复注入
if (window.hasScreenshotExtension) {
  console.log('Screenshot content script already injected');
} else {
  console.log('Initializing screenshot content script...');
  
  // 标记已注入
  Object.defineProperty(window, 'hasScreenshotExtension', {
    value: true,
    enumerable: false,
    writable: false
  });
  
  async function captureFullPage() {
    console.log('开始截图...');
    try {
      // 获取页面完整高度
      const fullHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );
      
      console.log('页面高度:', fullHeight);
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // 创建canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewportWidth;
      canvas.height = fullHeight;

      // 保存原始滚动位置
      const originalScroll = window.scrollY;
      const fixedElements = [];

      try {
        // 找到所有固定定位的元素
        document.querySelectorAll('*').forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.position === 'fixed' || style.position === 'sticky') {
            fixedElements.push({
              element: el,
              originalPosition: el.style.position,
              originalTop: el.style.top,
              originalZIndex: el.style.zIndex,
              originalDisplay: el.style.display
            });
          }
        });

        // 第一次截图（包含顶部内容）
        window.scrollTo(0, 0);
        // 保持固定元素可见
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const firstScreenshot = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({ 
            action: 'captureVisibleTab',
            windowId: chrome.windows?.WINDOW_ID_CURRENT
          }, response => {
            if (chrome.runtime.lastError || response?.error) {
              reject(chrome.runtime.lastError || new Error(response.error));
            } else {
              resolve(response?.dataUrl);
            }
          });
        });

        // 绘制第一屏
        const firstImg = new Image();
        await new Promise((resolve, reject) => {
          firstImg.onload = resolve;
          firstImg.onerror = reject;
          firstImg.src = firstScreenshot;
        });
        context.drawImage(firstImg, 0, 0);

        // 隐藏固定元素，避免在后续截图中重复出现
        fixedElements.forEach(({ element }) => {
          element.style.display = 'none';
        });

        // 继续截取剩余部分
        let currentHeight = viewportHeight;
        while (currentHeight < fullHeight) {
          console.log('当前滚动位置:', currentHeight);
          window.scrollTo(0, currentHeight);
          await new Promise(resolve => setTimeout(resolve, 150));

          const dataUrl = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ 
              action: 'captureVisibleTab',
              windowId: chrome.windows?.WINDOW_ID_CURRENT
            }, response => {
              if (chrome.runtime.lastError || response?.error) {
                reject(chrome.runtime.lastError || new Error(response.error));
              } else {
                resolve(response?.dataUrl);
              }
            });
          });

          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = dataUrl;
          });

          // 计算需要绘制的区域
          const drawHeight = Math.min(viewportHeight, fullHeight - currentHeight);
          
          context.drawImage(
            img,
            0, 0,                    // 源图像起点
            viewportWidth, drawHeight, // 源图像尺寸
            0, currentHeight,         // 目标位置
            viewportWidth, drawHeight  // 目标尺寸
          );

          currentHeight += drawHeight;
        }
      } finally {
        // 恢复固定元素的原始状态
        fixedElements.forEach(({ element, originalPosition, originalTop, originalZIndex, originalDisplay }) => {
          element.style.position = originalPosition;
          element.style.top = originalTop;
          element.style.zIndex = originalZIndex;
          element.style.display = originalDisplay;
        });

        // 恢复原始滚动位置
        window.scrollTo(0, originalScroll);
      }

      // 下载图片
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const url = URL.createObjectURL(blob);
      
      chrome.runtime.sendMessage({
        action: 'downloadScreenshot',
        url: url
      }, () => {
        URL.revokeObjectURL(url);
      });
      
      console.log('截图完成');
    } catch (error) {
      console.error('截图过程出错:', error);
      throw error;
    }
  }

  // 监听来自popup的消息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script收到消息:', request);
    if (request.action === 'takeScreenshot') {
      captureFullPage()
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ error: error.message }));
      return true; // 保持消息通道开启
    }
  });

  console.log('Content script已加载');
} 