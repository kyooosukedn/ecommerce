import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { Product } from '../../models/product.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = true;
  error: string | null = null;
  selectedCategory: string | null = null;
  categories: string[] = [];
  searchQuery = '';
  sortOption = 'featured';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    public wishlistService: WishlistService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Subscribe to loading state
    this.productService.loading$.subscribe(
      isLoading => this.loading = isLoading
    );

    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.error = null;
    this.productService.getProducts(this.selectedCategory || undefined).subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.applyFilters();
      },
      error: (error: Error) => {
        this.error = 'Failed to load products';
        console.error('Error loading products:', error);
      }
    });
  }

  private loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories: string[]) => {
        this.categories = categories;
      },
      error: (error: Error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  calculateDiscountedPrice(price: number, discount: number | undefined): number {
    if (!discount) return price;
    return price * (1 - discount / 100);
  }

  getStarRating(rating: { rate: number; count: number }): string {
    const fullStars = Math.floor(rating.rate);
    const hasHalfStar = rating.rate % 1 >= 0.5;
    return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  }

  handleCategoryFilter(category: string | null): void {
    this.selectedCategory = category;
    this.loadProducts();
  }

  searchProducts(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.products];

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (this.sortOption) {
      case 'price-low':
        filtered.sort((a, b) => this.calculateDiscountedPrice(a.price, a.discount) - this.calculateDiscountedPrice(b.price, b.discount));
        break;
      case 'price-high':
        filtered.sort((a, b) => this.calculateDiscountedPrice(b.price, b.discount) - this.calculateDiscountedPrice(a.price, a.discount));
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        filtered.sort((a, b) => b.rating.rate - a.rating.rate);
    }

    this.filteredProducts = filtered;
  }

  sortProducts(): void {
    this.applyFilters();
  }

  handleAddToCart(product: Product): void {
    this.cartService.addToCart(product);
    this.toastr.success('Added to cart!');
  }

  handleWishlistToggle(product: Product): void {
    const productId = product.id.toString();
    if (this.wishlistService.isInWishlist(productId)) {
      this.wishlistService.removeFromWishlist(productId);
      this.toastr.info('Removed from wishlist');
    } else {
      this.wishlistService.addToWishlist(productId);
      this.toastr.success('Added to wishlist');
    }
  }
}
