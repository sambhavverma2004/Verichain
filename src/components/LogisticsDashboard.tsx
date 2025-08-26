import React, { useState, useEffect } from 'react';
import { Shipment, ShipmentEvent } from '../types/blockchain';
import { blockchainService } from '../services/blockchainService';
import { Truck, MapPin, Thermometer, Clock, AlertTriangle, Lock } from 'lucide-react';

const LogisticsDashboard: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Password protection
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingEventData, setPendingEventData] = useState<any>(null);
  
  // Predefined password (in real app, this would be hashed and stored securely)
  const LOGISTICS_PASSWORD = 'logistics789';

  const [eventForm, setEventForm] = useState({
    location: '',
    temperature: '',
    eventType: 'transit' as ShipmentEvent['eventType']
  });

  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
    'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
    'Surat', 'Kanpur', 'Nagpur', 'Indore', 'Thane'
  ];

  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, []);

  const loadData = async () => {
    const logisticsShipments = await blockchainService.getShipmentsByUser('logi-001', 'logistics');
    setShipments(logisticsShipments);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === LOGISTICS_PASSWORD) {
      setShowPasswordModal(false);
      setPassword('');
      
      // Process the pending event
      if (pendingEventData) {
        await processAddEvent(pendingEventData);
        setPendingEventData(null);
      }
    } else {
      alert('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment || !eventForm.location || !eventForm.temperature) return;

    // Store the event data and show password modal
    setPendingEventData({
      shipmentId: selectedShipment,
      location: eventForm.location,
      temperature: parseFloat(eventForm.temperature),
      eventType: eventForm.eventType
    });
    setShowPasswordModal(true);
  };

  const processAddEvent = async (eventData: any) => {
    setLoading(true);
    try {
      await blockchainService.addEvent(
        eventData.shipmentId,
        eventData.location,
        eventData.temperature,
        eventData.eventType,
        'logi-001'
      );

      setEventForm({
        location: '',
        temperature: '',
        eventType: 'transit'
      });
      setSelectedShipment('');
      await loadData();
    } catch (error) {
      console.error('Failed to add event:', error);
      alert('Failed to add event. Please try again.');
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

  const getTemperatureStatus = (event: ShipmentEvent, shipment: Shipment) => {
    const inRange = event.verifiedTemperature >= shipment.product.minTemperature && 
                   event.verifiedTemperature <= shipment.product.maxTemperature;
    return inRange;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Logistics Dashboard</h2>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold">Authentication Required</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Please enter the logistics password to add a new event.
            </p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter logistics password"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword('');
                    setPendingEventData(null);
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Authenticate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Event Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Shipment Event</h3>
        <form onSubmit={handleAddEvent} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Shipment
              </label>
              <select
                value={selectedShipment}
                onChange={(e) => setSelectedShipment(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose shipment...</option>
                {shipments.filter(s => s.status !== 'confirmed' && s.status !== 'delivered').map((shipment) => (
                  <option key={shipment.id} value={shipment.id}>
                    {shipment.id} - {shipment.product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                value={eventForm.location}
                onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select location...</option>
                {locations.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature (°C)
              </label>
              <input
                type="number"
                value={eventForm.temperature}
                onChange={(e) => setEventForm({...eventForm, temperature: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="25.5"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type
              </label>
              <select
                value={eventForm.eventType}
                onChange={(e) => setEventForm({...eventForm, eventType: e.target.value as ShipmentEvent['eventType']})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pickup">Pickup</option>
                <option value="transit">Transit</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <MapPin className="w-4 h-4" />
              <span>{loading ? 'Adding Event...' : 'Add Event'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <Truck className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Active Shipments</p>
              <p className="text-2xl font-bold text-gray-800">
                {shipments.filter(s => ['pending', 'in_transit'].includes(s.status)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Compromised</p>
              <p className="text-2xl font-bold text-gray-800">
                {shipments.filter(s => s.status === 'compromised').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-800">
                {shipments.filter(s => ['delivered', 'confirmed'].includes(s.status)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <Thermometer className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-800">
                {shipments.reduce((sum, s) => sum + s.events.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Shipment Details */}
      <div className="space-y-4">
        {shipments.map((shipment) => (
          <div key={shipment.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{shipment.product.name}</h3>
                  <p className="text-sm text-gray-600">Shipment ID: {shipment.id}</p>
                  <p className="text-sm text-gray-600">
                    Required Temperature: {shipment.product.minTemperature}°C - {shipment.product.maxTemperature}°C
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shipment.status)}`}>
                    {shipment.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <p className="text-sm text-gray-600 mt-2">
                    Escrow: ₹{shipment.escrowAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Event Timeline */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-800 mb-3">Event Timeline</h4>
                {shipment.events.length === 0 ? (
                  <p className="text-gray-600 text-sm">No events reported yet</p>
                ) : (
                  <div className="space-y-3">
                    {shipment.events.map((event) => {
                      const tempOk = getTemperatureStatus(event, shipment);
                      return (
                        <div 
                          key={event.id} 
                          className={`p-3 rounded-lg border ${tempOk ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${tempOk ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <div>
                                <div className="flex items-center space-x-4 text-sm">
                                  <span className="font-medium">{event.location}</span>
                                  <span className="capitalize text-gray-600">{event.eventType}</span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                  <span>
                                    Reported: {event.temperature}°C | Verified: {event.verifiedTemperature}°C
                                  </span>
                                  {!tempOk && (
                                    <span className="text-red-600 font-medium">
                                      ⚠️ Temperature Alert
                                    </span>
                                  )}
                                </div>
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogisticsDashboard;