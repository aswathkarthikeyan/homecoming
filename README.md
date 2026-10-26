# Homecoming

Open source engine that finds out why a wallet connect or crypto purchase failed, then brings the user back with a fix that is specific to that failure.

Built by CrypVorex. Licensed under Apache 2.0.

## The problem

Analytics tools show where users leave. Ad tools chase them by audience. Neither tells you why this particular user failed or sends the one fix that would have worked. Most lost mints and purchases never log an error at all: the wallet never opened, the network was wrong, fees spiked, a warning scared the user off.

## How it works

1. **Capture.** A small browser recorder wraps your wallet provider and writes a timeline: connect requested, deep link fired, wallet opened or not, chain switch, signature requested, rejected, reverted.
2. **Diagnose.** Three layers, cheapest first.
   - Rules match hard signatures such as EIP 1193 codes, code 4902 and the common -32002 pending request code.
   - A naive Bayes classifier handles cases the rules miss, with evidence for each prediction.
   - An LLM reads the redacted timeline only when both are unsure. It must pick a cause from a fixed list and cite evidence, and its output is validated.
3. **Recover.** Each cause has a playbook. The Resume Link reopens the exact interrupted step with the fix applied, such as the right chain preselected or a fresh quote. A safety layer can veto any message.
4. **Measure.** A share of recoverable cases is deliberately left alone. Recovered revenue counts only conversions above that holdout baseline.

## Quick start

```
npm install
npm run train
npm test
```

Run the server:

```
cp .env.example .env   # fill in the values
npm start
```

Docker:

```
docker compose up --build
```

Send a failure to the server:

```
curl -X POST http://localhost:8787/v1/cases \
  -H "authorization: Bearer $HOMECOMING_API_KEY" \
  -H "content-type: application/json" \
  -d @examples/case.json
```

See `examples/integration.ts` for the browser side and `examples/resume-page.ts` for the page that handles a Resume Link.

## Choosing a model

The LLM layer is optional and provider agnostic. Set one of:

| Provider | Variables |
| --- | --- |
| Anthropic | `ANTHROPIC_API_KEY`, optional `HOMECOMING_MODEL` (defaults to `claude-haiku-5-5`) |
| Gemini | `GEMINI_API_KEY` and `HOMECOMING_MODEL` (required, check current model names) |
| Local or any OpenAI compatible server | `HOMECOMING_OPENAI_BASE_URL` and `HOMECOMING_MODEL` |

Run a local model if you cannot send data to a hosted API. Only redacted timelines are ever sent: addresses, transaction hashes, emails, handles and URL queries are removed, and contact details are never part of a case.

## Channels

Telegram and Discord bots, plus a generic webhook for email gateways or a CRM. Messages are only sent to contacts with a recorded consent time. Email through a webhook is supported, a native email sender is on the roadmap.

## Safety rules, enforced in code

- Never message a user who simply declined in the wallet.
- Never push a user past a wallet security warning. The only message allowed after one is an educational note, and it is off by default.
- Every message must contain exactly one link, on your verified origin.
- Messages with pressure language, claim language or wallet verification language are blocked.
- Per case and per contact caps, quiet hours, and a stop once the user converts.

## Evaluation

`npm run eval` writes `eval/REPORT.md`. It runs the engine against a seeded simulator of labeled failures. Treat the scores as a regression check, not as accuracy on live traffic. Real accuracy needs your own labeled cases, and the simulator is the place to add the failure patterns you see.

## Repository layout

```
src/sdk          browser recorder
src/diagnosis    rules, classifier, llm reasoner, engine
src/recovery     playbooks, resume links, safety, policy
src/measure      holdout assignment and lift
src/channels     telegram, discord, webhook
src/server       http api, queue, store
eval             simulator, training, report
docs             architecture and taxonomy
```

## Known limits

- One gas oracle RPC URL per server, so gas conditions assume one target chain.
- State is an in memory store with a JSON snapshot. Use a database for high volume.
- The recorder sees only what the wallet reports. Some wallets hide rejection reasons.
- Linking a wallet to a Telegram or Discord handle is personal data. Get explicit consent and follow the data protection rules that apply to you.

See `docs/ARCHITECTURE.md` and `docs/TAXONOMY.md`, and `CONTRIBUTING.md` to add a cause or a playbook.
