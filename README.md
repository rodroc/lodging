# Lodging Application

A full-stack lodging/accommodation booking system built with React frontend, Node.js backend, and PostgreSQL database.

## Project Structure
```
lodging/
├── frontend/          # React + Vite frontend
├── backend/           # Node.js + Express API
├── db-dumps/          # Database initialization
├── env.example        # Environment variables template
└── docker-compose.yml # Docker configuration
```

## Prerequisites

- **Docker** and **Docker Compose** (recommended method)
- **Node.js** >= 18.20.8 and **npm** >= 10.8.2 (for local development)
- **PostgreSQL** (if running without Docker)

## Quick Start with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lodging
   ```

2. **Setup environment (optional)**
   ```bash
   # Copy environment template (Docker uses defaults from docker-compose.yml)
   cp env.example .env
   # Edit .env if you want to customize any settings
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - Database: localhost:5432

5. **Default admin credentials**
   - Email: `admin@lodging.com`
   - Password: `admin`

## Local Development Setup

### Environment Configuration

1. **Copy the environment template**:
   ```bash
   cp env.example .env
   ```

2. **Edit the `.env` file** with your specific configuration:
   - Update `JWT_SECRET` with a secure random string
   - Modify database credentials if different from defaults
   - Adjust `VITE_API_URL` if your backend runs on a different port
   - For local development, change `DB_HOST` from `db` to `localhost`

### Database Setup
1. Install and start PostgreSQL
2. Create database and user:
   ```sql
   CREATE DATABASE lodging_db;
   CREATE USER lodging_user WITH PASSWORD 'lodging_password';
   GRANT ALL PRIVILEGES ON DATABASE lodging_db TO lodging_user;
   ```
3. Import initial schema: `psql -U lodging_user -d lodging_db -f db-dumps/init.sql`

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. **Setup environment variables**:
   ```bash
   # Copy the main env.example to backend directory
   cp ../env.example .env
   
   # Edit .env file and update DB_HOST for local development:
   # Change DB_HOST=db to DB_HOST=localhost
   ```

4. Run migrations and seed data:
   ```bash
   npm run migrate
   npm run seed
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. **Setup environment variables**:
   ```bash
   # Create frontend .env file
   echo "VITE_API_URL=http://localhost:3001/api" > .env
   ```
   
   Or manually create `.env` file with:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with test data
- `npm test` - Run tests

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Docker Commands

- `docker-compose up -d` - Start all services in background
- `docker-compose down` - Stop all services
- `docker-compose logs [service]` - View service logs
- `docker-compose exec backend npm run migrate` - Run migrations in container

## Environment URLs

- **Local Development**: http://localhost:3000

## Troubleshooting

1. **Port conflicts**: Ensure ports 3000, 3001, and 5432 are available
2. **Database connection**: Check PostgreSQL is running and credentials are correct
3. **Docker issues**: Try `docker-compose down && docker-compose up --build`
4. **Permission errors**: Ensure proper file permissions for Docker volumes

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, React Router
- **Backend**: Node.js, Express, Knex.js, PostgreSQL
- **Authentication**: JWT with bcryptjs
- **Development**: Docker, Docker Compose