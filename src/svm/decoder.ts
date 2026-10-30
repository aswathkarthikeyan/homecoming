import type { SvmInstructionError } from "./types.js";

export const ANCHOR_FRAMEWORK_ERRORS: Record<
  number,
  { name: string; category: SvmInstructionError["category"]; desc: string; remedy: string }
> = {
  1770: {
    name: "ConstraintSlippage",
    category: "slippage",
    desc: "Slippage tolerance exceeded: output amount fell below the minimum constraint.",
    remedy: "Fetch fresh quote and adjust slippage tolerance by +0.5% to execute.",
  },
  1771: {
    name: "ConstraintFunds",
    category: "funds",
    desc: "Insufficient SOL or SPL token balance to complete this instruction.",
    remedy: "Deposit additional SOL or swap surplus tokens to fund the required balance.",
  },
  1772: {
    name: "ConstraintMint",
    category: "program_error",
    desc: "Token mint account failed validation check against program authority.",
    remedy: "Verify the correct token mint address and retry with valid mint context.",
  },
  2000: {
    name: "InstructionMissing",
    category: "program_error",
    desc: "8-byte instruction discriminator missing from instruction calldata.",
    remedy: "Ensure program instruction arguments are correctly serialized.",
  },
  2003: {
    name: "AccountNotInitialized",
    category: "account_constraint",
    desc: "Associated token account or state PDA has not been initialized on-chain.",
    remedy: "Prepend createAssociatedTokenAccountIdempotent instruction to transaction.",
  },
  3000: {
    name: "AccountOwnedByWrongProgram",
    category: "account_constraint",
    desc: "Account owner does not match expected program ID.",
    remedy: "Verify account ownership before invoking program instruction.",
  },
  3012: {
    name: "AccountNotSigner",
    category: "account_constraint",
    desc: "Required authority did not sign the transaction.",
    remedy: "Request wallet signature for the missing authority public key.",
  },
};

export const WELL_KNOWN_PROGRAMS: Record<string, string> = {
  "11111111111111111111111111111111": "System Program",
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA": "SPL Token Program",
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL": "Associated Token Program",
  "ComputeBudget111111111111111111111111111111": "Compute Budget Program",
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8": "Raydium Liquidity Pool V4",
  "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc": "Orca Whirlpool",
  "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4": "Jupiter V6 Aggregator",
};

/**
 * Decodes Solana SVM instruction logs and Anchor IDL error codes
 * into structured diagnostic recommendations.
 */
export function decodeSvmError(
  rawLogOrCode: string | number,
  programId = "Unknown"
): SvmInstructionError {
  let code: number | null = null;
  let hexDiscriminator: string | undefined = undefined;

  if (typeof rawLogOrCode === "number") {
    code = rawLogOrCode;
  } else {
    // Check for custom program error hex (e.g. "custom program error: 0x1770" or "Error Number: 6000")
    const hexMatch = rawLogOrCode.match(/custom program error:\s*(0x[0-9a-fA-F]+)/i);
    if (hexMatch && hexMatch[1]) {
      hexDiscriminator = hexMatch[1].toLowerCase();
      code = parseInt(hexDiscriminator, 16);
    } else {
      const decMatch = rawLogOrCode.match(/(?:error code|error number|custom program error):\s*(\d+)/i);
      if (decMatch && decMatch[1]) {
        code = parseInt(decMatch[1], 10);
      }
    }

    // Check for compute budget exhaustion
    if (/computebudget.*exceeded|consumed.*compute units/i.test(rawLogOrCode)) {
      return {
        programId: "ComputeBudget111111111111111111111111111111",
        errorCode: 9999,
        errorName: "ComputeBudgetExhausted",
        category: "compute_budget",
        description: "Transaction exceeded maximum allocated compute units (CU).",
        recoverable: true,
        recommendedRemedy: "Increase compute unit limit to 400,000 CU via SetComputeUnitLimit instruction.",
      };
    }
  }

  if (code !== null) {
    const known = ANCHOR_FRAMEWORK_ERRORS[code];
    if (known) {
      return {
        programId,
        errorCode: code,
        hexDiscriminator: hexDiscriminator ?? "0x" + code.toString(16),
        errorName: known.name,
        category: known.category,
        description: known.desc,
        recoverable: true,
        recommendedRemedy: known.remedy,
      };
    }

    // Raydium / Jupiter common slippage errors (typically 6000 or 0x1770)
    if (code === 6000 || code === 0x1770) {
      return {
        programId,
        errorCode: code,
        hexDiscriminator: "0x1770",
        errorName: "SlippageToleranceExceeded",
        category: "slippage",
        description: "DEX pool price moved beyond your slippage boundary.",
        recoverable: true,
        recommendedRemedy: "Refresh pool state and adjust slippage tolerance.",
      };
    }

    return {
      programId,
      errorCode: code,
      hexDiscriminator: "0x" + code.toString(16),
      errorName: `CustomProgramError_${code}`,
      category: "program_error",
      description: `Program reverted with custom error code ${code} (${WELL_KNOWN_PROGRAMS[programId] || programId}).`,
      recoverable: false,
      recommendedRemedy: "Inspect program instructions and simulation traces.",
    };
  }

  return {
    programId,
    errorCode: -1,
    errorName: "UnrecognizedSvmError",
    category: "unknown",
    description: String(rawLogOrCode),
    recoverable: false,
    recommendedRemedy: "Simulate transaction via Solana RPC debug endpoint.",
  };
}
