# Beeflow

A workflow management system with frontend and backend components.

## Project Structure

```
/
├── frontend/          # Vue.js frontend application
├── backend/          # Node.js backend application
└── docs/            # Project documentation
```

## Prerequisites

- Node.js (v16 or later)
- MongoDB
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

This will install dependencies for both frontend and backend.

2. Set up environment variables:
- Copy `.env.example` to `.env` in both frontend and backend directories
- Update the values as needed

## Development

Run both frontend and backend in development mode:
```bash
npm run dev
```

Or run them separately:
```bash
# Frontend only (http://localhost:5174)
npm run dev:frontend

# Backend only (http://localhost:3001)
npm run dev:backend
```

## Testing

Run backend tests:
```bash
npm test
```

## Building for Production

Build both frontend and backend:
```bash
npm run build
```

## License

ISC
