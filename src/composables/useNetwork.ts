import config from '@/lib/config';
import { Network } from '@/lib/config/types';
import { configService } from '@/services/config/config.service';
import { RouteParamsRaw } from 'vue-router';
import { Config } from '@/lib/config/types';
// Required vue imports so that claim.worker doesnt fail with undefined errors.
import { ref, computed } from 'vue';

/**
 * STATE
 */
const windowAvailable = typeof window !== 'undefined';
const localStorageNetworkId: Network | null =
  windowAvailable && localStorage.getItem('networkId')
    ? (Number(localStorage.getItem('networkId')) as Network)
    : null;
const routeSlug =
  (windowAvailable && window.location.hash.split(/[/?]/)[1]) ?? '';
const urlNetworkId: Network | null = routeSlug
  ? networkFromSlug(routeSlug)
  : null;

const NETWORK_ID =
  urlNetworkId ||
  localStorageNetworkId ||
  (Number(import.meta.env.VITE_NETWORK) as Network) ||
  Network.TELOS;
if (windowAvailable) localStorage.setItem('networkId', NETWORK_ID.toString());
console.log('NETWORK_ID', NETWORK_ID);
export const networkSlug = config[NETWORK_ID].slug;
export const networkConfig = config[NETWORK_ID];

/**
 * COMPUTED
 */

export const networkId = ref<Network>(NETWORK_ID);

export const isMainnet = computed(
  () =>
    networkId.value === Network.TELOS ||
    networkId.value === Network.TELOSTESTNET
);
export const isTelos = computed(() => networkId.value === Network.TELOS);
export const isMeter = computed(() => networkId.value === Network.METER);
export const isPolygon = computed(() => networkId.value === Network.POLYGON);
export const isZkevm = computed(() => networkId.value === Network.ZKEVM);
export const isOptimism = computed(() => networkId.value === Network.OPTIMISM);
export const isArbitrum = computed(() => networkId.value === Network.ARBITRUM);
export const isGnosis = computed(() => networkId.value === Network.GNOSIS);
export const isGoerli = computed(() => networkId.value === Network.GOERLI);
export const isBase = computed(() => networkId.value === Network.BASE);
export const isAvalanche = computed(
  () => networkId.value === Network.AVALANCHE
);

export const hasBridge = computed<boolean>(
  () => !!config[networkId.value].bridgeUrl
);
export const isTestnet = computed<boolean>(
  () => !!config[networkId.value].testNetwork
);

export const isEIP1559SupportedNetwork = computed(
  () => configService.network.supportsEIP1559
);

export const isPoolBoostsEnabled = computed<boolean>(
  () => configService.network.pools.BoostsEnabled
);

/**
 * METHODS
 */

export function networkFor(key: string | number): Network {
  const network = Object.values(config).find((config: Config) => {
    return config.key === key.toString();
  });
  if (!network) {
    throw new Error('Network not supported');
  }

  return network.chainId as Network;
}

export function getNetworkSlug(network: Network): string {
  return config[network].slug;
}

export function networkFromSlug(networkSlug: string): Network | null {
  let slug = networkSlug;
  if (slug === 'moksha') slug = 'vana-moksha';
  if (slug === 'gnosis') slug = 'gnosis-chain';
  const networkConf = Object.values(config).find((config: Config) => {
    return config.slug === slug;
  });
  return networkConf ? (networkConf.chainId as Network) : null;
}

export const veSymbol = computed(() => {
  if (networkId.value === Network.CELO) {
    return 'vCSYMM';
  }
  if (networkId.value === Network.TELOS) {
    return 'veRVLV';
  }
  if (networkId.value === Network.GNOSIS) {
    return 'vGSYMM';
  }
  if (networkId.value === Network.ARTELA) {
    return 'vASYMM';
  }
  return 'vMSYMM';
});

export const symmSymbol = computed(() => {
  if (networkId.value === Network.CELO) {
    return 'cSYMM';
  }
  if (networkId.value === Network.TELOS) {
    return 'RVLV';
  }
  if (networkId.value === Network.GNOSIS) {
    return 'gSYMM';
  }
  if (networkId.value === Network.VANAMOKSHA) {
    return 'vSYMM';
  }
  if (networkId.value === Network.ARTELA) {
    return 'ASYMM';
  }
  return 'mSYMM';
});

export const symmAddress = computed(() => {
  switch (networkId.value) {
    case Network.CELO:
      return config[Network.CELO].tokens.Addresses.BAL;
    case Network.TELOS:
      return config[Network.TELOS].tokens.Addresses.BAL;
    case Network.GNOSIS:
      return config[Network.GNOSIS].tokens.Addresses.BAL;
    case Network.ARTELA:
      return config[Network.ARTELA].tokens.Addresses.BAL;
    case Network.VANAMOKSHA:
      return config[Network.VANAMOKSHA].tokens.Addresses.BAL;
    case Network.TAIKO:
      return config[Network.TAIKO].tokens.Addresses.BAL;
    case Network.METER:
      return config[Network.METER].tokens.Addresses.BAL;
    default:
      return config[Network.TELOS].tokens.Addresses.BAL;
  }
});

export const lpToken = computed(() => {
  if (networkId.value === Network.CELO) {
    return '80CSYMM-20STCELO';
  }
  if (networkId.value === Network.TELOS) {
    return 'S-80TSYMM-20TLOS';
  }
  if (networkId.value === Network.GNOSIS) {
    return '80GSYMM-20SDAI';
  }
  if (networkId.value === Network.ARTELA) {
    return '80ASYMM-20ART';
  }
  return '80MSYMM-20wstMTRG';
});

export const nativeSymbol = computed(() => {
  if (networkId.value === Network.CELO) {
    return 'stCELO';
  }
  if (networkId.value === Network.TELOS) {
    return 'WTLOS';
  }
  if (networkId.value === Network.GNOSIS) {
    return 'SDAI';
  }
  if (networkId.value === Network.ARTELABETANET) {
    return 'WART';
  }
  if (networkId.value === Network.ARTELA) {
    return 'ART';
  }
  return 'wstMTRG';
});

export const native = computed(() => {
  if (networkId.value === Network.CELO) {
    return 'CELO';
  }
  if (networkId.value === Network.TELOS) {
    return 'TLOS';
  }
  if (networkId.value === Network.GNOSIS) {
    return 'XDAI';
  }
  if (networkId.value === Network.ARTELABETANET) {
    return 'ART';
  }
  if (networkId.value === Network.ARTELA) {
    return 'ART';
  }
  return 'MTR';
});

export const rewardSymbol = computed(() => {
  if (networkId.value === Network.CELO) {
    return 'stCELO';
  }
  if (networkId.value === Network.TELOS) {
    return 'WTLOS';
  }
  if (networkId.value === Network.GNOSIS) {
    return 'SDAI';
  }
  if (networkId.value === Network.ARTELA) {
    return 'ART';
  }
  return 'MTRG-wstMTRG';
});

export const rewardAddress = computed(() => {
  switch (networkId.value) {
    case Network.CELO:
      return config[Network.CELO].tokens.Addresses.WETH;
    case Network.TELOS:
      return config[Network.TELOS].tokens.Addresses.WETH;
    case Network.GNOSIS:
      return config[Network.GNOSIS].tokens.Addresses.WETH;
    case Network.ARTELA:
      return config[Network.ARTELA].tokens.Addresses.WETH;
    case Network.VANAMOKSHA:
      return config[Network.VANAMOKSHA].tokens.Addresses.WETH;
    case Network.TAIKO:
      return config[Network.TAIKO].tokens.Addresses.WETH;
    case Network.METER:
      return config[Network.METER].tokens.Addresses.WETH;
    default:
      return config[Network.TELOS].tokens.Addresses.WETH;
  }
});

export const native_wrapped = computed(() => {
  if (networkId.value === Network.CELO) {
    return 'CELO';
  }
  if (networkId.value === Network.TELOS) {
    return 'TLOS/WTLOS';
  }
  if (networkId.value === Network.GNOSIS) {
    return 'xDAI/WXDAI';
  }
  if (networkId.value === Network.ARTELABETANET) {
    return 'ART/WART';
  }
  if (networkId.value === Network.ARTELA) {
    return 'ART/wART';
  }
  return 'MTR/wMTR';
});

export function appUrl(): string {
  return `https://${configService.env.APP_DOMAIN}/#`;
}

/**
 * Get subdomain, excluding 'beta'
 *
 * @param {string} url - Host url - e.g. "polygon.balancer.fi/".
 * @returns {string} Subdomain.
 */
export function getSubdomain(url: string) {
  const subdomain = url.split('.')[0];
  if (subdomain === 'beta') {
    return url.split('.')[1];
  }
  return subdomain;
}

/**
 * Using networkSlug in url check if redirect is necessary. Redirect is
 * necessary if something about the current state doesn't match the networkSlug.
 *
 * @param {string} networkSlug - Network name in url - e.g. "app.balancer.fi/polygon".
 * @param {Function} noNetworkChangeCallback - Function which gets triggered if user is on correct network already.
 * @param {Function} networkChangeCallback - Function which gets triggered if network change is required.
 */
export function handleNetworkSlug(
  networkSlug: string,
  noNetworkChangeCallback: () => void,
  networkChangeCallback: () => void
) {
  const networkFromUrl = networkFromSlug(networkSlug);
  const localStorageNetwork = networkFor(
    localStorage.getItem('networkId') ?? '11822'
  );
  if (!networkFromUrl) {
    // missing or incorrect network name -> next() withtout network change
    return noNetworkChangeCallback();
  }
  if (localStorageNetwork === networkFromUrl) {
    // if on the correct network -> next()
    return noNetworkChangeCallback();
  }

  // if on different network -> update localstorage and reload
  return networkChangeCallback();
}

/**
 * Takes current URL and checks if a redirect URL is required, if not returns undefined.
 *
 * @param {string} host - The current host, e.g. polygon.balancer.fi
 * @param {string} fullPath - The current full path from vue router.
 * @param {RouteParamsRaw} params - The params in the current route.
 * @returns {string|undefined} The URL to redirect to, e.g. https://app.balancer.fi/#/polygon
 */
export function getRedirectUrlFor(
  host: string,
  fullPath: string,
  params: RouteParamsRaw = {}
): string | undefined {
  const subdomain = getSubdomain(host);
  const subdomainNetwork = networkFromSlug(subdomain);

  if (subdomainNetwork) {
    // Legacy network subdomain, we need to redirect to app.balancer.fi.
    const newDomain = appUrl().replace(subdomain, 'app');
    // If networkSlug provided it will be in the fullPath, so pass empty string instead.
    const newNetwork = params?.networkSlug
      ? ''
      : `/${getNetworkSlug(subdomainNetwork)}`;
    return `${newDomain}${newNetwork}${fullPath}`;
  }

  return;
}

export default function useNetwork() {
  const appNetworkConfig = configService.network;
  return {
    appUrl,
    networkId,
    networkConfig,
    networkSlug,
    getNetworkSlug,
    getSubdomain,
    handleNetworkSlug,
    appNetworkConfig,
    symmSymbol,
    veSymbol,
    lpToken,
    nativeSymbol,
    rewardSymbol,
    native_wrapped,
    native,
  };
}
