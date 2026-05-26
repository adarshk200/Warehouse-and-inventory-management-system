import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private apiUrl = 'http://localhost:8080/api/v1/suppliers';

  constructor(private http: HttpClient) {}

  getSuppliers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addSupplier(supplier: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, supplier);
  }

  deleteSupplier(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
