<script lang="ts" setup>
import { Protocol, protocolIconPaths } from '@/composables/useProtocols';
import { PoolFeature } from '@/types/pools';
import { useI18n } from 'vue-i18n';

type Props = {
  feature: PoolFeature;
  protocols: Protocol[];
};

const props = defineProps<Props>();

const iconURIs = props.protocols.map(protocol => protocolIconPaths[protocol]);

const hasIcons = props.protocols.length > 0;

const width = 12 + (iconURIs.length - 1) * 16;

const { t } = useI18n();

function getFeatureClasses() {
  switch (props.feature) {
    case PoolFeature.Boosted:
      return 'bg-gradient-to-tr from-yellow-500 to-pink-500 text-white';
    case PoolFeature.Points40k:
      // return 'bg-gradient-to-tr from-blue-500 to-pink-500 text-white';
      return 'bg-gradient-to-r from-blue-500 to-yellow-500 via-pink-500 inline-block text-transparent bg-clip-text';
    case PoolFeature.Points20k:
      return 'bg-gradient-to-r from-blue-500 to-yellow-500 via-pink-500 inline-block text-transparent bg-clip-text';
    case PoolFeature.CLP:
      return 'bg-gradient-to-tr from-pink-300 to-yellow-200 text-black';
    case PoolFeature.TBXP:
      return 'bg-gradient-to-tr from-blue-500 to-pink-500 text-white';
    case PoolFeature.YieldAccelerated:
      return '';
    default:
      return '';
  }
}

function getFeatureLabel(): string {
  switch (props.feature) {
    case PoolFeature.Boosted:
      return t('boosted');
    case PoolFeature.Points40k:
      return `<span class="block leading-tight">40K<br>SYMM Points</span>`;
    case PoolFeature.Points20k:
      return `<span class="block leading-tight">20K<br>SYMM Points</span>`;
    case PoolFeature.TBXP:
      return '';
    case PoolFeature.CLP:
      return 'CLP';
    case PoolFeature.YieldAccelerated:
      return '';
    default:
      return '';
  }
}
</script>

<template>
  <div
    data-testid="feature-chip"
    :class="[
      'flex relative items-center py-1 pr-1.5 pl-2 mr-1 max-h-10 rounded',
      getFeatureClasses(),
    ]"
  >
    <div v-if="hasIcons" class="inline-flex relative">
      <div
        v-if="feature === PoolFeature.YieldAccelerated"
        class="shiny-border"
      ></div>
      <BalAssetSet
        :logoURIs="iconURIs"
        :width="width"
        :size="16"
        :ringSize="1"
        class="relative z-10"
      />
    </div>
    <span
      class="relative z-10 text-xs font-semibold"
      v-html="getFeatureLabel()"
    ></span>
  </div>
</template>

<style lang="scss">
.shiny-border {
  position: absolute;
  inset: -3px;
  border-radius: 9999px;
  overflow: hidden;

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: -50%;
  }

  &::before {
    background: conic-gradient(
      from 0deg,
      transparent,
      rgba(218, 165, 32, 0.3) 30%,
      rgba(255, 215, 0, 0.9) 40%,
      rgba(255, 223, 0, 1) 50%,
      rgba(255, 215, 0, 0.9) 60%,
      rgba(218, 165, 32, 0.3) 70%,
      transparent
    );
    animation: shine 3s linear infinite;
  }

  &::after {
    background: conic-gradient(
      from 180deg,
      transparent,
      rgba(255, 223, 0, 0.2) 30%,
      rgba(255, 223, 0, 0.5) 40%,
      rgba(255, 255, 255, 0.7) 50%,
      rgba(255, 223, 0, 0.5) 60%,
      rgba(255, 223, 0, 0.2) 70%,
      transparent
    );
    animation: shine 4s linear infinite reverse;
    mix-blend-mode: soft-light;
  }
}

@keyframes shine {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
