import { TokenConstants } from '../types';

const tokens: TokenConstants = {
  Popular: {
    Symbols: ['TSYMM', 'WTLOS', 'USDC', 'USDT', 'STLOS'],
  },
  InitialSwapTokens: {
    input: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    output: '0x8d97cea50351fb4329d591682b148d43a0c3611b',
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E',
    WETH: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E',
    BAL: '0x98A5030a449D8833166c3F1d96Db00BA2a082FbF',
    rETH: '',
    reward: '0xd102ce6a4db07d247fcc28f366a623df0938ca9e',
    rewards:
      '0xd102ce6a4db07d247fcc28f366a623df0938ca9e,0x8f7d64ea96d729ef24a0f30b4526d47b80d877b9',
    // erc4626Wrappers: {
    //   '0xf1815bd50389c46847f0bda824ec8da914045d14':
    //     '0x59716b2745ab9639b1685609863b3bd63873ad02', //woUSDC.e
    //   '0x674843c06ff83502ddb4d37c2e09c01cda38cbc8':
    //     '0x738471f8cb40aefc54a95e08c574619495958e31', //woUSDT
    //   '0x8f7d64ea96d729ef24a0f30b4526d47b80d877b9':
    //     '0x331a4cd2bdb5b27f41d84b0b9f029829934f7327', //woUSDM
    //   '0xd102ce6a4db07d247fcc28f366a623df0938ca9e':
    //     '0xd9d50bc52061bb29045da753776b1367fa6e3ad0', //woWTLOS
    // },
    // wstETH: '0xB4B01216a5Bc8F1C8A33CD990A1239030E60C905',
  },
  Wrappers: [
    {
      underlying: '0xf1815bd50389c46847f0bda824ec8da914045d14', //USDC.e
      wrapper: '0x59716b2745ab9639b1685609863b3bd63873ad02',
      // aToken: '0xFF8309b9e99bfd2D4021bc71a362aBD93dBd4785', // aUSDC
    },
    {
      underlying: '0x674843c06ff83502ddb4d37c2e09c01cda38cbc8', //USDT
      wrapper: '0x738471f8cb40aefc54a95e08c574619495958e31',
      // aToken: '0xDeE98402A302e4D707fB9bf2bac66fAEEc31e8Df', // aUSDT
    },
    {
      underlying: '0x8f7d64ea96d729ef24a0f30b4526d47b80d877b9', //USDM
      wrapper: '0x331a4cd2bdb5b27f41d84b0b9f029829934f7327',
      // aToken: '0xDeE98402A302e4D707fB9bf2bac66fAEEc31e8Df', // aUSDT
    },
    {
      underlying: '0xd102ce6a4db07d247fcc28f366a623df0938ca9e', //WTLOS
      wrapper: '0xd9d50bc52061bb29045da753776b1367fa6e3ad0',
      // aToken: '0xDeE98402A302e4D707fB9bf2bac66fAEEc31e8Df', // aWTLOS
    },
  ],
  PriceChainMap: {
    /**
     * Addresses must be lower case and map from goerli to mainnet, e.g
     * [goerli address]: mainnet address
     */
    // USDT
    '0x975ed13fa16857e83e7c493c7741d556eaad4a3f':
      '0xdac17f958d2ee523a2206206994597c13d831ec7',
    // USDC
    '0x8d97cea50351fb4329d591682b148d43a0c3611b':
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    // '0xd102ce6a4db07d247fcc28f366a623df0938ca9e':
    //   '0x7825e833d495f3d1c28872415a4aee339d26ac88',
  },
};

export default tokens;
