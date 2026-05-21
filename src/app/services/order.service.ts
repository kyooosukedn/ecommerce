import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

export interface Order {
  id: string;
  items: (Product & { quantity: number })[];
  total: number;
  date: Date;
  status: 'pending' | 'completed' | 'cancelled';
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orders = new BehaviorSubject<Order[]>([]);
  orders$ = this.orders.asObservable();

  constructor() {
    // Load orders from localStorage if exists
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      this.orders.next(JSON.parse(savedOrders));
    }
  }

  createOrder(items: (Product & { quantity: number })[], address: Order['address']): Order {
    const order: Order = {
      id: this.generateOrderId(),
      items: [...items],
      total: this.calculateTotal(items),
      date: new Date(),
      status: 'pending',
      address
    };

    const currentOrders = this.orders.value;
    this.orders.next([...currentOrders, order]);
    this.saveToLocalStorage();

    return order;
  }

  getOrders(): Order[] {
    return this.orders.value;
  }

  updateOrderStatus(orderId: string, status: Order['status']): void {
    const currentOrders = this.orders.value;
    const updatedOrders = currentOrders.map(order => 
      order.id === orderId ? { ...order, status } : order
    );
    this.orders.next(updatedOrders);
    this.saveToLocalStorage();
  }

  private calculateTotal(items: (Product & { quantity: number })[]): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  private generateOrderId(): string {
    return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('orders', JSON.stringify(this.orders.value));
  }
}
