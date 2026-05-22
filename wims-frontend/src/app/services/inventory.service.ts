import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryResponse } from '../models/inventory-response.model';
import { InventoryReceiveRequest } from '../models/inventory-receive-request.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private apiUrl = 'http://localhost:8080/api/v1/inventory';

  constructor(private http: HttpClient) {}

  getInventories(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  receiveStock(request: InventoryReceiveRequest): Observable<InventoryResponse> {
    return this.http.post<InventoryResponse>(`${this.apiUrl}/receive`, request);
  }

  transferStock(payload: { productId: string; fromWarehouseId: string; toWarehouseId: string; quantity: number }): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/transfer`, payload);
  }
}
