# Round-Robin UI kit (secondary)

Hi-fi recreation of `/round-robin`, based on `components/round-robin/*` from [`ruizTechServices/luis_ruiz_2 @ GioClaw-Edit`](https://github.com/ruizTechServices/luis_ruiz_2/tree/GioClaw-Edit).

## What it covers

- **Left rail** — Topic input (with char counter), Model selector (multi-select with provider chips), Turn order + drag handles, Rounds-before-pause config.
- **Main pane** — Session badges with `active` / `speaking` / `waiting` states, conversation thread with `Round N` dividers, user message bubbles, assistant bubbles, **live streaming** with a blinking caret + dashed border, session status line with session id.
- **Control bar** — follow-up textarea + Pause / Continue / End buttons (matches `ControlPanel.tsx` state machine: `idle / active / paused / awaiting_user / completed / error`).

## Sources of truth

- `components/round-robin/ConversationThread.tsx` — round dividers, streaming visual treatment, bubble alignment
- `components/round-robin/ControlPanel.tsx` — five session states and their buttons
- `components/round-robin/ModelBadge.tsx` — provider dot + label pattern
- `components/round-robin/TurnOrderConfig.tsx` — order rows + rounds input
- `components/round-robin/ModelSelector.tsx` — multi-select pattern

## Notes

- Live demo: the Llama 3 message types out in real time on load. Session shows `awaiting_user` once streaming completes.
- The drag handles are decorative — actual reordering isn't wired here.
- Provider chip colors mirror real brand cues (OpenAI green, Anthropic terracotta, Ollama purple, Google indigo, Mistral orange, xAI black-on-outline).
