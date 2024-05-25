# Ethereum Blockchain - ERC20 Transfer Fetcher

A Node.js/TypeScript application for fetching and storing all ERC-20 token transfers for a specified token.

## Design Decisions & Assumptions

Decided to split the responsibility of fetching transfers from the storage layer for separation of concerns; using a repository pattern and a fetcher (that uses `ethers.js` dependency for Ethereum RPC provider, contracts and event log query functionality).

- Tested with `https://rpc.ankr.com/eth` and `https://cloudflare-eth.com` RPC URLs interchangeable

The fetcher gets transfers with `fromBlock` and `toBlock` semantics, along with configurable batch processing with scalability in mind; it processes each batch of events as they arrive for memory efficiency and performance i.e. in parallel to fetching the next batch. On RPC query error; retry up to `5` times.

Using basic logging with `console.log` / `console.error` throughout.

With the repository using a append-only `.txt` file for storage and the ability to get all transfer made by a given address.

## Prerequisites
- Node.js
- npm

## Setup
```bash
git clone https://github.com/hoganb/ethereum-blockchain-erc20-transfer-fetcher.git
cd ethereum-blockchain-erc20-transfer-fetcher
npm install
```

## Usage
Using default config
```bash
npm start
```

Or using environment variables to override config for:
- `RPC_URL` - Public RPC URL
- `CONTRACT_ADDRESS` - USDT contract address
- `ADDRESS_TO_CHECK` - Ethereum address to check for transfers

e.g.
```bash
RPC_URL=https://cloudflare-eth.com ADDRESS_TO_CHECK=0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD npm start
```

## Next Steps
To make the code production grade.

### TODOs

- Config fully driven by environment variables with validation
- Defensive coding, validations and enhanced error handling as per `// TODO:` snippets in code
- Resume fetch from last block on restart to handle interruptions
- Fallback Ethereum RPC providers to mitigate against network failures
- Switch repository to a more robust NoSQL/SQL database for persistence
  - Only process and store necessary data for small footprint
- Improve logging with structured log events --> Observability and monitoring
- Diagram as code for illustration e.g. mermaid
- Code formatting, code quality, linting, type checking, auditing, licensing, testing
- CI/CD
- Cloud hosting workload

### Test Cases
To be implemented
- Fetch transfers from a block range and validate data integrity (using a mock provider with various from and to block ranges)
- Store transfers in file repository and validate retrieval of transfers by address
- Simulate RPC errors / network failures to verify retry logic (using a mock provider)