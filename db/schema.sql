-- Add blob_url column to logos table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'logos' AND column_name = 'blob_url'
    ) THEN
        ALTER TABLE logos ADD COLUMN blob_url TEXT;
    END IF;
END $$;

-- Add exported_formats column to logos table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'logos' AND column_name = 'exported_formats'
    ) THEN
        ALTER TABLE logos ADD COLUMN exported_formats JSONB DEFAULT '{}';
    END IF;
END $$;
