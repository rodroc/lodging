--
-- PostgreSQL database dump for Lodging Application
-- Generated for remote deployment without migration scripts
--

-- Set encoding and basic settings
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Create database if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'lodging_db') THEN
        CREATE DATABASE lodging_db WITH TEMPLATE = template0 ENCODING = 'UTF8';
    END IF;
END
$$;

-- Connect to the database
\c lodging_db;

-- Create user if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_user WHERE usename = 'lodging_user') THEN
        CREATE USER lodging_user WITH PASSWORD 'lodging_password';
    END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE lodging_db TO lodging_user;
GRANT ALL ON SCHEMA public TO lodging_user;

-- Set default table access method
SET default_table_access_method = heap;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id SERIAL PRIMARY KEY,
    startdate DATE,
    enddate DATE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_deleted BOOLEAN DEFAULT false
);

-- Create knex migration tables (for compatibility)
CREATE TABLE IF NOT EXISTS public.knex_migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    batch INTEGER,
    migration_time TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.knex_migrations_lock (
    index SERIAL PRIMARY KEY,
    is_locked INTEGER
);

-- Grant ownership to lodging_user
ALTER TABLE public.users OWNER TO lodging_user;
ALTER TABLE public.bookings OWNER TO lodging_user;
ALTER TABLE public.knex_migrations OWNER TO lodging_user;
ALTER TABLE public.knex_migrations_lock OWNER TO lodging_user;

-- Grant all privileges on sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO lodging_user;

-- Insert admin user (password is 'admin' hashed with bcrypt)
INSERT INTO public.users (name, email, password) 
VALUES ('Admin User', 'admin@lodging.com', '$2b$10$8rXK9qJ5vN8YxNmJzQ7PvOQqW9jGvGjq1kK4xP3zY8sL2eR6tM9mC')
ON CONFLICT (email) DO NOTHING;

-- Insert test booking data for current month (June 2025)
INSERT INTO public.bookings (startdate, enddate, note, is_deleted) VALUES
('2025-06-03', '2025-06-05', 'Test past booking 1', false),
('2025-06-08', '2025-06-10', 'Test range booking', false),
('2025-06-15', '2025-06-17', 'Test future booking', false),
('2025-06-20', '2025-06-21', 'Test weekend booking', false),
('2025-06-25', '2025-06-27', 'Test end month booking', false)
ON CONFLICT DO NOTHING;

-- Set final permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lodging_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lodging_user;

-- Success message
\echo 'Database schema and test data created successfully!' 