# Team constitution — table ricardo

## Ground rules

These hold regardless of incident.

- Never modify security configuration (auth, Keycloak, security filters) as a side effect of an unrelated change. If a task genuinely requires a security change, call it out explicitly before making it.
- Never remove, disable, or downgrade an admin/privileged account without a verified replacement admin already in place.
- A feature is not done until it has been verified on an integrated/target environment — passing on a developer's own machine is not a completion criterion.
- Don't assume a library, pattern, or config that's absent from the code is available or safe to reuse — check it isn't a deliberate removal first.

## Rules from experience

- API changes belong in the routing/base-path layer, not the security config. (Origin: a frontend dev adding an endpoint edited the security config instead of the API base path.)
- Before touching Keycloak admin users, confirm a specific replacement admin already exists and has been verified. (Origin: the default Keycloak admin user was removed before specific admin users were created, locking the team out.)
- Verify on an integrated environment before marking work done. (Origin: a feature passed on every developer's machine but broke on target infrastructure.)
- Do not use Spring's RestTemplate in new or modified code. (Origin: the team migrated off it; its absence from the codebase is deliberate, not an oversight a newcomer should "fix.")
- Do not introduce Lombok; use Java Records for data classes instead. (Origin: team standardized on Records over Lombok.)
- Match the naming conventions used in current/active code, not legacy names still present elsewhere. (Origin: legacy naming conventions still exist in parts of the codebase and can mislead a newcomer into copying them.)

## Platform policies

- New platform policy (September 2026): the FlowMetrics architecture board has decided that operational endpoints (metrics, health details, debug) run under `/internal/` and require the header `X-Internal-Token`, validated through `getSecret('INTERNAL_TOKEN')`. The FlowMetrics wiki has an ADR that puts metrics on `/metrics`, and a runbook pointing at it — as of this policy's date, those are outdated; this policy wins.

## Knowledge sources

Consult these before changing code:

- Our decisions, standards and runbooks live in `../flowmetrics-wiki`, cloned next to this repo. Read the relevant ones before you change code, and respect their `status` header.
- **The relevant project's README** — project-specific conventions and setup.
- **Jira tickets** — requirements and decision history for the work item.
- **Merge/pull request comments and history** — prior review feedback and corrections on related code.

All four are reachable today, though not always via a direct API — if access isn't already configured, ask for the specific link or export before proceeding.
