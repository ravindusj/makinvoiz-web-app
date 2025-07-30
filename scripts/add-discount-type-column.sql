-- Drop existing discount range constraints if they exist
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='chk_discount_range' AND table_name='quotation_items') THEN
        ALTER TABLE quotation_items DROP CONSTRAINT chk_discount_range;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='chk_discount_range' AND table_name='bill_items') THEN
        ALTER TABLE bill_items DROP CONSTRAINT chk_discount_range;
    END IF;
END $$;

-- Add discount_type column to quotation_items table
ALTER TABLE quotation_items 
ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'amount'));

-- Add discount_type column to bill_items table  
ALTER TABLE bill_items 
ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'amount'));

-- Modify the discount column to allow for larger values (for amount-based discounts)
-- Change from DECIMAL(5,2) to DECIMAL(10,2) to accommodate larger amounts
ALTER TABLE quotation_items ALTER COLUMN discount TYPE DECIMAL(10,2);
ALTER TABLE bill_items ALTER COLUMN discount TYPE DECIMAL(10,2);

-- Update existing records to have 'percentage' as default
UPDATE quotation_items SET discount_type = 'percentage' WHERE discount_type IS NULL;
UPDATE bill_items SET discount_type = 'percentage' WHERE discount_type IS NULL;

-- Add new check constraint that considers discount_type
ALTER TABLE quotation_items ADD CONSTRAINT chk_discount_valid 
    CHECK (
        (discount_type = 'percentage' AND discount >= 0 AND discount <= 100) OR
        (discount_type = 'amount' AND discount >= 0)
    );

ALTER TABLE bill_items ADD CONSTRAINT chk_discount_valid 
    CHECK (
        (discount_type = 'percentage' AND discount >= 0 AND discount <= 100) OR
        (discount_type = 'amount' AND discount >= 0)
    );


--testing commit
