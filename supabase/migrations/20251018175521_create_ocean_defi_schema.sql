/*
  # Ocean DeFi Database Schema

  ## Overview
  Complete database schema for caching Ocean DeFi blockchain data and user information.
  This enables faster queries, historical tracking, and analytics while reducing blockchain calls.

  ## New Tables
  
  ### 1. `users`
  Stores user profile and wallet information
  - `id` (uuid, primary key) - Internal user ID
  - `wallet_address` (text, unique) - User's blockchain wallet address
  - `username` (text, optional) - Display name
  - `email` (text, optional) - Contact email
  - `referral_code` (text, unique) - User's referral code
  - `upline_address` (text) - Wallet address of referring user
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `portfolios`
  Caches user portfolio data from blockchain
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References users table
  - `wallet_address` (text) - User's wallet address
  - `portfolio_id` (bigint) - On-chain portfolio ID
  - `principal_rama` (text) - Staked RAMA amount (as string for precision)
  - `principal_usd` (text) - Staked USD value
  - `credited_rama` (text) - Total credited RAMA including earnings
  - `cap_rama` (text) - Maximum earnings cap
  - `cap_percentage` (integer) - Cap percentage (200 or 250)
  - `is_booster` (boolean) - Whether booster is active
  - `tier` (integer) - Tier level (1 or 2)
  - `daily_rate_bps` (integer) - Daily rate in basis points
  - `is_active` (boolean) - Portfolio active status
  - `frozen_until` (timestamptz) - Freeze end timestamp
  - `created_at` (timestamptz) - Portfolio creation time
  - `updated_at` (timestamptz) - Last blockchain sync time

  ### 3. `user_stats`
  Caches aggregated user statistics
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key, unique) - One record per user
  - `wallet_address` (text, unique)
  - `total_staked_usd` (text) - Total staked amount
  - `total_earned_rama` (text) - Total earnings
  - `safe_wallet_rama` (text) - Safe wallet balance
  - `direct_count` (integer) - Number of direct referrals
  - `team_count` (integer) - Total team size
  - `slab_index` (integer) - Current slab level
  - `qualified_volume_usd` (text) - Qualified volume for slab
  - `royalty_tier` (integer) - Royalty level
  - `royalty_paused` (boolean) - Royalty pause status
  - `last_synced_at` (timestamptz) - Last blockchain sync
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `transactions`
  Records all user transactions
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `wallet_address` (text)
  - `transaction_hash` (text, unique) - Blockchain tx hash
  - `transaction_type` (text) - Type: stake, claim, transfer, etc.
  - `amount_usd` (text) - Transaction amount in USD
  - `amount_rama` (text) - Transaction amount in RAMA
  - `status` (text) - Status: pending, confirmed, failed
  - `from_wallet` (text) - Source wallet
  - `to_wallet` (text) - Destination wallet
  - `block_number` (bigint) - Block number
  - `gas_used` (text) - Gas consumed
  - `metadata` (jsonb) - Additional transaction data
  - `created_at` (timestamptz) - Transaction timestamp

  ### 5. `earnings_history`
  Daily earnings tracking for analytics
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `wallet_address` (text)
  - `date` (date) - Earning date
  - `earning_type` (text) - Type: roi, slab, royalty, spot, reward
  - `amount_usd` (text) - Amount in USD
  - `amount_rama` (text) - Amount in RAMA
  - `portfolio_id` (bigint) - Associated portfolio
  - `claimed` (boolean) - Whether claimed
  - `claim_tx_hash` (text) - Claim transaction hash
  - `created_at` (timestamptz)

  ### 6. `team_network`
  Caches team structure for performance
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `wallet_address` (text)
  - `upline_id` (uuid, foreign key) - Parent user
  - `upline_address` (text) - Parent wallet
  - `level` (integer) - Depth in tree (1 = direct)
  - `leg_index` (integer) - Which leg in upline's network
  - `total_staked_usd` (text) - Member's total stake
  - `is_active` (boolean) - Active status
  - `joined_at` (timestamptz) - Join date
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 7. `slab_claims`
  Tracks slab income claims
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `wallet_address` (text)
  - `slab_level` (integer) - Slab level at claim time
  - `claim_amount_usd` (text) - Claimed amount USD
  - `claim_amount_rama` (text) - Claimed amount RAMA
  - `transaction_hash` (text) - Claim tx hash
  - `claimed_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 8. `royalty_claims`
  Tracks royalty program claims
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `wallet_address` (text)
  - `royalty_level` (integer) - Royalty tier
  - `claim_amount_usd` (text) - Monthly royalty amount
  - `claim_amount_rama` (text) - Amount in RAMA
  - `claim_month` (text) - Month identifier (YYYY-MM)
  - `transaction_hash` (text)
  - `claimed_at` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Policies check auth.uid() or wallet_address matching
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  username text,
  email text,
  referral_code text UNIQUE,
  upline_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Anyone can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  portfolio_id bigint NOT NULL,
  principal_rama text DEFAULT '0',
  principal_usd text DEFAULT '0',
  credited_rama text DEFAULT '0',
  cap_rama text DEFAULT '0',
  cap_percentage integer DEFAULT 200,
  is_booster boolean DEFAULT false,
  tier integer DEFAULT 1,
  daily_rate_bps integer DEFAULT 33,
  is_active boolean DEFAULT true,
  frozen_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(wallet_address, portfolio_id)
);

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own portfolios"
  ON portfolios FOR SELECT
  TO authenticated
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert own portfolios"
  ON portfolios FOR INSERT
  TO authenticated
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can update own portfolios"
  ON portfolios FOR UPDATE
  TO authenticated
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  wallet_address text UNIQUE NOT NULL,
  total_staked_usd text DEFAULT '0',
  total_earned_rama text DEFAULT '0',
  safe_wallet_rama text DEFAULT '0',
  direct_count integer DEFAULT 0,
  team_count integer DEFAULT 0,
  slab_index integer DEFAULT 0,
  qualified_volume_usd text DEFAULT '0',
  royalty_tier integer DEFAULT 0,
  royalty_paused boolean DEFAULT false,
  last_synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own stats"
  ON user_stats FOR SELECT
  TO authenticated
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  TO authenticated
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  TO authenticated
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  transaction_hash text UNIQUE,
  transaction_type text NOT NULL,
  amount_usd text DEFAULT '0',
  amount_rama text DEFAULT '0',
  status text DEFAULT 'pending',
  from_wallet text,
  to_wallet text,
  block_number bigint,
  gas_used text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Create earnings_history table
CREATE TABLE IF NOT EXISTS earnings_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  date date NOT NULL,
  earning_type text NOT NULL,
  amount_usd text DEFAULT '0',
  amount_rama text DEFAULT '0',
  portfolio_id bigint,
  claimed boolean DEFAULT false,
  claim_tx_hash text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE earnings_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own earnings"
  ON earnings_history FOR SELECT
  TO authenticated
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert own earnings"
  ON earnings_history FOR INSERT
  TO authenticated
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can update own earnings"
  ON earnings_history FOR UPDATE
  TO authenticated
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Create team_network table
CREATE TABLE IF NOT EXISTS team_network (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  upline_id uuid REFERENCES users(id),
  upline_address text,
  level integer DEFAULT 1,
  leg_index integer DEFAULT 0,
  total_staked_usd text DEFAULT '0',
  is_active boolean DEFAULT true,
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE team_network ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read team network"
  ON team_network FOR SELECT
  TO authenticated
  USING (
    upline_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    OR wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
  );

CREATE POLICY "Users can insert team members"
  ON team_network FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update team network"
  ON team_network FOR UPDATE
  TO authenticated
  USING (
    upline_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    OR wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
  )
  WITH CHECK (
    upline_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    OR wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
  );

-- Create slab_claims table
CREATE TABLE IF NOT EXISTS slab_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  slab_level integer NOT NULL,
  claim_amount_usd text DEFAULT '0',
  claim_amount_rama text DEFAULT '0',
  transaction_hash text,
  claimed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE slab_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own slab claims"
  ON slab_claims FOR SELECT
  TO authenticated
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert own slab claims"
  ON slab_claims FOR INSERT
  TO authenticated
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Create royalty_claims table
CREATE TABLE IF NOT EXISTS royalty_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  royalty_level integer NOT NULL,
  claim_amount_usd text DEFAULT '0',
  claim_amount_rama text DEFAULT '0',
  claim_month text NOT NULL,
  transaction_hash text,
  claimed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE royalty_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own royalty claims"
  ON royalty_claims FOR SELECT
  TO authenticated
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert own royalty claims"
  ON royalty_claims FOR INSERT
  TO authenticated
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_portfolios_wallet ON portfolios(wallet_address);
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_wallet ON user_stats(wallet_address);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_earnings_wallet_date ON earnings_history(wallet_address, date);
CREATE INDEX IF NOT EXISTS idx_team_wallet ON team_network(wallet_address);
CREATE INDEX IF NOT EXISTS idx_team_upline ON team_network(upline_address);
CREATE INDEX IF NOT EXISTS idx_slab_wallet ON slab_claims(wallet_address);
CREATE INDEX IF NOT EXISTS idx_royalty_wallet ON royalty_claims(wallet_address);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_portfolios_updated_at ON portfolios;
CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_network_updated_at ON team_network;
CREATE TRIGGER update_team_network_updated_at
  BEFORE UPDATE ON team_network
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();