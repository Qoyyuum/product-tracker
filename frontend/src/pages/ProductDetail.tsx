import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, MapPin, Shield, Download } from 'lucide-react';
import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export default function ProductDetail() {
  const { qrHash } = useParams();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', qrHash],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/v1/product/${qrHash}`);
      if (!response.ok) throw new Error('Product not found');
      return response.json();
    },
  });

  useEffect(() => {
    if (qrCanvasRef.current && qrHash && data) {
      const productUrl = `${window.location.origin}/product/${qrHash}`;
      QRCode.toCanvas(qrCanvasRef.current, productUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(err => {
        console.error('QR code generation failed:', err);
      });
    }
  }, [qrHash, data]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <XCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 dark:text-red-400 mb-2">Product Not Found</h2>
          <p className="text-red-700 dark:text-red-300">The QR code you scanned is not registered in our system.</p>
        </div>
      </div>
    );
  }

  const { product, stages, certifications, audits } = data;

  const downloadQR = () => {
    if (qrCanvasRef.current) {
      const url = qrCanvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `product-${product.batchId}-qr.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* QR Code Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Product QR Code</h2>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600">
            <canvas ref={qrCanvasRef} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How to use this QR code:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
              <li>Click "Download QR Code" below</li>
              <li>Print the QR code image</li>
              <li>Attach it to your product packaging</li>
              <li>Customers can scan it to verify authenticity</li>
            </ol>
            <button
              onClick={downloadQR}
              className="flex items-center gap-2 bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-700 dark:hover:bg-primary-600"
            >
              <Download size={18} />
              Download QR Code
            </button>
          </div>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">Batch ID: {product.batchId}</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="font-semibold text-green-900 dark:text-green-300">Verified</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manufacturer</p>
            <p className="font-semibold text-gray-900 dark:text-white">{product.manufacturer.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
            <p className="font-semibold text-gray-900 dark:text-white">{product.category}</p>
          </div>
        </div>

        {product.description && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
            <p className="text-gray-900 dark:text-white">{product.description}</p>
          </div>
        )}
      </div>

      {certifications && certifications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Certifications</h2>
          <div className="space-y-3">
            {certifications.map((cert: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{cert.type.toUpperCase()}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Issued by: {cert.issuer}</p>
                  </div>
                </div>
                {cert.number && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">#{cert.number}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Processing Timeline</h2>
        <div className="space-y-4">
          {stages.map((stage: any, index: number) => (
            <div key={stage.id} className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="bg-primary-600 dark:bg-primary-500 rounded-full p-2">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                {index < stages.length - 1 && (
                  <div className="w-0.5 h-full bg-primary-200 dark:bg-primary-800 mt-2"></div>
                )}
              </div>
              <div className="flex-1 pb-8">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{stage.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{stage.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(stage.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Recorded by:</span>
                      <span>{stage.recordedBy.name}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 font-mono">
                    Hash: {stage.hash.substring(0, 16)}...
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {audits && audits.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Audit Records</h2>
          <div className="space-y-3">
            {audits.map((audit: any) => (
              <div key={audit.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{audit.auditor}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    audit.status === 'approved' ? 'bg-green-100 text-green-800' :
                    audit.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {audit.status}
                  </span>
                </div>
                {audit.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">{audit.notes}</p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {new Date(audit.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
