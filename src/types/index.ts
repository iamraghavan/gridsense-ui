
export interface User {
  id: string;
  name: string;
  email: string;
  apiKey: string;
  createdAt?: string;
}

export interface ChannelField {
    name: string;
    unit?: string;
    _id: string;
}

export interface Channel {
  _id: string;
  channel_id: string;
  userId: string;
  projectName: string;
  description: string;
  fields: ChannelField[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  latestData: Record<string, any> | null;
  lastUpdate: string | null;
  totalEntries?: number;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
}

export interface ChannelDataPoint {
  date: string;
  value: number;
}
