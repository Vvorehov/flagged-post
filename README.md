# Flagged Posts Review Tool

A full-stack TypeScript application for reviewing and managing flagged social media posts. Built with Node.js/Express backend and React frontend.

## Tech Stack

### Backend
- Node.js with TypeScript
- Express.js
- CORS enabled for frontend communication
- JSON-based data storage

### Frontend
- React 18 with TypeScript
- Vite for fast development and building
- Native Fetch API for HTTP requests
- Tailwind CSS for styling
- Component-based architecture

## API Endpoints

- `GET /posts` - Get paginated posts with optional filtering
- `GET /posts/:id` - Get a specific post
- `PATCH /posts/:id/status` - Update post status
- `POST /posts/:id/tags` - Add a tag to a post
- `DELETE /posts/:id/tags/:tag` - Remove a tag from a post
- `GET /platforms` - Get available platforms
- `GET /tags` - Get all available tags

## Installation & Setup

### Prerequisites
- Node.js (version 16 or higher)
- npm

## Development

### Backend Commands
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled JavaScript

### Frontend Commands
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## License

This project is for demonstration purposes