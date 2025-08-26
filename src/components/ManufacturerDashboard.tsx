import React, { useState, useEffect } from 'react';
import { Product, Shipment } from '../types/blockchain';
import { blockchainService } from '../services/blockchainService';
import { Package, DollarSign, Plus, AlertCircle, Lock } from 'lucide-react';

const ManufacturerDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showEscrowForm, setShowEscrowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Password states
  const [showProductPassword, setShowProductPassword] = useState(false);
  const [showEscrowPassword, setShowEscrowPassword] = useState(false);
  const [productPassword, setProductPassword] = useState('');
  const [escrowPassword, setEscrowPassword] = useState('');

  // Predefined passwords (in real app, these would be hashed and stored securely)
  const PRODUCT_PASSWORD = 'manufacturer123';
  const ESCROW_PASSWORD = 'escrow456';

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    minTemperature: '',
    maxTemperature: '',
    logisticsPartner: 'logi-001'
  });

  const [escrowForm, setEscrowForm] = useState({
    consumer: 'cons-001',
    escrowAmount: ''
  });

  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, []);

  const loadData = async () => {
    const allProducts = await blockchainService.getAllProducts();
    const manufacturerProducts = allProducts.filter(p => p.manufacturer === 'manu-001');
    const manufacturerShipments = await blockchainService.getShipmentsByUser('manu-001', 'manufacturer');
    
    setProducts(manufacturerProducts);
    setShipments(manufacturerShipments);
  };

  const handleProductPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productPassword === PRODUCT_PASSWORD) {
      setShowProductPassword(false);
      setShowProductForm(true);
      setProductPassword('');
    } else {
      alert('Incorrect password. Please try again.');
      setProductPassword('');
    }
  };

  const handleEscrowPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (escrowPassword === ESCROW_PASSWORD) {
      setShowEscrowPassword(false);
      setShowEscrowForm(true);
      setEscrowPassword('');
    } else {
      alert('Incorrect password. Please try again.');
      setEscrowPassword('');
    }
  };

  const handleRegisterProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.description) return;

    setLoading(true);
    try {
      await blockchainService.registerProduct({
        name: productForm.name,
        description: productForm.description,
        manufacturer: 'manu-001',
        minTemperature: parseFloat(productForm.minTemperature),
        maxTemperature: parseFloat(productForm.maxTemperature),
        logisticsPartner: productForm.logisticsPartner
      });

      setProductForm({
        name: '',
        description: '',
        minTemperature: '',
        maxTemperature: '',
        logisticsPartner: 'logi-001'
      });
      setShowProductForm(false);
      await loadData();
    } catch (error) {
      console.error('Failed to register product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFundEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !escrowForm.escrowAmount) return;

    setLoading(true);
    try {
      await blockchainService.fundEscrow(
        selectedProduct,
        escrowForm.consumer,
        parseFloat(escrowForm.escrowAmount)
      );

      setEscrowForm({
        consumer: 'cons-001',
        escrowAmount: ''
      });
      setSelectedProduct('');
      setShowEscrowForm(false);
      await loadData();
    } catch (error) {
      console.error('Failed to fund escrow:', error);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Manufacturer Dashboard</h2>
        <div className="flex space-x-6">
          <button
            onClick={() => setShowProductPassword(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register Product</span>
          </button>
          <button
            onClick={() => setShowEscrowPassword(true)}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2"
          >
            <DollarSign className="w-4 h-4" />
            <span>Fund Escrow</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-800">{products.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-teal-600" />
            <div>
              <p className="text-sm text-gray-600">Active Shipments</p>
              <p className="text-2xl font-bold text-gray-800">{shipments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Compromised</p>
              <p className="text-2xl font-bold text-gray-800">
                {shipments.filter(s => s.status === 'compromised').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Password Modal */}
      {showProductPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Authentication Required</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Please enter the manufacturer password to register a new product.
            </p>
            <form onSubmit={handleProductPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={productPassword}
                  onChange={(e) => setProductPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter manufacturer password"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductPassword(false);
                    setProductPassword('');
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Authenticate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Escrow Password Modal */}
      {showEscrowPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-6 h-6 text-teal-600" />
              <h3 className="text-lg font-semibold">Authentication Required</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Please enter the escrow password to fund a new shipment.
            </p>
            <form onSubmit={handleEscrowPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={escrowPassword}
                  onChange={(e) => setEscrowPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter escrow password"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEscrowPassword(false);
                    setEscrowPassword('');
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Authenticate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Registration Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Register New Product</h3>
            <form onSubmit={handleRegisterProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Temperature (°C)
                  </label>
                  <input
                    type="number"
                    value={productForm.minTemperature}
                    onChange={(e) => setProductForm({...productForm, minTemperature: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Temperature (°C)
                  </label>
                  <input
                    type="number"
                    value={productForm.maxTemperature}
                    onChange={(e) => setProductForm({...productForm, maxTemperature: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Escrow Funding Form Modal */}
      {showEscrowForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Fund Escrow for Shipment</h3>
            <form onSubmit={handleFundEscrow} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Product
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a product...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Escrow Amount (₹)
                </label>
                <input
                  type="number"
                  value={escrowForm.escrowAmount}
                  onChange={(e) => setEscrowForm({...escrowForm, escrowAmount: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50000"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEscrowForm(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Fund Escrow'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registered Products */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Registered Products</h3>
          {products.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No products registered yet</p>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{product.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                      <div className="mt-2 text-sm text-gray-600">
                        <span>Temperature Range: {product.minTemperature}°C - {product.maxTemperature}°C</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">
                        Registered: {new Date(product.registeredAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Shipments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Shipments</h3>
          {shipments.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No active shipments</p>
          ) : (
            <div className="space-y-4">
              {shipments.map((shipment) => (
                <div key={shipment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{shipment.product.name}</h4>
                      <p className="text-sm text-gray-600">Shipment ID: {shipment.id}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                          {shipment.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-gray-600">
                          Escrow: ₹{shipment.escrowAmount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-gray-600">
                          Events: {shipment.events.length}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">
                        Created: {new Date(shipment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManufacturerDashboard;