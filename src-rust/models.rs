use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Product {
    pub id: String,
    pub name: String,
    pub description: String,
    pub manufacturer: String,
    pub min_temperature: f64,
    pub max_temperature: f64,
    pub logistics_partner: String,
    pub registered_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShipmentEvent {
    pub id: String,
    pub timestamp: DateTime<Utc>,
    pub location: String,
    pub temperature: f64,
    pub verified_temperature: f64,
    pub reporter: String,
    pub event_type: EventType,
    pub is_temperature_valid: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EventType {
    Pickup,
    Transit,
    Delivery,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Shipment {
    pub id: String,
    pub product_id: String,
    pub product: Product,
    pub manufacturer: String,
    pub logistics_partner: String,
    pub consumer: String,
    pub status: ShipmentStatus,
    pub escrow_amount: f64,
    pub escrow_released: bool,
    pub events: Vec<ShipmentEvent>,
    pub created_at: DateTime<Utc>,
    pub delivered_at: Option<DateTime<Utc>>,
    pub confirmed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ShipmentStatus {
    Pending,
    InTransit,
    Compromised,
    Delivered,
    Confirmed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub name: String,
    pub role: UserRole,
    pub address: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum UserRole {
    Manufacturer,
    Logistics,
    Consumer,
}

// Request/Response DTOs
#[derive(Debug, Deserialize)]
pub struct RegisterProductRequest {
    pub name: String,
    pub description: String,
    pub manufacturer: String,
    pub min_temperature: f64,
    pub max_temperature: f64,
    pub logistics_partner: String,
}

#[derive(Debug, Deserialize)]
pub struct FundEscrowRequest {
    pub product_id: String,
    pub consumer: String,
    pub escrow_amount: f64,
}

#[derive(Debug, Deserialize)]
pub struct AddEventRequest {
    pub location: String,
    pub temperature: f64,
    pub event_type: EventType,
    pub reporter: String,
}

#[derive(Debug, Deserialize)]
pub struct VerifyPasswordRequest {
    pub password: String,
    pub action: String,
}

#[derive(Debug, Serialize)]
pub struct VerifyPasswordResponse {
    pub valid: bool,
    pub message: String,
}

#[derive(Debug, Serialize)]
pub struct WeatherResponse {
    pub temperature: f64,
    pub humidity: f64,
    pub conditions: String,
    pub timestamp: DateTime<Utc>,
    pub location: String,
}

#[derive(Debug, Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub message: String,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            message: "Success".to_string(),
        }
    }
    
    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data: None,
            message,
        }
    }
}