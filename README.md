<div align="center">
  <img src="media/logo.png" alt="VibePPT" width="200" />
</div>

<div align="center">
  <a href="https://buymeacoffee.com/giacomov"><img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" /></a>
</div>

> [!WARNING]
> This is an early-stage prototype, things are changing fast.

An AI-native slide deck builder: prompts in, slides out. Highly customizable. 

<img width="3262" height="1858" alt="image" src="https://github.com/user-attachments/assets/47d75256-6946-428b-9e70-90dce22eb44c" />

# Quick start

Make sure you have Claude Code installed and authenticated, then copy and paste this prompt into it:

```
Verify that I have `npm` available, and if not install it for me.

Then clone the repository https://github.com/giacomov/vibeppt.

Install the required dependencies with `npm install`, then also install the editor dependencies with `cd editor && npm install && cd ..`.

Finally run with `npm run editor`.
```

Then open `http://localhost:3000` and ask to create a presentation about something.

You can also create presentations from a local file or folder (just say "Create a presentation from [path of the file or folder]") or from the web ("Search information about ... and then create a presentation").

The agent will ask you a few questions, then give you a outline, and if you confirm, it will implement it for you.

After implementing it, it will export each slide as an image and check for alignment, overlap between elements, and any other defect (if any). If it finds issues, it will solve them for you.

### Or run the commands yourself

```shell
git clone https://github.com/giacomov/vibeppt.git
cd vibeppt
npm install && cd editor && npm install && cd ..
npm run editor
```

Then open `http://localhost:3000`.

## Editing the presentation

Once the presentation is created, just click on it. The agent will know which presentation you have selected and which slide you are seeing, so just ask for the changes you want and it will implement them for you. They will be immediately reflected in the presentation.

## Seeing all available templates

VibePPT use templates to save tokens and provide polished slides. You can see them by clicking on the Demo presentation and scrolling through it, or ask for a list to the agent.

You can also implement one-off slides, or even your own templates, if you have visual ideas that are not supported by the existing templates. Again, just ask your agent to build them for you. It will re-use base slides and color schemes to make sure your new slide stay on-brand.

## Playing the presentation

Once you have a presentation and you want to present it, just switch to a new tab and go to `http://localhost:5173` then click on your presentation. If you want, hover to the top of the first slide and click on Presenter Mode (allow pop-ups) to display speaker notes. 

NOTE: to edit the speaker notes, just go back to the editor and ask the agent to make the changes, OR, open your files in your favorite editor (like VS Code).

## Exporting

Just ask the agent to export the presentation (PDF or PNGs are supported).

---

# Use Claude Code or Cursor directly

If you prefer to skip the editor UI, open the vibeppt folder in Claude Code, Cursor, or any other coding agent that supports the agentskills.io standard and use the `/create-presentation` slash command directly.

https://github.com/user-attachments/assets/bad693b2-c46b-407c-9d8a-8d16c6d073c7

**Result:**

https://github.com/user-attachments/assets/73025fde-8353-4c68-b85d-5ee7b10a68f9

### Claude Code

From within the `vibeppt` folder:
```
claude --permission-mode auto "/create-presentation about this https://karpathy.bearblog.dev/year-in-review-2025/"
```
or just run claude code and enter the prompt `/create-presentation about this https://karpathy.bearblog.dev/year-in-review-2025/` from within CC.

### Cursor agent

```
> agent --model claude-sonnet-4-6 --output-format text --yolo -p "/create-presentation about https://karpathy.bearblog.dev/year-in-review-2025"
The `karpathy-2025` deck is ready — 16 slides covering all six of Karpathy's paradigm shifts. Here's what was built:

**Slide structure:**
1. **Title** — "2025 LLM Year in Review"
2. **Agenda** — SplitFlapBulletSlide with the 6 shifts
3. **Section: Training Paradigms**
4. **RLVR** — PrismSlide decomposing the new training stack (Pretraining → SFT → RLHF → RLVR)
5. **Jagged Intelligence** — TemperatureSlide (Confused grade-schooler ↔ Genius polymath)
6. **Don't Trust Benchmarks** — KeyTakeawaySlide (3 punchy points)
7. **Section: LLM Applications**
8. **Cursor / LLM App Layer** — PrismSlide (context engineering, orchestration, GUI, autonomy slider)
9. **Claude Code** — CardSlide (4 playing cards: localhost, loopy reasoning, low latency, spirit on your box)
10. **Section: Vibe Coding**
11. **The Vibe Coding Loop** — CycleSlide (Describe → Ship → Discard)
12. **Who Benefits Most?** — CompareSlide (Regular People vs Trained Professionals)
13. **Section: LLM GUI**
14. **LLM GUI Evolution** — StackSlide (Raw Text → Markdown → Multimodal)
15. **TLDR** — KeyTakeawaySlide with Karpathy's closing lines
16. **The End**
```

## Creating presentations

You can find demo presentations under `demos/`. Your presentations must go under `presentations/` in the root of the folder.

### With an AI agent (recommended)

Use the `/create-presentation` slash command in Claude Code or Cursor. The agent reads `CLAUDE.md` / `AGENTS.md` for full instructions on the template library, file layout, and style rules.

### Slide by slide

Ask the agent to add or change individual slides:

```
Add a slide after slide 3 comparing RLHF vs RLVR — use CompareSlide.
```

```
The agenda slide feels too static. Replace it with a SplitFlapBulletSlide.
```

### Custom slides beyond the templates

Because slides are plain React components, you can vibe-code anything that doesn't fit a template:

```
Create a new slide with an animated neural network diagram — three input nodes,
two hidden nodes, one output node, edges drawn with SVG, weights animating in
on mount.
```

### Iterating

If you don't like what the agent produced, just say so:

```
The title slide feels too corporate. Make it more technical.
The chart on slide 5 should be a line chart, not a bar chart.
Slide 8 has too much text — cut it in half.
```

Everything is code, so you can also edit `.tsx` files directly if you prefer.

### Integration with other tools

Since this runs inside your favorite coding agent, you can mix it with the other tools available there. Some ideas:

* `/create-presentation Fetch my confluence page ... with the Atlassian MCP server and create a presentation about it`
* `Do a deep research about [topic]` then `/create-presentation about this`.
* ...

I find that the most flexible way is to create an intermediate markdown document _before_ you start working on the presentation. You can create this intermediate document any way you want, so you can assemble parts from multiple sources. Then you can create the documentation starting from there. If you need changes, change the document first, then ask the agent (Claude Code or Cursor) to update the presentation accordingly.

You can even do self-updating presentations by using the cron capabilities of these tools.

### Export slides

Any presentation you make can be exported as a PDF or as separate images (one per slide):

```bash
npm run export -- --deck=<name> --format=png   # PNGs to exports/<name>/
npm run export -- --deck=<name> --format=pdf   # single PDF
npm run export -- --deck=<name> --format=both
```

---

## How it works

**Slides are just React components.** Each slide is a `.tsx` file that returns a `ReactNode`. A `deck.ts` manifest imports and orders them. The app auto-discovers all decks under `presentations/` — no config needed.

**Templates are the vocabulary.** A library of pre-built animated layouts (`BulletSlide`, `FlowSlide`, `CompareSlide`, `CardSlide`, `CycleSlide`, `PrismSlide`, and more) covers most content types. Agents are instructed to pick the best template for the content rather than defaulting to bullets.

**Theming is token-based.** Colors and fonts live in `src/theme/tokens.ts` and flow through Tailwind. Each deck can override the accent color without touching other decks.


## Project layout

```
presentations/          <- your decks live here
  [deck-name]/
    deck.ts             <- manifest: imports + orders slides
    title.tsx
    ...

src/
  templates/            <- reusable slide layouts
  components/           <- app chrome (renderer, navigation, presenter UI)
  theme/tokens.ts       <- global design tokens
  types/slide.ts        <- SlideComponent, Deck types

scripts/
  export-slides.mjs     <- Playwright-based PNG/PDF exporter
```

---

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Recharts (charts)
- React Flow / Dagre (flow diagrams)
- Lucide React (icons)
- Playwright (export)
