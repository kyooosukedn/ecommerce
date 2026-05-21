export interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    rating: {
        rate: number;
        count: number;
    };
    inStock?: boolean;
    quantity?: number;
}

export interface ProductFilter {
    category?:string;
    minPrice?:number;
    maxPrice?:number;
    inStock?:boolean;
    searchQuery?:string;
}

export type SortOption = 'featured'| 'price-low' | 'price-high' | 'rating';