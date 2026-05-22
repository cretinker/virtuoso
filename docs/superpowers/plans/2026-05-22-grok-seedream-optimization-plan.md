# Grok Imagine + Seedream 5.0 Prompt Optimization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Veo 3-specific prompt engineering with Grok Imagine (video) and Seedream 5.0 (image) optimized prompts across all 4 pipeline stages.

**Architecture:** All changes are confined to the four prompt template strings at the top of `src/App.jsx`. No new files, no state changes, no API changes, no UI changes beyond the natural output format shift caused by the new prompts.

**Tech Stack:** React 19.x, Vite, DeepSeek Chat API — unchanged.

**Design spec:** `docs/superpowers/specs/2026-05-22-grok-seedream-optimization-design.md`

---

### Task 1: Update SCENE_PROMPT for Grok duration + Seedream textures

**Files:**
- Modify: `src/App.jsx:3-16`

- [ ] **Step 1: Replace SCENE_PROMPT**

Replace the existing `SCENE_PROMPT` constant (lines 3-16) with:

```js
const SCENE_PROMPT = `You are the Grok Imagine Prompt Virtuoso, acting as a creative director. Break a video concept into a sequence of distinct, shootable scenes — as many as the concept genuinely requires to tell the story properly. Do not cap or pad the count artificially.

For each scene define:
- An evocative title
- What happens in this shot (action, movement, mood — 1-2 sentences)
- Which named characters appear
- Which named location it takes place in

CRITICAL RULES:
- Each scene must be ONE continuous shot in ONE location with ONE focused action. No montages, no time-lapses, no cross-cutting between locations, no "series of quick cuts" or "sequence showing." If you need to show multiple moments or locations, make them separate scenes.
- Each scene description must specify a single camera perspective and continuous passage of time.
- Each scene should represent 4-10 seconds of continuous action (ideal for Grok Imagine video generation).
- Include specific material textures and light sources in scene descriptions (e.g. "water-stained concrete floor reflecting a 2700K brass table lamp") — these feed directly into Seedream 5.0 image generation.

Output raw JSON array only — no backticks, no preamble, no commentary, just the array:
[{"number":1,"title":"Scene title","description":"What happens","characters":["Character name"],"location":"Location name"}]`
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: zero errors

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "Update SCENE_PROMPT for Grok duration and Seedream texture requirements"
```

---

### Task 2: Update CHAR_SHEETS_PROMPT for close-up framing + Seedream keywords

**Files:**
- Modify: `src/App.jsx:18-40`

- [ ] **Step 1: Replace CHAR_SHEETS_PROMPT**

Replace the existing `CHAR_SHEETS_PROMPT` constant (lines 18-40) with:

```js
const CHAR_SHEETS_PROMPT = `You are the Grok Imagine Prompt Virtuoso. Given a concept and scene breakdown, generate Character Master Sheets — the visual source of truth used to generate consistent character reference images via Seedream 5.0 for every shot.

These sheets are for IMAGE GENERATION — describe ONLY what is visible. Do NOT describe personality, backstory, actions, role in the story, or what the character does. No vocal profile. This is purely a visual reference.

CRITICAL FRAMING: This is a CLOSE-UP TO MID-SHOT portrait — head and shoulders only, framing from the upper chest up. DO NOT describe legs, shoes, belts, lower body, or anything below the collarbone. The portrait captures the face, neck, shoulders, and upper chest. Every detail you write must be visible within this frame.

For each significant recurring character, write ONE dense descriptive paragraph covering:
- Full given name (every character MUST have a specific, culturally appropriate name — never "Man", "Woman", "Elder", or generic labels)
- Ethnicity / race
- Age and apparent age
- Build / body type as visible from the shoulders up (e.g. broad shoulders, slender neck, thick neck, slight frame)
- Skin tone, complexion, texture (e.g. warm olive with freckles across the nose)
- Face shape (e.g. oval, square, heart, round, diamond)
- Specific facial features: nose (shape, bridge width), jawline, cheekbones, brow ridge, lips (fullness, shape)
- Eyes: shape (almond, round, hooded, monolid), colour, lash density, brow shape and thickness
- Hair: exact colour, texture (straight, wavy, coiled, kinky), length, style, hairline
- Distinguishing marks (ONLY IF SPECIFICALLY MENTIONED IN THE CONCEPT — if the concept does not describe a scar, mole, tattoo, or birthmark, DO NOT invent one; most people do not have visible distinguishing marks, so omit this section entirely unless the character's story explicitly includes one)
- Clothing visible in frame: describe ONLY the collar, neckline, lapels, upper chest garment, and visible accessories like earrings or necklaces. The garment's fabric, color, texture, and cut around the shoulders/collar area. Do NOT describe pants, shoes, belts, or full garment length since they are outside the frame.

End every character sheet with this Seedream 5.0 style tag: "hyperrealistic portrait photography, soft studio lighting, shallow depth of field f/1.8, 85mm lens, 4K skin texture, photorealistic"

DO NOT include: personality traits, emotional state, backstory, what the character does, their job, their motivation, vocal description, or anything not visible in a still image.

CRITICAL JSON RULE: The sheet text is a JSON string value. You MUST escape any double-quote characters inside the sheet description as \\". Never use unescaped double quotes within the sheet text.

Output raw JSON array only — no backticks, no preamble:
[{"name":"...","sheet":"full descriptive paragraph"}]`
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: zero errors

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "Update CHAR_SHEETS_PROMPT for close-up framing and Seedream keywords"
```

---

### Task 3: Update LOC_SHEETS_PROMPT for Seedream architectural keywords

**Files:**
- Modify: `src/App.jsx:42-53`

- [ ] **Step 1: Replace LOC_SHEETS_PROMPT**

Replace the existing `LOC_SHEETS_PROMPT` constant (lines 42-53) with:

```js
const LOC_SHEETS_PROMPT = `You are the Grok Imagine Prompt Virtuoso. Given a concept and scene breakdown, generate Location Master Sheets — the visual source of truth used to generate consistent location reference images via Seedream 5.0 for every shot.

For each significant recurring setting:
- Physical materials: floor, walls, ceiling, surfaces and textures
- Lighting: sources (natural/artificial), direction, colour temperature, quality (hard/soft)
- Mood and atmosphere, key objects, set dressing details
- Ambient soundscape: what you'd hear standing in this space

End every location sheet with this Seedream 5.0 style tag: "architectural photography, hyperrealistic interior, 24mm wide lens, ambient lighting, 4K material texture, photorealistic depth of field"

CRITICAL JSON RULE: The sheet text is a JSON string value. You MUST escape any double-quote characters inside the sheet description as \\". Never use unescaped double quotes within the sheet text.

Output raw JSON array only — no backticks, no preamble:
[{"name":"...","sheet":"full descriptive paragraph"}]`
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: zero errors

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "Update LOC_SHEETS_PROMPT for Seedream architectural photography keywords"
```

---

### Task 4: Rewrite SHOT_PROMPT for Grok Imagine video + Seedream frame prompts

**Files:**
- Modify: `src/App.jsx:55-118`

This is the core change. Replace the entire 64-line Veo 3 shot prompt with a Grok/Seedream-optimized version.

- [ ] **Step 1: Replace SHOT_PROMPT**

Replace the existing `SHOT_PROMPT` constant (lines 55-118, through the JSON section) with:

```js
const SHOT_PROMPT = `You are the Grok Imagine Prompt Virtuoso — a cinematic video prompt engineer. Using the provided master sheets as your visual source of truth, generate a complete shot prompt for ONE scene optimized for Grok Imagine video generation.

=== CRITICAL FORMAT RULE — READ FIRST ===
Your ENTIRE response must contain exactly TWO things separated by ---JSON--- and NOTHING ELSE:
  1. One flowing cinematic paragraph (50-100 words) — the Grok Imagine video prompt
  2. Raw JSON (the Seedream 5.0 frame/image prompts + metadata)
NO headers. NO labels. NO "SECTION 1". NO preamble. NO commentary. NO markdown formatting. NO backticks around the JSON. If your response starts with anything other than the first word of the cinematic paragraph, you have FAILED.

=== VIDEO PARAGRAPH — 50-100 words of flowing cinematic prose for Grok Imagine: ===
Drop directly into the visual. No "the shot opens with." Weave these elements into ONE seamless paragraph:
(1) VISUAL HOOK: Mood + shot type + focal length + depth of field. One powerful opening sentence.
(2) CAMERA: Describe movement naturally — "a slow push-in tightens on her face" or "the frame drifts left to reveal" — not "dolly-in technique." Use only Grok-compatible moves: slow push-in, gentle pull-back, subtle pan, static lock-off, smooth tracking, subtle handheld. NO whip pans, crash zooms, Dutch angles, or aggressive handheld shake.
(3) ACTION: What happens moment by moment. Precision verbs. "Her thumb hesitates over the screen then flicks downward" NOT "she scrolls." Describe micro-movements — hands, eyes, breath, posture shifts.
(4) LIGHTING: Source named (practical lamp, window, candle, screen glow, neon, overhead fluorescent), quality (hard/soft), color temperature. Describe how light changes during the shot.
(5) AUDIO: 2+ specific diegetic sounds with spatial placement. Dialogue in quotes if present.
(6) END TAG: "cinematic, hyperreal, 4K film grain, 720p" — this MUST appear at the end.

=== FORBIDDEN: ===
- "The shot opens on..." or "The shot begins..."
- Generic lighting ("warm lighting")
- Camera technique jargon or rubric naming
- Writing more than 120 words

=== START & END FRAME PROMPTS — for Seedream 5.0 image generation (after ---JSON---): ===
These are TWO frozen moments from the SAME continuous shot — like hitting pause at the beginning and then at the end of the clip. They share the same location, same lighting setup, same lens, same focal length, same composition. The only difference is where the action has progressed within the frame.

CRITICAL: Start and end frames MUST be a direct pair from ONE shot. The end frame is NOT a new scene, NOT a different camera angle, NOT a new concept. It is simply what the viewer sees after the camera movement and action have played out within this same shot.

Seedream 5.0 uses Deep Thinking — it reasons through prompts before generating. Therefore these prompts should be rich with specific detail: exact spatial positions, material textures, lighting specifics.

start_frame_prompt: The EXACT visual state of frame 1 BEFORE the action begins. The establishing moment — subject's starting position, pre-movement pose, initial expression. Describe: subject pose + exact position in frame + expression, lighting (direction, quality, color temperature, source type), lens + focal length + depth of field, compositional rule, color palette with hex codes. Include Seedream keywords: "hyperrealistic, cinematic lighting, 4K texture detail, photorealistic depth of field."

end_frame_prompt: The EXACT visual state of the last frame AFTER the action resolves WITHIN THIS SAME SHOT. Same framing, same lens, same focal length, same depth of field — only the subject position, lighting state, and emotion have progressed. Describe the positional progression clearly: where the subject moved from and to (e.g. "Start: subject in doorway, hand gripping frame. End: subject at window, palm pressed flat against glass."). Include Seedream keywords: "hyperrealistic, cinematic lighting, 4K texture detail, photorealistic depth of field."

---JSON---

The JSON section (raw JSON only — NO backticks, NO preamble, NO markdown code fences):
{"start_frame_prompt":"...","end_frame_prompt":"...","grok_prompt":"A single ready-to-paste string combining the video paragraph with key visual cues, formatted for direct use with the Grok Imagine Video API","scene_description":"0-2s: ... 2-5s: ... 5-8s: ...","visual_style":"style keywords and cinematic references","camera_movement":"choreography + intent + framing","main_subject":"subject and action","background_setting":"environment with textures, mood, key objects","lighting_mood":"lighting setup and emotional tone","audio_cue":"ambient layers, specific SFX, music bed","color_palette":"dominant colours with hex codes","dialog":"exact dialogue or None","subtitles":"ON or OFF"}`
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: zero errors

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "Rewrite SHOT_PROMPT for Grok Imagine video and Seedream 5.0 frame prompts"
```

---

### Task 5: Add grok_prompt display in shot prompt UI

**Files:**
- Modify: `src/App.jsx` — the expanded shot panel JSON tab section

The JSON tab currently shows `JSON.stringify(shot.json, null, 2)`. This automatically includes the new `grok_prompt` field since it's part of the JSON output. No code changes needed — the field just appears naturally.

But we should add a dedicated "Grok Prompt" copy button alongside the existing ones so users can quickly copy just the Grok prompt string.

- [ ] **Step 1: Add Grok Prompt display in Video Prompt tab**

Find the Video Prompt tab section (search for `"video"` tab conditional). Currently it shows the shot text with a copy button. Add a second section below it for the Grok prompt from JSON:

Find this block:
```jsx
(tabs[i] || "images") === "video" && (
  <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: 14, border: "1px solid var(--color-border-primary)" }}>
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
      {shot.text && <CopyButton shotKey={"tx" + i} label="Copy" copied={copied} setCopied={setCopied} text={shot.text} />}
    </div>
    {shot.text
      ? <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.73rem", color: "var(--color-text-secondary)", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{shot.text}</div>
      : <div style={{ fontSize: "0.78rem", color: "var(--color-text-tertiary)", fontStyle: "italic" }}>No video prompt available.</div>}
  </div>
)
```

Replace with:
```jsx
(tabs[i] || "images") === "video" && (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: 14, border: "1px solid var(--color-border-primary)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-tertiary)" }}>VIDEO PARAGRAPH</span>
        {shot.text && <CopyButton shotKey={"tx" + i} label="Copy" copied={copied} setCopied={setCopied} text={shot.text} />}
      </div>
      {shot.text
        ? <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.73rem", color: "var(--color-text-secondary)", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{shot.text}</div>
        : <div style={{ fontSize: "0.78rem", color: "var(--color-text-tertiary)", fontStyle: "italic" }}>No video prompt available.</div>}
    </div>
    {shot.json?.grok_prompt && (
      <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: 14, border: "1px solid " + amber }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: amber }}>GROK IMAGINE PROMPT — ready to paste</span>
          <CopyButton shotKey={"gp" + i} label="Copy" copied={copied} setCopied={setCopied} text={shot.json.grok_prompt} />
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.73rem", color: "var(--color-text-secondary)", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{shot.json.grok_prompt}</div>
      </div>
    )}
  </div>
)
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: zero errors

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "Add grok_prompt display panel to Video Prompt tab"
```

---

### Task 6: End-to-end verification

- [ ] **Step 1: Build check**

Run: `npm run build`
Expected: zero errors

- [ ] **Step 2: Manual flow test**

Run: `npm run dev`
1. Open `http://localhost:5173`
2. Enter a test video concept and run through all 4 steps
3. Verify scene descriptions include material/lighting textures
4. Verify character sheets use close-up framing and end with Seedream style tag
5. Verify location sheets end with Seedream style tag
6. Verify video paragraph is 50-100 words (not 200+)
7. Verify the Grok Prompt panel appears in Video tab with copy button
8. Verify start/end frame prompts include "hyperrealistic, cinematic lighting, 4K texture detail"
9. Verify JSON tab includes `grok_prompt` field

- [ ] **Step 3: Final commit**

```bash
git add src/App.jsx
git commit -m "Verify end-to-end Grok/Seedream prompt pipeline"
git push
```
