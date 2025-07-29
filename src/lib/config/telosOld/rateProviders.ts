import { RateProviders } from '../types';

const rateProviders: RateProviders = {
  '*': {
    '0x0000000000000000000000000000000000000000': true,
  },
  '0xb4b01216a5bc8f1c8a33cd990a1239030e60c905': {
    '0x9a8f4ba7d632e0d510e7982ff5a9c9e898c102b9': true,
  },
  '0x953808ef6be397925f71ec0e8892e246882e4804': {
    '0xff4cda0e94eb73a0c77eb490688db5ba792874ec': true,
  }, //woUSDC
  '0x181f14262e2efd4df781079437eba1aed3343898': {
    '0xea6ef7767f63648d5064ee8ddb2c30f79163c8e1': true,
  }, //woUSDT
  '0x8edc3bdd08980d5f6672f243cebc58c6c117956a': {
    '0x77b00f59b2c4eaec3339fbdf5e4b10b13f172c45': true,
  }, //woUSDM
};

export default rateProviders;
