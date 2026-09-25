# Team constitution: table <name>

Copy this file to `tables/<table-name>/TEAM-CONSTITUTION.md`. Fill it in
during the breakout, load it as your assistant's rules file for run 2 of
`tasks/TASK.md`, then push branch `table-<name>` and open a pull request.

This file is your constitution: one part of a harness, the part that says what
always holds and what you learned the hard way.

Score without the constitution: 4 / 7
Score with the constitution:    _ / 7
Traps that flipped and why (one line):

---

## 1. Which parts does a harness for your team need?

List them. Examples: rules, context, knowledge sources, guardrails, tracing
and governance, security, onboarding, review gates, connectors.

-

## 2. Per part: why does it need to be said, and what do you expect to gain?

One block per part. "Why" is ideally an incident or a recurring review
comment; "gain" is what changes on Monday if that part exists.

### <part>
- Why:
- Expected gain:

## 3. Which existing tools and services could you already connect or pull into your harness?

Issue tracker, ADR repo, CI, observability, wiki, code search, ticket
history, chat archive. Name the tool and what the assistant would read from it.

- **Wiki (`../flowmetrics-wiki`):** ADRs, standards, runbooks, ways of working and post-mortem findings, read as local files before changing code.

## 4. The one thing you would put in place next week

One sentence. Small enough to actually happen.

-

---

## Rules for the assistant

### Ground rules (always hold)

Layers: **Endpoints** (REST controllers), **Service**, **Repository**, **Domain**.

1. Endpoints may call Service and Domain. Endpoints never import or call a Repository.
2. Service may call other Services, Repository and Domain. Service never imports or calls Endpoints.
3. Repository may call Domain only. It never imports or calls Endpoints or Service.
4. Domain calls no other layer: no imports from Endpoints, Service or Repository.
5. Every Endpoints method that handles a request for a Project puts its uid in the MDC under the key `projectUid` before doing any work, and removes it in a `finally` block. When a request has no Project, `projectUid` is not set.
   *Origin: team convention, so every log line shows the Project uid. Rules 1 to 5 are enforced only in review today.*
6. No `org.joda` imports and no Joda-Time dependency. Use `java.time` (`LocalDate`, `LocalDateTime`, `Instant`, ...).
   *Origin: team decision to stop using Joda. Date and reason not recorded.*
7. When a decision is not written down (in these rules or in the wiki, see Knowledge sources), or you are unsure which rule applies, stop and ask the tech lead. Do not guess.

### Rules learned from incidents

8. The frontend deployment zip has `index.html` at its root, with no wrapping top-level folder. Check: `unzip -l <zip>` lists `index.html` with no directory prefix.
   *Origin: 23 September 2026. The Angular build zip contained a top-level folder that the deploy did not strip, so nginx served the wrong directory and the frontend deploy failed. Fixed by leaving that folder out of the zip.*

### Knowledge sources

- **The wiki (`../flowmetrics-wiki`, cloned next to this repo):** our decisions, standards and runbooks live here. Read it before you change code:
    - Start with its `README.md`, then read the documents relevant to the change: `decisions/adr/` and `decisions/decisions-in-flight.md` for decisions, `standards/` for security and coding conventions, `runbooks/` for operational procedures, `ways-of-working/` for review checklist and definition of done, `findings.json` for past incident patterns.
    - Respect each document's `status` header. Only `accepted`, `current` and `mandatory` documents are binding. For `superseded by X`, follow X. Do not act on `stale` documents. For a `living document`, check the last-update line.
    - When a meeting note and an ADR disagree, the ADR wins. When two ADRs disagree, follow the later one.
    - In your answer, name the wiki documents (e.g. `ADR-003`, `CONV-002`) that shaped the change.
- **The tech lead:** decisions that are not in the wiki exist only in people's heads. Ask the tech lead before changing an architectural boundary, logging or the deploy setup, and whenever the wiki is silent or contradicts these rules.
