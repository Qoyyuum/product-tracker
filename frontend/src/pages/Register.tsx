import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    organizationName: '',
    organizationType: 'manufacturer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(privateKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      setPrivateKey(data.organization.privateKey);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (privateKey) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-yellow-900 mb-4">⚠️ Save Your Private Key</h2>
          <p className="text-yellow-800 mb-4">
            This is your organization's private key. You need this to sign products and stages.
            <strong> Save it securely - it will only be shown once!</strong> {/* TODO: Add a help guideline doc link here to explain how to use this private key */}
          </p>
          <div className="bg-white p-4 rounded border border-yellow-300 mb-4">
            <code className="text-sm text-black break-all">{privateKey}</code>
          </div>
          <button
            onClick={copyToClipboard}
            className="w-full mb-3 bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 border border-gray-300 flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check size={18} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={18} />
                Copy to Clipboard
              </>
            )}
          </button>
          <button
            onClick={() => navigate('/manufacturer')}
            className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            I've Saved My Key - Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Register</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={formData.organizationName}
              onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Type
            </label>
            <select
              value={formData.organizationType}
              onChange={(e) => setFormData({...formData, organizationType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="manufacturer">Manufacturer</option>
              <option value="auditor">Auditor</option>
              <option value="certifier">Certifier</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
