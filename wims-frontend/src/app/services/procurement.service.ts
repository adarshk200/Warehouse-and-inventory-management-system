import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProcurementService {
  private apiUrl = 'http://localhost:8080/api/v1/purchase-orders';

  constructor(private http: HttpClient) {}

  getPurchaseOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addPurchaseOrder(order: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, order);
  }
}
