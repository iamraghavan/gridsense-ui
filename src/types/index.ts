
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  field1: string;
  field2: string;
  field3: string;
  field4: string;
  field5: string;
  field6: string;
  field7: string;
  field8: string;
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
