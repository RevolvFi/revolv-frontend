import { Config } from '../types';
import contracts from './contracts';
import keys from './keys';
import pools from './pools';
import tokenlists from './tokenlists';
import tokens from './tokens';
import rateProviders from './rateProviders';
import { rewards } from './rewards';

const config: Config = {
  key: '82',
  chainId: 82,
  chainName: 'Meter',
  name: 'Meter',
  shortName: 'meter',
  monorepoName: 'meter',
  slug: 'meter',
  network: 'meter',
  trustWalletNetwork: 'meter',
  unknown: false,
  visibleInUI: false,
  testNetwork: false,
  rpc: 'https://meter.blockpi.network/v1/rpc/216bb10a3653b0a8131afee4f6cf1982945022b4',
  ws: ``,
  explorer: 'https://explorer.meter.io/',
  explorerName: 'Meter Explorer',
  subgraph:
    'https://graph-meter.voltswap.finance/subgraphs/name/symmetric-meter',
  balancerApi: '',
  poolsUrlV2:
    'https://storageapi.fleek.co/johngrantuk-team-bucket/poolsV2.json',
  subgraphs: {
    main: [
      // 'http://graph.meter.io:8000/subgraphs/name/symmetric-meter',
      'https://graph-meter.voltswap.finance/subgraphs/name/symmetric-meter',
    ],
    aave: '',
    gauge:
      'https://graph-meter.voltswap.finance/subgraphs/name/symmetric-meter-gauges',
    blocks: '',
  },
  bridgeUrl: 'https://passport.meter.io/',
  supportsEIP1559: false,
  supportsElementPools: false,
  blockTime: 1.5,
  nativeAsset: {
    name: 'MTR',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'MTR',
    decimals: 18,
    deeplinkId: 'meter',
    logoURI: 'tokens/mtr.png',
    minTransactionBuffer: '1',
  },
  thirdParty: {
    coingecko: {
      nativeAssetId: 'meter',
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
