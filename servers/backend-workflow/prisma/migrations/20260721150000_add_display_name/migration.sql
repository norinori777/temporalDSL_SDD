-- Add displayName to existing action schemas with a safe default for legacy rows.
ALTER TABLE "ActionSchema"
ADD COLUMN IF NOT EXISTS "displayName" TEXT NOT NULL DEFAULT '';