# Health ISIS - Disease Analytics Dashboard

A comprehensive healthcare analytics platform for tracking disease trends, forecasting outbreaks, and analyzing health data patterns.

## Features

- Disease tracking dashboard with interactive visualizations
- Predictive analytics for disease outbreak forecasting
- AI-powered natural language querying
- Advanced filtering and data correlation analysis
- Environmental factor correlation analysis

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Chart.js/D3.js for visualizations
- Material-UI for components
- React Query for data fetching
- Redux Toolkit for state management

### Backend
- Go for the main API server
- ClickHouse for data warehousing
- Python for ML/Analytics services
  - SARIMA for time series analysis
  - scikit-learn for machine learning
  - pandas for data manipulation

## Project Structure

```
.
├── backend/
│   ├── cmd/
│   │   └── api/           # Main application entry point
│   ├── internal/
│   │   ├── api/          # API handlers and middleware
│   │   ├── models/       # Data models
│   │   ├── database/     # Database interactions
│   │   └── services/     # Business logic
│   └── pkg/              # Shared packages
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client and services
│   │   ├── utils/        # Utility functions
│   │   ├── hooks/        # Custom React hooks
│   │   └── styles/       # Global styles and themes
│   └── public/           # Static assets
└── data/                 # Sample data and schemas
```

## Getting Started

### Prerequisites

- Go 1.21+
- Node.js 18+
- Python 3.9+
- ClickHouse server

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/healthisis.git
   cd healthisis
   ```

2. Set up the backend:
   ```bash
   cd backend
   go mod tidy
   go run cmd/api/main.go
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Set up the Python analytics service:
   ```bash
   cd analytics
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   python main.py
   ```

## API Documentation

The API is documented using OpenAPI 3.0. You can find the full specification in `openapi.yaml`.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 