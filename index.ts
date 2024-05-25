import { TxtFileRepository } from "./lib/repository/txtFileRepository";
import { TransferFetcher } from "./lib/transfers/fetcher";

// TODO: Config driven by environment variables with validation
const config = {
  rpcUrl: process.env.RPC_URL ?? "https://rpc.ankr.com/eth", // Public RPC from https://chainlist.org/chain/1
  contractAddress: process.env.CONTRACT_ADDRESS ?? "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT contract address
  abi: [
    "event Transfer(address indexed from, address indexed to, uint256 value)",
  ],
  query: {
    batchSize: 5,
    fromBlock: undefined,
    retryLimit: 5,
  },
  storageFile: "transfers.txt",
  addressToCheck: process.env.ADDRESS_TO_CHECK ?? "0x0",
};

console.log(config);

// TODO: Global error handling on entry point
(async () => {
  // Setup instances
  const repository = new TxtFileRepository(config.storageFile);
  const fetcher = new TransferFetcher(
    config.rpcUrl,
    config.contractAddress,
    config.abi,
    config.query.batchSize,
    config.query.retryLimit
  );

  // Fetch transfers from the last 10 blocks by default
  const fromBlock = config.query.fromBlock ?? (await fetcher.getCurrentBlockNumber() - 10);
  await fetcher.fetchTransfers(async (events) => {
    // Store fetched events
    repository.persist(events);
  }, fromBlock);

  // Get all transfer by given address
  const transfersFound = await repository.getTransfersByAddress(config.addressToCheck);
  console.log(`\n${transfersFound.length} transfers found for ${config.addressToCheck}`);
})();
