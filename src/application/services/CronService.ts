import { IIdCloudHostRepository } from '../../domain/repositories/IIdCloudHostRepository';
import { IVmScheduleRepository } from '../../domain/repositories/IVmScheduleRepository';
import CronExpressionParser from 'cron-parser';

export class CronService {
  constructor(
    private idchRepo: IIdCloudHostRepository,
    private scheduleRepo: IVmScheduleRepository
  ) {}

  /**
   * Called periodically by Vercel Cron
   */
  async processSchedules(): Promise<{ success: number, failed: number, logs: string[] }> {
    const activeSchedules = await this.scheduleRepo.getActiveSchedules();
    const currentDate = new Date();
    const logs: string[] = [];
    
    let success = 0;
    let failed = 0;

    for (const schedule of activeSchedules) {
      try {
        // Evaluate cron expression with the schedule's timezone
        const interval = CronExpressionParser.parse(schedule.cronExpression, {
           currentDate,
           tz: schedule.timezone || 'Asia/Jakarta'
        });

        // Check if the cron expression should have run in the last minute.
        // Because vercel cron runs at specific intervals, we check if the previous interval matches our current time block.
        const prev = interval.prev();
        
        // Let's assume the cron runs every minute. If `prev.getTime()` is within the last 60 seconds (roughly), trigger it.
        // Real-world setup might require more robust fuzzy matching for serverless execution delays.
        const timeDiffMs = currentDate.getTime() - prev.getTime();
        
        if (timeDiffMs >= 0 && timeDiffMs < 60000) { // 60 seconds tolerance
           logs.push(`Matched schedule for VM ${schedule.vmUuid} - Action: ${schedule.action}`);
           
           if (schedule.action === 'START') {
              await this.idchRepo.startVm(schedule.vmUuid);
           } else if (schedule.action === 'STOP') {
              await this.idchRepo.stopVm(schedule.vmUuid);
           }
           
           success++;
           logs.push(`Successfully executed ${schedule.action} on VM ${schedule.vmUuid}`);
        }
      } catch (err: any) {
        logs.push(`Error executing schedule for VM ${schedule.vmUuid}: ${err.message}`);
        failed++;
      }
    }

    return { success, failed, logs };
  }
}
