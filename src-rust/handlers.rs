use actix_web::{web, HttpResponse, Result};
use std::sync::Arc;
use chrono::Utc;
use uuid::Uuid;

use crate::models::*;
use crate::storage::Storage;
use crate::services::{WeatherService, PasswordService};

pub async fn get_products(storage: web::Data<Arc<Storage>>) -> Result<HttpResponse> {
    let products = storage.get_products();
    Ok(HttpResponse::Ok().json(ApiResponse::success(products)))
}

pub async fn register_product(
    storage: web::Data<Arc<Storage>>,
    req: web::Json<RegisterProductRequest>,
) -> Result<HttpResponse> {
    let product = Product {
        id: format!("prod-{}", Uuid::new_v4()),
        name: req.name.clone(),
        description: req.description.clone(),
        manufacturer: req.manufacturer.clone(),
        min_temperature: req.min_temperature,
        max_temperature: req.max_temperature,
        logistics_partner: req.logistics_partner.clone(),
        registered_at: Utc::now(),
    };
    
    match storage.add_product(product) {
        Ok(product) => Ok(HttpResponse::Ok().json(ApiResponse::success(product))),
        Err(e) => Ok(HttpResponse::BadRequest().json(ApiResponse::<()>::error(e))),
    }
}

pub async fn get_shipments(storage: web::Data<Arc<Storage>>) -> Result<HttpResponse> {
    let shipments = storage.get_shipments();
    Ok(HttpResponse::Ok().json(ApiResponse::success(shipments)))
}

pub async fn fund_escrow(
    storage: web::Data<Arc<Storage>>,
    req: web::Json<FundEscrowRequest>,
) -> Result<HttpResponse> {
    let product = match storage.get_product(&req.product_id) {
        Some(product) => product,
        None => {
            return Ok(HttpResponse::NotFound().json(ApiResponse::<()>::error("Product not found".to_string())));
        }
    };
    
    let shipment = Shipment {
        id: format!("ship-{}", Uuid::new_v4()),
        product_id: req.product_id.clone(),
        product: product.clone(),
        manufacturer: product.manufacturer,
        logistics_partner: product.logistics_partner,
        consumer: req.consumer.clone(),
        status: ShipmentStatus::Pending,
        escrow_amount: req.escrow_amount,
        escrow_released: false,
        events: vec![],
        created_at: Utc::now(),
        delivered_at: None,
        confirmed_at: None,
    };
    
    match storage.add_shipment(shipment) {
        Ok(shipment) => Ok(HttpResponse::Ok().json(ApiResponse::success(shipment))),
        Err(e) => Ok(HttpResponse::BadRequest().json(ApiResponse::<()>::error(e))),
    }
}

pub async fn add_event(
    storage: web::Data<Arc<Storage>>,
    path: web::Path<String>,
    req: web::Json<AddEventRequest>,
) -> Result<HttpResponse> {
    let shipment_id = path.into_inner();
    
    let mut shipment = match storage.get_shipment(&shipment_id) {
        Some(shipment) => shipment,
        None => {
            return Ok(HttpResponse::NotFound().json(ApiResponse::<()>::error("Shipment not found".to_string())));
        }
    };
    
    // Verify temperature with weather API
    let weather_data = match WeatherService::verify_temperature(&req.location, req.temperature).await {
        Ok(data) => data,
        Err(e) => {
            log::error!("Weather verification failed: {}", e);
            return Ok(HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Weather verification failed".to_string())));
        }
    };
    
    // Check if temperature is within acceptable range
    let is_temperature_valid = weather_data.temperature >= shipment.product.min_temperature
        && weather_data.temperature <= shipment.product.max_temperature;
    
    let event = ShipmentEvent {
        id: format!("event-{}", Uuid::new_v4()),
        timestamp: Utc::now(),
        location: req.location.clone(),
        temperature: req.temperature,
        verified_temperature: weather_data.temperature,
        reporter: req.reporter.clone(),
        event_type: req.event_type.clone(),
        is_temperature_valid,
    };
    
    shipment.events.push(event.clone());
    
    // Update shipment status based on temperature validation
    if !is_temperature_valid && !matches!(shipment.status, ShipmentStatus::Compromised) {
        shipment.status = ShipmentStatus::Compromised;
    } else if matches!(req.event_type, EventType::Delivery) && !matches!(shipment.status, ShipmentStatus::Compromised) {
        shipment.status = ShipmentStatus::Delivered;
        shipment.delivered_at = Some(Utc::now());
    } else if matches!(shipment.status, ShipmentStatus::Pending) {
        shipment.status = ShipmentStatus::InTransit;
    }
    
    match storage.update_shipment(shipment.clone()) {
        Ok(_) => Ok(HttpResponse::Ok().json(ApiResponse::success(shipment))),
        Err(e) => Ok(HttpResponse::BadRequest().json(ApiResponse::<()>::error(e))),
    }
}

pub async fn confirm_delivery(
    storage: web::Data<Arc<Storage>>,
    path: web::Path<String>,
) -> Result<HttpResponse> {
    let shipment_id = path.into_inner();
    
    let mut shipment = match storage.get_shipment(&shipment_id) {
        Some(shipment) => shipment,
        None => {
            return Ok(HttpResponse::NotFound().json(ApiResponse::<()>::error("Shipment not found".to_string())));
        }
    };
    
    if !matches!(shipment.status, ShipmentStatus::Delivered) {
        return Ok(HttpResponse::BadRequest().json(ApiResponse::<()>::error("Shipment must be delivered before confirmation".to_string())));
    }
    
    // Release escrow funds
    shipment.escrow_released = true;
    shipment.status = ShipmentStatus::Confirmed;
    shipment.confirmed_at = Some(Utc::now());
    
    match storage.update_shipment(shipment.clone()) {
        Ok(_) => Ok(HttpResponse::Ok().json(ApiResponse::success(shipment))),
        Err(e) => Ok(HttpResponse::BadRequest().json(ApiResponse::<()>::error(e))),
    }
}

pub async fn get_users(storage: web::Data<Arc<Storage>>) -> Result<HttpResponse> {
    let users = storage.get_users();
    Ok(HttpResponse::Ok().json(ApiResponse::success(users)))
}

pub async fn get_user_shipments(
    storage: web::Data<Arc<Storage>>,
    path: web::Path<String>,
    query: web::Query<std::collections::HashMap<String, String>>,
) -> Result<HttpResponse> {
    let user_id = path.into_inner();
    let role = query.get("role").unwrap_or(&"".to_string()).clone();
    
    let shipments = storage.get_shipments_by_user(&user_id, &role);
    Ok(HttpResponse::Ok().json(ApiResponse::success(shipments)))
}

pub async fn get_weather(path: web::Path<String>) -> Result<HttpResponse> {
    let location = path.into_inner();
    
    match WeatherService::get_temperature(&location).await {
        Ok(temperature) => {
            let weather = WeatherResponse {
                temperature,
                humidity: 0.0, // Simplified for this endpoint
                conditions: "Current".to_string(),
                timestamp: Utc::now(),
                location,
            };
            Ok(HttpResponse::Ok().json(ApiResponse::success(weather)))
        }
        Err(e) => Ok(HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string()))),
    }
}

pub async fn verify_password(req: web::Json<VerifyPasswordRequest>) -> Result<HttpResponse> {
    let is_valid = PasswordService::verify_password(&req.password, &req.action);
    
    let response = VerifyPasswordResponse {
        valid: is_valid,
        message: if is_valid {
            "Password verified successfully".to_string()
        } else {
            "Invalid password".to_string()
        },
    };
    
    Ok(HttpResponse::Ok().json(response))
}