<script setup lang="ts">
import StakedPoolsTable from '@/components/contextual/pages/pools/StakedPoolsTable.vue';
import StakedPointsPoolsTable from '@/components/contextual/pages/pools/StakedPointsPoolsTable.vue';
import UnstakedPoolsTable from '@/components/contextual/pages/pools/UnstakedPoolsTable.vue';
import VeBalPoolTable from '@/components/contextual/pages/pools/VeBalPoolTable.vue';
import PortfolioPageHero from '@/components/heros/PortfolioPageHero.vue';
import { useLock } from '@/composables/useLock';
import { providerUserPools } from '@/providers/local/user-pools.provider';
import { provideUserStaking } from '@/providers/local/user-staking.provider';
import UserInvestedInAffectedPoolAlert from '@/pages/recovery-exit/UserInvestedInAffectedPoolAlert.vue';
import { isVeBalSupported } from '@/composables/useVeBAL';
import { configService } from '@/services/config/config.service';
import LpVaultPoolTable from '@/components/contextual/pages/pools/LpVaultPoolTable.vue';
import OldLpVaultPoolTable from '@/components/contextual/pages/pools/OldLpVaultPoolTable.vue';
import { useLpVault } from '@/composables/useLpVault';
import { useOldLpVault } from '@/composables/useOldLpVault';
/**
 * PROVIDERS
 */
const userStaking = provideUserStaking();
providerUserPools(userStaking);

const isPointsSupported = computed(
  () => configService.network.pools.PointsGauges
);

/**
 * COMPOSABLES
 */
const { lockPool, lock } = useLock();

const { lockPool: lpVaultPool, lock: lpVault } = useLpVault();
console.log(lpVaultPool, lpVault);

const { lockPool: oldLpVaultPool, lock: oldLpVault } = useOldLpVault();

const isTaiko = computed(() => {
  return configService.network.chainId === 167000;
});

const isTelos = computed(() => {
  return configService.network.chainId === 40;
});
</script>

<template>
  <div>
    <PortfolioPageHero />
    <div class="xl:container xl:px-4 pt-10 md:pt-12 xl:mx-auto">
      <BalStack vertical>
        <UserInvestedInAffectedPoolAlert />
        <div class="px-4 xl:px-0">
          <BalStack horizontal justify="between" align="center">
            <h3>{{ $t('myLiquidityInBalancerPools') }}</h3>
          </BalStack>
        </div>
        <BalStack vertical spacing="2xl">
          <UnstakedPoolsTable />
          <StakedPointsPoolsTable v-if="isPointsSupported" />
          <StakedPoolsTable v-if="isVeBalSupported || isTelos" />
          <VeBalPoolTable
            v-if="lockPool && Number(lock?.lockedAmount) > 0"
            :lock="lock"
            :lockPool="lockPool"
          />
          <LpVaultPoolTable
            v-if="isTaiko && lpVaultPool && Number(lpVault?.lockedAmount) > 0"
            :lock="lpVault"
            :lockPool="lpVaultPool"
          />
          <OldLpVaultPoolTable
            v-if="
              !isTaiko && oldLpVaultPool && Number(oldLpVault?.lockedAmount) > 0
            "
            :lock="oldLpVault"
            :lockPool="oldLpVaultPool"
          />
        </BalStack>
      </BalStack>
    </div>
  </div>
</template>
