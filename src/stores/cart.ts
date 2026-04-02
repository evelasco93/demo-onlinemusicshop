import { atom } from "nanostores";

export interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  precioFinal: number;
  cantidad: number;
  imagen: string;
  categoria: string;
  marca: string;
  nota?: string;
}

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("oms_cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCart(items: readonly CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("oms_cart", JSON.stringify(items));
}

export const cartItems = atom<CartItem[]>([]);
export const cartOpen = atom<boolean>(false);

// Initialize from localStorage on client
if (typeof window !== "undefined") {
  cartItems.set(loadCart());
}

cartItems.subscribe(saveCart);

export function addToCart(item: CartItem) {
  const current = cartItems.get();
  const existing = current.find((i) => i.id === item.id);
  if (existing) {
    cartItems.set(
      current.map((i) =>
        i.id === item.id ? { ...i, cantidad: i.cantidad + item.cantidad } : i,
      ),
    );
  } else {
    cartItems.set([...current, item]);
  }
}

export function removeFromCart(id: string) {
  cartItems.set(cartItems.get().filter((i) => i.id !== id));
}

export function updateQuantity(id: string, cantidad: number) {
  if (cantidad <= 0) {
    removeFromCart(id);
    return;
  }
  cartItems.set(
    cartItems.get().map((i) => (i.id === id ? { ...i, cantidad } : i)),
  );
}

export function clearCart() {
  cartItems.set([]);
}

export function getCartTotal(): number {
  return cartItems
    .get()
    .reduce((sum, item) => sum + item.precioFinal * item.cantidad, 0);
}

export function getCartCount(): number {
  return cartItems.get().reduce((sum, item) => sum + item.cantidad, 0);
}
