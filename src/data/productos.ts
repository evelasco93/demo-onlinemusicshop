export interface Descuento {
  activo: boolean;
  porcentaje: number;
  inicio: string;
  fin: string;
}

export interface ColorVariante {
  nombre: string;
  colorCode: string;
  stock: number;
  estado: "en_stock" | "agotado" | "preorden";
  imagenes: string[];
}

export interface Producto {
  id: string;
  nombre: string;
  marca: string;
  precio: number;
  moneda: string;
  stock: number;
  estado: "en_stock" | "preorden" | "agotado";
  lista_espera?: boolean;
  fecha_estimada?: string;
  imagenes: string[];
  descripcion: string;
  descuento?: Descuento;
  detalles: Record<string, string | number | boolean>;
  categoria: string;
  variantes?: ColorVariante[];
  relacionados?: string[];
  enabled?: boolean;
  sessionOnly?: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  items: Producto[];
}

export function isDescuentoActivo(descuento?: Descuento): boolean {
  if (!descuento?.activo) return false;
  const today = new Date();
  const inicio = new Date(descuento.inicio);
  const fin = new Date(descuento.fin);
  return today >= inicio && today <= fin;
}

export function getPrecioFinal(producto: Producto): number {
  if (producto.descuento && isDescuentoActivo(producto.descuento)) {
    return producto.precio * (1 - producto.descuento.porcentaje / 100);
  }
  return producto.precio;
}

export function formatPrecio(precio: number): string {
  return `$${precio.toLocaleString("es-SV", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const PLACEHOLDER = (nombre: string) =>
  `https://placehold.co/600x400/2E144F/FFFFFF?text=${encodeURIComponent(nombre)}`;

export const categorias: Categoria[] = [
  {
    id: "guitarras",
    nombre: "Guitarras",
    icono: "guitar",
    descripcion: "Guitarras eléctricas de las mejores marcas",
    items: [
      {
        id: "tagima-stella-sonic-blue",
        nombre: "Stella Brasil Sonic Blue",
        marca: "Tagima",
        precio: 1899,
        moneda: "USD",
        stock: 10,
        estado: "en_stock",
        imagenes: [
          "https://tagimaguitars.com/cdn/shop/files/5b2.jpg?v=1752775583",
        ],
        descripcion:
          "Guitarra eléctrica versátil con cuerpo de cedro que ofrece gran resonancia y sustain, equipada con configuración HSS para una amplia gama tonal.",
        detalles: {
          Cuerpo: "Cedro",
          Mástil: "Pau-Ivory (perfil C)",
          Diapasón: "Madera de hierro o marfil",
          Escala: '25.5"',
          Trastes: 22,
          Cejuela: "Hueso 43mm",
          Puente: "Trémolo de 2 pivotes",
          Pastillas: "2 single coil ZST-Classic + 1 humbucker Alnico",
          Controles: "Selector 5 posiciones, volumen, tono",
        },
        categoria: "guitarras",
        relacionados: [
          "tagima-almach-white",
          "tagima-t640-shell-pink",
          "tagima-colour-trip",
        ],
      },
      {
        id: "tagima-almach-white",
        nombre: "Almach",
        marca: "Tagima",
        precio: 549,
        moneda: "USD",
        stock: 4,
        estado: "en_stock",
        imagenes: [
          "https://tagimaguitars.com/cdn/shop/files/ALMACH_WH.jpg?v=1737499788",
          "https://tagimaguitars.com/cdn/shop/files/am_2.jpg?v=1766100258",
          "https://tagimaguitars.com/cdn/shop/files/am3.jpg?v=1766100258",
        ],
        descripcion:
          "Guitarra eléctrica con doble humbucker, ideal para tonos potentes y definidos en estilos rock y metal. Disponible en blanco y negro.",
        detalles: {
          Cuerpo: "Basswood",
          Mástil: "Maple",
          Diapasón: "Rosewood",
          Cejuela: "Hueso 43mm",
          Pastillas: "2 humbuckers cerámicos",
          Controles: "Selector 3 posiciones, 2 volumen, 1 tono",
          Puente: "Tune-O-Matic",
        },
        categoria: "guitarras",
        variantes: [
          {
            nombre: "Blanco",
            colorCode: "#FFFFFF",
            stock: 4,
            estado: "en_stock",
            imagenes: [
              "https://tagimaguitars.com/cdn/shop/files/ALMACH_WH.jpg?v=1737499788",
              "https://tagimaguitars.com/cdn/shop/files/am_2.jpg?v=1766100258",
              "https://tagimaguitars.com/cdn/shop/files/am3.jpg?v=1766100258",
            ],
          },
          {
            nombre: "Negro",
            colorCode: "#1A1A1A",
            stock: 0,
            estado: "agotado",
            imagenes: [
              "https://tagimaguitars.com/cdn/shop/files/ALMACH_BK.jpg?v=1766100258",
              "https://tagimaguitars.com/cdn/shop/files/AM_1.jpg?v=1738962229",
              "https://tagimaguitars.com/cdn/shop/files/am4.jpg?v=1738962229",
            ],
          },
        ],
        relacionados: [
          "tagima-stella-sonic-blue",
          "tagima-t640-shell-pink",
          "tagima-colour-trip",
        ],
      },
      {
        id: "tagima-t640-shell-pink",
        nombre: "Classic T-640 Shell Pink",
        marca: "Tagima",
        precio: 599,
        moneda: "USD",
        stock: 7,
        estado: "en_stock",
        imagenes: [
          "https://tagimaguitars.com/cdn/shop/files/640_PINK.jpg?v=1766100342",
          "https://tagimaguitars.com/cdn/shop/files/pink1.jpg?v=1765489202",
          "https://tagimaguitars.com/cdn/shop/files/pink2.jpg?v=1765489202",
        ],
        descripcion:
          "Guitarra de estilo clásico con configuración HSS, perfecta para sonidos limpios y saturados con estética vintage.",
        detalles: {
          Cuerpo: "Aliso",
          Mástil: "Arce tostado",
          Diapasón: "Roasted Maple",
          Trastes: 22,
          Cejuela: "Hueso 43mm",
          Pastillas: "2 single coil + 1 humbucker Alnico",
          Controles: "Selector 5 posiciones, volumen, tono",
          Puente: "Trémolo de 2 puntos",
        },
        categoria: "guitarras",
        relacionados: [
          "tagima-almach-white",
          "tagima-stella-sonic-blue",
          "tagima-colour-trip",
        ],
      },
      {
        id: "schecter-c1-exotic",
        nombre: "C-1 Exotic Spalted Maple",
        marca: "Schecter",
        precio: 1099,
        moneda: "USD",
        stock: 0,
        estado: "preorden",
        lista_espera: true,
        fecha_estimada: "2026-05",
        imagenes: [
          "https://www.schecter-guitars.de/typo3temp/assets/_processed_/products/sc3338-web-original_7818422a.png",
          "https://www.schecter-guitars.de/typo3temp/assets/_processed_/products/sc3338-02-web-original_9e9a3c81.png",
          "https://www.schecter-guitars.de/typo3temp/assets/_processed_/products/sc3338-03-web-original_19e9f5de.png",
        ],
        descripcion:
          "Guitarra premium con tapa de arce spalted y construcción robusta, diseñada para máxima precisión y sustain.",
        detalles: {
          Cuerpo: "Caoba con tapa de arce spalted",
          Mástil: "Arce tostado multicapa con refuerzo de carbono",
          Diapasón: "Ébano",
          Escala: '25.5"',
          Trastes: "24 X-Jumbo",
          Radio: '14"',
          Puente: "Wilkinson tremolo",
          Cejuela: "Graph Tech XL",
          Clavijas: "Bloqueo Schecter",
        },
        categoria: "guitarras",
        relacionados: ["tagima-almach-white", "tagima-stella-sonic-blue"],
      },
    ],
  },
  {
    id: "pedales",
    nombre: "Pedales y Multiefectos",
    icono: "pedal",
    descripcion: "Procesadores y pedales de efectos profesionales",
    items: [
      {
        id: "valeton-gp200x",
        nombre: "GP-200X",
        marca: "Valeton",
        precio: 525,
        moneda: "USD",
        stock: 8,
        estado: "en_stock",
        imagenes: [
          "https://cdn11.bigcommerce.com/s-4hc0jwsnnq/images/stencil/original/products/30972/129207/GP-200X-1__71985.1744631263.jpg?c=1",
          "https://cdn11.bigcommerce.com/s-4hc0jwsnnq/images/stencil/original/products/30972/129208/GP-200X-6__70120.1744631263.jpg?c=1",
          "https://cdn11.bigcommerce.com/s-4hc0jwsnnq/images/stencil/original/products/30972/129209/GP-200X-5__31503.1744631263.jpg?c=1",
          "https://cdn11.bigcommerce.com/s-4hc0jwsnnq/images/stencil/original/products/30972/129211/GP-200X-3__19103.1744631263.jpg?c=1",
          "https://cdn11.bigcommerce.com/s-4hc0jwsnnq/images/stencil/original/products/30972/129212/GP-200X-2__55098.1744631263.jpg?c=1",
        ],
        descripcion:
          "Procesador multiefectos profesional con conectividad completa y calidad de audio de alto nivel.",
        detalles: {
          "Bit Rate": "24-bit",
          Frecuencia: "44.1kHz",
          "Relación S/R": "110dB",
          Conectividad: "USB-C, MIDI, XLR, loop de efectos",
          "Interfaz de Audio": "Sí",
        },
        categoria: "pedales",
        relacionados: ["valeton-gp200", "valeton-gig-bag", "valeton-gp100"],
      },
      {
        id: "valeton-gp200",
        nombre: "GP-200",
        marca: "Valeton",
        precio: 490,
        moneda: "USD",
        stock: 3,
        estado: "en_stock",
        imagenes: [
          "https://cdn11.bigcommerce.com/s-4hc0jwsnnq/images/stencil/original/products/13602/49516/GP-200-valetone-gp-200-multi-effects-processor__47316.1716303874.jpg?c=1",
          "https://cdn11.bigcommerce.com/s-4hc0jwsnnq/images/stencil/original/products/13602/49517/498135-Valeton-GP-200-Multi-Effects-Processor-Angle__71736.1716303874.jpg?c=1",
          "https://cdn11.bigcommerce.com/s-4hc0jwsnnq/images/stencil/original/products/13602/49518/498136-Valeton-GP-200-Multi-Effects-Processor-Front__85318.1716303874.jpg?c=1",
          "https://cdn11.bigcommerce.com/s-4hc0jwsnnq/images/stencil/original/products/13602/49519/498137-Valeton-GP-200-Multi-Effects-Processor-Back__18691.1716303875.jpg?c=1",
        ],
        descripcion:
          "Multiefectos potente con múltiples módulos simultáneos, looper y caja de ritmos integrada.",
        detalles: {
          "Bit Rate": "24-bit",
          Frecuencia: "44.1kHz",
          Presets: 256,
          Looper: "180 segundos",
          MIDI: "Sí",
        },
        categoria: "pedales",
        relacionados: ["valeton-gp200x", "valeton-gig-bag", "valeton-gp100"],
      },
      {
        id: "valeton-gp100",
        nombre: "GP-100",
        marca: "Valeton",
        precio: 200,
        moneda: "USD",
        stock: 5,
        estado: "en_stock",
        descuento: {
          activo: true,
          porcentaje: 20,
          inicio: "2026-03-28",
          fin: "2026-04-15",
        },
        imagenes: [
          "https://siman.vtexassets.com/arquivos/ids/6309942-1200-auto?v=638659027074800000&width=1200&height=auto&aspect=true",
          "https://siman.vtexassets.com/arquivos/ids/6309944-1200-auto?v=638659027075430000&width=1200&height=auto&aspect=true",
          "https://siman.vtexassets.com/arquivos/ids/6309943-1200-auto?v=638659027075430000&width=1200&height=auto&aspect=true",
        ],
        descripcion:
          "Procesador compacto con más de 140 efectos, ideal para práctica y grabación.",
        detalles: {
          Efectos: 140,
          Amplificadores: 45,
          Presets: 198,
          Looper: "Sí",
          "Interfaz de Audio": "Sí",
        },
        categoria: "pedales",
        relacionados: ["valeton-gp200", "valeton-gp200x", "valeton-gig-bag"],
      },
      {
        id: "valeton-gig-bag",
        nombre: "Gig Bag GPB-1",
        marca: "Valeton",
        precio: 49,
        moneda: "USD",
        stock: 10,
        estado: "en_stock",
        imagenes: [
          "https://cdn11.bigcommerce.com/s-4hc0jwsnnq/images/stencil/original/products/17127/59557/GPB-1-GP-200-Bag_Front_Hi_V01_220507__51059.1715123645.jpg?c=1",
          "https://cdn11.bigcommerce.com/s-4hc0jwsnnq/images/stencil/original/products/17127/59559/GPB-1-GP-200-Bag_Back_Hi_V01_220512__10244.1715123646.jpg?c=1",
          "https://cdn11.bigcommerce.com/s-4hc0jwsnnq/images/stencil/original/products/17127/59561/GPB-1-GP-200-Bag_Open_Hi_V01_220512__29591.1715123647.jpg?c=1",
        ],
        descripcion:
          "Bolsa de transporte diseñada específicamente para el Valeton GP-200, GP-200R y GP-200X. Protección acolchada y correas resistentes.",
        detalles: {
          Compatibilidad: "Valeton GP-200 / GP-200R / GP-200X",
          Material: "Nylon resistente",
          Acolchado: "Sí",
          Correas: "Hombro ajustable",
          Color: "Negro",
        },
        categoria: "pedales",
        relacionados: ["valeton-gp200x", "valeton-gp200", "valeton-gp100"],
      },
    ],
  },
  {
    id: "amplificadores",
    nombre: "Amplificadores",
    icono: "amp",
    descripcion: "Amplificadores para práctica, estudio y escenario",
    items: [
      {
        id: "pulze-mini",
        nombre: "Pulze Mini",
        marca: "Hotone",
        precio: 145,
        moneda: "USD",
        stock: 5,
        estado: "en_stock",
        descuento: {
          activo: true,
          porcentaje: 20,
          inicio: "2026-03-28",
          fin: "2026-04-15",
        },
        imagenes: [
          "https://cdn11.bigcommerce.com/s-4hc0jwsnnq/images/stencil/original/products/43398/264993/preview%20(2)__48893.1767801719.jpg?c=1",
          "https://cdn11.bigcommerce.com/s-4hc0jwsnnq/images/stencil/original/products/43398/264994/preview%20(1)__51357.1767801720.jpg?c=1",
          "https://cdn11.bigcommerce.com/s-4hc0jwsnnq/images/stencil/original/products/43398/264995/preview%20(4)__37827.1767801720.jpg?c=1",
        ],
        descripcion:
          "Mini amplificador de modelado compacto con múltiples efectos y excelente calidad sonora.",
        detalles: {
          Potencia: "5W",
          Altavoz: '2"',
          "Modelos de Amp": 52,
          "Modelos de Cab": 48,
          USB: "Sí",
        },
        categoria: "amplificadores",
        relacionados: [
          "sonicake-amp-toast",
          "nux-mighty-space",
          "valeton-gp100",
        ],
      },
      {
        id: "sonicake-amp-toast",
        nombre: "Amp Toast",
        marca: "Sonicake",
        precio: 125,
        moneda: "USD",
        stock: 3,
        estado: "en_stock",
        imagenes: [
          "https://www.sonicake.com/cdn/shop/files/QAM-50-1.jpg?v=1701140575&width=668",
          "https://www.sonicake.com/cdn/shop/files/QAM-50-2.jpg?v=1701140575&width=668",
          "https://www.sonicake.com/cdn/shop/files/QAM-50-3.jpg?v=1701140575&width=668",
        ],
        descripcion:
          "Amplificador portátil todo en uno con efectos integrados y conectividad Bluetooth.",
        detalles: {
          Potencia: "9W",
          Efectos: 6,
          Batería: "Sí",
          Bluetooth: "Sí",
        },
        categoria: "amplificadores",
        relacionados: ["pulze-mini", "nux-mighty-space"],
      },
      {
        id: "nux-mighty-space",
        nombre: "Mighty Space",
        marca: "Nux",
        precio: 499,
        moneda: "USD",
        stock: 0,
        estado: "preorden",
        lista_espera: true,
        fecha_estimada: "2026-05",
        imagenes: [
          "https://cdn11.bigcommerce.com/s-4hc0jwsnnq/images/stencil/original/products/12793/46416/MIGHTYSPACE-Nux-Mighty-Space-Wireless-Modelling-Amplifier-Angle__60927.1715104086.jpg?c=1",
          "https://cdn11.bigcommerce.com/s-4hc0jwsnnq/images/stencil/original/products/12793/46417/MIGHTYSPACE-Nux-Mighty-Space-Wireless-Modelling-Amplifier__11456.1715104087.jpg?c=1",
          "https://cdn11.bigcommerce.com/s-4hc0jwsnnq/images/stencil/original/products/12793/46419/MIGHTYSPACE-Nux-Mighty-Space-Wireless-Modelling-Amplifier-Back-Angle__81504.1715104088.jpg?c=1",
        ],
        descripcion:
          "Amplificador inalámbrico portátil de alto rendimiento con modelado avanzado y efectos completos.",
        detalles: {
          Potencia: "30W",
          Batería: "7 horas",
          Latencia: "1.2ms",
          IR: "512 samples",
          App: "Sí",
        },
        categoria: "amplificadores",
        relacionados: ["sonicake-amp-toast", "pulze-mini"],
      },
    ],
  },
  {
    id: "estuches",
    nombre: "Estuches y Bolsos",
    icono: "case",
    descripcion: "Fundas y bolsos para transportar tus instrumentos",
    items: [
      {
        id: "tagima-colour-trip",
        nombre: "Tagima Colour Trip",
        marca: "Tagima",
        precio: 99,
        moneda: "USD",
        stock: 6,
        estado: "en_stock",
        imagenes: [
          "https://tagimaguitars.com/cdn/shop/files/BAG_PRETO_FRENTE_1__2.jpg?v=1735066101",
          "https://tagimaguitars.com/cdn/shop/files/BAG_PRETO_ATRAS_2.jpg?v=1735066112",
        ],
        descripcion:
          "¡Lleva tu guitarra clásica a todas partes con seguridad y estilo! La funda de viaje Tagima de 20 mm es la opción ideal para músicos exigentes que buscan protección de alta calidad y un diseño distintivo.",
        detalles: {
          Acolchado: "20mm",
          Material: "Nylon premium",
          Bolsillos: "2 exteriores",
          Correas: "Hombro + mochila",
          Cierre: "YKK",
        },
        categoria: "estuches",
        variantes: [
          {
            nombre: "Amarillo/Negro",
            colorCode: "#FFD12A",
            stock: 4,
            estado: "en_stock",
            imagenes: [
              "https://tagimaguitars.com/cdn/shop/files/BAG_PRETO_FRENTE_1__2.jpg?v=1735066101",
              "https://tagimaguitars.com/cdn/shop/files/BAG_PRETO_ATRAS_2.jpg?v=1735066112",
            ],
          },
          {
            nombre: "Verde Olivo",
            colorCode: "#556B2F",
            stock: 2,
            estado: "en_stock",
            imagenes: [
              "https://tagimaguitars.com/cdn/shop/files/BAGVERDEFRENTE_1.jpg?v=1735066089",
            ],
          },
        ],
        relacionados: [
          "tagima-almach-white",
          "tagima-stella-sonic-blue",
          "tagima-t640-shell-pink",
        ],
      },
    ],
  },
];

export function getAllProductos(): Producto[] {
  return categorias.flatMap((cat) => cat.items);
}

export function getProductoById(id: string): Producto | undefined {
  return getAllProductos().find((p) => p.id === id);
}

export function getCategoriaById(id: string): Categoria | undefined {
  return categorias.find((c) => c.id === id);
}

export function getProductosConDescuento(): Producto[] {
  return getAllProductos().filter(
    (p) => p.descuento && isDescuentoActivo(p.descuento),
  );
}

export const CODIGOS_DESCUENTO: Record<
  string,
  { porcentaje: number; descripcion: string; unico: boolean }
> = {
  PRIMERA10: {
    porcentaje: 10,
    descripcion: "10% en tu primera compra",
    unico: true,
  },
  OMS2026: { porcentaje: 5, descripcion: "5% de descuento OMS", unico: false },
  EASTER26: { porcentaje: 15, descripcion: "15% Easter Sale", unico: false },
};

export const CATALOGO_LEALTAD = [
  {
    id: "ghs-boomers",
    nombre: "Cuerdas GHS Boomers Regular",
    puntos: 50,
    imagen:
      "https://www.onlinemusicshopsv.com/media/products/boomers_RzHbgpo.jpg",
    descripcion:
      "Set de cuerdas de guitarra eléctrica GHS Boomers calibre regular",
    tipo: "producto",
  },
  {
    id: "ghs-bass-boomer",
    nombre: "GHS Bass Boomers",
    puntos: 75,
    imagen:
      "https://www.onlinemusicshopsv.com/media/products/ghs_bass_boomer.jpg",
    descripcion: "Cuerdas de bajo GHS Bass Boomers",
    tipo: "producto",
  },
  {
    id: "ghs-bass-boomers-45",
    nombre: "GHS Bass Boomers 45-100",
    puntos: 100,
    imagen:
      "https://www.onlinemusicshopsv.com/media/products/bass_boomers_45-100.jpg",
    descripcion: "Cuerdas de bajo GHS Bass Boomers calibre .045-.100",
    tipo: "producto",
  },
  {
    id: "cupon-5",
    nombre: "Cupón 5% de descuento",
    puntos: 150,
    imagen: "",
    descripcion: "Obtén un 5% de descuento en tu próxima compra",
    tipo: "cupon",
    codigo: "LEALTAD5",
  },
  {
    id: "cupon-10",
    nombre: "Cupón 10% de descuento",
    puntos: 250,
    imagen: "",
    descripcion: "Obtén un 10% de descuento en tu próxima compra",
    tipo: "cupon",
    codigo: "LEALTAD10",
  },
  {
    id: "envio-gratis",
    nombre: "Envío Gratis",
    puntos: 75,
    imagen: "",
    descripcion: "Envío gratuito en tu próxima compra sin mínimo",
    tipo: "envio",
  },
];
