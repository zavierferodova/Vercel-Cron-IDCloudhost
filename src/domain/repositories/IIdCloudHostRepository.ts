import { Vm } from '../models';

export interface IIdCloudHostRepository {
  getVms(location?: string): Promise<Vm[]>;
  getVm(uuid: string, location?: string): Promise<Vm | null>;
  startVm(uuid: string, location?: string): Promise<boolean>;
  stopVm(uuid: string, location?: string): Promise<boolean>;
}
