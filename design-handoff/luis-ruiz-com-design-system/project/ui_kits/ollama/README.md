# Ollama chat UI kit

Hi-fi recreation of `/ollama` (the "Ollama Lab"), based on `app/ollama/page.tsx` + `app/ollama/OllamaChatClient.tsx` in [`ruizTechServices/luis_ruiz_2 @ GioClaw-Edit`](https://github.com/ruizTechServices/luis_ruiz_2/tree/GioClaw-Edit).

## Covered

- **Header card** — eyebrow ("Ollama Lab"), title, status pills: `Ollama ready` / `DB persist on` / `session · #id`.
- **Conversation pane** — scroll region, user bubbles right (sky-tinted), assistant bubbles left, streaming bubble with dashed border and blinking caret. Demo streams a real response on load and on every Send.
- **Composer** — multiline textarea, Send (primary), retrieval-context inline toggle, Stop / Clear chat / History (ghost).
- **Settings rail** — Model select, Temperature slider, Top-P slider with custom track fill, Retrieval switch + Top K + Min similarity inputs.
- **Status line** — connection state, origin, last check.

## Sources of truth

- `app/ollama/page.tsx` — page shell, eyebrow + h2 framing, status pill copy
- `app/ollama/OllamaChatClient.tsx` — settings layout (model / temp / topP / retrieval / top K / min sim), thread bubble styling, persist-status header logic
- `components/app/chatbot_basic/EmbedInput.tsx` — composer affordances
