import { atom } from "nanostores";

export interface OrderLine {
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface OrderHistory {
  id: string;
  fecha: string;
  total: number;
  puntos: number;
  estado: string;
  items: number;
  lineas?: OrderLine[];
}

export interface UserState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  id: string;
  nombre: string;
  email: string;
  puntos: number;
  codigosUsados: string[];
  historial: OrderHistory[];
  recompensasCanjeadas: string[];
}

const defaultUser: UserState = {
  isLoggedIn: false,
  isAdmin: false,
  id: "",
  nombre: "",
  email: "",
  puntos: 0,
  codigosUsados: [],
  historial: [],
  recompensasCanjeadas: [],
};

function loadUser(): UserState {
  if (typeof window === "undefined") return defaultUser;
  try {
    const saved = localStorage.getItem("oms_user_session");
    if (!saved) return defaultUser;
    const parsed = JSON.parse(saved) as Partial<UserState>;
    return {
      ...defaultUser,
      ...parsed,
      isLoggedIn: Boolean(parsed.isLoggedIn),
      isAdmin: Boolean(parsed.isAdmin),
    };
  } catch {
    return defaultUser;
  }
}

function saveUser(state: UserState) {
  if (typeof window === "undefined") return;
  if (state.isLoggedIn) {
    localStorage.setItem("oms_user_session", JSON.stringify(state));
  }
}

export const user = atom<UserState>(defaultUser);

if (typeof window !== "undefined") {
  user.set(loadUser());
}

user.subscribe(saveUser);

export function login(email: string, password: string): boolean {
  // Demo credentials
  const validAccounts = [
    {
      email: "demo@oms.com",
      password: "demo123",
      nombre: "Usuario Demo",
      isAdmin: false,
    },
    {
      email: "admin@oms.com",
      password: "admin123",
      nombre: "Administrador",
      isAdmin: true,
    },
    {
      email: "manager@oms.com",
      password: "manager123",
      nombre: "Admin Manager",
      isAdmin: true,
    },
  ];

  const account = validAccounts.find(
    (a) => a.email === email && a.password === password,
  );

  if (account) {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`oms_profile_${email}`);
      if (saved) {
        const profile = JSON.parse(saved);
        user.set({
          ...defaultUser,
          ...profile,
          isLoggedIn: true,
          isAdmin: account.isAdmin,
          email: account.email,
          nombre: profile.nombre || account.nombre,
        });
      } else {
        user.set({
          isLoggedIn: true,
          isAdmin: account.isAdmin,
          id: Date.now().toString(),
          nombre: account.nombre,
          email: account.email,
          puntos: 120, // Starter points for demo
          codigosUsados: [],
          historial: [
            {
              id: "ORD-001",
              fecha: "2026-02-15",
              total: 549,
              puntos: 549,
              estado: "Entregado",
              items: 1,
              lineas: [
                {
                  nombre: "Schecter Hellraiser C-1 FR",
                  cantidad: 1,
                  precio: 549,
                },
              ],
            },
          ],
          recompensasCanjeadas: [],
        });
      }
    }
    return true;
  }
  return false;
}

export function logout() {
  const current = user.get();
  if (typeof window !== "undefined" && current.email) {
    localStorage.setItem(
      `oms_profile_${current.email}`,
      JSON.stringify(current),
    );
    localStorage.removeItem("oms_user_session");
  }
  user.set(defaultUser);
}

export function addPuntos(puntos: number) {
  const current = user.get();
  const updated = { ...current, puntos: current.puntos + puntos };
  user.set(updated);
}

export function redeemPuntos(puntos: number): boolean {
  const current = user.get();
  if (current.puntos >= puntos) {
    user.set({ ...current, puntos: current.puntos - puntos });
    return true;
  }
  return false;
}

export function addCodigoUsado(codigo: string) {
  const current = user.get();
  if (!current.codigosUsados.includes(codigo)) {
    user.set({ ...current, codigosUsados: [...current.codigosUsados, codigo] });
  }
}

export function addOrderToHistory(order: OrderHistory) {
  const current = user.get();
  user.set({ ...current, historial: [order, ...current.historial] });
}

export function addRecompensaCanje(id: string) {
  const current = user.get();
  user.set({
    ...current,
    recompensasCanjeadas: [...current.recompensasCanjeadas, id],
  });
}
