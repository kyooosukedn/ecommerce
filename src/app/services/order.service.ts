import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Order, ShippingDetails } from '../interfaces/order.interface';
import { CartService } from './cart.service';
import { Product } from '../interfaces/product.interface';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private orders: Order[] = [];

    constructor(private cartService: CartService) {}

    createOrder(shippingDetails: ShippingDetails): Observable<Order> {
        const cartItems = this.cartService.getCartItems();
        
        const order: Order = {
            id: this.generateOrderId(),
            items: cartItems.map(item => ({
                productId: item.id,
                quantity: item.quantity || 1,
                price: item.price,
                title: item.title
            })),
            shippingDetails,
            totalAmount: this.calculateTotal(cartItems),
            status: 'pending',
            createdAt: new Date()
        };

        // Simulate API call
        return of(order).pipe(
            delay(1000) 
        );
    }

    private calculateTotal(items: Product[]): number {
        return items.reduce((total, item) => {
            const quantity = item.quantity || 1;
            const price = item.discount ? 
                item.price * (1 - item.discount / 100) : 
                item.price;
            return total + (price * quantity);
        }, 0);
    }

    private generateOrderId(): string {
        return 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    }

    getOrders(): Observable<Order[]> {
        return of(this.orders);
    }

    confirmOrder(order: Order): Observable<Order> {
        order.status = 'confirmed';
        this.orders.push(order);
        this.cartService.clearCart(); 
        return of(order).pipe(delay(500));
    }
}
