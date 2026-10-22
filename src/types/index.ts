export type UserRole = "client" | "worker";

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  studioName?: string;
  bio?: string;
  location?: string;
  materials?: string[];
  baseGramPrice?: number;
  baseHourPrice?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Model3D = {
  id: string;
  name: string;
  category: string;
  description: string;
  material: "PLA" | "PETG" | "Resina" | "TPU" | "ABS";
  weightGrams: number;
  printTimeMinutes: number;
  license: string;
  author: string;
  imageUrl: string;
  tags: string[];
  pricing: {
    gramPrice: number;
    hourPrice: number;
    platformFeePercent: number;
    materialCost: number;
    timeCost: number;
    extras: number;
    creatorSubtotal: number;
    platformFee: number;
    finalPrice: number;
  };
};

export type JobStatus = "published" | "with_offers" | "accepted" | "in_production" | "ready" | "delivered" | "cancelled";
export type OfferStatus = "sent" | "accepted" | "rejected";

export type PrintJob = {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  material: string;
  quantity: number;
  color: string;
  deliveryMethod: string;
  location: string;
  budgetMin: number;
  budgetMax: number;
  modelId?: string;
  modelImageUrl?: string;
  status: JobStatus;
  acceptedOfferId?: string;
  workerId?: string;
  workerName?: string;
  createdAt: string;
  updatedAt?: string;
};

export type Offer = {
  id: string;
  jobId: string;
  workerId: string;
  workerName: string;
  workerStudioName?: string;
  price: number;
  material: string;
  deliveryDays: number;
  deliveryMethod: string;
  notes: string;
  status: OfferStatus;
  createdAt: string;
};

export type Conversation = {
  id: string;
  jobId: string;
  jobTitle: string;
  participants: string[];
  participantNames: Record<string, string>;
  clientId: string;
  workerId: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
};

export type PortfolioItem = {
  id: string;
  workerId: string;
  title: string;
  description: string;
  material: string;
  imageUrl: string;
  createdAt: string;
};
