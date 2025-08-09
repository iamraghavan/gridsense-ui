
export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin' | '';
    apiKey: string;
    token?: string; 
}

export interface LoginResponse {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin' | '';
    apiKey: string;
    token: string;
    message?: string;
}

export interface ChannelHistory {
    _id: string;
    channelId: string;
    data: Record<string, number>;
    createdAt: string;
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
    history?: ChannelHistory[]; // This might be paginated, so don't rely on it for counts/latest
    lastUpdate?: string; // For dashboard view
}

export interface ChannelStats {
    totalChannels?: number; // From dashboard overview
    totalFields?: number; // From dashboard overview
    totalRequests?: number; // From dashboard overview
    channelId?: string; // From channel-specific stats
    totalEntries?: number; // From channel-specific stats
    lastUpdate?: string; // From channel-specific stats
}


export interface FieldStats {
    [key: string]: number;
}
