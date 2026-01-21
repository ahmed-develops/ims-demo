
import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, AlertCircle } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
}

const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ isOpen, onClose, onScan }) => {
  const [error, setError] = useState<string>('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Small timeout to ensure DOM is ready
      const timer = setTimeout(() => {
        try {
          if (scannerRef.current) {
            scannerRef.current.clear();
          }

          const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
            ]
          };

          const scanner = new Html5QrcodeScanner("reader", config, false);
          scannerRef.current = scanner;

          scanner.render(
            (decodedText) => {
              scanner.clear();
              onScan(decodedText);
            },
            (errorMessage) => {
              // Ignore scan errors as they happen constantly when no code is in frame
            }
          );
        } catch (err) {
          console.error("Failed to initialize scanner", err);
          setError("Could not access camera. Please check permissions.");
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
      };
    }
  }, [isOpen, onScan]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
             <Camera size={20} className="text-indigo-600 dark:text-indigo-400"/>
             <h3 className="text-lg font-bold text-gray-900 dark:text-white">Scan Barcode</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-0 bg-black relative min-h-[300px] flex items-center justify-center">
            {error ? (
                <div className="text-center p-6 text-white">
                    <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                    <p>{error}</p>
                </div>
            ) : (
                <div id="reader" className="w-full h-full text-white"></div>
            )}
        </div>
        
        <div className="p-4 text-center bg-gray-50 dark:bg-gray-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">Position the barcode within the frame.</p>
        </div>
      </div>
      <style>{`
        #reader__scan_region {
            background: transparent !important;
        }
        #reader__dashboard_section_csr button {
            display: none !important;
        }
      `}</style>
    </div>
  );
};

export default BarcodeScannerModal;
