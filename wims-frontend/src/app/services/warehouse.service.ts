import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private apiUrl = 'http://localhost:8080/api/v1/warehouses';
  constructor(private http: HttpClient) {}

  getWarehouses(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createWarehouse(warehouse: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, warehouse);
  }
}
