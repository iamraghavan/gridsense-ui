export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    apiKey: string;
    token?: string; 
}

export interface LoginResponse extends User {
    message?: string;
}

export interface ChannelEntry {
    _id: string;
    channelId: string;
    data: Record<string, number>;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface Channel {
    _id: string;
    channel_id: string;
    userId: string;
    projectName: string;
    description: string;
    fields: {
        name: string;
        unit: string;
        _id: string;
    }[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    latestData?: Record<string, number>;
    lastUpdate?: string;
    totalEntries?: number;
    entries?: ChannelEntry[];
}

export interface ChannelStats {
    totalChannels: number;
    totalFields: number;
    totalRequests: number;
}

export interface FieldStats {
    [key: string]: number;
}
