/*
# Add Ponto de Trânsito field to ocorrencias

1. Purpose
- Replace the "Em" (em_local) field in the FAÇO section with "Ponto de Trânsito".

2. Modified Tables
- `ocorrencias`
  - Add `ponto_transito` (text) to store the transit point under FAÇO.

3. Security
- No access model changes. Existing single-tenant RLS policies remain in place.

4. Data Safety
- Only adds a nullable column; all existing data is preserved.
*/

ALTER TABLE ocorrencias
  ADD COLUMN IF NOT EXISTS ponto_transito text;