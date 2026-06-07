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
        // Show success message
        translateBtn.textContent = '✓ Translated!';
        setTimeout(() => {
          translateBtn.textContent = 'Translate Page Now';
        }, 2000);
      }
    } catch (error) {
      console.error('Translation error:', error);
      alert('Failed to translate page. Please refresh and try again.');
    }
  });
  
  // Restore button
  restoreBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'restorePage'
      });
      
      restoreBtn.textContent = '✓ Restored!';
      setTimeout(() => {
        restoreBtn.textContent = 'Restore Original';
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
          alert(`Added ${domain} to auto-translate list`);
        } else {
          alert(`${domain} is already in the auto-translate list`);
        }
      }
    }
  });
});
