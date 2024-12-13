import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <a routerLink="/home" class="text-xl font-bold text-indigo-600">E-commerce</a>
          </div>
          <nav class="flex items-center space-x-4">
            <a routerLink="/home" 
               routerLinkActive="text-indigo-600"
               [routerLinkActiveOptions]="{exact: true}"
               class="text-gray-700 hover:text-indigo-600 transition-colors">
              Home
            </a>
            <a routerLink="/cart" 
               routerLinkActive="text-indigo-600" 
               class="text-gray-700 hover:text-indigo-600 transition-colors relative">
              Cart
              <span *ngIf="cartItemCount > 0" 
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {{cartItemCount}}
              </span>
            </a>
            <ng-container *ngIf="user$ | async as user; else loginButton">
              <a routerLink="/my-orders" 
                 routerLinkActive="text-indigo-600" 
                 class="text-gray-700 hover:text-indigo-600 transition-colors">
                My Orders
              </a>
              <button (click)="logout()" 
                      class="text-gray-700 hover:text-indigo-600 transition-colors">
                Logout
              </button>
            </ng-container>
            <ng-template #loginButton>
              <a routerLink="/login" 
                 routerLinkActive="text-indigo-600" 
                 class="text-gray-700 hover:text-indigo-600 transition-colors">
                Login
              </a>
            </ng-template>
          </nav>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  cartItemCount: number = 0;
  user$ = this.authService.user$;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItemCount = items.length;
    });

  }

  

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      }
    });
  }
}
