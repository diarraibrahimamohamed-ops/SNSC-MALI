-- Vaccin-Track Database Initialization
-- This script is executed when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
-- These will be created after the tables are created by migrations

-- Index for UUID columns (will be created by migrations)
-- CREATE INDEX IF NOT EXISTS idx_centres_sante_uuid ON centres_sante(uuid);
-- CREATE INDEX IF NOT EXISTS idx_enfants_uuid ON enfants(uuid);
-- CREATE INDEX IF NOT EXISTS idx_tuteurs_uuid ON tuteurs(uuid);

-- Full-text search indexes
-- CREATE INDEX IF NOT EXISTS idx_enfants_nom_trgm ON enfants USING gin(nom gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS idx_enfants_prenom_trgm ON enfants USING gin(prenom gin_trgm_ops);

-- Performance optimization indexes
-- CREATE INDEX IF NOT EXISTS idx_actes_vaccinaux_enfant_date ON actes_vaccinaux(enfant_id, date_vaccination);
-- CREATE INDEX IF NOT EXISTS idx_notifications_sms_statut ON notifications_sms(statut);
-- CREATE INDEX IF NOT EXISTS idx_journaux_audit_date ON journaux_audit(created_at);

-- Set timezone
SET timezone = 'UTC';
