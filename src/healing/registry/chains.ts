import type { DetailedChain } from "./types.js";

export const REGISTERED_CHAINS: DetailedChain[] = [
  {
    id: 1,
    name: "Ethereum Mainnet",
    network: "homestead",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://eth.llamarpc.com", "https://rpc.ankr.com/eth", "https://cloudflare-eth.com"] },
      public: { http: ["https://eth.llamarpc.com", "https://rpc.ankr.com/eth", "https://cloudflare-eth.com"] },
    },
    blockExplorers: {
      default: { name: "Ethereum Mainnet Explorer", url: "https://etherscan.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 11155111,
    name: "Sepolia Testnet",
    network: "sepolia",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.sepolia.org", "https://eth-sepolia.public.blastapi.io"] },
      public: { http: ["https://rpc.sepolia.org", "https://eth-sepolia.public.blastapi.io"] },
    },
    blockExplorers: {
      default: { name: "Sepolia Testnet Explorer", url: "https://sepolia.etherscan.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 17000,
    name: "Holesky Testnet",
    network: "holesky",
    nativeCurrency: {
      name: "Holesky Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://ethereum-holesky.publicnode.com"] },
      public: { http: ["https://ethereum-holesky.publicnode.com"] },
    },
    blockExplorers: {
      default: { name: "Holesky Testnet Explorer", url: "https://holesky.etherscan.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 8453,
    name: "Base",
    network: "base",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://mainnet.base.org", "https://base.llamarpc.com"] },
      public: { http: ["https://mainnet.base.org", "https://base.llamarpc.com"] },
    },
    blockExplorers: {
      default: { name: "Base Explorer", url: "https://basescan.org" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 84532,
    name: "Base Sepolia",
    network: "base-sepolia",
    nativeCurrency: {
      name: "Base Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://sepolia.base.org"] },
      public: { http: ["https://sepolia.base.org"] },
    },
    blockExplorers: {
      default: { name: "Base Sepolia Explorer", url: "https://sepolia.basescan.org" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 42161,
    name: "Arbitrum One",
    network: "arbitrum",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://arb1.arbitrum.io/rpc", "https://arbitrum.llamarpc.com"] },
      public: { http: ["https://arb1.arbitrum.io/rpc", "https://arbitrum.llamarpc.com"] },
    },
    blockExplorers: {
      default: { name: "Arbitrum One Explorer", url: "https://arbiscan.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 42170,
    name: "Arbitrum Nova",
    network: "arbitrum-nova",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://nova.arbitrum.io/rpc"] },
      public: { http: ["https://nova.arbitrum.io/rpc"] },
    },
    blockExplorers: {
      default: { name: "Arbitrum Nova Explorer", url: "https://nova.arbiscan.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 421614,
    name: "Arbitrum Sepolia",
    network: "arbitrum-sepolia",
    nativeCurrency: {
      name: "Arbitrum Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://sepolia-rollup.arbitrum.io/rpc"] },
      public: { http: ["https://sepolia-rollup.arbitrum.io/rpc"] },
    },
    blockExplorers: {
      default: { name: "Arbitrum Sepolia Explorer", url: "https://sepolia.arbiscan.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 10,
    name: "OP Mainnet",
    network: "optimism",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://mainnet.optimism.io", "https://optimism.llamarpc.com"] },
      public: { http: ["https://mainnet.optimism.io", "https://optimism.llamarpc.com"] },
    },
    blockExplorers: {
      default: { name: "OP Mainnet Explorer", url: "https://optimistic.etherscan.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 11155420,
    name: "OP Sepolia",
    network: "optimism-sepolia",
    nativeCurrency: {
      name: "OP Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://sepolia.optimism.io"] },
      public: { http: ["https://sepolia.optimism.io"] },
    },
    blockExplorers: {
      default: { name: "OP Sepolia Explorer", url: "https://sepolia-optimism.etherscan.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 137,
    name: "Polygon Mainnet",
    network: "polygon",
    nativeCurrency: {
      name: "Polygon Ecosystem Token",
      symbol: "POL",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://polygon-rpc.com", "https://polygon.llamarpc.com"] },
      public: { http: ["https://polygon-rpc.com", "https://polygon.llamarpc.com"] },
    },
    blockExplorers: {
      default: { name: "Polygon Mainnet Explorer", url: "https://polygonscan.com" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 80002,
    name: "Polygon Amoy Testnet",
    network: "polygon-amoy",
    nativeCurrency: {
      name: "Amoy POL",
      symbol: "POL",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc-amoy.polygon.technology"] },
      public: { http: ["https://rpc-amoy.polygon.technology"] },
    },
    blockExplorers: {
      default: { name: "Polygon Amoy Testnet Explorer", url: "https://amoy.polygonscan.com" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 1101,
    name: "Polygon zkEVM",
    network: "polygon-zkevm",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://zkevm-rpc.com"] },
      public: { http: ["https://zkevm-rpc.com"] },
    },
    blockExplorers: {
      default: { name: "Polygon zkEVM Explorer", url: "https://zkevm.polygonscan.com" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: false,
  },
  {
    id: 56,
    name: "BNB Smart Chain",
    network: "bsc",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://bsc-dataseed.binance.org", "https://binance.llamarpc.com"] },
      public: { http: ["https://bsc-dataseed.binance.org", "https://binance.llamarpc.com"] },
    },
    blockExplorers: {
      default: { name: "BNB Smart Chain Explorer", url: "https://bscscan.com" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: false,
  },
  {
    id: 97,
    name: "BNB Smart Chain Testnet",
    network: "bsc-testnet",
    nativeCurrency: {
      name: "Testnet BNB",
      symbol: "tBNB",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://data-seed-prebsc-1-s1.binance.org:8545"] },
      public: { http: ["https://data-seed-prebsc-1-s1.binance.org:8545"] },
    },
    blockExplorers: {
      default: { name: "BNB Smart Chain Testnet Explorer", url: "https://testnet.bscscan.com" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: false,
  },
  {
    id: 204,
    name: "opBNB Mainnet",
    network: "opbnb",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://opbnb-mainnet-rpc.bnbchain.org"] },
      public: { http: ["https://opbnb-mainnet-rpc.bnbchain.org"] },
    },
    blockExplorers: {
      default: { name: "opBNB Mainnet Explorer", url: "https://opbnbscan.com" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 43114,
    name: "Avalanche C-Chain",
    network: "avalanche",
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://api.avax.network/ext/bc/C/rpc"] },
      public: { http: ["https://api.avax.network/ext/bc/C/rpc"] },
    },
    blockExplorers: {
      default: { name: "Avalanche C-Chain Explorer", url: "https://snowtrace.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 43113,
    name: "Avalanche Fuji Testnet",
    network: "avalanche-fuji",
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://api.avax-test.network/ext/bc/C/rpc"] },
      public: { http: ["https://api.avax-test.network/ext/bc/C/rpc"] },
    },
    blockExplorers: {
      default: { name: "Avalanche Fuji Testnet Explorer", url: "https://testnet.snowtrace.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 324,
    name: "ZKsync Era",
    network: "zksync",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://mainnet.era.zksync.io"] },
      public: { http: ["https://mainnet.era.zksync.io"] },
    },
    blockExplorers: {
      default: { name: "ZKsync Era Explorer", url: "https://explorer.zksync.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 300,
    name: "ZKsync Sepolia Testnet",
    network: "zksync-sepolia",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://sepolia.era.zksync.io"] },
      public: { http: ["https://sepolia.era.zksync.io"] },
    },
    blockExplorers: {
      default: { name: "ZKsync Sepolia Testnet Explorer", url: "https://sepolia.explorer.zksync.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 59144,
    name: "Linea",
    network: "linea",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.linea.build"] },
      public: { http: ["https://rpc.linea.build"] },
    },
    blockExplorers: {
      default: { name: "Linea Explorer", url: "https://lineascan.build" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 59141,
    name: "Linea Sepolia",
    network: "linea-sepolia",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.sepolia.linea.build"] },
      public: { http: ["https://rpc.sepolia.linea.build"] },
    },
    blockExplorers: {
      default: { name: "Linea Sepolia Explorer", url: "https://sepolia.lineascan.build" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 534352,
    name: "Scroll",
    network: "scroll",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.scroll.io"] },
      public: { http: ["https://rpc.scroll.io"] },
    },
    blockExplorers: {
      default: { name: "Scroll Explorer", url: "https://scrollscan.com" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 534351,
    name: "Scroll Sepolia",
    network: "scroll-sepolia",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://sepolia-rpc.scroll.io"] },
      public: { http: ["https://sepolia-rpc.scroll.io"] },
    },
    blockExplorers: {
      default: { name: "Scroll Sepolia Explorer", url: "https://sepolia.scrollscan.com" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 5000,
    name: "Mantle",
    network: "mantle",
    nativeCurrency: {
      name: "Mantle",
      symbol: "MNT",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.mantle.xyz"] },
      public: { http: ["https://rpc.mantle.xyz"] },
    },
    blockExplorers: {
      default: { name: "Mantle Explorer", url: "https://mantlescan.xyz" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 81457,
    name: "Blast",
    network: "blast",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.blast.io"] },
      public: { http: ["https://rpc.blast.io"] },
    },
    blockExplorers: {
      default: { name: "Blast Explorer", url: "https://blastscan.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 100,
    name: "Gnosis",
    network: "gnosis",
    nativeCurrency: {
      name: "xDAI",
      symbol: "xDAI",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.gnosischain.com"] },
      public: { http: ["https://rpc.gnosischain.com"] },
    },
    blockExplorers: {
      default: { name: "Gnosis Explorer", url: "https://gnosisscan.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 42220,
    name: "Celo",
    network: "celo",
    nativeCurrency: {
      name: "Celo",
      symbol: "CELO",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://forno.celo.org"] },
      public: { http: ["https://forno.celo.org"] },
    },
    blockExplorers: {
      default: { name: "Celo Explorer", url: "https://celoscan.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 250,
    name: "Fantom Opera",
    network: "fantom",
    nativeCurrency: {
      name: "Fantom",
      symbol: "FTM",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.ftm.tools"] },
      public: { http: ["https://rpc.ftm.tools"] },
    },
    blockExplorers: {
      default: { name: "Fantom Opera Explorer", url: "https://ftmscan.com" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 146,
    name: "Sonic Mainnet",
    network: "sonic",
    nativeCurrency: {
      name: "Sonic",
      symbol: "S",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.soniclabs.com"] },
      public: { http: ["https://rpc.soniclabs.com"] },
    },
    blockExplorers: {
      default: { name: "Sonic Mainnet Explorer", url: "https://sonicscan.org" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 1284,
    name: "Moonbeam",
    network: "moonbeam",
    nativeCurrency: {
      name: "Glimmer",
      symbol: "GLMR",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.api.moonbeam.network"] },
      public: { http: ["https://rpc.api.moonbeam.network"] },
    },
    blockExplorers: {
      default: { name: "Moonbeam Explorer", url: "https://moonscan.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 1285,
    name: "Moonriver",
    network: "moonriver",
    nativeCurrency: {
      name: "Moonriver",
      symbol: "MOVR",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.api.moonriver.moonbeam.network"] },
      public: { http: ["https://rpc.api.moonriver.moonbeam.network"] },
    },
    blockExplorers: {
      default: { name: "Moonriver Explorer", url: "https://moonriver.moonscan.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 1313161554,
    name: "Aurora",
    network: "aurora",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://mainnet.aurora.dev"] },
      public: { http: ["https://mainnet.aurora.dev"] },
    },
    blockExplorers: {
      default: { name: "Aurora Explorer", url: "https://aurorascan.dev" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 25,
    name: "Cronos Mainnet",
    network: "cronos",
    nativeCurrency: {
      name: "Cronos",
      symbol: "CRO",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://evm.cronos.org"] },
      public: { http: ["https://evm.cronos.org"] },
    },
    blockExplorers: {
      default: { name: "Cronos Mainnet Explorer", url: "https://cronoscan.com" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 2222,
    name: "Kava EVM",
    network: "kava",
    nativeCurrency: {
      name: "Kava",
      symbol: "KAVA",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://evm.kava.io"] },
      public: { http: ["https://evm.kava.io"] },
    },
    blockExplorers: {
      default: { name: "Kava EVM Explorer", url: "https://kavascan.com" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 1088,
    name: "Metis Andromeda",
    network: "metis",
    nativeCurrency: {
      name: "Metis",
      symbol: "METIS",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://andromeda.metis.io/?owner=1088"] },
      public: { http: ["https://andromeda.metis.io/?owner=1088"] },
    },
    blockExplorers: {
      default: { name: "Metis Andromeda Explorer", url: "https://andromeda-explorer.metis.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 288,
    name: "Boba Network",
    network: "boba",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://mainnet.boba.network"] },
      public: { http: ["https://mainnet.boba.network"] },
    },
    blockExplorers: {
      default: { name: "Boba Network Explorer", url: "https://bobascan.com" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 167000,
    name: "Taiko Mainnet",
    network: "taiko",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.taiko.xyz"] },
      public: { http: ["https://rpc.taiko.xyz"] },
    },
    blockExplorers: {
      default: { name: "Taiko Mainnet Explorer", url: "https://taikoscan.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 34443,
    name: "Mode",
    network: "mode",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://mainnet.mode.network"] },
      public: { http: ["https://mainnet.mode.network"] },
    },
    blockExplorers: {
      default: { name: "Mode Explorer", url: "https://modescan.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 1329,
    name: "Sei Network",
    network: "sei",
    nativeCurrency: {
      name: "Sei",
      symbol: "SEI",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://evm-rpc.sei-apis.com"] },
      public: { http: ["https://evm-rpc.sei-apis.com"] },
    },
    blockExplorers: {
      default: { name: "Sei Network Explorer", url: "https://seitrace.com" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 7777777,
    name: "Zora",
    network: "zora",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.zora.energy"] },
      public: { http: ["https://rpc.zora.energy"] },
    },
    blockExplorers: {
      default: { name: "Zora Explorer", url: "https://explorer.zora.energy" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 666666666,
    name: "Degen Chain",
    network: "degen",
    nativeCurrency: {
      name: "Degen",
      symbol: "DEGEN",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.degen.tips"] },
      public: { http: ["https://rpc.degen.tips"] },
    },
    blockExplorers: {
      default: { name: "Degen Chain Explorer", url: "https://explorer.degen.tips" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 252,
    name: "Fraxtal",
    network: "fraxtal",
    nativeCurrency: {
      name: "Frax Ether",
      symbol: "frxETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.frax.com"] },
      public: { http: ["https://rpc.frax.com"] },
    },
    blockExplorers: {
      default: { name: "Fraxtal Explorer", url: "https://fraxscan.com" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 80084,
    name: "Berachain bArtio",
    network: "berachain-bartio",
    nativeCurrency: {
      name: "Bera",
      symbol: "BERA",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://bartio.rpc.berachain.com"] },
      public: { http: ["https://bartio.rpc.berachain.com"] },
    },
    blockExplorers: {
      default: { name: "Berachain bArtio Explorer", url: "https://bartio.beratrail.io" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 10143,
    name: "Monad Testnet",
    network: "monad-testnet",
    nativeCurrency: {
      name: "Monad",
      symbol: "MON",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://testnet-rpc.monad.xyz"] },
      public: { http: ["https://testnet-rpc.monad.xyz"] },
    },
    blockExplorers: {
      default: { name: "Monad Testnet Explorer", url: "https://testnet.monadexplorer.com" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900001,
    name: "Enterprise Subnet 1",
    network: "subnet-1",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-1.internal.net"] },
      public: { http: ["https://rpc.subnet-1.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 1 Explorer", url: "https://explorer.subnet-1.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900002,
    name: "Enterprise Subnet 2",
    network: "subnet-2",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-2.internal.net"] },
      public: { http: ["https://rpc.subnet-2.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 2 Explorer", url: "https://explorer.subnet-2.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900003,
    name: "Enterprise Subnet 3",
    network: "subnet-3",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-3.internal.net"] },
      public: { http: ["https://rpc.subnet-3.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 3 Explorer", url: "https://explorer.subnet-3.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900004,
    name: "Enterprise Subnet 4",
    network: "subnet-4",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-4.internal.net"] },
      public: { http: ["https://rpc.subnet-4.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 4 Explorer", url: "https://explorer.subnet-4.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900005,
    name: "Enterprise Subnet 5",
    network: "subnet-5",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-5.internal.net"] },
      public: { http: ["https://rpc.subnet-5.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 5 Explorer", url: "https://explorer.subnet-5.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900006,
    name: "Enterprise Subnet 6",
    network: "subnet-6",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-6.internal.net"] },
      public: { http: ["https://rpc.subnet-6.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 6 Explorer", url: "https://explorer.subnet-6.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900007,
    name: "Enterprise Subnet 7",
    network: "subnet-7",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-7.internal.net"] },
      public: { http: ["https://rpc.subnet-7.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 7 Explorer", url: "https://explorer.subnet-7.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900008,
    name: "Enterprise Subnet 8",
    network: "subnet-8",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-8.internal.net"] },
      public: { http: ["https://rpc.subnet-8.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 8 Explorer", url: "https://explorer.subnet-8.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900009,
    name: "Enterprise Subnet 9",
    network: "subnet-9",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-9.internal.net"] },
      public: { http: ["https://rpc.subnet-9.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 9 Explorer", url: "https://explorer.subnet-9.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900010,
    name: "Enterprise Subnet 10",
    network: "subnet-10",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-10.internal.net"] },
      public: { http: ["https://rpc.subnet-10.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 10 Explorer", url: "https://explorer.subnet-10.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900011,
    name: "Enterprise Subnet 11",
    network: "subnet-11",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-11.internal.net"] },
      public: { http: ["https://rpc.subnet-11.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 11 Explorer", url: "https://explorer.subnet-11.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900012,
    name: "Enterprise Subnet 12",
    network: "subnet-12",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-12.internal.net"] },
      public: { http: ["https://rpc.subnet-12.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 12 Explorer", url: "https://explorer.subnet-12.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900013,
    name: "Enterprise Subnet 13",
    network: "subnet-13",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-13.internal.net"] },
      public: { http: ["https://rpc.subnet-13.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 13 Explorer", url: "https://explorer.subnet-13.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900014,
    name: "Enterprise Subnet 14",
    network: "subnet-14",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-14.internal.net"] },
      public: { http: ["https://rpc.subnet-14.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 14 Explorer", url: "https://explorer.subnet-14.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900015,
    name: "Enterprise Subnet 15",
    network: "subnet-15",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-15.internal.net"] },
      public: { http: ["https://rpc.subnet-15.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 15 Explorer", url: "https://explorer.subnet-15.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900016,
    name: "Enterprise Subnet 16",
    network: "subnet-16",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-16.internal.net"] },
      public: { http: ["https://rpc.subnet-16.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 16 Explorer", url: "https://explorer.subnet-16.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900017,
    name: "Enterprise Subnet 17",
    network: "subnet-17",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-17.internal.net"] },
      public: { http: ["https://rpc.subnet-17.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 17 Explorer", url: "https://explorer.subnet-17.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900018,
    name: "Enterprise Subnet 18",
    network: "subnet-18",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-18.internal.net"] },
      public: { http: ["https://rpc.subnet-18.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 18 Explorer", url: "https://explorer.subnet-18.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900019,
    name: "Enterprise Subnet 19",
    network: "subnet-19",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-19.internal.net"] },
      public: { http: ["https://rpc.subnet-19.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 19 Explorer", url: "https://explorer.subnet-19.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900020,
    name: "Enterprise Subnet 20",
    network: "subnet-20",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-20.internal.net"] },
      public: { http: ["https://rpc.subnet-20.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 20 Explorer", url: "https://explorer.subnet-20.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900021,
    name: "Enterprise Subnet 21",
    network: "subnet-21",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-21.internal.net"] },
      public: { http: ["https://rpc.subnet-21.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 21 Explorer", url: "https://explorer.subnet-21.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900022,
    name: "Enterprise Subnet 22",
    network: "subnet-22",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-22.internal.net"] },
      public: { http: ["https://rpc.subnet-22.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 22 Explorer", url: "https://explorer.subnet-22.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900023,
    name: "Enterprise Subnet 23",
    network: "subnet-23",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-23.internal.net"] },
      public: { http: ["https://rpc.subnet-23.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 23 Explorer", url: "https://explorer.subnet-23.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900024,
    name: "Enterprise Subnet 24",
    network: "subnet-24",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-24.internal.net"] },
      public: { http: ["https://rpc.subnet-24.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 24 Explorer", url: "https://explorer.subnet-24.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900025,
    name: "Enterprise Subnet 25",
    network: "subnet-25",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-25.internal.net"] },
      public: { http: ["https://rpc.subnet-25.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 25 Explorer", url: "https://explorer.subnet-25.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900026,
    name: "Enterprise Subnet 26",
    network: "subnet-26",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-26.internal.net"] },
      public: { http: ["https://rpc.subnet-26.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 26 Explorer", url: "https://explorer.subnet-26.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900027,
    name: "Enterprise Subnet 27",
    network: "subnet-27",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-27.internal.net"] },
      public: { http: ["https://rpc.subnet-27.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 27 Explorer", url: "https://explorer.subnet-27.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900028,
    name: "Enterprise Subnet 28",
    network: "subnet-28",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-28.internal.net"] },
      public: { http: ["https://rpc.subnet-28.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 28 Explorer", url: "https://explorer.subnet-28.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900029,
    name: "Enterprise Subnet 29",
    network: "subnet-29",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-29.internal.net"] },
      public: { http: ["https://rpc.subnet-29.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 29 Explorer", url: "https://explorer.subnet-29.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900030,
    name: "Enterprise Subnet 30",
    network: "subnet-30",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-30.internal.net"] },
      public: { http: ["https://rpc.subnet-30.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 30 Explorer", url: "https://explorer.subnet-30.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900031,
    name: "Enterprise Subnet 31",
    network: "subnet-31",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-31.internal.net"] },
      public: { http: ["https://rpc.subnet-31.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 31 Explorer", url: "https://explorer.subnet-31.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900032,
    name: "Enterprise Subnet 32",
    network: "subnet-32",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-32.internal.net"] },
      public: { http: ["https://rpc.subnet-32.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 32 Explorer", url: "https://explorer.subnet-32.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900033,
    name: "Enterprise Subnet 33",
    network: "subnet-33",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-33.internal.net"] },
      public: { http: ["https://rpc.subnet-33.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 33 Explorer", url: "https://explorer.subnet-33.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900034,
    name: "Enterprise Subnet 34",
    network: "subnet-34",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-34.internal.net"] },
      public: { http: ["https://rpc.subnet-34.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 34 Explorer", url: "https://explorer.subnet-34.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900035,
    name: "Enterprise Subnet 35",
    network: "subnet-35",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-35.internal.net"] },
      public: { http: ["https://rpc.subnet-35.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 35 Explorer", url: "https://explorer.subnet-35.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900036,
    name: "Enterprise Subnet 36",
    network: "subnet-36",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-36.internal.net"] },
      public: { http: ["https://rpc.subnet-36.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 36 Explorer", url: "https://explorer.subnet-36.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900037,
    name: "Enterprise Subnet 37",
    network: "subnet-37",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-37.internal.net"] },
      public: { http: ["https://rpc.subnet-37.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 37 Explorer", url: "https://explorer.subnet-37.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900038,
    name: "Enterprise Subnet 38",
    network: "subnet-38",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-38.internal.net"] },
      public: { http: ["https://rpc.subnet-38.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 38 Explorer", url: "https://explorer.subnet-38.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900039,
    name: "Enterprise Subnet 39",
    network: "subnet-39",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-39.internal.net"] },
      public: { http: ["https://rpc.subnet-39.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 39 Explorer", url: "https://explorer.subnet-39.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900040,
    name: "Enterprise Subnet 40",
    network: "subnet-40",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-40.internal.net"] },
      public: { http: ["https://rpc.subnet-40.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 40 Explorer", url: "https://explorer.subnet-40.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900041,
    name: "Enterprise Subnet 41",
    network: "subnet-41",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-41.internal.net"] },
      public: { http: ["https://rpc.subnet-41.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 41 Explorer", url: "https://explorer.subnet-41.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900042,
    name: "Enterprise Subnet 42",
    network: "subnet-42",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-42.internal.net"] },
      public: { http: ["https://rpc.subnet-42.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 42 Explorer", url: "https://explorer.subnet-42.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900043,
    name: "Enterprise Subnet 43",
    network: "subnet-43",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-43.internal.net"] },
      public: { http: ["https://rpc.subnet-43.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 43 Explorer", url: "https://explorer.subnet-43.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900044,
    name: "Enterprise Subnet 44",
    network: "subnet-44",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-44.internal.net"] },
      public: { http: ["https://rpc.subnet-44.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 44 Explorer", url: "https://explorer.subnet-44.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900045,
    name: "Enterprise Subnet 45",
    network: "subnet-45",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-45.internal.net"] },
      public: { http: ["https://rpc.subnet-45.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 45 Explorer", url: "https://explorer.subnet-45.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900046,
    name: "Enterprise Subnet 46",
    network: "subnet-46",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-46.internal.net"] },
      public: { http: ["https://rpc.subnet-46.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 46 Explorer", url: "https://explorer.subnet-46.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900047,
    name: "Enterprise Subnet 47",
    network: "subnet-47",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-47.internal.net"] },
      public: { http: ["https://rpc.subnet-47.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 47 Explorer", url: "https://explorer.subnet-47.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900048,
    name: "Enterprise Subnet 48",
    network: "subnet-48",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-48.internal.net"] },
      public: { http: ["https://rpc.subnet-48.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 48 Explorer", url: "https://explorer.subnet-48.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900049,
    name: "Enterprise Subnet 49",
    network: "subnet-49",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-49.internal.net"] },
      public: { http: ["https://rpc.subnet-49.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 49 Explorer", url: "https://explorer.subnet-49.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900050,
    name: "Enterprise Subnet 50",
    network: "subnet-50",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-50.internal.net"] },
      public: { http: ["https://rpc.subnet-50.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 50 Explorer", url: "https://explorer.subnet-50.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900051,
    name: "Enterprise Subnet 51",
    network: "subnet-51",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-51.internal.net"] },
      public: { http: ["https://rpc.subnet-51.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 51 Explorer", url: "https://explorer.subnet-51.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900052,
    name: "Enterprise Subnet 52",
    network: "subnet-52",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-52.internal.net"] },
      public: { http: ["https://rpc.subnet-52.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 52 Explorer", url: "https://explorer.subnet-52.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900053,
    name: "Enterprise Subnet 53",
    network: "subnet-53",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-53.internal.net"] },
      public: { http: ["https://rpc.subnet-53.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 53 Explorer", url: "https://explorer.subnet-53.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900054,
    name: "Enterprise Subnet 54",
    network: "subnet-54",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-54.internal.net"] },
      public: { http: ["https://rpc.subnet-54.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 54 Explorer", url: "https://explorer.subnet-54.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900055,
    name: "Enterprise Subnet 55",
    network: "subnet-55",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-55.internal.net"] },
      public: { http: ["https://rpc.subnet-55.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 55 Explorer", url: "https://explorer.subnet-55.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900056,
    name: "Enterprise Subnet 56",
    network: "subnet-56",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-56.internal.net"] },
      public: { http: ["https://rpc.subnet-56.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 56 Explorer", url: "https://explorer.subnet-56.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900057,
    name: "Enterprise Subnet 57",
    network: "subnet-57",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-57.internal.net"] },
      public: { http: ["https://rpc.subnet-57.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 57 Explorer", url: "https://explorer.subnet-57.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900058,
    name: "Enterprise Subnet 58",
    network: "subnet-58",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-58.internal.net"] },
      public: { http: ["https://rpc.subnet-58.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 58 Explorer", url: "https://explorer.subnet-58.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900059,
    name: "Enterprise Subnet 59",
    network: "subnet-59",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-59.internal.net"] },
      public: { http: ["https://rpc.subnet-59.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 59 Explorer", url: "https://explorer.subnet-59.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900060,
    name: "Enterprise Subnet 60",
    network: "subnet-60",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-60.internal.net"] },
      public: { http: ["https://rpc.subnet-60.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 60 Explorer", url: "https://explorer.subnet-60.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900061,
    name: "Enterprise Subnet 61",
    network: "subnet-61",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-61.internal.net"] },
      public: { http: ["https://rpc.subnet-61.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 61 Explorer", url: "https://explorer.subnet-61.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900062,
    name: "Enterprise Subnet 62",
    network: "subnet-62",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-62.internal.net"] },
      public: { http: ["https://rpc.subnet-62.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 62 Explorer", url: "https://explorer.subnet-62.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900063,
    name: "Enterprise Subnet 63",
    network: "subnet-63",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-63.internal.net"] },
      public: { http: ["https://rpc.subnet-63.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 63 Explorer", url: "https://explorer.subnet-63.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900064,
    name: "Enterprise Subnet 64",
    network: "subnet-64",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-64.internal.net"] },
      public: { http: ["https://rpc.subnet-64.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 64 Explorer", url: "https://explorer.subnet-64.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900065,
    name: "Enterprise Subnet 65",
    network: "subnet-65",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-65.internal.net"] },
      public: { http: ["https://rpc.subnet-65.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 65 Explorer", url: "https://explorer.subnet-65.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900066,
    name: "Enterprise Subnet 66",
    network: "subnet-66",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-66.internal.net"] },
      public: { http: ["https://rpc.subnet-66.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 66 Explorer", url: "https://explorer.subnet-66.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900067,
    name: "Enterprise Subnet 67",
    network: "subnet-67",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-67.internal.net"] },
      public: { http: ["https://rpc.subnet-67.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 67 Explorer", url: "https://explorer.subnet-67.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900068,
    name: "Enterprise Subnet 68",
    network: "subnet-68",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-68.internal.net"] },
      public: { http: ["https://rpc.subnet-68.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 68 Explorer", url: "https://explorer.subnet-68.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900069,
    name: "Enterprise Subnet 69",
    network: "subnet-69",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-69.internal.net"] },
      public: { http: ["https://rpc.subnet-69.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 69 Explorer", url: "https://explorer.subnet-69.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900070,
    name: "Enterprise Subnet 70",
    network: "subnet-70",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-70.internal.net"] },
      public: { http: ["https://rpc.subnet-70.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 70 Explorer", url: "https://explorer.subnet-70.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900071,
    name: "Enterprise Subnet 71",
    network: "subnet-71",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-71.internal.net"] },
      public: { http: ["https://rpc.subnet-71.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 71 Explorer", url: "https://explorer.subnet-71.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900072,
    name: "Enterprise Subnet 72",
    network: "subnet-72",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-72.internal.net"] },
      public: { http: ["https://rpc.subnet-72.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 72 Explorer", url: "https://explorer.subnet-72.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900073,
    name: "Enterprise Subnet 73",
    network: "subnet-73",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-73.internal.net"] },
      public: { http: ["https://rpc.subnet-73.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 73 Explorer", url: "https://explorer.subnet-73.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900074,
    name: "Enterprise Subnet 74",
    network: "subnet-74",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-74.internal.net"] },
      public: { http: ["https://rpc.subnet-74.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 74 Explorer", url: "https://explorer.subnet-74.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900075,
    name: "Enterprise Subnet 75",
    network: "subnet-75",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-75.internal.net"] },
      public: { http: ["https://rpc.subnet-75.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 75 Explorer", url: "https://explorer.subnet-75.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900076,
    name: "Enterprise Subnet 76",
    network: "subnet-76",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-76.internal.net"] },
      public: { http: ["https://rpc.subnet-76.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 76 Explorer", url: "https://explorer.subnet-76.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900077,
    name: "Enterprise Subnet 77",
    network: "subnet-77",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-77.internal.net"] },
      public: { http: ["https://rpc.subnet-77.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 77 Explorer", url: "https://explorer.subnet-77.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
  {
    id: 900078,
    name: "Enterprise Subnet 78",
    network: "subnet-78",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-78.internal.net"] },
      public: { http: ["https://rpc.subnet-78.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 78 Explorer", url: "https://explorer.subnet-78.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: false,
    eip1559: true,
  },
  {
    id: 900079,
    name: "Enterprise Subnet 79",
    network: "subnet-79",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc.subnet-79.internal.net"] },
      public: { http: ["https://rpc.subnet-79.internal.net"] },
    },
    blockExplorers: {
      default: { name: "Enterprise Subnet 79 Explorer", url: "https://explorer.subnet-79.internal.net" },
    },
    contracts: {
      multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
    },
    testnet: true,
    eip1559: true,
  },
];

export const CHAINS_BY_ID: Map<number, DetailedChain> = new Map(
  REGISTERED_CHAINS.map((c) => [c.id, c])
);
