import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { Product } from '../../types';

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  loading?: boolean;
}

function priceLabel(product: Product): string {
  const prices = (product.variants || []).filter((v) => v.is_active).map((v) => v.price);
  if (prices.length === 0) return '—';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)}+`;
}

export function ProductCarousel({ title, subtitle, products, loading }: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 600), behavior: 'smooth' });
  };

  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
        </div>
        <div className="hidden gap-2 sm:flex">
          <button
            onClick={() => scrollBy(-1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-border-subtle bg-bg-card text-text-secondary transition-colors hover:border-accent-primary hover:text-text-primary"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-border-subtle bg-bg-card text-text-secondary transition-colors hover:border-accent-primary hover:text-text-primary"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-bg-primary to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-bg-primary to-transparent" />

        <div
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton h-72 w-64 shrink-0 snap-start rounded-2xl sm:w-72"
                />
              ))
            : products.map((product) => {
                const hasStock = (product.variants || []).some((v) => v.is_in_stock);
                const lowStock = (product.variants || []).some((v) => v.is_low_stock && v.is_in_stock);
                return (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug}`}
                    className="glass-card group w-64 shrink-0 snap-start overflow-hidden sm:w-72"
                  >
                    <div className="relative aspect-square overflow-hidden bg-bg-elevated">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-text-secondary">
                          <span className="text-4xl">⚡</span>
                        </div>
                      )}
                      <div className="absolute left-3 top-3">
                        {!hasStock ? (
                          <Badge variant="danger">Sold out</Badge>
                        ) : lowStock ? (
                          <Badge variant="warning">Low stock</Badge>
                        ) : (
                          <Badge variant="success">In stock</Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 p-4">
                      {product.category && (
                        <span className="text-[11px] font-medium uppercase tracking-wider text-accent-secondary">
                          {product.category.name}
                        </span>
                      )}
                      <h3 className="line-clamp-1 font-display text-base font-semibold text-text-primary">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-lg font-bold text-text-primary">{priceLabel(product)}</span>
                        <span className="text-sm font-medium text-accent-primary opacity-0 transition-opacity group-hover:opacity-100">
                          View →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}
