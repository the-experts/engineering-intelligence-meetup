# Team constitution: table the/amateurs

This file is your constitution: one part of a harness, the part that says what
always holds and what you learned the hard way.

Score without the constitution: 4 / 7
Score with the constitution:    _ / 7
Traps that flipped and why (one line):

---

## 1. Which parts does a harness for your team need?

- Rules: the checkable conventions in this file
- Knowledge sources: the wiki/docs repo with the team's decisions
- Review gates: a named second approver for risky changes
- CI guardrails: generated OpenAPI docs and automatic dependency updates

## 2. Per part: why does it need to be said, and what do you expect to gain?

### Rules
- Why: the conventions we enforce in review (error handling, module
  boundaries) live in reviewers' heads, not anywhere an assistant reads.
  A mishandled feature flag, a risky dependency and an API contract drift
  all reached review or production before anyone caught them.
- Expected gain: the assistant follows checkable rules on the first pass,
  so review comments shrink and repeats of those three incidents stop.

### Knowledge sources
- Why: decisions live in a wiki/docs repo that the assistant never read,
  so it guessed instead of consulting what the team had already decided.
- Expected gain: the assistant reads and cites the relevant decision
  before changing code; decisions stop being invisible.

### Review gates
- Why: the feature flag and the risky dependency reached review without a
  named approver.
- Expected gain: every risky change (new dependency, feature flag,
  migration) carries a named second approver before merge.

### CI guardrails
- Why: API contract drift was found by people, not by CI; a deprecated
  dependency slipped past review.
- Expected gain: generated OpenAPI docs and dependency updates run on
  every change, so drift is caught by the gate, not by the next incident.

## 3. Which existing tools and services could you already connect or pull into your harness?

- Wiki/docs repo: the assistant reads the team's ADRs, standards and
  runbooks before it changes code.
- CI: the assistant checks which gates exist (OpenAPI doc regeneration,
  dependency updates) and their latest results.

## 4. The one thing you would put in place next week

One sentence. Small enough to actually happen.

Clone the wiki next to the repo and make the assistant read the relevant
decisions there before it changes code.

---

## Rules for the assistant

### Ground rules that always hold

- Handle errors at the boundary they occur. Never swallow an error: no
  empty catch, no silent default.
- Do not call another module directly. Go through its named client or
  adapter.
- Read the relevant wiki from ../flowmetrics-wiki

### Rules learned the hard way

- New dependency, feature flag or migration: name the required second
  approver in the change description before you call the change ready.
  (Origin: a feature flag was mishandled during a release and shipped
  wrong.)
- Before adding a dependency, check the ban list first and say why the
  new one is needed. Do not add deprecated libraries. (Origin: security
  near miss with a risky dependency.)
- If you change an API, regenerate the OpenAPI documentation in the same
  change and never hand-edit the generated output. (Origin: API contract
  drift that CI now catches by regenerating docs.)
- Don't use old or deprecated libraries. (Origin: security near miss with a risky dependency.)

### Knowledge sources

- Our decisions, standards and runbooks live in `../flowmetrics-wiki`.
  Read the relevant ones before you change code, and respect their
  `status` header.
- _Add by hand: any rule announced tonight that is written down nowhere._
