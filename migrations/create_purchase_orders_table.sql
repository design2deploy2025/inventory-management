-- Migration: Create purchase_orders table for incoming supplier orders
-- Run this in your Supabase SQL editor

-- Enable UUID extension if not already
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  po_number TEXT UNIQUE,
  supplier_name TEXT NOT NULL,
  products JSONB NOT NULL DEFAULT '[]'::JSONB,
  total_cost DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Partially Received', 'Received', 'Cancelled')),
  expected_delivery DATE,
  received_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchase orders" ON public.purchase_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchase orders" ON public.purchase_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchase orders" ON public.purchase_orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own purchase orders" ON public.purchase_orders
  FOR DELETE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_purchase_orders_user_id ON public.purchase_orders(user_id);
CREATE INDEX idx_purchase_orders_po_number ON public.purchase_orders(po_number);
CREATE INDEX idx_purchase_orders_status ON public.purchase_orders(status);

-- Trigger for po_number auto-generation (similar to orders)
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TRIGGER AS $$
DECLARE
  year_suffix TEXT;
  seq_number INTEGER;
  new_po_number TEXT;
BEGIN
  year_suffix := to_char(CURRENT_DATE, 'YY');
  
  -- Get next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(po_number FROM '\d+$') AS INTEGER)), 0) + 1
  INTO seq_number
  FROM public.purchase_orders 
  WHERE po_number ~ ('PO-' || year_suffix || '-\d+');
  
  new_po_number := 'PO-' || year_suffix || '-' || LPAD(seq_number::TEXT, 3, '0');
  
  NEW.po_number := COALESCE(NEW.po_number, new_po_number);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_po_number
  BEFORE INSERT ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION generate_po_number();

-- Update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE
  ON public.purchase_orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

COMMENT ON TABLE public.purchase_orders IS 'Incoming purchase orders from suppliers for stock replenishment';

