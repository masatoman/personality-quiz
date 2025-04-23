-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set up auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Create users table
CREATE TABLE IF NOT EXISTS auth.users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    encrypted_password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    raw_app_meta_data JSONB DEFAULT '{}'::JSONB,
    raw_user_meta_data JSONB DEFAULT '{}'::JSONB,
    is_super_admin BOOLEAN DEFAULT FALSE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    confirmation_token TEXT,
    confirmation_sent_at TIMESTAMP WITH TIME ZONE,
    recovery_token TEXT,
    recovery_sent_at TIMESTAMP WITH TIME ZONE,
    email_change_token TEXT,
    email_change TEXT,
    email_change_sent_at TIMESTAMP WITH TIME ZONE,
    last_password_reset_at TIMESTAMP WITH TIME ZONE
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS auth.sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    factor_id uuid,
    aal aal_level DEFAULT 'aal1'::aal_level,
    not_after TIMESTAMP WITH TIME ZONE
);

-- Create refresh tokens table
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    token TEXT NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS auth.audit_log_entries (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    payload JSON,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT DEFAULT '',
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users (email);
CREATE INDEX IF NOT EXISTS users_instance_id_email_idx ON auth.users (email);
CREATE INDEX IF NOT EXISTS refresh_tokens_token_idx ON auth.refresh_tokens (token);
CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_idx ON auth.refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON auth.sessions (user_id);
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON auth.audit_log_entries (user_id);

-- Set up row level security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" ON auth.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON auth.users
    FOR UPDATE USING (auth.uid() = id);

-- Create functions
CREATE OR REPLACE FUNCTION auth.email_exists(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users WHERE users.email = email_exists.email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 