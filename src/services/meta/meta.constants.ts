import { lpToken, veSymbol } from '@/composables/useNetwork';

export const ROUTE_META_DATA = {
  home: {
    metaTitle: 'Revolv DeFi Liquidity Pools on [network_name]',
    metaDescription:
      'Explore DeFi liquidity pools or create your own. Provide liquidity to accumulate yield from swap fees while retaining your token exposure as prices move',
    metaKeywords: '',
  },
  pool: {
    metaTitle: '[pool_symbol]',
    metaDescription: '[pool_name] — a Revolv [pool_type] pool',
  },
  swap: {
    metaTitle: 'Swap DeFi tokens on [network_name]',
    metaDescription:
      'Swap ERC-20 tokens using Revolv liquidity or with CoW protocol for gas-less signature trades, MEV protection and the best prices via intelligent routing across DeFi exchanges',
  },
  claim: {
    metaTitle: 'Claim liquidity mining incentives from staking',
    metaDescription: `LPs who stake can claim liquidity mining incentives. ${veSymbol.value} holders can boost incentives and claim their share of protocol revenue`,
  },
  portfolio: {
    metaTitle: 'Revolv portfolio',
    metaDescription:
      'Track your Revolv Portfolio, including your unstaked and stake LP positions',
  },
  vebal: {
    metaTitle: `${veSymbol.value} tokenomics`,
    metaDescription: `Get ${veSymbol.value} (voter escrowed ${lpToken}) for extra liquidity mining incentives, governance voting power and a share of protocol revenue`,
  },
  'terms-of-use': {
    metaTitle: 'Revolv Terms of Use',
    metaDescription: 'The rules for the use of the website',
  },
  'privacy-policy': {
    metaTitle: 'Revolv Privacy Policy',
    metaDescription:
      'How this website collects, uses and shares personal information',
  },
  'cookies-policy': {
    metaTitle: 'Revolv Cookie Policy',
    metaDescription: 'How this website uses browser cookies',
  },
  risks: {
    metaTitle: 'Revolv Protocol Risks',
    metaDescription: 'The risks of using the Revolv Protocol',
  },
};
