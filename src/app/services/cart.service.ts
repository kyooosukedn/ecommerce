import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Product } from "../interfaces/product.interface";

@Injectable({
    providedIn:'root',
})

export class CartService {
    private cartItems = new BehaviorSubject<Product[]>([]);
    cartItems$ = this.cartItems.asObservable();

    addToCart(product: Product): void {
        if (!product.inStock) {
            console.warn('Cannot add out-of-stock item to cart');
            return;
        }

        const currentCart = this.cartItems.value;
        const existingProduct = currentCart.find((item) => item.id === product.id); 

        if (existingProduct) {
            existingProduct.quantity = (existingProduct.quantity || 1) + 1;
        } else {
            currentCart.push({...product, quantity: 1});
        }

        this.cartItems.next([...currentCart]);
    }

    updateQuantity(productId: number, quantity: number): void {
        const updatedCart = this.cartItems.value.map(item => 
            item.id === productId ? {...item, quantity} : item
        );
        this.cartItems.next(updatedCart);
    }

    removeFromCart(productId: number) :void {
        const updatedCart = this.cartItems.value.filter(item => item.id !== productId);
        this.cartItems.next(updatedCart);
    }

    getCartItems(): Product[] {
        return this.cartItems.value;
    }

    clearCart(): void {
        this.cartItems.next([]);
    }
}