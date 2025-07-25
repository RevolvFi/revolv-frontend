import { ref } from 'vue';

import LS_KEYS from '@/constants/local-storage.keys';
import { lsSet } from '@/lib/utils';
import { networkSlug } from './useNetwork';

// const osDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
// const lsDarkMode =
//   lsGet(LS_KEYS.App.DarkMode, osDarkMode.toString()) === 'true';

const lsDarkMode = ref(LS_KEYS.App.DarkMode === 'true');

// STATE
const darkMode = computed({
  get() {
    if (
      networkSlug === 'etherlink' ||
      networkSlug === 'taiko' ||
      networkSlug === 'telos'
    ) {
      return true;
    }
    return lsDarkMode.value;
  },
  set(value: boolean) {
    if (
      networkSlug !== 'etherlink' &&
      networkSlug !== 'taiko' &&
      networkSlug !== 'telos'
    ) {
      lsDarkMode.value = value;
    }
  },
});

// MUTATIONS
function setDarkMode(val: boolean): void {
  darkMode.value = val;
  lsSet(LS_KEYS.App.DarkMode, darkMode.value.toString());
  if (darkMode.value) {
    document.documentElement.classList.add('dark');
  } else if (
    networkSlug !== 'etherlink' &&
    networkSlug !== 'taiko' &&
    networkSlug !== 'telos'
  ) {
    document.documentElement.classList.remove('dark');
  }
}

// INIT
setDarkMode(LS_KEYS.App.DarkMode === 'false' || true);

export default function useDarkMode() {
  function toggleDarkMode(): void {
    setDarkMode(!darkMode.value);
  }

  return {
    darkMode,
    toggleDarkMode,
    setDarkMode,
  };
}
