import { appendFileSync, readFileSync } from "fs";

import { IRepository } from "./types";
import { TransferEvent } from "../transfers/types";

export class TxtFileRepository implements IRepository {
  constructor(private filePath: string) {}

  async getTransfersByAddress(address: string): Promise<TransferEvent[]> {
    // TODO: Add read file error handling
    const contents = readFileSync(this.filePath, "utf-8").split("\n");
    contents.pop();
    return contents
      .map((line) => {
        // TODO: Add JSON parse error handling
        return JSON.parse(line) as TransferEvent;
      })
      .filter(
        (transfer) => transfer.from === address || transfer.to === address
      );
  }

  async persist(transfers: TransferEvent[]): Promise<void> {
    const data = transfers.reduce((acc: string, value: any) => {
      return acc + JSON.stringify(value) + "\n";
    }, "");
    // TODO: Add append file error handling
    appendFileSync(this.filePath, data);
    return;
  }
}
