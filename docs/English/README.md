# Auto Page Translator - Chrome Extension

A browser extension for Chromium-based browsers that automatically translates entire web pages from English to Chinese.

## Features

- 🌐 **Full Page Translation**: Translate entire web pages with one click
- 🔤 **Unidirectional Translation**: English → Chinese (English to Chinese)
- 🎯 **Multiple Translation Engines**:
  - Google Translate
  - Microsoft Bing
  - Baidu Translate
  - DeepL
  - AI Translation (OpenAI GPT)
- ⚡ **Auto-Translate**: Set specific domains for automatic translation
- 💾 **Settings Persistence**: All settings saved to browser sync storage
- 🎨 **Beautiful UI**: Modern gradient popup interface

## Supported Browsers

- Google Chrome
- Microsoft Edge
- Brave
- Opera
- Other Chromium-based browsers

## Installation

### Method 1: Developer Mode (Recommended for Testing)

1. Download or clone the extension source code
2. Open Chrome browser and visit `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the `extension` folder
6. Extension installed successfully!

### Method 2: Packaged Installation

1. Open Chrome browser and visit `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Pack extension"
4. Select the `extension` folder
5. Drag the generated `.crx` file into the browser to install

## Usage Instructions

### Basic Usage

1. After installing the extension, click the extension icon in the browser toolbar
2. In the popup settings panel:
   - Enable/disable auto-translate feature
   - Select translation service (Google, Bing, Baidu, DeepL, AI)
   - (Optional) Enter API keys (DeepL or OpenAI)
   - (Optional) Add domains for auto-translation
3. Click "Translate Page Now" to translate the current page immediately
4. Click "Restore Original" to restore the original page

### Configuring API Keys

#### DeepL API Key
1. Visit [DeepL API](https://www.deepl.com/pro-api)
2. Register an account and get your API key
3. Enter the key in the extension settings

#### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Enter the key in the extension settings

### Auto-Translate Domains

Enter a domain name (e.g., `example.com`) in the settings panel and press Enter to add it to the auto-translate list. Pages from these domains will be automatically translated when visited.

## File Structure

```
extension/
├── manifest.json      # Extension configuration file
├── background.js      # Background service worker
├── content.js         # Content script (executes translation)
├── popup.html         # Popup interface
├── popup.js           # Popup logic
└── icons/             # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Technical Implementation

### Translation Process

1. **Content Extraction**: Traverse the page DOM and extract all text nodes
2. **Batch Translation**: Send text to translation API in batches (to avoid rate limits)
3. **Content Replacement**: Replace original text with translated results
4. **State Preservation**: Save original content for restoration

### Notes

- **Bing and Baidu**: Require official API keys for proper functionality; current version is a demo implementation
- **Translation Speed**: Large pages may take several seconds to tens of seconds to complete
- **CORS Restrictions**: Some translation services may be affected by cross-origin restrictions

## Development Guide

### Building CRX File

```bash
# Using Chrome to pack
1. Visit chrome://extensions/
2. Enable Developer Mode
3. Click "Pack extension"
4. Select the extension directory
```

### Debugging

1. Popup debugging: Right-click extension icon → "Inspect popup"
2. Background script debugging: Visit `chrome://extensions/` → Find extension → "Service Worker"
3. Content script debugging: Press F12 on the target page to open DevTools

## FAQ

### Q: Translation fails, what should I do?
A: 
- Check your network connection
- Try switching to another translation service
- Refresh the page and try again

### Q: Some pages cannot be translated?
A: 
- Some websites have security restrictions
- Dynamically loaded content may require manual translation trigger
- Try translating after the page has fully loaded

### Q: Translation quality is poor?
A: 
- Try switching to different translation services
- DeepL and AI translation usually provide higher quality
- Ensure correct language packs are installed

## Changelog

### v1.0.0
- Initial release
- Support for 5 translation services
- Auto-translate functionality
- Beautiful popup interface

## License

MIT License

## Contributing

Issues and Pull Requests are welcome!

## Contact

For questions or suggestions, please contact us through GitHub Issues.
