import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, MapPin, Shield } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export default function ProductDetail() {
  const { qrHash } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', qrHash],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/v1/product/${qrHash}`);
      if (!response.ok) throw new Error('Product not found');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Product Not Found</h2>
          <p className="text-red-700">The QR code you scanned is not registered in our system.</p>
        </div>
      </div>
    );
  }

  const { product, stages, certifications, audits } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-600">Batch ID: {product.batchId}</p>
          </div>
          <div className="bg-green-100 px-4 py-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-900">Verified</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-sm text-gray-500">Manufacturer</p>
            <p className="font-semibold text-gray-900">{product.manufacturer.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-semibold text-gray-900">{product.category}</p>
          </div>
        </div>

        {product.description && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Description</p>
            <p className="text-gray-900">{product.description}</p>
          </div>
        )}
      </div>

      {certifications && certifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Certifications</h2>
          <div className="space-y-3">
            {certifications.map((cert: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{cert.type.toUpperCase()}</p>
                    <p className="text-sm text-gray-600">Issued by: {cert.issuer}</p>
                  </div>
                </div>
                {cert.number && (
                  <span className="text-sm text-gray-500">#{cert.number}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Processing Timeline</h2>
        <div className="space-y-4">
          {stages.map((stage: any, index: number) => (
            <div key={stage.id} className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="bg-primary-600 rounded-full p-2">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                {index < stages.length - 1 && (
                  <div className="w-0.5 h-full bg-primary-200 mt-2"></div>
                )}
              </div>
              <div className="flex-1 pb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{stage.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
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
                  <div className="mt-2 text-xs text-gray-400 font-mono">
                    Hash: {stage.hash.substring(0, 16)}...
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {audits && audits.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Audit Records</h2>
          <div className="space-y-3">
            {audits.map((audit: any) => (
              <div key={audit.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{audit.auditor}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    audit.status === 'approved' ? 'bg-green-100 text-green-800' :
                    audit.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {audit.status}
                  </span>
                </div>
                {audit.notes && (
                  <p className="text-sm text-gray-600">{audit.notes}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
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
