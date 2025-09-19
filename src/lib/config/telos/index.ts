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
    'https://telos.api.ormilabs.com/api/public/f187e851-60e9-43dd-978f-f43d0b1748eb/subgraphs/revolv-telos/1.0.0/gn',
  // 'https://api.goldsky.com/api/public/project_clnbo3e3c16lj33xva5r2aqk7/subgraphs/symmetric-telos2/prod/gn',
  // 'https://telosapi.0xgraph.xyz/api/public/3d0109fa-bf83-48be-8595-24ecf0ed29fb/subgraphs/symmetric-telos/1.0.9/gn',
  balancerApi: '',
  poolsUrlV2:
    'https://storageapi.fleek.co/johngrantuk-team-bucket/poolsV2.json',
  subgraphs: {
    main: [
      'https://telos.api.ormilabs.com/api/public/f187e851-60e9-43dd-978f-f43d0b1748eb/subgraphs/revolv-telos/1.0.0/gn',
      'https://api.goldsky.com/api/public/project_clnbo3e3c16lj33xva5r2aqk7/subgraphs/symmetric-telos2/prod/gn',
    ],
    aave: '',
    gauge:
      'https://telos.api.ormilabs.com/api/public/f187e851-60e9-43dd-978f-f43d0b1748eb/subgraphs/revolv-gauges-telos/1.0.0/gn',
    // 'https://api.goldsky.com/api/public/project_clnbo3e3c16lj33xva5r2aqk7/subgraphs/symmetric-telos2-gauges/prod/gn',
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
