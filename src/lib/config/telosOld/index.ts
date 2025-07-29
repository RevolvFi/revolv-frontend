import { Config } from '../types';
import contracts from './contracts';
import keys from './keys';
import pools from './pools';
import tokenlists from './tokenlists';
import tokens from './tokens';
import rateProviders from './rateProviders';
import { rewards } from './rewards';

const config: Config = {
  key: '40',
  chainId: 40,
  chainName: 'Telos',
  name: 'Telos',
  shortName: 'telos',
  monorepoName: 'telos',
  slug: 'telos',
  network: 'telos',
  trustWalletNetwork: 'telos',
  unknown: false,
  visibleInUI: true,
  testNetwork: false,
  rpc: 'https://rpc.telos.net',
  //rpc: `https://mainnet-eu.telos.net/evm`,
  ws: `wss://telos.drpc.org`,
  explorer: 'https://teloscan.io',
  explorerName: 'Teloscan',
  subgraph:
    'https://api.goldsky.com/api/public/project_clnbo3e3c16lj33xva5r2aqk7/subgraphs/symmetric-telos/prod/gn',
  // 'https://telosapi.0xgraph.xyz/api/public/3d0109fa-bf83-48be-8595-24ecf0ed29fb/subgraphs/symmetric-telos/1.0.9/gn',
  balancerApi: '',
  poolsUrlV2:
    'https://storageapi.fleek.co/johngrantuk-team-bucket/poolsV2.json',
  subgraphs: {
    main: [
      'https://api.goldsky.com/api/public/project_clnbo3e3c16lj33xva5r2aqk7/subgraphs/symmetric-telos/prod/gn',
      'https://telosapi.0xgraph.xyz/api/public/3d0109fa-bf83-48be-8595-24ecf0ed29fb/subgraphs/symmetric-telos/1.0.9/gn',
      'https://thegraph.telos.net/subgraphs/name/symmetric-telos/symmetric-telos-graph',
    ],
    aave: '',
    gauge:
      'https://api.goldsky.com/api/public/project_clnbo3e3c16lj33xva5r2aqk7/subgraphs/symmetric-telos-gauges/prod/gn',
    blocks: '',
  },
  bridgeUrl: 'https://bridge.telos.net/bridge',
  supportsEIP1559: false,
  supportsElementPools: false,
  blockTime: 0.5,
  nativeAsset: {
    name: 'TLOS',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'TLOS',
    decimals: 18,
    deeplinkId: 'tlos',
    logoURI: 'tokens/tlos.png',
    minTransactionBuffer: '1',
  },
  thirdParty: {
    coingecko: {
      nativeAssetId: 'telos',
      platformId: 'ethereum',
    },
  },
  addresses: {
    ...contracts,
  },
  pools,
  tokens,
  keys,
  gauges: {
    type: 2,
    weight: 100,
  },
  tokenlists,
  rateProviders,
  rewards,
};

export default config;
