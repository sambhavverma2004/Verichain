use dashmap::DashMap;
use std::sync::Arc;
use chrono::Utc;
use uuid::Uuid;

use crate::models::{Product, Shipment, User, UserRole, ShipmentStatus};

#[derive(Debug)]
pub struct Storage {
    pub products: Arc<DashMap<String, Product>>,
    pub shipments: Arc<DashMap<String, Shipment>>,
    pub users: Arc<DashMap<String, User>>,
}

impl Storage {
    pub fn new() -> Self {
        Self {
            products: Arc::new(DashMap::new()),
            shipments: Arc::new(DashMap::new()),
            users: Arc::new(DashMap::new()),
        }
    }
    
    pub async fn initialize_mock_data(&self) {
        // Create mock users
        let manufacturer = User {
            id: "manu-001".to_string(),
            name: "TechCorp Manufacturing".to_string(),
            role: UserRole::Manufacturer,
            address: "0x1234...abcd".to_string(),
        };
        
        let logistics = User {
            id: "logi-001".to_string(),
            name: "FastTrack Logistics".to_string(),
            role: UserRole::Logistics,
            address: "0x5678...efgh".to_string(),
        };
        
        let consumer = User {
            id: "cons-001".to_string(),
            name: "Global Retail Chain".to_string(),
            role: UserRole::Consumer,
            address: "0x9012...ijkl".to_string(),
        };
        
        self.users.insert(manufacturer.id.clone(), manufacturer.clone());
        self.users.insert(logistics.id.clone(), logistics.clone());
        self.users.insert(consumer.id.clone(), consumer.clone());
        
        // Create mock product
        let product = Product {
            id: "prod-001".to_string(),
            name: "Temperature-Sensitive Medication".to_string(),
            description: "Critical pharmaceutical requiring cold chain maintenance".to_string(),
            manufacturer: manufacturer.id.clone(),
            min_temperature: 2.0,
            max_temperature: 8.0,
            logistics_partner: logistics.id.clone(),
            registered_at: Utc::now(),
        };
        
        self.products.insert(product.id.clone(), product.clone());
        
        // Create mock shipment
        let shipment = Shipment {
            id: "ship-001".to_string(),
            product_id: product.id.clone(),
            product: product.clone(),
            manufacturer: manufacturer.id,
            logistics_partner: logistics.id,
            consumer: consumer.id,
            status: ShipmentStatus::Pending,
            escrow_amount: 50000.0,
            escrow_released: false,
            events: vec![],
            created_at: Utc::now(),
            delivered_at: None,
            confirmed_at: None,
        };
        
        self.shipments.insert(shipment.id.clone(), shipment);
        
        println!("✅ Mock data initialized successfully");
    }
    
    pub fn get_products(&self) -> Vec<Product> {
        self.products.iter().map(|entry| entry.value().clone()).collect()
    }
    
    pub fn get_shipments(&self) -> Vec<Shipment> {
        self.shipments.iter().map(|entry| entry.value().clone()).collect()
    }
    
    pub fn get_users(&self) -> Vec<User> {
        self.users.iter().map(|entry| entry.value().clone()).collect()
    }
    
    pub fn get_shipments_by_user(&self, user_id: &str, role: &str) -> Vec<Shipment> {
        self.shipments
            .iter()
            .filter_map(|entry| {
                let shipment = entry.value();
                match role {
                    "manufacturer" => {
                        if shipment.manufacturer == user_id {
                            Some(shipment.clone())
                        } else {
                            None
                        }
                    }
                    "logistics" => {
                        if shipment.logistics_partner == user_id {
                            Some(shipment.clone())
                        } else {
                            None
                        }
                    }
                    "consumer" => {
                        if shipment.consumer == user_id {
                            Some(shipment.clone())
                        } else {
                            None
                        }
                    }
                    _ => None,
                }
            })
            .collect()
    }
    
    pub fn add_product(&self, product: Product) -> Result<Product, String> {
        self.products.insert(product.id.clone(), product.clone());
        Ok(product)
    }
    
    pub fn add_shipment(&self, shipment: Shipment) -> Result<Shipment, String> {
        self.shipments.insert(shipment.id.clone(), shipment.clone());
        Ok(shipment)
    }
    
    pub fn update_shipment(&self, shipment: Shipment) -> Result<Shipment, String> {
        self.shipments.insert(shipment.id.clone(), shipment.clone());
        Ok(shipment)
    }
    
    pub fn get_product(&self, id: &str) -> Option<Product> {
        self.products.get(id).map(|entry| entry.value().clone())
    }
    
    pub fn get_shipment(&self, id: &str) -> Option<Shipment> {
        self.shipments.get(id).map(|entry| entry.value().clone())
    }
}