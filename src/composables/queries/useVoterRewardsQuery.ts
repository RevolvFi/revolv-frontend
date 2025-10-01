import { computed, reactive } from 'vue';
import { useQuery, UseQueryOptions } from '@tanstack/vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import { networkId, networkSlug } from '../useNetwork';

/**
 * TYPES
 */
type Proof = {
  identifier: string;
  token: string;
  user: string;
  amount: string;
  deadline: number;
  proof: string[];
  root: string;
  claimed: string;
  claimable: string;
};

type ProofsResponse = {
  proofs: {
    [deadline: string]: Proof[];
  };
  totals: {
    [token: string]: string;
  };
};

export type VoterRewardsQueryResponse = {
  proofs: Proof[];
  totals: {
    [token: string]: string;
  };
};

type QueryOptions = UseQueryOptions<VoterRewardsQueryResponse>;

/**
 * @summary Fetches claimable voter reward proofs.
 */
export default function useVoterRewardsQuery(options: QueryOptions = {}) {
  /**
   * COMPOSABLES
   */
  const { account, isWalletReady } = useWeb3();

  /**
   * COMPUTED
   */
  const enabled = computed(() => isWalletReady.value && account.value != null);

  /**
   * QUERY KEY
   */
  const queryKey = reactive(QUERY_KEYS.Claims.Voter(networkId, account));

  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    try {
      const response = await fetch(
        `https://incentives.revolv.workers.dev/${networkSlug}/proofs/${account.value}`
      );

      console.log('response', response);

      if (!response.ok) {
        throw new Error('Failed to fetch voter rewards');
      }

      const data: ProofsResponse = await response.json();

      // Flatten all proofs from different deadlines into a single array
      const allProofs = Object.values(data.proofs).flat();

      return {
        proofs: allProofs,
        totals: data.totals,
      };
    } catch (error) {
      console.error('Failed to fetch voter rewards', error);
      return {
        proofs: [],
        totals: {},
      };
    }
  };

  /**
   * QUERY OPTIONS
   */
  const queryOptions = reactive({
    enabled,
    ...options,
  });

  return useQuery<VoterRewardsQueryResponse>(
    queryKey,
    queryFn,
    queryOptions as QueryOptions
  );
}
