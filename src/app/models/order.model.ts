import { Product } from './product.model';

export interface Order {
  id: string;
  items: (Product & { quantity: number })[];
  total: number;
  date: Date;
  status: 'pending' | 'completed' | 'cancelled';
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}
