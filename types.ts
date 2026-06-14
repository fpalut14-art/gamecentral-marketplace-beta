export type Listing = {
  id: string;
  title: string;
  price: number;
  image: string;
  username?: string;
  userId?: string;
  category?: string;
  description?: string;
  status?: "pending" | "active" | "rejected";
  createdAt?: unknown;
};
