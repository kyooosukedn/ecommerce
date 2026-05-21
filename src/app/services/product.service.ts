import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay, BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = environment.apiUrl;
  private productsCache = new Map<string, Product[]>();
  private categoriesCache: string[] | null = null;
  private productCache = new Map<number, Product>();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
    // Try to load from localStorage on init
    this.loadCacheFromStorage();
  }

  getProducts(category?: string): Observable<Product[]> {
    const cacheKey = category || 'all';
    
    // Check cache first
    if (this.productsCache.has(cacheKey)) {
      return of(this.productsCache.get(cacheKey)!);
    }

    this.loadingSubject.next(true);
    const url = category 
      ? `${this.apiUrl}/products/category/${category}`
      : `${this.apiUrl}/products`;
    
    return this.http.get<Product[]>(url).pipe(
      map(products => {
        // Add random discounts for testing (remove in production)
        return products.map(product => ({
          ...product,
          discount: Math.random() < 0.3 ? Math.floor(Math.random() * 30) + 10 : undefined
        }));
      }),
      map(products => {
        // Cache the results
        this.productsCache.set(cacheKey, products);
        this.saveCacheToStorage();
        this.loadingSubject.next(false);
        return products;
      }),
      catchError(() => {
        this.loadingSubject.next(false);
        return of([]);
      }),
      shareReplay(1)
    );
  }

  getProduct(id: number): Observable<Product> {
    // Check cache first
    if (this.productCache.has(id)) {
      return of(this.productCache.get(id)!);
    }

    this.loadingSubject.next(true);
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`).pipe(
      map(product => {
        // Cache the result
        this.productCache.set(id, product);
        this.saveCacheToStorage();
        this.loadingSubject.next(false);
        return product;
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        throw error;
      }),
      shareReplay(1)
    );
  }

  getCategories(): Observable<string[]> {
    // Check cache first
    if (this.categoriesCache) {
      return of(this.categoriesCache);
    }

    return this.http.get<string[]>(`${this.apiUrl}/products/categories`).pipe(
      map(categories => {
        // Cache the results
        this.categoriesCache = categories;
        this.saveCacheToStorage();
        return categories;
      }),
      catchError(() => of([])),
      shareReplay(1)
    );
  }

  clearCache(): void {
    this.productsCache.clear();
    this.productCache.clear();
    this.categoriesCache = null;
    localStorage.removeItem('productsCache');
    localStorage.removeItem('productCache');
    localStorage.removeItem('categoriesCache');
  }

  private loadCacheFromStorage(): void {
    try {
      const productsCache = localStorage.getItem('productsCache');
      const productCache = localStorage.getItem('productCache');
      const categoriesCache = localStorage.getItem('categoriesCache');

      if (productsCache) {
        this.productsCache = new Map(JSON.parse(productsCache));
      }
      if (productCache) {
        this.productCache = new Map(JSON.parse(productCache));
      }
      if (categoriesCache) {
        this.categoriesCache = JSON.parse(categoriesCache);
      }
    } catch (error) {
      console.error('Error loading cache from storage:', error);
      this.clearCache();
    }
  }

  private saveCacheToStorage(): void {
    try {
      localStorage.setItem('productsCache', JSON.stringify([...this.productsCache]));
      localStorage.setItem('productCache', JSON.stringify([...this.productCache]));
      if (this.categoriesCache) {
        localStorage.setItem('categoriesCache', JSON.stringify(this.categoriesCache));
      }
    } catch (error) {
      console.error('Error saving cache to storage:', error);
    }
  }
}