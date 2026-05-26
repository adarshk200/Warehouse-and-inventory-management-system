export interface OrderItemRequest {
  productId: string;
  quantity: number;
}

export interface OrderRequest {
  customerId?: string | null;
  items?: OrderItemRequest[];
  productId?: string;
  quantity?: number;
}

