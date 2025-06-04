import { RateProviders } from '../types';

const rateProviders: RateProviders = {
  '*': {
    '0x0000000000000000000000000000000000000000': true,
  },
  '0xb4b01216a5bc8f1c8a33cd990a1239030e60c905': {
    '0x9a8f4ba7d632e0d510e7982ff5a9c9e898c102b9': true,
  },
  '0xfdff55a36f3dd3942a4ac5aebe68972d57296925': {
    '0x3c8b7581f87cdc3cd5744da4e8fabb78ef7fae3f': true,
  },
  '0x59716b2745ab9639b1685609863b3bd63873ad02': {
    // usdc.e
    '0xbba46d4fd2309fe16ffc6be1decffe3b5dc13cea': true,
  },
  '0x738471f8cb40aefc54a95e08c574619495958e31': {
    // usdt
    '0xb425f56a141952f00876f60b8a25d32d536ec808': true,
  },
  '0x331a4cd2bdb5b27f41d84b0b9f029829934f7327': {
    // usdm
    '0xab3e6cc591f6ce1ad5a672c236cf61a9177482c4': true,
  },
  '0xd9d50bc52061bb29045da753776b1367fa6e3ad0': {
    // wtlos
    '0xfed5b6da563e80401f7e09b598b65e5fedbd00e8': true,
  },
};

export default rateProviders;
