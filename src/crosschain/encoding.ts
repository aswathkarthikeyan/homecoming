/**
 * Pure TypeScript Ethereum Keccak-256 and ABI Calldata Encoder.
 * Zero external dependencies. Encodes Across V3, CCTP, and ERC-20 calls.
 */

const RC = [
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
  0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
  0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
  0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
  0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
  0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
];

const RHO = [
  [0, 36, 3, 41, 18],
  [1, 44, 10, 45, 2],
  [62, 6, 43, 15, 61],
  [28, 55, 25, 21, 56],
  [27, 20, 39, 8, 14],
];

export function keccak256(str: string): string {
  const buf = Buffer.from(str, "utf8");
  const rate = 136; // 1088 bits / 8 for keccak-256
  const padLen = rate - (buf.length % rate);
  const padded = Buffer.alloc(buf.length + padLen);
  buf.copy(padded);
  if (padLen === 1) {
    padded[buf.length] = 0x81;
  } else {
    padded[buf.length] = 0x01; // Keccak-256 standard padding (0x01 ... 0x80)
    padded[padded.length - 1] = 0x80;
  }

  const state = Array.from({ length: 5 }, () => new BigUint64Array(5));
  for (let b = 0; b < padded.length; b += rate) {
    for (let i = 0; i < rate / 8; i++) {
      const x = i % 5;
      const y = Math.floor(i / 5);
      state[x]![y]! ^= padded.readBigUInt64LE(b + i * 8);
    }

    for (let round = 0; round < 24; round++) {
      // Theta
      const C = new BigUint64Array(5);
      for (let x = 0; x < 5; x++) {
        C[x] = state[x]![0]! ^ state[x]![1]! ^ state[x]![2]! ^ state[x]![3]! ^ state[x]![4]!;
      }
      const D = new BigUint64Array(5);
      for (let x = 0; x < 5; x++) {
        const left = C[(x + 1) % 5]!;
        const rot = (left << 1n) | (left >> 63n);
        D[x] = C[(x + 4) % 5]! ^ rot;
      }
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
          state[x]![y]! ^= D[x]!;
        }
      }
      // Rho and Pi
      const B = Array.from({ length: 5 }, () => new BigUint64Array(5));
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
          const shift = BigInt(RHO[x]![y]!);
          const val = state[x]![y]!;
          B[y]![(2 * x + 3 * y) % 5] = (val << shift) | (val >> (64n - shift));
        }
      }
      // Chi
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
          state[x]![y] = B[x]![y]! ^ ((~B[(x + 1) % 5]![y]!) & B[(x + 2) % 5]![y]!);
        }
      }
      // Iota
      state[0]![0]! ^= RC[round]!;
    }
  }

  const out = Buffer.alloc(32);
  for (let i = 0; i < 4; i++) {
    const x = i % 5;
    const y = Math.floor(i / 5);
    out.writeBigUInt64LE(state[x]![y]!, i * 8);
  }
  return `0x${out.toString("hex")}`;
}

export function padAddress(addr: string): string {
  const clean = addr.toLowerCase().replace(/^0x/, "");
  return clean.padStart(64, "0");
}

export function padUint256(val: bigint | number | string): string {
  const hex = BigInt(val).toString(16);
  return hex.padStart(64, "0");
}

/**
 * Encodes Across Protocol v3 SpokePool depositV3 calldata.
 */
export function encodeAcrossDepositV3(params: {
  depositor: string;
  recipient: string;
  inputToken: string;
  outputToken: string;
  inputAmount: bigint;
  outputAmount: bigint;
  destinationChainId: number;
  exclusiveRelayer?: string;
  quoteTimestamp?: number;
  fillDeadline?: number;
  exclusivityDeadline?: number;
  message?: string;
}): string {
  const selector = "0x7b939232"; // depositV3 selector
  const relayer = params.exclusiveRelayer ?? "0x0000000000000000000000000000000000000000";
  const nowSec = Math.floor(Date.now() / 1000);
  const quoteTimestamp = params.quoteTimestamp ?? nowSec;
  const fillDeadline = params.fillDeadline ?? nowSec + 3600; // 1 hr fill deadline
  const exclusivityDeadline = params.exclusivityDeadline ?? 0;
  const msgBytes = params.message ? Buffer.from(params.message.replace(/^0x/, ""), "hex") : Buffer.alloc(0);

  // 12 arguments total: 11 static (each 32 bytes) + 1 dynamic bytes offset (32 bytes) = 12 * 32 = 384 bytes
  const bytesOffset = 12 * 32;

  const staticParts = [
    padAddress(params.depositor),
    padAddress(params.recipient),
    padAddress(params.inputToken),
    padAddress(params.outputToken),
    padUint256(params.inputAmount),
    padUint256(params.outputAmount),
    padUint256(params.destinationChainId),
    padAddress(relayer),
    padUint256(quoteTimestamp),
    padUint256(fillDeadline),
    padUint256(exclusivityDeadline),
    padUint256(bytesOffset),
  ];

  // Dynamic part: length (32 bytes) + padded bytes
  const msgLenPadded = padUint256(msgBytes.length);
  const padRemainder = (32 - (msgBytes.length % 32)) % 32;
  const msgHexPadded = msgBytes.toString("hex").padEnd((msgBytes.length + padRemainder) * 2, "0");

  return `${selector}${staticParts.join("")}${msgLenPadded}${msgHexPadded}`;
}

export function encodeErc20Approve(spender: string, amount: bigint): string {
  return `0x095ea7b3${padAddress(spender)}${padUint256(amount)}`;
}

export function encodeErc20Transfer(to: string, amount: bigint): string {
  return `0xa9059cbb${padAddress(to)}${padUint256(amount)}`;
}
