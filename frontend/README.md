# Job Recommendation System - Frontend

A modern React frontend for the Job Recommendation System built with Vite, React Router, and Tailwind CSS.

## Features

- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Authentication**: Login and registration with JWT tokens
- **Job Search**: Advanced filtering and search capabilities
- **Dashboard**: Personalized job recommendations and application tracking
- **Profile Management**: Complete user profile with skills and experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **React 19**: Latest React with modern features
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing with autoprefixer

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm or yarn

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Navbar.jsx      # Navigation component
├── pages/              # Page components
│   ├── Home.jsx        # Landing page
│   ├── Login.jsx       # Login page
│   ├── Register.jsx    # Registration page
│   ├── Dashboard.jsx   # User dashboard
│   ├── Jobs.jsx        # Job listings
│   └── Profile.jsx     # User profile
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── assets/             # Static assets
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles and Tailwind imports
```

## API Integration

The frontend is configured to proxy API requests to the backend server running on `http://localhost:5000`. All API calls are prefixed with `/api`.

### Authentication

- Login: `POST /api/auth/login`
- Register: `POST /api/auth/register`
- Protected routes require JWT token in Authorization header

### Job Management

- Get jobs: `GET /api/jobs`
- Apply to job: `POST /api/jobs/:id/apply`
- Get recommendations: `GET /api/jobs/recommendations`

### User Profile

- Get profile: `GET /api/user/profile`
- Update profile: `PUT /api/user/profile`

## Styling

The project uses Tailwind CSS with custom configuration:

- **Primary Colors**: Blue theme with various shades
- **Secondary Colors**: Gray scale for text and backgrounds
- **Custom Components**: Pre-defined button and form styles
- **Responsive Design**: Mobile-first approach

## Development

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route to `src/App.jsx`
3. Update navigation in `src/components/Navbar.jsx`

### Adding New Components

1. Create component in `src/components/`
2. Export as default
3. Import and use in pages

### Styling Guidelines

- Use Tailwind utility classes
- Follow the existing color scheme
- Use custom component classes for consistency
- Ensure responsive design

## Production Build

To build for production:

```bash
pnpm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## Contributing

1. Follow the existing code structure
2. Use meaningful component and variable names
3. Add comments for complex logic
4. Ensure responsive design
5. Test on different screen sizes

## License

This project is part of the Job Recommendation System.
