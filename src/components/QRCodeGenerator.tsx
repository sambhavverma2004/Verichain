import React, { useState } from 'react';
import { QrCode, Eye, EyeOff } from 'lucide-react';
import { blockchainService } from '../services/blockchainService';

interface QRCodeGeneratorProps {
  shipmentId: string;
  size?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ shipmentId, size = 200 }) => {
  const [showData, setShowData] = useState(false);
  
  // Get shipment data for QR code
  const shipment = blockchainService.getShipment(shipmentId);
  
  if (!shipment) {
    return <div className="text-red-600">Shipment not found</div>;
  }

  // Create comprehensive JSON data for QR code
  const qrData = JSON.stringify({
    platform: "Verichain",
    blockchain: "Internet Computer Protocol",
    shipment: {
      id: shipment.id,
      product: {
        name: shipment.product.name,
        description: shipment.product.description,
        temperatureRange: {
          min: shipment.product.minTemperature,
          max: shipment.product.maxTemperature
        }
      },
      status: shipment.status,
      escrow: {
        amount: shipment.escrowAmount,
        currency: "INR",
        released: shipment.escrowReleased
      },
      parties: {
        manufacturer: shipment.manufacturer,
        logistics: shipment.logisticsPartner,
        consumer: shipment.consumer
      },
      timeline: {
        created: new Date(shipment.createdAt).toISOString(),
        delivered: shipment.deliveredAt ? new Date(shipment.deliveredAt).toISOString() : null,
        confirmed: shipment.confirmedAt ? new Date(shipment.confirmedAt).toISOString() : null
      },
      events: shipment.events.map(event => ({
        id: event.id,
        type: event.eventType,
        location: event.location,
        timestamp: new Date(event.timestamp).toISOString(),
        temperature: {
          reported: event.temperature,
          verified: event.verifiedTemperature,
          valid: event.isTemperatureValid
        },
        reporter: event.reporter
      }))
    },
    verification: {
      url: `https://verichain.app/verify/${shipmentId}`,
      instructions: "Scan this QR code to verify shipment authenticity on the blockchain"
    }
  }, null, 2);

  // Generate QR code URL with the JSON data
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrData)}&format=png&ecc=M&margin=1`;

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl border border-blue-200">
      <div className="flex items-center space-x-2 mb-2">
        <QrCode className="w-5 h-5 text-blue-600" />
        <h4 className="font-semibold text-blue-800">Blockchain Verification QR</h4>
      </div>
      
      <div className="p-3 bg-white rounded-lg shadow-md border-2 border-blue-100">
        <img 
          src={qrUrl} 
          alt={`QR Code for shipment ${shipmentId}`}
          className="rounded-md"
          width={size}
          height={size}
        />
      </div>
      
      <div className="text-center max-w-xs">
        <p className="text-sm text-blue-700 font-medium mb-2">
          Complete Shipment Data
        </p>
        <p className="text-xs text-gray-600">
          Contains full blockchain record including events, temperatures, and verification data
        </p>
      </div>

      <div className="bg-blue-100 p-3 rounded-lg text-xs text-blue-800 max-w-xs text-center">
        <p className="font-medium mb-1">Verification Details:</p>
        <p>• Product: {shipment.product.name}</p>
        <p>• Status: {shipment.status.toUpperCase()}</p>
        <p>• Events: {shipment.events.length}</p>
        <p>• Escrow: ₹{shipment.escrowAmount.toLocaleString('en-IN')}</p>
      </div>

      <button
        onClick={() => setShowData(!showData)}
        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
      >
        {showData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        <span>{showData ? 'Hide' : 'Show'} JSON Data</span>
      </button>

      {showData && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border text-xs font-mono text-gray-700 max-w-md max-h-64 overflow-auto">
          <pre className="whitespace-pre-wrap text-left">{qrData}</pre>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;