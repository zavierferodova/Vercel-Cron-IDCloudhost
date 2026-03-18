import axios, { AxiosInstance } from 'axios';
import { IIdCloudHostRepository } from '../../domain/repositories/IIdCloudHostRepository';
import { Vm } from '../../domain/models';

export class AxiosIdCloudHostRepository implements IIdCloudHostRepository {
  private apiClient: AxiosInstance;

  constructor(apiToken?: string) {
    const token = apiToken || process.env.IDCLOUDHOST_API_TOKEN;
    if (!token) {
      console.warn("WARNING: No IDCloudHost API token provided. Calls will fail.");
    }

    // Default config based on IDCloudHost documentation
    // Since IDCloudhost has different zones or regions, the URL requires a location slug.
    this.apiClient = axios.create({
      baseURL: `https://api.idcloudhost.com/v1`,
      headers: {
        'apikey': token,
        'Content-Type': 'application/json'
      }
    });
  }

  async getVms(location?: string): Promise<Vm[]> {
    const loc = location || 'jkt01';
    try {
      const response = await this.apiClient.get(`/${loc}/user-resource/vm/list`);
      // Map response to our domain model `Vm`. 
      // Replace with actual mapping logic depending on actual IDCloudHost response structure.
      return response.data; // Assuming it returns an array of VMs.
    } catch (error) {
      console.error('Error fetching VMs from IDCloudHost:', error);
      throw error;
    }
  }

  async getVm(uuid: string, location?: string): Promise<Vm | null> {
    const loc = location || 'jkt01';
    try {
      const response = await this.apiClient.get(`/${loc}/user-resource/vm`, {
        params: { uuid }
      });
      return response.data; // Adjust based on the actual JSON structure
    } catch (error) {
      console.error(`Error fetching VM ${uuid} from IDCloudHost:`, error);
      return null;
    }
  }

  async startVm(uuid: string, location?: string): Promise<boolean> {
    const loc = location || 'jkt01';
    try {
      // Typically it's a POST to `/vm/{uuid}/start` or similar. Adjust for actual IDCloudHost API.
      const response = await this.apiClient.post(`/${loc}/user-resource/vm/start`, { uuid });
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error(`Failed to start VM ${uuid}:`, error);
      throw error;
    }
  }

  async stopVm(uuid: string, location?: string): Promise<boolean> {
    const loc = location || 'jkt01';
    try {
      const response = await this.apiClient.post(`/${loc}/user-resource/vm/stop`, { uuid });
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error(`Failed to stop VM ${uuid}:`, error);
      throw error;
    }
  }
}
