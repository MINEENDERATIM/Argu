# Advait

Advait is a privacy-first Chrome Extension for extracting any UI component or full webpage into an AI-ready structured payload. It is designed to help coding agents understand and recreate interfaces from screenshots, computed styles, DOM structure, framework hints, and interaction metadata while keeping everything local to the browser.

## Overview

Advait is built as a Manifest V3 browser extension with three core responsibilities:

- Select a component or page in the active tab
- Capture relevant DOM, style, framework, and animation metadata
- Generate a compact Markdown payload suitable for AI coding tools such as Cursor, Claude, GitHub Copilot, and ChatGPT

It works entirely offline and does not upload captured content to any external service.

## What it does

- Component mode for targeted UI selection
- Page mode for full-page extraction
- Highlighting with hover and keyboard traversal
- Computed CSS extraction with style normalization
- Framework detection heuristics for React, Vue, Angular, Svelte, Next.js, Nuxt, Shopify, WordPress, Webflow, Framer, and others
- Font and pseudo-element discovery
- Animation and pseudo-state collection
- Screenshot capture option for UI reference
- Clipboard-ready payload generation

## Key feasibility notes

This project is technically feasible in Chrome extensions, but some requirements are only partially reliable across arbitrary websites:

- DOM and CSS extraction are reliable and well-supported.
- Screenshot capture, hover highlighting, and keyboard selection are reliable.
- React Fiber internals, GSAP timelines, Framer Motion state, and framework-private runtime metadata are not consistently accessible on all sites due to browser sandboxing, CSP, and third-party code isolation.
- Some CSS pseudo-elements, dynamic animations, and custom interactions can only be recovered as best-effort approximations.
- The extension gracefully falls back to DOM and computed-style evidence when exact runtime metadata is unavailable.

The approach is designed to prioritize the strongest available signals while clearly labeling partial or approximated data instead of pretending every runtime detail can be extracted.

## Architecture

- Popup UI: React + Vite + TypeScript
- Content script: overlay, selection, DOM extraction, framework detection, CSS collection, and payload creation
- Background worker: tab coordination, screenshot handling, and message routing
- Shared helpers: message contracts, sanitization, and URL utilities

## Installation

```bash
npm install
npm run build
```

Then open Chrome and load the generated `dist` directory as an unpacked extension.

## Usage

1. Open the extension popup.
2. Choose Component mode or Page mode.
3. Hover and click to select an element, or use keyboard navigation.
4. Press Inspect page or trigger extraction from the popup.
5. Copy the generated payload for AI-assisted reconstruction.

## Demo page

A live demo is published with GitHub Pages:

**https://atim45.github.io/Argu/**

The demo is a frontend preview; Chrome-extension capture features require installing the extension locally. A local development version is also available:

```bash
npm install
npm run demo
```

Open http://localhost:4173/demo.html to test the page locally.

For a production extension build, use:

```bash
npm run build
```

The GitHub Pages site is deployed automatically when changes are pushed to `main`. To build the static site locally, run `npm run build:pages`.

## Privacy and security

- No backend
- No analytics or tracking
- No user accounts
- No external API calls
- No upload of captured site content
- Local-only processing in the browser

## Repository status

This repository contains the source code for the extension and a production build pipeline for Chrome Manifest V3.

## License

MIT
