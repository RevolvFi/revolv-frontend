import { Pool } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';

import { useTokens } from '@/providers/tokens.provider';
import { useUserData } from '@/providers/user-data.provider';
import usePoolQuery from './queries/usePoolQuery';
import { fiatValueOf } from './usePoolHelpers';
import useVeBal, { isVeBalSupported } from './useVeBAL';
import { bnum } from '@/lib/utils';
import { configService } from '@/services/config/config.service';

interface Options {
  enabled?: boolean;
}
export function useLock({ enabled = true }: Options = {}) {
  /**
   * COMPOSABLES
   */
  const { lockablePoolId } = useVeBal();
  const { getToken, balanceFor } = useTokens();
  console.log(lockablePoolId.value);

  /**
   * COMPUTED
   */
  // Check if we should lock RVLV tokens directly (for Revolv) or LP tokens (for other networks)
  const shouldLockRvlvDirectly = computed(() => {
    // For Revolv, we lock RVLV tokens directly instead of LP tokens
    return configService.network.chainId === 40; // Telos chain ID
  });

  const shouldFetchLockPool = computed(
    (): boolean =>
      isVeBalSupported.value && enabled && !shouldLockRvlvDirectly.value
  );

  const lockPoolQuery = usePoolQuery(
    lockablePoolId.value as string,
    shouldFetchLockPool
  );
  const { lockQuery } = useUserData();

  /**
   * COMPUTED
   */
  const isLoadingLockPool = computed(
    (): boolean => lockPoolQuery.isLoading.value
  );

  const isLoadingLockInfo = computed((): boolean => lockQuery.isLoading.value);

  const isLoadingLock = computed(
    (): boolean => isLoadingLockPool.value || isLoadingLockInfo.value
  );

  const lockPool = computed<Pool | undefined>(() => lockPoolQuery.data.value);

  const lockPoolToken = computed((): TokenInfo | null =>
    lockPool.value != null ? getToken(lockPool.value.address) : null
  );

  const lock = computed(() => lockQuery.data.value);

  // Total fiat value of locked tokens.
  const totalLockedValue = computed((): string => {
    if (shouldLockRvlvDirectly.value) {
      // For RVLV direct locking, we need to get the RVLV token price and calculate fiat value
      const rvlvToken = getToken(configService.network.tokens.Addresses.BAL);
      if (rvlvToken && lock.value?.hasExistingLock) {
        // This would need to be implemented based on how you get RVLV token price
        // For now, returning the locked amount as a placeholder
        return lock.value.lockedAmount;
      }
      return '0';
    } else {
      // Original LP token locking logic
      return lockPool.value && lock.value?.hasExistingLock
        ? fiatValueOf(lockPool.value, lock.value.lockedAmount)
        : '0';
    }
  });

  // Total locked shares (veBAL/veRVLV).
  const totalLockedShares = computed((): string =>
    lock.value?.hasExistingLock ? lock.value.lockedAmount : '0'
  );

  const bptPrice = computed(() => {
    if (shouldLockRvlvDirectly.value) {
      // For RVLV direct locking, return 1 as we're locking the token directly
      return bnum(1);
    }
    if (!lockPool.value) return bnum(0);
    return bnum(lockPool.value.totalLiquidity).div(lockPool.value.totalShares);
  });

  const bptBalance = computed(() => {
    if (shouldLockRvlvDirectly.value) {
      // For RVLV direct locking, return RVLV token balance
      return balanceFor(configService.network.tokens.Addresses.BAL);
    }
    if (!lockPool.value) return bnum(0);
    return balanceFor(lockPool.value.address);
  });

  const fiatTotal = computed(() =>
    bptPrice.value.times(bptBalance.value).toString()
  );

  return {
    isLoadingLockPool,
    isLoadingLockInfo,
    isLoadingLock,
    lockPoolToken,
    lockPool,
    lock,
    totalLockedValue,
    totalLockedShares,
    bptBalance,
    fiatTotal,
    shouldLockRvlvDirectly,
  };
}
