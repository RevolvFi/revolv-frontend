import { Pools, PoolFeature } from '@/types/pools';
import { Protocol } from '@/composables/useProtocols';

const pools: Pools = {
  IdsMap: {
    veBAL: '',
  },
  Pagination: {
    PerPage: 15,
    PerPool: 15,
    PerPoolInitial: 5,
  },
  BoostsEnabled: false,
  DelegateOwner: '0xa29F1CA1957c164877F6A277C9791ACA3Ad4BD6D',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: [],
  },
  BlockList: [
    '0x7549ed894be102568e482a523f648f25f443a0f2000000000000000000000012',
  ],
  IncludedPoolTypes: [
    'Weighted',
    'Stable',
    'MetaStable',
    'LiquidityBootstrapping',
    'Investment',
    'StablePhantom',
    'ComposableStable',
    'Managed',
  ],
  Stable: {
    AllowList: [
      // '0x9c9fab6ffadb6de10964156ee03f823b53a594fe000000000000000000000002', // S-STLOS-WTLOS
      // '0x301b19cf456ac3d988a7390e5e869465d9c8edd6000000000000000000000003', // S-USDC-USDT"
      // '0x692745235f6f5da540d2ac066f16fdd5871ecc1d000000000000000000000005', // S-wUSK-USDC
      // '0x902ae4c6758a4b18324a4f06b053a1e0f397ee27000000000000000000000004', // S-USDM-USDC-USDT
      // '0x9c9fab6ffadb6de10964156ee03f823b53a594fe000000000000000000000002', // S-USDC-USDT
      // '0x8bccaa934691d514e43b5f4a827766ca4c79deb8000000000000000000000010', // S-wUSK-USDC.e
      // '0xf790d27623c78780f7a6448cbc70024fdf34ce0f00000000000000000000000f', // S-USDM-USDC.e-USDT
      // '0x0de0a7139287d7a5c4355872da97aa10e18116b500000000000000000000000e', // S-USDC.e-USDT
      '0x167c36cd8c47cbac4555fb84b96fb4a632b2c2d4000000000000000000000011', // S-woUSDC.e-woUSDT
      '0x1a663197ade0f6cc259fd8418d9fe2d4a7dd05a5000000000000000000000014', // S-STLOS-woWTLOS
      '0x64ee13e072764094d46912046a92436b6a264729000000000000000000000017', // R-woUSDC.e-woUSDT
      '0xd9f435165a1432e64c33547aaf1c76f6b7971dc8000000000000000000000018', // R-STLOS-woWTLOS
    ],
  },
  Investment: {
    AllowList: [],
  },
  Weighted: {
    // Only effective after given timestamp here: usePool.ts#createdAfterTimestamp
    // see useDisabledJoinPool.ts#nonAllowedWeightedPoolAfterTimestamp for logic.
    AllowList: [
      // '0x1120ae5bcd8736a3f6ff1c2bfc22413db95e6ede000200000000000000000007', // S-60WTLOS-40USDC
      // '0x1fbbf321ec3598f5260b1581a8dfdbe08d902cf7000100000000000000000008', // S-40BTC.b-40ETH-20USDC
      // '0x321bda978f6c742b3050ebeeefaca9d83fc975cb000200000000000000000006', // S-80WTLOS-20USDT
      // '0x6ec6dab312a3dab963e519b0c44520acaaa6f342000200000000000000000009', // S-80STLOS-20wUSK
      // '0x7bb386b78d4f1ed654a3bf1e7081dcda4d8a320400020000000000000000000a', // S-80MST-20USDM
      '0x61fc76a676ef4a4692d811b6c102edcf9e8c4c3b00010000000000000000000d', //S-40WBTC-40WETH-20USDC.e
      // '0x38fcff8799e92dde4be5cfcf9bcd69f1c9bc9d7a00020000000000000000000c', // S-60WTLOS-40USDC.e
      // '0x64a819210c9c3a198cc0efedaca48a8a8d47511000020000000000000000000b', //S-80WTLOS-20USDT
      '0xcf6f341edc35b4554b823be127956a37eeb9ac8d000200000000000000000013', // S-50USDC.e-50STLOS
      '0x608edb650cb850c65dad07b90900863aa77f474e000100000000000000000015', // R-40WBTC-40WETH-20USDC.e
      '0x7629abad9d7e2d323584717d8dde5bbd3bce6df0000200000000000000000016', // R-50woUSDC.e-50STLOS
    ],
  },
  Factories: {
    '0xeec5208655feaa474d210cb4b2284af5142ba8ef': 'weightedPool', // Weighted V5
    '0xac584a7ca52f852be3facb359f1959a3b698e6c1': 'composableStablePool', // ComposableStable V5
  },
  Stakable: {
    VotingGaugePools: [],
    AllowList: [
      // '0x61fc76a676ef4a4692d811b6c102edcf9e8c4c3b00010000000000000000000d', //S-40WBTC-40WETH-20USDC.e
      // '0x167c36cd8c47cbac4555fb84b96fb4a632b2c2d4000000000000000000000011', // S-woUSDC.e-woUSDT
      // '0xcf6f341edc35b4554b823be127956a37eeb9ac8d000200000000000000000013', // S-50USDC.e-50STLOS
      '0x64ee13e072764094d46912046a92436b6a264729000000000000000000000017', // R-woUSDC.e-woUSDT
      '0xd9f435165a1432e64c33547aaf1c76f6b7971dc8000000000000000000000018', // R-STLOS-woWTLOS
      '0x608edb650cb850c65dad07b90900863aa77f474e000100000000000000000015', // R-40WBTC-40WETH-20USDC.e
      '0x7629abad9d7e2d323584717d8dde5bbd3bce6df0000200000000000000000016', // R-50woUSDC.e-50STLOS
    ],
  },
  Metadata: {
    '0x64ee13e072764094d46912046a92436b6a264729000000000000000000000017': {
      features: {
        [PoolFeature.YieldAccelerated]: {
          featureProtocols: [Protocol.Meridian],
        },
      },
    },
    '0xd9f435165a1432e64c33547aaf1c76f6b7971dc8000000000000000000000018': {
      features: {
        [PoolFeature.YieldAccelerated]: {
          featureProtocols: [Protocol.Meridian],
        },
      },
    },
    '0x7629abad9d7e2d323584717d8dde5bbd3bce6df0000200000000000000000016': {
      features: {
        [PoolFeature.YieldAccelerated]: {
          featureProtocols: [Protocol.Meridian],
        },
      },
    },
  },
  Deep: [
    // '0x5e99843486cf052baf0925a0cdeb40920477295900000000000000000000000b', // USDM/USDC-USDT
  ],
  Erc4626: {
    '0x64ee13e072764094d46912046a92436b6a264729000000000000000000000017': {
      underlying: [
        '0xf1815bd50389c46847f0bda824ec8da914045d14', // USDC.e
        '0x674843c06ff83502ddb4d37c2e09c01cda38cbc8', // USDT
      ],
      wrappers: [
        '0x59716b2745ab9639b1685609863b3bd63873ad02',
        '0x738471f8cb40aefc54a95e08c574619495958e31',
      ],
      tokensList: [
        '0x64ee13e072764094d46912046a92436b6a264729',
        '0x59716b2745ab9639b1685609863b3bd63873ad02',
        '0x738471f8cb40aefc54a95e08c574619495958e31',
      ],
    }, // R-woUSDC.e-woUSDT
    '0xd9f435165a1432e64c33547aaf1c76f6b7971dc8000000000000000000000018': {
      underlying: [
        '0xd102ce6a4db07d247fcc28f366a623df0938ca9e', // WTLOS
      ],
      wrappers: [
        '0xd9d50bc52061bb29045da753776b1367fa6e3ad0', // woWTLOS
      ],
      tokensList: [
        '0xd9f435165a1432e64c33547aaf1c76f6b7971dc8',
        '0xb4b01216a5bc8f1c8a33cd990a1239030e60c905',
        '0xd9d50bc52061bb29045da753776b1367fa6e3ad0',
      ],
    }, // R-STLOS-woWTLOS
    '0x7629abad9d7e2d323584717d8dde5bbd3bce6df0000200000000000000000016': {
      underlying: [
        '0xf1815bd50389c46847f0bda824ec8da914045d14', // USDC.e
      ],
      wrappers: ['0x59716b2745ab9639b1685609863b3bd63873ad02'], // woUSDC.e
      tokensList: [
        '0x59716b2745ab9639b1685609863b3bd63873ad02', // woUSDC.e
        '0xb4b01216a5bc8f1c8a33cd990a1239030e60c905', // STLOS
      ],
    }, // R-50woUSDC.e-50STLOS
  },
  Deprecated: {},
  GaugeMigration: {},
  BoostedApr: [],
  DisabledJoins: [],
  Issues: {},
};

export default pools;
