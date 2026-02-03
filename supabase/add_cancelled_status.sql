-- Add 'cancelled' value to complaint_status enum
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

ALTER TYPE complaint_status ADD VALUE IF NOT EXISTS 'cancelled';

-- Verify the change
SELECT enum_range(NULL::complaint_status);
