# The collective harness

What the room built on 24 September 2026, merged from the six table
constitutions under `tables/`.

| File | What |
| --- | --- |
| `CONSTITUTION.md` | The loadable rules file: every table's rules, deduplicated, each with its origin and the table that wrote it. Team-specific rules at the end. |
| `CONFLICTS.md` | Where tables disagreed, both sides, and what the merge chose and why. |
| `SCORES.md` | The with and without scores per table, as recorded on the night. |

## Use it

Copy `CONSTITUTION.md` to the rules file your tool reads (`CLAUDE.md`,
`AGENTS.md`, `.github/copilot-instructions.md`, `.cursor/rules/`), or paste
it as the first message. Then take out what does not apply to your stack
and add your own incidents with their origin line. A constitution you did
not edit is a summary.

## Keep it growing

Open a pull request against `tables/<your-table>/TEAM-CONSTITUTION.md` or
directly against `harness/CONSTITUTION.md`. Rules need an origin: the
incident, the review comment or the decision that produced them. A rule
without a cause does not survive the first discussion.
