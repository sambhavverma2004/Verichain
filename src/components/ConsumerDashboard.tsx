import React, { useState, useEffect } from 'react';
import { Shipment } from '../types/blockchain';
import { blockchainService } from '../services/blockchainService';
import QRCodeGenerator from './QRCodeGenerator';
import { 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Thermometer, 
  MapPin,
  Package,
  DollarSign
} from 'lucide-react';

const ConsumerDashboard: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, []);

  const loadData = async () => {
    const consumerShipments = await blockchainService.getShipmentsByUser('cons-001', 'consumer');
    setShipments(consumerShipments);
  };

  const handleConfirmDelivery = async (shipmentId: string) => {
    setLoading(true);
    try {
      await blockchainService.confirmDelivery(shipmentId);
      await loadData();
      if (selectedShipment?.id === shipmentId) {
        setSelectedShipment(blockchainService.getShipment(shipmentId) || null);
      }
    } catch (error) {
      console.error('Failed to confirm delivery:', error);
      alert('Failed to confirm delivery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'in_transit': return 'text-blue-600 bg-blue-100';
      case 'compromised': return 'text-red-600 bg-red-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'confirmed': return 'text-emerald-600 bg-emerald-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTemperatureStatus = (event: any, shipment: Shipment) => {
    const inRange = event.verifiedTemperature >= shipment.product.minTemperature && 
                   event.verifiedTemperature <= shipment.product.maxTemperature;
    return inRange;
  };

  const getShipmentStats = () => {
    return {
      total: shipments.length,
      inTransit: shipments.filter(s => ['pending', 'in_transit'].includes(s.status)).length,
      compromised: shipments.filter(s => s.status === 'compromised').length,
      delivered: shipments.filter(s => ['delivered', 'confirmed'].includes(s.status)).length
    };
  };

  const stats = getShipmentStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Consumer Dashboard</h2>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Shipments</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-gray-800">{stats.inTransit}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Compromised</p>
              <p className="text-2xl font-bold text-gray-800">{stats.compromised}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-800">{stats.delivered}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shipment List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">My Shipments</h3>
            {shipments.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No shipments found</p>
            ) : (
              <div className="space-y-4">
                {shipments.map((shipment) => (
                  <div 
                    key={shipment.id} 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedShipment?.id === shipment.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedShipment(shipment)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">{shipment.product.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{shipment.id}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                            {shipment.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-600">
                            {shipment.events.length} events
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Eye className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Shipment Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipment Details</h3>
            {!selectedShipment ? (
              <p className="text-gray-600 text-center py-8">Select a shipment to view details</p>
            ) : (
              <div className="space-y-6">
                {/* Product Info */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">{selectedShipment.product.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{selectedShipment.product.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Shipment ID:</span>
                      <p className="font-medium">{selectedShipment.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedShipment.status)}`}>
                          {selectedShipment.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Required Temp:</span>
                      <p className="font-medium">
                        {selectedShipment.product.minTemperature}°C - {selectedShipment.product.maxTemperature}°C
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Escrow:</span>
                      <p className="font-medium flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span>₹{selectedShipment.escrowAmount.toLocaleString('en-IN')}</span>
                        {selectedShipment.escrowReleased && (
                          <span className="text-green-600 text-xs">(Released)</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="text-center">
                  <QRCodeGenerator shipmentId={selectedShipment.id} />
                </div>

                {/* Delivery Confirmation */}
                {selectedShipment.status === 'delivered' && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">Ready for Confirmation</h4>
                    <p className="text-sm text-green-700 mb-3">
                      This shipment has been delivered and is ready for confirmation. 
                      Confirming will release the escrow funds to the logistics partner.
                    </p>
                    <button
                      onClick={() => handleConfirmDelivery(selectedShipment.id)}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{loading ? 'Confirming...' : 'Confirm Delivery'}</span>
                    </button>
                  </div>
                )}

                {/* Event Timeline */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Event Timeline</span>
                  </h4>
                  {selectedShipment.events.length === 0 ? (
                    <p className="text-gray-600 text-sm">No events recorded yet</p>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedShipment.events
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .map((event, index) => {
                          const tempOk = getTemperatureStatus(event, selectedShipment);
                          return (
                            <div 
                              key={event.id}
                              className={`p-3 rounded-lg border-l-4 ${
                                tempOk 
                                  ? 'border-l-green-500 bg-green-50 border-green-200' 
                                  : 'border-l-red-500 bg-red-50 border-red-200'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <MapPin className="w-3 h-3 text-gray-600" />
                                    <span className="font-medium text-sm">{event.location}</span>
                                    <span className="text-xs text-gray-600 capitalize">
                                      {event.eventType}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                                    <div className="flex items-center space-x-1">
                                      <Thermometer className="w-3 h-3" />
                                      <span>Verified: {event.verifiedTemperature}°C</span>
                                    </div>
                                    {!tempOk && (
                                      <span className="text-red-600 font-medium">
                                        ⚠️ Out of Range
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(event.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerDashboard;