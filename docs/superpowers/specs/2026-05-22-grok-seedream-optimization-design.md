# Grok Imagine + Seedream 5.0 Prompt Optimization

**Date:** 2026-05-22
**Status:** Approved

## Goal

Adapt the entire prompt generation pipeline from Veo 3-only output to optimized prompts for **Grok Imagine (video generation)** and **Seedream 5.0 Lite (image generation via EvoLink)**.

## Target APIs

| API | Role | Model | Key details |
|-----|------|-------|-------------|
| Grok Imagine Video | Video generation | `grok-imagine-video` | Single text prompt, 1-15s, 720p, $0.05/sec. Supports image-to-video and reference-to-video. |
| Seedream 5.0 Lite | Still image generation (start/end frames) | `doubao-seedream-5.0-lite` via EvoLink | Deep Thinking (reasons through prompts), up to 3K, 14 ref images, $0.032/image. |
| DeepSeek Chat | Prompt generation LLM | `deepseek-chat` (unchanged) | Generates the prompts — no API change. |

## Changes by Pipeline Stage

### 1. Concept (Step 1) — No Changes

User writes their concept freely. No prompt-level changes needed.

### 2. Scene Breakdown (Step 2) — Minor Tuning

**SCENE_PROMPT changes:**
- Add: each scene should represent 4-10 seconds of continuous action (Grok's sweet spot)
- Add: include material textures and specific light sources in scene descriptions (feeds Seedream Deep Thinking)
- Keep: one-shot-per-scene rule, JSON array output

### 3. Character Master Sheets — Seedream-Optimized

**CHAR_SHEETS_PROMPT changes:**
- Add framing instruction: close-up/mid-shot portrait by default (head and shoulders)
- Add Seedream keywords at end of each sheet: `hyperrealistic portrait photography, soft studio lighting, shallow depth of field f/1.8, 85mm lens, 4K skin texture`
- Keep: all current fields (ethnicity, face shape, features, hair, clothing visible in frame)
- Keep: distinguishing marks concept-driven only, named characters

### 4. Location Master Sheets — Seedream-Optimized

**LOC_SHEETS_PROMPT changes:**
- Add Seedream keywords at end of each sheet: `architectural photography, hyperrealistic interior, 24mm wide lens, ambient lighting, 4K material texture`
- Keep: all current fields (materials, lighting, mood, objects, soundscape)

### 5. Shot Prompts (Step 4) — Core Rewrite

**SHOT_PROMPT changes:**
- Video paragraph: shorten from 200+ words to 50-100 words of flowing cinematic prose
- Remove Veo 3 camera technique rubric (2+ techniques, quality floor checklist)
- Replace with natural camera language: "a slow push-in tightens on her face"
- Approved Grok-friendly camera moves: slow push-in/pull-back, gentle pan/track, static lock-off, subtle handheld
- Forbidden: whip pans, crash zooms, Dutch angles (Grok handles these poorly)
- Keep: named light sources, color temperature shift, specific textures, diegetic sounds, temporal progression
- Remove: 200-word minimum, bullet-point quality checklist
- Add: Grok quality tagline suffix ("cinematic, hyperreal, 4K film grain, 720p")

**Start/end frame prompts (for Seedream):**
- Rich spatial description: exact positions, relative distances, foreground/background
- Material texture detail: "polished concrete floor reflecting amber light"
- Seedream keywords: "hyperrealistic, cinematic lighting, 4K texture detail, photorealistic depth of field"
- Same-lens continuity: identical lens, focal length, depth of field across both frames
- Explicit positional progression: where the subject is in start frame vs end frame

**JSON output changes:**
- Add new field `grok_prompt`: single ready-to-paste string combining video paragraph + key visual cues, optimized for Grok Imagine API

### 6. UI Changes

- No new tabs or layout changes
- Video Prompt tab: now shows the concise 50-100 word Grok paragraph
- Image Prompts tab: shows Seedream-optimized start/end frame prompts (unchanged structure)
- JSON tab: includes new `grok_prompt` string
- All existing features preserved: copy buttons, expand/collapse, regenerate, continue generation, instruction field

## Implementation Notes

- All changes confined to prompt strings in `App.jsx`
- No new dependencies, no API changes, no state shape changes
- `parseJSON`, `repairQuotes`, `callAPI`, `parseShot` all unchanged
- Build verification: `npm run build` must pass with zero errors
- No TypeScript, no new files, inline styles only
