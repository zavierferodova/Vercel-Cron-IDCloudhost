import { Configuration } from '../models';

export interface IConfigRepository {
  getConfigValue(key: string): Promise<string | null>;
  setConfigValue(key: string, value: string): Promise<Configuration>;
}
