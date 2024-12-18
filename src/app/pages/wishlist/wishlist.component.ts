import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistService } from '../../services/wishlist.service';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Observable, map, switchMap } from 'rxjs';
import { RouterModule } from '@angular/router';
import { Product } from '../../interfaces/product.interface';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">My Wishlist</h1>
      
      @if (products$ | async; as products) {
        @if (products.length === 0) {
          <div class="text-center py-8">
            <p class="text-gray-600">Your wishlist is empty</p>
            <a routerLink="/products" class="text-blue-600 hover:underline mt-2 inline-block">
              Continue Shopping
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (product of products; track product.id) {
              <div class="border rounded-lg p-4 shadow-sm">
                <img [src]="product.image" [alt]="product.title" class="w-full h-48 object-cover rounded-md">
                <h3 class="text-lg font-semibold mt-2">{{product.title}}</h3>
                <p class="text-gray-600">{{product.price | currency}}</p>
                <div class="mt-4 flex gap-2">
                  <button 
                    (click)="addToCart(product)"
                    class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-1">
                    Add to Cart
                  </button>
                  <button 
                    (click)="removeFromWishlist(product.id.toString())"
                    class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                    Remove
                  </button>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class WishlistComponent implements OnInit {
  products$!: Observable<Product[]>;

  constructor(
    private wishlistService: WishlistService,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.products$ = this.wishlistService.getWishlist().pipe(
      switchMap(wishlist => {
        const productIds = wishlist.items.map(item => parseInt(item.productId, 10));
        return this.productService.getProducts().pipe(
          map(products => products.filter(product => productIds.includes(product.id)))
        );
      })
    );
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  removeFromWishlist(productId: string): void {
    this.wishlistService.removeFromWishlist(productId);
  }
}
