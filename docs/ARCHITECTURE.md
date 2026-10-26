# Architecture

## Data flow

```
browser recorder -> POST /v1/cases -> engine.diagnose -> planRecovery -> queue -> sender
                                                           |                       |
                                                    holdout or skip         telegram, discord, webhook
user returns via Resume Link -> GET /v1/resume -> your page applies the action
your backend -> POST /v1/outcomes -> GET /v1/report (lift against holdout)
```

## Diagnosis layers

| Layer | Cost | Used when | Output |
| --- | --- | --- | --- |
| Rules | none | A known signature is present and confidence is 0.85 or higher | Cause with evidence |
| Naive Bayes | microseconds | Rules miss and the posterior is 0.75 or higher | Cause, posterior, top features |
| LLM | one API call | Both are unsure | Cause from the taxonomy, evidence, confidence 0.6 or higher to be used |
| Fallback | none | Nothing is confident | `unknown`, never messaged |

All thresholds are options on `createEngine`.

## LLM handling

- The prompt lists the taxonomy and states that case text is untrusted.
- The input is a redacted copy of the case.
- The output must be one JSON object. A cause outside the taxonomy becomes `unknown`.
- Evidence is required. An answer with none is capped at 0.5 confidence.
- The model chooses causes only. Actions come from playbooks, so a manipulated timeline cannot cause an arbitrary action.

## Recovery decision order

1. Already converted, low confidence, user declined, not recoverable, no playbook.
2. Warning abandonment unless education is enabled.
3. Build the Resume Link. It is returned even when no message is sent, to power an onsite banner.
4. Holdout check.
5. Consent, caps.
6. Render the template and run the safety check.
7. Apply the playbook delay and quiet hours. Gas cases carry a condition the queue checks before sending.

## Resume Links

A token holds a version, project id, case id, an action with parameters, and an expiry. It is signed with HMAC SHA 256 and verified in constant time. It never holds a wallet address, a contact or a price, so quotes and gas are always fetched fresh when the user lands.

## Measurement

`isHoldout` hashes the case id with a salt, so assignment needs no storage. `computeLift` compares conversion between treated and holdout cases and reports a 95 percent normal approximation interval. It warns when an arm has fewer than 30 cases.

## Replacing the classifier

`predict(model, case)` returns a `Diagnosis`. Any model with that signature can replace naive Bayes, for example gradient boosted trees trained on your own labeled failures, without touching the engine.
