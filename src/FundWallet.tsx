import { useState } from 'react';
import { Button } from './components/ui/button';

interface FundWalletModalProps {
  address: string;
  onClose: () => void;
}

export function FundWalletModal({ address, onClose }: FundWalletModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Insufficient Funds</h2>
        <p className="mb-4">
          Your controller doesn't have enough funds to pay for transaction fees. Please send some ETH on MAINNET to your controller address:
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
          <div className="bg-gray-100 p-2 rounded flex-grow break-all mr-2 mb-2 sm:mb-0 w-full sm:w-auto">
            {'0x' + address.slice(2).padStart(64, '0')}
          </div>
          <Button
            onClick={handleCopy}
            className="bg-gray-200 text-black px-3 py-2 rounded hover:bg-gray-300 transition-colors w-full sm:w-auto"
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
        <p className="mb-4">
          After funding your controller, you can close this modal and try again.
        </p>
        <Button 
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Close
        </Button>
      </div>
    </div>
  );
}