import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderRequest } from '../models/order-request.model';
import { OrderResponse } from '../models/order-response.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/v1/orders';

  constructor(private http: HttpClient) {}

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  placeOrder(request: OrderRequest): Observable<any>;
  placeOrder(productId: string, quantity: number): Observable<any>;
  placeOrder(requestOrProductId: OrderRequest | string, quantity?: number): Observable<any> {
    const request: OrderRequest = typeof requestOrProductId === 'string'
      ? { productId: requestOrProductId, quantity: quantity ?? 1 }
      : requestOrProductId;
    return this.http.post<any>(this.apiUrl, request);
  }

  updateStatus(orderId: string, status: string): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${orderId}/status`,
      status,
      { headers: new HttpHeaders({ 'Content-Type': 'text/plain' }) }
    );
  }

  cancelOrder(orderId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${orderId}`);
  }
}
