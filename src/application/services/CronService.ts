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
  async processSchedules(phase?: string): Promise<{ success: number, failed: number, logs: string[] }> {
    const activeSchedules = await this.scheduleRepo.getActiveSchedules();
    const currentDate = new Date();
    const logs: string[] = [];
    
    let success = 0;
    let failed = 0;

    for (const schedule of activeSchedules) {
      try {
        let shouldExecute = false;

        // First check if the expression is a phase string like "morning" or "night"
        if (phase && schedule.cronExpression.toLowerCase() === phase.toLowerCase()) {
          shouldExecute = true;
        } else {
          // Standard cron expression evaluation
          try {
            const interval = CronExpressionParser.parse(schedule.cronExpression, {
               currentDate,
               tz: schedule.timezone || 'Asia/Jakarta'
            });

            // Check if the cron expression should have run in the last minute.
            const prev = interval.prev();
            const timeDiffMs = currentDate.getTime() - prev.getTime();
            
            if (timeDiffMs >= 0 && timeDiffMs < 60000) { // 60 seconds tolerance
               shouldExecute = true;
            }
          } catch (err: any) {
            // Expression is neither a valid phase nor a valid cron expression
            logs.push(`Invalid cron expression for VM ${schedule.vmUuid}: ${schedule.cronExpression}`);
            failed++;
            continue;
          }
        }

        if (shouldExecute) {
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
