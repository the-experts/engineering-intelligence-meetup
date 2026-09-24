# Team constitution: table koffie

Score without the constitution: 4 / 7
Score with the constitution:    6 / 7
Traps that flipped and why (one line): 1-6 flipped because the constitution sends the assistant to the wiki and ranks current over stale; 7 stayed red because the announced endpoint rule was written down nowhere.

---

## 1. Which parts does a harness for your team need?

- Knowledge sources: documentation repo (ADRs, runbooks, features, release notes), platform repo (agent skills)
- Rules: architecture, testing, code style, dependencies
- Guardrails: gitleaks as commit hook and in CI, static linting
- Review gates: Conventional Commits, PR format, test evidence
- Connectors: Confluence and Jira through MCP

## 2. Per part: why does it need to be said, and what do you expect to gain?

### Knowledge sources
- Why: decisions live in the documentation repo and Confluence, not in the code. An assistant that doesn't read them guesses.
- Expected gain: changes follow our ADRs instead of plausible defaults.

### Rules (testing and architecture)
- Why: E2E confirmations between two applications went untested, so behaviour went unseen. Tests were too big or too small, and implicit requirements were missed.
- Expected gain: contract-first tests catch integration breaks. A clean hexagonal domain keeps tests small and honest.

### Guardrails
- Why: tokens were committed, so we scrubbed the git history and rotated them.
- Expected gain: secrets never reach the remote.

### Review gates
- Why: agents left comments about things that kept changing, and those comments go stale.
- Expected gain: self-explanatory code and PRs a reviewer can verify from the evidence.

## 3. Which existing tools and services could you already connect or pull into your harness?

- Documentation repo (local clone): ADRs, runbooks, features, release notes
- Confluence through MCP: the published documentation
- Jira through MCP: ticket context and acceptance criteria
- Platform repo: shared agent skills (Agent OS style)

## 4. The one thing you would put in place next week

- Connect the Confluence/Jira MCP, so the assistant reads the ADRs and the ticket before it writes code.
- No verbal-only rules: a rule announced in a meeting, stand-up or on a slide doesn't count until it's in this constitution or an ADR, with an origin line. Whoever announces it writes it down the same day.

---

## Rules for the assistant

### Ground rules (always)
- Follow Hexagonal Architecture and DDD. The domain has no framework or library imports and uses the ubiquitous language of the ticket and the docs.
- Apply SOLID, KISS, YAGNI and Clean Code. Leave touched code a little better (Boy Scout rule), without widening scope.
- Use names that explain themselves. Static linting passes with no new warnings.
- No comments that explain what the code does or how it came about. If a comment feels necessary, rename or restructure instead. (Origin: agent comments went stale as targets moved; we wrote a how-to.)
- Before finishing, check the change against well-known antipattern catalogues (look them up online). Name any you avoided or accepted in the summary.
- Commits follow Conventional Commits. PR descriptions list the steps taken and include test evidence, with screenshots for frontend changes.

### Rules from our incidents
- Test from the contract inwards: write the contract/feature test first (WireMock for external services), then unit tests for the small parts. No test that only exists to raise coverage. (Origin: E2E confirmations between two applications were not tested, so behaviour went unseen.)
- Respect the test pyramid: each test targets one level, feature or unit, not both. Cover implicit requirements the ticket implies. (Origin: tests were too big or too small, and read-between-the-lines behaviour was missed.)
- If a test is hard to write, change the implementation, not the test.
- Never commit secrets or tokens. Read them through the project's secrets helper, never log them, and never disable gitleaks. (Origin: tokens were committed; history scrubbed, tokens rotated, gitleaks added to the hook and CI.)
- No Lombok.
- Don't be eager to update: no dependency bumps outside the ticket's scope. Only take a Dependabot fix once its release is at least 48 hours old.
- Before building on a dependency, check its support status and the ADRs. If it is end-of-life, upgrade it or record an exception. Never do neither. (Origin: run 1, express 4.17.1 left untouched.)
- Never expose operational endpoints (metrics, debug, admin) unauthenticated on the public root path. Check the docs for how internal endpoints are protected. (Origin: run 1, `/metrics` open on `/`.)
- Never invent policy values (retry counts, delays, timeouts, limits) that a document could define. Look them up, or say in the summary that none exists. (Origin: run 1 made up the retry policy.)
- Operational endpoints (metrics, health details, debug) run under `/internal/`, e.g. `GET /internal/metrics`, and require the `X-Internal-Token` header, validated in constant time through `getSecret('INTERNAL_TOKEN')`. A missing or wrong token gets 401. This policy wins over the `/metrics` path in ADR-008 and the billing runbook, which are outdated on this point; the Prometheus format and naming in ADR-008 still apply. (Origin: FlowMetrics architecture board, platform policy of September 2026, announced on a slide and written down nowhere else; run 2 invented its own `METRICS_TOKEN` bearer scheme instead.)
- Never invent a security mechanism: auth scheme, header name, secret name, protected path or port. If no document defines it, stop and ask before building it, and don't pick a plausible default. The same goes for anything a reviewer would hold you to that you can't find written down. (Origin: run 2 invented one and scored FAIL.)
- Before every commit, check that `git branch --show-current` is still the branch the task started on. If it changed, stop and ask; never commit onto whatever happens to be checked out. (Origin: run 2 landed on `table-koffie` instead of `run-with` after a mid-task switch.)

### Knowledge sources: read before changing code
- Our decisions, standards and runbooks live in `../flowmetrics-wiki`. Read the relevant ones before you change code, and respect their `status` header. An accepted or current document beats a superseded, deprecated or draft one, and beats existing code.
- Our own team: the documentation repo at `../docs` (ADRs, runbooks, features, release notes), mirrored to Confluence on merge. Use the Confluence/Jira MCP when it is connected.
- When a decision conflicts with the ticket, follow the decision. End every change with the documents you relied on and any exceptions you recorded.
