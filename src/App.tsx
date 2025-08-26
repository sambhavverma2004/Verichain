import React, { useState } from 'react';
import { UserRole } from './types/blockchain';
import RoleSelector from './components/RoleSelector';
import ManufacturerDashboard from './components/ManufacturerDashboard';
import LogisticsDashboard from './components/LogisticsDashboard';
import ConsumerDashboard from './components/ConsumerDashboard';
import { Shield, Link as LinkIcon } from 'lucide-react';

function App() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('manufacturer');

  const renderDashboard = () => {
    switch (selectedRole) {
      case 'manufacturer':
        return <ManufacturerDashboard />;
      case 'logistics':
        return <LogisticsDashboard />;
      case 'consumer':
        return <ConsumerDashboard />;
      default:
        return <div>Please select a role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-2 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Verichain
                </h1>
                <p className="text-sm text-gray-600">Decentralized Supply Chain on ICP • India</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <LinkIcon className="w-4 h-4" />
                <span>ICP Network • India</span>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Connected to ICP Network"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <RoleSelector 
            selectedRole={selectedRole} 
            onRoleChange={setSelectedRole} 
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {renderDashboard()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            <p>Verichain - Ensuring supply chain integrity through blockchain transparency</p>
            <p className="mt-1">
              Powered by Internet Computer Protocol • 
              <span className="ml-1">Smart Contracts in Motoko</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;