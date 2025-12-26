# MağazaPano Admin Panel

Modern React + TypeScript admin panel for MağazaPano digital signage system.

## Features

- 🎨 Material-UI Design System
- 🔐 JWT Authentication
- 🚀 React Query for data fetching
- 📱 Responsive design
- 🌐 Real-time updates with Socket.IO
- 📊 Dashboard with statistics
- 🎬 Media management
- 📋 Playlist management
- 📺 Device monitoring
- 🏪 Store management
- ⏰ Schedule management
- 🎯 Campaign management

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **UI Library:** Material-UI (MUI)
- **State Management:** Zustand
- **Data Fetching:** React Query
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **Real-time:** Socket.IO Client

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## Default Credentials

- Email: admin@magazapano.com
- Password: Admin123!

## Project Structure

```
admin-panel/
├── src/
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── store/            # State management
│   ├── config/           # Configuration files
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
└── package.json
```

## Available Routes

- `/` - Dashboard
- `/media` - Media management
- `/playlists` - Playlist management
- `/devices` - Device monitoring
- `/stores` - Store management
- `/schedules` - Schedule management
- `/campaigns` - Campaign management
- `/settings` - Settings

## License

© 2025 MağazaPano
