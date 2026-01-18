export interface UserType {
  id: string;

  name: string;

  idDevice?: string | null;

  email: string;

  password: string;

  createdAt: Date;

  updatedAt: Date;

  isActive: boolean;

  image?: string | null;

  birthday?: string | null;

}

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

