-- Payment System Setup for RCM Dealer App
-- This file sets up the necessary tables and configurations for the payment system

-- Create payment_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    utr_number TEXT NOT NULL,
    transaction_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Failed', 'Refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    
    -- Foreign key constraint if dealers table exists
    CONSTRAINT fk_payment_dealer 
        FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_requests_dealer_id ON payment_requests(dealer_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_utr ON payment_requests(utr_number);
CREATE INDEX IF NOT EXISTS idx_payment_requests_created_at ON payment_requests(created_at);

-- Create app_settings table if it doesn't exist (for UPI configuration)
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    upi_id TEXT,
    merchant_name TEXT DEFAULT 'RCM Dealer',
    payment_timeout_minutes INTEGER DEFAULT 30,
    max_retry_attempts INTEGER DEFAULT 3,
    auto_verify_upi BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default app settings if table is empty
INSERT INTO app_settings (upi_id, merchant_name) 
SELECT 'rcmdealer@upi', 'RCM Dealer'
WHERE NOT EXISTS (SELECT 1 FROM app_settings LIMIT 1);

-- Create payment_transactions table for detailed tracking
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id TEXT NOT NULL UNIQUE,
    dealer_id TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    upi_id TEXT NOT NULL,
    merchant_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
    payment_method TEXT, -- 'gpay', 'phonepe', 'paytm', etc.
    utr_number TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Foreign key constraint
    CONSTRAINT fk_transaction_dealer 
        FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE
);

-- Create indexes for payment_transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_dealer_id ON payment_transactions(dealer_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_payment_requests_updated_at ON payment_requests;
CREATE TRIGGER update_payment_requests_updated_at 
    BEFORE UPDATE ON payment_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at 
    BEFORE UPDATE ON payment_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at 
    BEFORE UPDATE ON app_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policy for payment_requests - users can only see their own requests
CREATE POLICY "Users can view own payment requests" ON payment_requests
    FOR SELECT USING (dealer_id = auth.uid()::text);

-- Policy for payment_transactions - users can only see their own transactions
CREATE POLICY "Users can view own payment transactions" ON payment_transactions
    FOR SELECT USING (dealer_id = auth.uid()::text);

-- Policy for inserting payment requests
CREATE POLICY "Users can insert own payment requests" ON payment_requests
    FOR INSERT WITH CHECK (dealer_id = auth.uid()::text);

-- Policy for inserting payment transactions
CREATE POLICY "Users can insert own payment transactions" ON payment_transactions
    FOR INSERT WITH CHECK (dealer_id = auth.uid()::text);

-- Grant permissions
GRANT ALL ON payment_requests TO authenticated;
GRANT ALL ON payment_transactions TO authenticated;
GRANT SELECT ON app_settings TO authenticated;

-- Create view for payment analytics
CREATE OR REPLACE VIEW payment_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as payment_date,
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_transactions,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
    SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END) as total_revenue,
    AVG(CASE WHEN status = 'success' THEN amount END) as avg_successful_amount
FROM payment_transactions 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY payment_date DESC;

-- Grant access to analytics view
GRANT SELECT ON payment_analytics TO authenticated;

-- Comments for documentation
COMMENT ON TABLE payment_requests IS 'Stores payment verification requests from dealers';
COMMENT ON TABLE payment_transactions IS 'Detailed transaction history for all payment attempts';
COMMENT ON TABLE app_settings IS 'Application-wide settings including UPI configuration';
COMMENT ON VIEW payment_analytics IS 'Payment analytics for the last 30 days';
