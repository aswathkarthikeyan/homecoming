# Evaluation report

Data: 6000 simulated failures from `eval/simulator.ts` (seed 2026). The classifier was trained on a different seed.
Read this as a regression and consistency check. It says nothing about accuracy on live traffic, which needs real labeled cases.

| Layer | Accuracy | Macro F1 |
| --- | --- | --- |
| Rules only (unmatched counted as unknown) | 85.4% | 86.1% |
| Classifier only | 97.2% | 97.4% |
| Engine (rules, then classifier, no LLM) | 97.0% | 97.5% |

Rules cover 66.9% of cases at confidence 0.85 or higher, and are right on 98.1% of those.

## Per cause, engine

| Cause | Support | Precision | Recall | F1 |
| --- | --- | --- | --- | --- |
| wallet_not_installed | 310 | 100.0% | 100.0% | 100.0% |
| deeplink_blocked | 736 | 97.4% | 100.0% | 98.7% |
| request_already_pending | 268 | 100.0% | 100.0% | 100.0% |
| wrong_network | 654 | 92.0% | 100.0% | 95.8% |
| chain_not_added | 272 | 100.0% | 79.0% | 88.3% |
| gas_shock | 706 | 99.1% | 90.7% | 94.7% |
| insufficient_funds | 427 | 100.0% | 91.6% | 95.6% |
| slippage_or_quote_expired | 357 | 100.0% | 100.0% | 100.0% |
| sold_out_or_not_eligible | 285 | 100.0% | 100.0% | 100.0% |
| rpc_failure | 252 | 100.0% | 100.0% | 100.0% |
| session_timeout | 414 | 100.0% | 95.2% | 97.5% |
| security_warning_abandon | 212 | 98.6% | 100.0% | 99.3% |
| tx_underpriced_or_dropped | 201 | 99.5% | 100.0% | 99.8% |
| user_declined | 664 | 87.8% | 100.0% | 93.5% |
| unknown | 242 | 100.0% | 100.0% | 100.0% |
