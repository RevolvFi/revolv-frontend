<script lang="ts" setup>
import useBreakpoints from '@/composables/useBreakpoints';
import useDarkMode from '@/composables/useDarkMode';
import useNetwork from '@/composables/useNetwork';

/**
 * COMPOSABLES
 */
const { isMobile } = useBreakpoints();
const { darkMode, toggleDarkMode } = useDarkMode();

const { networkSlug } = useNetwork();

const hasLightMode = computed(() => {
  return (
    networkSlug !== 'taiko' &&
    networkSlug !== 'etherlink' &&
    networkSlug !== 'telos'
  );
});
</script>

<template>
  <BalBtn
    v-if="hasLightMode"
    color="white"
    :size="isMobile ? 'md' : 'sm'"
    :circle="isMobile"
    @click="toggleDarkMode"
  >
    <MoonIcon v-if="darkMode" />
    <SunIcon v-else />
  </BalBtn>
</template>
s