# Verichain - Decentralized Supply Chain dApp

A comprehensive supply chain management application built with React.js frontend and Rust backend, simulating blockchain functionality on the Internet Computer Protocol (ICP).

## 🚀 Features

- **Product Registration**: Manufacturers can register temperature-sensitive products
- **Escrow Management**: Automated escrow system for secure payments
- **Real-time Tracking**: Live shipment tracking with temperature monitoring
- **Weather Verification**: Integration with OpenWeather API for temperature validation
- **QR Code Generation**: Scannable QR codes with complete shipment data
- **Role-based Dashboards**: Separate interfaces for manufacturers, logistics, and consumers
- **Password Protection**: Secure authentication for sensitive operations

## 🏗️ Architecture

### Frontend (React.js + TypeScript)
- **React Components**: Role-based dashboards and interactive UI
- **TypeScript**: Type-safe development with comprehensive interfaces
- **Tailwind CSS**: Modern, responsive styling
- **Lucide React**: Consistent icon system

### Backend (Rust + Actix-web)
- **Actix-web**: High-performance web framework
- **Real-time API**: RESTful endpoints for all operations
- **OpenWeather Integration**: Live temperature verification
- **In-memory Storage**: DashMap for concurrent data access
- **Password Authentication**: Secure operation validation

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Rust (latest stable version)
- npm or yarn

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to Rust backend
cd src-rust

# Install dependencies and run
cargo run
```

### Full Stack Development
```bash
# Run both frontend and backend concurrently
npm run dev:full
```

## 📡 API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Register new product

### Shipments
- `GET /api/shipments` - Get all shipments
- `POST /api/shipments` - Fund escrow for shipment
- `POST /api/shipments/{id}/events` - Add shipment event
- `POST /api/shipments/{id}/confirm` - Confirm delivery

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}/shipments` - Get user's shipments

### Weather & Auth
- `GET /api/weather/{location}` - Get weather data
- `POST /api/auth/verify` - Verify password

## 🔐 Password System

The application uses password protection for sensitive operations:

- **Product Registration**: `manufacturer123`
- **Escrow Funding**: `escrow456`
- **Event Reporting**: `logistics789`

## 🌡️ Temperature Monitoring

The system integrates with OpenWeather API to verify reported temperatures:

1. **Event Reporting**: Logistics partners report temperature and location
2. **API Verification**: System calls OpenWeather API for actual temperature
3. **Automatic Flagging**: Shipments are automatically marked as compromised if temperature is out of range
4. **Audit Trail**: All temperature data is permanently recorded

## 📱 QR Code System

Each shipment generates a comprehensive QR code containing:

```json
{
  "platform": "Verichain",
  "blockchain": "Internet Computer Protocol",
  "shipment": {
    "id": "ship-001",
    "product": { "name": "...", "temperatureRange": {...} },
    "status": "in_transit",
    "escrow": { "amount": 50000, "currency": "INR" },
    "events": [...]
  }
}
```

## 🏛️ Blockchain Simulation

The application simulates ICP/Motoko functionality:

- **Immutable Records**: All events are permanently stored
- **Smart Contract Logic**: Automated status updates and escrow release
- **HTTP Outcalls**: Weather API integration simulates external data calls
- **Decentralized Storage**: Data persistence across user sessions

## 🎨 UI/UX Features

- **Role-based Interfaces**: Tailored dashboards for each user type
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Updates**: Live data synchronization
- **Professional Styling**: Modern design with smooth animations
- **Indian Localization**: Rupee currency and Indian cities

## 🔧 Development

### Project Structure
```
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── services/          # API and business logic
│   └── types/             # TypeScript definitions
├── src-rust/              # Rust backend
│   ├── handlers.rs        # API route handlers
│   ├── models.rs          # Data structures
│   ├── services.rs        # Business logic
│   └── storage.rs         # Data storage
└── Cargo.toml            # Rust dependencies
```

### Key Technologies
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Rust, Actix-web, Tokio, Serde
- **APIs**: OpenWeather API for temperature verification
- **Storage**: In-memory with DashMap for concurrency

## 🚀 Deployment

The application can be deployed as:
- **Frontend**: Static hosting (Netlify, Vercel, etc.)
- **Backend**: Cloud platforms (AWS, GCP, Azure)
- **Full Stack**: Docker containers for easy deployment

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or support, please open an issue on GitHub or contact the development team.