import { Pools } from '@/types/pools';
import { TokenListURLMap } from '@/types/TokenList';

export type CommonTokens = {
  nativeAsset: string;
  wNativeAsset: string;
  WETH: string;
  BAL: string;
  POINTS?: string;
  bbaUSD?: string;
  bbaUSDv2?: string;
  rETH?: string;
  stETH?: string;
  wstETH?: string;
  stMATIC?: string;
  reward?: string;
  rewards?: string;
  erc4626Wrappers?: Record<string, string>;
};

export type TokenConstants = {
  Popular: {
    Symbols: string[];
  };
  Addresses: CommonTokens;
  Wrappers?: {
    underlying: string;
    wrapper: string;
    aToken?: string;
  }[];
  InitialSwapTokens: {
    input: string;
    output: string;
  };
  PriceChainMap?: Record<string, string>;
  DisableInternalBalanceWithdrawals?: string[];
  DoubleApprovalRequired?: string[];
};

export interface Contracts {
  merkleRedeem: string;
  merkleOrchard: string;
  merkleOrchardV2?: string;
  multicall: string;
  authorizer: string;
  vault: string;
  weightedPoolFactory: string;
  stablePoolFactory: string;
  erc4626Relayer?: string;
  lidoRelayer: string;
  balancerHelpers: string;
  batchRelayer: string;
  balancerQueries: string;
  veBAL: string;
  lpVault?: string;
  lpVault2?: string;
  gaugeController: string;
  gaugeCheckpointer?: string;
  gaugeFactory: string;
  gaugeWorkingBalanceHelper?: string;
  balancerMinter: string;
  tokenAdmin: string;
  veDelegationProxy: string;
  veBALHelpers: string;
  feeDistributor: string;
  feeDistributorDeprecated: string;
  rewardDistributor?: string;
  rewardDistributorV2?: string;
  faucet: string;
  gaugeRewardsHelper?: string;
  omniVotingEscrow?: string;
}

export interface RateProviders {
  [tokenAddress: string]: {
    [providerAddress: string]: boolean;
  };
}

export interface Keys {
  infura?: string;
  alchemy?: string;
  graph?: string;
  balancerApi?: string;
}

// We don't import Network from sdk to avoid extra bundle size when loading app (while the SDK is not tree-shakable)
export enum Network {
  MAINNET = 1,
  GOERLI = 5,
  GÖRLI = 5,
  OPTIMISM = 10,
  GNOSIS = 100,
  POLYGON = 137,
  FANTOM = 250,
  ZKEVM = 1101,
  BASE = 8453,
  ARBITRUM = 42161,
  AVALANCHE = 43114,
  SEPOLIA = 11155111,
  TELOS = 40,
  METER = 82,
  TELOSTESTNET = 41,
  CELO = 42220,
  TAIKO = 167000,
  ETHERLINK = 42793,
  VANAMOKSHA = 14800,
  ARTELA = 11820,
  ARTELABETANET = 11822,
}

type Reward = {
  token: string;
  tokenSymbol: string;
  gauge: string;
  rate: bigint;
  period_finish: number;
};

type Rewards = {
  [key: string]: {
    [key: string]: Reward[];
  };
};

export interface Config {
  key: string;
  chainId: Network;
  layerZeroChainId?: number; // https://layerzero.gitbook.io/docs/technical-reference/mainnet/supported-chain-ids
  chainName: string;
  name: string;
  shortName: string;
  monorepoName?: string;
  slug: string;
  network: string;
  trustWalletNetwork?: string;
  unknown: boolean;
  visibleInUI: boolean;
  testNetwork: boolean;
  rpc: string;
  publicRpc?: string;
  ws: string;
  explorer: string;
  explorerName: string;
  subgraph: string;
  balancerApi?: string;
  poolsUrlV2: string;
  subgraphs: {
    main: string[];
    aave: string;
    gauge: string;
    blocks: string;
  };
  bridgeUrl: string;
  supportsEIP1559: boolean;
  supportsElementPools: boolean;
  supportsVeBalSync?: boolean;
  blockTime: number;
  nativeAsset: {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    deeplinkId: string;
    logoURI: string;
    minTransactionBuffer: string;
  };
  thirdParty: {
    coingecko: {
      nativeAssetId: string;
      platformId: string;
    };
    apyVision?: {
      networkName: string;
    };
  };
  addresses: Contracts;
  pools: Pools;
  tokens: TokenConstants;
  keys: Keys;
  gauges: {
    type: number;
    weight: number;
  };
  tokenlists: TokenListURLMap;
  rateProviders: Record<string, Record<string, boolean>>;
  rewards?: Rewards;
}
