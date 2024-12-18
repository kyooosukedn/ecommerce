import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { Product } from '../../interfaces/product.interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  isLoading: boolean = true;
  error: string | null = null;
  isInWishlist: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      const numericId = parseInt(productId, 10);
      this.productService.getProductById(numericId).subscribe({
        next: (product) => {
          this.product = product;
          this.isLoading = false;
          this.isInWishlist = this.wishlistService.isInWishlist(productId);
        },
        error: (error) => {
          this.error = 'Failed to load product';
          this.isLoading = false;
          this.toastr.error('Failed to load product');
        }
      });
    } else {
      this.error = 'Invalid product ID';
      this.isLoading = false;
    }
  }

  calculateDiscountedPrice(): number {
    if (!this.product) return 0;
    if (this.product.discount) {
      return this.product.price * (1 - this.product.discount / 100);
    }
    return this.product.price;
  }

  getRatingStars(): string {
    if (!this.product) return '';
    return '★'.repeat(Math.floor(this.product.rating)) + '☆'.repeat(5 - Math.floor(this.product.rating));
  }

  addToCart(): void {
    if (!this.product) return;
    
    if (!this.product.inStock) {
      this.toastr.warning('This product is out of stock');
      return;
    }

    try {
      this.cartService.addToCart(this.product);
      this.toastr.success('Product added to cart successfully');
    } catch (error) {
      this.toastr.error('Failed to add product to cart');
      console.error('Error adding product to cart:', error);
    }
  }

  toggleWishlist(): void {
    if (!this.product) return;

    if (this.isInWishlist) {
      this.wishlistService.removeFromWishlist(this.product.id.toString());
      this.isInWishlist = false;
      this.toastr.success('Removed from wishlist');
    } else {
      this.wishlistService.addToWishlist(this.product.id.toString());
      this.isInWishlist = true;
      this.toastr.success('Added to wishlist');
    }
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
