import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private baseCatUrl = 'http://localhost:8080/api/v1/categories';
  private baseSubUrl = 'http://localhost:8080/api/v1/subcategories';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(this.baseCatUrl);
  }

  addCategory(category: any): Observable<any> {
    return this.http.post<any>(this.baseCatUrl, category);
  }

  getSubcategories(): Observable<any[]> {
    return this.http.get<any[]>(this.baseSubUrl);
  }

  getSubcategoriesByCategory(categoryId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseSubUrl}/category/${categoryId}`);
  }

  addSubcategory(subcategory: any): Observable<any> {
    return this.http.post<any>(this.baseSubUrl, subcategory);
  }
}
