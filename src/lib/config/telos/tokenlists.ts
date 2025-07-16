import { TokenListURLMap } from '@/types/TokenList';

const tokenlists: TokenListURLMap = {
  Balancer: {
    Allowlisted:
      'https://raw.githubusercontent.com/revolvfi/tokenlists/main/generated/symmetric.tokenlist.json',
  },
  External: [
    // 'https://raw.githubusercontent.com/telosnetwork/token-list/main/telosevm.tokenlist.json',
    // 'https://raw.githubusercontent.com/swapsicledex/swapsicle-default-token-list/master/swapsicle.tokenlist.json',
  ],
};

export default tokenlists;
