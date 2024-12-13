import { Routes } from '@angular/router';
import { ProductsComponent } from './pages/products/products.component';
import { CreateOrderComponent } from './pages/create-order/create-order.component';
import { MyOrdersComponent } from './pages/my-orders/my-orders.component';
import { CartComponent } from './cart/cart.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { OrderConfirmationComponent } from './pages/order-confirmation/order-confirmation.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

export const routes: Routes = [
    {
        path:'',
        redirectTo:'home',
        pathMatch:'full'
    },
    {
        path:'home',
        component:ProductsComponent
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
    },
    {
        path:'product/:id',
        component:ProductDetailComponent
    },
    {
        path:'cart',
        component:CartComponent
    },
    {
        path:'checkout',
        component:CheckoutComponent,
        canActivate: [() => inject(AuthService).isAuthenticated()]
    },
    {
        path:'create-order',
        component:CreateOrderComponent
    },
    {
        path:'my-orders',
        component:MyOrdersComponent,
        canActivate: [() => inject(AuthService).isAuthenticated()]
    },
    {
        path:'order-confirmation',
        component:OrderConfirmationComponent
    }
];
