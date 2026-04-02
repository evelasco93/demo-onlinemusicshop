import { atom } from "nanostores";
import {
  CODIGOS_DESCUENTO,
  getAllProductos,
  type Descuento,
  type Producto,
} from "../data/productos";

export interface RuntimeProduct extends Producto {
  enabled: boolean;
  sessionOnly?: boolean;
}

export interface RuntimeDiscountCode {
  code: string;
  porcentaje: number;
  descripcion: string;
  unico: boolean;
  active: boolean;
  appliesTo: "all" | string[];
}

export interface AdminCatalogState {
  products: RuntimeProduct[];
  discountCodes: Record<string, RuntimeDiscountCode>;
  brandLogos: Record<string, string>;
}

const STORAGE_KEY = "oms_admin_catalog_session";

export const DEFAULT_BRAND_LOGOS: Record<string, string> = {
  Tagima: "/brands/tagima.png",
  Schecter: "/brands/schecter.png",
  Valeton: "/brands/valeton.png",
  Sonicake: "/brands/sonicake.png",
  Nux: "/brands/nux.png",
  Hotone: "/brands/hotone.png",
};

const BASE_PRODUCTS: RuntimeProduct[] = getAllProductos().map((p) => ({
  ...(JSON.parse(JSON.stringify(p)) as Producto),
  enabled: true,
  sessionOnly: false,
}));

const BASE_PRODUCT_IDS = new Set(BASE_PRODUCTS.map((p) => p.id));

const BASE_DISCOUNT_CODES: Record<string, RuntimeDiscountCode> = Object.entries(
  CODIGOS_DESCUENTO,
).reduce(
  (acc, [code, def]) => {
    const upper = code.toUpperCase();
    acc[upper] = {
      code: upper,
      porcentaje: def.porcentaje,
      descripcion: def.descripcion,
      unico: def.unico,
      active: true,
      appliesTo: "all",
    };
    return acc;
  },
  {} as Record<string, RuntimeDiscountCode>,
);

function createDefaultState(): AdminCatalogState {
  return {
    products: BASE_PRODUCTS,
    discountCodes: BASE_DISCOUNT_CODES,
    brandLogos: DEFAULT_BRAND_LOGOS,
  };
}

function sanitizeDescuento(value?: Descuento): Descuento | undefined {
  if (!value) return undefined;
  return {
    activo: Boolean(value.activo),
    porcentaje: Number.isFinite(value.porcentaje) ? value.porcentaje : 0,
    inicio: value.inicio || "",
    fin: value.fin || "",
  };
}

function sanitizeProduct(value: RuntimeProduct): RuntimeProduct {
  return {
    ...value,
    id: String(value.id || "").trim(),
    nombre: String(value.nombre || "").trim(),
    marca: String(value.marca || "").trim(),
    moneda: value.moneda || "USD",
    categoria: String(value.categoria || "").trim(),
    precio: Number.isFinite(value.precio) ? Number(value.precio) : 0,
    stock: Number.isFinite(value.stock) ? Number(value.stock) : 0,
    descripcion: String(value.descripcion || "").trim(),
    imagenes: Array.isArray(value.imagenes)
      ? value.imagenes.map((img) => String(img).trim()).filter(Boolean)
      : [],
    descuento: sanitizeDescuento(value.descuento),
    detalles:
      value.detalles && typeof value.detalles === "object"
        ? value.detalles
        : {},
    enabled: value.enabled !== false,
    sessionOnly: Boolean(value.sessionOnly),
  };
}

function normalizeState(raw: unknown): AdminCatalogState {
  const defaults = createDefaultState();
  if (!raw || typeof raw !== "object") return defaults;

  const obj = raw as Partial<AdminCatalogState>;

  const products = Array.isArray(obj.products)
    ? obj.products
        .map((p) => sanitizeProduct(p as RuntimeProduct))
        .filter((p) => p.id)
    : defaults.products;

  const discountCodes =
    obj.discountCodes && typeof obj.discountCodes === "object"
      ? Object.entries(obj.discountCodes).reduce(
          (acc, [code, val]) => {
            if (!val || typeof val !== "object") return acc;
            const data = val as Partial<RuntimeDiscountCode>;
            const upper = (data.code || code).toUpperCase();
            acc[upper] = {
              code: upper,
              porcentaje: Number.isFinite(data.porcentaje)
                ? Number(data.porcentaje)
                : 0,
              descripcion: String(data.descripcion || ""),
              unico: Boolean(data.unico),
              active: data.active !== false,
              appliesTo:
                data.appliesTo === "all"
                  ? "all"
                  : Array.isArray(data.appliesTo)
                    ? data.appliesTo.map((id) => String(id)).filter(Boolean)
                    : "all",
            };
            return acc;
          },
          {} as Record<string, RuntimeDiscountCode>,
        )
      : defaults.discountCodes;

  const brandLogos =
    obj.brandLogos && typeof obj.brandLogos === "object"
      ? {
          ...DEFAULT_BRAND_LOGOS,
          ...Object.entries(obj.brandLogos).reduce(
            (acc, [brand, logo]) => {
              const cleanBrand = String(brand || "").trim();
              const cleanLogo = String(logo || "").trim();
              if (cleanBrand && cleanLogo) acc[cleanBrand] = cleanLogo;
              return acc;
            },
            {} as Record<string, string>,
          ),
        }
      : defaults.brandLogos;

  return {
    products: products.length > 0 ? products : defaults.products,
    discountCodes:
      Object.keys(discountCodes).length > 0
        ? discountCodes
        : defaults.discountCodes,
    brandLogos,
  };
}

function loadState(): AdminCatalogState {
  if (typeof window === "undefined") return createDefaultState();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    return normalizeState(JSON.parse(raw));
  } catch {
    return createDefaultState();
  }
}

function saveState(state: AdminCatalogState) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const adminCatalog = atom<AdminCatalogState>(createDefaultState());

if (typeof window !== "undefined") {
  adminCatalog.set(loadState());
}

adminCatalog.subscribe(saveState);

export function getVisibleProducts(
  products: RuntimeProduct[] = adminCatalog.get().products,
): RuntimeProduct[] {
  return products.filter((p) => p.enabled !== false);
}

export function getAllBrandsFromState(
  state: AdminCatalogState = adminCatalog.get(),
): string[] {
  const names = new Set<string>();
  state.products.forEach((p) => {
    if (p.marca) names.add(p.marca);
  });
  Object.keys(state.brandLogos).forEach((b) => names.add(b));
  return [...names].sort((a, b) => a.localeCompare(b));
}

export function createEmptyRuntimeProduct(): RuntimeProduct {
  return {
    id: "",
    nombre: "",
    marca: "",
    precio: 0,
    moneda: "USD",
    stock: 0,
    estado: "en_stock",
    lista_espera: false,
    fecha_estimada: "",
    imagenes: [],
    descripcion: "",
    descuento: undefined,
    detalles: {},
    categoria: "",
    variantes: undefined,
    relacionados: [],
    enabled: true,
    sessionOnly: true,
  };
}

export function saveRuntimeProduct(product: RuntimeProduct) {
  const state = adminCatalog.get();
  const clean = sanitizeProduct(product);
  clean.sessionOnly =
    !BASE_PRODUCT_IDS.has(clean.id) || Boolean(clean.sessionOnly);

  const exists = state.products.some((p) => p.id === clean.id);
  const products = exists
    ? state.products.map((p) => (p.id === clean.id ? clean : p))
    : [clean, ...state.products];

  adminCatalog.set({
    ...state,
    products,
  });
}

export function setRuntimeProductEnabled(id: string, enabled: boolean) {
  const state = adminCatalog.get();
  adminCatalog.set({
    ...state,
    products: state.products.map((p) => (p.id === id ? { ...p, enabled } : p)),
  });
}

export function saveBrandLogo(brand: string, logo: string) {
  const cleanBrand = brand.trim();
  const cleanLogo = logo.trim();
  if (!cleanBrand || !cleanLogo) return;
  const state = adminCatalog.get();
  adminCatalog.set({
    ...state,
    brandLogos: {
      ...state.brandLogos,
      [cleanBrand]: cleanLogo,
    },
  });
}

export function saveDiscountCode(code: RuntimeDiscountCode) {
  const state = adminCatalog.get();
  const upper = code.code.trim().toUpperCase();
  if (!upper) return;
  adminCatalog.set({
    ...state,
    discountCodes: {
      ...state.discountCodes,
      [upper]: {
        ...code,
        code: upper,
        porcentaje: Number(code.porcentaje),
        appliesTo:
          code.appliesTo === "all"
            ? "all"
            : code.appliesTo.map((id) => String(id)).filter(Boolean),
      },
    },
  });
}

export function removeDiscountCode(code: string) {
  const upper = code.trim().toUpperCase();
  if (!upper) return;
  const state = adminCatalog.get();
  const next = { ...state.discountCodes };
  delete next[upper];
  adminCatalog.set({
    ...state,
    discountCodes: next,
  });
}
