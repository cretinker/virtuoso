import { useState } from "react"

const SCENE_PROMPT = `You are the Grok Imagine Prompt Virtuoso, acting as a creative director. Break a video concept into a sequence of distinct, shootable scenes — as many as the concept genuinely requires to tell the story properly. Do not cap or pad the count artificially.

For each scene define:
- An evocative title
- What happens in this shot (action, movement, mood — 1-2 sentences)
- Which named characters appear (every character MUST have a specific, culturally appropriate full name — never "Man", "Woman", "Elder", "Young boy", or other generic labels; the name must be invented now and used consistently across all scenes)
- Which named location it takes place in
- Audio strategy for this scene — analyze the concept and decide which applies: "voiceover" (narrator speaking over visuals), "dialogue" (characters speaking to each other), "voiceover+dialogue" (both), or "ambient" (no spoken words, only environmental sound)

CRITICAL RULES:
- Each scene must be ONE continuous shot in ONE location with ONE focused action. No montages, no time-lapses, no cross-cutting between locations, no "series of quick cuts" or "sequence showing." If you need to show multiple moments or locations, make them separate scenes.
- Each scene description must specify a single camera perspective and continuous passage of time.
- Each scene should represent 4-10 seconds of continuous action (ideal for Grok Imagine video generation).
- Include specific material textures and light sources in scene descriptions (e.g. "water-stained concrete floor reflecting a 2700K brass table lamp") — these feed directly into Seedream 5.0 image generation.
- Character names must be consistent: if a character appears in multiple scenes, use the EXACT same name every time. The same character cannot be "John" in scene 1 and "John Carter" in scene 3. Pick the full name once and always use it.

Output raw JSON array only — no backticks, no preamble, no commentary, just the array:
[{"number":1,"title":"Scene title","description":"What happens","characters":["Character name"],"location":"Location name","audio":"voiceover|dialogue|voiceover+dialogue|ambient"}]`

const CHAR_SHEETS_PROMPT = `You are the Grok Imagine Prompt Virtuoso. Given a concept and scene breakdown, generate Character Master Sheets — the visual source of truth used to generate consistent character reference images via Seedream 5.0 for every shot.

These sheets are for IMAGE GENERATION — describe ONLY what is visible. Do NOT describe personality, backstory, actions, role in the story, or what the character does. No vocal profile. This is purely a visual reference.

CRITICAL FRAMING: This is a CLOSE-UP TO MID-SHOT portrait — head and shoulders only, framing from the upper chest up. DO NOT describe legs, shoes, belts, lower body, or anything below the collarbone. The portrait captures the face, neck, shoulders, and upper chest. Every detail you write must be visible within this frame.

For each significant recurring character, write ONE dense descriptive paragraph covering:
- Full given name (use the EXACT name from the scene breakdown — do NOT rename, shorten, or create a different name)
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

End every character sheet with a Seedream 5.0 style tag that MATCHES THE CONCEPT'S VISUAL STYLE. If the concept specifies pixel art, use "pixel art portrait, crisp edges, limited palette." If anime, use "anime portrait, cel-shaded, clean linework." If photorealistic, use "hyperrealistic portrait photography, soft studio lighting, shallow depth of field f/1.8, 85mm lens, 4K skin texture, photorealistic." Derive the tag from the concept — do NOT default to photorealistic unless the concept calls for it.

DO NOT include: personality traits, emotional state, backstory, what the character does, their job, their motivation, vocal description, or anything not visible in a still image.

CRITICAL JSON RULE: The sheet text is a JSON string value. You MUST escape any double-quote characters inside the sheet description as \\". Never use unescaped double quotes within the sheet text.

Output raw JSON array only — no backticks, no preamble:
[{"name":"...","sheet":"full descriptive paragraph"}]`

const LOC_SHEETS_PROMPT = `You are the Grok Imagine Prompt Virtuoso. Given a concept and scene breakdown, generate Location Master Sheets — the visual source of truth used to generate consistent location reference images via Seedream 5.0 for every shot.

For each significant recurring setting:
- Physical materials: floor, walls, ceiling, surfaces and textures
- Lighting: sources (natural/artificial), direction, colour temperature, quality (hard/soft)
- Mood and atmosphere, key objects, set dressing details
- Ambient soundscape: what you'd hear standing in this space

End every location sheet with a Seedream 5.0 style tag that MATCHES THE CONCEPT'S VISUAL STYLE. If pixel art, use "pixel art environment, crisp edges, limited palette." If anime, use "anime background art, cel-shaded, clean linework." If photorealistic, use "architectural photography, hyperrealistic interior, 24mm wide lens, ambient lighting, 4K material texture, photorealistic depth of field." Derive the tag from the concept — do NOT default to photorealistic unless the concept calls for it.

CRITICAL JSON RULE: The sheet text is a JSON string value. You MUST escape any double-quote characters inside the sheet description as \\". Never use unescaped double quotes within the sheet text.

Output raw JSON array only — no backticks, no preamble:
[{"name":"...","sheet":"full descriptive paragraph"}]`

const SHOT_PROMPT = `You are the Grok Imagine Prompt Virtuoso. Using the provided master sheets as your visual source of truth, generate a complete image-to-video prompt for ONE scene.

The workflow: the user already has a character reference image (from the character master sheet) and a location reference image (from the location master sheet). Your job is to write the text prompt that Grok Imagine's image-to-video mode will use to animate the character in the location.

=== CRITICAL FORMAT RULE — READ FIRST ===
Your ENTIRE response must contain exactly TWO things separated by the literal string ---JSON--- on its own line and NOTHING ELSE:
  1. One thorough image-to-video prompt — the text that feeds Grok Imagine with the reference images
  2. Raw JSON object (structured breakdown of the prompt)
Example format:
<image-to-video prompt text>
---JSON---
{"character_description":"...","location_description":"...","action":"...","camera_movement":"...","audio":"..."}
NO headers. NO labels. NO "SECTION 1". NO preamble. NO commentary. NO markdown formatting. NO backticks around the JSON. If your response starts with anything other than the first word of the prompt, you have FAILED.

=== IMAGE-TO-VIDEO PROMPT — comprehensive, no word cap: ===
Write ONE flowing paragraph that covers everything Grok Imagine needs. Be specific and thorough — do not summarize. Weave together:
(1) CHARACTER: The character's appearance from their master sheet — what they look like, what they're wearing, their expression, their posture. Paint a precise visual of the person.
(2) LOCATION: The setting from the location master sheet — materials, lighting sources, color temperature, key objects, atmosphere. Make the space feel real and lived-in.
(3) ACTION: What happens moment by moment, starting from the still image. Precision verbs. "Her thumb hesitates over the screen then flicks downward" NOT "she scrolls." Describe micro-movements — hands, eyes, breath, posture shifts. Every beat of motion.
(4) CAMERA: Describe movement naturally — "a slow push-in tightens on her face" or "the frame drifts left to reveal." Use only Grok-compatible moves: slow push-in, gentle pull-back, subtle pan, static lock-off, smooth tracking, subtle handheld. NO whip pans, crash zooms, Dutch angles, or aggressive handheld shake.
(5) LIGHTING: Source named (practical lamp, window, candle, screen glow, neon, overhead fluorescent), quality (hard/soft), color temperature. Describe how light changes during the shot.
(6) AUDIO & SOUNDSCAPE (MANDATORY — based on the scene's audio strategy): 
    - If audio strategy is "voiceover": narrate EXACT voiceover words in quotes with the character name and vocal delivery.
    - If audio strategy is "dialogue": write EXACT dialogue words in quotes for each character with delivery notes.
    - If audio strategy is "voiceover+dialogue": include both.
    - If audio strategy is "ambient": no spoken words. Describe 2+ environmental sounds with spatial placement.
(7) END TAG: A quality/style tag matching the concept's visual direction — "cinematic, hyperreal, 4K film grain, 720p" for photorealistic, "pixel art, crisp, 720p" for pixel art, "anime, cel-shaded, 720p" for anime, etc. Derive from the concept, never default to photorealistic. This MUST appear at the end.

=== FORBIDDEN: ===
- "The shot opens on..." or "The shot begins..."
- Generic lighting ("warm lighting")
- Camera technique jargon or rubric naming
- Skipping audio — every shot MUST include audio matching its declared strategy
- Summarizing — be thorough, not brief

Specific numbers (85mm, f/1.8) are fine — avoid technique labels like "dolly-in," "rack focus," or "Dutch angle."

---JSON---

The JSON section (raw JSON only — NO backticks, NO preamble, NO markdown code fences):
{"character_description":"character appearance from master sheet","location_description":"location from master sheet","action":"what happens moment by moment","camera_movement":"camera choreography and framing","audio":"dialogue/voiceover/ambient per audio strategy","visual_style":"cinematic references and keywords","color_palette":"dominant colours with hex codes"}`

function parseJSON(raw) {
  let s = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim()
  s = s.replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
  try { return JSON.parse(s) } catch {}
  // Repair unescaped double quotes inside long string values
  const repaired = repairQuotes(s)
  if (repaired) try { return JSON.parse(repaired) } catch {}
  // Try to find JSON array by looking for "[{" pattern
  const jsonStart = s.search(/\[\s*\{/)
  if (jsonStart >= 0) {
    const fromStart = s.slice(jsonStart)
    try { return JSON.parse(fromStart) } catch {}
    const arr = fromStart.match(/\[[\s\S]*\]/)
    if (arr) try { return JSON.parse(arr[0]) } catch {}
    const repaired2 = repairQuotes(fromStart)
    if (repaired2) try { return JSON.parse(repaired2) } catch {}
  }
  const firstBracket = s.indexOf("[")
  if (firstBracket >= 0 && firstBracket !== jsonStart) {
    const fromBracket = s.slice(firstBracket)
    try { return JSON.parse(fromBracket) } catch {}
    const arr = fromBracket.match(/\[[\s\S]*\]/)
    if (arr) try { return JSON.parse(arr[0]) } catch {}
  }
  const arrOpen = s.match(/\[[\s\S]*/)
  if (arrOpen) {
    const closes = ["]", '"}]', ']}]', '"]}]', '"]}', ']}"', '"]}"', '}]', ']}', '"}]}', '"]}]}', '"]}"]']
    for (const end of closes) {
      try { return JSON.parse(arrOpen[0] + end) } catch {}
    }
    const lastComma = arrOpen[0].lastIndexOf("},{")
    if (lastComma >= 0) {
      try { return JSON.parse(arrOpen[0].substring(0, lastComma + 1) + "]") } catch {}
    }
  }
  const firstBrace = s.indexOf("{")
  if (firstBrace >= 0) {
    const fromBrace = s.slice(firstBrace)
    try { return JSON.parse(fromBrace) } catch {}
    const obj = fromBrace.match(/\{[\s\S]*\}/)
    if (obj) try { return JSON.parse(obj[0]) } catch {}
  }
  const objOpen = s.match(/\{[\s\S]*/)
  if (objOpen) {
    const closes = ["}", '"}', '"]}', '"}]}', '"]}"}']
    for (const end of closes) {
      try { return JSON.parse(objOpen[0] + end) } catch {}
    }
  }
  return null
}

function repairQuotes(s) {
  // Heal unescaped double quotes inside "sheet" string values
  if (!s.includes('"sheet"')) return null
  try {
    let fixed = s
    // Match "sheet":"..." and escape inner quotes
    fixed = fixed.replace(/"sheet"\s*:\s*"/g, (m) => {
      // Find the matching end quote before }, or ]}
      const start = m.length
      const rest = s.slice(s.indexOf(m) + start)
      let depth = 1, i = 0
      for (; i < rest.length; i++) {
        if (rest[i] === '"' && rest[i-1] !== '\\') {
          // Check if this quote is followed by } or ,}
          const after = rest.slice(i + 1).trim()
          if (after.startsWith('}') || after.startsWith(']}')) {
            depth--
            if (depth === 0) break
          } else {
            depth = 1
          }
        }
      }
      const value = rest.slice(0, i).replace(/"/g, '\\"')
      return '"sheet":"' + value
    })
    return fixed !== s ? fixed : null
  } catch { return null }
}

function parseShot(raw) {
  const parts = raw.split("---JSON---")
  const text = parts[0]?.trim() || ""
  let json = null
  if (parts[1]) {
    const result = parseJSON(parts[1])
    if (result && typeof result === "object" && !Array.isArray(result)) json = result
  }
  return { text, json }
}

function Header({ step, onNewProject, projectName, setProjectName, onSave, onLoad, onDelete, savedProjects }) {
  const [showLoad, setShowLoad] = useState(false)
  const [msg, setMsg] = useState("")
  const amber = "#B8942A"
  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(""), 1500) }
  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid var(--color-border-primary)", marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: amber, fontSize: "1.25rem", fontWeight: 700 }}>&#9654;</span>
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.04em", color: "var(--color-text-primary)", textTransform: "uppercase" }}>Veo 3 Prompt Virtuoso</div>
            <div style={{ fontSize: "0.68rem", color: "var(--color-text-tertiary)" }}>Start / End Frame Edition</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {step > 1 && (
            <button className="btn-ghost" onClick={onNewProject} style={{ background: "transparent", border: "1px solid var(--color-border-primary)", color: "var(--color-text-secondary)", padding: "6px 14px", borderRadius: 6, fontSize: "0.8rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
              &#8592; New Project
            </button>
          )}
        </div>
      </div>
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
        <input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Project name..."
          style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid var(--color-border-primary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", fontFamily: "var(--font-sans)", fontSize: "0.78rem", outline: "none", width: 180 }}
          onFocus={e => e.target.style.borderColor = amber} onBlur={e => e.target.style.borderColor = "var(--color-border-primary)"} />
        <button className="btn-primary" onClick={() => { onSave(); showMsg("Saved") }} disabled={!projectName.trim()}
          style={{ background: amber, color: "#fff", border: "none", padding: "5px 14px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600, cursor: projectName.trim() ? "pointer" : "not-allowed", opacity: projectName.trim() ? 1 : 0.45, fontFamily: "var(--font-sans)" }}>Save</button>
        <div style={{ position: "relative" }}>
          <button className="btn-ghost" onClick={() => setShowLoad(!showLoad)} disabled={savedProjects.length === 0}
            style={{ background: "transparent", border: "1px solid var(--color-border-primary)", color: "var(--color-text-secondary)", padding: "5px 14px", borderRadius: 6, fontSize: "0.75rem", cursor: savedProjects.length ? "pointer" : "not-allowed", opacity: savedProjects.length ? 1 : 0.45, fontFamily: "var(--font-sans)" }}>Load</button>
          {showLoad && savedProjects.length > 0 && (
            <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: "var(--color-background-card)", border: "1px solid var(--color-border-primary)", borderRadius: 6, overflow: "hidden", zIndex: 10, minWidth: 180, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
              {savedProjects.map(p => (
                <div key={p} onClick={() => { onLoad(p); setShowLoad(false); showMsg("Loaded") }} style={{ padding: "8px 12px", fontSize: "0.78rem", cursor: "pointer", fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", borderBottom: "1px solid var(--color-border-primary)" }}
                  onMouseEnter={e => e.target.style.background = "var(--color-background-secondary)"} onMouseLeave={e => e.target.style.background = "transparent"}>{p}</div>
              ))}
            </div>
          )}
        </div>
        <button className="btn-ghost" onClick={() => { onDelete(); showMsg("Deleted") }} disabled={!projectName.trim()}
          style={{ background: "transparent", border: "1px solid var(--color-border-danger)", color: "var(--color-text-danger)", padding: "5px 14px", borderRadius: 6, fontSize: "0.75rem", cursor: projectName.trim() ? "pointer" : "not-allowed", opacity: projectName.trim() ? 1 : 0.45, fontFamily: "var(--font-sans)" }}>Delete</button>
        {msg && <span style={{ fontSize: "0.73rem", color: "var(--color-text-success)", marginLeft: 4 }}>{msg}</span>}
      </div>
    </div>
  )
}

function Stepper({ step, loadMsg, onStepClick }) {
  const steps = ["Concept", "Scenes", "Master Sheets", "Shot Prompts"]
  const amber = "#B8942A"
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
      {steps.map((label, i) => {
        const num = i + 1; const done = step > num; const active = step === num; const reachable = done || active
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : "none" }}>
            <div onClick={() => reachable && onStepClick(num)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: reachable ? "pointer" : "default" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0,
                background: done ? amber : "transparent", border: done ? "2px solid " + amber : active ? "2px solid " + amber : "2px solid var(--color-border-secondary)", color: done ? "#fff" : active ? amber : "var(--color-text-tertiary)" }}>
                {done ? "\u2713" : num}
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: active ? 600 : 400, color: done ? "var(--color-text-secondary)" : active ? amber : "var(--color-text-tertiary)" }}>{label}</span>
            </div>
            {i < 3 && <div style={{ flex: 1, height: 2, margin: "0 10px", background: done ? amber : "var(--color-border-secondary)" }} />}
          </div>
        )
      })}
      {loadMsg && <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>{loadMsg}</span>}
    </div>
  )
}

function ErrorBanner({ err, onDismiss }) {
  if (!err) return null
  return (
    <div style={{ background: "var(--color-background-danger)", border: "1px solid var(--color-border-danger)", color: "var(--color-text-danger)", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontFamily: "var(--font-mono)", fontSize: "0.78rem", wordBreak: "break-word", whiteSpace: "pre-wrap", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
      <span>{err}</span>
      <button onClick={onDismiss} style={{ background: "transparent", border: "none", color: "var(--color-text-danger)", cursor: "pointer", fontSize: "1rem", lineHeight: 1, padding: 0, flexShrink: 0 }}>&#10005;</button>
    </div>
  )
}

function SheetPanel({ characters, locations, onRefreshChar, onRefreshLoc, regenerateInput, setRegenerateInput, regenerateNote, setRegenerateNote, regenerating, busy, regenDone }) {
  const [copied, setCopied] = useState("")
  const gridTwo = (characters.length > 1 || locations.length > 1)
  const grid = gridTwo ? { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } : { display: "flex", flexDirection: "column", gap: 16 }
  const activeRegen = regenerateInput
  const startRegen = (type, name) => { setRegenerateInput({type, name}); setRegenerateNote("") }
  const cancelRegen = () => setRegenerateInput(null)
  const doRegen = async () => {
    if (!activeRegen) return
    const regen = activeRegen
    setRegenerateInput(null)
    setRegenerateNote("")
    if (regen.type === "char") await onRefreshChar(regen.name, regenerateNote)
    else if (regen.type === "loc") await onRefreshLoc(regen.name, regenerateNote)
  }
  return (
    <div>
      {characters.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text-info)", textTransform: "uppercase", marginBottom: 12, letterSpacing: "0.04em" }}>Characters</div>
          <div style={grid}>
            {characters.map((c, i) => (
              <div key={i} style={{ background: "var(--color-background-card)", border: "1px solid var(--color-border-primary)", borderRadius: 8, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{c.name}</span>
                  {regenDone && regenDone.type === "char" && regenDone.name === c.name && (
                    <span style={{ fontSize: "0.72rem", color: "var(--color-text-success)", fontWeight: 600, marginLeft: 6 }}>✓ Updated</span>
                  )}
                  <div style={{ display: "flex", gap: 6 }}>
                    <CopyButton shotKey={"char" + i} label="Copy" copied={copied} setCopied={setCopied} text={c.sheet} />
                    {onRefreshChar && (
                      <button onClick={() => { if (!busy) startRegen("char", c.name) }} disabled={busy}
                        style={{ background: "transparent", border: "1px solid var(--color-border-primary)", color: "var(--color-text-secondary)", padding: "3px 10px", borderRadius: 4, fontSize: "0.72rem", cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.4 : 1, fontFamily: "var(--font-sans)" }}>
                        &#8635;
                      </button>
                    )}
                  </div>
                </div>
                {regenerating && regenerating.type === "char" && regenerating.name === c.name && (
                  <div style={{ marginBottom: 8, fontSize: "0.75rem", color: "#B8942A", fontFamily: "var(--font-sans)" }}>Regenerating <LoadingDots /></div>
                )}
                {activeRegen && activeRegen.type === "char" && activeRegen.name === c.name && (
                  <div style={{ marginBottom: 8, display: "flex", gap: 6 }}>
                    <input value={regenerateNote} onChange={e => setRegenerateNote(e.target.value)} placeholder="Optional: what to change..."
                      onKeyDown={e => { if (e.key === "Enter") doRegen() }}
                      style={{ flex: 1, padding: "4px 8px", borderRadius: 4, border: "1px solid var(--color-border-primary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", fontFamily: "var(--font-sans)", fontSize: "0.73rem", outline: "none" }}
                      autoFocus />
                    <button onClick={doRegen}
                      style={{ background: "#B8942A", color: "#fff", border: "none", padding: "4px 10px", borderRadius: 4, fontSize: "0.73rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>Go</button>
                    <button onClick={cancelRegen}
                      style={{ background: "transparent", border: "1px solid var(--color-border-primary)", color: "var(--color-text-secondary)", padding: "4px 8px", borderRadius: 4, fontSize: "0.73rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}>✕</button>
                  </div>
                )}
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{c.sheet}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {locations.length > 0 && (
        <div>
          <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", marginBottom: 12, letterSpacing: "0.04em" }}>Locations</div>
          <div style={grid}>
            {locations.map((l, i) => (
              <div key={i} style={{ background: "var(--color-background-card)", border: "1px solid var(--color-border-primary)", borderRadius: 8, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{l.name}</span>
                  {regenDone && regenDone.type === "loc" && regenDone.name === l.name && (
                    <span style={{ fontSize: "0.72rem", color: "var(--color-text-success)", fontWeight: 600, marginLeft: 6 }}>✓ Updated</span>
                  )}
                  <div style={{ display: "flex", gap: 6 }}>
                    <CopyButton shotKey={"loc" + i} label="Copy" copied={copied} setCopied={setCopied} text={l.sheet} />
                    {onRefreshLoc && (
                      <button onClick={() => { if (!busy) startRegen("loc", l.name) }} disabled={busy}
                        style={{ background: "transparent", border: "1px solid var(--color-border-primary)", color: "var(--color-text-secondary)", padding: "3px 10px", borderRadius: 4, fontSize: "0.72rem", cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.4 : 1, fontFamily: "var(--font-sans)" }}>
                        &#8635;
                      </button>
                    )}
                  </div>
                </div>
                {regenerating && regenerating.type === "loc" && regenerating.name === l.name && (
                  <div style={{ marginBottom: 8, fontSize: "0.75rem", color: "#B8942A", fontFamily: "var(--font-sans)" }}>Regenerating <LoadingDots /></div>
                )}
                {activeRegen && activeRegen.type === "loc" && activeRegen.name === l.name && (
                  <div style={{ marginBottom: 8, display: "flex", gap: 6 }}>
                    <input value={regenerateNote} onChange={e => setRegenerateNote(e.target.value)} placeholder="Optional: what to change..."
                      onKeyDown={e => { if (e.key === "Enter") doRegen() }}
                      style={{ flex: 1, padding: "4px 8px", borderRadius: 4, border: "1px solid var(--color-border-primary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", fontFamily: "var(--font-sans)", fontSize: "0.73rem", outline: "none" }}
                      autoFocus />
                    <button onClick={doRegen}
                      style={{ background: "#B8942A", color: "#fff", border: "none", padding: "4px 10px", borderRadius: 4, fontSize: "0.73rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>Go</button>
                    <button onClick={cancelRegen}
                      style={{ background: "transparent", border: "1px solid var(--color-border-primary)", color: "var(--color-text-secondary)", padding: "4px 8px", borderRadius: 4, fontSize: "0.73rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}>✕</button>
                  </div>
                )}
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{l.sheet}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CopyButton({ shotKey, label, copied, setCopied, text }) {
  const active = copied === shotKey
  return (
    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(text); setCopied(shotKey); setTimeout(() => setCopied(""), 2000) }}
      style={{ background: "transparent", border: "1px solid " + (active ? "var(--color-border-success)" : "var(--color-border-primary)"), color: active ? "var(--color-text-success)" : "var(--color-text-secondary)", padding: "3px 10px", borderRadius: 4, fontSize: "0.72rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
      {active ? "✓ Copied" : label}
    </button>
  )
}

function LoadingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      <span style={{ animation: "ld-dot 1.4s ease-in-out infinite", animationDelay: "0s" }}>.</span>
      <span style={{ animation: "ld-dot 1.4s ease-in-out infinite", animationDelay: "0.22s" }}>.</span>
      <span style={{ animation: "ld-dot 1.4s ease-in-out infinite", animationDelay: "0.44s" }}>.</span>
    </span>
  )
}

export default function App() {
  const [step, setStep] = useState(1)
  const [concept, setConcept] = useState("")
  const [scenes, setScenes] = useState([])
  const [characters, setCharacters] = useState([])
  const [locations, setLocations] = useState([])
  const [shots, setShots] = useState([])
  const [busy, setBusy] = useState(false)
  const [loadMsg, setLoadMsg] = useState("")
  const [err, setErr] = useState("")
  const [expanded, setExpanded] = useState(null)
  const [tabs, setTabs] = useState({})
  const [sheetsOpen, setSheetsOpen] = useState(false)
  const [copied, setCopied] = useState("")
  const [regenerateInput, setRegenerateInput] = useState(null)
  const [regenerateNote, setRegenerateNote] = useState("")
  const [regenerating, setRegenerating] = useState(null)
  const [regenDone, setRegenDone] = useState(null)
  const [projectName, setProjectName] = useState("")
  const [savedProjects, setSavedProjects] = useState(() => {
    try { return Object.keys(JSON.parse(localStorage.getItem("vpv_projects") || "{}")) } catch { return [] }
  })

  const amber = "#B8942A"

  const persist = (overrides = {}) => {
    const name = projectName.trim()
    if (!name) return
    const projects = JSON.parse(localStorage.getItem("vpv_projects") || "{}")
    const current = { step, concept, scenes, characters, locations, shots }
    projects[name] = { ...current, ...overrides }
    localStorage.setItem("vpv_projects", JSON.stringify(projects))
    setSavedProjects(Object.keys(projects))
  }

  const loadProject = (name) => {
    const projects = JSON.parse(localStorage.getItem("vpv_projects") || "{}")
    const p = projects[name]
    if (!p) return
    setProjectName(name)
    setStep(p.step || 1); setConcept(p.concept || ""); setScenes(p.scenes || [])
    setCharacters(p.characters || []); setLocations(p.locations || []); setShots(p.shots || [])
    setExpanded(null); setTabs({}); setSheetsOpen(false); setCopied(""); setErr("")
  }

  const deleteProject = () => {
    const name = projectName.trim()
    if (!name) return
    const projects = JSON.parse(localStorage.getItem("vpv_projects") || "{}")
    delete projects[name]
    localStorage.setItem("vpv_projects", JSON.stringify(projects))
    setSavedProjects(Object.keys(projects))
    setProjectName("")
  }

  const resetAll = () => {
    setStep(1); setConcept(""); setScenes([]); setCharacters([]); setLocations([])
    setShots([]); setBusy(false); setLoadMsg(""); setErr(""); setExpanded(null)
    setTabs({}); setSheetsOpen(false); setCopied(""); setRegenerateInput(null); setRegenerateNote(""); setRegenerating(null); setRegenDone(null); setProjectName("")
  }

  async function callAPI(system, userMsg, tokens = 8192) {
    const res = await fetch("/api/deepseek/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + import.meta.env.VITE_DEEPSEEK_API_KEY },
      body: JSON.stringify({ model: "deepseek-chat", max_tokens: tokens, messages: [{ role: "system", content: system }, { role: "user", content: userMsg }] })
    })
    if (!res.ok) { const body = await res.text().catch(() => ""); throw new Error("HTTP " + res.status + ": " + (body || res.statusText)) }
    const data = await res.json()
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error))
    const text = data.choices?.[0]?.message?.content?.trim()
    if (!text) throw new Error("Empty response from API")
    return text
  }

  const developScenes = async () => {
    setBusy(true); setLoadMsg("Developing scenes"); setErr("")
    try {
      const raw = await callAPI(SCENE_PROMPT, concept)
      const parsed = parseJSON(raw)
      if (!parsed || !Array.isArray(parsed)) throw new Error("Scene parse failed (" + raw.length + " chars). Last 400:\n" + raw.slice(-400))
      if (parsed.length === 0) throw new Error("No scenes returned from API")
      setScenes(parsed)
      setStep(2)
      persist({ scenes: parsed, step: 2 })
    } catch (e) { setErr(e.message) }
    finally { setBusy(false); setLoadMsg("") }
  }

  const buildSheets = async () => {
    setBusy(true); setErr("")
    const sceneText = scenes.map(s => s.number + ". " + s.title + " - " + s.description + " (Characters: " + (s.characters || []).join(", ") + ", Location: " + s.location + ")").join("\n")
    const userMsg = "CONCEPT:\n" + concept + "\n\nSCENES:\n" + sceneText
    let finalChars = characters
    let finalLocs = locations
    try {
      setLoadMsg("Building character sheets")
      const rawChars = await callAPI(CHAR_SHEETS_PROMPT, userMsg, 16384)
      const chars = parseJSON(rawChars)
      if (!chars || !Array.isArray(chars) || chars.length === 0) throw new Error("Character sheet parse failed (" + rawChars.length + " chars). First 200: " + rawChars.slice(0, 200) + " ... Last 200: " + rawChars.slice(-200))
      setCharacters(chars)
      finalChars = chars
    } catch (e) { setErr(e.message); setBusy(false); setLoadMsg(""); return }
    try {
      setLoadMsg("Building location sheets")
      const rawLocs = await callAPI(LOC_SHEETS_PROMPT, userMsg, 16384)
      const locs = parseJSON(rawLocs)
      if (locs && Array.isArray(locs) && locs.length > 0) { setLocations(locs); finalLocs = locs }
      else { setErr("Location sheet parse failed (" + rawLocs.length + " chars). First 200: " + rawLocs.slice(0, 200) + " ... Last 200: " + rawLocs.slice(-200)) }
    } catch (e) { setErr("Location sheets unavailable: " + e.message) }
    setStep(3)
    persist({ characters: finalChars, locations: finalLocs, step: 3 })
    setBusy(false); setLoadMsg("")
  }

  const goToSheets = () => {
    if (characters.length > 0) { setStep(3) }
    else { buildSheets() }
  }

  const refreshChar = async (charName, instruction = "") => {
    setBusy(true); setLoadMsg("Regenerating " + charName); setErr(""); setRegenerating({type: "char", name: charName})
    const sceneText = scenes.map(s => s.number + ". " + s.title + " - " + s.description + " (Characters: " + (s.characters || []).join(", ") + ", Location: " + s.location + ")").join("\n")
    const existingChars = characters.filter(c => c.name !== charName).map(c => "[CHARACTER: " + c.name + "]\n" + c.sheet).join("\n\n")
    let userMsg = "CONCEPT:\n" + concept + "\n\nSCENES:\n" + sceneText + "\n\nEXISTING CHARACTERS (do NOT recreate these):\n" + existingChars + "\n\nREGENERATE ONLY: " + charName
    if (instruction) userMsg += "\n\nCRITICAL REGENERATION INSTRUCTIONS (you MUST apply these changes):\n" + instruction
    try {
      const raw = await callAPI(CHAR_SHEETS_PROMPT, userMsg, 16384)
      const parsed = parseJSON(raw)
      if (!parsed || !Array.isArray(parsed) || parsed.length === 0) throw new Error("Character sheet parse failed (" + raw.length + " chars). First 200: " + raw.slice(0, 200) + " ... Last 200: " + raw.slice(-200))
      const updated = parsed.find(c => c.name === charName)
      if (!updated) throw new Error("Regenerated response did not contain " + charName)
      setCharacters(prev => { const next = prev.map(c => c.name === charName ? updated : c); persist({ characters: next }); return next })
      setRegenDone({type: "char", name: charName}); setTimeout(() => setRegenDone(null), 2000)
    } catch (e) { setErr(e.message) }
    finally { setBusy(false); setLoadMsg(""); setRegenerating(null) }
  }

  const refreshLoc = async (locName, instruction = "") => {
    setBusy(true); setLoadMsg("Regenerating " + locName); setErr(""); setRegenerating({type: "loc", name: locName})
    const sceneText = scenes.map(s => s.number + ". " + s.title + " - " + s.description + " (Characters: " + (s.characters || []).join(", ") + ", Location: " + s.location + ")").join("\n")
    const existingLocs = locations.filter(l => l.name !== locName).map(l => "[LOCATION: " + l.name + "]\n" + l.sheet).join("\n\n")
    let userMsg = "CONCEPT:\n" + concept + "\n\nSCENES:\n" + sceneText + "\n\nEXISTING LOCATIONS (do NOT recreate these):\n" + existingLocs + "\n\nREGENERATE ONLY: " + locName
    if (instruction) userMsg += "\n\nCRITICAL REGENERATION INSTRUCTIONS (you MUST apply these changes):\n" + instruction
    try {
      const raw = await callAPI(LOC_SHEETS_PROMPT, userMsg, 16384)
      const parsed = parseJSON(raw)
      if (!parsed || !Array.isArray(parsed) || parsed.length === 0) throw new Error("Location parse failed (" + raw.length + " chars). First 200: " + raw.slice(0, 200) + " ... Last 200: " + raw.slice(-200))
      const updated = parsed.find(l => l.name === locName)
      if (!updated) throw new Error("Regenerated response did not contain " + locName)
      setLocations(prev => { const next = prev.map(l => l.name === locName ? updated : l); persist({ locations: next }); return next })
      setRegenDone({type: "loc", name: locName}); setTimeout(() => setRegenDone(null), 2000)
    } catch (e) { setErr(e.message) }
    finally { setBusy(false); setLoadMsg(""); setRegenerating(null) }
  }

  const generateAllShots = async () => {
    setBusy(true); setErr("")
    const initial = scenes.map((s, i) => ({ scene: s, status: i === 0 ? "loading" : "pending", text: "", json: null, errMsg: "" }))
    setShots(initial)
    setStep(4)
    const charSheets = characters.map(c => "[CHARACTER: " + c.name + "]\n" + c.sheet).join("\n\n")
    const locSheets = locations.map(l => "[LOCATION: " + l.name + "]\n" + l.sheet).join("\n\n")
    const context = charSheets + "\n\n" + locSheets
    for (let i = 0; i < scenes.length; i++) {
      setLoadMsg("Generating shot " + (i + 1) + " of " + scenes.length)
      setShots(prev => prev.map((s, idx) => idx === i ? { ...s, status: "loading", errMsg: "" } : s))
      const s = scenes[i]
      const userMsg = context + "\n\nSCENE " + s.number + " - " + s.title + "\n" + s.description + "\nCharacters: " + (s.characters || []).join(", ") + "\nLocation: " + s.location + "\nAudio Strategy: " + (s.audio || "ambient")
      try {
        const raw = await callAPI(SHOT_PROMPT, userMsg, 16384)
        const parsed = parseShot(raw)
        setShots(prev => { const next = prev.map((sh, idx) => idx === i ? { ...sh, status: "done", text: parsed.text, json: parsed.json, errMsg: "" } : sh); persist({ shots: next, step: 4 }); return next })
      } catch (e) {
        setShots(prev => { const next = prev.map((sh, idx) => idx === i ? { ...sh, status: "error", errMsg: e.message } : sh); persist({ shots: next, step: 4 }); return next })
      }
    }
    setBusy(false); setLoadMsg("")
  }

  const goToShots = () => {
    if (shots.length > 0 && shots.some(s => s.status === "done")) { setStep(4) }
    else { generateAllShots() }
  }

  const retryShot = async (i) => {
    setShots(prev => prev.map((s, idx) => idx === i ? { ...s, status: "loading", errMsg: "" } : s))
    setLoadMsg("Retrying shot " + (i + 1))
    const charSheets = characters.map(c => "[CHARACTER: " + c.name + "]\n" + c.sheet).join("\n\n")
    const locSheets = locations.map(l => "[LOCATION: " + l.name + "]\n" + l.sheet).join("\n\n")
    const context = charSheets + "\n\n" + locSheets
    const s = scenes[i]
    const userMsg = context + "\n\nSCENE " + s.number + " - " + s.title + "\n" + s.description + "\nCharacters: " + (s.characters || []).join(", ") + "\nLocation: " + s.location
    try {
      const raw = await callAPI(SHOT_PROMPT, userMsg, 16384)
      const parsed = parseShot(raw)
      setShots(prev => { const next = prev.map((sh, idx) => idx === i ? { ...sh, status: "done", text: parsed.text, json: parsed.json, errMsg: "" } : sh); persist({ shots: next, step: 4 }); return next })
    } catch (e) {
      setShots(prev => { const next = prev.map((sh, idx) => idx === i ? { ...sh, status: "error", errMsg: e.message } : sh); persist({ shots: next, step: 4 }); return next })
    }
    setLoadMsg("")
  }

  const continueShots = async () => {
    setBusy(true); setErr("")
    const charSheets = characters.map(c => "[CHARACTER: " + c.name + "]\n" + c.sheet).join("\n\n")
    const locSheets = locations.map(l => "[LOCATION: " + l.name + "]\n" + l.sheet).join("\n\n")
    const context = charSheets + "\n\n" + locSheets
    for (let i = 0; i < shots.length; i++) {
      if (shots[i].status !== "pending") continue
      setLoadMsg("Generating shot " + (i + 1) + " of " + shots.length)
      setShots(prev => prev.map((s, idx) => idx === i ? { ...s, status: "loading", errMsg: "" } : s))
      const s = scenes[i]
      const userMsg = context + "\n\nSCENE " + s.number + " - " + s.title + "\n" + s.description + "\nCharacters: " + (s.characters || []).join(", ") + "\nLocation: " + s.location + "\nAudio Strategy: " + (s.audio || "ambient")
      try {
        const raw = await callAPI(SHOT_PROMPT, userMsg, 16384)
        const parsed = parseShot(raw)
        setShots(prev => { const next = prev.map((sh, idx) => idx === i ? { ...sh, status: "done", text: parsed.text, json: parsed.json, errMsg: "" } : sh); persist({ shots: next, step: 4 }); return next })
      } catch (e) {
        setShots(prev => { const next = prev.map((sh, idx) => idx === i ? { ...sh, status: "error", errMsg: e.message } : sh); persist({ shots: next, step: 4 }); return next })
      }
    }
    setBusy(false); setLoadMsg("")
  }

  const toggleExpand = (i) => {
    if (shots[i].status !== "done" && shots[i].status !== "error") return
    setExpanded(expanded === i ? null : i)
    if (expanded !== i) { setTabs(prev => ({ ...prev, [i]: prev[i] || "video" })) }
  }

  const doneCount = shots.filter(s => s.status === "done").length

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "20px 24px 60px" }}>
      <Header step={step} onNewProject={resetAll} projectName={projectName} setProjectName={setProjectName} onSave={persist} onLoad={loadProject} onDelete={deleteProject} savedProjects={savedProjects} />
      <Stepper step={step} loadMsg={loadMsg} onStepClick={(n) => setStep(n)} />
      <ErrorBanner err={err} onDismiss={() => setErr("")} />

      {step === 1 && (
        <div>
          <div style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-tertiary)", marginBottom: 8 }}>Project Concept</div>
          <textarea value={concept} onChange={e => setConcept(e.target.value)} placeholder="Describe your video concept in detail..." disabled={busy}
            style={{ width: "100%", minHeight: 100, padding: 12, borderRadius: 8, border: "1px solid var(--color-border-primary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", fontFamily: "var(--font-sans)", fontSize: "0.88rem", lineHeight: 1.7, resize: "vertical", outline: "none" }}
            onFocus={e => e.target.style.borderColor = amber} onBlur={e => e.target.style.borderColor = "var(--color-border-primary)"} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
            <button className="btn-primary" onClick={developScenes} disabled={busy || !concept.trim()}
              style={{ background: amber, color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: "0.85rem", fontWeight: 600, cursor: (busy || !concept.trim()) ? "not-allowed" : "pointer", opacity: (busy || !concept.trim()) ? 0.45 : 1, fontFamily: "var(--font-sans)" }}>
              {busy ? <span>Developing <LoadingDots /></span> : "Develop Scenes"}
            </button>
            <span style={{ fontSize: "0.72rem", color: "var(--color-text-tertiary)" }}>&#8984; + Enter</span>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{scenes.length} Scene{scenes.length !== 1 ? "s" : ""}</span>
            <button className="btn-ghost" onClick={() => { setStep(1); setErr("") }}
              style={{ background: "transparent", border: "1px solid var(--color-border-primary)", color: "var(--color-text-secondary)", padding: "6px 14px", borderRadius: 6, fontSize: "0.8rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
              &#8592; Edit Concept
            </button>
          </div>
          {scenes.map((s, i) => (
            <div key={i} style={{ background: "var(--color-background-card)", border: "1px solid var(--color-border-primary)", borderRadius: 8, padding: 16, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid " + amber, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: amber, flexShrink: 0 }}>{s.number}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 8 }}>{s.description}</div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {(s.characters || []).map((c, j) => (<span key={j} style={{ fontSize: "0.72rem", color: "var(--color-text-info)", display: "flex", alignItems: "center", gap: 4 }}><span>&#128101;</span> {c}</span>))}
                    <span style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 4 }}><span>&#128205;</span> {s.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button className="btn-primary" onClick={goToSheets} disabled={busy}
            style={{ background: amber, color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: "0.85rem", fontWeight: 600, cursor: busy ? "wait" : "pointer", opacity: busy ? 0.7 : 1, fontFamily: "var(--font-sans)", marginTop: 8 }}>
            {busy ? <span>Building <LoadingDots /></span> : "Next: Master Sheets"}
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-primary)" }}>Master Sheets</span>
            <button className="btn-ghost" onClick={() => setStep(2)}
              style={{ background: "transparent", border: "1px solid var(--color-border-primary)", color: "var(--color-text-secondary)", padding: "6px 14px", borderRadius: 6, fontSize: "0.8rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
              &#8592; Back to Scenes
            </button>
          </div>
          <SheetPanel characters={characters} locations={locations} onRefreshChar={refreshChar} onRefreshLoc={refreshLoc} regenerateInput={regenerateInput} setRegenerateInput={setRegenerateInput} regenerateNote={regenerateNote} setRegenerateNote={setRegenerateNote}           regenerating={regenerating} busy={busy} regenDone={regenDone} />
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            {locations.length === 0 && (
              <button className="btn-ghost" onClick={buildSheets}
                style={{ background: "transparent", border: "1px solid var(--color-border-primary)", color: "var(--color-text-secondary)", padding: "8px 16px", borderRadius: 6, fontSize: "0.8rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                &#8635; Retry Location Sheets
              </button>
            )}
            <button className="btn-primary" onClick={goToShots} disabled={busy}
              style={{ background: amber, color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: "0.85rem", fontWeight: 600, cursor: busy ? "wait" : "pointer", opacity: busy ? 0.7 : 1, fontFamily: "var(--font-sans)" }}>
              {busy ? <span>Generating <LoadingDots /></span> : "Next: Shot Prompts"}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{doneCount}/{shots.length} Shots Generated</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-ghost" onClick={() => setStep(3)}
                style={{ background: "transparent", border: "1px solid var(--color-border-primary)", color: "var(--color-text-secondary)", padding: "6px 14px", borderRadius: 6, fontSize: "0.8rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                &#8592; Back to Sheets
              </button>
              <button className="btn-ghost" onClick={() => setSheetsOpen(!sheetsOpen)}
                style={{ background: "transparent", border: "1px solid var(--color-border-primary)", color: "var(--color-text-secondary)", padding: "6px 14px", borderRadius: 6, fontSize: "0.8rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                &#9654; Master Sheets
              </button>
            </div>
          </div>
          {shots.some(s => s.status === "pending") && !busy && (
            <div style={{ marginBottom: 12 }}>
              <button className="btn-primary" onClick={continueShots}
                style={{ background: amber, color: "#fff", border: "none", padding: "8px 18px", borderRadius: 6, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                &#9654; Continue Generating ({shots.filter(s => s.status === "pending").length} remaining)
              </button>
            </div>
          )}
          {sheetsOpen && (
            <div style={{ background: "var(--color-background-card)", border: "1px solid var(--color-border-primary)", borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <SheetPanel characters={characters} locations={locations} onRefreshChar={refreshChar} onRefreshLoc={refreshLoc} regenerateInput={regenerateInput} setRegenerateInput={setRegenerateInput} regenerateNote={regenerateNote} setRegenerateNote={setRegenerateNote}           regenerating={regenerating} busy={busy} regenDone={regenDone} />
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {shots.map((shot, i) => {
              const isExpanded = expanded === i
              const status = shot.status
              const canExpand = status === "done" || status === "error"
              const badgeStyle = { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }
              let badge = { ...badgeStyle, border: "2px solid var(--color-border-secondary)", color: "var(--color-text-tertiary)" }
              if (status === "loading") badge = { ...badgeStyle, border: "2px solid " + amber, color: amber, animation: "spin-badge 1.2s linear infinite" }
              if (status === "done") badge = { ...badgeStyle, background: amber, border: "2px solid " + amber, color: "#fff" }
              if (status === "error") badge = { ...badgeStyle, border: "2px solid var(--color-text-danger)", color: "var(--color-text-danger)" }
              const glyph = status === "loading" ? "\u25CC" : status === "done" ? "\u2713" : status === "error" ? "\u2717" : shot.scene.number
              const sub = status === "pending" ? "Waiting..." : status === "loading" ? "Generating..." : status === "error" ? shot.errMsg : "\u25B8 Expand"
              return (
                <div key={i} style={{ background: "var(--color-background-card)", border: "1px solid var(--color-border-primary)", borderRadius: 8, overflow: "hidden" }}>
                  <div className="shot-row" onClick={() => toggleExpand(i)} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={badge}>{glyph}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-primary)" }}>Scene {shot.scene.number} - {shot.scene.title}</div>
                      <div style={{ fontSize: "0.75rem", color: status === "error" ? "var(--color-text-danger)" : "var(--color-text-tertiary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>
                    </div>
                    {status === "error" && !busy && (
                      <button onClick={(e) => { e.stopPropagation(); retryShot(i) }}
                        style={{ background: "transparent", border: "1px solid var(--color-border-danger)", color: "var(--color-text-danger)", padding: "4px 12px", borderRadius: 4, fontSize: "0.75rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}>Retry</button>
                    )}
                    {status === "done" && !busy && (
                      <button onClick={(e) => { e.stopPropagation(); retryShot(i) }}
                        style={{ background: "transparent", border: "1px solid var(--color-border-primary)", color: "var(--color-text-secondary)", padding: "4px 12px", borderRadius: 4, fontSize: "0.75rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}>&#8635;</button>
                    )}
                  </div>
                  {isExpanded && canExpand && (
                    <div style={{ borderTop: "1px solid var(--color-border-primary)", padding: 16 }}>
                       <div style={{ display: "flex", gap: 0, marginBottom: 16 }}>
                         {["video", "json"].map(tab => (
                          <button key={tab} onClick={(e) => { e.stopPropagation(); setTabs(prev => ({ ...prev, [i]: tab })) }}
                            style={{ background: (tabs[i] || "video") === tab ? amber : "transparent", color: (tabs[i] || "video") === tab ? "#fff" : "var(--color-text-secondary)", border: (tabs[i] || "video") === tab ? "1px solid " + amber : "1px solid var(--color-border-primary)", padding: "6px 16px", borderRadius: 4, fontSize: "0.76rem", fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                            {tab === "video" ? "Image-to-Video Prompt" : "JSON"}
                          </button>
                        ))}
                      </div>
                      {(tabs[i] || "video") === "video" && (
                        <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: 14, border: "1px solid #B8942A" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#B8942A" }}>GROK IMAGE-TO-VIDEO PROMPT</span>
                            {shot.text && <CopyButton shotKey={"tx" + i} label="Copy" copied={copied} setCopied={setCopied} text={shot.text} />}
                          </div>
                          {shot.text
                            ? <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.73rem", color: "var(--color-text-secondary)", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{shot.text}</div>
                            : <div style={{ fontSize: "0.78rem", color: "var(--color-text-tertiary)", fontStyle: "italic" }}>No prompt available. Regenerate the shot.</div>}
                        </div>
                      )}
                      {(tabs[i] || "video") === "json" && (
                        <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: 14, border: "1px solid var(--color-border-primary)" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                            {shot.json && <CopyButton shotKey={"js" + i} label="Copy" copied={copied} setCopied={setCopied} text={JSON.stringify(shot.json, null, 2)} />}
                          </div>
                          {shot.json
                            ? <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.73rem", color: "var(--color-text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{JSON.stringify(shot.json, null, 2)}</div>
                            : <div style={{ fontSize: "0.78rem", color: "var(--color-text-tertiary)", fontStyle: "italic" }}>No structured JSON available. The prompt tab contains the full script.</div>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
