# Quadrant Vibes System

The quadrant timer UI is themed via **vibes**: data objects in `game.js` plus per-vibe CSS files in `styles/`. This file explains how it hangs together and how to add new vibes.

## Runtime wiring

- Each quadrant is a `.quadrant` element.
- When a vibe is applied in `applyVibe(q, vibe)`, the code sets:
  - `q.vibe = vibe`
  - `q.el.dataset.vibe = vibe.key`
  - Several CSS variables on the quadrant (base/dark/accent/text colors and layout ratios).
- The per-vibe CSS files then target that quadrant with:
  - `.quadrant[data-vibe="<vibe-key>"] { ... }`.

## Files

- `game.js`
  - Contains the `VIBES` array. Each object describes a vibe:
    - `key`: short identifier, used in `data-vibe` and CSS selectors.
    - `name`: label shown in the UI.
    - `palette`: `{ base, accent, dark }` colours.
    - `text`: main text colour.
    - `panel_pattern`: CSS gradient/string used for panel backgrounds.
    - `layout`: `{ video, panel }` relative widths (numbers, used as CSS flex fractions).
    - `font`: `{ family, weight, transform }` applied to panel text.
    - `video_effects`: `{ css_filter, css_animation, overlay_gradient, overlay_blend_mode, overlay_video }`.
- `styles/TTimeBase.css`
  - Shared structural and base styles for:
    - Layout: `.stage`, `.quadrant`, `.video-container`, `.panel-container`.
    - Video & overlay: `.quad-video`, `.vibe-overlay`, `.video-countdown-overlay`, `.event-overlay`.
    - Panel content: `.info-text-overlay`, `.special-overlay`, `.special-overlay-title`, `.special-overlay-timer`.
    - Controls: `.bottom-bar`, buttons, cancel buttons, `.tally`.
    - Choice UIs: `.action-choice-choices`, `.grid-choice-choices`, `.breath-count-choices`, `.validation-button`, `.action-choice-item`, `.grid-choice-item`, `.breath-count-item`.
    - Theme picker grid: `.chooseTint`, `.choose-layout`, `.choose-grid`, `.choose-grid-item`, `.vibe-preview`, `.preview-panel`.
- `styles/TTime*.css`
  - One file per vibe (e.g. `TTimeNeonArena.css`). Each one:
    - Sets theme variables and typography on `.quadrant[data-vibe="<key>"]`.
    - Tweaks the video look, overlays, panel backgrounds, and buttons.
    - Customises the event overlays for that vibe.

## Adding a new vibe

1. **Create a vibe object** in `game.js`:
   - Add to the `VIBES` array:
   ```js
   {
     key: "my-new-vibe",
     name: "My New Vibe",
     palette: {
       base: "#000000",
       accent: "#ff00ff",
       dark: "#050505",
     },
     text: "#ffffff",
     panel_pattern: "linear-gradient(135deg, #000, #111)",
     layout: { video: 4, panel: 2 },
     font: {
       family: '"Space Grotesk", system-ui, sans-serif',
       weight: 600,
       transform: "uppercase",
     },
     video_effects: {
       css_filter: "contrast(1.2) saturate(1.2) brightness(1.05)",
       css_animation: "myVibeDrift 20s ease-in-out infinite alternate",
       overlay_gradient: "radial-gradient(circle at center, rgba(255,0,255,0.3), transparent 70%)",
       overlay_blend_mode: "screen",
       overlay_video: "soft", // or "glow" etc.
     },
     videoChangeFrequencyMs: 30000,
   }
   ```

2. **Create a CSS file** under `styles/`:
   - Name it `TTimeMyNewVibe.css` or similar.
   - Start from an existing vibe file and adjust:
   ```css
   .quadrant[data-vibe="my-new-vibe"] {
     --themeBase: #000000;
     --themeDark: #050505;
     --themeAccent: #ff00ff;
     --themeText: #ffffff;
     --themeGlow: rgba(255, 0, 255, 0.8);
     --themeBadge: rgba(0, 0, 0, 0.95);
     --video-fr: 4;
     --panel-fr: 2;

     color: var(--themeText);
     font-family: "Space Grotesk", system-ui, sans-serif;
     text-transform: uppercase;
   }

   .quadrant[data-vibe="my-new-vibe"] .quad-video { /* filters + animations */ }
   .quadrant[data-vibe="my-new-vibe"] .vibe-overlay { /* background + blend mode */ }
   .quadrant[data-vibe="my-new-vibe"] .panel-container,
   .quadrant[data-vibe="my-new-vibe"] .preview-panel { /* panel styling */ }
   .quadrant[data-vibe="my-new-vibe"] .info-text-overlay,
   .quadrant[data-vibe="my-new-vibe"] .special-overlay-title { /* typography accents */ }
   .quadrant[data-vibe="my-new-vibe"] .bottom-bar button,
   .quadrant[data-vibe="my-new-vibe"] .chooseTint button,
   .quadrant[data-vibe="my-new-vibe"] .validation-button { /* buttons */ }
   .quadrant[data-vibe="my-new-vibe"] .event-overlay-light { /* etc. */ }
   /* ... other event overlays and keyframes ... */
   ```

3. **Ensure CSS is loaded** in your HTML:
   - In `Ttime.html` (or your main game HTML), include:
   ```html
   <link rel="stylesheet" href="styles/TTimeBase.css">
   <link rel="stylesheet" href="styles/TTimeMyNewVibe.css">
   <!-- plus other vibe CSS files you want available -->
   ```

4. **Test via the theme picker**:
   - Run the game, open the theme chooser, select "My New Vibe" and verify:
     - Colours and overlays match your expectations.
     - Overlays (inhale/hold/exhale/etc.) still read clearly.

That’s it: new vibes are just one object in `VIBES` plus one CSS file targeting `.quadrant[data-vibe="<key>"]`, with `TTimeBase.css` handling the shared structure.
