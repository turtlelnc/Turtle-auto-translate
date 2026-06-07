// Background service worker for Auto Page Translator

chrome.runtime.onInstalled.addListener(() => {
  // Set default settings
  chrome.storage.sync.set({
    enabled: true,
    translator: 'google',
    sourceLang: 'en',
    targetLang: 'zh-CN',
    autoTranslateDomains: []
  });
});

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['enabled', 'translator', 'sourceLang', 'targetLang', 'autoTranslateDomains'], (result) => {
      sendResponse(result);
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.sync.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'translatePage') {
    // Forward translation request to content script
    chrome.tabs.sendMessage(sender.tab.id, request, (response) => {
      sendResponse(response);
    });
    return true;
  }
});
