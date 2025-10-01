import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Contract } from 'ethers';

import RewardDistributorABI from '@/lib/abi/RewardDistributor.json';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { walletService as walletServiceInstance } from '@/services/web3/wallet.service';

type Claim = {
  identifier: string;
  account: string;
  amount: string;
  merkleProof: string[];
};

export class RewardDistributor {
  constructor(
    public readonly address: string,
    private readonly abi = RewardDistributorABI,
    private readonly config = configService,
    private readonly walletService = walletServiceInstance,
    private readonly provider = rpcProviderService.jsonProvider
  ) {}

  public getInstance(): Contract {
    return new Contract(this.address, this.abi, this.provider);
  }

  public async claim(claims: Claim[]): Promise<TransactionResponse> {
    return this.walletService.txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'claim',
      params: [claims],
    });
  }
}
