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
  erc4626Relayer: '0x1cC9c95e86656208D815b901859916Ab62920cf4',
  lidoRelayer: '',
  balancerHelpers: telos.BalancerHelpers,
  balancerQueries: telos.BalancerQueries,
  batchRelayer: telos.BalancerRelayer,
  veBAL: '',
  veDelegationProxy: '0x21Fb7dAe840A704AAd156fDC80dD0ed2B4c23477',
  gaugeController: '',
  gaugeFactory: '0x42cbd18265C829f50Ededd4E5B5E5F5855e25175',
  balancerMinter: '0x6b46b3c2b89fB1285b87a247c6f9bD81ED41ebfe',
  tokenAdmin: '',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  omniVotingEscrow: '',
};

export default contracts;
