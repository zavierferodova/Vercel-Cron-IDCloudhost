import { IVmScheduleRepository } from '../../domain/repositories/IVmScheduleRepository';
import { VmSchedule } from '../../domain/models';
import { prisma } from '../database/prisma';

export class PrismaVmScheduleRepository implements IVmScheduleRepository {
  async getSchedules(): Promise<VmSchedule[]> {
    const schedules = await prisma.vmSchedule.findMany();
    // Prisma maps to our domain model mostly 1:1, but ensure casting
    return schedules as VmSchedule[];
  }

  async getActiveSchedules(): Promise<VmSchedule[]> {
    const schedules = await prisma.vmSchedule.findMany({
      where: {
        isActive: true
      }
    });
    return schedules as VmSchedule[];
  }

  async getScheduleByVmUUID(vmUuid: string): Promise<VmSchedule[]> {
    const schedules = await prisma.vmSchedule.findMany({
        where: {
            vmUuid
        }
    });
    return schedules as VmSchedule[];
  }

  async upsertSchedule(schedule: Omit<VmSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<VmSchedule> {
    const upserted = await prisma.vmSchedule.upsert({
      where: {
        vmUuid_action: {
          vmUuid: schedule.vmUuid,
          action: schedule.action,
        }
      },
      update: {
        cronExpression: schedule.cronExpression,
        timezone: schedule.timezone,
        isActive: schedule.isActive,
      },
      create: {
        vmUuid: schedule.vmUuid,
        action: schedule.action,
        cronExpression: schedule.cronExpression,
        timezone: schedule.timezone,
        isActive: schedule.isActive,
      }
    });

    return upserted as VmSchedule;
  }

  async deleteSchedule(vmUuid: string, action?: string): Promise<boolean> {
    try {
      if (action) {
        await prisma.vmSchedule.delete({
          where: { vmUuid_action: { vmUuid, action } }
        });
      } else {
        const result = await prisma.vmSchedule.deleteMany({
          where: { vmUuid }
        });
        if (result.count === 0) return false;
      }
      return true;
    } catch (e) {
      return false; // Record not found or error
    }
  }
}
