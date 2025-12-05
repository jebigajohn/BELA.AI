-- Storage Order Table
-- Speichert die Reihenfolge von Dateien in Storage Buckets

CREATE TABLE IF NOT EXISTS storage_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL UNIQUE,
  file_order TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index für schnelle Bucket-Lookups
CREATE INDEX IF NOT EXISTS idx_storage_order_bucket ON storage_order(bucket);

-- RLS aktivieren
ALTER TABLE storage_order ENABLE ROW LEVEL SECURITY;

-- Alle können lesen (für öffentliche Anzeige)
CREATE POLICY "Anyone can read storage order"
  ON storage_order FOR SELECT
  USING (true);

-- Nur Admins können schreiben (wird über Service Role Key gemacht)
