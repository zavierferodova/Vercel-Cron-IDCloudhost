import { IIdCloudHostRepository } from '../../domain/repositories/IIdCloudHostRepository';
import { IVmScheduleRepository } from '../../domain/repositories/IVmScheduleRepository';
import { Vm, VmSchedule } from '../../domain/models';

export class VmService {
  constructor(
    private idchRepo: IIdCloudHostRepository,
    private scheduleRepo: IVmScheduleRepository
  ) {}

  async listVms(location?: string): Promise<Vm[]> {
    return this.idchRepo.getVms(location);
  }

  async getVmDetail(uuid: string, location?: string): Promise<Vm | null> {
    return this.idchRepo.getVm(uuid, location);
  }

  async getVmSchedules(uuid: string): Promise<VmSchedule[]> {
    return this.scheduleRepo.getScheduleByVmUUID(uuid);
  }

  async setVmSchedule(schedule: Omit<VmSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<VmSchedule> {
    // Basic validation
    if (!['START', 'STOP'].includes(schedule.action)) {
      throw new Error(`Invalid action: ${schedule.action}`);
    }
    return this.scheduleRepo.upsertSchedule(schedule);
  }

  async removeVmSchedule(vmUuid: string, action?: string): Promise<boolean> {
     return this.scheduleRepo.deleteSchedule(vmUuid, action);
  }
}
