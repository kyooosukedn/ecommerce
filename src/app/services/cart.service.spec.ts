import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Product } from '../interfaces/product.interface';

describe('CartService', () => {
  let service: CartService;

  const mockProduct: Product = {
    id: 1,
    title: "Test Product",
    price: 100,
    description: "Test description",
    category: "test",
    image: "test.jpg",
    rating: { rate: 4.5, count: 100 },
    inStock: true,
    quantity: 1
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartService]
    });
    service = TestBed.inject(CartService);
    
    // Clear localStorage before each test
    localStorage.clear();
    // Clear the cart
    service.clearCart();
  });

  describe('addToCart', () => {
    it('should add a product to an empty cart', () => {
      service.addToCart(mockProduct);
      
      const cartItems = service.getCartItems();
      expect(cartItems.length).toBe(1);
      expect(cartItems[0].id).toBe(mockProduct.id);
      expect(cartItems[0].quantity).toBe(1);
    });

    it('should increment quantity for existing product', () => {
      service.addToCart(mockProduct);
      service.addToCart(mockProduct);
      
      const cartItems = service.getCartItems();
      expect(cartItems.length).toBe(1);
      expect(cartItems[0].quantity).toBe(2);
    });

    it('should emit updated cart items', (done) => {
      let emitCount = 0;
      service.cartItems$.subscribe(items => {
        emitCount++;
        if (emitCount === 2) { // Initial empty array + added item
          expect(items.length).toBe(1);
          expect(items[0].id).toBe(mockProduct.id);
          done();
        }
      });

      service.addToCart(mockProduct);
    });
  });

  describe('removeFromCart', () => {
    beforeEach(() => {
      service.addToCart(mockProduct);
    });

    it('should remove a product from cart', () => {
      service.removeFromCart(mockProduct.id);
      
      const cartItems = service.getCartItems();
      expect(cartItems.length).toBe(0);
    });

    it('should emit updated cart items after removal', (done) => {
      let emitCount = 0;
      service.cartItems$.subscribe(items => {
        emitCount++;
        if (emitCount === 2) { // Initial cart + removal
          expect(items.length).toBe(0);
          done();
        }
      });

      service.removeFromCart(mockProduct.id);
    });
  });

  describe('updateQuantity', () => {
    beforeEach(() => {
      service.addToCart(mockProduct);
    });

    it('should update product quantity', () => {
      service.updateQuantity(mockProduct.id, 3);
      
      const cartItems = service.getCartItems();
      expect(cartItems[0].quantity).toBe(3);
    });

    it('should remove product if quantity is 0', () => {
      service.updateQuantity(mockProduct.id, 0);
      
      const cartItems = service.getCartItems();
      expect(cartItems.length).toBe(0);
    });

    it('should not allow negative quantities', () => {
      service.updateQuantity(mockProduct.id, -1);
      
      const cartItems = service.getCartItems();
      expect(cartItems[0].quantity).toBe(1); // Should remain unchanged
    });
  });

  describe('clearCart', () => {
    beforeEach(() => {
      service.addToCart(mockProduct);
    });

    it('should remove all items from cart', () => {
      service.clearCart();
      
      const cartItems = service.getCartItems();
      expect(cartItems.length).toBe(0);
    });

    it('should emit empty cart after clearing', (done) => {
      let emitCount = 0;
      service.cartItems$.subscribe(items => {
        emitCount++;
        if (emitCount === 2) { // Initial cart + clear
          expect(items.length).toBe(0);
          done();
        }
      });

      service.clearCart();
    });
  });

  describe('getCartTotal', () => {
    it('should calculate total for single item', () => {
      service.addToCart(mockProduct);
      expect(service.getCartTotal()).toBe(100);
    });

    it('should calculate total for multiple quantities', () => {
      service.addToCart(mockProduct);
      service.updateQuantity(mockProduct.id, 3);
      expect(service.getCartTotal()).toBe(300);
    });

    it('should calculate total for multiple products', () => {
      const product2 = { ...mockProduct, id: 2, price: 200 };
      service.addToCart(mockProduct);
      service.addToCart(product2);
      expect(service.getCartTotal()).toBe(300);
    });

    it('should return 0 for empty cart', () => {
      expect(service.getCartTotal()).toBe(0);
    });
  });
});
