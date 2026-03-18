export interface Vm {
  uuid: string;
  name: string;
  status: string; // 'running', 'stopped', etc.
  // Add other relevant IDCloudHost VM properties as needed
}

export interface VmSchedule {
  id: number;
  vmUuid: string;
  action: 'START' | 'STOP';
  cronExpression: string;
  timezone: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Configuration {
  id: number;
  key: string;
  value: string;
}
