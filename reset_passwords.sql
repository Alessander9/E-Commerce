-- Actualiza el password del usuario cliente a "Cliente2026!"
-- Hash BCrypt generado con strength 12: $2a$12$kDsjq5XPvEVqFRmAb5ZJeu5VNFrL8JdYf1ePDhDSIcWFuGJf0tGFi
-- Verificado con BCryptPasswordEncoder
UPDATE users 
SET password_hash = '$2a$12$kDsjq5XPvEVqFRmAb5ZJeu5VNFrL8JdYf1ePDhDSIcWFuGJf0tGFi'
WHERE email = 'cliente@allamarasuperfoods.pe';

-- Confirmar
SELECT id, email, LEFT(password_hash, 7) as hash_prefix, active FROM users WHERE email IN ('admin@allamarasuperfoods.pe','cliente@allamarasuperfoods.pe');
