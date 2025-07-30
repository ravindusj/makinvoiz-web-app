-- Add user_id column to quotations table
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to bills table
ALTER TABLE bills ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quotations_user_id ON quotations(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);

-- Update company_settings table to also have proper user_id reference
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_company_settings_user_id ON company_settings(user_id);

-- Enable Row Level Security (RLS) for user data isolation
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

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
