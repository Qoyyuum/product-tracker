import { Link, useNavigate } from 'react-router-dom';
import { QrCode, Shield, CheckCircle, Globe, Search } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [searchHash, setSearchHash] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchHash.trim()) {
      navigate(`/product/${searchHash.trim()}`);
    }
  };

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Verify Product Authenticity with Blockchain
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Scan QR codes to instantly verify product origins, quality control, and certifications.
          Built on Cloudflare's edge network with cryptographic guarantees.
        </p>

        {/* Search/Verify Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Verify Product by Hash</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter the QR hash or product ID to verify authenticity
            </p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchHash}
                onChange={(e) => setSearchHash(e.target.value)}
                placeholder="Enter QR hash or product ID..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                type="submit"
                className="bg-primary-600 dark:bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-600 flex items-center gap-2"
              >
                <Search size={20} />
                Verify
              </button>
            </form>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Link
            to="/scan"
            className="bg-primary-600 dark:bg-primary-500 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-600 flex items-center space-x-2"
          >
            <QrCode className="h-6 w-6" />
            <span>Scan Product</span>
          </Link>
          <Link
            to="/register"
            className="bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-2 border-primary-600 dark:border-primary-500 px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-50 dark:hover:bg-gray-700 flex items-center space-x-2"
          >
            <span>Register as Manufacturer</span>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="bg-primary-100 dark:bg-primary-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Cryptographic Verification
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Every product stage is cryptographically signed and verified using hash chains,
            ensuring tamper-proof audit trails.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="bg-primary-100 dark:bg-primary-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Complete Transparency
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            View the entire product journey from manufacturing to quality control,
            with timestamps and auditor signatures.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="bg-primary-100 dark:bg-primary-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Globe className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Global Edge Network
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Powered by Cloudflare's edge infrastructure for sub-100ms response times
            anywhere in the world.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-50 to-green-50 dark:from-primary-900/20 dark:to-green-900/20 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          How It Works
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">1</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Manufacturer Registers</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Product is registered with unique QR code and cryptographic signature
            </p>
          </div>
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">2</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Processing Stages</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Each stage is recorded with hash chain linking to previous stages
            </p>
          </div>
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">3</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Quality Audits</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Independent auditors verify and sign each checkpoint
            </p>
          </div>
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">4</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Consumer Verifies</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Scan QR code to see complete verified history
            </p>
          </div>
        </div>
      </div>

      <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Free and Open Source
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          This platform is completely free to use for everyone. We believe in transparency
          and accessibility for product verification. Built with love for the community.
        </p>
        <div className="flex justify-center space-x-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            View on GitHub →
          </a>
          <a
            href="/docs"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            Read Documentation →
          </a>
        </div>
      </div>
    </div>
  );
}
