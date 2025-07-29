import { Contracts } from '../types';
import * as telos from '@/assets/data/contracts/telos.json';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '',
  merkleOrchardV2: telos.MerkleOrchard,
  multicall: '0xca11bde05977b3631167028862be2a173976ca11',
  authorizer: telos.Authorizer,
  vault: telos.Vault,
  weightedPoolFactory: telos.WeightedPoolFactory,
  stablePoolFactory: telos.ComposableStablePoolFactory,
  lidoRelayer: '',
  balancerHelpers: telos.BalancerHelpers,
  balancerQueries: telos.BalancerQueries,
  batchRelayer: telos.BalancerRelayer,
  veBAL: telos.VotingEscrow,
  gaugeController: telos.GaugeController,
  gaugeFactory: telos.LiquidityGaugeFactory,
  balancerMinter: telos.BalancerMinter,
  tokenAdmin: telos.TSYMMTokenAdmin,
  veDelegationProxy: telos.VotingEscrowDelegationProxy,
  veBALHelpers: '',
  feeDistributor: telos.FeeDistributor,
  feeDistributorDeprecated: '',
  faucet: '',
  omniVotingEscrow: '',
};

export default contracts;
