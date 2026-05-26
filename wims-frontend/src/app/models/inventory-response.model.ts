export interface InventoryResponse {
  id: string;
  productId: string;
  warehouseId: string;
  availableQuantity: number;
  reservedQuantity: number;
  updatedAt?: string;
}
