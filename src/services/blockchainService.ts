import { Product, Shipment, ShipmentEvent, User } from '../types/blockchain';
import { apiService } from './apiService';

// Updated blockchain service to use Rust backend API
class BlockchainService {
  private products: Map<string, Product> = new Map();
  private shipments: Map<string, Shipment> = new Map();
  private users: Map<string, User> = new Map();
  private useBackend: boolean = true; // Toggle to use backend or fallback to mock

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Keep mock data as fallback
    const manufacturer: User = {
      id: 'manu-001',
      name: 'TechCorp Manufacturing',
      role: 'manufacturer',
      address: '0x1234...abcd'
    };

    const logistics: User = {
      id: 'logi-001',
      name: 'FastTrack Logistics',
      role: 'logistics',
      address: '0x5678...efgh'
    };

    const consumer: User = {
      id: 'cons-001',
      name: 'Global Retail Chain',
      role: 'consumer',
      address: '0x9012...ijkl'
    };

    this.users.set(manufacturer.id, manufacturer);
    this.users.set(logistics.id, logistics);
    this.users.set(consumer.id, consumer);

    const product: Product = {
      id: 'prod-001',
      name: 'Temperature-Sensitive Medication',
      description: 'Critical pharmaceutical requiring cold chain maintenance',
      manufacturer: manufacturer.id,
      minTemperature: 2,
      maxTemperature: 8,
      logisticsPartner: logistics.id,
      registeredAt: Date.now() - 86400000
    };

    this.products.set(product.id, product);

    const shipment: Shipment = {
      id: 'ship-001',
      productId: product.id,
      product,
      manufacturer: manufacturer.id,
      logisticsPartner: logistics.id,
      consumer: consumer.id,
      status: 'in_transit',
      escrowAmount: 50000,
      escrowReleased: false,
      events: [
        {
          id: 'event-001',
          timestamp: Date.now() - 43200000,
          location: 'Mumbai',
          temperature: 4,
          verifiedTemperature: 4.2,
          reporter: logistics.id,
          eventType: 'pickup',
          isTemperatureValid: true
        },
        {
          id: 'event-002',
          timestamp: Date.now() - 21600000,
          location: 'Delhi',
          temperature: 5,
          verifiedTemperature: 5.1,
          reporter: logistics.id,
          eventType: 'transit',
          isTemperatureValid: true
        }
      ],
      createdAt: Date.now() - 43200000
    };

    this.shipments.set(shipment.id, shipment);
  }

  // Convert backend data format to frontend format
  private convertBackendProduct(backendProduct: any): Product {
    return {
      id: backendProduct.id,
      name: backendProduct.name,
      description: backendProduct.description,
      manufacturer: backendProduct.manufacturer,
      minTemperature: backendProduct.min_temperature,
      maxTemperature: backendProduct.max_temperature,
      logisticsPartner: backendProduct.logistics_partner,
      registeredAt: new Date(backendProduct.registered_at).getTime()
    };
  }

  private convertBackendShipment(backendShipment: any): Shipment {
    return {
      id: backendShipment.id,
      productId: backendShipment.product_id,
      product: this.convertBackendProduct(backendShipment.product),
      manufacturer: backendShipment.manufacturer,
      logisticsPartner: backendShipment.logistics_partner,
      consumer: backendShipment.consumer,
      status: backendShipment.status.toLowerCase().replace('_', '_') as any,
      escrowAmount: backendShipment.escrow_amount,
      escrowReleased: backendShipment.escrow_released,
      events: backendShipment.events.map((event: any) => ({
        id: event.id,
        timestamp: new Date(event.timestamp).getTime(),
        location: event.location,
        temperature: event.temperature,
        verifiedTemperature: event.verified_temperature,
        reporter: event.reporter,
        eventType: event.event_type.toLowerCase() as any,
        isTemperatureValid: event.is_temperature_valid
      })),
      createdAt: new Date(backendShipment.created_at).getTime(),
      deliveredAt: backendShipment.delivered_at ? new Date(backendShipment.delivered_at).getTime() : undefined,
      confirmedAt: backendShipment.confirmed_at ? new Date(backendShipment.confirmed_at).getTime() : undefined
    };
  }

  // Manufacturer functions
  async registerProduct(productData: Omit<Product, 'id' | 'registeredAt'>): Promise<Product> {
    if (this.useBackend) {
      try {
        const backendData = {
          name: productData.name,
          description: productData.description,
          manufacturer: productData.manufacturer,
          min_temperature: productData.minTemperature,
          max_temperature: productData.maxTemperature,
          logistics_partner: productData.logisticsPartner
        };
        
        const result = await apiService.registerProduct(backendData);
        return this.convertBackendProduct(result);
      } catch (error) {
        console.error('Backend call failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    // Fallback to mock implementation
    const product: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      registeredAt: Date.now()
    };

    this.products.set(product.id, product);
    return product;
  }

  async fundEscrow(productId: string, consumer: string, escrowAmount: number): Promise<Shipment> {
    if (this.useBackend) {
      try {
        const escrowData = {
          product_id: productId,
          consumer,
          escrow_amount: escrowAmount
        };
        
        const result = await apiService.fundEscrow(escrowData);
        return this.convertBackendShipment(result);
      } catch (error) {
        console.error('Backend call failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    // Fallback to mock implementation
    const product = this.products.get(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const shipment: Shipment = {
      id: `ship-${Date.now()}`,
      productId,
      product,
      manufacturer: product.manufacturer,
      logisticsPartner: product.logisticsPartner,
      consumer,
      status: 'pending',
      escrowAmount,
      escrowReleased: false,
      events: [],
      createdAt: Date.now()
    };

    this.shipments.set(shipment.id, shipment);
    return shipment;
  }

  // Logistics partner function
  async addEvent(
    shipmentId: string,
    location: string,
    reportedTemperature: number,
    eventType: ShipmentEvent['eventType'],
    reporter: string
  ): Promise<{ event: ShipmentEvent; shipmentUpdated: Shipment }> {
    if (this.useBackend) {
      try {
        const eventData = {
          location,
          temperature: reportedTemperature,
          event_type: eventType,
          reporter
        };
        
        const result = await apiService.addEvent(shipmentId, eventData);
        const shipmentUpdated = this.convertBackendShipment(result);
        const event = shipmentUpdated.events[shipmentUpdated.events.length - 1];
        
        return { event, shipmentUpdated };
      } catch (error) {
        console.error('Backend call failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    // Fallback to mock implementation
    const shipment = this.shipments.get(shipmentId);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    // Mock weather verification
    const mockTemp = 25 + (Math.random() - 0.5) * 10;
    const isTemperatureValid = 
      mockTemp >= shipment.product.minTemperature &&
      mockTemp <= shipment.product.maxTemperature;

    const event: ShipmentEvent = {
      id: `event-${Date.now()}`,
      timestamp: Date.now(),
      location,
      temperature: reportedTemperature,
      verifiedTemperature: mockTemp,
      reporter,
      eventType,
      isTemperatureValid
    };

    shipment.events.push(event);

    if (!isTemperatureValid && shipment.status !== 'compromised') {
      shipment.status = 'compromised';
    } else if (eventType === 'delivery' && shipment.status !== 'compromised') {
      shipment.status = 'delivered';
      shipment.deliveredAt = Date.now();
    } else if (shipment.status === 'pending') {
      shipment.status = 'in_transit';
    }

    this.shipments.set(shipmentId, shipment);
    return { event, shipmentUpdated: shipment };
  }

  // Consumer function
  async confirmDelivery(shipmentId: string): Promise<Shipment> {
    if (this.useBackend) {
      try {
        const result = await apiService.confirmDelivery(shipmentId);
        return this.convertBackendShipment(result);
      } catch (error) {
        console.error('Backend call failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    // Fallback to mock implementation
    const shipment = this.shipments.get(shipmentId);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    if (shipment.status !== 'delivered') {
      throw new Error('Shipment must be delivered before confirmation');
    }

    shipment.escrowReleased = true;
    shipment.status = 'confirmed';
    shipment.confirmedAt = Date.now();

    this.shipments.set(shipmentId, shipment);
    return shipment;
  }

  // Query functions
  async getAllProducts(): Promise<Product[]> {
    if (this.useBackend) {
      try {
        const result = await apiService.getProducts();
        return result.map((p: any) => this.convertBackendProduct(p));
      } catch (error) {
        console.error('Backend call failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    return Array.from(this.products.values());
  }

  async getAllShipments(): Promise<Shipment[]> {
    if (this.useBackend) {
      try {
        const result = await apiService.getShipments();
        return result.map((s: any) => this.convertBackendShipment(s));
      } catch (error) {
        console.error('Backend call failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    return Array.from(this.shipments.values());
  }

  async getShipmentsByUser(userId: string, role: string): Promise<Shipment[]> {
    if (this.useBackend) {
      try {
        const result = await apiService.getUserShipments(userId, role);
        return result.map((s: any) => this.convertBackendShipment(s));
      } catch (error) {
        console.error('Backend call failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    return Array.from(this.shipments.values()).filter(shipment => {
      switch (role) {
        case 'manufacturer':
          return shipment.manufacturer === userId;
        case 'logistics':
          return shipment.logisticsPartner === userId;
        case 'consumer':
          return shipment.consumer === userId;
        default:
          return false;
      }
    });
  }

  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getShipment(shipmentId: string): Shipment | undefined {
    return this.shipments.get(shipmentId);
  }

  // Password verification
  async verifyPassword(password: string, action: string): Promise<boolean> {
    if (this.useBackend) {
      try {
        const result = await apiService.verifyPassword(password, action);
        return result.valid;
      } catch (error) {
        console.error('Backend password verification failed:', error);
      }
    }

    // Fallback to local verification
    const passwords: Record<string, string> = {
      'register_product': 'manufacturer123',
      'fund_escrow': 'escrow456',
      'add_event': 'logistics789'
    };

    return passwords[action] === password;
  }
}

export const blockchainService = new BlockchainService();