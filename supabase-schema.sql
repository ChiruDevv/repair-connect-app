-- =============================================
-- RepairConnect: Supabase Schema Setup
-- Run this in your Supabase SQL Editor
-- Dashboard → SQL Editor → New query → Paste → Run
-- =============================================

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  image TEXT,
  badges TEXT[] DEFAULT '{}',
  total_co2_saved NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Repair Requests table
CREATE TABLE IF NOT EXISTS repair_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('electronics', 'furniture', 'bicycle', 'appliance', 'other')),
  diagnosis JSONB DEFAULT '{}',
  impact JSONB DEFAULT '{}',
  diy_guide JSONB DEFAULT '{}',
  spare_parts JSONB DEFAULT '[]',
  repair_options JSONB DEFAULT '[]',
  status TEXT DEFAULT 'diagnosed' CHECK (status IN ('pending', 'diagnosed', 'in_repair', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Service Providers table
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('electronics', 'furniture', 'bicycle', 'appliance', 'other')),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  phone TEXT NOT NULL,
  rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews JSONB DEFAULT '[]',
  specialties TEXT[] DEFAULT '{}',
  price_range TEXT DEFAULT '₹',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_repair_requests_user_id ON repair_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_repair_requests_status ON repair_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_providers_category ON service_providers(category);
CREATE INDEX IF NOT EXISTS idx_service_providers_city ON service_providers(city);

-- 5. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_repair_requests_updated_at
  BEFORE UPDATE ON repair_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_service_providers_updated_at
  BEFORE UPDATE ON service_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
