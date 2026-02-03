
-- 14. Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL, -- Link to users/technicians/admins. For admins, we might use a specific ID or null for 'broadcast' but let's be specific.
    recipient_role VARCHAR(20) NOT NULL, -- 'admin' or 'technician'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    reference_id INTEGER, -- Complaint ID
    type VARCHAR(50) NOT NULL, -- 'assignment', 'status_update', 'remark'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster fetching
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users/Admins can view their own notifications
CREATE POLICY "View own notifications" ON notifications
    FOR SELECT USING (
        (auth.uid() = recipient_id) OR
        (recipient_role = 'admin' AND EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())) 
        -- Note: Admin check depends on how auth works. If admins are in `auth.users`, fine. 
        -- If admins are separate table but share auth.uid via Supabase Auth, it matches.
    );

CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true); -- Ideally restricted to service role, but for logic triggers:
    
-- Update policy
CREATE POLICY "Update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = recipient_id);
