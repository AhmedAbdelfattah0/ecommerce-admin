import { Injectable, signal } from '@angular/core';
import { Cart } from '../../models/cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  shoppingCart = signal<Cart[]>(this.loadCartFromLocalStorage());
  wishlist = signal<Cart[]>(this.loadWishlistFromLocalStorage());

  constructor() { }

  addToCart(item: Cart) {
    const currentCart = this.shoppingCart();
    const existingItem = currentCart.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
      existingItem.qty += 1;
    } else {
      item.qty = 1;
      currentCart.push(item);
    }

    this.shoppingCart.set(currentCart);
    this.saveCartToLocalStorage(currentCart);
  }

  updateQty(itemId: number, qty: number) {
    const currentCart = this.shoppingCart();
    const item = currentCart.find(cartItem => cartItem.id === itemId);

    if (item) {
      item.qty = qty;
      this.shoppingCart.set(currentCart);
      this.saveCartToLocalStorage(currentCart);
    }
  }

  removeFromCart(itemId: number) {
    const currentCart = this.shoppingCart();
    const updatedCart = currentCart.filter(cartItem => cartItem.id !== itemId);

    this.shoppingCart.set(updatedCart);
    this.saveCartToLocalStorage(updatedCart);
  }

  addToWishlist(item: Cart) {
    const currentWishlist = this.wishlist();
    const existingItem = currentWishlist.find(wishlistItem => wishlistItem.id === item.id);

    if (existingItem) {
      existingItem.qty += 1;
    } else {
      item.qty = 1;
      currentWishlist.push(item);
    }

    this.wishlist.set(currentWishlist);
    this.saveWishlistToLocalStorage(currentWishlist);
  }

  updateWishlistQty(itemId: number, qty: number) {
    const currentWishlist = this.wishlist();
    const item = currentWishlist.find(wishlistItem => wishlistItem.id === itemId);

    if (item) {
      item.qty = qty;
      this.wishlist.set(currentWishlist);
      this.saveWishlistToLocalStorage(currentWishlist);
    }
  }

  removeFromWishlist(itemId: number) {
    const currentWishlist = this.wishlist();
    const updatedWishlist = currentWishlist.filter(wishlistItem => wishlistItem.id !== itemId);

    this.wishlist.set(updatedWishlist);
    this.saveWishlistToLocalStorage(updatedWishlist);
  }

  addAllToCart() {
    const currentCart = this.shoppingCart();
    const currentWishlist = this.wishlist();

    currentWishlist.forEach(wishlistItem => {
      const existingItem = currentCart.find(cartItem => cartItem.id === wishlistItem.id);

      if (existingItem) {
        existingItem.qty += wishlistItem.qty;
      } else {
        currentCart.push(wishlistItem);
      }
    });

    this.shoppingCart.set(currentCart);
    this.saveCartToLocalStorage(currentCart);
    this.wishlist.set([]);
    this.saveWishlistToLocalStorage([]);
  }

  private saveCartToLocalStorage(cart: Cart[]) {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
  }

  private loadCartFromLocalStorage(): Cart[] {
    const cart = localStorage.getItem('shoppingCart');
    return cart ? JSON.parse(cart) : [];
  }

  private saveWishlistToLocalStorage(wishlist: Cart[]) {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }

  private loadWishlistFromLocalStorage(): Cart[] {
    const cart = localStorage.getItem('wishlist');
    return cart ? JSON.parse(cart) : [];
  }
}
