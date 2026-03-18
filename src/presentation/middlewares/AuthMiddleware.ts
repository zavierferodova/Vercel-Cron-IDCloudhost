import 'dotenv/config'
import { Request, Response, NextFunction } from 'express';
import { IConfigRepository } from '../../domain/repositories/IConfigRepository';

export const authMiddleware = (configRepo?: IConfigRepository) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 1. Check for Vercel Cron Secret (if request comes from Vercel Cron)
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;

    // If it's a cron request, vercel automatically sends `Bearer $CRON_SECRET`
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      return next();
    }

    // 2. Check for standard API Key
    const apiKeyHeader = req.headers['x-api-key'] || req.headers['authorization'];

    if (!apiKeyHeader) {
      return res.status(401).json({ error: 'Unauthorized: Missing API Key' });
    }

    const providedKey = (apiKeyHeader as string).replace('Bearer ', '').trim();
    const systemKey = process.env.API_KEY;

    // Check against static env variable
    if (systemKey && providedKey === systemKey) {
      return next();
    }

    // Check against dynamic config if repo provided
    if (configRepo) {
      const dynamicKey = await configRepo.getConfigValue('CLIENT_API_KEY');
      if (dynamicKey && providedKey === dynamicKey) {
        return next();
      }
    }

    return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
  };
};
