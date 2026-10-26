// The page at /resume on your site. It asks the server what to do, then applies the action.
const token = new URL(location.href).searchParams.get("t") ?? "";
const res = await fetch(`https://recover.example.xyz/v1/resume?t=${encodeURIComponent(token)}`);
const out = await res.json();

if (!out.ok) {
  // expired or tampered link: show the normal purchase page
  location.replace("/");
} else {
  switch (out.action.type) {
    case "switch_chain": /* call wallet_switchEthereumChain with out.action.params.chainId, then continue */ break;
    case "refresh_quote": /* fetch a new quote and show the price for review before signing */ break;
    case "lower_gas_retry": /* fetch a fresh fee estimate and re-open the purchase step */ break;
    case "open_native_wallet": /* open the wallet app deep link for this step */ break;
    case "notify_when_available": /* show eligibility and the next release list */ break;
    case "explain_warning": /* show the educational page, never a push to sign */ break;
    default: /* retry the interrupted step */ break;
  }
}
export {};
