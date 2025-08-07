
export interface User {
  id: string; // Changed from _id to id for consistency
  name: string;
  email: string;
  apiKey: string;
  createdAt?: string;
  role?: string; // Added role based on API response
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

export interface ChannelDataPoint {
  _id: string;
  channelId: string;
  data: Record<string, number>;
  createdAt: string;
}
