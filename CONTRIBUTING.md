# Contributing

## Add a failure cause

1. Add the id to `CauseId` in `src/types.ts` and an entry in `src/taxonomy.ts`.
2. Add a rule in `src/diagnosis/rules.ts` if there is a hard signature.
3. Add a generator for it in `eval/simulator.ts`, run `npm run train` and `npm run eval`.
4. Add a playbook in `src/recovery/playbooks.ts`. Its template must pass `checkMessage`; a test enforces this.
5. Add tests, then run `npm test` and `npm run typecheck`.

## Rules for playbook text

Plain and calm. One link on the verified origin. No urgency, no claim language, no request to sign or approve, and never any mention of keys or phrases.

## Adding real data

Labeled real failures are the most valuable contribution. Remove addresses, hashes and handles first.

## Security

Report vulnerabilities privately to the maintainers, not in a public issue.
