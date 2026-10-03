/*
# Add missing fields to ocorrencias table

1. Changes
Adds fields from the original "Guia de Comando" form that were missing:

- `faco` (text) - "Faço:" what the COS is doing (FAÇO section)
- `em_local` (text) - "Em:" where the COS is operating (FAÇO section)
- `com_recursos` (text) - "Com:" resources accompanying the COS (FAÇO section)
- `solicito` (text) - "Solicito:" resources requested, to quantify (PEÇO section)
- `continuidade_vert` (text) - vertical continuity of vegetation (VEJO > Propagação)
- `continuidade_horiz` (text) - horizontal continuity of vegetation (VEJO > Propagação)

2. Security
No policy changes needed - existing RLS policies already cover these new columns.
*/

ALTER TABLE ocorrencias
  ADD COLUMN IF NOT EXISTS faco text,
  ADD COLUMN IF NOT EXISTS em_local text,
  ADD COLUMN IF NOT EXISTS com_recursos text,
  ADD COLUMN IF NOT EXISTS solicito text,
  ADD COLUMN IF NOT EXISTS continuidade_vert text,
  ADD COLUMN IF NOT EXISTS continuidade_horiz text;
