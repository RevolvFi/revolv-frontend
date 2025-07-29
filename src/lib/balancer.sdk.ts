import { BalancerSDK } from '@symmetric-v3/sdk';
import { Network } from '@/lib/config/types';
import { configService } from '@/services/config/config.service';
import { ref } from 'vue';
import { isTestMode } from '@/plugins/modes';
import { subgraphFallbackService } from '@/services/balancer/subgraph/subgraph-fallback.service';

// const customNetwork = {
//   chainId: configService.network.chainId,
//   addresses: {
//     contracts: {
//       vault: configService.network.addresses.vault,
//       multicall: configService.network.addresses.multicall,
//       poolDataQueries: configService.network.addresses.balancerQueries,
//       balancerHelpers: configService.network.addresses.balancerHelpers,
//       balancerRelayer: configService.network.addresses.batchRelayer,
//       weightedPoolFactory: configService.network.addresses.weightedPoolFactory,
//       composableStablePoolFactory:
//         configService.network.addresses.stablePoolFactory,
//     },
//     tokens: {
//       wrappedNativeAsset: configService.network.tokens.Addresses.wNativeAsset,
//       stETH: configService.network.tokens.Addresses.wstETH,
//       wstETH: configService.network.tokens.Addresses.wstETH,
//       bal: configService.network.tokens.Addresses.wNativeAsset,
//     },
//   },
//   urls: {
//     subgraph:
//       'https://app.goldsky.com/dashboard/subgraphs/symmetric-telos-testnet/1.0.0',
//     gaugesSubgraph: '',
//     blockNumberSubgraph: '',
//   },
//   thirdParty: {
//     coingecko: {
//       nativeAssetId: 'telos',
//       platformId: 'telos',
//     },
//   },
//   pools: {},
// };

export const balancer = new BalancerSDK({
  network: configService.network.chainId as Network,
  rpcUrl: configService.rpc,
  customSubgraphUrl: configService.network.subgraph,
  sor: {
    tokenPriceService: 'subgraph',
  },
});

export const hasFetchedPoolsForSor = ref(false);

export async function fetchPoolsForSor() {
  if (hasFetchedPoolsForSor.value) return;

  console.time('fetchPoolsForSor');
  try {
    await balancer.swaps.fetchPools();
    // if (configService.network.chainId === 40) {
    //   await telosOld.swaps.fetchPools();
    // }
  } catch (e) {
    const subgraphBlock = (await subgraphFallbackService.get({
      query: '{ _meta { block { number } } }',
    })) as any;
    await balancer.swaps.fetchPools({
      block: { number: subgraphBlock.data.data._meta.block.number },
    });
    console.error('Error fetching pools for SOR', e);
  }
  hasFetchedPoolsForSor.value = true;
  console.timeEnd('fetchPoolsForSor');
}

if (!isTestMode()) fetchPoolsForSor();
