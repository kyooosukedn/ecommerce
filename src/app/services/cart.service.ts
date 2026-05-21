import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

export type CartItem = Product & { quantity: number };

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItems.asObservable();

  constructor() {
    // Load cart from localStorage if exists
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems.next(JSON.parse(savedCart));
    }
  }

  addToCart(product: Product) {
    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
      this.cartItems.next([...currentItems]);
    } else {
      const newProduct: CartItem = { ...product, quantity: 1 };
      this.cartItems.next([...currentItems, newProduct]);
    }

    this.saveToLocalStorage();
  }

  removeFromCart(productId: number) {
    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.filter(item => item.id !== productId);
    this.cartItems.next(updatedItems);
    this.saveToLocalStorage();
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity < 0) return;

    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.map(item => {
      if (item.id === productId) {
        return { ...item, quantity };
      }
      return item;
    }).filter(item => item.quantity > 0);

    this.cartItems.next(updatedItems);
    this.saveToLocalStorage();
  }

  getCartItems(): CartItem[] {
    return this.cartItems.value;
  }

  getCartTotal(): number {
    return this.cartItems.value.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  clearCart() {
    this.cartItems.next([]);
    localStorage.removeItem('cart');
  }

  private saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems.value));
  }
}