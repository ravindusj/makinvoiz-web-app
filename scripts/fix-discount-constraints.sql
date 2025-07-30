-- Fix discount constraint issue for amount-based discounts
-- This script addresses the "chk_discount_range" constraint violation

-- First, try to drop any existing discount-related constraints
DO $$ 
DECLARE 
    constraint_rec RECORD;
BEGIN 
    -- Find and drop all check constraints on discount column for quotation_items
    FOR constraint_rec IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'quotation_items' 
        AND constraint_type = 'CHECK'
        AND constraint_name LIKE '%discount%'
    LOOP
        EXECUTE 'ALTER TABLE quotation_items DROP CONSTRAINT ' || constraint_rec.constraint_name;
    END LOOP;
    
    -- Find and drop all check constraints on discount column for bill_items
    FOR constraint_rec IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'bill_items' 
        AND constraint_type = 'CHECK'
        AND constraint_name LIKE '%discount%'
    LOOP
        EXECUTE 'ALTER TABLE bill_items DROP CONSTRAINT ' || constraint_rec.constraint_name;
    END LOOP;
END $$;

-- Add discount_type column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotation_items' AND column_name='discount_type') THEN
        ALTER TABLE quotation_items ADD COLUMN discount_type VARCHAR(20) DEFAULT 'percentage';
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bill_items' AND column_name='discount_type') THEN
        ALTER TABLE bill_items ADD COLUMN discount_type VARCHAR(20) DEFAULT 'percentage';
    END IF;
END $$;

-- Modify the discount column to allow for larger values (for amount-based discounts)
ALTER TABLE quotation_items ALTER COLUMN discount TYPE DECIMAL(10,2);
ALTER TABLE bill_items ALTER COLUMN discount TYPE DECIMAL(10,2);

-- Update existing records to have 'percentage' as default
UPDATE quotation_items SET discount_type = 'percentage' WHERE discount_type IS NULL;
UPDATE bill_items SET discount_type = 'percentage' WHERE discount_type IS NULL;

-- Add new check constraints that consider discount_type
ALTER TABLE quotation_items ADD CONSTRAINT quotation_items_discount_type_check 
    CHECK (discount_type IN ('percentage', 'amount'));

ALTER TABLE bill_items ADD CONSTRAINT bill_items_discount_type_check 
    CHECK (discount_type IN ('percentage', 'amount'));

-- Add smart discount validation constraints
ALTER TABLE quotation_items ADD CONSTRAINT quotation_items_discount_value_check 
    CHECK (
        (discount_type = 'percentage' AND discount >= 0 AND discount <= 100) OR
        (discount_type = 'amount' AND discount >= 0)
    );

ALTER TABLE bill_items ADD CONSTRAINT bill_items_discount_value_check 
    CHECK (
        (discount_type = 'percentage' AND discount >= 0 AND discount <= 100) OR
        (discount_type = 'amount' AND discount >= 0)
    );
