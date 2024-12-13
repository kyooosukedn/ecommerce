import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Order } from '../../interfaces/order.interface';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-confirmation.component.html',
})
export class OrderConfirmationComponent implements OnInit { 
  order: Order | null = null;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.order = navigation.extras.state['order'] as Order;
    }
  }

  ngOnInit(): void {
    if (!this.order) {
      this.router.navigate(['/home']);
    }
  }

  continueShopping(): void {
    this.router.navigate(['/home']);
  }
}
