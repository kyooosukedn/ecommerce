export interface Product {
    quantity: number;
    title: any;
    id: number;
    description: string;
    price: number;
    image:string;
    category: string;
    rating:number;
    inStock: boolean;
    discount?:number;
}

export interface ProductFilter {
    category?:string;
    minPrice?:number;
    maxPrice?:number;
    inStock?:boolean;
    searchQuery?:string;
}

export type SortOption = 'featured'| 'price-low' | 'price-high' | 'rating';