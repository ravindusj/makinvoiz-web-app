-- Add user_id column to quotations table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='user_id') THEN
        ALTER TABLE quotations ADD COLUMN user_id UUID;
    END IF;
END $$;

-- Add user_id column to bills table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bills' AND column_name='user_id') THEN
        ALTER TABLE bills ADD COLUMN user_id UUID;
    END IF;
END $$;

-- Add user_id column to company_settings table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='company_settings' AND column_name='user_id') THEN
        ALTER TABLE company_settings ADD COLUMN user_id UUID;
    END IF;
END $$;

-- Add foreign key constraints
DO $$ 
BEGIN 
    -- Add foreign key for quotations if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='quotations_user_id_fkey') THEN
        ALTER TABLE quotations ADD CONSTRAINT quotations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key for bills if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='bills_user_id_fkey') THEN
        ALTER TABLE bills ADD CONSTRAINT bills_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key for company_settings if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='company_settings_user_id_fkey') THEN
        ALTER TABLE company_settings ADD CONSTRAINT company_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quotations_user_id ON quotations(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_company_settings_user_id ON company_settings(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own quotations" ON quotations;
DROP POLICY IF EXISTS "Users can insert their own quotations" ON quotations;
DROP POLICY IF EXISTS "Users can update their own quotations" ON quotations;
DROP POLICY IF EXISTS "Users can delete their own quotations" ON quotations;

DROP POLICY IF EXISTS "Users can view their own bills" ON bills;
DROP POLICY IF EXISTS "Users can insert their own bills" ON bills;
DROP POLICY IF EXISTS "Users can update their own bills" ON bills;
DROP POLICY IF EXISTS "Users can delete their own bills" ON bills;

DROP POLICY IF EXISTS "Users can view their own quotation items" ON quotation_items;
DROP POLICY IF EXISTS "Users can insert their own quotation items" ON quotation_items;
DROP POLICY IF EXISTS "Users can update their own quotation items" ON quotation_items;
DROP POLICY IF EXISTS "Users can delete their own quotation items" ON quotation_items;

DROP POLICY IF EXISTS "Users can view their own bill items" ON bill_items;
DROP POLICY IF EXISTS "Users can insert their own bill items" ON bill_items;
DROP POLICY IF EXISTS "Users can update their own bill items" ON bill_items;
DROP POLICY IF EXISTS "Users can delete their own bill items" ON bill_items;

DROP POLICY IF EXISTS "Users can view their own company settings" ON company_settings;
DROP POLICY IF EXISTS "Users can insert their own company settings" ON company_settings;
DROP POLICY IF EXISTS "Users can update their own company settings" ON company_settings;
DROP POLICY IF EXISTS "Users can delete their own company settings" ON company_settings;

-- Create RLS policies for quotations
CREATE POLICY "Users can view their own quotations" ON quotations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quotations" ON quotations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotations" ON quotations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quotations" ON quotations
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for bills
CREATE POLICY "Users can view their own bills" ON bills
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bills" ON bills
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bills" ON bills
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bills" ON bills
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for quotation_items
CREATE POLICY "Users can view their own quotation items" ON quotation_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quotations 
            WHERE quotations.id = quotation_items.quotation_id 
            AND quotations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own quotation items" ON quotation_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM quotations 
            WHERE quotations.id = quotation_items.quotation_id 
            AND quotations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own quotation items" ON quotation_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM quotations 
            WHERE quotations.id = quotation_items.quotation_id 
            AND quotations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own quotation items" ON quotation_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM quotations 
            WHERE quotations.id = quotation_items.quotation_id 
            AND quotations.user_id = auth.uid()
        )
    );

-- Create RLS policies for bill_items
CREATE POLICY "Users can view their own bill items" ON bill_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bills 
            WHERE bills.id = bill_items.bill_id 
            AND bills.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own bill items" ON bill_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM bills 
            WHERE bills.id = bill_items.bill_id 
            AND bills.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own bill items" ON bill_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM bills 
            WHERE bills.id = bill_items.bill_id 
            AND bills.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own bill items" ON bill_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM bills 
            WHERE bills.id = bill_items.bill_id 
            AND bills.user_id = auth.uid()
        )
    );

-- Create RLS policies for company_settings
CREATE POLICY "Users can view their own company settings" ON company_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company settings" ON company_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company settings" ON company_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company settings" ON company_settings
    FOR DELETE USING (auth.uid() = user_id);
