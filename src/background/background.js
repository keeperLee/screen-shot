chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  if (request.action === 'captureVisibleTab') {
    chrome.tabs.captureVisibleTab(request.windowId, { format: 'png' })
      .then(dataUrl => {
        console.log('Screenshot captured');
        sendResponse({ dataUrl });
      })
      .catch(error => {
        console.error('Screenshot failed:', error);
        sendResponse({ error: error.message });
      });
    return true;
  }
  
  if (request.action === 'downloadScreenshot') {
    chrome.downloads.download({
      url: request.url,
      filename: 'screenshot.png',
      saveAs: true
    }, downloadId => {
      if (chrome.runtime.lastError) {
        console.error('Download failed:', chrome.runtime.lastError);
      }
      sendResponse({ downloadId });
    });
    return true;
  }
});

console.log('Background script loaded'); 