# Reader

A minimal Chrome extension for saving and reading articles later. Clean, focused, and distraction-free.

## Features (Phase 1)

- Save articles with one click
- Clean, readable article parsing using Mozilla's Readability
- Local storage of saved articles
- Simple, intuitive interface

## Development Setup

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `src/extension` directory
5. The extension should now be installed and ready to use

## Project Structure

```
src/extension/
├── manifest.json      # Extension configuration
├── popup.html        # Extension popup UI
├── popup.js          # Popup functionality
├── background.js     # Background service worker
├── content.js        # Content script for page interaction
└── icons/            # Extension icons
```

## Testing

1. Visit any article or blog post
2. Click the Reader extension icon
3. Click "Save Article" to parse and store the content
4. The parsed article will be stored locally and can be viewed in the popup

## Coming Soon

- Reading progress tracking
- Web dashboard for saved articles
- Cloud sync
- Customizable reading experience 