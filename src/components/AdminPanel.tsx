import { useEffect, useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import { categorias } from "../data/productos";
import { user } from "../stores/user";
import {
  adminCatalog,
  createEmptyRuntimeProduct,
  getAllBrandsFromState,
  getVisibleProducts,
  removeDiscountCode,
  saveBrandLogo,
  saveDiscountCode,
  saveRuntimeProduct,
  setRuntimeProductEnabled,
  type RuntimeDiscountCode,
  type RuntimeProduct,
} from "../stores/catalogAdmin";

interface DetailRow {
  key: string;
  value: string;
}

function detailsToRows(
  details: Record<string, string | number | boolean> | undefined,
): DetailRow[] {
  if (!details) return [{ key: "", value: "" }];
  const rows = Object.entries(details).map(([key, value]) => ({
    key,
    value: String(value),
  }));
  return rows.length > 0 ? rows : [{ key: "", value: "" }];
}

function rowsToDetails(rows: DetailRow[]): Record<string, string> {
  return rows.reduce(
    (acc, row) => {
      const cleanKey = row.key.trim();
      const cleanValue = row.value.trim();
      if (!cleanKey || !cleanValue) return acc;
      acc[cleanKey] = cleanValue;
      return acc;
    },
    {} as Record<string, string>,
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function cloneRuntimeProduct(product: RuntimeProduct): RuntimeProduct {
  return JSON.parse(JSON.stringify(product)) as RuntimeProduct;
}

function emptyCodeDraft(): RuntimeDiscountCode {
  return {
    code: "",
    porcentaje: 10,
    descripcion: "",
    unico: false,
    active: true,
    appliesTo: "all",
  };
}

export default function AdminPanel() {
  const currentUser = useStore(user);
  const catalogState = useStore(adminCatalog);

  const [tab, setTab] = useState<"productos" | "codigos">("productos");
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [draft, setDraft] = useState<RuntimeProduct | null>(null);
  const [detailRows, setDetailRows] = useState<DetailRow[]>([
    { key: "", value: "" },
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [productError, setProductError] = useState("");
  const [productSuccess, setProductSuccess] = useState("");
  const [newBrandMode, setNewBrandMode] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandLogo, setNewBrandLogo] = useState("");

  const [codeDraft, setCodeDraft] =
    useState<RuntimeDiscountCode>(emptyCodeDraft());
  const [codeError, setCodeError] = useState("");
  const [codeSuccess, setCodeSuccess] = useState("");

  const allProducts = catalogState.products;
  const visibleProducts = getVisibleProducts(allProducts);

  const categoryOptions = useMemo(() => {
    const source = [
      ...categorias.map((c) => c.id),
      ...allProducts.map((p) => p.categoria),
    ];
    return [...new Set(source)]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [allProducts]);

  const brandOptions = useMemo(
    () => getAllBrandsFromState(catalogState),
    [catalogState],
  );

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return allProducts;
    return allProducts.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.marca.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q),
    );
  }, [allProducts, productSearch]);

  useEffect(() => {
    if (!selectedProductId) return;
    const found = allProducts.find((p) => p.id === selectedProductId);
    if (!found) return;
    setDraft(cloneRuntimeProduct(found));
    setDetailRows(detailsToRows(found.detalles));
    setNewBrandMode(false);
    setNewBrandName("");
    setNewBrandLogo(catalogState.brandLogos[found.marca] || "");
  }, [selectedProductId, allProducts, catalogState.brandLogos]);

  if (!currentUser.isLoggedIn) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white border border-ui-100 rounded-2xl p-8 text-center shadow-sm">
          <h1 className="font-heading text-3xl uppercase text-neutral-dark">
            Panel Admin
          </h1>
          <p className="text-ui-400 mt-2">
            Debes iniciar sesión para administrar catálogo y promociones.
          </p>
          <a
            href="/login"
            className="inline-flex mt-6 bg-brand-orange text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-orange-dark transition-colors"
          >
            Ir a iniciar sesión
          </a>
        </div>
      </section>
    );
  }

  if (!currentUser.isAdmin) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white border border-ui-100 rounded-2xl p-8 text-center shadow-sm">
          <h1 className="font-heading text-3xl uppercase text-neutral-dark">
            Acceso restringido
          </h1>
          <p className="text-ui-400 mt-2">
            Esta cuenta no tiene permisos de administrador.
          </p>
          <a
            href="/"
            className="inline-flex mt-6 bg-brand-purple text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-purple-light transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </section>
    );
  }

  const openNewProduct = () => {
    const next = createEmptyRuntimeProduct();
    next.categoria = categoryOptions[0] || "guitarras";
    next.marca = brandOptions[0] || "";
    setSelectedProductId(null);
    setDraft(next);
    setDetailRows([{ key: "", value: "" }]);
    setNewBrandMode(false);
    setNewBrandName("");
    setNewBrandLogo("");
    setProductError("");
    setProductSuccess("");
  };

  const setDraftField = <K extends keyof RuntimeProduct>(
    key: K,
    value: RuntimeProduct[K],
  ) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.imagenes.length) return prev;
      const imagenes = [...prev.imagenes];
      const aux = imagenes[index];
      imagenes[index] = imagenes[nextIndex];
      imagenes[nextIndex] = aux;
      return { ...prev, imagenes };
    });
  };

  const saveProduct = () => {
    if (!draft) return;

    const parsedDetails = rowsToDetails(detailRows);

    const finalBrand = newBrandMode ? newBrandName.trim() : draft.marca.trim();
    if (!finalBrand) {
      setProductError("Selecciona una marca o crea una nueva.");
      return;
    }

    const generatedId = draft.id.trim() || slugify(draft.nombre);
    if (!generatedId) {
      setProductError("El producto necesita ID o nombre para generarlo.");
      return;
    }

    const cleanImages = draft.imagenes.map((img) => img.trim()).filter(Boolean);
    if (cleanImages.length === 0) {
      setProductError("Agrega al menos una imagen para el producto.");
      return;
    }

    if (newBrandMode && newBrandLogo.trim()) {
      saveBrandLogo(finalBrand, newBrandLogo.trim());
    }

    const normalizedDiscount =
      draft.descuento && draft.descuento.activo
        ? {
            activo: true,
            porcentaje: Math.max(0, Number(draft.descuento.porcentaje || 0)),
            inicio: draft.descuento.inicio || "",
            fin: draft.descuento.fin || "",
          }
        : undefined;

    const existing = allProducts.find((p) => p.id === generatedId);

    const productToSave: RuntimeProduct = {
      ...draft,
      id: generatedId,
      marca: finalBrand,
      categoria: draft.categoria.trim(),
      precio: Math.max(0, Number(draft.precio || 0)),
      stock: Math.max(0, Number(draft.stock || 0)),
      descripcion: draft.descripcion.trim(),
      imagenes: cleanImages,
      detalles: parsedDetails,
      descuento: normalizedDiscount,
      enabled: draft.enabled !== false,
      sessionOnly: existing ? existing.sessionOnly : true,
    };

    saveRuntimeProduct(productToSave);
    setSelectedProductId(generatedId);
    setProductError("");
    setProductSuccess("Producto guardado en esta sesión.");
  };

  const saveCode = () => {
    const code = codeDraft.code.trim().toUpperCase();
    if (!code) {
      setCodeError("El código es requerido.");
      return;
    }
    if (!Number.isFinite(codeDraft.porcentaje) || codeDraft.porcentaje <= 0) {
      setCodeError("El porcentaje debe ser mayor que 0.");
      return;
    }
    if (codeDraft.porcentaje > 100) {
      setCodeError("El porcentaje no puede ser mayor que 100.");
      return;
    }
    if (!codeDraft.descripcion.trim()) {
      setCodeError("Agrega una descripción para el código.");
      return;
    }
    if (
      codeDraft.appliesTo !== "all" &&
      Array.isArray(codeDraft.appliesTo) &&
      codeDraft.appliesTo.length === 0
    ) {
      setCodeError("Selecciona al menos un producto aplicable.");
      return;
    }

    saveDiscountCode({
      ...codeDraft,
      code,
      descripcion: codeDraft.descripcion.trim(),
      porcentaje: Number(codeDraft.porcentaje),
    });
    setCodeError("");
    setCodeSuccess(`Código ${code} guardado.`);
  };

  const updateDetailRow = (
    index: number,
    field: keyof DetailRow,
    value: string,
  ) => {
    setDetailRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const addDetailRow = () => {
    setDetailRows((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeDetailRow = (index: number) => {
    setDetailRows((prev) => {
      if (prev.length <= 1) return [{ key: "", value: "" }];
      return prev.filter((_, i) => i !== index);
    });
  };

  const discountCodes = Object.values(catalogState.discountCodes).sort((a, b) =>
    a.code.localeCompare(b.code),
  );

  return (
    <section className="py-10 bg-ui-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-heading text-4xl text-neutral-dark uppercase">
            Panel de Administración
          </h1>
          <p className="text-ui-400 mt-1">
            Cambios activos solo en esta sesión del navegador.
          </p>
        </div>

        <div className="bg-white border border-ui-100 rounded-2xl p-2 inline-flex gap-2 mb-6">
          <button
            onClick={() => setTab("productos")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === "productos"
                ? "bg-brand-orange text-white"
                : "text-neutral-dark hover:bg-ui-50"
            }`}
          >
            Productos
          </button>
          <button
            onClick={() => setTab("codigos")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === "codigos"
                ? "bg-brand-purple text-white"
                : "text-neutral-dark hover:bg-ui-50"
            }`}
          >
            Códigos de descuento
          </button>
        </div>

        {tab === "productos" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white border border-ui-100 rounded-2xl p-4 h-fit">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h2 className="font-heading text-lg uppercase text-neutral-dark">
                  Inventario
                </h2>
                <button
                  onClick={openNewProduct}
                  className="text-xs bg-brand-orange text-white px-3 py-1.5 rounded-lg font-semibold"
                >
                  + Nuevo
                </button>
              </div>
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full border border-ui-100 rounded-xl px-3 py-2 text-sm mb-3"
              />
              <p className="text-xs text-ui-400 mb-3">
                {visibleProducts.length} visibles / {allProducts.length} totales
              </p>
              <div className="space-y-2 max-h-[560px] overflow-auto pr-1">
                {filteredProducts.map((p) => {
                  const selected = draft?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`border rounded-xl p-3 transition-colors ${
                        selected
                          ? "border-brand-orange bg-brand-orange/5"
                          : "border-ui-100"
                      }`}
                    >
                      <button
                        onClick={() => {
                          setSelectedProductId(p.id);
                          setProductSuccess("");
                          setProductError("");
                        }}
                        className="w-full text-left"
                      >
                        <p className="text-sm font-semibold text-neutral-dark line-clamp-1">
                          {p.nombre}
                        </p>
                        <p className="text-xs text-ui-400 mt-0.5">
                          {p.marca} · ${p.precio} · stock {p.stock}
                        </p>
                      </button>
                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                            p.enabled !== false
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {p.enabled !== false ? "Visible" : "Oculto"}
                        </span>
                        <button
                          onClick={() =>
                            setRuntimeProductEnabled(p.id, p.enabled === false)
                          }
                          className="text-xs text-brand-purple font-semibold"
                        >
                          {p.enabled !== false ? "Ocultar" : "Mostrar"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white border border-ui-100 rounded-2xl p-5">
              {!draft ? (
                <div className="text-center py-20 text-ui-400">
                  <p className="font-heading text-xl uppercase text-neutral-dark">
                    Selecciona un producto
                  </p>
                  <p className="text-sm mt-1">
                    O crea uno nuevo para agregar al catálogo de esta sesión.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-heading text-2xl uppercase text-neutral-dark">
                      {selectedProductId ? "Editar producto" : "Nuevo producto"}
                    </h2>
                    <label className="text-xs flex items-center gap-2 text-neutral-dark">
                      <input
                        type="checkbox"
                        checked={draft.enabled !== false}
                        onChange={(e) =>
                          setDraftField("enabled", e.target.checked)
                        }
                        className="accent-brand-orange"
                      />
                      Visible en tienda
                    </label>
                  </div>

                  {productError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                      {productError}
                    </p>
                  )}
                  {productSuccess && (
                    <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                      {productSuccess}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-ui-400">ID producto</label>
                      <input
                        value={draft.id}
                        onChange={(e) => setDraftField("id", e.target.value)}
                        placeholder="ej: hotone-nuevo"
                        className="w-full border border-ui-100 rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-ui-400">Nombre</label>
                      <input
                        value={draft.nombre}
                        onChange={(e) =>
                          setDraftField("nombre", e.target.value)
                        }
                        placeholder="Nombre del producto"
                        className="w-full border border-ui-100 rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-ui-400">Marca</label>
                      {!newBrandMode ? (
                        <div className="flex gap-2">
                          <select
                            value={draft.marca}
                            onChange={(e) =>
                              setDraftField("marca", e.target.value)
                            }
                            className="flex-1 border border-ui-100 rounded-xl px-3 py-2 text-sm"
                          >
                            <option value="">Selecciona marca</option>
                            {brandOptions.map((brand) => (
                              <option key={brand} value={brand}>
                                {brand}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              setNewBrandMode(true);
                              setNewBrandName("");
                              setNewBrandLogo("");
                            }}
                            className="px-3 py-2 text-xs bg-ui-50 border border-ui-100 rounded-xl"
                          >
                            Nueva
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            value={newBrandName}
                            onChange={(e) => setNewBrandName(e.target.value)}
                            placeholder="Nombre nueva marca"
                            className="w-full border border-ui-100 rounded-xl px-3 py-2 text-sm"
                          />
                          <input
                            value={newBrandLogo}
                            onChange={(e) => setNewBrandLogo(e.target.value)}
                            placeholder="URL logo marca (opcional)"
                            className="w-full border border-ui-100 rounded-xl px-3 py-2 text-sm"
                          />
                          <button
                            onClick={() => {
                              setNewBrandMode(false);
                              setNewBrandName("");
                              setNewBrandLogo("");
                            }}
                            className="text-xs text-brand-purple font-semibold"
                          >
                            Cancelar marca nueva
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-ui-400">Categoría</label>
                      <select
                        value={draft.categoria}
                        onChange={(e) =>
                          setDraftField("categoria", e.target.value)
                        }
                        className="w-full border border-ui-100 rounded-xl px-3 py-2 text-sm"
                      >
                        {categoryOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-ui-400">
                        Precio (USD)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={draft.precio}
                        onChange={(e) =>
                          setDraftField("precio", Number(e.target.value || 0))
                        }
                        className="w-full border border-ui-100 rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-ui-400">Stock</label>
                      <input
                        type="number"
                        min={0}
                        value={draft.stock}
                        onChange={(e) =>
                          setDraftField("stock", Number(e.target.value || 0))
                        }
                        className="w-full border border-ui-100 rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-ui-400">Estado</label>
                      <select
                        value={draft.estado}
                        onChange={(e) =>
                          setDraftField(
                            "estado",
                            e.target.value as RuntimeProduct["estado"],
                          )
                        }
                        className="w-full border border-ui-100 rounded-xl px-3 py-2 text-sm"
                      >
                        <option value="en_stock">en_stock</option>
                        <option value="preorden">preorden</option>
                        <option value="agotado">agotado</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-ui-400">Descripción</label>
                    <textarea
                      value={draft.descripcion}
                      onChange={(e) =>
                        setDraftField("descripcion", e.target.value)
                      }
                      rows={3}
                      className="w-full border border-ui-100 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="border border-ui-100 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-neutral-dark">
                        Descuento
                      </p>
                      <label className="text-xs flex items-center gap-2 text-neutral-dark">
                        <input
                          type="checkbox"
                          checked={Boolean(draft.descuento?.activo)}
                          onChange={(e) =>
                            setDraftField(
                              "descuento",
                              e.target.checked
                                ? {
                                    activo: true,
                                    porcentaje:
                                      draft.descuento?.porcentaje || 10,
                                    inicio:
                                      draft.descuento?.inicio ||
                                      new Date().toISOString().slice(0, 10),
                                    fin:
                                      draft.descuento?.fin ||
                                      new Date().toISOString().slice(0, 10),
                                  }
                                : undefined,
                            )
                          }
                          className="accent-brand-orange"
                        />
                        Activo
                      </label>
                    </div>
                    {draft.descuento && draft.descuento.activo && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input
                          type="number"
                          min={1}
                          max={90}
                          value={draft.descuento.porcentaje}
                          onChange={(e) =>
                            setDraftField("descuento", {
                              ...draft.descuento!,
                              porcentaje: Number(e.target.value || 0),
                            })
                          }
                          className="border border-ui-100 rounded-xl px-3 py-2 text-sm"
                          placeholder="%"
                        />
                        <input
                          type="date"
                          value={draft.descuento.inicio}
                          onChange={(e) =>
                            setDraftField("descuento", {
                              ...draft.descuento!,
                              inicio: e.target.value,
                            })
                          }
                          className="border border-ui-100 rounded-xl px-3 py-2 text-sm"
                        />
                        <input
                          type="date"
                          value={draft.descuento.fin}
                          onChange={(e) =>
                            setDraftField("descuento", {
                              ...draft.descuento!,
                              fin: e.target.value,
                            })
                          }
                          className="border border-ui-100 rounded-xl px-3 py-2 text-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div className="border border-ui-100 rounded-xl p-3">
                    <p className="text-sm font-semibold text-neutral-dark mb-2">
                      Imágenes (orden visible)
                    </p>
                    <div className="space-y-2">
                      {draft.imagenes.map((img, index) => (
                        <div
                          key={`${img}-${index}`}
                          className="flex gap-2 items-center"
                        >
                          <input
                            value={img}
                            onChange={(e) => {
                              const next = [...draft.imagenes];
                              next[index] = e.target.value;
                              setDraftField("imagenes", next);
                            }}
                            className="flex-1 border border-ui-100 rounded-lg px-2 py-1.5 text-xs"
                          />
                          <button
                            onClick={() => moveImage(index, -1)}
                            className="text-xs px-2 py-1 border border-ui-100 rounded"
                            disabled={index === 0}
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveImage(index, 1)}
                            className="text-xs px-2 py-1 border border-ui-100 rounded"
                            disabled={index === draft.imagenes.length - 1}
                          >
                            ↓
                          </button>
                          <button
                            onClick={() =>
                              setDraftField(
                                "imagenes",
                                draft.imagenes.filter((_, i) => i !== index),
                              )
                            }
                            className="text-xs px-2 py-1 border border-red-200 text-red-500 rounded"
                          >
                            X
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="Nueva URL de imagen"
                          className="flex-1 border border-ui-100 rounded-lg px-2 py-1.5 text-xs"
                        />
                        <button
                          onClick={() => {
                            const url = newImageUrl.trim();
                            if (!url) return;
                            setDraftField("imagenes", [...draft.imagenes, url]);
                            setNewImageUrl("");
                          }}
                          className="text-xs bg-brand-purple text-white px-3 rounded-lg"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border border-ui-100 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-neutral-dark">
                        Detalles del producto
                      </p>
                      <button
                        onClick={addDetailRow}
                        className="text-xs bg-ui-50 border border-ui-100 px-2.5 py-1 rounded-lg"
                      >
                        + Agregar fila
                      </button>
                    </div>
                    <div className="space-y-2">
                      {detailRows.map((row, index) => (
                        <div
                          key={`detail-${index}`}
                          className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2"
                        >
                          <input
                            value={row.key}
                            onChange={(e) =>
                              updateDetailRow(index, "key", e.target.value)
                            }
                            placeholder="Ej: Potencia"
                            className="border border-ui-100 rounded-lg px-2 py-1.5 text-sm"
                          />
                          <input
                            value={row.value}
                            onChange={(e) =>
                              updateDetailRow(index, "value", e.target.value)
                            }
                            placeholder="Ej: 5W"
                            className="border border-ui-100 rounded-lg px-2 py-1.5 text-sm"
                          />
                          <button
                            onClick={() => removeDetailRow(index)}
                            className="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-lg"
                          >
                            Quitar
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-ui-400 mt-2">
                      Solo se guardan filas con clave y valor.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={saveProduct}
                      className="bg-brand-orange text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-orange-dark transition-colors"
                    >
                      Guardar producto
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white border border-ui-100 rounded-2xl p-4">
              <h2 className="font-heading text-lg uppercase text-neutral-dark mb-3">
                Códigos existentes
              </h2>
              <div className="space-y-2 max-h-[560px] overflow-auto pr-1">
                {discountCodes.map((code) => (
                  <div
                    key={code.code}
                    className="border border-ui-100 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-neutral-dark">
                        {code.code}
                      </p>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                          code.active
                            ? "bg-green-100 text-green-700"
                            : "bg-ui-100 text-ui-400"
                        }`}
                      >
                        {code.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <p className="text-xs text-ui-400 mt-1">
                      {code.descripcion}
                    </p>
                    <p className="text-xs text-neutral-dark mt-1">
                      {code.porcentaje}% ·{" "}
                      {code.unico ? "Un solo uso" : "Múltiples usos"}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <button
                        onClick={() => {
                          setCodeDraft({ ...code });
                          setCodeError("");
                          setCodeSuccess("");
                        }}
                        className="text-brand-purple font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => removeDiscountCode(code.code)}
                        className="text-red-500 font-semibold"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white border border-ui-100 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-2xl uppercase text-neutral-dark">
                  Editar / Crear código
                </h2>
                <button
                  onClick={() => {
                    setCodeDraft(emptyCodeDraft());
                    setCodeError("");
                    setCodeSuccess("");
                  }}
                  className="text-xs bg-ui-50 border border-ui-100 px-3 py-1.5 rounded-lg"
                >
                  Nuevo código
                </button>
              </div>

              {codeError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {codeError}
                </p>
              )}
              {codeSuccess && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                  {codeSuccess}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-ui-400">Código</label>
                  <input
                    value={codeDraft.code}
                    onChange={(e) =>
                      setCodeDraft((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    className="w-full border border-ui-100 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-ui-400">Porcentaje</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={codeDraft.porcentaje}
                    onChange={(e) =>
                      setCodeDraft((prev) => ({
                        ...prev,
                        porcentaje: Number(e.target.value || 0),
                      }))
                    }
                    className="w-full border border-ui-100 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-ui-400">Descripción</label>
                <input
                  value={codeDraft.descripcion}
                  onChange={(e) =>
                    setCodeDraft((prev) => ({
                      ...prev,
                      descripcion: e.target.value,
                    }))
                  }
                  className="w-full border border-ui-100 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center gap-5 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={codeDraft.unico}
                    onChange={(e) =>
                      setCodeDraft((prev) => ({
                        ...prev,
                        unico: e.target.checked,
                      }))
                    }
                    className="accent-brand-orange"
                  />
                  Uso único por usuario
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={codeDraft.active}
                    onChange={(e) =>
                      setCodeDraft((prev) => ({
                        ...prev,
                        active: e.target.checked,
                      }))
                    }
                    className="accent-brand-orange"
                  />
                  Código activo
                </label>
              </div>

              <div className="border border-ui-100 rounded-xl p-3">
                <p className="text-sm font-semibold text-neutral-dark mb-2">
                  Aplicabilidad
                </p>
                <div className="flex items-center gap-4 mb-3 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={codeDraft.appliesTo === "all"}
                      onChange={() =>
                        setCodeDraft((prev) => ({ ...prev, appliesTo: "all" }))
                      }
                      className="accent-brand-orange"
                    />
                    Todos los productos
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={codeDraft.appliesTo !== "all"}
                      onChange={() =>
                        setCodeDraft((prev) => ({ ...prev, appliesTo: [] }))
                      }
                      className="accent-brand-orange"
                    />
                    Solo productos específicos
                  </label>
                </div>

                {codeDraft.appliesTo !== "all" && (
                  <div className="max-h-48 overflow-auto space-y-1 pr-1 border border-ui-100 rounded-lg p-2">
                    {visibleProducts.map((p) => {
                      const selected = Array.isArray(codeDraft.appliesTo)
                        ? codeDraft.appliesTo.includes(p.id)
                        : false;
                      return (
                        <label
                          key={p.id}
                          className="flex items-center gap-2 text-sm text-neutral-dark"
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => {
                              const current =
                                codeDraft.appliesTo === "all"
                                  ? []
                                  : [...codeDraft.appliesTo];
                              if (e.target.checked) {
                                if (!current.includes(p.id)) current.push(p.id);
                              } else {
                                const idx = current.indexOf(p.id);
                                if (idx >= 0) current.splice(idx, 1);
                              }
                              setCodeDraft((prev) => ({
                                ...prev,
                                appliesTo: current,
                              }));
                            }}
                            className="accent-brand-orange"
                          />
                          <span className="line-clamp-1">
                            {p.nombre} ({p.marca})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={saveCode}
                  className="bg-brand-purple text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-purple-light transition-colors"
                >
                  Guardar código
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
