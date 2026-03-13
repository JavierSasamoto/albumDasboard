/*
  # Create cromos_info table for Album Dashboard

  1. New Tables
    - `cromos_info`
      - `id` (uuid, primary key) - Unique identifier for each cromo
      - `nombre` (text) - Name of the cromo
      - `seleccion` (text) - Selection/category of the cromo
      - `rareza` (enum) - Rarity level: Común, Inusual, Raro, Épico, Legendario, Único
      - `imagen_url` (text) - URL to the cromo image in storage bucket
      - `informacion_tecnica` (jsonb) - Additional technical information in JSON format
      - `created_at` (timestamptz) - Timestamp when the cromo was created

  2. Security
    - Enable RLS on `cromos_info` table
    - Add policy for authenticated users to read all cromos
    - Add policy for authenticated users to insert cromos
    - Add policy for authenticated users to update cromos
    - Add policy for authenticated users to delete cromos
*/

CREATE TYPE rareza_enum AS ENUM ('Común', 'Inusual', 'Raro', 'Épico', 'Legendario', 'Único');

CREATE TABLE IF NOT EXISTS cromos_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  seleccion text,
  rareza rareza_enum NOT NULL DEFAULT 'Común',
  imagen_url text,
  informacion_tecnica jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cromos_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all cromos"
  ON cromos_info FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert cromos"
  ON cromos_info FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update cromos"
  ON cromos_info FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete cromos"
  ON cromos_info FOR DELETE
  TO authenticated
  USING (true);