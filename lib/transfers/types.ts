export interface ITransferFetcher {
  getCurrentBlockNumber(): Promise<number>;
  fetchTransfers(
    eventProcessor: (events: TransferEvent[]) => Promise<void>,
    fromBlock?: number,
    toBlock?: number
  ): Promise<void>;
}

export type TransferEvent = {
  from: string;
  to: string;
  transactionHash: string;
  value: string;
};
