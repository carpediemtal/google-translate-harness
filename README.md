# Keyboard Shortcuts for Google Translate™ (KS4GT)

Provides customizable keyboard shortcuts for the Google Translate™ page. This repository is a modernized version modified based on [yamayamayamaji/Keyboard-Shortcuts-for-Google-Translate](https://github.com/yamayamayamaji/Keyboard-Shortcuts-for-Google-Translate), now built with **TypeScript**, **Vite**, and **Tailwind CSS**, supporting **Manifest V3**.

## Features
- **Customizable Shortcuts:** Bind keys to almost every button on the page.
- **Visual Feedback:** Shows key captions directly on the buttons.
- **Cross-Platform:** Supports Windows (Alt), Mac (Option/Control), and Linux.

## Default Shortcuts
### Windows / Linux
* **Swap Languages:** `Alt + 0`
* **Select Languages:** `Alt + 1` through `Alt + 7`
* **Language Menus:** `Alt + 8` (Source), `Alt + 9` (Target)
* **Delete Source:** `Alt + D`
* **Source Microphone:** `Alt + M`
* **Listen (Source):** `Alt + Shift + L`
* **Listen (Result):** `Alt + L`
* **Copy Result:** `Alt + C`
* **Focus to Input:** `Alt + F`
* **Translate:** `Shift + Enter`

### Mac
Use `Option` or `Control` instead of `Alt`.

## Development

### Prerequisites
- Node.js (v18+)
- npm

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Scripts
- **Development:** Run the Vite development server with HMR:
  ```bash
  npm run dev
  ```
- **Build:** Generate a production-ready extension in the `dist/` folder:
  ```bash
  npm run build
  ```

## Architecture
- `src/`: Core source code in TypeScript.
  - `src/background/`: Background service worker.
  - `src/content/`: Content scripts and CSS injection logic.
  - `src/options/`: Options page (Tailwind CSS + TS).
- `dev/`: Static assets, icons, and default configuration JSONs.
- `manifest.json`: Extension Manifest V3.

## Installation (Manual)
1. Run `npm run build`.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable "Developer mode" (top right).
4. Click "Load unpacked" and select the `dist/` folder from this project.

## Credits
Original author: [Ryosuke Yamaji](https://github.com/yamayamayamaji)

## Donations
If you find this extension useful, consider supporting the original author:
- [GitHub Sponsors](https://github.com/sponsors/yamayamayamaji)
- [Patreon](https://www.patreon.com/yamayamayamaji)

---
*Google Translate™ is a trademark of Google Inc. Use of this trademark is subject to Google Permissions.*
