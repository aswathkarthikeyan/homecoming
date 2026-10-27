export const MULTICALL3_ABI = [
  { "type": "function", "name": "aggregate3", "inputs": [{ "name": "calls", "type": "tuple[]", "components": [{ "name": "target", "type": "address" }, { "name": "allowFailure", "type": "bool" }, { "name": "callData", "type": "bytes" }] }], "outputs": [{ "name": "returnData", "type": "tuple[]", "components": [{ "name": "success", "type": "bool" }, { "name": "returnData", "type": "bytes" }] }], "stateMutability": "payable" },
  { "type": "function", "name": "getBasefee", "inputs": [], "outputs": [{ "name": "basefee", "type": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "getBlockNumber", "inputs": [], "outputs": [{ "name": "blockNumber", "type": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "getEthBalance", "inputs": [{ "name": "addr", "type": "address" }], "outputs": [{ "name": "balance", "type": "uint256" }], "stateMutability": "view" }
] as const;
