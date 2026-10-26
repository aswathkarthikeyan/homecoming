# Failure taxonomy

| Cause | Typical signal | Recovery | Messaged |
| --- | --- | --- | --- |
| wallet_not_installed | provider_missing event | Open in a wallet app | Yes |
| deeplink_blocked | deep link fired, wallet never opened | Open native wallet link | Yes |
| request_already_pending | code -32002 | Clear pending request, retry | Yes |
| wrong_network | wallet chain differs from target | Switch chain preselected | Yes |
| chain_not_added | code 4902 on chain switch | Guided add chain | Yes |
| gas_shock | gas at 1.8x baseline or more at exit | Wait for gas below 1.3x baseline | Yes, conditional |
| insufficient_funds | balance check or revert reason | Retry later | Yes |
| slippage_or_quote_expired | revert reason on price or deadline | Fresh quote | Yes |
| sold_out_or_not_eligible | revert reason on supply or allowlist | Eligibility check and next release list | Yes |
| rpc_failure | rpc_error, high latency | Retry after fix | Yes |
| session_timeout | wallet opened, no approval in time | Fresh session | Yes |
| security_warning_abandon | warning then rejection | Educational note only, off by default | Opt in |
| tx_underpriced_or_dropped | fee or nonce error, dropped | Retry with a fitting fee | Yes |
| user_declined | bare 4001, nothing else wrong | None | Never |
| unknown | no supported evidence | None | Never |

Codes come from EIP 1193 (4001, 4100, 4900, 4901), 4902 for an unrecognized chain, and -32002 as used by MetaMask.
