# Rain Simulation: Abel vs Cain — Cursor IDE Build Plan

## Project Goal
Build an interactive 2D rain simulation that answers the question:
**"Does a person who runs in the rain get more wet than one who stands still?"**

Two characters — Abel (standing) and Cain (running) — are simulated with real raindrop
particle physics. Every raindrop that hits each character is counted. The user controls
Rain Intensity, Wind Direction, and Gravity via sliders.

---

## Tech Stack Decision

**Use Phaser 3 + TypeScript + React (Vite)**

- **Phaser 3** — 2D game engine with built-in particle emitter, Arcade Physics, WebGL renderer
- **TypeScript** — full type safety, Phaser ships `@types/phaser`
- **React (Vite)** — UI shell for sliders/dashboard overlay rendered outside the canvas
- **Tailwind CSS** — utility styling for the React UI panel

**Why NOT Three.js:** This is a pure 2D problem. Three.js is a 3D renderer — you'd spend
80% of your time rebuilding what Phaser gives you for free (particles, overlap detection,
2D physics). Phaser will be 3–5x faster to build and lighter at runtime.

---

## Project Structure

```
rain-simulation/
├── src/
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Root component, houses canvas + controls
│   ├── components/
│   │   └── ControlPanel.tsx      # Sliders UI (Rain Intensity, Wind, Gravity)
│   ├── game/
│   │   ├── RainScene.ts          # Main Phaser scene (all simulation logic)
│   │   ├── Character.ts          # Character class (Abel/Cain sprite + hitbox)
│   │   ├── RainManager.ts        # Particle emitter wrapper + hit counting
│   │   └── config.ts             # Phaser game config
│   └── types/
│       └── simulation.ts         # Shared TS types/interfaces
├── public/
│   └── assets/
│       ├── abel.png              # Standing character sprite (or spritesheet)
│       ├── cain.png              # Running character sprite (or spritesheet)
│       └── raindrop.png          # Single raindrop particle (or generate in-canvas)
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Step-by-Step Build Instructions for Cursor

### STEP 1 — Project Scaffold

```
prompt Cursor:
"Scaffold a Vite + React + TypeScript project. Install dependencies:
  - phaser@3.x
  - @types/phaser (devDependency)
  - tailwindcss, postcss, autoprefixer
Configure tailwind with `npx tailwindcss init -p`.
Create the folder structure as listed above with empty placeholder files."
```

---

### STEP 2 — Phaser Game Config (`src/game/config.ts`)

```
prompt Cursor:
"Create src/game/config.ts. Export a Phaser.Types.Core.GameConfig object with:
  - type: Phaser.AUTO (WebGL preferred)
  - width: 900, height: 500
  - backgroundColor: '#1a1a2e'
  - physics: { default: 'arcade', arcade: { gravity: { y: 300 }, debug: false } }
  - scene: [RainScene]
  - parent: 'phaser-container' (will be a div in React)
  - transparent: false
  - scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }"
```

---

### STEP 3 — Character Class (`src/game/Character.ts`)

```
prompt Cursor:
"Create src/game/Character.ts. Define a Character class that:
  - Constructor params: scene (Phaser.Scene), x, y, textureKey (string),
    isRunning (boolean), label (string)
  - Creates a Physics-enabled sprite using scene.physics.add.sprite()
  - If isRunning=true, plays a running animation (or moves the sprite back and
    forth using a tween between x=600 and x=850, looping, speed: ~120px/s)
  - If isRunning=false, sprite stays stationary (Abel stands at x=150)
  - Creates a hitbox rectangle (Phaser.GameObjects.Rectangle, alpha=0) sized to
    the character's visible body area — this is what rain collides with
  - Exposes a public hitCount: number = 0 property
  - Exposes a public incrementHit() method that increments hitCount
  - Exposes a public getHitCount(): number getter
  - Exposes a public reset() method that zeros hitCount
  - In update(), if isRunning, sync the hitbox position to follow the sprite"
```

---

### STEP 4 — Rain Manager (`src/game/RainManager.ts`)

```
prompt Cursor:
"Create src/game/RainManager.ts. This class manages the Phaser particle emitter
and raindrop hit detection. It should:

  Constructor params: scene (Phaser.Scene), characters: Character[]

  - Create a Phaser.GameObjects.Particles.ParticleEmitterManager using
    scene.add.particles('raindrop')
  - Create an emitter with these default properties:
      x: { min: -50, max: 950 }       // full width spawn
      y: -10                            // spawn above screen
      speedX: 0                         // controlled by wind
      speedY: { min: 200, max: 400 }   // controlled by gravity slider
      scale: { start: 0.3, end: 0.2 }
      alpha: { start: 0.8, end: 0.6 }
      lifespan: 3000
      frequency: 30                     // ms between emissions (intensity)
      quantity: 2
      gravityY: 300

  - On each particle's onDead callback OR using scene.physics.overlap():
      Check if the particle overlapped with any character's hitbox.
      If yes, call character.incrementHit() and destroy the particle.

  - Expose these public methods:
      setIntensity(value: number)    // value 1–100, maps to frequency/quantity
      setWindX(value: number)        // value -200 to +200, maps to speedX
      setGravity(value: number)      // value 100–800, maps to speedY and gravityY
      reset()                        // resets all counts

  - IMPLEMENTATION NOTE: Phaser particles don't natively support physics overlap.
    Use a manual approach: in the scene's update() loop, iterate over all active
    particles and use Phaser.Geom.Intersects.RectangleToRectangle() to check
    each particle's bounds against each character's hitbox bounds. On hit,
    increment and kill the particle."
```

---

### STEP 5 — Main Scene (`src/game/RainScene.ts`)

```
prompt Cursor:
"Create src/game/RainScene.ts extending Phaser.Scene.

  preload():
    - Load raindrop image: this.load.image('raindrop', 'assets/raindrop.png')
    - Load character sprites: this.load.image('abel', 'assets/abel.png')
                                       this.load.image('cain', 'assets/cain.png')
    - If no sprites available, generate them procedurally:
        Create a 30x80 pixel RenderTexture for each character with a colored
        rectangle (Abel = blue, Cain = red) and use that as the texture.

  create():
    - Draw a simple ground line at y=460 using graphics
    - Draw a sky gradient background rectangle
    - Create Abel = new Character(this, 200, 380, 'abel', false, 'Abel')
    - Create Cain = new Character(this, 650, 380, 'cain', true, 'Cain')
    - Create rainManager = new RainManager(this, [abel, cain])
    - Add score text for each character (hitCount display)
    - Add character name labels
    - Set up a global event emitter (Phaser.Events.EventEmitter) to receive
      control changes from React:
        this.game.events.on('setIntensity', (v) => rainManager.setIntensity(v))
        this.game.events.on('setWind', (v) => rainManager.setWindX(v))
        this.game.events.on('setGravity', (v) => rainManager.setGravity(v))
        this.game.events.on('reset', () => { abel.reset(); cain.reset(); })

  update():
    - Call rainManager.checkHits() (the manual overlap check loop)
    - Update the score text for Abel and Cain with their current hitCount
    - If Cain is running, update his hitbox to follow his tween position"
```

---

### STEP 6 — React App Shell (`src/App.tsx`)

```
prompt Cursor:
"Create src/App.tsx. This is the main React component.

  - On mount (useEffect), create a new Phaser.Game(config) and store ref
  - Render a div with id='phaser-container' for Phaser to attach to
  - Render a ControlPanel component overlaid on top (position: absolute,
    bottom-left or right side panel)
  - Pass a gameRef to ControlPanel so it can emit events to Phaser
  - On unmount, call game.destroy(true)

  Layout:
  - Full viewport container (relative position)
  - Phaser canvas fills the container
  - Control panel is absolutely positioned (e.g., right side, semi-transparent)"
```

---

### STEP 7 — Control Panel (`src/components/ControlPanel.tsx`)

```
prompt Cursor:
"Create src/components/ControlPanel.tsx with these controls:

  Props: { game: Phaser.Game | null }

  State (useState):
    - intensity: number (default 50)      // 1=light drizzle, 100=monsoon
    - wind: number (default 0)            // -100=left, 0=calm, 100=right
    - gravity: number (default 50)        // 1=slow float, 100=heavy drops

  UI (Tailwind styled, semi-transparent dark panel):
    - Title: 'Rain Simulation Controls'
    - Slider: 'Rain Intensity' (1–100)
    - Slider: 'Wind Direction' (−100 to +100, center=0, show L/R labels)
    - Slider: 'Gravity' (1–100)
    - Reset Button: resets counts and slider to defaults
    - Live hit counter display:
        Abel: [count] hits
        Cain: [count] hits
        (Poll from game every 500ms via a ref to the scene)

  On each slider change:
    - game.events.emit('setIntensity', mappedValue)
    - game.events.emit('setWind', mappedValue)
    - game.events.emit('setGravity', mappedValue)

  Style: rounded-xl bg-black/60 backdrop-blur border border-white/10 text-white
         slider accent-blue-400, use custom range styling"
```

---

### STEP 8 — Assets (Procedural Generation Fallback)

```
prompt Cursor:
"In RainScene.preload(), add a fallback if no PNG assets exist:
  Generate textures using Phaser Graphics objects:

  Raindrop:
    - graphics.fillStyle(0x88ccff, 0.9)
    - Draw a thin elongated ellipse (3px wide, 12px tall) or use a line
    - generateTexture('raindrop', 4, 14)

  Abel (standing, blue):
    - Draw a simple stick figure or rectangle person shape
    - Head: circle, Body: tall rect, Arms: horizontal line, Legs: two lines
    - generateTexture('abel', 32, 80)

  Cain (running, red):
    - Same stick figure but with one arm/leg extended (running pose)
    - generateTexture('cain', 32, 80)

  This ensures the simulation works with zero asset files."
```

---

### STEP 9 — Hit Detection Refinement

```
prompt Cursor:
"Refine hit detection in RainManager for accuracy:

  In the manual checkHits() method called every frame:
    const particles = emitter.getAliveParticleCount() (iterate live particles)
    For each particle p:
      const pRect = new Phaser.Geom.Rectangle(p.x-2, p.y-6, 4, 12)
      For each character c:
        const cRect = c.hitbox.getBounds()
        if Phaser.Geom.Intersects.RectangleToRectangle(pRect, cRect):
          c.incrementHit()
          p.kill()     // remove particle on hit
          break        // don't double-count

  This gives physically accurate per-surface hit counting."
```

---

### STEP 10 — Polish & Extras (Optional but Recommended)

```
prompt Cursor:
"Add these polish features:

  1. GROUND SPLASH: When a raindrop reaches y >= 455 (ground), spawn a tiny
     short-lived splash particle burst at that x position (2-3 particles,
     speedY: -50 to -100, lifespan: 200ms, scale: 0.1 to 0).

  2. WET INDICATOR: As hit count increases, gradually tint each character sprite
     to a darker/bluer color using sprite.setTint(). Scale: 0 hits = normal,
     200+ hits = 0x4488ff deep blue.

  3. WIND VISUALIZATION: Draw faint horizontal lines in the background drifting
     in the wind direction to give visual feedback of wind speed.

  4. RESULTS PANEL: After 30 seconds (or when user clicks 'Show Results'),
     pause the sim and display a result card showing:
       - Abel: X drops
       - Cain: Y drops
       - Winner: [Name] got [Z]% more wet
       - Physics explanation: one sentence

  5. SPEED CONTROL for Cain: Add a 4th slider 'Running Speed' (0=standing,
     100=sprint) that controls the tween speed of Cain's back-and-forth movement."
```

---

## Key Physics Mappings (for Cursor Reference)

| Slider | Raw Value | Phaser Property |
|--------|-----------|-----------------|
| Intensity 1–100 | 1=sparse, 100=monsoon | `emitter.frequency` = `map(v, 1,100, 100,5)` ms, `quantity` = `map(v,1,100,1,8)` |
| Wind −100→+100 | negative=left, positive=right | `emitter.speedX` = `v * 2` (px/s) |
| Gravity 1–100 | 1=floaty, 100=heavy | `emitter.speedY` = `map(v,1,100,80,600)`, `gravityY` = `map(v,1,100,50,500)` |

---

## Expected Simulation Outcome

With default settings (no wind, moderate rain):
- **Cain will accumulate ~30–60% more hits** than Abel because he's moving through
  the rain, intercepting drops that would fall ahead of him.
- With strong tailwind (wind in direction of running):
  Cain may get fewer hits — he's "running away" from the drops.
- With strong headwind:
  Cain gets dramatically more hits — running into wind + rain.

This confirms the physics: **running increases wetness unless you run with the wind.**

---

## Full Cursor Master Prompt (paste this to start)

```
I'm building a 2D rain simulation using Phaser 3 + TypeScript + React (Vite) + Tailwind CSS.

The simulation shows two characters:
- Abel (stationary, positioned left side)
- Cain (running back and forth, positioned right side)

It rains continuously. Every raindrop that hits a character's body is counted separately
for Abel and Cain. The goal is to see who gets more wet.

The UI has a React control panel with sliders for:
1. Rain Intensity (1-100): controls how many drops fall per second
2. Wind Direction (-100 to +100): negative = wind blows left, positive = right, affects horizontal velocity of drops
3. Gravity (1-100): controls vertical fall speed of drops
4. Running Speed (0-100): controls how fast Cain moves (0 = both standing)

And a Reset button that zeroes both hit counters.

Project structure:
- src/game/config.ts — Phaser game config
- src/game/RainScene.ts — main Phaser scene
- src/game/Character.ts — character class with hitbox and hit counter
- src/game/RainManager.ts — particle emitter + manual hit detection loop
- src/components/ControlPanel.tsx — React sliders + counters
- src/App.tsx — React shell mounting Phaser canvas

React → Phaser communication uses: game.events.emit('setIntensity', value) etc.
Phaser → React communication uses: polling the scene's character hit counts via a ref.

Generate procedural textures in preload() if no image assets exist:
- Raindrop: thin blue ellipse (4x14px)
- Abel: blue stick figure (32x80px)
- Cain: red stick figure in running pose (32x80px)

Hit detection: manual per-frame loop using Phaser.Geom.Intersects.RectangleToRectangle()
comparing each live particle's bounds to each character's hitbox bounds.

When a drop hits a character: increment their counter, kill the particle.
As hit count grows, tint the character sprite progressively bluer/darker.

Please build this step by step, starting with the Vite scaffold and package.json,
then the Phaser config, then the scene, then React UI. Make sure TypeScript types
are strict and all Phaser APIs are typed via @types/phaser.
```

---

## Dependencies (package.json)

```json
{
  "dependencies": {
    "phaser": "^3.70.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/phaser": "^3.60.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```
