-- ClawMint MVP Database Schema

-- Wallets table: stores user token balances
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'demo-user',
  balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table: stores payment history
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  task_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'rejected', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memory logs table: stores past task info for AI cost estimation
CREATE TABLE IF NOT EXISTS mem_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type TEXT NOT NULL,
  estimated_cost NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert demo wallet if not exists
INSERT INTO wallets (user_id, balance) 
SELECT 'demo-user', 5000 
WHERE NOT EXISTS (SELECT 1 FROM wallets WHERE user_id = 'demo-user');

-- Insert sample memory logs for AI cost estimation
INSERT INTO mem_logs (task_type, estimated_cost, metadata) VALUES
  ('web_research', 0.8, '{"description": "Web research and data gathering"}'),
  ('competitor_analysis', 1.2, '{"description": "Competitor analysis and market research"}'),
  ('content_creation', 0.5, '{"description": "Content generation and writing"}'),
  ('data_analysis', 1.5, '{"description": "Data analysis and reporting"}'),
  ('translation', 0.3, '{"description": "Translation services"}');
