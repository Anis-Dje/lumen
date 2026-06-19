import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { VariantSelector } from '../components/products/VariantSelector';
import { SpecsTable } from '../components/products/SpecsTable';
import { ProductDetailSkeleton } from '../components/ui/SkeletonLoader';
import type { Product } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetch = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const response = await api.products.getProduct(slug);
        setProduct(response.data.data);
      } catch {
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [slug]);

  if (isLoading) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Product Not Found
        </h2>
        <Link to="/" className="btn-primary">Back to Catalog</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
        <Link to="/" className="hover:text-[var(--accent-primary)] transition-colors duration-150">
          Catalog
        </Link>
        <ChevronRight className="w-4 h-4" />
        {product.category && (
          <>
            <Link
              to={`/?category=${product.category.slug}`}
              className="hover:text-[var(--accent-primary)] transition-colors duration-150"
            >
              {product.category.name}
            </Link>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
        <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div
          className="aspect-square rounded-xl overflow-hidden flex items-center justify-center"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              className="w-32 h-32"
              style={{ color: 'var(--text-secondary)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={0.5}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          {product.category && (
            <span
              className="text-sm font-medium uppercase tracking-wider"
              style={{ color: 'var(--accent-secondary)' }}
            >
              {product.category.name}
            </span>
          )}

          <h1
            className="text-3xl lg:text-4xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {product.name}
          </h1>

          <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {product.description}
          </p>

          {/* Variant selector */}
          {product.variants && product.variants.length > 0 && (
            <VariantSelector variants={product.variants} />
          )}
        </div>
      </div>

      {/* Specifications */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="mt-12">
          <SpecsTable specifications={product.specifications} />
        </div>
      )}
    </div>
  );
};
