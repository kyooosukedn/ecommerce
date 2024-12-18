import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WishlistItem, Wishlist } from '../interfaces/wishlist.interface';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistSubject = new BehaviorSubject<Wishlist>({ userId: 'default', items: [] });
  wishlist$ = this.wishlistSubject.asObservable();

  constructor() {
    this.loadWishlist();
  }

  private loadWishlist(): void {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      this.wishlistSubject.next(JSON.parse(savedWishlist));
    } else {
      this.wishlistSubject.next({ userId: 'default', items: [] });
    }
  }

  private saveWishlist(wishlist: Wishlist): void {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }

  addToWishlist(productId: string): void {
    const currentWishlist = this.wishlistSubject.value;
    if (!currentWishlist.items.some(item => item.productId === productId)) {
      const newItem: WishlistItem = {
        productId,
        userId: 'default',
        dateAdded: new Date()
      };
      const updatedWishlist = {
        userId: 'default',
        items: [...currentWishlist.items, newItem]
      };
      this.wishlistSubject.next(updatedWishlist);
      this.saveWishlist(updatedWishlist);
    }
  }

  removeFromWishlist(productId: string): void {
    const currentWishlist = this.wishlistSubject.value;
    const updatedWishlist = {
      ...currentWishlist,
      items: currentWishlist.items.filter(item => item.productId !== productId)
    };
    this.wishlistSubject.next(updatedWishlist);
    this.saveWishlist(updatedWishlist);
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistSubject.value.items.some(item => item.productId === productId);
  }

  getWishlist(): Observable<Wishlist> {
    return this.wishlist$;
  }

  clearWishlist(): void {
    const emptyWishlist: Wishlist = { userId: 'default', items: [] };
    this.wishlistSubject.next(emptyWishlist);
    this.saveWishlist(emptyWishlist);
  }
}
