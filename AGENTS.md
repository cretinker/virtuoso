# Veo 3 Prompt Virtuoso — AGENTS.md

## Purpose
A cinematic AI video prompt generation tool built with React. Users input a video concept, and the app guides them through a 4-step pipeline (concept → scenes → master sheets → shot prompts) using the Anthropic Claude API. Outputs professional Veo 3 prompts with start/end frame image prompts per shot.

## Repo Map
```
/
├── index.html              Entry point, loads /src/main.jsx
├── vite.config.js          Vite config (React plugin, no TS)
├── AGENTS.md               This file — shared agent instructions
├── src/
│   ├── main.jsx            ReactDOM.createRoot mount
│   ├── App.jsx             Root component — all state, all UI
│   └── App.css             Inline styles via <style> tag; also CSS animations
```

**This is a single-file React application.** All components, state, API calls, and inline styles live in `src/App.jsx`. There are no separate component files, no routing, no external libraries beyond React and ReactDOM.

## Core Commands
- **Install:** `npm install`
- **Dev server:** `npm run dev` (Vite, hot-reload on `http://localhost:5173`)
- **Build:** `npm run build`
- **Preview build:** `npm run preview`
- **No lint or test commands are configured.** No TypeScript.

## Working Rules

### Tech Constraints (DO NOT violate)
- **React JSX only — no TypeScript.** Use `.jsx` extensions, avoid any `.ts`/`.tsx` files.
- **Inline styles only.** All styling uses the `style` prop on JSX elements. No CSS-in-JS libraries, no Tailwind, no external `.css` files.
- **No external font imports.** Use `var(--font-sans)` and `var(--font-mono)` CSS variables for all typography.
- **No localStorage or sessionStorage.** All state lives in React `useState`/`useReducer` hooks.
- **The only hardcoded color is `#B8942A` (amber brand accent).** All other colors use CSS variables (e.g., `var(--color-text-primary)`, `var(--color-background-secondary)`).
- **API: DeepSeek.** Direct `fetch` to `https://api.deepseek.com/v1/chat/completions`. Model `deepseek-chat`, `max_tokens: 8192` (16384 for sheets). API key via `VITE_DEEPSEEK_API_KEY` in `.env`.
- **CSS animations go in a single `<style>` tag inside `App.jsx`.** Three animations needed: loading dots, spinning badge, hover states.

### Code Style
- All components are inline functions within `App.jsx` (no separate files).
- Use `const` for all variables. Use destructuring.
- Prefer arrow functions for callbacks.
- API calls are sequential (never parallel) to avoid rate limits.
- Error messages must surface real HTTP status codes and API error bodies — never generic "something went wrong" text.

### UX Rules (DO NOT violate)
- Master sheets are AI-generated, never user-input. The user only reviews and approves.
- Shot prompts include full master sheets as context in every API call.
- No artificial scene cap — generate as many scenes as the concept requires.
- Shot expand/collapse must work regardless of JSON parse success. A shot with text but null JSON should still expand. Never gate expand on `shot.json` being non-null.
- Copy buttons show green "✓ Copied" for 2000ms, then revert.
- Expand/collapse is accordion-style: only one shot open at a time.

### State Shape
```js
step: 1 | 2 | 3 | 4
concept: string
scenes: []        // {number, title, description, characters[], location}
characters: []    // {name, sheet}
locations: []     // {name, sheet}
shots: []         // {scene, status, text, json, errMsg}
busy: boolean
loadMsg: string
err: string
expanded: number | null
tabs: {}          // {[shotIndex]: "frames"|"text"|"json"}
sheetsOpen: boolean
copied: string
```

### API Helper
```js
async function callAPI(system, userMsg) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: userMsg }]
    })
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${body || res.statusText}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  const text = data.content?.map(b => b.text || "").join("").trim();
  if (!text) throw new Error("Empty response from API");
  return text;
}
```

### JSON Parsing
Must handle truncated responses (1000-token limit can cut off mid-JSON). Use `parseJSON()` for scene/sheet responses and `parseShot()` for shot responses (split by `---JSON---`).

## Verification
- **After any change:** run `npm run build` and confirm zero errors.
- **Manual visual check:** run `npm run dev` and step through the 4-step flow with a test concept.
- **Verify animations:** loading dots pulse, spinning badge rotates, hover states work.
- **Verify error states:** test with invalid API responses, truncated JSON, and empty responses.
- **Verify copy buttons:** click each copy option per shot, confirm "✓ Copied" appears and reverts after 2s.

## Documentation
- Full design spec is in the initial build prompt (the user message that triggered this project's creation). It contains all system prompts, state structure, component layouts, and UX rules.
- No separate design doc exists. The spec IS the source of truth.
