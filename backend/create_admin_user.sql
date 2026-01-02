-- Create admin user for testing
INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified) 
VALUES (
  'admin@example.com', 
  '$2b$12$lbE2r32eb3Hl/WxHYL8xT.1M.OH3vjVyMqgET2K7aRHGcKz5lcJkq', -- password: admin123
  'Admin', 
  'User', 
  'admin', 
  true
);
