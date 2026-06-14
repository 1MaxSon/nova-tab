# Nova Tab

A customizable Chrome new tab extension built with React, TypeScript, Vite, and CRXJS.

Nova Tab replaces the default new tab page with a focused dashboard: clock, date, weather, search, draggable shortcuts, themes, custom wallpapers, and English/Russian localization.

<div style="display:flex;">
  <img src=".github/assets/theme_nova.png" width="50%">
  <img src=".github/assets/theme_ember.png" width="50%">
</div>

## Features

- Clean new tab dashboard with clock, date, weather and shortcuts
- Chrome search integration
- Draggable shortcut grid
- Shortcut groups with drag-and-drop organization
- Automatic favicon fetching with manual refresh
- Custom shortcut icons and colors
- Theme selector with matching wallpaper and shadcn/ui color variables
- Custom wallpaper upload
- English and Russian interface localization
- Browser-language default for the initial language
- Settings stored locally with `chrome.storage.local`
- Icon and custom wallpaper cache stored in IndexedDB

## Tech Stack

- React 19
- TypeScript
- Vite
- CRXJS
- Tailwind CSS
- shadcn/ui-style components
- Base UI / Vaul
- dnd-kit
- IndexedDB via `idb`

## Requirements

- Node.js
- npm/pnpm
- Chromium-based browser for extension testing

## Getting Started

Install dependencies:

```bash
npm install
```

Start the Vite dev server:

```bash
npm run dev
```

Build the extension:

```bash
npm run build
```


## Loading in Chrome

1. Run `npm run build`.
2. Open `chrome://extensions/`.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select the generated `dist` directory.
6. Open a new tab.

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Type-check and build the extension
npm run preview  # Preview the production build
npm run lint     # Run Biome lint
```

## Project Structure

```text
src/
  assets/
    global.css
  components/
    providers/
      storage-provider.tsx
    ui/
  lib/
    constants.ts
    i18n.ts
    storage.ts
    utils.ts
  newtab/
    components/
    index.html
    main.tsx
    nova-tab.tsx
manifest.config.ts
```

Key files:

- `manifest.config.ts` configures the Chrome extension manifest.
- `src/newtab/nova-tab.tsx` renders the new tab page.
- `src/newtab/components/settings-drawer.tsx` contains user-facing settings.
- `src/lib/storage.ts` handles Chrome storage and IndexedDB helpers.
- `src/lib/i18n.ts` contains translations.
- `src/lib/constants.ts` contains themes and weather code labels.

## Notes

- The extension overrides Chrome's new tab page through `chrome_url_overrides`.
- Weather data is fetched from Open-Meteo.
- Address search uses Nominatim.
- Favicons are fetched from external site/icon sources, so unavailable sites may fail to provide an icon.
- `npm run lint` may report issues in generated/shared UI components; check the output before treating it as a regression.
