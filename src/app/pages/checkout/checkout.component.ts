import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { Product } from '../../interfaces/product.interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  cartItems: Product[] = [];
  checkoutForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.checkoutForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,}$')]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5,6}$')]],
      country: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      if (items.length === 0) {
        this.toastr.warning('Your cart is empty');
        this.router.navigate(['/home']);
      }
    });
  }

  calculateTotal(): number {
    return this.cartItems.reduce((total, item) => {
      const quantity = item.quantity || 1;
      const price = item.discount ? 
        item.price * (1 - item.discount / 100) : 
        item.price;
      return total + (price * quantity);
    }, 0);
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid) {
      Object.keys(this.checkoutForm.controls).forEach(key => {
        const control = this.checkoutForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      this.toastr.error('Please fill in all required fields correctly');
      return;
    }

    this.isSubmitting = true;
    
    // Pass shipping details directly to createOrder
    this.orderService.createOrder(this.checkoutForm.value).subscribe({
      next: (createdOrder) => {
        this.orderService.confirmOrder(createdOrder).subscribe({
          next: (confirmedOrder) => {
            this.cartService.clearCart();
            this.toastr.success('Order placed successfully!');
            this.router.navigate(['/order-confirmation'], { 
              state: { order: confirmedOrder } 
            });
          },
          error: (error) => {
            this.isSubmitting = false;
            this.toastr.error('Failed to confirm order');
            console.error('Error confirming order:', error);
          }
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        this.toastr.error('Failed to create order');
        console.error('Error creating order:', error);
      }
    });
  }
}
