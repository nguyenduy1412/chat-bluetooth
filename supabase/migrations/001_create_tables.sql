-- ============================================
-- Supabase Database Schema for Chat Bluetooth App
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name VARCHAR(255),
  id_device VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  image VARCHAR(500),
  birthday VARCHAR(255),
  system BOOLEAN DEFAULT FALSE,
  device_address VARCHAR(255),
  otp INTEGER,
  expired_otp TIMESTAMPTZ
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  member_array JSONB NOT NULL,
  type VARCHAR(50) NOT NULL
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  type VARCHAR(50),
  width INTEGER,
  height INTEGER,
  message TEXT NOT NULL,
  status VARCHAR(50),
  room_id VARCHAR(36) REFERENCES public.rooms(id) ON DELETE CASCADE,
  created_by VARCHAR(36) REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON public.messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_by ON public.messages(created_by);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_device_address ON public.users(device_address);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Users table policies
CREATE POLICY "Users can view all users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (true);

-- Rooms table policies
CREATE POLICY "Users can view all rooms" ON public.rooms
  FOR SELECT USING (true);

CREATE POLICY "Users can create rooms" ON public.rooms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update rooms" ON public.rooms
  FOR UPDATE USING (true);

-- Messages table policies
CREATE POLICY "Users can view all messages" ON public.messages
  FOR SELECT USING (true);

CREATE POLICY "Users can create messages" ON public.messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update messages" ON public.messages
  FOR UPDATE USING (true);

-- ============================================
-- DONE! Your tables are ready.
-- ============================================
