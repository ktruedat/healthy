# Health ISIS - Frontend Development Plan

This document outlines the frontend implementation plan for the Health ISIS disease analytics dashboard using Next.js with App Router and Shadcn UI.

## Project Structure

### [fe-plan.md](file:///Users/ktruedat/Projects/healthisis/frontend/fe-plan.md)

```markdown
# Health ISIS - Frontend Development Plan

This document outlines the frontend implementation plan for the Health ISIS disease analytics dashboard using Next.js with App Router and Shadcn UI (npx shadcn@latest init, not shadcn-ui because shadcn-ui is deprecated).

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx                   # Landing page
│   │   ├── layout.tsx                 # Root layout with navigation
│   │   ├── dashboard/                 # Dashboard routes
│   │   │   ├── page.tsx               # Main dashboard
│   │   │   ├── trends/page.tsx        # Trends visualization
│   │   │   └── map/page.tsx           # Geographic visualization
│   │   ├── diseases/                  # Disease routes
│   │   │   ├── page.tsx               # Disease listing
│   │   │   └── [id]/                  # Dynamic route for disease details
│   │   │       └── page.tsx           # Disease detail page
│   │   └── analytics/                 # Analytics routes
│   │       ├── page.tsx               # Analytics dashboard
│   │       ├── forecast/page.tsx      # Forecasting tool
│   │       └── correlation/page.tsx   # Correlation analysis
│   ├── components/
│   │   ├── ui/                        # Shadcn components
│   │   ├── layout/                    # Layout components
│   │   │   ├── sidebar-nav.tsx        # Sidebar navigation
│   │   │   ├── header.tsx             # Application header
│   │   │   └── page-container.tsx     # Page container with breadcrumbs
│   │   ├── dashboard/                 # Dashboard components
│   │   │   ├── stats-card.tsx         # Statistics card component
│   │   │   ├── trend-chart.tsx        # Trend visualization chart
│   │   │   ├── disease-map.tsx        # Geographic map visualization
│   │   │   └── summary-metrics.tsx    # Summary metrics component
│   │   ├── disease/                   # Disease components
│   │   │   ├── disease-table.tsx      # Disease listing table
│   │   │   ├── disease-details.tsx    # Disease detail component
│   │   │   └── disease-filters.tsx    # Filtering component for diseases
│   │   ├── analytics/                 # Analytics components
│   │   │   ├── forecast-chart.tsx     # Forecasting visualization
│   │   │   ├── correlation-chart.tsx  # Correlation visualization
│   │   │   └── forecast-form.tsx      # Form for forecast parameters
│   │   └── common/                    # Shared components
│   │       ├── data-table.tsx         # Reusable data table
│   │       ├── filter-controls.tsx    # Reusable filtering controls
│   │       └── loading-states.tsx     # Loading skeletons and indicators
│   ├── hooks/                         # Custom React hooks
│   │   ├── use-disease-data.ts        # Hook for disease data
│   │   ├── use-dashboard-stats.ts     # Hook for dashboard statistics
│   │   └── use-disease-forecast.ts    # Hook for forecasting data
│   ├── services/                      # API services
│   │   ├── api-client.ts              # Base API client configuration
│   │   ├── disease-service.ts         # Disease data service
│   │   ├── dashboard-service.ts       # Dashboard data service
│   │   └── analytics-service.ts       # Analytics data service
│   └── lib/                           # Utility functions and helpers
│       ├── utils.ts                   # General utility functions
│       └── chart-utils.ts             # Charting helper functions
└── public/                            # Static assets
```

## Implementation Phases

### Phase 1: Core Components and Layout 

#### Layout Setup
- [✅] Create root layout with responsive sidebar navigation
- [ ] Design page container with breadcrumb navigation # not really needed
- [ ] Set up responsive breakpoints for mobile/tablet/desktop # not really needed

#### API Services
- [✅] Set up API client with Axios for HTTP requests
- [✅ ] Configure React Query for data fetching and caching
- [✅] Implement error handling and loading states
- [✅] Create service modules for:
  - [✅] Disease data
  - [✅] Categories
  - [✅] Dashboard statistics
  - [✅] Analytics data

#### Basic Components
- [✅] Implement stats cards for key metrics display
- [✅] Create basic chart components (line, bar, pie)
- [ ] Build simple data table component
- [ ] Develop form components for filters

### Phase 2: Dashboard Views 

#### Summary Dashboard
- [ ] Create main dashboard layout with grid of metrics
- [ ] Implement KPI cards showing:
  - [ ] Total cases
  - [ ] Deaths
  - [ ] Recoveries
  - [ ] Active cases
- [ ] Build disease prevalence chart (by region)
- [ ] Develop time series chart for trends

#### Trends Visualization
- [ ] Create interactive line charts for disease trends
- [ ] Implement time period selector component
- [ ] Add comparison functionality between diseases
- [ ] Build export functionality for chart data

#### Geographic Visualization  
- [ ] Integrate map component for geographic data
- [ ] Implement choropleth coloring based on disease prevalence
- [ ] Create region tooltips with detailed information
- [ ] Add filtering by disease type

### Phase 3: Disease Management 

#### Disease Listing
- [ ] Create data table with sorting and pagination
- [ ] Implement search and filter functionality
- [ ] Add quick actions (view details, add data)
- [ ] Create "add new disease" form

#### Disease Details
- [ ] Build disease profile page with summary metrics
- [ ] Implement historical data visualization
- [ ] Create tabs for different data views:
  - [ ] Overview
  - [ ] Historical data
  - [ ] Predictions
  - [ ] Related diseases

#### Data Entry
- [ ] Create forms for adding new disease data
- [ ] Implement data validation
- [ ] Add success/error notifications
- [ ] Build bulk import functionality

### Phase 4: Analytics and Predictions 

#### Forecasting Tools
- [ ] Create forecast configuration form
- [ ] Implement forecast chart with confidence intervals
- [ ] Build comparison view (actual vs. predicted)
- [ ] Add export functionality for predictions

#### Correlation Analysis
- [ ] Develop factor selection interface
- [ ] Create correlation matrix visualization
- [ ] Implement scatter plots for relationships
- [ ] Build interpretation helpers for correlation results

#### AI Query Interface
- [ ] Create conversational query interface
- [ ] Implement query history tracking
- [ ] Build result visualization based on query type
- [ ] Add suggested queries feature

### Phase 5: Optimization and Polish (1-2 weeks)

- [ ] Implement data virtualization for large datasets
- [ ] Add code splitting and lazy loading
- [ ] Optimize server-side rendering for key pages
- [ ] Ensure responsive design works on all devices
- [ ] Add user preferences and saved views
- [ ] Implement comprehensive error handling
- [ ] Create skeleton loaders for all components

## Key Components Details

### StatsCard
**Purpose**: Display key metrics with trend indicators
```tsx
interface StatsCardProps {
  title: string;
  value: number;
  previousValue?: number;
  changePercentage?: number;
  direction?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
  description?: string;
}
```

### DiseaseTable
**Purpose**: Display and filter disease records
```tsx
interface DiseaseTableProps {
  data: Disease[];
  columns: Column[];
  filters?: FilterOptions;
  pagination: PaginationOptions;
  onRowClick?: (disease: Disease) => void;
  isLoading?: boolean;
}
```

### TrendChart
**Purpose**: Visualize disease trends over time
```tsx
interface TrendChartProps {
  data: TimeSeriesPoint[];
  timeframe: 'quarterly' | 'monthly' | 'yearly';
  selectedDiseases: string[];
  compareMode?: boolean;
  height?: number;
  showLegend?: boolean;
}
```

### DiseaseMap
**Purpose**: Show geographic distribution of diseases
```tsx
interface DiseaseMapProps {
  regionData: RegionData[];
  selectedDisease?: string;
  colorScale?: string[];
  height?: number;
  onRegionClick?: (region: string) => void;
}
```

### ForecastChart
**Purpose**: Display disease forecasts with confidence intervals
```tsx
interface ForecastChartProps {
  historicalData: TimeSeriesPoint[];
  forecastData: ForecastPoint[];
  confidenceIntervals?: ConfidenceInterval[];
  toggleHistorical?: boolean;
}
```

## API Services

We'll create services to interact with the backend API:

### api-client.ts
Base configuration for API requests, handles:
- Authentication (if needed later)
- Error handling
- Request/response interceptors

### disease-service.ts
Methods:
- `getAllDiseases(filters)`
- `getDiseaseById(id)`
- `createDisease(data)`
- `updateDisease(id, data)`
- `deleteDisease(id)`
- `addDiseaseData(id, data)`

### dashboard-service.ts
Methods:
- `getSummaryStats(diseaseId?)`
- `getTrends()`
- `getMapData()`

### analytics-service.ts
Methods:
- `generateForecast(params)`
- `analyzeCorrelation(factors)`
- `processQuery(query)`

## Data Models

### Disease
```tsx
interface Disease {
  id: string;
  name: string;
  category: string;
  year: number;
  quarter: number;
  region: string;
  cases: number;
  deaths: number;
  recoveries: number;
  population: number;
  incidenceRate: number;
  prevalenceRate: number;
  mortalityRate: number;
}
```

### TimeSeriesPoint
```tsx
interface TimeSeriesPoint {
  year: number;
  quarter: number;
  name: string;
  cases: number;
}
```

### DashboardSummary
```tsx
interface DashboardSummary {
  totalCases: number;
  totalDeaths: number;
  totalRecoveries: number;
  averageRate: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
}
```

## State Management Strategy

1. **Server State**: React Query for API data
   - Setup with optimized caching and refetching
   - Global query client configuration
   - Error handling middleware

2. **UI State**: Context API for shared UI state
   - Theme provider
   - Sidebar collapse state
   - Filter preferences

3. **Route-based State**: URL parameters
   - Disease ID in URL path
   - Filter params in URL search params
   - Time period selections

## Initial Setup Tasks

1. Create the Next.js project with TypeScript and Tailwind
2. Configure Shadcn UI components
3. Set up the main layout with sidebar navigation
4. Create API service foundation
5. Implement the main dashboard page with placeholder components
6. Setup React Query for data fetching

This plan provides a comprehensive roadmap for implementing the Health ISIS disease analytics frontend. We'll start with the core structure and layout, then build out the feature set incrementally, focusing on the most important dashboard views first before moving on to more advanced analytics features.
```
