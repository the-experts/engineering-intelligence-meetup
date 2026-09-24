# Team constitution: table casper

Copy this file to `tables/<table-name>/TEAM-CONSTITUTION.md`. Fill it in
during the breakout, load it as your assistant's rules file for run 2 of
`tasks/TASK.md`, then push branch `table-<name>` and open a pull request.

This file is your constitution: one part of a harness, the part that says what
always holds and what you learned the hard way.

Score without the constitution: 3 / 7
Score with the constitution:    _ / 7
Traps that flipped and why (one line):

---

## 1. Which parts does a harness for your team need?

List them. Examples: rules, context, knowledge sources, guardrails, tracing
and governance, security, onboarding, review gates, connectors.

- Rules and review gates
- Incident-learned engineering practices
- Architecture decision records
- Knowledge sources

## 2. Per part: why does it need to be said, and what do you expect to gain?

One block per part. "Why" is ideally an incident or a recurring review
comment; "gain" is what changes on Monday if that part exists.

### Rules and review gates
- Why: Functional changes need human review before they are merged, while small non-functional changes should not be unnecessarily delayed.
- Expected gain: Clear merge expectations and consistent review behavior.

### Incident-learned engineering practices
- Why: Previous changes introduced tooling that did not fit the existing infrastructure and mixed Dutch domain terms with English identifiers and comments.
- Expected gain: Changes fit the codebase and preserve domain language.

### Architecture decision records
- Why: Important technical choices need a durable explanation that can guide future changes.
- Expected gain: The team can understand why a decision was made and revisit it deliberately.

### Knowledge sources
- Why: Team decisions, standards, and runbooks will live in the FlowMetrics wiki.
- Expected gain: The assistant uses the team's current guidance before making changes.

## 3. Which existing tools and services could you already connect or pull into your harness?

Issue tracker, ADR repo, CI, observability, wiki, code search, ticket
history, chat archive. Name the tool and what the assistant would read from it.

- FlowMetrics wiki: `../flowmetrics-wiki`. The assistant should read relevant decisions, standards, and runbooks from this wiki.

## 4. The one thing you would put in place next week

One sentence. Small enough to actually happen.

- Add and maintain numbered ADRs in `decisions/adr/`.

---

## Rules for the assistant

This section is your team's constitution: the part of the harness that says
what always holds and what was learned the hard way. Write the rules your
assistant should follow on this codebase. This is the part that gets loaded for the "with harness" run.
Short imperative rules with an origin note work best, for example:

- Do not merge a pull request with functional changes until at least one human has reviewed it. Non-functional changes, such as version bumps, documentation, or simple text changes, may be merged without review.
- If your only pull request review comment is `LGTM`, include a 🚀 emoji.
- Before introducing a dependency or new tooling, check whether the existing tools can meet the need. Add a dependency only when needed, and follow existing project structures and coding conventions. _Origin: New tooling did not fit the existing infrastructure and had to be redone, a few weeks ago._
- Write code identifiers, comments, and in-repo documentation in English. Preserve Dutch domain-specific terms rather than translating them; for example, use `sluis` and its `name`, not `sluice` or `naam`. _Origin: A change mixed Dutch comments with English identifiers and translated domain terminology, last month._
- Record significant architecture decisions as numbered ADRs in `decisions/adr/`.
- Use the ADR format defined below for each decision record.
- Before changing code, always read the relevant decisions, standards, and runbooks in `../flowmetrics-wiki`. Respect each document's `status` header and follow the applicable guidance.
- Before submitting or updating a merge request, always run Prettier on the changed files and ensure they use Unix LF line endings, never CRLF.

### ADR format

Each ADR is a Markdown file named `NNNN-short-title.md` in `decisions/adr/`. Use this structure:

```markdown
# Architecture Decision Record: <title>

Decision: <one-sentence decision>

## Status

Accepted

## What is <subject>?

<short explanation>

## Context

<context and problem>

## Decision Drivers

- <driver>

## Considered Options

- **<option>:** <description>

## Decision Outcome

<decision, rationale, and consequences>
```

The team's decisions, standards, and runbooks live in `../flowmetrics-wiki`.
Before changing code, the assistant must read the relevant material there and
respect its `status` header.
