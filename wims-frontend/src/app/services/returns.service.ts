import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReturnsService {
  private apiUrl = 'http://localhost:8080/api/v1/returns';

  constructor(private http: HttpClient) {}

  getReturns(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addReturn(returnRequest: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, returnRequest);
  }
}
