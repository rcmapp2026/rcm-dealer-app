-- Wallet System Setup for RCM Dealer App
-- This file sets up the necessary tables for the wallet and money request system

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id TEXT NOT NULL UNIQUE,
    balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_wallet_dealer 
        FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE
);

-- Create add_money_requests table
CREATE TABLE IF NOT EXISTS add_money_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
    notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Foreign key constraint
    CONSTRAINT fk_add_money_request_dealer 
        FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE
);

-- Create company_profile table
CREATE TABLE IF NOT EXISTS company_profile (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    upi_id TEXT NOT NULL,
    support_number TEXT NOT NULL,
    address TEXT NOT NULL,
    email TEXT,
    website TEXT,
    gst_number TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wallet_notifications table
CREATE TABLE IF NOT EXISTS wallet_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    transaction_id TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_wallet_notification_dealer 
        FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE
);

-- Create indexes for wallets
CREATE INDEX IF NOT EXISTS idx_wallets_dealer_id ON wallets(dealer_id);
CREATE INDEX IF NOT EXISTS idx_wallets_balance ON wallets(balance);
CREATE INDEX IF NOT EXISTS idx_wallets_updated_at ON wallets(updated_at);

-- Create indexes for add_money_requests
CREATE INDEX IF NOT EXISTS idx_add_money_requests_dealer_id ON add_money_requests(dealer_id);
CREATE INDEX IF NOT EXISTS idx_add_money_requests_status ON add_money_requests(status);
CREATE INDEX IF NOT EXISTS idx_add_money_requests_transaction_id ON add_money_requests(transaction_id);
CREATE INDEX IF NOT EXISTS idx_add_money_requests_created_at ON add_money_requests(created_at);

-- Create indexes for company_profile
CREATE INDEX IF NOT EXISTS idx_company_profile_is_active ON company_profile(is_active);

-- Create indexes for wallet_notifications
CREATE INDEX IF NOT EXISTS idx_wallet_notifications_dealer_id ON wallet_notifications(dealer_id);
CREATE INDEX IF NOT EXISTS idx_wallet_notifications_is_read ON wallet_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_wallet_notifications_created_at ON wallet_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_wallet_notifications_type ON wallet_notifications(type);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_wallets_updated_at ON wallets;
CREATE TRIGGER update_wallets_updated_at 
    BEFORE UPDATE ON wallets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_add_money_requests_updated_at ON add_money_requests;
CREATE TRIGGER update_add_money_requests_updated_at 
    BEFORE UPDATE ON add_money_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_profile_updated_at ON company_profile;
CREATE TRIGGER update_company_profile_updated_at 
    BEFORE UPDATE ON company_profile 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_money_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_notifications ENABLE ROW LEVEL SECURITY;

-- Policy for wallets - users can only see their own wallet
CREATE POLICY "Users can view own wallet" ON wallets
    FOR SELECT USING (dealer_id = auth.uid()::text);

-- Policy for add_money_requests - users can only see their own requests
CREATE POLICY "Users can view own add money requests" ON add_money_requests
    FOR SELECT USING (dealer_id = auth.uid()::text);

-- Policy for inserting add money requests
CREATE POLICY "Users can insert own add money requests" ON add_money_requests
    FOR INSERT WITH CHECK (dealer_id = auth.uid()::text);

-- Policy for wallet_notifications - users can only see their own notifications
CREATE POLICY "Users can view own wallet notifications" ON wallet_notifications
    FOR SELECT USING (dealer_id = auth.uid()::text);

-- Policy for updating wallet_notifications (mark as read)
CREATE POLICY "Users can update own wallet notifications" ON wallet_notifications
    FOR UPDATE USING (dealer_id = auth.uid()::text);

-- Grant permissions
GRANT ALL ON wallets TO authenticated;
GRANT ALL ON add_money_requests TO authenticated;
GRANT ALL ON wallet_notifications TO authenticated;
GRANT SELECT ON company_profile TO authenticated;

-- Create view for wallet analytics
CREATE OR REPLACE VIEW wallet_analytics AS
SELECT 
    d.id as dealer_id,
    d.shop_name,
    d.owner_name,
    d.mobile,
    COALESCE(w.balance, 0) as current_balance,
    COUNT(amr.id) as total_requests,
    COUNT(CASE WHEN amr.status = 'SUCCESS' THEN 1 END) as successful_requests,
    COUNT(CASE WHEN amr.status = 'FAILED' THEN 1 END) as failed_requests,
    COALESCE(SUM(CASE WHEN amr.status = 'SUCCESS' THEN amr.amount ELSE 0 END), 0) as total_amount_added,
    MAX(amr.created_at) as last_request_date
FROM dealers d
LEFT JOIN wallets w ON d.id = w.dealer_id
LEFT JOIN add_money_requests amr ON d.id = amr.dealer_id
GROUP BY d.id, d.shop_name, d.owner_name, d.mobile, w.balance;

-- Grant access to analytics view
GRANT SELECT ON wallet_analytics TO authenticated;

-- Create function to create wallet for new dealers
CREATE OR REPLACE FUNCTION create_wallet_for_new_dealer()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wallets (dealer_id, balance)
    VALUES (NEW.id, 0);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically create wallet for new dealers
DROP TRIGGER IF EXISTS create_wallet_trigger ON dealers;
CREATE TRIGGER create_wallet_trigger
    AFTER INSERT ON dealers
    FOR EACH ROW EXECUTE FUNCTION create_wallet_for_new_dealer();

-- Create function to handle money request approval
CREATE OR REPLACE FUNCTION handle_money_request_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changed to SUCCESS, update wallet balance
    IF OLD.status != 'SUCCESS' AND NEW.status = 'SUCCESS' THEN
        UPDATE wallets 
        SET balance = balance + NEW.amount 
        WHERE dealer_id = NEW.dealer_id;
        
        -- Create notification for successful request
        INSERT INTO wallet_notifications (dealer_id, title, message, type, transaction_id)
        VALUES (
            NEW.dealer_id,
            'Money Request Approved',
            'Your request for ₹' || NEW.amount || ' has been approved and added to your wallet.',
            'success',
            NEW.transaction_id
        );
        
        -- Create ledger entry
        INSERT INTO ledger (dealer_id, type, amount, note, date, narration)
        VALUES (
            NEW.dealer_id,
            'credit',
            NEW.amount,
            'Wallet recharge approved',
            NOW(),
            'Money request approved: ' || NEW.transaction_id
        );
    END IF;
    
    -- If status changed to FAILED, create notification
    IF OLD.status != 'FAILED' AND NEW.status = 'FAILED' THEN
        INSERT INTO wallet_notifications (dealer_id, title, message, type, transaction_id)
        VALUES (
            NEW.dealer_id,
            'Money Request Rejected',
            COALESCE(NEW.admin_notes, 'Your money request has been rejected by admin.'),
            'error',
            NEW.transaction_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for money request status changes
DROP TRIGGER IF EXISTS handle_money_request_approval_trigger ON add_money_requests;
CREATE TRIGGER handle_money_request_approval_trigger
    AFTER UPDATE ON add_money_requests
    FOR EACH ROW EXECUTE FUNCTION handle_money_request_approval();

-- Insert default company profile if table is empty
INSERT INTO company_profile (
    company_name, 
    upi_id, 
    support_number, 
    address
) 
SELECT 
    'RCM HARDWARE',
    'rcmdealer@upi',
    '9471217445',
    'NH-28, Near Bus Stand, Chakia, East Champaran, Bihar - 845412'
WHERE NOT EXISTS (SELECT 1 FROM company_profile LIMIT 1);

-- Comments for documentation
COMMENT ON TABLE wallets IS 'Stores wallet balance for each dealer';
COMMENT ON TABLE add_money_requests IS 'Stores money recharge requests from dealers';
COMMENT ON TABLE company_profile IS 'Company profile and payment details';
COMMENT ON TABLE wallet_notifications IS 'Notifications related to wallet transactions';
COMMENT ON VIEW wallet_analytics IS 'Analytics view for wallet data and requests';
