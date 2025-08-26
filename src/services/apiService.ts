// Frontend API service to communicate with Rust backend
const API_BASE_URL = 'http://localhost:8080/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data.data as T;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Product endpoints
  async getProducts() {
    return this.request('/products');
  }

  async registerProduct(productData: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  // Shipment endpoints
  async getShipments() {
    return this.request('/shipments');
  }

  async fundEscrow(escrowData: any) {
    return this.request('/shipments', {
      method: 'POST',
      body: JSON.stringify(escrowData),
    });
  }

  async addEvent(shipmentId: string, eventData: any) {
    return this.request(`/shipments/${shipmentId}/events`, {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async confirmDelivery(shipmentId: string) {
    return this.request(`/shipments/${shipmentId}/confirm`, {
      method: 'POST',
    });
  }

  // User endpoints
  async getUsers() {
    return this.request('/users');
  }

  async getUserShipments(userId: string, role: string) {
    return this.request(`/users/${userId}/shipments?role=${role}`);
  }

  // Weather endpoint
  async getWeather(location: string) {
    return this.request(`/weather/${location}`);
  }

  // Authentication endpoint
  async verifyPassword(password: string, action: string) {
    return this.request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ password, action }),
    });
  }
}

export const apiService = new ApiService();