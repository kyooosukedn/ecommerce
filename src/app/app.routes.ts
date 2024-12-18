import { Routes, Router } from '@angular/router';
import { ProductsComponent } from './pages/products/products.component';
import { CreateOrderComponent } from './pages/create-order/create-order.component';
import { MyOrdersComponent } from './pages/my-orders/my-orders.component';
import { CartComponent } from './cart/cart.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { OrderConfirmationComponent } from './pages/order-confirmation/order-confirmation.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { map } from 'rxjs/operators';

// Auth guard function
const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return authService.isAuthenticated().pipe(
    map(isAuthenticated => {
      if (!isAuthenticated) {
        router.navigate(['/login']);
        return false;
      }
      return true;
    })
  );
};

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: ProductsComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'signup',
        component: SignupComponent
    },
    {
        path: 'product/:id',
        component: ProductDetailComponent
    },
    {
        path: 'wishlist',
        component: WishlistComponent
    },
    {
        path: 'cart',
        component: CartComponent
    },
    {
        path: 'checkout',
        component: CheckoutComponent,
        canActivate: [authGuard]
    },
    {
        path: 'create-order',
        component: CreateOrderComponent,
        canActivate: [authGuard]
    },
    {
        path: 'my-orders',
        component: MyOrdersComponent,
        canActivate: [authGuard]
    },
    {
        path: 'order-confirmation',
        component: OrderConfirmationComponent,
        canActivate: [authGuard]
    }
];
