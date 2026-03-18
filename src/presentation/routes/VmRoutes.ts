import { Router } from 'express';
import { VmController } from '../controllers/VmController';
import { authMiddleware } from '../middlewares/AuthMiddleware';

// Dependencies Injection
import { PrismaConfigRepository } from '../../infrastructure/repositories/PrismaConfigRepository';
import { PrismaVmScheduleRepository } from '../../infrastructure/repositories/PrismaVmScheduleRepository';
import { AxiosIdCloudHostRepository } from '../../infrastructure/repositories/AxiosIdCloudHostRepository';
import { VmService } from '../../application/services/VmService';
import { CronService } from '../../application/services/CronService';

export const vmRoutes = Router();

// Init Repositories
// const configRepo = new PrismaConfigRepository();
const scheduleRepo = new PrismaVmScheduleRepository();
const idchRepo = new AxiosIdCloudHostRepository();

// Init Services
const vmService = new VmService(idchRepo, scheduleRepo);
const cronService = new CronService(idchRepo, scheduleRepo);

// Init Controllers
const vmController = new VmController(vmService, cronService);

// Middleware
const auth = authMiddleware();

// Routes
vmRoutes.get('/vms', auth, (req, res) => vmController.listVms(req, res));
vmRoutes.get('/vms/:uuid', auth, (req, res) => vmController.getVmDetail(req, res));
vmRoutes.get('/vms/:uuid/schedule', auth, (req, res) => vmController.getSchedules(req, res));
vmRoutes.post('/vms/:uuid/schedule', auth, (req, res) => vmController.setSchedule(req, res));
vmRoutes.delete('/vms/:uuid/schedule', auth, (req, res) => vmController.deleteSchedule(req, res));

// Cron Webhook endpoint (protected by AuthMiddleware expecting CRON_SECRET or API_KEY)
vmRoutes.get('/cron', auth, (req, res) => vmController.runCron(req, res));
