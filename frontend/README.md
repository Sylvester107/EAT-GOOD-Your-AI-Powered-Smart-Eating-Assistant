# Eat Good - Frontend

This is the frontend application for Eat Good, an AI-powered smart eating assistant. The frontend is built with React.js and Material-UI, providing a modern and responsive user interface for nutrition analysis.

## Features

- Image upload for food product analysis
- Real-time nutrition information display
- User profile management
- Responsive design for mobile and desktop
- Modern Material-UI components
- Drag-and-drop image upload support

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Backend server running (FastAPI)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```bash
VITE_API_URL=http://localhost:8000
```

## Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ImageUploader.jsx
│   │   ├── NutritionAnalysis.jsx
│   │   ├── UserProfile.jsx
│   │   └── LoadingSpinner.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── package.json
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
