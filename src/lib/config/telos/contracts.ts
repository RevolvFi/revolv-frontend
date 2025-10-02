import { Contracts } from '../types';
import * as telos from '@/assets/data/contracts/telos.json';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '',
  merkleOrchardV2: '',
  multicall: '0xca11bde05977b3631167028862be2a173976ca11',
  authorizer: telos.Authorizer,
  vault: telos.Vault,
  weightedPoolFactory: telos.WeightedPoolFactory,
  stablePoolFactory: telos.ComposableStablePoolFactory,
  erc4626Relayer: '0xdC8A3460B82AffB73Fbe66c96e62E27046E3E9B7',
  lidoRelayer: '',
  balancerHelpers: telos.BalancerHelpers,
  balancerQueries: telos.BalancerQueries,
  batchRelayer: telos.BalancerRelayer,
  veBAL: '0xae7B66be62a60A264483E843Df8573c645268413',
  veDelegationProxy: telos.VotingEscrowDelegationProxy,
  gaugeController: '0xCDC8ECa6d43600940262a565724b3152ab768a6B',
  gaugeFactory: telos.NoTokenAdminGaugeFactory,
  balancerMinter: telos.L2BalancerPseudoMinter,
  tokenAdmin: '',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  omniVotingEscrow: '',
  bribeMarket: telos.BribeMarket,
  bribeVault: telos.BribeVault,
  rewardDistributor: '0x40e2786869b59c5cbf309e76184d4d299069e2f5',
};

export default contracts;
