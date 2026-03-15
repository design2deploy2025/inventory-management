-- Migration: Add payment_status to purchase_orders table
-- Mirrors payment_status in orders table
-- Run this in your Supabase SQL editor

-- Add payment_status column
ALTER TABLE public.purchase_orders 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Unpaid' 
CHECK (payment_status IN ('Unpaid', 'Partially Paid', 'Paid'));

-- Update existing records to default
UPDATE public.purchase_orders SET payment_status = 'Unpaid' WHERE payment_status IS NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_purchase_orders_payment_status ON public.purchase_orders(payment_status);

-- RLS already covers updates via existing policies

COMMENT ON COLUMN public.purchase_orders.payment_status IS 'Payment status for the purchase order: Unpaid, Partially Paid, Paid';


