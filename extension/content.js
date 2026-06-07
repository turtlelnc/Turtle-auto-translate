// Content script for Auto Page Translator

let currentTranslation = null;
let originalContent = null;

// Listen for messages from background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translatePage') {
    translatePage(request.translator).then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'restorePage') {
    restorePage();
    sendResponse({ success: true });
    return true;
  }
});

// Check if auto-translate should be enabled for this domain
async function checkAutoTranslate() {
  const settings = await chrome.runtime.sendMessage({ action: 'getSettings' });
  
  if (!settings || !settings.enabled) {
    return false;
  }
  
  const domain = window.location.hostname;
  const autoTranslateDomains = settings.autoTranslateDomains || [];
  
  return autoTranslateDomains.includes(domain);
}

// Translate the entire page
async function translatePage(translator = 'google') {
  try {
    // Store original content if not already stored
    if (!originalContent) {
      originalContent = document.body.innerHTML;
    }
    
    // Get all text nodes in the page
    const textNodes = getAllTextNodes(document.body);
    
    // Translate text nodes in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < textNodes.length; i += batchSize) {
      const batch = textNodes.slice(i, i + batchSize);
      const promises = batch.map(node => translateNode(node, translator));
      await Promise.all(promises);
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < textNodes.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    currentTranslation = translator;
    showNotification('翻译完成！');

  } catch (error) {
    console.error('Translation error:', error);
    showNotification('翻译失败：' + error.message);
    throw error;
  }
}

// Restore original page content
function restorePage() {
  if (originalContent) {
    document.body.innerHTML = originalContent;
    originalContent = null;
    currentTranslation = null;
    showNotification('已还原页面原始语言');
  }
}

// Get all text nodes in an element (excluding script and style tags)
function getAllTextNodes(element) {
  const textNodes = [];
  
  function traverse(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text && text.length > 0) {
        textNodes.push(node);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Skip script, style, and other non-content elements
      const tagName = node.tagName.toLowerCase();
      if (!['script', 'style', 'noscript', 'iframe', 'svg'].includes(tagName)) {
        for (let child of node.childNodes) {
          traverse(child);
        }
      }
    }
  }
  
  traverse(element);
  return textNodes;
}

// Translate a single text node
async function translateNode(node, translator) {
  const text = node.textContent.trim();
  if (!text || text.length < 2) {
    return; // Skip very short texts
  }
  
  try {
    const translated = await translateText(text, translator);
    if (translated && translated !== text) {
      node.textContent = translated;
    }
  } catch (error) {
    console.warn('Failed to translate node:', error);
  }
}

// Translate text using specified service
async function translateText(text, translator) {
  const sourceLang = 'en';
  const targetLang = 'zh-CN';
  
  switch (translator) {
    case 'google':
      return await translateWithGoogle(text, sourceLang, targetLang);
    case 'mymemory':
      return await translateWithMyMemory(text, sourceLang, targetLang);
    case 'libretranslate':
      return await translateWithLibreTranslate(text, sourceLang, targetLang);
    case 'bing':
      return await translateWithBing(text, sourceLang, targetLang);
    case 'baidu':
      return await translateWithBaidu(text, sourceLang, targetLang);
    case 'deepl':
      return await translateWithDeepL(text, sourceLang, targetLang);
    case 'ai':
      return await translateWithAI(text, sourceLang, targetLang);
    default:
      return await translateWithGoogle(text, sourceLang, targetLang);
  }
}

// Google Translate implementation
async function translateWithGoogle(text, sourceLang, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/t?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('Google Translate API error');
    }
    
    const data = await response.json();
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
    return text;
  } catch (error) {
    console.error('Google translation error:', error);
    return text;
  }
}

// MyMemory free translation (no API key required, 1000 requests/day free)
async function translateWithMyMemory(text, sourceLang, targetLang) {
  const langPair = `${sourceLang}|${targetLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('MyMemory API 请求失败');
    }
    const data = await response.json();
    if (data && data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    return text;
  } catch (error) {
    console.error('MyMemory 翻译错误：', error);
    return text;
  }
}

// LibreTranslate free translation (open-source, uses public instance)
async function translateWithLibreTranslate(text, sourceLang, targetLang) {
  const url = 'https://libretranslate.com/translate';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      })
    });
    if (!response.ok) {
      throw new Error('LibreTranslate API 请求失败');
    }
    const data = await response.json();
    if (data && data.translatedText) {
      return data.translatedText;
    }
    return text;
  } catch (error) {
    console.error('LibreTranslate 翻译错误：', error);
    return text;
  }
}

// Bing Translate implementation (simplified - requires proper API key for production)
async function translateWithBing(text, sourceLang, targetLang) {
  // Note: This is a simplified version. For production, you need to use Bing's official API
  // with proper authentication. This uses a web-based approach for demonstration.
  
  try {
    // Using Bing's web translate endpoint (unofficial)
    const response = await fetch(`https://www.bing.com/translator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `from=${sourceLang}&to=${targetLang}&text=${encodeURIComponent(text)}`,
      redirect: 'manual'
    });
    
    // Since we can't directly access Bing's API without auth, 
    // fallback to returning original text
    // In production, implement proper Bing API integration
    console.warn('Bing translation requires API key - using fallback');
    return text;
  } catch (error) {
    console.error('Bing translation error:', error);
    return text;
  }
}

// Baidu Translate implementation (simplified - requires proper API key for production)
async function translateWithBaidu(text, sourceLang, targetLang) {
  // Note: This is a simplified version. For production, you need to use Baidu's official API
  // with proper authentication (appid and sign).
  
  try {
    // Placeholder for Baidu API integration
    console.warn('Baidu translation requires API credentials - using fallback');
    return text;
  } catch (error) {
    console.error('Baidu translation error:', error);
    return text;
  }
}

// DeepL Translate implementation (requires API key)
async function translateWithDeepL(text, sourceLang, targetLang) {
  // Note: DeepL requires an API key. Users would need to configure this in settings.
  
  try {
    // Get API key from storage (users need to set this up)
    const settings = await chrome.runtime.sendMessage({ action: 'getSettings' });
    const deeplApiKey = settings?.deeplApiKey;
    
    if (!deeplApiKey) {
      console.warn('DeepL API key not configured - using fallback');
      return text;
    }
    
    // Convert target language code for DeepL
    const deeplTargetLang = targetLang === 'zh-CN' ? 'ZH' : targetLang.toUpperCase();
    
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${deeplApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        target_lang: deeplTargetLang,
        source_lang: sourceLang.toUpperCase()
      })
    });
    
    if (!response.ok) {
      throw new Error('DeepL API error');
    }
    
    const data = await response.json();
    if (data && data.translations && data.translations[0]) {
      return data.translations[0].text;
    }
    return text;
  } catch (error) {
    console.error('DeepL translation error:', error);
    return text;
  }
}

// AI Translation implementation (placeholder for custom AI services)
async function translateWithAI(text, sourceLang, targetLang) {
  // This is a placeholder for integrating with custom AI translation services
  // like OpenAI's GPT, local LLMs, or other AI providers
  
  try {
    // Example: Using OpenAI's API (requires API key)
    const settings = await chrome.runtime.sendMessage({ action: 'getSettings' });
    const openaiApiKey = settings?.openaiApiKey;
    
    if (!openaiApiKey) {
      console.warn('OpenAI API key not configured - using fallback');
      return text;
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following text from ${sourceLang} to ${targetLang}. Only output the translation, nothing else.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      throw new Error('OpenAI API error');
    }
    
    const data = await response.json();
    if (data && data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    }
    return text;
  } catch (error) {
    console.error('AI translation error:', error);
    return text;
  }
}

// Show notification to user
function showNotification(message) {
  // Create a simple notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 999999;
    font-family: Arial, sans-serif;
    font-size: 14px;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Auto-translate on page load if enabled for this domain
(async () => {
  try {
    const shouldAutoTranslate = await checkAutoTranslate();
    if (shouldAutoTranslate) {
      const settings = await chrome.runtime.sendMessage({ action: 'getSettings' });
      await translatePage(settings?.translator || 'google');
    }
  } catch (error) {
    console.error('Auto-translate check failed:', error);
  }
})();
