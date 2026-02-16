-- =============================================================================
-- INSTASTOCK DATABASE SCHEMA FOR SUPABASE
-- =============================================================================
-- This SQL file creates all necessary tables, relationships, and functions
-- for the InstaStock inventory management application.
-- 
-- Run this in your Supabase SQL Editor to set up the database.
-- =============================================================================

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

-- Order status enum
CREATE TYPE order_status AS ENUM (
    'Pending',
    'Processing', 
    'Completed',
    'Cancelled'
);

-- Payment status enum
CREATE TYPE payment_status AS ENUM (
    'Unpaid',
    'Paid',
    'Failed',
    'Refunded'
);

-- Payment type enum
CREATE TYPE payment_type AS ENUM (
    'Card',
    'Bank Transfer',
    'UPI',
    'Wallet',
    'COD',
    'Cash'
);

-- Product status enum
CREATE TYPE product_status AS ENUM (
    'Active',
    'Inactive',
    'Discontinued'
);

-- Product category enum
CREATE TYPE product_category AS ENUM (
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Sports & Outdoors',
    'Books',
    'Toys & Games',
    'Health & Beauty',
    'Automotive',
    'Food & Beverages',
    'Office Supplies',
    'Accessories',
    'Other'
);

-- =============================================================================
-- PROFILES TABLE (Extends Supabase Auth)
-- =============================================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    business_name TEXT,
    owner_name TEXT,
    instagram_handle TEXT,
    description TEXT,
    logo_url TEXT,
    address TEXT,
    email_alerts_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NOW(), NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- PRODUCTS TABLE
-- =============================================================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    description TEXT,
    category product_category DEFAULT 'Other',
    quantity INTEGER DEFAULT 0,
    sku TEXT UNIQUE,
    status product_status DEFAULT 'Active',
    image_url TEXT,
    image_alt TEXT,
    total_sold INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own products"
    ON products FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
    ON products FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
    ON products FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
    ON products FOR DELETE
    USING (auth.uid() = user_id);

-- Auto-generate SKU if not provided
CREATE OR REPLACE FUNCTION set_product_sku()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sku IS NULL OR NEW.sku = '' THEN
        NEW.sku := 'PRD-' || UPPER(SUBSTRING(MD5(NEW.id::TEXT) FROM 1 FOR 8));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_product_sku_trigger
    BEFORE INSERT ON products
    FOR EACH ROW EXECUTE FUNCTION set_product_sku();

-- =============================================================================
-- CUSTOMERS TABLE
-- =============================================================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    instagram TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    lifetime_value DECIMAL(10, 2) DEFAULT 0,
    repeat_orders INTEGER DEFAULT 0,
    last_order_date DATE,
    last_order_details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own customers"
    ON customers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customers"
    ON customers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers"
    ON customers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers"
    ON customers FOR DELETE
    USING (auth.uid() = user_id);

-- Auto-generate customer ID
CREATE OR REPLACE FUNCTION set_customer_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.id := COALESCE(NEW.id, gen_random_uuid());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_customer_id_trigger
    BEFORE INSERT ON customers
    FOR EACH ROW EXECUTE FUNCTION set_customer_id();

-- =============================================================================
-- ORDERS TABLE
-- =============================================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_instagram TEXT,
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    order_status order_status DEFAULT 'Pending',
    payment_status payment_status DEFAULT 'Unpaid',
    payment_type payment_type,
    notes TEXT,
    products JSONB DEFAULT '[]'::jsonb,
    invoice_date DATE,
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
    ON orders FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orders"
    ON orders FOR DELETE
    USING (auth.uid() = user_id);

-- Auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
    year_str TEXT;
BEGIN
    year_str := TO_CHAR(NOW(), 'YY');
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(order_number FROM 7 FOR 3) AS INTEGER)
    ), 0) + 1 INTO next_num
    FROM orders
    WHERE user_id = NEW.user_id;
    
    NEW.order_number := 'ORD-' || year_str || '-' || LPAD(next_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- =============================================================================
-- ORDER ITEMS TABLE (For detailed order line items)
-- =============================================================================

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies (inherit from orders)
CREATE POLICY "Users can view order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert order items"
    ON order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update order items"
    ON order_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete order items"
    ON order_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- =============================================================================
-- CHECKLISTS TABLE
-- =============================================================================

CREATE TABLE checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own checklists"
    ON checklists FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checklists"
    ON checklists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklists"
    ON checklists FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checklists"
    ON checklists FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================================================
-- CHECKLIST ITEMS TABLE
-- =============================================================================

CREATE TABLE checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view checklist items"
    ON checklist_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM checklists 
            WHERE checklists.id = checklist_items.checklist_id 
            AND checklists.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert checklist items"
    ON checklist_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM checklists 
            WHERE checklists.id = checklist_items.checklist_id 
            AND checklists.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update checklist items"
    ON checklist_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM checklists 
            WHERE checklists.id = checklist_items.checklist_id 
            AND checklists.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete checklist items"
    ON checklist_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM checklists 
            WHERE checklists.id = checklist_items.checklist_id 
            AND checklists.user_id = auth.uid()
        )
    );

-- =============================================================================
-- GUIDES/DOCUMENTATION TABLE
-- =============================================================================

CREATE TABLE guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    content TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own guides"
    ON guides FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own guides"
    ON guides FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own guides"
    ON guides FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own guides"
    ON guides FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================================================
-- ANALYTICS/VISITORS TRACKING TABLE
-- =============================================================================

CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    visitor_id UUID,
    session_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own analytics"
    ON analytics_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics"
    ON analytics_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- STOCK HISTORY TABLE (Track stock changes over time)
-- =============================================================================

CREATE TABLE stock_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity_change INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own stock history"
    ON stock_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stock history"
    ON stock_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- INVOICES TABLE
-- =============================================================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) DEFAULT 0,
    status payment_status DEFAULT 'Unpaid',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own invoices"
    ON invoices FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices"
    ON invoices FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
    ON invoices FOR UPDATE
    USING (auth.uid() = user_id);

-- Auto-generate invoice number
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
    year_str TEXT;
    month_str TEXT;
BEGIN
    year_str := TO_CHAR(NOW(), 'YY');
    month_str := TO_CHAR(NOW(), 'MM');
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(invoice_number FROM 8 FOR 4) AS INTEGER)
    ), 0) + 1 INTO next_num
    FROM invoices
    WHERE user_id = NEW.user_id;
    
    NEW.invoice_number := 'INV-' || year_str || month_str || '-' || LPAD(next_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number_trigger
    BEFORE INSERT ON invoices
    FOR EACH ROW EXECUTE FUNCTION set_invoice_number();

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to update customer lifetime value
CREATE OR REPLACE FUNCTION update_customer_lifetime_value()
RETURNS TRIGGER AS $$
DECLARE
    customer_total DECIMAL(10, 2);
    order_count INTEGER;
BEGIN
    -- Calculate lifetime value from orders
    SELECT COALESCE(SUM(total_price), 0), COUNT(*)
    INTO customer_total, order_count
    FROM orders
    WHERE customer_id = NEW.customer_id
    AND payment_status = 'Paid';
    
    -- Update customer record
    UPDATE customers
    SET 
        lifetime_value = customer_total,
        repeat_orders = order_count,
        last_order_date = NEW.created_at::date,
        last_order_details = (
            SELECT string_agg(p->>'name' || ' - $' || p->>'price', ', ')
            FROM jsonb_array_elements(NEW.products) AS p
        ),
        updated_at = NOW()
    WHERE id = NEW.customer_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_stats
    AFTER INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.customer_id IS NOT NULL)
    EXECUTE FUNCTION update_customer_lifetime_value();

-- Function to update product total_sold when order is completed
CREATE OR REPLACE FUNCTION update_product_sales()
RETURNS TRIGGER AS $$
DECLARE
    item JSONB;
BEGIN
    IF NEW.order_status = 'Completed' AND NEW.payment_status = 'Paid' THEN
        FOR item IN SELECT * FROM jsonb_array_elements(NEW.products)
        LOOP
            UPDATE products
            SET total_sold = total_sold + (item->>'quantity')::integer
            WHERE user_id = NEW.user_id
            AND name = item->>'name';
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_sales_trigger
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_product_sales();

-- Function to get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_uuid UUID)
RETURNS TABLE (
    total_products INTEGER,
    total_customers INTEGER,
    total_orders INTEGER,
    total_revenue DECIMAL(10, 2),
    pending_orders INTEGER,
    low_stock_products INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM products WHERE user_id = user_uuid)::INTEGER AS total_products,
        (SELECT COUNT(*) FROM customers WHERE user_id = user_uuid)::INTEGER AS total_customers,
        (SELECT COUNT(*) FROM orders WHERE user_id = user_uuid)::INTEGER AS total_orders,
        (SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE user_id = user_uuid AND payment_status = 'Paid')::DECIMAL(10,2) AS total_revenue,
        (SELECT COUNT(*) FROM orders WHERE user_id = user_uuid AND order_status = 'Pending')::INTEGER AS pending_orders,
        (SELECT COUNT(*) FROM products WHERE user_id = user_uuid AND quantity < 10)::INTEGER AS low_stock_products;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- STORAGE BUCKETS (For file uploads)
-- =============================================================================

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for business logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-logos', 'business-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Users can upload product images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'product-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view product images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');

CREATE POLICY "Users can delete product images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'product-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for business logos
CREATE POLICY "Users can upload business logos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'business-logos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view business logos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'business-logos');

-- =============================================================================
-- REAL-TIME SUBSCRIPTIONS
-- =============================================================================

-- Enable real-time for orders
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Enable real-time for products
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- Enable real-time for customers
ALTER PUBLICATION supabase_realtime ADD TABLE customers;

-- Enable real-time for checklists
ALTER PUBLICATION supabase_realtime ADD TABLE checklists;

-- Enable real-time for checklist_items
ALTER PUBLICATION supabase_realtime ADD TABLE checklist_items;

-- =============================================================================
-- INDEXES FOR BETTER PERFORMANCE
-- =============================================================================

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_sku ON products(sku);

CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_instagram ON customers(instagram);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE INDEX idx_checklist_items_checklist_id ON checklist_items(checklist_id);

CREATE INDEX idx_stock_history_product_id ON stock_history(product_id);
CREATE INDEX idx_stock_history_created_at ON stock_history(created_at DESC);

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- =============================================================================
-- SEED DATA (Optional - for testing)
-- =============================================================================

-- Note: Seed data should be inserted per user after they sign up
-- This is just a template comment
/*
-- Example seed data (run after user is created):
INSERT INTO products (user_id, name, price, category, quantity, status)
VALUES 
    (auth.uid(), 'Premium Plan', 299.99, 'Other', 100, 'Active'),
    (auth.uid(), 'Basic Plan', 99.99, 'Other', 200, 'Active'),
    (auth.uid(), 'Enterprise License', 1499.99, 'Other', 50, 'Active'),
    (auth.uid(), 'Professional Plan', 599.99, 'Other', 75, 'Active');
*/

-- =============================================================================
-- END OF DATABASE SCHEMA
-- =============================================================================

