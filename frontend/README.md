# AgenticOmics Frontend

This directory contains the frontend applications for the AgenticOmics platform.

## Structure

- **`web-app/`** - Main user interface for researchers
- **`admin-panel/`** - Administrative interface for system management
- **`shared/`** - Shared components and utilities

## Main Application Pages

The web application includes three main pages accessible through the navigation:

### 1. EDA (Exploratory Data Analysis)
- **Route**: `/eda` (default home page)
- **Purpose**: Data exploration and visualization
- **Features**:
  - Data upload interface
  - Statistical summaries
  - Distribution analysis
  - Correlation analysis
  - Time series analysis

### 2. Model
- **Route**: `/model`
- **Purpose**: Machine learning model development and AI analysis
- **Features**:
  - Predictive model building
  - AI-powered analysis with LLMs
  - AutoML solutions
  - Specialized omics models
  - Model management and deployment
  - AI chat assistant

### 3. Pipeline
- **Route**: `/pipeline`
- **Purpose**: Bioinformatics pipeline creation and management
- **Features**:
  - Drag-and-drop pipeline builder
  - Pre-built pipeline templates
  - Pipeline execution monitoring
  - Template library (RNA-seq, Variant Calling, Proteomics, Metabolomics)

## Development

### Prerequisites
- Node.js 18+
- npm 9+

### Setup
```bash
# Install dependencies for all workspaces
npm install

# Start development servers
npm run dev

# Start individual applications
npm run dev:web-app      # Main app on port 3000
npm run dev:admin-panel  # Admin panel on port 3001
```

### Building
```bash
# Build all applications
npm run build

# Build individual applications
npm run build:web-app
npm run build:admin-panel
npm run build:shared
```

### Testing
```bash
# Run all tests
npm run test

# Run tests for specific workspace
npm run test:web-app
npm run test:admin-panel
npm run test:shared
```

## Technology Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for components
- **React Router** for navigation
- **Vite** for build tooling
- **Vitest** for testing

## Navigation Flow

The application uses a tab-based navigation system:
1. **EDA** → **Model** → **Pipeline**

Users typically follow this workflow:
1. Start with **EDA** to explore and understand their data
2. Move to **Model** to build predictive models or get AI insights
3. Use **Pipeline** to create and execute comprehensive analysis workflows

## Key Features

- **Responsive Design**: Works on desktop and tablet devices
- **Material Design**: Consistent UI following Material Design principles
- **Type Safety**: Full TypeScript support for better development experience
- **Modular Architecture**: Shared components and utilities across applications
- **Hot Reload**: Fast development with instant updates