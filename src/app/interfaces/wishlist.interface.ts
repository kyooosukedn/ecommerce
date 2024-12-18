export interface WishlistItem {
    productId: string;
    userId: string;
    dateAdded: Date;
}

export interface Wishlist {
    userId: string;
    items: WishlistItem[];
}
