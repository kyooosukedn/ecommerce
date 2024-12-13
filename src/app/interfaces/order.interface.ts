export interface ShippingDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface Order {
    id: string;
    items: {
        productId: number;
        quantity: number;
        price: number;
        title: string;
    }[];
    shippingDetails: ShippingDetails;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
    createdAt: Date;
}
