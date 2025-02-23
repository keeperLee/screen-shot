<template>
  <div class="screenshot-container">
    <button @click="takeScreenshot" class="screenshot-btn" :disabled="isCapturing">
      {{ isCapturing ? '截图中...' : '开始截图' }}
    </button>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isCapturing = ref(false)
const error = ref('')

const injectContentScript = async (tabId) => {
  try {
    // 先检查是否已经注入
    const checkResult = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => window.hasScreenshotExtension
    });

    if (checkResult[0]?.result) {
      console.log('Content script already exists');
      return;
    }

    // 注入主要的content script
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['assets/content.js']
    });

    // 等待脚本初始化
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('Content script injected successfully');
  } catch (err) {
    console.error('Failed to inject content script:', err);
    throw new Error('无法注入截图脚本: ' + err.message);
  }
};

const takeScreenshot = async () => {
  error.value = ''
  isCapturing.value = true
  
  try {
    console.log('开始查询当前标签页...');
    const [tab] = await chrome.tabs.query({ 
      active: true, 
      currentWindow: true,
      status: 'complete'  // 确保页面已加载完成
    });
    
    if (!tab?.id) {
      throw new Error('无法获取当前标签页');
    }

    // 检查是否可以访问页面
    if (!tab.url.startsWith('http')) {
      throw new Error('无法在此页面使用截图功能');
    }
    
    // 确保content script已注入
    await injectContentScript(tab.id);
    
    console.log('发送截图消息到标签页:', tab.id);
    const response = await new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tab.id, { action: 'takeScreenshot' }, response => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
    
    console.log('截图完成:', response);
  } catch (err) {
    console.error('截图失败:', err);
    error.value = `截图失败: ${err.message}`;
  } finally {
    isCapturing.value = false;
  }
}
</script>

<style scoped>
.screenshot-container {
  padding: 16px;
}

.screenshot-btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.screenshot-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.screenshot-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.error-message {
  color: red;
  margin-top: 8px;
  font-size: 14px;
}
</style> 