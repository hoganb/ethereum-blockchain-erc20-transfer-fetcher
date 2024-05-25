import { Contract, EventLog, JsonRpcProvider } from "ethers";

import { ITransferFetcher, TransferEvent } from "./types";

export class TransferFetcher implements ITransferFetcher {
  private abi: any[];
  private batchSize: number;
  private contract: Contract;
  private contractAddress: string;
  private provider: JsonRpcProvider;
  private retryLimit: number;

  constructor(
    rpcUrl: string,
    contractAddress: string,
    abi: any[],
    batchSize: number,
    retryLimit: number
  ) {
    this.provider = new JsonRpcProvider(rpcUrl);
    this.contractAddress = contractAddress;
    this.abi = abi;
    this.batchSize = batchSize;
    this.contract = new Contract(this.contractAddress, this.abi, this.provider);
    this.retryLimit = retryLimit;
  }

  public async getCurrentBlockNumber(): Promise<number> {
    // TODO: RPC get block number error handling
    return await this.provider.getBlockNumber();
  }

  public async fetchTransfers(
    eventProcessor: (events: TransferEvent[]) => Promise<void>,
    fromBlock?: number,
    toBlock?: number
  ): Promise<void> {
    // Apply defaults if not specified
    fromBlock = fromBlock ?? 0;
    toBlock = toBlock ?? (await this.getCurrentBlockNumber());

    console.log(
      `fetchTransfers - start batchSize: ${this.batchSize}, fromBlock: ${fromBlock}, toBlock: ${toBlock} (inclusive)`
    );

    let cumulativeTotal: number = 0;

    // Batch processing for memory efficiency and performance
    while (fromBlock <= toBlock) {
      // Ensure batch to block is less than or equal to the target end block
      const batchBlock = Math.min(fromBlock + this.batchSize, toBlock);
      console.log(
        `fetchTransfers - batch fromBlock: ${fromBlock}, toBlock: ${batchBlock} (inclusive)`
      );

      const events = await this.query(fromBlock, batchBlock);

      // TODO: Event log to transfer event mapping validations
      // Map event logs to transfer events
      const transferEvents = events.map((event) => ({
        from: event instanceof EventLog ? event.args?.from : undefined,
        to: event instanceof EventLog ? event.args?.to : undefined,
        value:
          event instanceof EventLog ? event.args?.value.toString() : undefined,
        transactionHash: event.transactionHash,
      }));
      cumulativeTotal += transferEvents.length;

      console.log(`fetchTransfers - batch count: ${transferEvents.length}`);

      // Process events when query produces results
      if (transferEvents.length > 0) {
        // TODO: Event processor error handling
        eventProcessor(transferEvents);
      }

      // Increment batch
      fromBlock = batchBlock + 1;
    }
    console.log(`fetchTransfers - end cumulativeTotal: ${cumulativeTotal}`);
  }

  private async query(fromBlock: number, toBlock: number): Promise<EventLog[]> {
    const eventFilter = this.contract.filters.Transfer();
    // Retry up to 5 times
    let attempts = 0;
    while (attempts < this.retryLimit) {
      try {
        attempts++;
        console.log(`query - attempt: ${attempts}, retryLimit: ${this.retryLimit}`);
        const events = await this.contract.queryFilter(
          eventFilter,
          fromBlock,
          toBlock
        );
        return events as EventLog[];
      } catch (error) {
        // TODO: RPC query error handling based upon specific error case
        console.error(error);
      }
    }
    return [];
  }
}
