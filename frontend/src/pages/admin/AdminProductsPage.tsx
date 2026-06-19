import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { productsApi, adminApi } from '../../lib/api';
import { Badge } from '../../components/ui/Badge';
import type { Product } from '../../types';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    description: '',
    short_description: '',
    specifications: '{}',
    image_url: '',
    is_active: true,
    variants: [{ sku: '', name: '', price: '', stock: '0', attributes: '{}', compare_at_price: '', low_stock_threshold: '5' }],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await productsApi.getProducts({ page: 1 });
      setProducts(response.data.data);
    } catch {
      alert('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminApi.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch {
      alert('Failed to delete product. It may have existing orders.');
    }
  };

  const handleCreate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      let parsedSpecs;
      try {
        parsedSpecs = JSON.parse(formData.specifications);
      } catch {
        alert('Invalid JSON format in Specifications.');
        return;
      }

      const parsedVariants = [];
      for (const v of formData.variants) {
        try {
          parsedVariants.push({
            ...v,
            price: parseFloat(v.price),
            stock: parseInt(v.stock, 10),
            low_stock_threshold: parseInt(v.low_stock_threshold, 10),
            attributes: JSON.parse(v.attributes),
            compare_at_price: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
          });
        } catch {
          alert('Invalid JSON format in Variant Attributes.');
          return;
        }
      }

      const payload = {
        ...formData,
        specifications: parsedSpecs,
        variants: parsedVariants,
      };
      await adminApi.createProduct(payload);
      setShowForm(false);
      fetchProducts();
    } catch {
      alert('Failed to create product. Check your input.');
    }
  };

  const addVariantRow = (): void => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { sku: '', name: '', price: '', stock: '0', attributes: '{}', compare_at_price: '', low_stock_threshold: '5' }],
    });
  };

  const handleVariantChange = (index: number, field: string, value: string): void => {
    const variants = [...formData.variants];
    variants[index] = { ...variants[index], [field]: value };
    setFormData({ ...formData, variants });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          Products
        </h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="p-6 rounded-xl space-y-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>New Product</h2>
          <div className="grid grid-cols-2 gap-4">
            <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" placeholder="Product Name" required />
            <input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="input" placeholder="slug-name" required />
          </div>
          <input value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="input" placeholder="Category UUID" required />
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input" placeholder="Description" rows={3} required />
          <input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className="input" placeholder="Image URL (optional)" />
          <textarea value={formData.specifications} onChange={(e) => setFormData({ ...formData, specifications: e.target.value })} className="input font-mono text-xs" placeholder='{"Processor": "M3"}' rows={2} />

          <h3 className="text-sm font-semibold mt-4" style={{ color: 'var(--text-secondary)' }}>Variants</h3>
          {formData.variants.map((v, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
              <input value={v.sku} onChange={(e) => handleVariantChange(i, 'sku', e.target.value)} className="input" placeholder="SKU" required />
              <input value={v.name} onChange={(e) => handleVariantChange(i, 'name', e.target.value)} className="input" placeholder="Variant Name" required />
              <input value={v.price} onChange={(e) => handleVariantChange(i, 'price', e.target.value)} className="input" placeholder="Price" type="number" step="0.01" required />
              <input value={v.stock} onChange={(e) => handleVariantChange(i, 'stock', e.target.value)} className="input" placeholder="Stock" type="number" required />
              <input value={v.compare_at_price} onChange={(e) => handleVariantChange(i, 'compare_at_price', e.target.value)} className="input" placeholder="Compare Price" type="number" step="0.01" />
              <input value={v.attributes} onChange={(e) => handleVariantChange(i, 'attributes', e.target.value)} className="input font-mono text-xs" placeholder='{"ram":"16GB"}' />
            </div>
          ))}
          <button type="button" onClick={addVariantRow} className="btn-secondary text-sm">+ Add Variant</button>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary">Create Product</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {/* Product table */}
      <div className="overflow-x-auto rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Product</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Category</th>
              <th className="px-4 py-3 text-center text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Variants</th>
              <th className="px-4 py-3 text-center text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Status</th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="p-4"><div className="skeleton h-8 w-full" /></td></tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const totalStock = (product.variants || []).reduce((s, v) => s + v.stock, 0);
                const hasLow = (product.variants || []).some((v) => v.is_low_stock);
                return (
                  <tr key={product.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{product.slug}</p>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{product.category?.name || '—'}</td>
                    <td className="px-4 py-3 text-center" style={{ color: 'var(--text-primary)' }}>{product.variants?.length || 0}</td>
                    <td className="px-4 py-3 text-center">
                      {totalStock === 0 ? <Badge variant="danger">Out of Stock</Badge> : hasLow ? <Badge variant="warning">Low Stock</Badge> : <Badge variant="success">In Stock</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 rounded-lg hover:bg-[var(--bg-elevated)]" style={{ color: 'var(--accent-primary)' }} aria-label="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg hover:bg-[var(--bg-elevated)]" style={{ color: 'var(--accent-danger)' }} aria-label="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
