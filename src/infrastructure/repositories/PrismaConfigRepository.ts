import { IConfigRepository } from '../../domain/repositories/IConfigRepository';
import { Configuration } from '../../domain/models';
import { prisma } from '../database/prisma';

export class PrismaConfigRepository implements IConfigRepository {
  async getConfigValue(key: string): Promise<string | null> {
    const config = await prisma.configuration.findUnique({
      where: { key }
    });
    return config ? config.value : null;
  }

  async setConfigValue(key: string, value: string): Promise<Configuration> {
    const upserted = await prisma.configuration.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    return upserted;
  }
}
