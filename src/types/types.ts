export type User = {
  id: string;
  clerkId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string | null;
  email: string;
  phone: string;
  avatarUrl: string | null;
  language: string | null;
  companyId: string | null;
  roleId: string;
  locationId: string | null;
};

export type Location = {
  id: string;
  name: string;
  country: string;
  city: string;
  address: string;
  lat: number;
  long: number;
};
export type Event = {
  id: string;
  title: string;
  description: string;
  category: string;
  startedAt: string;
  endedAt: string;
  price: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  locationId: string;
  createdBy: string;
  location: Location;
};

export type EventRequest = {
  id: string;
  eventId: string;
  userId: string;
  createdAt: string;
  targetUserId: string;
  status: string;
  user: User;
  targetUser: User;
  event: Event;
};
export type FriendRequest = {
  id: string;
  userId: string;
  targetUserId: string;
  createdAt: string;
  status: string;
  user: User;
  targetUser: User;
};

export type Coordinates = {
  lat: number;
  lng: number;
  heading: number | null;
}

export interface Message {
  id: string;
  text?: string;
  sender: "me" | "other";
  senderName: string;
  senderAddress: string;
  timestamp: Date;
  dataType?: 'image' | 'audio' | 'file' | 'custom';
  dataProgress?: number;
  dataStatus?: "sending" | "receiving" | "completed" | "failed";
}
