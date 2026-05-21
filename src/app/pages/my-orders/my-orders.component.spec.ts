import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MyOrdersComponent } from './my-orders.component';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

describe('MyOrdersComponent', () => {
  let component: MyOrdersComponent;
  let fixture: ComponentFixture<MyOrdersComponent>;
  let orderService: jasmine.SpyObj<OrderService>;

  const mockOrder: Order = {
    id: 'ORD-123',
    items: [
      {
        id: 1,
        title: 'Test Product',
        price: 100,
        description: 'Test description',
        category: 'test',
        image: 'test.jpg',
        rating: { rate: 4.5, count: 100 },
        quantity: 1
      }
    ],
    total: 100,
    date: new Date('2025-01-09'),
    status: 'pending',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zip: '12345'
    }
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('OrderService', ['getOrders', 'updateOrderStatus']);
    
    await TestBed.configureTestingModule({
      imports: [MyOrdersComponent, RouterTestingModule],
      providers: [{ provide: OrderService, useValue: spy }]
    }).compileComponents();

    orderService = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
    fixture = TestBed.createComponent(MyOrdersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load orders on init', () => {
    orderService.getOrders.and.returnValue([mockOrder]);
    fixture.detectChanges();
    expect(component.orders).toEqual([mockOrder]);
  });

  it('should format date correctly', () => {
    const testDate = new Date('2024-12-25');
    const formattedDate = component.formatDate(testDate);
    expect(formattedDate).toBe('25.12.2024');
  });

  it('should cancel order', () => {
    orderService.getOrders.and.returnValue([mockOrder]);
    orderService.updateOrderStatus.and.returnValue(undefined);
    
    fixture.detectChanges();
    component.cancelOrder('ORD-123');

    expect(orderService.updateOrderStatus).toHaveBeenCalledWith('ORD-123', 'cancelled');
    expect(orderService.getOrders).toHaveBeenCalledTimes(2); // Initial load + after cancel
  });
});
