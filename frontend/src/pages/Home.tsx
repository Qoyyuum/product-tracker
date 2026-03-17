import { Link } from 'react-router-dom';
import { QrCode, Shield, CheckCircle, Globe } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Verify Product Authenticity with Blockchain
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Scan QR codes to instantly verify product origins, quality control, and certifications.
          Built on Cloudflare's edge network with cryptographic guarantees.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/scan"
            className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-700 flex items-center space-x-2"
          >
            <QrCode className="h-6 w-6" />
            <span>Scan Product</span>
          </Link>
          <Link
            to="/register"
            className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-50 flex items-center space-x-2"
          >
            <span>Register as Manufacturer</span>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Cryptographic Verification
          </h3>
          <p className="text-gray-600">
            Every product stage is cryptographically signed and verified using hash chains,
            ensuring tamper-proof audit trails.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Complete Transparency
          </h3>
          <p className="text-gray-600">
            View the entire product journey from manufacturing to quality control,
            with timestamps and auditor signatures.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Globe className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Global Edge Network
          </h3>
          <p className="text-gray-600">
            Powered by Cloudflare's edge infrastructure for sub-100ms response times
            anywhere in the world.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-50 to-green-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          How It Works
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
              <span className="text-2xl font-bold text-primary-600">1</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Manufacturer Registers</h4>
            <p className="text-sm text-gray-600">
              Product is registered with unique QR code and cryptographic signature
            </p>
          </div>
          <div className="text-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
              <span className="text-2xl font-bold text-primary-600">2</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Processing Stages</h4>
            <p className="text-sm text-gray-600">
              Each stage is recorded with hash chain linking to previous stages
            </p>
          </div>
          <div className="text-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
              <span className="text-2xl font-bold text-primary-600">3</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Quality Audits</h4>
            <p className="text-sm text-gray-600">
              Independent auditors verify and sign each checkpoint
            </p>
          </div>
          <div className="text-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
              <span className="text-2xl font-bold text-primary-600">4</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Consumer Verifies</h4>
            <p className="text-sm text-gray-600">
              Scan QR code to see complete verified history
            </p>
          </div>
        </div>
      </div>

      <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Free and Open Source
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          This platform is completely free to use for everyone. We believe in transparency
          and accessibility for product verification. Built with love for the community.
        </p>
        <div className="flex justify-center space-x-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View on GitHub →
          </a>
          <a
            href="/docs"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Read Documentation →
          </a>
        </div>
      </div>
    </div>
  );
}
