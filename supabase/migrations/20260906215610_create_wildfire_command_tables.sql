/*
# Create tables for Guia de Comando de Incêndios Florestais

1. Overview
This migration creates the database schema for a wildfire command guide app
("Guia de Comando para Incêndios Florestais") used by fire commanders (COS).
The app is a single-tenant, no-auth tool for recording and managing wildfire
operations data during active incidents.

2. New Tables

- `ocorrencias` (occurrences)
  - `id` (uuid, primary key)
  - `numero` (text) - occurrence number (e.g. "Ocorr. Nº")
  - `designacao` (text) - occurrence name/designation
  - `freguesia` (text) - parish
  - `municipio` (text) - municipality
  - `coordenadas` (text) - GPS coordinates
  - `estado` (text) - status: 'ativo' | 'dominado' | 'extinto' | 'rescaldo'
  - `fase` (text) - SGO phase: 'reconhecimento' | 'curso' | 'conclusao'
  - `data_hora` (timestamptz) - date and time of occurrence start
  - `hr_no_to` (text) - time arrived at TO (Teatro de Operações)
  - `intensidade` (text) - 'fraca' | 'moderada' | 'muita'
  - `tipo_combustivel` (text) - mato, pinhal, eucaliptal, agrícola, povoamento misto
  - `propagacao` (text) - direction of propagation (cardeal point)
  - `vento_direcao` (text) - wind direction
  - `vento_velocidade` (text) - wind speed (km/h)
  - `temperatura` (text) - temperature (°C)
  - `humidade` (text) - humidity (%HR)
  - `declive` (text) - 'suave' | 'moderado' | 'acentuado' | 'plano'
  - `acessos` (text) - 'bons' | 'dificeis' | 'sem_acessos' | 'estrada_asfaltada' | 'estradoes' | 'todo_terreno'
  - `pontos_sensiveis` (text) - sensitive points (habitações, indústria, comércio, outros)
  - `manobra` (text) - maneuver: ataque_cabeca, ataque_flancos, defesa_ponto_sensivel, rescaldo
  - `assumo_cos` (text) - who assumes COS
  - `passagem_cos_para` (text) - COS handover to
  - `siresp_canal` (text) - SIRESP radio channel
  - `observacoes` (text) - general notes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

- `pontos_situacao` (situation updates / POSITs)
  - `id` (uuid, primary key)
  - `ocorrencia_id` (uuid, FK to ocorrencias)
  - `numero_posit` (int) - POSIT number (1st, 2nd, 3rd, 4th...)
  - `hr_posit` (text) - time of POSIT
  - `faço` (text) - what I am doing
  - `vejo` (text) - what I see
  - `em` (text) - location
  - `com` (text) - with whom
  - `solicito` (text) - resources requested
  - `progredir_para` (text) - progressing to
  - `observacoes` (text) - notes
  - `created_at` (timestamptz)

- `meios` (resources allocated)
  - `id` (uuid, primary key)
  - `ocorrencia_id` (uuid, FK to ocorrencias)
  - `meio` (text) - resource type: brigada_combate, grupo_combate, meio_aereo, outros
  - `entidade` (text) - entity/organization
  - `quantidade` (int) - quantity
  - `missao` (text) - mission assigned
  - `hr_no_to` (text) - time at TO
  - `created_at` (timestamptz)

3. Security
- RLS enabled on all tables.
- Single-tenant, no-auth app: policies use `TO anon, authenticated` with `USING (true)`
  because the data is intentionally shared/public within the tool.
*/

CREATE TABLE IF NOT EXISTS ocorrencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text,
  designacao text,
  freguesia text,
  municipio text,
  coordenadas text,
  estado text NOT NULL DEFAULT 'ativo',
  fase text NOT NULL DEFAULT 'reconhecimento',
  data_hora timestamptz DEFAULT now(),
  hr_no_to text,
  intensidade text,
  tipo_combustivel text,
  propagacao text,
  vento_direcao text,
  vento_velocidade text,
  temperatura text,
  humidade text,
  declive text,
  acessos text,
  pontos_sensiveis text,
  manobra text,
  assumo_cos text,
  passagem_cos_para text,
  siresp_canal text,
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ocorrencias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_ocorrencias" ON ocorrencias;
CREATE POLICY "anon_select_ocorrencias" ON ocorrencias FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_ocorrencias" ON ocorrencias;
CREATE POLICY "anon_insert_ocorrencias" ON ocorrencias FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_ocorrencias" ON ocorrencias;
CREATE POLICY "anon_update_ocorrencias" ON ocorrencias FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_ocorrencias" ON ocorrencias;
CREATE POLICY "anon_delete_ocorrencias" ON ocorrencias FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS pontos_situacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ocorrencia_id uuid NOT NULL REFERENCES ocorrencias(id) ON DELETE CASCADE,
  numero_posit int NOT NULL DEFAULT 1,
  hr_posit text,
  faço text,
  vejo text,
  em text,
  com text,
  solicito text,
  progredir_para text,
  observacoes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pontos_situacao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_pontos_situacao" ON pontos_situacao;
CREATE POLICY "anon_select_pontos_situacao" ON pontos_situacao FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_pontos_situacao" ON pontos_situacao;
CREATE POLICY "anon_insert_pontos_situacao" ON pontos_situacao FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_pontos_situacao" ON pontos_situacao;
CREATE POLICY "anon_update_pontos_situacao" ON pontos_situacao FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_pontos_situacao" ON pontos_situacao;
CREATE POLICY "anon_delete_pontos_situacao" ON pontos_situacao FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS meios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ocorrencia_id uuid NOT NULL REFERENCES ocorrencias(id) ON DELETE CASCADE,
  meio text NOT NULL,
  entidade text,
  quantidade int DEFAULT 1,
  missao text,
  hr_no_to text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_meios" ON meios;
CREATE POLICY "anon_select_meios" ON meios FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_meios" ON meios;
CREATE POLICY "anon_insert_meios" ON meios FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_meios" ON meios;
CREATE POLICY "anon_update_meios" ON meios FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_meios" ON meios;
CREATE POLICY "anon_delete_meios" ON meios FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_pontos_situacao_ocorrencia_id ON pontos_situacao(ocorrencia_id);
CREATE INDEX IF NOT EXISTS idx_meios_ocorrencia_id ON meios(ocorrencia_id);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_estado ON ocorrencias(estado);
