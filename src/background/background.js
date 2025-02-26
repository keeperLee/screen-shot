// 保存水球状态
let showWaterBall = true;
let waterBallPosition = { right: '20px', bottom: '20px', left: 'auto', top: 'auto' };

// 初始化时从存储中加载状态
chrome.storage.sync.get(['showWaterBall', 'waterBallPosition'], (data) => {
  if (data.showWaterBall !== undefined) {
    showWaterBall = data.showWaterBall;
  } else {
    // 默认为显示
    chrome.storage.sync.set({ showWaterBall: true });
  }
  
  if (data.waterBallPosition) {
    waterBallPosition = data.waterBallPosition;
  } else {
    // 默认位置
    chrome.storage.sync.set({ waterBallPosition });
  }
  
  // 设置扩展图标
  updateExtensionIcon();
  
  // 初始化时在所有标签页上显示水球
  if (showWaterBall) {
    syncWaterBallToAllTabs();
  }
});

// 更新扩展图标以反映水球状态
function updateExtensionIcon() {
  // 计算今年已过去的时间百分比
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);
  
  const totalMilliseconds = endOfYear - startOfYear;
  const elapsedMilliseconds = now - startOfYear;
  
  const yearProgress = (elapsedMilliseconds / totalMilliseconds) * 100;
  
  // 创建一个带有进度指示的图标
  const canvas = new OffscreenCanvas(128, 128);
  const ctx = canvas.getContext('2d');
  
  // 绘制圆形背景
  ctx.beginPath();
  ctx.arc(64, 64, 60, 0, 2 * Math.PI);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.strokeStyle = '#2196F3';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // 绘制水位
  const waterHeight = 120 * (yearProgress / 100);
  ctx.beginPath();
  ctx.rect(4, 128 - waterHeight, 120, waterHeight);
  ctx.fillStyle = '#29b6f6';
  ctx.fill();
  
  // 绘制百分比文本
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${yearProgress.toFixed(1)}%`, 64, 64);
  
  // 设置图标
  const imageData = ctx.getImageData(0, 0, 128, 128);
  chrome.action.setIcon({ imageData });
  
  // 设置徽章文本
  chrome.action.setBadgeText({ text: showWaterBall ? '' : 'OFF' });
  chrome.action.setBadgeBackgroundColor({ color: '#F44336' });
}

// 向所有标签页同步水球状态和位置
function syncWaterBallToAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && tab.url.startsWith('http')) {
        try {
          chrome.tabs.sendMessage(tab.id, {
            action: 'updateWaterBall',
            show: showWaterBall,
            position: waterBallPosition
          }).catch(() => {
            // 如果消息发送失败，可能是内容脚本尚未加载
            console.log(`Failed to send message to tab ${tab.id}, injecting script...`);
          });
        } catch (e) {
          console.error(`Error sending message to tab ${tab.id}:`, e);
        }
      }
    });
  });
}

// 监听标签页更新事件，确保新标签页也有水球
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    try {
      chrome.tabs.sendMessage(tabId, {
        action: 'updateWaterBall',
        show: showWaterBall,
        position: waterBallPosition
      }).catch(() => {
        // 忽略错误
      });
    } catch (e) {
      console.error(`Error sending message to updated tab ${tabId}:`, e);
    }
  }
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getWaterBallState') {
    // 返回水球状态和位置
    sendResponse({ 
      show: showWaterBall,
      position: waterBallPosition
    });
    return true;
  } 
  
  if (request.action === 'setWaterBallState') {
    // 设置水球状态
    showWaterBall = request.show;
    chrome.storage.sync.set({ showWaterBall });
    
    // 更新图标
    updateExtensionIcon();
    
    // 向所有标签页广播新状态
    syncWaterBallToAllTabs();
    
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'updateWaterBallPosition') {
    // 更新水球位置
    waterBallPosition = request.position;
    chrome.storage.sync.set({ waterBallPosition });
    
    // 向所有标签页广播新位置
    syncWaterBallToAllTabs();
    
    sendResponse({ success: true });
    return true;
  }
});

// 定期更新图标以反映最新进度
setInterval(updateExtensionIcon, 60000); // 每分钟更新一次

console.log('Background script loaded'); 