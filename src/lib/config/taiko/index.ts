import { Config } from '../types';
import contracts from './contracts';
import keys from './keys';
import pools from './pools';
import tokenlists from './tokenlists';
import tokens from './tokens';
import rateProviders from './rateProviders';

const config: Config = {
  key: '167000',
  chainId: 167000,
  chainName: 'Taiko',
  name: 'Taiko',
  shortName: 'taiko',
  monorepoName: 'taiko',
  slug: 'taiko',
  network: 'taiko',
  trustWalletNetwork: 'taiko',
  unknown: false,
  visibleInUI: false,
  testNetwork: false,
  rpc: `https://rpc.mainnet.taiko.xyz`,
  ws: `wss://ws.mainnet.taiko.xyz`,
  explorer: 'https://taikoscan.io/',
  explorerName: 'Taikoscan',
  subgraph:
    'https://api.goldsky.com/api/public/project_clnbo3e3c16lj33xva5r2aqk7/subgraphs/symmetric-taiko/1.0.0/gn',
  balancerApi: '',
  poolsUrlV2:
    'https://storageapi.fleek.co/johngrantuk-team-bucket/poolsV2.json',
  subgraphs: {
    main: [
      'https://api.goldsky.com/api/public/project_clnbo3e3c16lj33xva5r2aqk7/subgraphs/symmetric-taiko/1.0.0/gn',
    ],
    aave: '',
    gauge: '',
    blocks: '',
  },
  bridgeUrl: 'https://bridge.taiko.xyz/',
  supportsEIP1559: true,
  supportsElementPools: false,
  blockTime: 32,
  nativeAsset: {
    name: 'Ether',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'ETH',
    decimals: 18,
    deeplinkId: 'eth',
    logoURI: 'tokens/eth.png',
    minTransactionBuffer: '0.0005',
  },
  thirdParty: {
    coingecko: {
      nativeAssetId: 'taiko',
      platformId: 'taiko',
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
};

export default config;
