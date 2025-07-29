import {
  GqlChain,
  GqlPoolMinimalType,
} from '@/services/api/graphql/generated/api-types';
import { ApiVotingPool } from '@/services/balancer/gauges/gauge-controller.decorator';

/*
 Fake voting Pool data to test voting list UI in testnet networks
*/
export function testnetVotingPools(
  testnet: 'SEPOLIA' | 'GOERLI'
): ApiVotingPool[] {
  const STLOS_WTLOS: ApiVotingPool = {
    chain: testnet as GqlChain,
    id: '0x9a77bd2edbbb68173275cda967b76e9213949ace000000000000000000000008',
    address: '0x9A77BD2edbBB68173275Cda967B76E9213949aCe',
    type: GqlPoolMinimalType.Stable,
    symbol: 'STLOS-WTLOS',
    tokens: [
      {
        address: '0xB4B01216a5Bc8F1C8A33CD990A1239030E60C90',
        weight: null,
        symbol: 'STLOS',
        logoURI:
          'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/stlos.png',
      },
      {
        address: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E',
        weight: null,
        symbol: 'WTLOS',
        logoURI:
          'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/telos.png',
      },
    ],
    gauge: {
      address: '0xec678e92afe25bc5ba4bc2e1ff386c775270e49e',
      isKilled: false,
      addedTimestamp: 1701860941,
      relativeWeightCap: '0.1',
    },
  };

  const USDC_USDT: ApiVotingPool = {
    chain: testnet as GqlChain,
    id: '0x058d4893efa235d86cceed5a7eef0809b76c8c66000000000000000000000004',
    address: '0x058d4893efa235d86cceed5a7eef0809b76c8c66',
    type: GqlPoolMinimalType.Stable,
    symbol: 'USDC-USDT',
    tokens: [
      {
        address: '0x8D97Cea50351Fb4329d591682b148D43a0C3611b',
        weight: null,
        symbol: 'USDC',
        logoURI:
          'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
      },
      {
        address: '0x975Ed13fa16857E83e7C493C7741D556eaaD4A3f',
        weight: null,
        symbol: 'USDT',
        logoURI:
          'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
      },
    ],
    gauge: {
      address: '0xe4c412962fab7f2d406c43a8da95c68f9d60f24e',
      isKilled: false,
      addedTimestamp: 1701860941,
      relativeWeightCap: '0.1',
    },
  };

  const WTLOS_USDT: ApiVotingPool = {
    chain: testnet as GqlChain,
    id: '0x2d714951f7165a51e8bd61f92d8a979ab0ed4b59000200000000000000000006',
    address: '0x2d714951f7165a51e8bd61f92d8a979ab0ed4b59',
    type: GqlPoolMinimalType.Weighted,
    symbol: '20USDT-80WTLOS',
    tokens: [
      {
        address: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E',
        weight: '0.8',
        symbol: 'WTLOS',
        logoURI:
          'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/telos.png',
      },
      {
        address: '0x975Ed13fa16857E83e7C493C7741D556eaaD4A3f',
        weight: '0.2',
        symbol: 'USDT',
        logoURI:
          'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
      },
    ],
    gauge: {
      address: '0xa9d436ab58989354a5c3705f24a5130779055e47',
      isKilled: false,
      relativeWeightCap: '0.6',
      addedTimestamp: 1701860941,
    },
  };

  return [STLOS_WTLOS, USDC_USDT, WTLOS_USDT];
}

export function telosVotingPools(testnet: 'telos'): ApiVotingPool[] {
  // const STLOS_WTLOS: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0x9a77bd2edbbb68173275cda967b76e9213949ace000000000000000000000008',
  //   address: '0x9A77BD2edbBB68173275Cda967B76E9213949aCe',
  //   type: GqlPoolMinimalType.Stable,
  //   symbol: 'STLOS-WTLOS',
  //   tokens: [
  //     {
  //       address: '0xB4B01216a5Bc8F1C8A33CD990A1239030E60C905',
  //       weight: null,
  //       symbol: 'STLOS',
  //       logoURI:
  //         'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/stlos.png',
  //     },
  //     {
  //       address: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E',
  //       weight: null,
  //       symbol: 'WTLOS',
  //       logoURI:
  //         'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/telos.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0xec678e92afe25bc5ba4bc2e1ff386c775270e49e',
  //     isKilled: false,
  //     addedTimestamp: 1701860941,
  //     relativeWeightCap: '0.1',
  //   },
  // };

  // const USDC_USDT: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0x058d4893efa235d86cceed5a7eef0809b76c8c66000000000000000000000004',
  //   address: '0x058d4893efa235d86cceed5a7eef0809b76c8c66',
  //   type: GqlPoolMinimalType.Stable,
  //   symbol: 'USDC-USDT',
  //   tokens: [
  //     {
  //       address: '0x8D97Cea50351Fb4329d591682b148D43a0C3611b',
  //       weight: null,
  //       symbol: 'USDC',
  //       logoURI:
  //         'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  //     },
  //     {
  //       address: '0x975Ed13fa16857E83e7C493C7741D556eaaD4A3f',
  //       weight: null,
  //       symbol: 'USDT',
  //       logoURI:
  //         'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0xe4c412962fab7f2d406c43a8da95c68f9d60f24e',
  //     isKilled: false,
  //     addedTimestamp: 1701860941,
  //     relativeWeightCap: '0.1',
  //   },
  // };

  // const wUSK_USDC: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0x058d4893efa235d86cceed5a7eef0809b76c8c66000000000000000000000004',
  //   address: '0x058d4893efa235d86cceed5a7eef0809b76c8c66',
  //   type: GqlPoolMinimalType.Stable,
  //   symbol: 'wUSK-USDC',
  //   tokens: [
  //     {
  //       address: '0xfdff55a36f3dd3942a4ac5aebe68972d57296925',
  //       weight: null,
  //       symbol: 'wUSK',
  //       logoURI:
  //         'https://raw.githubusercontent.com/centfinance/tokenlists/main/src/assets/images/tokens/WUSK.png',
  //     },
  //     {
  //       address: '0x8D97Cea50351Fb4329d591682b148D43a0C3611b',
  //       weight: null,
  //       symbol: 'USDC',
  //       logoURI:
  //         'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0x71a25e8494e6e2f986d7642ce4c06327056ce0a6',
  //     isKilled: false,
  //     addedTimestamp: 1701860941,
  //     relativeWeightCap: '0.1',
  //   },
  // };

  // const wUSK_STLOS: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0x058d4893efa235d86cceed5a7eef0809b76c8c66000000000000000000000004',
  //   address: '0x058d4893efa235d86cceed5a7eef0809b76c8c66',
  //   type: GqlPoolMinimalType.Weighted,
  //   symbol: '80STLOS-20wUSK',
  //   tokens: [
  //     {
  //       address: '0xB4B01216a5Bc8F1C8A33CD990A1239030E60C905',
  //       weight: '0.8',
  //       symbol: 'STLOS',
  //       logoURI:
  //         'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/stlos.png',
  //     },
  //     {
  //       address: '0xfdff55a36f3dd3942a4ac5aebe68972d57296925',
  //       weight: '0.2',
  //       symbol: 'wUSK',
  //       logoURI:
  //         'https://raw.githubusercontent.com/centfinance/tokenlists/main/src/assets/images/tokens/WUSK.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0x30d9158f413937afa5693cb444174ca55f9e6b6c',
  //     isKilled: false,
  //     addedTimestamp: 1701860941,
  //     relativeWeightCap: '0.1',
  //   },
  // };

  // const WTLOS_USDT: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0x2d714951f7165a51e8bd61f92d8a979ab0ed4b59000200000000000000000006',
  //   address: '0x2d714951f7165a51e8bd61f92d8a979ab0ed4b59',
  //   type: GqlPoolMinimalType.Weighted,
  //   symbol: '20USDT-80WTLOS',
  //   tokens: [
  //     {
  //       address: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E',
  //       weight: '0.8',
  //       symbol: 'WTLOS',
  //       logoURI:
  //         'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/telos.png',
  //     },
  //     {
  //       address: '0x975Ed13fa16857E83e7C493C7741D556eaaD4A3f',
  //       weight: '0.2',
  //       symbol: 'USDT',
  //       logoURI:
  //         'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0xa9d436ab58989354a5c3705f24a5130779055e47',
  //     isKilled: false,
  //     relativeWeightCap: '0.1',
  //     addedTimestamp: 1701860941,
  //   },
  // };

  // const BTCb_ETH_USDC: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0x0ca5d4b7aeeca61aff78c8f734596ec88456d5c300010000000000000000000a',
  //   address: '0x2d714951f7165a51e8bd61f92d8a979ab0ed4b59',
  //   type: GqlPoolMinimalType.Weighted,
  //   symbol: '40BTCb-40ETH-20USDC',
  //   tokens: [
  //     {
  //       address: '0x7627b27594bc71e6Ab0fCE755aE8931EB1E12DAC',
  //       weight: '0.4',
  //       symbol: 'BTCb',
  //       logoURI:
  //         'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/BTC.b.png',
  //     },
  //     {
  //       address: '0xA0fB8cd450c8Fd3a11901876cD5f17eB47C6bc50',
  //       weight: '0.4',
  //       symbol: 'ETH',
  //       logoURI: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  //     },
  //     {
  //       address: '0xF9485b3fffd191e28a089C21cD745cc228a181E3',
  //       weight: '0.2',
  //       symbol: 'USDC',
  //       logoURI:
  //         'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0x760dd84074f735bd3836718c0916a828d1dda502',
  //     isKilled: false,
  //     relativeWeightCap: '0.1',
  //     addedTimestamp: 1703095734,
  //   },
  // };

  // const USDM_USDC_USDT: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0x5e99843486cf052baf0925a0cdeb40920477295900000000000000000000000b',
  //   address: '0x5E99843486Cf052BaF0925A0CdeB409204772959',
  //   type: GqlPoolMinimalType.Stable,
  //   symbol: 'USDM/USDC-USDT',
  //   tokens: [
  //     {
  //       address: '0x8f7D64ea96D729EF24a0F30b4526D47b80d877B9',
  //       weight: null,
  //       symbol: 'USDM',
  //       logoURI:
  //         'https://raw.githubusercontent.com/swapsicledex/swapsicle-token-list/master/logos/telos/0x8f7D64ea96D729EF24a0F30b4526D47b80d877B9/logo.png',
  //     },
  //     {
  //       address: '0x058D4893eFa235D86CcEeD5a7Eef0809B76c8c66',
  //       weight: null,
  //       symbol: 'USDC-USDT',
  //       logoURI:
  //         'https://raw.githubusercontent.com/centfinance/tokenlists/main/src/assets/images/tokens/USDC-USDT.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0x6e0c092b93b5c075239ee61cae811924028899ea',
  //     isKilled: false,
  //     addedTimestamp: 1703095734,
  //     relativeWeightCap: '0.1',
  //   },
  // };

  const USDC_STLOS: ApiVotingPool = {
    chain: testnet as GqlChain,
    id: '0xcf6f341edc35b4554b823be127956a37eeb9ac8d000200000000000000000013',
    address: '0xcf6f341edc35b4554b823be127956a37eeb9ac8d',
    type: GqlPoolMinimalType.Weighted,
    symbol: '50USDC.e-50STLOS',
    tokens: [
      {
        address: '0xF9485b3fffd191e28a089C21cD745cc228a181E3',
        weight: '0.5',
        symbol: 'USDC.e',
        logoURI:
          'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
      },
      {
        address: '0xB4B01216a5Bc8F1C8A33CD990A1239030E60C905',
        weight: '0.5',
        symbol: 'STLOS',
        logoURI:
          'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/stlos.png',
      },
    ],
    gauge: {
      address: '0x99318500f2378d9ae4d69da4e4b006c79d828e69',
      isKilled: false,
      relativeWeightCap: '0.1',
      addedTimestamp: 1705510584,
    },
  };

  const STLOS_woWTLOS: ApiVotingPool = {
    chain: testnet as GqlChain,
    id: '0x7549ed894be102568e482a523f648f25f443a0f2000000000000000000000012',
    address: '0x7549ed894be102568e482a523f648f25f443a0f2',
    type: GqlPoolMinimalType.Stable,
    symbol: 'STLOS-woWTLOS',
    tokens: [
      {
        address: '0xB4B01216a5Bc8F1C8A33CD990A1239030E60C905',
        weight: null,
        symbol: 'STLOS',
        logoURI:
          'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/stlos.png',
      },
      {
        address: '0xD9D50bC52061BB29045Da753776B1367FA6E3aD0',
        weight: null,
        symbol: 'woWTLOS',
        logoURI:
          'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/telos.png',
      },
    ],
    gauge: {
      address: '0x99318500f2378d9ae4d69da4e4b006c79d828e69',
      isKilled: false,
      relativeWeightCap: '0.1',
      addedTimestamp: 1705510584,
    },
  };

  const woUSDC_USDT: ApiVotingPool = {
    chain: testnet as GqlChain,
    id: '0x167c36cd8c47cbac4555fb84b96fb4a632b2c2d4000000000000000000000011',
    address: '0x167c36cd8c47cbac4555fb84b96fb4a632b2c2d4',
    type: GqlPoolMinimalType.Stable,
    symbol: 'woUSDC.e-woUSDT',
    tokens: [
      {
        address: '0xF9485b3fffd191e28a089C21cD745cc228a181E3',
        weight: null,
        symbol: 'woUSDC.e',
        logoURI:
          'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
      },
      {
        address: '0x975Ed13fa16857E83e7C493C7741D556eaaD4A3f',
        weight: null,
        symbol: 'woUSDT',
        logoURI:
          'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
      },
    ],
    gauge: {
      address: '0x99318500f2378d9ae4d69da4e4b006c79d828e69',
      isKilled: false,
      relativeWeightCap: '0.1',
      addedTimestamp: 1705510584,
    },
  };

  // const rfTLOS_STLOS_DEPREC: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0xd757973e91a8045808e8cd37cc2b7df128e7ca2c00000000000000000000000d',
  //   address: '0xd757973E91A8045808e8cd37cC2B7dF128e7Ca2c',
  //   type: GqlPoolMinimalType.Stable,
  //   symbol: 'rfTLOS-STLOS',
  //   tokens: [
  //     {
  //       address: '0x7d94D2F6f91ED5ED0104D89B3D263026D990Ac5f',
  //       weight: null,
  //       symbol: 'rfTLOS',
  //       logoURI:
  //         'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/telos.png',
  //     },
  //     {
  //       address: '0xB4B01216a5Bc8F1C8A33CD990A1239030E60C905',
  //       weight: null,
  //       symbol: 'STLOS',
  //       logoURI:
  //         'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/stlos.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0x08247c710d340d23adfd88ea80893519eaae9b4d',
  //     isKilled: false,
  //     addedTimestamp: 1701860941,
  //     relativeWeightCap: '0.1',
  //   },
  // };

  // const rfTLOS_STLOS: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0x38c2609cabbe6cce553eb842b78ea59e5a73552800000000000000000000000e',
  //   address: '0x38c2609caBBe6CcE553eB842b78Ea59E5A735528',
  //   type: GqlPoolMinimalType.Stable,
  //   symbol: 'rfTLOS-STLOS',
  //   tokens: [
  //     {
  //       address: '0x7d94D2F6f91ED5ED0104D89B3D263026D990Ac5f',
  //       weight: null,
  //       symbol: 'rfTLOS',
  //       logoURI:
  //         'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/telos.png',
  //     },
  //     {
  //       address: '0xB4B01216a5Bc8F1C8A33CD990A1239030E60C905',
  //       weight: null,
  //       symbol: 'STLOS',
  //       logoURI:
  //         'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/stlos.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0x5967e7572f925b5e133963ce792001148f57dc08',
  //     isKilled: true,
  //     addedTimestamp: 1705464286,
  //     relativeWeightCap: '0.1',
  //   },
  // };

  // const WTLOS_USDC: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0x2b014535525aad053b8811c22a337e57caae82df00020000000000000000000f',
  //   address: '0x2b014535525aAD053B8811c22a337e57caaE82DF',
  //   type: GqlPoolMinimalType.Weighted,
  //   symbol: '40USDT-60WTLOS',
  //   tokens: [
  //     {
  //       address: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E',
  //       weight: '0.6',
  //       symbol: 'WTLOS',
  //       logoURI:
  //         'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/telos.png',
  //     },
  //     {
  //       address: '0xF9485b3fffd191e28a089C21cD745cc228a181E3',
  //       weight: '0.4',
  //       symbol: 'USDC',
  //       logoURI:
  //         'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0x9614933e16d6753ee9be1736b2850862984fdc3a',
  //     isKilled: false,
  //     relativeWeightCap: '0.1',
  //     addedTimestamp: 1705510584,
  //   },
  // };

  // const BTCb_STLOS: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0x0e4907910a6bd1a5e95500f7149dd57d328f65cb000200000000000000000012',
  //   address: '0x0e4907910A6bd1A5E95500f7149dd57D328f65Cb',
  //   type: GqlPoolMinimalType.Weighted,
  //   symbol: '50BTCb-50STLOS',
  //   tokens: [
  //     {
  //       address: '0x7627b27594bc71e6Ab0fCE755aE8931EB1E12DAC',
  //       weight: '0.5',
  //       symbol: 'BTCb',
  //       logoURI:
  //         'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/BTC.b.png',
  //     },
  //     {
  //       address: '0xB4B01216a5Bc8F1C8A33CD990A1239030E60C905',
  //       weight: '0.5',
  //       symbol: 'STLOS',
  //       logoURI:
  //         'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/stlos.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0xdf0bd977f7665a4d1d231d5cb68eb296c1ac9bbe',
  //     isKilled: false,
  //     relativeWeightCap: '0.1',
  //     addedTimestamp: 1705510584,
  //   },
  // };

  // const ETH_STLOS: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0x0485ecd8aa4e0624dd0f5da84139409ab7cee03c000200000000000000000013',
  //   address: '0x0485ecd8aa4e0624dd0f5da84139409ab7cee03c',
  //   type: GqlPoolMinimalType.Weighted,
  //   symbol: '50ETH-50STLOS',
  //   tokens: [
  //     {
  //       address: '0xA0fB8cd450c8Fd3a11901876cD5f17eB47C6bc50',
  //       weight: '0.5',
  //       symbol: 'ETH',
  //       logoURI: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  //     },
  //     {
  //       address: '0xB4B01216a5Bc8F1C8A33CD990A1239030E60C905',
  //       weight: '0.5',
  //       symbol: 'STLOS',
  //       logoURI:
  //         'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/stlos.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0x99318500f2378d9ae4d69da4e4b006c79d828e69',
  //     isKilled: false,
  //     relativeWeightCap: '0.1',
  //     addedTimestamp: 1705510584,
  //   },
  // };

  // const TSOUL_TSYMM: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0xbb8a33dbbf10882d3d8d9180c56ff13ad6fd917d000200000000000000000011',
  //   address: '0xbb8a33dbbf10882d3d8d9180c56ff13ad6fd917d',
  //   type: GqlPoolMinimalType.Weighted,
  //   symbol: '70TSOUL-30tSYMM',
  //   tokens: [
  //     {
  //       address: '0x78e05bc07e498f3191288c72a96fe1c4f7f6bdef',
  //       weight: '0.7',
  //       symbol: 'TSOUL',
  //       logoURI:
  //         'https://raw.githubusercontent.com/swapsicledex/swapsicle-token-list/master/logos/telos/0x78E05bC07e498f3191288c72a96Fe1c4f7f6Bdef/logo.png',
  //     },
  //     {
  //       address: '0xd5f2a24199C3DFc44C1Bf8B1C01aB147809434Ca',
  //       weight: '0.3',
  //       symbol: 'tSYMM',
  //       logoURI:
  //         'https://raw.githubusercontent.com/centfinance/tokenlists/main/src/assets/images/tokens/TSYMM.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0x2a1cdad447828d412c56a2cfda831d4bfc367f66',
  //     isKilled: true,
  //     relativeWeightCap: '0.1',
  //     addedTimestamp: 1705510584,
  //   },
  // };

  // const SOULS_TSYMM: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0xcf29825dfe41e62e218baa10b791a3d087fa7a83000200000000000000000018',
  //   address: '0xcf29825Dfe41E62E218Baa10B791A3D087fA7a83',
  //   type: GqlPoolMinimalType.Weighted,
  //   symbol: '70SOULS-30tSYMM',
  //   tokens: [
  //     {
  //       address: '0xa3b4aee7b43b2fb390420c411ec180b0ae87e9da',
  //       weight: '0.7',
  //       symbol: 'SOULS',
  //       logoURI:
  //         'https://raw.githubusercontent.com/centfinance/tokenlists/main/src/assets/images/tokens/SOULS.png',
  //     },
  //     {
  //       address: '0xd5f2a24199C3DFc44C1Bf8B1C01aB147809434Ca',
  //       weight: '0.3',
  //       symbol: 'tSYMM',
  //       logoURI:
  //         'https://raw.githubusercontent.com/centfinance/tokenlists/main/src/assets/images/tokens/TSYMM.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0x96b9b9c80b76787e7274b4fadc0d887a6064685c',
  //     isKilled: true,
  //     relativeWeightCap: '0.1',
  //     addedTimestamp: 1705510584,
  //   },
  // };

  // const SOULS_KINDS: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0xcacc06ea569e239d0e4b718e4da1b456d49e06f6000200000000000000000019',
  //   address: '0xcf29825Dfe41E62E218Baa10B791A3D087fA7a83',
  //   type: GqlPoolMinimalType.Weighted,
  //   symbol: '50KINDs-50SOULS',
  //   tokens: [
  //     {
  //       address: '0x143aa2070e3b5414c68a93ba0a99bac8847cbe99',
  //       weight: '0.3',
  //       symbol: 'KINDs',
  //       logoURI:
  //         'https://raw.githubusercontent.com/centfinance/tokenlists/main/src/assets/images/tokens/KINDS.png',
  //     },
  //     {
  //       address: '0xa3b4aee7b43b2fb390420c411ec180b0ae87e9da',
  //       weight: '0.5',
  //       symbol: 'SOULS',
  //       logoURI:
  //         'https://raw.githubusercontent.com/centfinance/tokenlists/main/src/assets/images/tokens/SOULS.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0x89f6ad1eef23c0c272885dde34b2af9be8033c36',
  //     isKilled: true,
  //     relativeWeightCap: '0.1',
  //     addedTimestamp: 1705510584,
  //   },
  // };

  // const SOULS_WTLOS: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0x30f0797bbe89172b669467039d49d413eb09244b00020000000000000000001c',
  //   address: '0x30f0797bbe89172b669467039d49d413eb09244b',
  //   type: GqlPoolMinimalType.Weighted,
  //   symbol: '50SOULS-50WTLOS',
  //   tokens: [
  //     {
  //       address: '0xa3b4aee7b43b2fb390420c411ec180b0ae87e9da',
  //       weight: '0.5',
  //       symbol: 'SOULS',
  //       logoURI:
  //         'https://raw.githubusercontent.com/centfinance/tokenlists/main/src/assets/images/tokens/SOULS.png',
  //     },
  //     {
  //       address: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E',
  //       weight: '0.5',
  //       symbol: 'WTLOS',
  //       logoURI:
  //         'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/telos.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0x8E512Ba3949ae1CebfaEb460Cc3269d0E01B2242',
  //     isKilled: true,
  //     relativeWeightCap: '0.1',
  //     addedTimestamp: 1705510584,
  //   },
  // };

  // const SUSD_SOULS: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0xfa5f3ba362577e35875e91eb3b16fbe7108f448600020000000000000000001d',
  //   address: '0xfa5f3ba362577e35875e91eb3b16fbe7108f4486',
  //   type: GqlPoolMinimalType.Weighted,
  //   symbol: '50SUSD-50SOULS',
  //   tokens: [
  //     {
  //       address: '0x836EfDc24A00d42160AF3eF144Af96CBc0c09aa0',
  //       weight: '0.5',
  //       symbol: 'SUSD',
  //       logoURI:
  //         'https://raw.githubusercontent.com/centfinance/tokenlists/main/src/assets/images/tokens/SUSD.png',
  //     },
  //     {
  //       address: '0xa3b4aee7b43b2fb390420c411ec180b0ae87e9da',
  //       weight: '0.5',
  //       symbol: 'SOULS',
  //       logoURI:
  //         'https://raw.githubusercontent.com/centfinance/tokenlists/main/src/assets/images/tokens/SOULS.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0x194CC8af539B5Ec1d61B615ac48BFCc4837A1d19',
  //     isKilled: true,
  //     relativeWeightCap: '0.1',
  //     addedTimestamp: 1705510584,
  //   },
  // };

  // const ALI_SOULS: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0xceb2728bf37332291fa44891414a53b1d668578200020000000000000000001e',
  //   address: '0xceb2728bf37332291fa44891414a53b1d6685782',
  //   type: GqlPoolMinimalType.Weighted,
  //   symbol: '50ALI-50SOULS',
  //   tokens: [
  //     {
  //       address: '0xce436C598027B39bcC80094B670A60184a290Fe1',
  //       weight: '0.5',
  //       symbol: 'ALI',
  //       logoURI:
  //         'https://raw.githubusercontent.com/centfinance/tokenlists/main/src/assets/images/tokens/ALI.png',
  //     },
  //     {
  //       address: '0xa3b4aee7b43b2fb390420c411ec180b0ae87e9da',
  //       weight: '0.5',
  //       symbol: 'SOULS',
  //       logoURI:
  //         'https://raw.githubusercontent.com/centfinance/tokenlists/main/src/assets/images/tokens/SOULS.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0x34BD676B1a111ac062b35dBb80085b7528B4B151',
  //     isKilled: true,
  //     relativeWeightCap: '0.05',
  //     addedTimestamp: 1705510584,
  //   },
  // };

  // const TKIND_TSOUL: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0x09ef3684052c0566caa6fc61008922030ff455b1000200000000000000000010',
  //   address: '0x09ef3684052c0566caa6fc61008922030ff455b1',
  //   type: GqlPoolMinimalType.Weighted,
  //   symbol: '50TKIND-50TSOUL',
  //   tokens: [
  //     {
  //       address: '0x5fb2e2e655d03636b30c4e1ac1c96dd16330bde9',
  //       weight: '0.5',
  //       symbol: 'TKIND',
  //       logoURI:
  //         'https://raw.githubusercontent.com/swapsicledex/swapsicle-token-list/master/logos/telos/0x5FB2E2e655d03636B30c4e1AC1C96dD16330bdE9/logo.png',
  //     },
  //     {
  //       address: '0x78e05bc07e498f3191288c72a96fe1c4f7f6bdef',
  //       weight: '0.5',
  //       symbol: 'TSOUL',
  //       logoURI:
  //         'https://raw.githubusercontent.com/swapsicledex/swapsicle-token-list/master/logos/telos/0x78E05bC07e498f3191288c72a96Fe1c4f7f6Bdef/logo.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0x9aad8c23a5d1a99bd38172dc0a085392fe1eeef5',
  //     isKilled: true,
  //     relativeWeightCap: '0.1',
  //     addedTimestamp: 1705510584,
  //   },
  // };

  // const MST_USDM: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0x304970d2511aa3b121148afd387cfa623f551410000200000000000000000016',
  //   address: '0x304970d2511aa3b121148afd387cfa623f551410',
  //   type: GqlPoolMinimalType.Weighted,
  //   symbol: '80MST-20USDM',
  //   tokens: [
  //     {
  //       address: '0x568524da340579887db50ecf602cd1ba8451b243',
  //       weight: '0.8',
  //       symbol: 'MST',
  //       logoURI:
  //         'https://raw.githubusercontent.com/swapsicledex/swapsicle-token-list/master/logos/telos/0x568524DA340579887db50Ecf602Cd1BA8451b243/logo.png',
  //     },
  //     {
  //       address: '0x8f7D64ea96D729EF24a0F30b4526D47b80d877B9',
  //       weight: '0.2',
  //       symbol: 'USDM',
  //       logoURI:
  //         'https://raw.githubusercontent.com/swapsicledex/swapsicle-token-list/master/logos/telos/0x8f7D64ea96D729EF24a0F30b4526D47b80d877B9/logo.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0xbb9d4b931b967639698e6d03e2079eee72f83eb5',
  //     isKilled: false,
  //     relativeWeightCap: '0.05',
  //     addedTimestamp: 1701860941,
  //   },
  // };

  // const Trump_WTLOS: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0x5fc5f565d6e186a7e03b9ee58bdd551ebff0c0bd000200000000000000000014',
  //   address: '0x5fc5f565d6e186a7e03b9ee58bdd551ebff0c0bd',
  //   type: GqlPoolMinimalType.Weighted,
  //   symbol: '69Trump-31WTLOS',
  //   tokens: [
  //     {
  //       address: '0xb754619f355ef11cb36cce70784767ba92264330',
  //       weight: '0.69',
  //       symbol: 'Trump',
  //       logoURI:
  //         'https://raw.githubusercontent.com/swapsicledex/swapsicle-token-list/master/logos/telos/0xb754619F355eF11cb36cce70784767bA92264330/logo.png',
  //     },
  //     {
  //       address: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E',
  //       weight: '0.31',
  //       symbol: 'WTLOS',
  //       logoURI:
  //         'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/telos.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0x55b2341fda3af3b042d4722bf221d324d812bcf2',
  //     isKilled: true,
  //     relativeWeightCap: '0.03',
  //     addedTimestamp: 1701860941,
  //   },
  // };

  // const CMDR_WTLOS: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0x6587a54645c39bc47c96e6f12052db347cc1003a000200000000000000000015',
  //   address: '0x6587a54645c39bc47c96e6f12052db347cc1003a',
  //   type: GqlPoolMinimalType.Weighted,
  //   symbol: '69TCMDR-31WTLOS',
  //   tokens: [
  //     {
  //       address: '0xe9f5cb51f507436e3ddda226c8d3df62fa3e6368',
  //       weight: '0.69',
  //       symbol: 'CMDR',
  //       logoURI:
  //         'https://raw.githubusercontent.com/centfinance/tokenlists/main/src/assets/images/tokens/CMDR.png',
  //     },
  //     {
  //       address: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E',
  //       weight: '0.31',
  //       symbol: 'WTLOS',
  //       logoURI:
  //         'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/telos.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0x465abed4fde9d4fb0291a5e7ff6ef0f75457f362',
  //     isKilled: true,
  //     relativeWeightCap: '0.03',
  //     addedTimestamp: 1701860941,
  //   },
  // };

  // const tSYMM_WTLOS: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0xbf0fa44e5611c31429188b7dcc59ffe794d1980e000200000000000000000009',
  //   address: '0x0CA5D4b7AeEcA61aFF78c8f734596eC88456d5C3',
  //   type: GqlPoolMinimalType.Weighted,
  //   symbol: 'S-80TSYMM-20WTLOS',
  //   tokens: [
  //     {
  //       address: '0xd5f2a24199C3DFc44C1Bf8B1C01aB147809434Ca',
  //       weight: '0.8',
  //       symbol: 'tSYMM',
  //       logoURI:
  //         'https://raw.githubusercontent.com/centfinance/tokenlists/main/src/assets/images/tokens/TSYMM.png',
  //     },
  //     {
  //       address: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E',
  //       weight: '0.2',
  //       symbol: 'WTLOS',
  //       logoURI:
  //         'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/telos.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0x91132ddd744d00d1954b3ee51ffcfde2518bba4c',
  //     isKilled: false,
  //     relativeWeightCap: '1.0',
  //     addedTimestamp: 1701860941,
  //   },
  // };

  // const Team_Allocation: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0x6fbfcf88db1aada31f34215b2a1df7fafb4883e900000000000000000000000c',
  //   address: '',
  //   type: GqlPoolMinimalType.Unknown,
  //   symbol: 'Team Allocation',
  //   tokens: [
  //     {
  //       address: '0xd5f2a24199C3DFc44C1Bf8B1C01aB147809434Ca',
  //       weight: '0.8',
  //       symbol: 'tSYMM',
  //       logoURI:
  //         'https://raw.githubusercontent.com/centfinance/tokenlists/main/src/assets/images/tokens/TSYMM.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0xcda30664d0df20b19cb35a834594fa8a6a001e5c',
  //     isKilled: false,
  //     relativeWeightCap: '0.17',
  //     addedTimestamp: 1701860941,
  //   },
  // };

  // const Burn_tSYMM: ApiVotingPool = {
  //   chain: testnet as GqlChain,
  //   id: '0x6fbfcf88db1aada31f34215b2a1df7fafb4883e900000000000000000000000d',
  //   address: '',
  //   type: GqlPoolMinimalType.Unknown,
  //   symbol: 'Burn tSYMM',
  //   tokens: [
  //     {
  //       address: '0xd5f2a24199C3DFc44C1Bf8B1C01aB147809434Ca',
  //       weight: '0.8',
  //       symbol: 'Burn tSYMM',
  //       logoURI: 'https://em-content.zobj.net/source/apple/391/fire_1f525.png',
  //     },
  //   ],
  //   gauge: {
  //     address: '0x9A287E33d7c5Dd701f47731BeCe88bb0Ee1e06fC',
  //     isKilled: false,
  //     relativeWeightCap: '1.0',
  //     addedTimestamp: 1701860941,
  //   },
  // };

  return [USDC_STLOS, woUSDC_USDT, STLOS_woWTLOS];
}
