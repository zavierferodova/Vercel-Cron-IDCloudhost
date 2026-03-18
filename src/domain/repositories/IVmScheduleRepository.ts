import { VmSchedule } from '../models';

export interface IVmScheduleRepository {
  getSchedules(): Promise<VmSchedule[]>;
  getActiveSchedules(): Promise<VmSchedule[]>;
  getScheduleByVmUUID(vmUuid: string): Promise<VmSchedule[]>;
  upsertSchedule(schedule: Omit<VmSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<VmSchedule>;
  deleteSchedule(vmUuid: string, action?: string): Promise<boolean>;
}
