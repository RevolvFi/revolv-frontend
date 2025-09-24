import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { useTokens } from '@/providers/tokens.provider';

export interface Incentive {
  token: string;
  amount: string;
  proposal: string;
  gauge: string;
}

export interface IncentivesResponse {
  bribes: Incentive[];
}

export default function useIncentives() {
  const { getToken } = useTokens();

  // Hardcode the incentives API URL
  const incentivesAPI = 'https://incentives.revolv.workers.dev/telos/';

  const queryKey = ['incentives'];

  const queryFn = async (): Promise<Incentive[]> => {
    console.log(
      'useIncentives: Making request to:',
      `${incentivesAPI}get-incentives`
    );

    const response = await fetch(`${incentivesAPI}get-incentives`);
    console.log('useIncentives: Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: IncentivesResponse = await response.json();
    console.log('useIncentives: Incentives data received:', data);

    return data.bribes || [];
  };

  const {
    data: incentives,
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn,
    enabled: !!incentivesAPI,
    onSuccess: data => {
      console.log('Query succeeded with data:', data);
    },
    onError: error => {
      console.log('Query failed with error:', error);
    },
    onSettled: () => {
      console.log('Query settled, isLoading:', isLoading.value);
    },
  });

  // Add debugging
  console.log('useIncentives: Query state:', {
    data: incentives.value,
    isLoading: isLoading.value,
    error: error.value,
  });

  // Group incentives by gauge address
  const incentivesByGauge = computed(() => {
    if (!incentives.value || incentives.value.length === 0) {
      console.log(
        'useIncentives: No incentives data yet, returning empty object'
      );
      return {};
    }

    console.log('useIncentives: Processing incentives data:', incentives.value);

    const grouped = incentives.value.reduce((acc, incentive) => {
      const gaugeAddress = incentive.gauge.toLowerCase();
      if (!acc[gaugeAddress]) {
        acc[gaugeAddress] = [];
      }
      acc[gaugeAddress].push(incentive);
      return acc;
    }, {} as Record<string, Incentive[]>);

    console.log('useIncentives: Grouped incentives:', grouped);
    return grouped;
  });

  const getIncentivesForGauge = (gaugeAddress: string): Incentive[] => {
    return incentivesByGauge.value[gaugeAddress.toLowerCase()] || [];
  };

  const getTotalIncentiveValue = (gaugeAddress: string): number => {
    const gaugeIncentives = getIncentivesForGauge(gaugeAddress);
    return gaugeIncentives.reduce((total, incentive) => {
      const token = getToken(incentive.token);
      if (!token) return total;

      const amount =
        parseFloat(incentive.amount) / Math.pow(10, token.decimals);
      return total + amount;
    }, 0);
  };

  return {
    incentivesByGauge,
    getIncentivesForGauge,
    getTotalIncentiveValue,
    isLoading,
    error,
  };
}
