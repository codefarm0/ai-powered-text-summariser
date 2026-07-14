-- Schema is auto-managed by JPA (ddl-auto: update)
-- This script runs on first container initialization.
-- Reference data can be seeded here if needed.

CREATE TABLE IF NOT EXISTS schema_version (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(20) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_version (version) VALUES ('1.0.0');
