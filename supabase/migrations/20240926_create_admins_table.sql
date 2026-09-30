-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'superadmin', 'overseer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert superadmin accounts
INSERT INTO admins (id, username, password, name, email, phone, role) VALUES
('1', 'ErgoZFood@elyonmain.app', 'ERGO@ELYON+1234', 'System Administrator', 'admin@school.edu', '+1234567890', 'superadmin'),
('2', 'HldanaZPresident@elyonmain.app', '!Hldana@ZZZ', 'President, Hldana', 'teacher@school.edu', '+1987654321', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- Insert admin accounts (teachers)
INSERT INTO admins (id, username, password, name, email, phone, role) VALUES
('3', 'ZenaZPrestigious@elyonmain.app', 'Zenane@Prestigious', 'Zena Negash', 'teacher@elyonaris.edu', '+1987654321', 'admin'),
('4', 'Asnakew@elyonmain.app', 'Asnakew@2025', 'Asnakew', 'asnakew@school.edu', '+1234567891', 'admin'),
('5', 'Habtamu@elyonmain.app', 'Habtamu@2025', 'Habtamu (Economic Teacher)', 'Habtamu@elyonmain.app', '', 'admin'),
('6', 'Kassaye@elyonmain.app', 'Kassaye@2025', 'Kassaye (Geography Teacher)', 'Kassaye@elyonmain.app', '', 'admin'),
('7', 'Tiruneh@elyonmain.app', 'Tiruneh@2025', 'Tiruneh (Physics Teacher)', 'Tiruneh @elyonmain.app', '', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert overseer accounts
INSERT INTO admins (id, username, password, name, email, phone, role) VALUES
('8', 'Lema@elyonmain.app', 'Lema@2025', 'Lema', 'Lema@school.edu', '+1234567891', 'overseer'),
('9', 'Overseer@elyonmain.app', 'Overseer@2025', 'School Director Lema', 'overseer@elyonmain.app', '+1234567892', 'overseer')
ON CONFLICT (username) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to admins (for authentication)
CREATE POLICY "Allow read access for authentication" ON admins
  FOR SELECT
  USING (true);

-- Create policy to allow admins to update their own profile
CREATE POLICY "Allow admins to update own profile" ON admins
  FOR UPDATE
  USING (auth.uid()::text = id);

-- Create policy to allow superadmins to manage all admins
CREATE POLICY "Allow superadmins full access" ON admins
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE id = auth.uid()::text AND role = 'superadmin'
    )
  );
