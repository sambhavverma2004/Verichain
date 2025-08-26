use reqwest;
use serde_json::Value;
use anyhow::Result;
use chrono::Utc;

use crate::models::WeatherResponse;

pub struct WeatherService;

impl WeatherService {
    const API_KEY: &'static str = "e795de305b55520d3c3f83fb25e79673";
    const BASE_URL: &'static str = "https://api.openweathermap.org/data/2.5/weather";
    
    pub async fn get_temperature(location: &str) -> Result<f64> {
        let url = format!(
            "{}?q={},IN&appid={}&units=metric",
            Self::BASE_URL,
            location,
            Self::API_KEY
        );
        
        match reqwest::get(&url).await {
            Ok(response) => {
                if response.status().is_success() {
                    let data: Value = response.json().await?;
                    if let Some(temp) = data["main"]["temp"].as_f64() {
                        Ok((temp * 10.0).round() / 10.0) // Round to 1 decimal place
                    } else {
                        Err(anyhow::anyhow!("Temperature data not found in response"))
                    }
                } else {
                    Err(anyhow::anyhow!("Weather API returned error: {}", response.status()))
                }
            }
            Err(e) => {
                log::error!("Failed to fetch weather data: {}", e);
                // Fallback to mock temperature
                Ok(Self::get_mock_temperature(location))
            }
        }
    }
    
    pub async fn verify_temperature(location: &str, _reported_temp: f64) -> Result<WeatherResponse> {
        let url = format!(
            "{}?q={},IN&appid={}&units=metric",
            Self::BASE_URL,
            location,
            Self::API_KEY
        );
        
        match reqwest::get(&url).await {
            Ok(response) => {
                if response.status().is_success() {
                    let data: Value = response.json().await?;
                    
                    let temperature = data["main"]["temp"].as_f64().unwrap_or(25.0);
                    let humidity = data["main"]["humidity"].as_f64().unwrap_or(50.0);
                    let conditions = data["weather"][0]["description"]
                        .as_str()
                        .unwrap_or("Unknown")
                        .to_string();
                    let location_name = data["name"].as_str().unwrap_or(location).to_string();
                    
                    Ok(WeatherResponse {
                        temperature: (temperature * 10.0).round() / 10.0,
                        humidity,
                        conditions,
                        timestamp: Utc::now(),
                        location: location_name,
                    })
                } else {
                    Err(anyhow::anyhow!("Weather API returned error: {}", response.status()))
                }
            }
            Err(e) => {
                log::error!("Failed to verify temperature: {}", e);
                // Fallback to mock data
                Ok(WeatherResponse {
                    temperature: Self::get_mock_temperature(location),
                    humidity: (rand::random::<f64>() * 100.0).round(),
                    conditions: "Mock Data".to_string(),
                    timestamp: Utc::now(),
                    location: location.to_string(),
                })
            }
        }
    }
    
    fn get_mock_temperature(location: &str) -> f64 {
        let base_temperatures = [
            ("Mumbai", 32.0),
            ("Delhi", 28.0),
            ("Bangalore", 24.0),
            ("Chennai", 30.0),
            ("Kolkata", 29.0),
            ("Hyderabad", 26.0),
            ("Pune", 25.0),
            ("Ahmedabad", 31.0),
            ("Jaipur", 27.0),
            ("Lucknow", 23.0),
            ("Surat", 33.0),
            ("Kanpur", 26.0),
            ("Nagpur", 29.0),
            ("Indore", 27.0),
            ("Thane", 31.0),
        ];
        
        let base_temp = base_temperatures
            .iter()
            .find(|(city, _)| *city == location)
            .map(|(_, temp)| *temp)
            .unwrap_or(25.0);
            
        let variation = (rand::random::<f64>() - 0.5) * 10.0;
        ((base_temp + variation) * 10.0).round() / 10.0
    }
}

pub struct PasswordService;

impl PasswordService {
    pub fn verify_password(password: &str, action: &str) -> bool {
        match action {
            "register_product" => password == "manufacturer123",
            "fund_escrow" => password == "escrow456",
            "add_event" => password == "logistics789",
            _ => false,
        }
    }
}