<script setup lang="ts">
import configs from '@/lib/config';
import { Network } from '@/lib/config/types';

/**
 * TYPES
 */
type Props = {
  networkFilters: Network[];
  showExpiredGauges: boolean;
  activeNetworkFilters: number[];
};

const emit = defineEmits<{
  (e: 'choose-network', value: number): void;
  (e: 'update:showExpiredGauges', value: boolean): void;
  (e: 'update:activeNetworkFilters', value: number[]): void;
}>();

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * STATE
 */
const networkFiltersArr = ref([...props.activeNetworkFilters]);

/**
 * isExpiredFilterActive and activeNetworksArr are created to handle activeFiltersNum computed
 * otherwise activeFiltersNum would change only after 500ms debounce which lead to poor UX
 */
const isExpiredFilterActive = ref(false);
const activeNetworksArr = ref<number[]>([]);

/**
 * COMPUTED
 */
const activeFiltersNum = computed(() => {
  return activeNetworksArr.value.length + Number(isExpiredFilterActive.value);
});

/**
 * METHODS
 */
function handleExpInput(e) {
  const { checked } = e.target;
  isExpiredFilterActive.value = checked;
  emit('update:showExpiredGauges', checked);
}

function updateNetwork(network: number) {
  const index = networkFiltersArr.value.indexOf(network);

  index === -1
    ? networkFiltersArr.value.push(network)
    : networkFiltersArr.value.splice(index, 1);

  const arr = [...networkFiltersArr.value];
  emit('update:activeNetworkFilters', arr);
  activeNetworksArr.value = arr;
}
</script>

<template>
  <BalPopover noPad class="flex-0">
    <template #activator>
      <BalBtn class="flex-1 w-20 h-8" color="white" size="sm">
        <BalIcon
          name="filter"
          size="sm"
          class="mr-1 text-gray-600 dark:text-gray-100"
        />
        <div class="flex text-xs text-gray-600 dark:text-gray-100">Filters</div>
        <div v-if="activeFiltersNum > 0" class="px-1">
          <div
            class="flex justify-center items-center p-1 w-4 h-4 text-xs text-center text-white bg-blue-600 rounded-full"
          >
            {{ activeFiltersNum }}
          </div>
        </div>
      </BalBtn>
    </template>
    <div class="flex overflow-hidden flex-col py-4 px-3 w-64 rounded-lg">
      <div class="text-xl font-bold whitespace-nowrap">
        {{ $t('network') }}
      </div>
      <div
        v-for="network in networkFilters"
        :key="network"
        class="flex py-1 text-base text-gray-600 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
      >
        <BalCheckbox
          :modelValue="networkFiltersArr.includes(Number(network))"
          name="networkFilter"
          :label="configs[network].chainName"
          noMargin
          alignCheckbox="items-center"
          @input="updateNetwork(Number(network))"
        />
      </div>

      <div class="py-2 text-xl font-bold">
        {{ $t('gaugeFilter.gaugeDisplay') }}
      </div>

      <BalCheckbox
        class="flex py-1 text-base text-gray-600 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
        name="expiredGaugesFilter"
        :label="$t('gaugeFilter.showExpired')"
        noMargin
        alignCheckbox="items-center"
        :modelValue="showExpiredGauges"
        @input="handleExpInput"
      />
    </div>
  </BalPopover>
</template>
