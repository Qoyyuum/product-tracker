import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/QRScanner';
import { QrCode } from 'lucide-react';

export default function ScanProduct() {
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  const handleScan = (qrHash: string) => {
    setShowScanner(false);
    navigate(`/product/${qrHash}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Scan Product QR Code
        </h1>
        <p className="text-gray-600">
          Use your device camera to scan the QR code on the product packaging
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="bg-primary-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <QrCode className="h-12 w-12 text-primary-600" />
          </div>
          
          <button
            onClick={() => setShowScanner(true)}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-700 mb-4"
          >
            Start Camera
          </button>
          
          <p className="text-sm text-gray-500">
            Make sure to allow camera permissions when prompted
          </p>
        </div>
      </div>

      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
