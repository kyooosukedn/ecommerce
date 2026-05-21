import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];

  constructor(
    private cartService: CartService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
  }

  calculateItemTotal(item: CartItem): number {
    const price = item.discount !== undefined ? 
      item.price * (1 - item.discount / 100) : 
      item.price;
    return price * item.quantity;
  }

  calculateTotal(): number {
    return this.cartItems.reduce((total, item) => 
      total + this.calculateItemTotal(item), 0);
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
    this.toastr.info('Item removed from cart');
  }
}
