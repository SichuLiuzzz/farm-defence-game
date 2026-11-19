# Text encoding and localization

- Save source files and Markdown documentation as UTF-8. Preserve the existing encoding when editing a file; do not convert it through a shell or editor using a different code page.
- When adding or editing non-ASCII text, inspect the saved file (and rendered UI when applicable) to confirm the characters are intact. Watch for replacement characters (`�`), question-mark substitutions, or mojibake such as `鐧藉ぉ`.
- Keep player-facing text in the localization dictionaries, not inline in components, game systems, or renderers. Add matching entries for every supported language when introducing a new string.
- The game currently supports English (`en`) and Simplified Chinese (`zh-CN`). Preserve placeholders in translations (for example, `{wave}`) so dynamic values remain correct in both languages.
