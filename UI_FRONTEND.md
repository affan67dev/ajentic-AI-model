# Zexio AI Frontend UI

## Structure
- `app/page.tsx` contains the client chat shell, sidebar history, unified Zexio AI header, transcript, composer, model control, and floating app navigation.
- `app/globals.css` owns the dark glass visual system, responsive layout, message action styling, composer layout, and compact navigation capsule.

## Design rules
- Keep the dark, restrained, premium visual language with compact spacing and no oversized branding.
- User messages are clean and never receive assistant response controls or repeated profile initials.
- Assistant responses alone expose icon-only copy, share, feedback, text-to-speech, and more actions.
- The composer stays below the transcript, keeps attachment on the left, voice and send on the right, and places the disclaimer beneath it.

## Chat behavior
- Sending adds a user message and a generic Zexio AI response.
- Markdown-like headings, bullets, numbered lines, inline code, links, and fenced code blocks must remain readable and horizontally safe.
- Processing uses a generic `Thinking…` status and never exposes a backend model.

## Model visibility
- Model/provider identity is hidden from the conversation, message metadata, and processing state.
- Free users remain in automatic routing mode; premium users may optionally choose a model through the separate AI Control popover only.
- The history sidebar contains conversations and settings, never a model list.

## Responsive requirements
- Mobile is the priority: no horizontal page overflow, compact header/composer, and a centered floating navigation capsule.
- Preserve accessible labels on icon-only controls and keep all primary controls within the viewport.
