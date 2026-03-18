import { Request, Response } from 'express';
import { VmService } from '../../application/services/VmService';
import { CronService } from '../../application/services/CronService';

export class VmController {
  constructor(
    private vmService: VmService,
    private cronService: CronService
  ) {}

  async listVms(req: Request, res: Response): Promise<void> {
    try {
      const location = typeof req.query.location === 'string' ? req.query.location : undefined;
      const vms = await this.vmService.listVms(location);
      res.status(200).json(vms);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getVmDetail(req: Request, res: Response): Promise<void> {
    try {
      const uuid = req.params.uuid as string;
      const location = typeof req.query.location === 'string' ? req.query.location : undefined;
      const vm = await this.vmService.getVmDetail(uuid, location);
      if (!vm) {
        res.status(404).json({ error: 'VM not found' });
        return;
      }
      res.status(200).json(vm);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async setSchedule(req: Request, res: Response): Promise<void> {
    try {
      const uuid = req.params.uuid as string;
      const { action, cronExpression, timezone, isActive } = req.body;
      
      const schedule = await this.vmService.setVmSchedule({
          vmUuid: uuid,
          action,
          cronExpression,
          timezone: timezone || 'Asia/Jakarta',
          isActive: isActive !== undefined ? isActive : true
      });
      res.status(201).json(schedule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getSchedules(req: Request, res: Response): Promise<void> {
    try {
      const uuid = req.params.uuid as string;
      const schedules = await this.vmService.getVmSchedules(uuid);
      res.status(200).json(schedules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteSchedule(req: Request, res: Response): Promise<void> {
    try {
      const uuid = req.params.uuid as string;
      const action = (req.query.action as string) || (req.body && req.body.action);
      
      const success = await this.vmService.removeVmSchedule(uuid, action);
      if (success) {
        res.status(200).json({ message: 'Schedule deleted successfully' });
      } else {
        res.status(404).json({ error: 'Schedule not found' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async runCron(req: Request, res: Response): Promise<void> {
     try {
       const result = await this.cronService.processSchedules();
       res.status(200).json({ message: 'Cron processed', result });
     } catch (error: any) {
       res.status(500).json({ error: error.message });
     }
  }
}
