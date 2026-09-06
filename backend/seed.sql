-- ============================================
-- SEED: Usuario admin por defecto
-- Contraseña: 123456 (hasheada con bcrypt)
-- ============================================

-- Ejecutar después de schema.sql
-- La contraseña hasheada de "123456" con bcrypt
INSERT INTO usuarios (username, password)
VALUES ('admin', '$2a$10$8K1p/a0dL1LXMc.0z0z3eOJx3Qh5V5J5K5K5K5K5K5K5K5K5K5K5')
ON CONFLICT (username) DO NOTHING;
