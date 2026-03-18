import { useState, useEffect } from 'react';
import { Package, Plus, QrCode, ExternalLink, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

interface Product {
  id: string;
  product_name: string;
  batch_id: string;
  category: string;
  qr_hash: string;
  created_at: number;
  description?: string;
}

export default function ManufacturerDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    batchId: '',
    category: '',
    description: '',
    location: '',
    privateKey: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [qrModalProduct, setQrModalProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/v1/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_URL}/v1/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to register product');
      }

      const data = await response.json();
      setSuccess(`✅ Product registered successfully! Your product is now listed below. You can generate a QR code to print and attach to your product.`);
      setFormData({
        productName: '',
        batchId: '',
        category: '',
        description: '',
        location: '',
        privateKey: ''
      });
      setShowForm(false);
      fetchProducts(); // Refresh the product list
    } catch (err: any) {
      setError(err.message || 'Failed to register product');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = async (product: Product) => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${window.location.origin}/product/${product.qr_hash}`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${product.product_name}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code:', error);
      setError('Failed to download QR code. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manufacturer Dashboard</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-700 dark:hover:bg-primary-600"
        >
          <Plus size={20} />
          Register New Product
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
          <p className="text-green-800 dark:text-green-400">{success}</p>
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Register New Product</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({...formData, productName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Batch ID *
              </label>
              <input
                type="text"
                value={formData.batchId}
                onChange={(e) => setFormData({...formData, batchId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select category</option>
                <option value="Food">Food</option>
                <option value="Beverage">Beverage</option>
                <option value="Pharmaceutical">Pharmaceutical</option>
                <option value="Cosmetics">Cosmetics</option>
                <option value="Electronics">Electronics</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="e.g., Factory A, City, Country"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Private Key * (from registration)
              </label>
              <input
                type="password"
                value={formData.privateKey}
                onChange={(e) => setFormData({...formData, privateKey: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter your organization's private key"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This is the private key you received during registration
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register Product'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Products</h2>
        </div>

        {loadingProducts ? (
          <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            No products registered yet. Click "Register New Product" to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{product.product_name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <p><span className="font-medium">Batch ID:</span> {product.batch_id}</p>
                      <p><span className="font-medium">Category:</span> {product.category}</p>
                      {product.description && (
                        <p><span className="font-medium">Description:</span> {product.description}</p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Registered: {new Date(product.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <a
                      href={`/product/${product.qr_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-600 dark:bg-primary-500 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600"
                    >
                      <ExternalLink size={16} />
                      View Details
                    </a>
                    <button
                      onClick={() => window.open(`/product/${product.qr_hash}`, '_blank')}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                    >
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${window.location.origin}/product/${product.qr_hash}`}
                        alt="QR Code"
                        className="w-16 h-16"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {qrModalProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setQrModalProduct(null)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">QR Code</h3>
              <button
                onClick={() => setQrModalProduct(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">{qrModalProduct.product_name}</p>
              <div className="bg-white p-4 inline-block border-2 border-gray-200 rounded-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${window.location.origin}/product/${qrModalProduct.qr_hash}`}
                  alt="QR Code"
                  className="w-64 h-64"
                />
              </div>
              <p className="text-xs text-gray-500 mt-4">Scan this QR code to view product details</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleDownloadQR(qrModalProduct)}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-sm"
                >
                  Download QR Code
                </button>
                <button
                  onClick={() => window.open(`/product/${qrModalProduct.qr_hash}`, '_blank')}
                  className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 border border-gray-300 text-sm"
                >
                  View Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
