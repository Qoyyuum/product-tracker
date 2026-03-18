import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';

interface QRScannerProps {
  onScan: (qrHash: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            onScan(decodedText);
            stopScanner();
          },
          (errorMessage) => {
            // Ignore decode errors, they're expected
          }
        );

        setIsScanning(true);
      } catch (err: any) {
        const errorMsg = err?.message || '';
        if (errorMsg.includes('NotAllowedError') || errorMsg.includes('Permission')) {
          setError('Camera access denied. Please allow camera permissions in your browser settings and refresh the page.');
        } else if (errorMsg.includes('NotFoundError')) {
          setError('No camera found on this device.');
        } else {
          setError('Failed to start camera. Please ensure camera permissions are granted and try again.');
        }
        console.error('Scanner error:', err);
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = () => {
    if (scannerRef.current && isScanning) {
      scannerRef.current.stop().catch(console.error);
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Scan QR Code</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm font-semibold mb-3">{error}</p>
            <div className="text-xs text-red-700 space-y-2">
              <p className="font-semibold">How to enable camera access:</p>
              <div className="bg-white rounded p-2 space-y-1">
                <p><strong>Firefox Mobile:</strong></p>
                <p>1. Tap the lock icon in the address bar</p>
                <p>2. Tap "Permissions"</p>
                <p>3. Enable "Camera"</p>
                <p>4. Refresh this page</p>
              </div>
              <div className="bg-white rounded p-2 space-y-1">
                <p><strong>Chrome Mobile:</strong></p>
                <p>1. Tap the lock/info icon in the address bar</p>
                <p>2. Tap "Permissions"</p>
                <p>3. Allow "Camera"</p>
                <p>4. Refresh this page</p>
              </div>
              <div className="bg-white rounded p-2 space-y-1">
                <p><strong>Safari iOS:</strong></p>
                <p>1. Go to Settings → Safari → Camera</p>
                <p>2. Select "Ask" or "Allow"</p>
                <p>3. Return and refresh this page</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div id="qr-reader" className="rounded-lg overflow-hidden"></div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Position the QR code within the frame
            </p>
          </div>
        )}

        <button
          onClick={handleClose}
          className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
