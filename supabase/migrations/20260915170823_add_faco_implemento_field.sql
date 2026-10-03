/*
# Add FAÇO implemento field

1. Purpose
- Complete the Incêndios Rurais command guide fields shown in the supplied ANEPC PDF.

2. Modified Tables
- `ocorrencias`
  - Add `implemento` (text) to store the selected implementation/protocol under FAÇO.

3. Security
- No access model changes. The existing single-tenant RLS policies remain in place.

4. Data Safety
- This migration only adds a nullable column and preserves all existing occurrence data.
*/

ALTER TABLE ocorrencias
  ADD COLUMN IF NOT EXISTS implemento text;