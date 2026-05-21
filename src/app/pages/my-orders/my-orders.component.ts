import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-orders.component.html',
  styles: [`
    .orders-container {
      padding: 20px;
    }
    .order-card {
      border: 1px solid #ddd;
      margin-bottom: 1rem;
      padding: 1rem;
      border-radius: 4px;
    }
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .order-items {
      margin: 1rem 0;
    }
    .order-total {
      font-weight: bold;
      text-align: right;
    }
    .status-pending {
      color: #f59e0b;
    }
    .status-completed {
      color: #10b981;
    }
    .status-cancelled {
      color: #ef4444;
    }
  `]
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  error: string | null = null;
  isLoading = false;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.isLoading = true;
    try {
      this.orders = this.orderService.getOrders();
      this.error = null;
    } catch (err) {
      this.error = 'Failed to load orders';
      console.error('Error loading orders:', err);
    } finally {
      this.isLoading = false;
    }
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
  }

  cancelOrder(orderId: string): void {
    this.orderService.updateOrderStatus(orderId, 'cancelled');
    this.loadOrders();
  }
}
