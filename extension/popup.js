// Popup script for Auto Page Translator

document.addEventListener('DOMContentLoaded', async () => {
  const enableToggle = document.getElementById('enableToggle');
  const translatorSelect = document.getElementById('translatorSelect');
  const domainInput = document.getElementById('domainInput');
  const translateBtn = document.getElementById('translateBtn');
  const restoreBtn = document.getElementById('restoreBtn');
  const deeplKeyInput = document.getElementById('deeplKey');
  const openaiKeyInput = document.getElementById('openaiKey');
  const statusIndicator = document.getElementById('statusIndicator');
  
  // Load saved settings
  const settings = await chrome.runtime.sendMessage({ action: 'getSettings' });
  
  if (settings) {
    enableToggle.checked = settings.enabled !== false;
    translatorSelect.value = settings.translator || 'google';
    domainInput.value = settings.autoTranslateDomain || '';
    deeplKeyInput.value = settings.deeplApiKey || '';
    openaiKeyInput.value = settings.openaiApiKey || '';
    
    updateStatusIndicator(settings.enabled !== false);
  }
  
  // Update status indicator
  function updateStatusIndicator(enabled) {
    if (enabled) {
      statusIndicator.className = 'status-indicator status-active';
    } else {
      statusIndicator.className = 'status-indicator status-inactive';
    }
  }
  
  // Save settings
  async function saveSettings() {
    const settings = {
      enabled: enableToggle.checked,
      translator: translatorSelect.value,
      autoTranslateDomain: domainInput.value.trim(),
      deeplApiKey: deeplKeyInput.value.trim(),
      openaiApiKey: openaiKeyInput.value.trim()
    };
    
    await chrome.runtime.sendMessage({ 
      action: 'saveSettings', 
      settings: settings 
    });
    
    updateStatusIndicator(settings.enabled);
  }
  
  // Event listeners
  enableToggle.addEventListener('change', saveSettings);
  translatorSelect.addEventListener('change', saveSettings);
  domainInput.addEventListener('blur', saveSettings);
  deeplKeyInput.addEventListener('blur', saveSettings);
  openaiKeyInput.addEventListener('blur', saveSettings);
  
  // Translate button
  translateBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'translatePage',
        translator: translatorSelect.value
      });
      
      if (response && response.success) {
        translateBtn.textContent = '✓ 翻译完成！';
        setTimeout(() => {
          translateBtn.textContent = '立即翻译此页';
        }, 2000);
      }
    } catch (error) {
      console.error('Translation error:', error);
      alert('翻译页面失败，请刷新后重试。');
    }
  });
  
  // Restore button
  restoreBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'restorePage'
      });
      
      restoreBtn.textContent = '✓ 已还原！';
      setTimeout(() => {
        restoreBtn.textContent = '还原原始内容';
      }, 2000);
    } catch (error) {
      console.error('Restore error:', error);
    }
  });
  
  // Add domain to auto-translate list
  domainInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      const domain = domainInput.value.trim();
      if (domain) {
        const settings = await chrome.runtime.sendMessage({ action: 'getSettings' });
        const domains = settings.autoTranslateDomains || [];
        
        if (!domains.includes(domain)) {
          domains.push(domain);
          await chrome.runtime.sendMessage({
            action: 'saveSettings',
            settings: { autoTranslateDomains: domains }
          });
          
          domainInput.value = '';
          alert(`已将 ${domain} 添加到自动翻译列表`);
        } else {
          alert(`${domain} 已在自动翻译列表中`);
        }
      }
    }
  });
});
