import { ERC4626Relayer__factory } from './ERC4626Relayer__factory';

import VaultService from '@/services/contracts/vault.service';

export default class Erc4626RelayerService extends VaultService {
  constructor() {
    super();
    this.abi = ERC4626Relayer__factory.abi;
  }

  get address() {
    return this.config.network.addresses.erc4626Relayer || '';
  }
}

export const erc4626RelayerService = new Erc4626RelayerService();
