<script lang="ts" setup>
import { useRoute } from 'vue-router';
import DesktopLinkItem from './DesktopLinkItem.vue';
import useNetwork, {
  isTestnet,
  veSymbol,
  // isTelos,
} from '@/composables/useNetwork';
import { Goals, trackGoal } from '@/composables/useFathom';
import { isVeBalSupported, isGaugesSupported } from '@/composables/useVeBAL';
import { configService } from '@/services/config/config.service';

/**
 * COMPOSABLES
 */
const route = useRoute();
const { networkSlug } = useNetwork();

const isPointsSupported = computed(
  () => configService.network.pools.PointsGauges
);

const isLpVaultSupported = computed(
  () => configService.network.addresses.lpVault
);

// Add a new computed property for screen size
const isSmallScreen = computed(() => window.innerWidth < 1180); // Adjust the breakpoint as needed

/**
 * METHODS
 */
function isActive(page: string): boolean {
  if (route.name === page) return true;
  return false;
}
</script>

<template>
  <div class="desktop-links">
    <DesktopLinkItem
      :to="{ name: 'home', params: { networkSlug } }"
      :active="isActive('home')"
      prefetch
      @click="trackGoal(Goals.ClickNavPools)"
    >
      {{ $t('pool') }}
    </DesktopLinkItem>
    <DesktopLinkItem
      :to="{ name: 'swap', params: { networkSlug } }"
      :active="isActive('swap')"
      prefetch
      @click="trackGoal(Goals.ClickNavSwap)"
    >
      {{ $t('swap') }}
    </DesktopLinkItem>
    <DesktopLinkItem
      v-if="isGaugesSupported"
      :to="{ name: 'claim', params: { networkSlug } }"
      :active="isActive('claim')"
      prefetch
      @click="trackGoal(Goals.ClickNavClaim)"
    >
      <div class="flex items-center">
        {{ $t('claim') }}
      </div>
    </DesktopLinkItem>

    <DesktopLinkItem
      v-if="isTestnet"
      :to="{ name: 'faucet', params: { networkSlug } }"
      :active="isActive('faucet')"
    >
      Faucet
    </DesktopLinkItem>
    <DesktopLinkItem
      :to="{ name: 'portfolio', params: { networkSlug } }"
      :active="isActive('portfolio')"
      prefetch
      @click="trackGoal(Goals.ClickNavPortfolio)"
    >
      {{ $t('portfolio') }}
    </DesktopLinkItem>
    <DesktopLinkItem
      v-if="isVeBalSupported"
      :to="{ name: 'vervlv', params: { networkSlug } }"
      :active="isActive('vervlv')"
      prefetch
      @click="trackGoal(Goals.ClickNavVebal)"
    >
      {{ veSymbol }}
    </DesktopLinkItem>
    <DesktopLinkItem
      v-if="isVeBalSupported"
      :to="{ name: 'incentivize', params: { networkSlug } }"
      :active="isActive('incentivize')"
      prefetch
      @click="trackGoal(Goals.ClickNavIncentivize)"
    >
      {{ $t('incentivize.name') }}
    </DesktopLinkItem>
    <DesktopLinkItem
      v-if="isPointsSupported"
      :to="{ name: 'symm-points', params: { networkSlug } }"
      :active="isActive('symm-points')"
      prefetch
      @click="trackGoal(Goals.ClickNavPoints)"
    >
      <span
        class="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-pink-500 to-yellow-500"
        >SYMM Points</span
      >
    </DesktopLinkItem>
    <DesktopLinkItem
      v-if="isLpVaultSupported"
      :to="{ name: 'taiko-lp-vault', params: { networkSlug } }"
      :active="isActive('taiko-lp-vault')"
      prefetch
      @click="trackGoal(Goals.ClickNavPoints)"
    >
      <span
        :class="[
          'golden-border-text',
          { 'is-active': isActive('taiko-lp-vault') },
          { 'small-screen': isSmallScreen },
        ]"
      >
        {{ isSmallScreen ? 'LP Vault' : 'Taiko LP Vault' }}
      </span>
    </DesktopLinkItem>
    <!-- <a
      v-if="isTelos"
      href="https://telos-v1.symm.fi"
      target="_blank"
      class="flex overflow-hidden relative flex-row gap-1 justify-center items-center p-0 h-full transition-all duration-500 ease-in-out cursor-pointer hover:text-purple-600 dark:hover:text-yellow-500"
    >
      Telos V1
      <BalIcon name="arrow-up-right" size="xs" />
    </a> -->
    <!-- <DesktopLinkItem
      v-if="isVeBalSupported"
      :to="{ name: 'airdrop', params: { networkSlug } }"
      :active="isActive('airdrop')"
      prefetch
      @click="trackGoal(Goals.ClickNavVebal)"
    >
      Airdrop
    </DesktopLinkItem> -->
  </div>
</template>

<style scoped>
.desktop-links {
  @apply grid gap-6 grid-flow-col grid-rows-1 h-full content-center;
}

.golden-border-text {
  position: relative;
  display: inline-block;
  padding: 6px 12px;
  color: white;
  border-radius: 8px; /* Reduced border radius */
  transition: color 0.3s ease;
}

.golden-border-text::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid transparent;
  border-radius: 8px; /* Reduced border radius */
  background: linear-gradient(
      90deg,
      #d4af37,
      #c5a028,
      #e0c158,
      #c5a028,
      #d4af37
    )
    border-box;
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask-composite: destination-out;
  mask-composite: exclude;
  background-size: 400% 100%;
  transition: background-position 0.3s ease;
}

.golden-border-text:not(.is-active):hover::before {
  animation: shimmer 1.5s linear infinite;
}

.golden-border-text.is-active {
  color: #d4af37; /* Less yellow gold for active text */
}

.golden-border-text.is-active::before {
  background-position: 0 0; /* Static position for active state */
  animation: none; /* Ensure no animation for active state */
}

.golden-border-text.small-screen {
  padding: 4px 8px;
  font-size: 0.9em;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
}
</style>
