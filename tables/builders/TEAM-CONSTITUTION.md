# Team constitution: table builders

This file is your constitution: one part of a harness, the part that says what
always holds and what you learned the hard way.

Score without the constitution: 4 / 7
Score with the constitution:    _ / 7
Traps that flipped and why (one line):

---

## 1. Which parts does a harness for your team need?

- Rules: this constitution.
- Context: a glossary of domain terms, one word per concept.
- Knowledge sources: wiki, project READMEs, harness files, Jira stories.
- Guardrails: licence and ban checks before adding a dependency.
- Review gates: passing tests, 80%+ coverage on new code.
- Security: no leaked secrets, a security check on every change.
- Connectors: assistant access to Jira and the wiki (not there yet).

## 2. Per part: why does it need to be said, and what do you expect to gain?

### Rules
- Why: mixed `colour`/`color` caused database problems (September 2026).
- Expected gain: one spelling across code, database and design documents.

### Context (glossary)
- Why: people with different languages use different terms; agreed terms
  live only in people's heads.
- Expected gain: a written glossary to check names against.

### Knowledge sources
- Why: an assistant that is not pointed at our decisions never reads them.
- Expected gain: existing decisions get followed, not re-decided.

### Guardrails
- Why: PrimeNG changed its licence terms.
- Expected gain: no dependency with an unwanted licence or a team ban.

### Review gates
- Why: poorly tested parts and failing tests led to problems.
- Expected gain: every change lands tested and green.

### Security
- Why: code must not leak secrets or leave loopholes.
- Expected gain: every change is security-checked before it lands.

### Connectors
- Why: Jira stories hold the context per change; there is no Jira MCP.
- Expected gain: the assistant can read the story behind a change.

## 3. Which existing tools and services could you already connect or pull into your harness?

- READMEs and harness files: in the repo, readable today.
- Wiki: decisions and standards; not connected yet.
- Jira: stories; no MCP connector yet.

## 4. The one thing you would put in place next week

- A pipeline check that fails the build when any test fails or new code is
  below 80% coverage.

---

## Rules for the assistant

### Knowledge sources: read before changing code
- Our decisions, standards and runbooks live in `../flowmetrics-wiki`. Read
  the relevant ones before you change code, and respect their `status` header.
- Read the project's `README.md` and the harness files in the repo, and
  follow them.
- Jira is not reachable; work from the task as given.

### How to write code
- Build only what the task asks for. No extra features, endpoints or
  unrelated refactors; name anything else you think is needed in your summary.
- Clear names instead of comments that explain what code does.
- TypeScript: no type errors, no `any` (use `unknown`), no `@ts-ignore`, no
  non-null `!`, do not loosen `tsconfig` or lint settings.
- Defensive: validate all external input (requests, config, service
  responses), handle every error from an external call, no empty `catch`.
- Performant: no queries or network calls in loops when one batched call
  will do, no blocking I/O on a request path.
- Security: no secrets (keys, tokens, passwords, connection strings) in
  code, config, logs, errors or responses; new endpoints and inputs must not
  expose internal data or bypass authentication or validation.
- UK English spelling in code and design documents: `colour`, `cancelled`,
  `serialise`. (Mixed `colour`/`color` caused database problems, Sept 2026.)
- Do not add PrimeNG. (Licence change.)
- When something is unclear, ask. If nobody can answer, pick the option that
  best fits the specs and state it with the reason in your summary.

### Done means
- The full test suite passes; broken tests are fixed, never skipped or
  deleted. (Poorly tested parts and failing tests led to problems.)
- New code has at least 80% test coverage. (Same origin.)
- Your summary lists each requirement from the specs and how the change
  meets it, plus what you checked for security and what you found.
