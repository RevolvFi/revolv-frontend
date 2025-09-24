import {
  GqlChain,
  GqlPoolMinimalType,
} from '@/services/api/graphql/generated/api-types';
import { ApiVotingPool } from '@/services/balancer/gauges/gauge-controller.decorator';

export function telosVotingPools(testnet: 'telos'): ApiVotingPool[] {
  const RVLV_STLOS: ApiVotingPool = {
    chain: testnet as GqlChain,
    id: '0x993f1754d02b64720803f0cc5550bf9a4ba2b89b000200000000000000000019',
    address: '0x993f1754d02b64720803f0cc5550bf9a4ba2b89b',
    type: GqlPoolMinimalType.Weighted,
    symbol: 'R-80RVLV-20STLOS',
    tokens: [
      {
        address: '0x98a5030a449d8833166c3f1d96db00ba2a082fbf',
        weight: '0.8',
        symbol: 'RVLV',
        logoURI:
          'https://raw.githubusercontent.com/RevolvFi/tokenlists/refs/heads/main/src/assets/images/tokens/RVLV.png',
      },
      {
        address: '0xb4b01216a5bc8f1c8a33cd990a1239030e60c905',
        weight: '0.2',
        symbol: 'STLOS',
        logoURI:
          'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/stlos.png',
      },
    ],
    gauge: {
      address: '0x2b142EF7e1a314f86aDe5921c8aE9590B5A61FDD',
      isKilled: false,
      relativeWeightCap: null,
      addedTimestamp: 1705510584,
    },
  };

  const woUSDC_woUSDT: ApiVotingPool = {
    chain: testnet as GqlChain,
    id: '0x64ee13e072764094d46912046a92436b6a264729000000000000000000000017',
    address: '0x64ee13e072764094d46912046a92436b6a264729',
    type: GqlPoolMinimalType.Stable,
    symbol: 'R-woUSDC.e-woUSDT',
    tokens: [
      {
        address: '0xf1815bd50389c46847f0bda824ec8da914045d14',
        weight: null,
        symbol: 'USDC.e',
        logoURI:
          'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
      },
      {
        address: '0x674843c06ff83502ddb4d37c2e09c01cda38cbc8',
        weight: null,
        symbol: 'USDT',
        logoURI:
          'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
      },
    ],
    gauge: {
      address: '0x42b4618a49c185147a56812b13c42dfc866bd5bd',
      isKilled: false,
      relativeWeightCap: null,
      addedTimestamp: 1705510584,
    },
  };

  const STLOS_woWTLOS: ApiVotingPool = {
    chain: testnet as GqlChain,
    id: '0xd9f435165a1432e64c33547aaf1c76f6b7971dc8000000000000000000000018',
    address: '0xd9f435165a1432e64c33547aaf1c76f6b7971dc8',
    type: GqlPoolMinimalType.Stable,
    symbol: 'R-STLOS-woWTLOS',
    tokens: [
      {
        address: '0xb4b01216a5bc8f1c8a33cd990a1239030e60c905',
        weight: null,
        symbol: 'STLOS',
        logoURI:
          'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/stlos.png',
      },
      {
        address: '0xd9d50bc52061bb29045da753776b1367fa6e3ad0',
        weight: null,
        symbol: 'woWTLOS',
        logoURI:
          'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/wtlos.png',
      },
    ],
    gauge: {
      address: '0x1f18a8e97e1d8d7da2e7df4176fc6a6e840cc44a',
      isKilled: false,
      relativeWeightCap: null,
      addedTimestamp: 1705510584,
    },
  };

  const woUSDC_STLOS: ApiVotingPool = {
    chain: testnet as GqlChain,
    id: '0x7629abad9d7e2d323584717d8dde5bbd3bce6df0000200000000000000000016',
    address: '0x7629abad9d7e2d323584717d8dde5bbd3bce6df0',
    type: GqlPoolMinimalType.Weighted,
    symbol: 'R-50woUSDC.e-50STLOS',
    tokens: [
      {
        address: '0xf1815bd50389c46847f0bda824ec8da914045d14',
        weight: '0.5',
        symbol: 'woUSDC.e',
        logoURI:
          'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
      },
      {
        address: '0xb4b01216a5bc8f1c8a33cd990a1239030e60c905',
        weight: '0.5',
        symbol: 'STLOS',
        logoURI:
          'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/stlos.png',
      },
    ],
    gauge: {
      address: '0xe9bad0f1cbb2ec29e410618db6dec22d8ca9d470',
      isKilled: false,
      relativeWeightCap: null,
      addedTimestamp: 1705510584,
    },
  };

  const WBTC_WETH_USDC_e: ApiVotingPool = {
    chain: testnet as GqlChain,
    id: '0x608edb650cb850c65dad07b90900863aa77f474e000100000000000000000015',
    address: '0x608edb650cb850c65dad07b90900863aa77f474e',
    type: GqlPoolMinimalType.Weighted,
    symbol: 'R-40WBTC-40WETH-20USDC.e',
    tokens: [
      {
        address: '0xf1815bd50389c46847f0bda824ec8da914045d14',
        weight: '0.2',
        symbol: 'USDC.e',
        logoURI:
          'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
      },
      {
        address: '0x0555e30da8f98308edb960aa94c0db47230d2b9c',
        weight: '0.4',
        symbol: 'WBTC',
        logoURI:
          'https://res.coinpaper.com/coinpaper/wrapped_bitcoin_wbtc_logo_b8ecd60f3f.png',
      },
      {
        address: '0xbab93b7ad7fe8692a878b95a8e689423437cc500',
        weight: '0.4',
        symbol: 'WETH',
        logoURI:
          'https://raw.githubusercontent.com/RevolvFi/tokenlists/refs/heads/main/src/assets/images/tokens/RVLV.png',
      },
    ],
    gauge: {
      address: '0x1f0eab84c6b9773d7b31c5e2886d3635779f8638',
      isKilled: false,
      relativeWeightCap: null,
      addedTimestamp: 1705510584,
    },
  };

  return [
    RVLV_STLOS,
    woUSDC_woUSDT,
    STLOS_woWTLOS,
    woUSDC_STLOS,
    WBTC_WETH_USDC_e,
  ];
}
