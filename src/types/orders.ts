export interface Order {
  id: string;
  userId: string;
  planName: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface CreateOrderInput {
  planName: string;
  amount: number;
}
