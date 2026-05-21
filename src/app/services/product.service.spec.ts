import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts', () => {
    const mockProducts: Product[] = [
      {
        id: 1,
        title: 'Product 1',
        price: 10.99,
        description: 'Description 1',
        category: 'Category 1',
        image: 'image1.jpg',
        rating: { rate: 4.5, count: 10 }
      },
      {
        id: 2,
        title: 'Product 2',
        price: 20.99,
        description: 'Description 2',
        category: 'Category 2',
        image: 'image2.jpg',
        rating: { rate: 3.5, count: 20 }
      }
    ];

    it('should return all products', () => {
      service.getProducts().subscribe(products => {
        expect(products).toEqual(mockProducts);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/products`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);
    });

    it('should return products by category', () => {
      const category = 'Category 1';
      service.getProducts(category).subscribe(products => {
        expect(products).toEqual([mockProducts[0]]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/products/category/${category}`);
      expect(req.request.method).toBe('GET');
      req.flush([mockProducts[0]]);
    });
  });

  describe('getProduct', () => {
    const mockProduct: Product = {
      id: 1,
      title: 'Product 1',
      price: 10.99,
      description: 'Description 1',
      category: 'Category 1',
      image: 'image1.jpg',
      rating: { rate: 4.5, count: 10 }
    };

    it('should return a single product', () => {
      service.getProduct(1).subscribe(product => {
        expect(product).toEqual(mockProduct);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/products/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProduct);
    });

    it('should handle errors', () => {
      service.getProduct(999).subscribe({
        error: error => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/products/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getCategories', () => {
    const mockCategories = ['Category 1', 'Category 2', 'Category 3'];

    it('should return all categories', () => {
      service.getCategories().subscribe(categories => {
        expect(categories).toEqual(mockCategories);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/products/categories`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCategories);
    });

    it('should handle errors', () => {
      service.getCategories().subscribe(categories => {
        expect(categories).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/products/categories`);
      req.error(new ErrorEvent('Network error'));
    });
  });
});
