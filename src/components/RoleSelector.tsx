import React from 'react';
import { UserRole } from '../types/blockchain';
import { Package, Truck, ShoppingCart } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onRoleChange }) => {
  const roles = [
    {
      id: 'manufacturer' as UserRole,
      name: 'Manufacturer',
      icon: Package,
      description: 'Register products and fund escrow'
    },
    {
      id: 'logistics' as UserRole,
      name: 'Logistics Partner',
      icon: Truck,
      description: 'Report events and track shipments'
    },
    {
      id: 'consumer' as UserRole,
      name: 'Consumer/Retailer',
      icon: ShoppingCart,
      description: 'Track shipments and confirm delivery'
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Select User Role</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role) => {
          const IconComponent = role.icon;
          const isSelected = selectedRole === role.id;
          
          return (
            <button
              key={role.id}
              onClick={() => onRoleChange(role.id)}
              className={`p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                isSelected
                  ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-teal-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-center space-y-3">
                <IconComponent 
                  className={`w-10 h-10 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} 
                />
                <h3 className={`font-semibold text-lg ${isSelected ? 'text-blue-800' : 'text-gray-800'}`}>
                  {role.name}
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  {role.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;