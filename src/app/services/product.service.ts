import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { from, map, Observable } from "rxjs";
import { Product } from "../interfaces/product.interface";

@Injectable({
    providedIn:'root',
})
export class ProductService {
    private apiUrl = 'https://fakestoreapi.com/products';

    constructor(private http: HttpClient) {}

    getProducts() : Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl).pipe(
            map((products: Product[]) =>
            products.map(product => ({
                ...product,
                inStock: this.determineStockStatus(product.id),
            }))
        ));
    }

    getProductById(id: number) : Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
            map(product => ({
                ...product,
                inStock: this.determineStockStatus(id),
            }))
        );
    }

    private determineStockStatus(productId: number): boolean {
        return productId % 2 === 0;
    }
}