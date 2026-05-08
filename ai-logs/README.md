# AI Logs — Liftoff clone

This folder holds the raw AI conversation that produced the entire app, per the
[8x Engineer AI Logs guide](https://8xengineer.com/guidelines/ai-logs).

| File | What it is |
| --- | --- |
| `claude-code-session.jsonl` | Raw Claude Code session log copied from `~/.claude/projects/-home-aaqeb-ahmed/` (machine-readable, every message + tool call) |
| `claude-code-session.md` | Human-readable Markdown rendering of the same conversation (skim this first) |

The session was a single end-to-end run: contest selection → architecture →
~30 source files → typecheck → web export → 16 screenshots → README +
reflection → public GitHub push. See `../REFLECTION.md` for the post-mortem
and `../AI_LOGS.md` for the high-level summary.
