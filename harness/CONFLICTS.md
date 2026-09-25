# Where the tables disagreed

Kept on purpose. A merged constitution that hides its contradictions is a
summary, not a harness. Each entry names the sides and, where the room's
own evidence settles it, the resolution taken in `CONSTITUTION.md`.

## Boy Scout rule versus no drive-by changes

- **koffie:** "Leave touched code a little better (Boy Scout rule), without
  widening scope."
- **theamateurs3, builders, casper:** "Keep the change to the ticket. No
  drive-by refactors, renames or cleanups; list them in the summary."
- **Resolution:** the strict form. Three tables traced review pain to
  drive-bys, and theamateurs3 showed the failure mode of the loose form in
  run 2. koffie's own qualifier ("without widening scope") is compatible
  with it. Improvements go in the summary, not in the diff. (SCOPE-01)

## Scope rule versus mandatory standards

- **theamateurs3, first version:** the scope rule alone made the assistant
  skip the express upgrade that SEC-002 requires (5 of 7).
- **theamateurs3, second version:** "A standard that applies to the files
  you touch is part of the ticket." (7 of 7)
- **Resolution:** the second version, as its own rule (KS-06), so the scope
  rule cannot be read as licence to ignore a standard.

## Dependency updates: automatic or delayed

- **the-amateurs:** automatic dependency updates as a CI guardrail.
- **koffie:** only take a Dependabot fix once its release is at least 48
  hours old.
- **Resolution:** not merged. Both are team choices about supply-chain
  risk versus currency. koffie's is listed as team-specific (TEAM-04).

## When a knowledge source is unreachable

- **casper:** stop, notify, ask permission to continue.
- **builders:** "Jira is not reachable; work from the task as given."
- **Resolution:** casper's for the primary decision source (the wiki);
  builders' is fine for a secondary source the team has consciously written
  off for the evening. KS-04 carries the strict form.

## Ask versus decide when unclear

- **builders:** ask; if nobody can answer, pick the best fit and state it.
- **koffie:** for security mechanisms, never pick a default; stop and ask.
- **Resolution:** both, split by kind. Policy values and security
  mechanisms are never invented (INV-01, INV-02). Everything else follows
  builders (INV-03).

## Merging without review

- **casper:** non-functional changes may be merged without review.
- **theamateurs3:** the assistant does not commit, push or merge unless
  asked.
- **Resolution:** compatible once you read them as different actors. The
  assistant rule is GOV-01; casper's review policy is GOV-02 and TEAM-13.

## Spelling

- **builders:** UK English, `colour`.
- **casper:** English identifiers, Dutch domain terms preserved.
- **Resolution:** compatible. The merged rule says English, preserve domain
  terms, pick one spelling and keep it. The UK variant is TEAM-07; the merged rule is CODE-09.

## What the room did not disagree on

Every table wrote the wiki pointer, and five of six wrote a rule about
secrets. Four tables wrote a version of "reuse the existing helper" and
"check before adding a dependency" from their own incidents, before they
knew the FlowMetrics traps test exactly those. The three tables that wrote
the slide policy down scored the seventh point; the others capped at six.
