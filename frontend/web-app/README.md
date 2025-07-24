# AgenticOmics Web Application

The main web application for the AgenticOmics platform, built with React, TypeScript, and Material-UI.

## Features

- **Welcome Page**: Platform overview and quick access to main features
- **Data Management**: Upload and manage omics data files
- **Exploratory Data Analysis (EDA)**: Interactive visualizations and statistical analysis
- **Pipeline Builder**: Drag-and-drop interface for creating analysis workflows
- **Results Viewer**: View, interpret, and export analysis results

## Technology Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **Vite** for fast development and building
- **ESLint** and **Prettier** for code quality

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The application will be available at `http://localhost:3000` during development.

### Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout/         # Main layout with sidebar navigation
├── pages/              # Page components
│   ├── WelcomePage.tsx # Platform overview and getting started
│   ├── DataPage.tsx    # Data upload and management
│   ├── EDAPage.tsx     # Exploratory data analysis
│   ├── PipelinePage.tsx # Pipeline builder and management
│   └── ResultPage.tsx  # Analysis results and export
├── App.tsx             # Main application component
└── main.tsx           # Application entry point
```

## Features Overview

### Navigation
- Responsive sidebar navigation with active state indicators
- Mobile-friendly drawer navigation
- User profile menu with settings and logout options

### Welcome Page
- Platform overview with key features
- Quick action cards for main workflows
- Recent activity and platform capabilities
- AI-powered insights and tips

### Data Page
- Drag-and-drop file upload interface
- Support for multiple omics data formats
- File validation and quality checks
- Recent uploads with status tracking

### EDA Page
- Interactive data visualization options
- AI-generated insights and recommendations
- Multiple analysis types (distribution, correlation, time series)
- Export options for plots and data

### Pipeline Page
- Drag-and-drop pipeline builder
- Pre-built pipeline templates
- Real-time pipeline execution monitoring
- AI-powered pipeline recommendations

### Results Page
- Tabbed interface for different result types
- Interactive visualizations and statistical results
- AI-generated key findings
- Multiple export formats (PDF, Excel, images)

## Styling and Theming

The application uses Material-UI's theming system with a custom theme that includes:
- Primary color: Blue (#1976d2)
- Secondary color: Purple (#9c27b0)
- Dark sidebar with light main content area
- Consistent spacing and typography

## API Integration

The application is configured to proxy API requests to the backend services:
- API Gateway: `http://localhost:8080`
- All `/api/*` requests are automatically proxied during development

## Building and Deployment

```bash
# Build for production
npm run build

# The built files will be in the `dist/` directory
```

The application can be deployed to any static hosting service or served by the backend application server.