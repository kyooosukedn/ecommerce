import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { Product } from "../interfaces/product.interface";
import { CartService } from "../services/cart.service";
import { HeaderComponent } from "../shared/header/header.component";

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    standalone: true,
    imports: [CommonModule, RouterModule, HeaderComponent],
})
export class CartComponent {
    cartItems: Product[] = [];

    constructor(private cartService: CartService) {
        this.cartService.cartItems$.subscribe((items) => {
            this.cartItems = items;
            console.log('Cart items updated:', items); 
        });
    }

    removeItem(productId: number): void {
        this.cartService.removeFromCart(productId);
    }

    updateQuantity(productId: number, quantity: number): void {
        if (quantity > 0) {
            this.cartService.updateQuantity(productId, quantity);
        } else {
            this.removeItem(productId);
        }
    }

    getTotal(): number {
        return this.cartItems.reduce((total, item) => 
            total + (item.price * (item.quantity || 1)), 0);
    }
}