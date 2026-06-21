import React, { useState, createContext, useContext, useMemo } from "react";
import {
  Menu, X, ChevronLeft, Search, Package, TrendingUp, TrendingDown,
  Plus, Edit2, Trash2, Eye, ShoppingBag, Phone, Mail, MapPin, Clock,
  MessageCircle, AlertTriangle, CheckCircle, Tag, Flame, LayoutDashboard,
  Boxes, ClipboardList, Home, ArrowUp, ArrowDown,
} from "lucide-react";

// ================================================================
// TYPES & INTERFACES
// ================================================================

type Category = "Bacon" | "Carnes Defumadas" | "Linguiças" | "Laticínios" | "Coloniais" | "Outros";
type SortOption = "newest" | "name-asc" | "name-desc" | "price-asc" | "price-desc";
type PageId =
  | "home" | "catalog" | "product-detail" | "about"
  | "admin" | "admin-products" | "admin-product-form" | "admin-stock";

interface Product {
  id: string;
  name: string;
  description: string;
  category: Category;
  imageUrl: string;
  price: number;
  stock: number;
  featured: boolean;
  onSale: boolean;
  salePrice?: number;
  isNew: boolean;
  createdAt: string;
}

interface StockMovement {
  id: string;
  productId: string;
  type: "ENTRY" | "EXIT";
  quantity: number;
  date: string;
  reason: string;
}

// Repository interfaces — ready for future backend integration
interface IProductRepository {
  getAll(): Product[];
  getById(id: string): Product | undefined;
  create(data: Omit<Product, "id" | "createdAt">): Product;
  update(id: string, data: Partial<Product>): Product | undefined;
  delete(id: string): void;
}

interface IStockRepository {
  getMovements(): StockMovement[];
  addMovement(data: Omit<StockMovement, "id">): StockMovement;
}

interface NavState { page: PageId; productId?: string; }

// ================================================================
// MOCK DATA
// ================================================================

const CATEGORIES: Category[] = ["Bacon", "Carnes Defumadas", "Linguiças", "Laticínios", "Coloniais", "Outros"];

const img = (id: string, w = 400, h = 320) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format`;

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1", name: "Bacon Artesanal Defumado",
    description: "Bacon artesanal produzido com barriga de porco selecionada, defumado lentamente com lenha de cerejeira. Sabor intenso e aroma marcante, perfeito para frituras, sanduíches e receitas especiais. Sem conservantes artificiais.",
    category: "Bacon", imageUrl: img("photo-1606851094655-b2593a9af63f"),
    price: 42.90, stock: 35, featured: true, onSale: false, isNew: false,
    createdAt: "2024-10-15T10:00:00Z",
  },
  {
    id: "2", name: "Bacon Canadense",
    description: "Bacon estilo canadense feito com lombo suíno magro, temperado com ervas e defumado artesanalmente. Opção mais leve com o mesmo sabor incomparável da defumação tradicional.",
    category: "Bacon", imageUrl: img("photo-1606851571255-578bad52187f"),
    price: 38.50, stock: 18, featured: false, onSale: true, salePrice: 32.90, isNew: false,
    createdAt: "2024-09-20T10:00:00Z",
  },
  {
    id: "3", name: "Costela Suína Defumada",
    description: "Costela suína defumada com blend exclusivo de especiarias coloniais. Carne macia e suculenta após horas de defumação lenta, ideal para churrasco ou preparo no forno com legumes da estação.",
    category: "Carnes Defumadas", imageUrl: img("photo-1616631124348-c63521eb484c"),
    price: 58.00, stock: 12, featured: true, onSale: false, isNew: true,
    createdAt: "2024-12-01T10:00:00Z",
  },
  {
    id: "4", name: "Pernil Defumado",
    description: "Pernil suíno inteiro, curado em salmoura e defumado por 12 horas com lenha de canela. Presença garantida em celebrações e festas de família. Vendido por peça ou fatiado.",
    category: "Carnes Defumadas", imageUrl: img("photo-1529241160658-a8a2a0d86620"),
    price: 72.00, stock: 8, featured: true, onSale: true, salePrice: 65.00, isNew: false,
    createdAt: "2024-08-10T10:00:00Z",
  },
  {
    id: "5", name: "Paio Artesanal",
    description: "Paio artesanal feito com carne suína e toucinho selecionados, temperado com alho, pimenta-do-reino e cravo-da-índia. Defumado pelo processo tradicional da colônia italiana.",
    category: "Linguiças", imageUrl: img("photo-1624772398061-bbfa87ec6b5a"),
    price: 28.90, stock: 40, featured: false, onSale: false, isNew: true,
    createdAt: "2024-11-25T10:00:00Z",
  },
  {
    id: "6", name: "Linguiça Calabresa Defumada",
    description: "Linguiça calabresa defumada com pimentas vermelhas selecionadas. Sabor picante equilibrado, perfeita para churrasco, massas e pizzas artesanais. Receita de família há três gerações.",
    category: "Linguiças", imageUrl: img("photo-1585325701165-351af916e581"),
    price: 32.00, stock: 55, featured: true, onSale: false, isNew: false,
    createdAt: "2024-07-05T10:00:00Z",
  },
  {
    id: "7", name: "Linguiça Toscana Artesanal",
    description: "Linguiça toscana com ervas frescas, vinho branco e alho italiano. Produto artesanal sem conservantes artificiais, com textura firme e sabor herbáceo marcante.",
    category: "Linguiças", imageUrl: img("photo-1542901031-ec5eeb518e83"),
    price: 30.50, stock: 3, featured: false, onSale: true, salePrice: 25.00, isNew: false,
    createdAt: "2024-06-15T10:00:00Z",
  },
  {
    id: "8", name: "Queijo Coalho Defumado",
    description: "Queijo coalho artesanal defumado com lenha de eucalipto. Casca dourada e levemente crocante, interior cremoso com sabor marcante. Excelente para grelhar na chapa ou churrasqueira.",
    category: "Laticínios", imageUrl: img("photo-1743193144224-d2db90ea7784"),
    price: 24.90, stock: 22, featured: true, onSale: false, isNew: true,
    createdAt: "2024-11-30T10:00:00Z",
  },
  {
    id: "9", name: "Queijo Minas Meia Cura",
    description: "Queijo Minas artesanal com maturação mínima de 30 dias. Textura firme, sabor suave com leve acidez natural. Produção local com leite integral de vaca leiteira da região.",
    category: "Laticínios", imageUrl: img("photo-1718939046345-f607c89e92d9"),
    price: 32.00, stock: 15, featured: false, onSale: false, isNew: false,
    createdAt: "2024-09-10T10:00:00Z",
  },
  {
    id: "10", name: "Requeijão Colonial",
    description: "Requeijão colonial cremoso feito com leite de vacas criadas a pasto. Textura aveludada e sabor puro, sem conservantes. Ideal para pão caseiro, tapioca e receitas tradicionais.",
    category: "Laticínios", imageUrl: img("photo-1741092966064-c7fa767f70b8"),
    price: 18.90, stock: 30, featured: false, onSale: true, salePrice: 15.90, isNew: false,
    createdAt: "2024-10-01T10:00:00Z",
  },
  {
    id: "11", name: "Salame Colonial",
    description: "Salame colonial curado por 45 dias, preparado com carne suína magra e gordura selecionada, temperado com especiarias da tradição italiana. Fatiado na hora para máxima frescura.",
    category: "Coloniais", imageUrl: img("photo-1502333052765-1424f32cf5ca"),
    price: 45.00, stock: 20, featured: true, onSale: false, isNew: false,
    createdAt: "2024-08-20T10:00:00Z",
  },
  {
    id: "12", name: "Mel Colonial Puro",
    description: "Mel puro de apiário próprio, coletado em reserva nativa. Sem aquecimento nem filtração excessiva, preservando enzimas e antioxidantes naturais. Certificado de origem garantido.",
    category: "Coloniais", imageUrl: img("photo-1700486338138-5cc21dae205a"),
    price: 28.00, stock: 25, featured: false, onSale: false, isNew: true,
    createdAt: "2024-12-05T10:00:00Z",
  },
  {
    id: "13", name: "Banha de Porco Artesanal",
    description: "Banha de porco pura, derretida e filtrada artesanalmente em tacho de ferro fundido. Ideal para frituras, massas de salgados e confeitaria colonial. Sem aditivos.",
    category: "Outros", imageUrl: img("photo-1611764197743-702a4d01463b"),
    price: 15.90, stock: 45, featured: false, onSale: false, isNew: false,
    createdAt: "2024-07-12T10:00:00Z",
  },
  {
    id: "14", name: "Chouriço Defumado",
    description: "Chouriço português artesanal preparado com especiarias e defumado em câmara artesanal. Sabor robusto e intenso, perfeito para petiscos, feijoada e pratos tradicionais.",
    category: "Outros", imageUrl: img("photo-1460122109654-7e46ab4fc9b9"),
    price: 35.00, stock: 10, featured: false, onSale: true, salePrice: 29.90, isNew: false,
    createdAt: "2024-09-05T10:00:00Z",
  },
];

const MOCK_MOVEMENTS: StockMovement[] = [
  { id: "m1", productId: "1", type: "ENTRY", quantity: 20, date: "2024-12-10T08:00:00Z", reason: "Reposição de estoque" },
  { id: "m2", productId: "3", type: "ENTRY", quantity: 15, date: "2024-12-09T09:30:00Z", reason: "Produção própria" },
  { id: "m3", productId: "6", type: "EXIT",  quantity: 5,  date: "2024-12-09T14:00:00Z", reason: "Venda balcão" },
  { id: "m4", productId: "7", type: "EXIT",  quantity: 10, date: "2024-12-08T11:00:00Z", reason: "Pedido restaurante Bella Vista" },
  { id: "m5", productId: "4", type: "ENTRY", quantity: 8,  date: "2024-12-08T08:00:00Z", reason: "Produção semanal" },
  { id: "m6", productId: "8", type: "EXIT",  quantity: 3,  date: "2024-12-07T15:30:00Z", reason: "Venda online" },
  { id: "m7", productId: "11", type: "ENTRY", quantity: 12, date: "2024-12-07T08:00:00Z", reason: "Reposição" },
  { id: "m8", productId: "2", type: "EXIT",  quantity: 7,  date: "2024-12-06T10:00:00Z", reason: "Venda balcão" },
  { id: "m9", productId: "9", type: "ENTRY", quantity: 10, date: "2024-12-06T08:00:00Z", reason: "Produção laticínios" },
  { id: "m10", productId: "1", type: "EXIT", quantity: 5,  date: "2024-12-05T16:00:00Z", reason: "Venda atacado" },
];

// ================================================================
// REPOSITORIES
// ================================================================

// MockProductRepository — active implementation
// ApiProductRepository — TODO: implement when backend is available
class MockProductRepository implements IProductRepository {
  private items: Product[];
  constructor(initial: Product[]) { this.items = [...initial]; }
  getAll() { return this.items; }
  getById(id: string) { return this.items.find(p => p.id === id); }
  create(data: Omit<Product, "id" | "createdAt">): Product {
    return { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
  }
  update(id: string, data: Partial<Product>): Product | undefined {
    const p = this.items.find(p => p.id === id);
    return p ? { ...p, ...data } : undefined;
  }
  delete(_id: string): void { /* handled via React state */ }
}

// MockStockRepository — active implementation
// ApiStockRepository — TODO: implement when backend is available
class MockStockRepository implements IStockRepository {
  getMovements() { return MOCK_MOVEMENTS; }
  addMovement(data: Omit<StockMovement, "id">): StockMovement {
    return { ...data, id: `m${Date.now()}` };
  }
}

// Instantiate active repositories
const productRepo = new MockProductRepository(MOCK_PRODUCTS);
const stockRepo = new MockStockRepository();

// ================================================================
// NAVIGATION CONTEXT
// ================================================================

const NavContext = createContext<{
  nav: NavState;
  go: (page: PageId, productId?: string) => void;
}>({ nav: { page: "home" }, go: () => {} });

function useNav() { return useContext(NavContext); }

// ================================================================
// UTILITIES
// ================================================================

function fmt(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR");
}

const CAT_COLORS: Record<Category, string> = {
  "Bacon": "bg-amber-100 text-amber-800",
  "Carnes Defumadas": "bg-red-100 text-red-800",
  "Linguiças": "bg-orange-100 text-orange-800",
  "Laticínios": "bg-yellow-100 text-yellow-800",
  "Coloniais": "bg-green-100 text-green-800",
  "Outros": "bg-stone-100 text-stone-700",
};

// ================================================================
// SHARED COMPONENTS
// ================================================================

function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${CAT_COLORS[category]}`}>
      {category}
    </span>
  );
}

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const price = product.onSale && product.salePrice ? product.salePrice : product.price;
  return (
    <button
      onClick={onClick}
      className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-left w-full"
    >
      <div className="relative overflow-hidden bg-secondary h-44 sm:h-52">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          {product.onSale && (
            <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Tag className="w-3 h-3" /> Promoção
            </span>
          )}
          {product.isNew && !product.onSale && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Novo
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <CategoryBadge category={product.category} />
        <h3 className="mt-2 font-semibold text-sm text-foreground leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">{fmt(price)}</span>
          {product.onSale && product.salePrice && (
            <span className="text-xs text-muted-foreground line-through">{fmt(product.price)}</span>
          )}
        </div>
      </div>
    </button>
  );
}

function BackButton({ label = "Voltar", to }: { label?: string; to: PageId }) {
  const { go } = useNav();
  return (
    <button
      onClick={() => go(to)}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors mb-6 group"
    >
      <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
      {label}
    </button>
  );
}

function SectionHeader({
  title, subtitle, action,
}: {
  title: string; subtitle?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-7">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ================================================================
// NAVBAR
// ================================================================

function Navbar() {
  const { nav, go } = useNav();
  const [open, setOpen] = useState(false);

  const links: { label: string; page: PageId }[] = [
    { label: "Início", page: "home" },
    { label: "Catálogo", page: "catalog" },
    { label: "Sobre", page: "about" },
  ];

  const close = () => setOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/96 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <button onClick={() => { go("home"); close(); }} className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <Flame className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold text-foreground tracking-tight">Defumados</span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <button
              key={l.page}
              onClick={() => go(l.page)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                nav.page === l.page
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => go("admin")}
            className="text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1.5 transition-colors hover:bg-secondary"
          >
            Área Admin
          </button>
        </div>

        <button
          className="md:hidden p-2 text-foreground rounded-md hover:bg-secondary transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Alternar menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-card px-4 py-2 space-y-0.5 pb-3">
          {links.map(l => (
            <button
              key={l.page}
              onClick={() => { go(l.page); close(); }}
              className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                nav.page === l.page
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              {l.label}
            </button>
          ))}
          <div className="pt-1 border-t border-border mt-1">
            <button
              onClick={() => { go("admin"); close(); }}
              className="w-full text-left px-4 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            >
              Área Administrativa
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ================================================================
// FOOTER
// ================================================================

function Footer() {
  return (
    <footer className="bg-foreground text-background/80 py-14 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg font-semibold text-white">Defumados</span>
            </div>
            <p className="text-sm leading-relaxed text-white/55 max-w-[22ch]">
              A Defumados é especializada na produção e comercialização de carnes defumadas, bacon artesanal, laticínios e produtos coloniais, prezando pela qualidade e tradição.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Contato</h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5 text-white/65"><Phone className="w-3.5 h-3.5 text-accent flex-shrink-0" />(49) 3322-0001</div>
              <div className="flex items-center gap-2.5 text-white/65"><MessageCircle className="w-3.5 h-3.5 text-accent flex-shrink-0" />(49) 99901-0001</div>
              <div className="flex items-center gap-2.5 text-white/65"><Mail className="w-3.5 h-3.5 text-accent flex-shrink-0" />contato@defumados.com.br</div>
              <div className="flex items-start gap-2.5 text-white/65"><MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />Rua das Colônias, 320 — Chapecó, SC</div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Atendimento</h4>
            <div className="space-y-2 text-sm text-white/65">
              <div className="flex justify-between"><span>Seg – Sex</span><span className="text-white">08h – 18h</span></div>
              <div className="flex justify-between"><span>Sábado</span><span className="text-white">08h – 13h</span></div>
              <div className="flex justify-between"><span>Domingo</span><span className="text-white/35">Fechado</span></div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-[11px] text-white/30 text-center">
          © {new Date().getFullYear()} Defumados Artesanal. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

// ================================================================
// HOME PAGE
// ================================================================

function HomePage({ products }: { products: Product[] }) {
  const { go } = useNav();

  const onSale = products.filter(p => p.onSale).slice(0, 4);
  const recent = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);
  const featured = products.filter(p => p.featured).slice(0, 4);

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[480px] sm:h-[580px] overflow-hidden bg-stone-900">
        <img
          src="https://images.unsplash.com/photo-1460122109654-7e46ab4fc9b9?w=1600&h=700&fit=crop&auto=format"
          alt="Carnes defumadas artesanais — Defumados"
          className="absolute inset-0 w-full h-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C0F0A]/85 via-[#1C0F0A]/50 to-transparent" />
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
            <div className="max-w-lg">
              <span className="inline-block text-accent text-[11px] font-bold tracking-[0.2em] uppercase mb-5">
                Artesanal · Defumado · Colonial
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-5">
                Tradição<br />Defumada,<br />Sabor Artesanal
              </h1>
              <p className="text-base text-white/70 leading-relaxed mb-8 max-w-sm">
                Do bacon ao salame, do queijo coalho ao mel puro — produtos coloniais feitos com dedicação e técnica de geração em geração.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => go("catalog")}
                  className="bg-accent text-white px-7 py-3.5 rounded-md font-semibold text-sm hover:bg-accent/90 transition-colors shadow-lg"
                >
                  Ver Catálogo Completo
                </button>
                <button
                  onClick={() => go("about")}
                  className="border border-white/30 text-white px-7 py-3.5 rounded-md font-medium text-sm hover:bg-white/10 transition-colors"
                >
                  Conheça a Loja
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-20">
        {/* Promoções */}
        {onSale.length > 0 && (
          <section>
            <SectionHeader
              title="Promoções"
              subtitle="Aproveite nossas ofertas especiais"
              action={
                <button onClick={() => go("catalog")} className="text-sm text-accent font-medium hover:underline">
                  Ver todas →
                </button>
              }
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {onSale.map(p => (
                <ProductCard key={p.id} product={p} onClick={() => go("product-detail", p.id)} />
              ))}
            </div>
          </section>
        )}

        {/* Recém Adicionados */}
        <section>
          <SectionHeader
            title="Recém Adicionados"
            subtitle="Novidades fresquinhas na nossa loja"
            action={
              <button onClick={() => go("catalog")} className="text-sm text-accent font-medium hover:underline">
                Ver todos →
              </button>
            }
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {recent.map(p => (
              <ProductCard key={p.id} product={p} onClick={() => go("product-detail", p.id)} />
            ))}
          </div>
        </section>

        {/* Produtos em Destaque */}
        <section>
          <SectionHeader
            title="Produtos em Destaque"
            subtitle="Selecionados especialmente para você"
            action={
              <button onClick={() => go("catalog")} className="text-sm text-accent font-medium hover:underline">
                Ver todos →
              </button>
            }
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map(p => (
              <ProductCard key={p.id} product={p} onClick={() => go("product-detail", p.id)} />
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

// ================================================================
// CATALOG PAGE
// ================================================================

function CatalogPage({ products }: { products: Product[] }) {
  const { go } = useNav();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<Category | "Todos">("Todos");
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (cat !== "Todos") list = list.filter(p => p.category === cat);
    if (sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    else if (sort === "name-desc") list.sort((a, b) => b.name.localeCompare(a.name, "pt-BR"));
    else if (sort === "price-asc") list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    else if (sort === "price-desc") list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    else list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [products, search, cat, sort]);

  const total = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const reset = () => setPage(1);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <BackButton label="Voltar ao Início" to="home" />

        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-foreground">Catálogo de Produtos</h1>
          <p className="text-muted-foreground mt-1 text-sm">{filtered.length} produto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={search}
              onChange={e => { setSearch(e.target.value); reset(); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={sort}
            onChange={e => { setSort(e.target.value as SortOption); reset(); }}
            className="px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="newest">Mais Recentes</option>
            <option value="name-asc">Nome A–Z</option>
            <option value="name-desc">Nome Z–A</option>
            <option value="price-asc">Menor Preço</option>
            <option value="price-desc">Maior Preço</option>
          </select>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(["Todos", ...CATEGORIES] as const).map(c => (
            <button
              key={c}
              onClick={() => { setCat(c as Category | "Todos"); reset(); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                cat === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        {paged.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-25" />
            <p className="font-medium">Nenhum produto encontrado.</p>
            <p className="text-sm mt-1">Tente ajustar os filtros de busca.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {paged.map(p => (
              <ProductCard key={p.id} product={p} onClick={() => go("product-detail", p.id)} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-md border border-border text-sm disabled:opacity-40 hover:bg-secondary transition-colors"
            >
              ← Anterior
            </button>
            {Array.from({ length: total }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-9 h-9 rounded-md text-sm font-medium transition-colors ${
                  page === n ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(total, p + 1))}
              disabled={page === total}
              className="px-3 py-1.5 rounded-md border border-border text-sm disabled:opacity-40 hover:bg-secondary transition-colors"
            >
              Próxima →
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

// ================================================================
// PRODUCT DETAIL PAGE
// ================================================================

function ProductDetailPage({ products }: { products: Product[] }) {
  const { nav, go } = useNav();
  const product = products.find(p => p.id === nav.productId);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-25 text-muted-foreground" />
          <p className="text-muted-foreground">Produto não encontrado.</p>
          <button onClick={() => go("catalog")} className="mt-4 text-accent hover:underline text-sm">
            Voltar ao catálogo
          </button>
        </div>
      </div>
    );
  }

  const displayPrice = product.onSale && product.salePrice ? product.salePrice : product.price;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <BackButton label="Voltar ao Catálogo" to="catalog" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden bg-secondary aspect-square">
            <img
              src={product.imageUrl.replace("w=400&h=320", "w=800&h=800")}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center py-2">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <CategoryBadge category={product.category} />
              {product.onSale && (
                <span className="bg-accent text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Em Promoção
                </span>
              )}
              {product.isNew && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Novo
                </span>
              )}
              {product.featured && (
                <span className="text-xs text-accent font-semibold">★ Destaque</span>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-5">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-primary">{fmt(displayPrice)}</span>
              {product.onSale && product.salePrice && (
                <span className="text-xl text-muted-foreground line-through mb-0.5">{fmt(product.price)}</span>
              )}
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed mb-8">{product.description}</p>

            <div className="grid grid-cols-2 gap-4 bg-secondary rounded-xl p-4 mb-8">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Disponível em estoque</p>
                <p className="text-base font-semibold text-foreground flex items-center gap-1.5">
                  {product.stock > 10
                    ? <CheckCircle className="w-4 h-4 text-green-600" />
                    : product.stock > 0
                    ? <AlertTriangle className="w-4 h-4 text-amber-500" />
                    : <AlertTriangle className="w-4 h-4 text-red-500" />}
                  {product.stock} unidade{product.stock !== 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Categoria</p>
                <p className="text-base font-semibold text-foreground">{product.category}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href="https://wa.me/5551991027400"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3.5 rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" /> Pedir via WhatsApp
              </a>
              <a
                href="tel:+554933220001"
                className="flex items-center justify-center gap-2 border border-border px-5 py-3.5 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            <p className="text-[11px] text-muted-foreground mt-5 text-center">
              Cadastrado em {fmtDate(product.createdAt)}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ================================================================
// ABOUT PAGE
// ================================================================

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <BackButton label="Voltar ao Início" to="home" />

        <div className="mb-10">
          <h1 className="font-display text-3xl font-semibold text-foreground">Sobre a Loja</h1>
          <p className="text-muted-foreground mt-1 text-sm">Conheça a Defumados e venha nos visitar</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            {/* Company Info */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display text-xl font-semibold text-foreground mb-5">Informações da Empresa</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <ShoppingBag className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Defumados Artesanal Ltda.</p>
                    <p className="text-xs text-muted-foreground">CNPJ: 00.000.000/0001-00</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Rua das Colônias, 320</p>
                    <p className="text-xs text-muted-foreground">Chapecó — Santa Catarina — CEP 89800-000</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">(51) 3322-0001</p>
                    <p className="text-xs text-muted-foreground">Telefone fixo</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-accent flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">(51) 99102-7400</p>
                    <p className="text-xs text-muted-foreground">WhatsApp disponível</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">contato@defumados.com.br</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display text-xl font-semibold text-foreground mb-5 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" /> Horários de Atendimento
              </h2>
              <div className="space-y-0">
                {[
                  { day: "Segunda a Sexta", hours: "08h00 – 18h00", open: true },
                  { day: "Sábado", hours: "08h00 – 13h00", open: true },
                  { day: "Domingo", hours: "Fechado", open: false },
                ].map(r => (
                  <div key={r.day} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{r.day}</span>
                    <span className={`text-sm font-semibold ${r.open ? "text-foreground" : "text-red-500"}`}>
                      {r.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {/* Map placeholder */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="bg-secondary h-64 flex items-center justify-center">
                {/* TODO: Integrar Google Maps ou OpenStreetMap quando backend estiver disponível. */}
                <div className="text-center text-muted-foreground px-6">
                  <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium text-foreground/70">Mapa em breve</p>
                  <p className="text-xs mt-1 opacity-50">Rua das Colônias, 320 — Chapecó, SC</p>
                </div>
              </div>
            </div>

            {/* Contact CTAs */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display text-xl font-semibold text-foreground mb-5">Fale Conosco</h2>
              <div className="space-y-3">
                <a
                  href="https://wa.me/5551991027400"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full bg-green-600 text-white px-4 py-3.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  WhatsApp — (51) 99102-7400
                </a>
                <a
                  href="tel:+554933220001"
                  className="flex items-center gap-3 w-full border border-border px-4 py-3.5 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                >
                  <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                  Telefone — (49) 3322-0001
                </a>
                <a
                  href="mailto:contato@defumados.com.br"
                  className="flex items-center gap-3 w-full border border-border px-4 py-3.5 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                >
                  <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                  contato@defumados.com.br
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ================================================================
// ADMIN SIDEBAR
// ================================================================

function AdminSidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const { nav, go } = useNav();

  const navItems: { label: string; page: PageId; icon: React.ReactNode }[] = [
    { label: "Dashboard", page: "admin", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Produtos", page: "admin-products", icon: <Package className="w-4 h-4" /> },
    { label: "Estoque", page: "admin-stock", icon: <Boxes className="w-4 h-4" /> },
  ];

  const isActive = (p: PageId) =>
    nav.page === p || (p === "admin-products" && nav.page === "admin-product-form");

  const Content = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="w-7 h-7 bg-primary rounded flex items-center justify-center flex-shrink-0">
          <Flame className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-foreground leading-tight">Defumados</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Administração</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => { go(item.page); onClose(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.page)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-border pt-4">
        <button
          onClick={() => { go("home"); onClose(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Home className="w-4 h-4" /> Voltar ao Site
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-52 flex-shrink-0 border-r border-border bg-card h-screen sticky top-0 overflow-y-auto">
        <Content />
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
          <div className="relative w-52 bg-card border-r border-border h-full overflow-y-auto">
            <Content />
          </div>
        </div>
      )}
    </>
  );
}

// ================================================================
// ADMIN LAYOUT
// ================================================================

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebar, setMobileSidebar] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar mobileOpen={mobileSidebar} onClose={() => setMobileSidebar(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-card flex-shrink-0">
          <button
            onClick={() => setMobileSidebar(true)}
            className="p-1.5 text-foreground rounded hover:bg-secondary transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-semibold text-sm text-foreground">Área Administrativa</span>
        </div>
        <main className="flex-1 p-5 sm:p-7 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// ================================================================
// ADMIN DASHBOARD
// ================================================================

function StatCard({ label, value, sub, color = "text-foreground" }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function AdminDashboardPage({ products, movements }: { products: Product[]; movements: StockMovement[] }) {
  const { go } = useNav();

  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10);
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCount = products.filter(p => new Date(p.createdAt) >= thirtyDaysAgo).length;

  const entries = movements.filter(m => m.type === "ENTRY").reduce((s, m) => s + m.quantity, 0);
  const exits = movements.filter(m => m.type === "EXIT").reduce((s, m) => s + m.quantity, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total de Produtos" value={products.length} sub="cadastrados" />
        <StatCard label="Estoque Baixo" value={lowStock.length} sub="≤ 10 unidades" color="text-amber-600" />
        <StatCard label="Total em Estoque" value={totalStock} sub="unidades totais" />
        <StatCard label="Novos (30 dias)" value={recentCount} sub="recém cadastrados" color="text-green-700" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: <TrendingUp className="w-5 h-5 text-green-700" />, bg: "bg-green-100", label: "Entradas (histórico)", value: `+${entries}`, color: "text-green-700" },
          { icon: <TrendingDown className="w-5 h-5 text-red-700" />, bg: "bg-red-100", label: "Saídas (histórico)", value: `-${exits}`, color: "text-red-700" },
          { icon: <ClipboardList className="w-5 h-5 text-foreground" />, bg: "bg-secondary", label: "Movimentações", value: movements.length, color: "text-foreground" },
        ].map(c => (
          <div key={c.label} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-full ${c.bg} flex items-center justify-center flex-shrink-0`}>
              {c.icon}
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">{c.label}</p>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent movements */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground text-sm">Movimentações Recentes</h2>
          <button onClick={() => go("admin-stock")} className="text-xs text-accent hover:underline">
            Ver todas →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider bg-secondary/30">
                {["Produto", "Tipo", "Qtd", "Data", "Motivo"].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movements.slice(0, 5).map(m => {
                const p = products.find(p => p.id === m.productId);
                return (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{p?.name ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.type === "ENTRY" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {m.type === "ENTRY" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {m.type === "ENTRY" ? "Entrada" : "Saída"}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-foreground">{m.quantity}</td>
                    <td className="px-5 py-3 text-muted-foreground">{fmtDate(m.date)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{m.reason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-900">Atenção: Produtos com Estoque Baixo</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(p => (
              <span key={p.id} className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-medium">
                {p.name} — {p.stock} un.
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ================================================================
// ADMIN PRODUCTS
// ================================================================

function AdminProductsPage({
  products, onDelete,
}: {
  products: Product[];
  onDelete: (id: string) => void;
}) {
  const { go } = useNav();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<Category | "Todos">("Todos");

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (cat !== "Todos") list = list.filter(p => p.category === cat);
    return list;
  }, [products, search, cat]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold text-foreground">Produtos</h1>
        <button
          onClick={() => go("admin-product-form")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={cat}
          onChange={e => setCat(e.target.value as Category | "Todos")}
          className="px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="Todos">Todas as categorias</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider bg-secondary/30">
                <th className="text-left px-4 py-3 font-semibold">Produto</th>
                <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 font-semibold">Estoque</th>
                <th className="text-left px-4 py-3 font-semibold">Preço</th>
                <th className="text-left px-4 py-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm leading-tight">{p.name}</p>
                        <div className="flex gap-2 mt-0.5 flex-wrap">
                          {p.featured && <span className="text-[10px] text-accent font-semibold">★ Destaque</span>}
                          {p.onSale && <span className="text-[10px] text-red-500 font-semibold">● Promoção</span>}
                          {p.isNew && <span className="text-[10px] text-green-600 font-semibold">● Novo</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <CategoryBadge category={p.category} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-sm font-semibold ${
                      p.stock === 0 ? "text-red-600" : p.stock <= 5 ? "text-red-500" : p.stock <= 10 ? "text-amber-600" : "text-foreground"
                    }`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.onSale && p.salePrice ? (
                      <div>
                        <span className="text-accent font-semibold">{fmt(p.salePrice)}</span>
                        <span className="text-xs text-muted-foreground line-through ml-1.5">{fmt(p.price)}</span>
                      </div>
                    ) : (
                      <span className="font-medium">{fmt(p.price)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => go("product-detail", p.id)}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                        title="Ver produto"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => go("admin-product-form", p.id)}
                        className="p-1.5 text-muted-foreground hover:text-accent hover:bg-secondary rounded-md transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (window.confirm(`Excluir "${p.name}"?`)) onDelete(p.id); }}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-secondary rounded-md transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center text-muted-foreground">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-25" />
                    <p className="text-sm">Nenhum produto encontrado.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// ADMIN PRODUCT FORM
// ================================================================

type ProductFormData = Omit<Product, "id" | "createdAt">;

function AdminProductFormPage({
  products, productId, onSave,
}: {
  products: Product[];
  productId?: string;
  onSave: (data: ProductFormData | (Partial<Product> & { id: string })) => void;
}) {
  const { go } = useNav();
  const existing = productId ? products.find(p => p.id === productId) : undefined;

  const [form, setForm] = useState<ProductFormData>({
    name: existing?.name ?? "",
    description: existing?.description ?? "",
    category: existing?.category ?? "Bacon",
    imageUrl: existing?.imageUrl ?? "",
    price: existing?.price ?? 0,
    stock: existing?.stock ?? 0,
    featured: existing?.featured ?? false,
    onSale: existing?.onSale ?? false,
    salePrice: existing?.salePrice ?? 0,
    isNew: existing?.isNew ?? false,
  });

  const set = <K extends keyof ProductFormData>(key: K) => (val: ProductFormData[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productId) {
      onSave({ ...form, id: productId });
    } else {
      onSave(form);
    }
    go("admin-products");
  };

  return (
    <div>
      <BackButton label="Voltar para Produtos" to="admin-products" />
      <h1 className="font-display text-2xl font-semibold text-foreground mb-8">
        {productId ? "Editar Produto" : "Novo Produto"}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Nome do Produto <span className="text-accent">*</span></label>
            <input
              required
              type="text"
              value={form.name}
              onChange={e => set("name")(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Descrição</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => set("description")(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Categoria <span className="text-accent">*</span></label>
              <select
                required
                value={form.category}
                onChange={e => set("category")(e.target.value as Category)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Quantidade em Estoque <span className="text-accent">*</span></label>
              <input
                required
                type="number"
                min="0"
                value={form.stock}
                onChange={e => set("stock")(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Preço (R$) <span className="text-accent">*</span></label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={e => set("price")(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {form.onSale && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Preço Promocional (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.salePrice ?? 0}
                  onChange={e => set("salePrice")(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">URL da Foto</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={e => set("imageUrl")(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-3 pt-1">
            {([
              { key: "featured" as const, label: "Produto em Destaque" },
              { key: "isNew" as const, label: "Marcar como Novo" },
              { key: "onSale" as const, label: "Em Promoção" },
            ] as const).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!form[key]}
                  onChange={e => set(key)(e.target.checked as any)}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-7 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              {productId ? "Salvar Alterações" : "Cadastrar Produto"}
            </button>
            <button
              type="button"
              onClick={() => go("admin-products")}
              className="border border-border px-7 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ================================================================
// ADMIN STOCK
// ================================================================

function AdminStockPage({
  products, movements, onAddMovement,
}: {
  products: Product[];
  movements: StockMovement[];
  onAddMovement: (data: Omit<StockMovement, "id">) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    productId: products[0]?.id ?? "",
    type: "ENTRY" as "ENTRY" | "EXIT",
    quantity: 1,
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMovement({ ...form, date: new Date().toISOString() });
    setForm(f => ({ ...f, quantity: 1, reason: "" }));
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold text-foreground">Controle de Estoque</h1>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nova Movimentação
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-foreground mb-5">Registrar Movimentação</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Produto</label>
              <select
                value={form.productId}
                onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Tipo</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as "ENTRY" | "EXIT" }))}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ENTRY">Entrada</option>
                <option value="EXIT">Saída</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Quantidade</label>
              <input
                required
                type="number"
                min="1"
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Motivo</label>
              <input
                required
                type="text"
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="Ex: Venda balcão, Reposição..."
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Registrar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-border px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider bg-secondary/30">
                {["Data", "Produto", "Tipo", "Qtd", "Motivo"].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movements.map(m => {
                const p = products.find(p => p.id === m.productId);
                return (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 text-muted-foreground text-xs">{fmtDate(m.date)}</td>
                    <td className="px-5 py-3 font-medium text-foreground">{p?.name ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.type === "ENTRY" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {m.type === "ENTRY" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {m.type === "ENTRY" ? "Entrada" : "Saída"}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-foreground">{m.quantity}</td>
                    <td className="px-5 py-3 text-muted-foreground">{m.reason}</td>
                  </tr>
                );
              })}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-muted-foreground">
                    <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-25" />
                    <p className="text-sm">Nenhuma movimentação registrada.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// APP ROOT
// ================================================================

export default function App() {
  const [nav, setNav] = useState<NavState>({ page: "home" });
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [movements, setMovements] = useState<StockMovement[]>(MOCK_MOVEMENTS);

  const go = (page: PageId, productId?: string) => {
    setNav({ page, productId });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addProduct = (data: Omit<Product, "id" | "createdAt">) => {
    const p = productRepo.create(data);
    setProducts(prev => [p, ...prev]);
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addMovement = (data: Omit<StockMovement, "id">) => {
    const m = stockRepo.addMovement(data);
    setMovements(prev => [m, ...prev]);
    setProducts(prev => prev.map(p => {
      if (p.id !== data.productId) return p;
      const delta = data.type === "ENTRY" ? data.quantity : -data.quantity;
      return { ...p, stock: Math.max(0, p.stock + delta) };
    }));
  };

  const handleSaveProduct = (data: ProductFormData | (Partial<Product> & { id: string })) => {
    if ("id" in data && data.id) {
      const { id, ...rest } = data;
      updateProduct(id as string, rest);
    } else {
      addProduct(data as ProductFormData);
    }
  };

  const isAdmin = nav.page.startsWith("admin");

  const renderPage = () => {
    switch (nav.page) {
      case "home":              return <HomePage products={products} />;
      case "catalog":           return <CatalogPage products={products} />;
      case "product-detail":    return <ProductDetailPage products={products} />;
      case "about":             return <AboutPage />;
      case "admin":             return <AdminDashboardPage products={products} movements={movements} />;
      case "admin-products":    return <AdminProductsPage products={products} onDelete={deleteProduct} />;
      case "admin-product-form": return (
        <AdminProductFormPage
          products={products}
          productId={nav.productId}
          onSave={handleSaveProduct}
        />
      );
      case "admin-stock":       return (
        <AdminStockPage products={products} movements={movements} onAddMovement={addMovement} />
      );
    }
  };

  return (
    <NavContext.Provider value={{ nav, go }}>
      {isAdmin ? (
        <AdminLayout>{renderPage()}</AdminLayout>
      ) : (
        <>
          <Navbar />
          <div className="pt-16">{renderPage()}</div>
        </>
      )}
    </NavContext.Provider>
  );
}
