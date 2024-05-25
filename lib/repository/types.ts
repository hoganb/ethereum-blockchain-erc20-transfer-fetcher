import { TransferEvent } from "../transfers/types";

export interface IRepository {
  getTransfersByAddress(address: string): Promise<TransferEvent[]>;
  persist(transfers: TransferEvent[]): Promise<void>;
}
