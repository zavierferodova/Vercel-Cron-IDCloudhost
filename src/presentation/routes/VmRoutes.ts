import { Router, Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import CronExpressionParser from 'cron-parser';
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

const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// Routes
vmRoutes.get('/vms', auth, (req, res) => vmController.listVms(req, res));
vmRoutes.get('/vms/:uuid', auth, (req, res) => vmController.getVmDetail(req, res));
vmRoutes.get('/vms/:uuid/schedule', auth, (req, res) => vmController.getSchedules(req, res));

vmRoutes.post(
  '/vms/:uuid/schedule',
  auth,
  [
    param('uuid').isString().notEmpty().withMessage('UUID is required'),
    body('action').isString().toLowerCase().isIn(['start', 'stop']).withMessage('Action must be start or stop'),
    body('cronExpression').isString().notEmpty().custom((value) => {
      const lower = value.toLowerCase();
      if (lower === 'morning' || lower === 'night') return true;
      try {
        CronExpressionParser.parse(value);
      } catch (err) {
        throw new Error('cronExpression must be "morning", "night", or a valid cron expression');
      }
      return true;
    }),
    body('timezone').optional().isString(),
    body('isActive').optional().isBoolean()
  ],
  validate,
  (req: Request, res: Response) => vmController.setSchedule(req, res)
);

vmRoutes.delete(
  '/vms/:uuid/schedule',
  auth,
  [
    param('uuid').isString().notEmpty().withMessage('UUID is required'),
    query('action').optional().isString().toLowerCase().isIn(['start', 'stop']).withMessage('Action must be start or stop'),
    body('action').optional().isString().toLowerCase().isIn(['start', 'stop']).withMessage('Action must be start or stop'),
    // custom check to ensure action is in query or body
    (req: Request, res: Response, next: NextFunction) => {
      const action = req.query.action || req.body?.action;
      if (!action) {
         res.status(400).json({ errors: [{ msg: 'Action is required in query or body' }] });
         return;
      }
      next();
    }
  ],
  validate,
  (req: Request, res: Response) => vmController.deleteSchedule(req, res)
);

// Cron Webhook endpoint (protected by AuthMiddleware expecting CRON_SECRET or API_KEY)
vmRoutes.get('/cron', auth, (req, res) => vmController.runCron(req, res));
