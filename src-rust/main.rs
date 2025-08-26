use actix_web::{web, App, HttpServer, Result, HttpResponse, middleware::Logger};
use actix_cors::Cors;
use std::sync::Arc;

mod models;
mod services;
mod handlers;
mod storage;

use storage::Storage;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    
    // Initialize storage
    let storage = Arc::new(Storage::new());
    
    // Initialize with mock data
    storage.initialize_mock_data().await;
    
    println!("🚀 Verichain Rust Backend starting on http://localhost:8080");
    
    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);
            
        App::new()
            .app_data(web::Data::new(storage.clone()))
            .wrap(cors)
            .wrap(Logger::default())
            .service(
                web::scope("/api")
                    // Product routes
                    .route("/products", web::get().to(handlers::get_products))
                    .route("/products", web::post().to(handlers::register_product))
                    
                    // Shipment routes
                    .route("/shipments", web::get().to(handlers::get_shipments))
                    .route("/shipments", web::post().to(handlers::fund_escrow))
                    .route("/shipments/{id}/events", web::post().to(handlers::add_event))
                    .route("/shipments/{id}/confirm", web::post().to(handlers::confirm_delivery))
                    
                    // User routes
                    .route("/users", web::get().to(handlers::get_users))
                    .route("/users/{id}/shipments", web::get().to(handlers::get_user_shipments))
                    
                    // Weather route
                    .route("/weather/{location}", web::get().to(handlers::get_weather))
                    
                    // Authentication routes
                    .route("/auth/verify", web::post().to(handlers::verify_password))
            )
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}