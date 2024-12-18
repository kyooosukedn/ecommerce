import { Component, OnInit } from '@angular/core';
import { Product } from '../../interfaces/product.interface';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  selectedCategory: string = 'all';
  searchQuery: string = '';
  sortOption: string = 'featured';
  isLoading: boolean = true;

  constructor(
    private productService: ProductService, 
    private cartService: CartService,
    private wishlistService: WishlistService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchProducts();

    this.categories = ['Electronics', 'Fashion', 'Home', 'Books', 'Sports'];
    this.isLoading = false;
  }

  fetchProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.categories = Array.from(new Set(products.map(product => product.category)));
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Failed to load products');
        this.isLoading = false;
      }
    });
  }
  
  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.filteredProducts = category === 'all' ? this.products : this.products.filter(product => product.category === category);
  }

  searchProducts(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredProducts = this.products.filter(product => product.title?.toLowerCase().includes(query));
    console.log(this.products);
    console.log(this.filteredProducts);
  }

  sortProducts(option: string): void {
    this.sortOption = option;
    switch (option) {
      case 'price-low':
        this.products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        this.products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        this.products.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
  }

  calculateDiscountedPrice(product: Product): number {
    if (product.discount) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  }

  navigateToDetail(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  addToCart(event: Event, product: Product): void {
    event.stopPropagation();
    
    if (!product.inStock) {
      this.toastr.warning('This product is out of stock');
      return;
    }

    try {
      this.cartService.addToCart(product);
      this.toastr.success('Product added to cart successfully');
    } catch (error) {
      this.toastr.error('Failed to add product to cart');
      console.error('Error adding product to cart:', error);
    }
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistService.isInWishlist(productId.toString());
  }

  toggleWishlist(event: Event, product: Product): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.isInWishlist(product.id)) {
      this.wishlistService.removeFromWishlist(product.id.toString());
      this.toastr.success('Removed from wishlist');
    } else {
      this.wishlistService.addToWishlist(product.id.toString());
      this.toastr.success('Added to wishlist');
    }
  }

  getRatingStars(rating: number): string {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  }
}
