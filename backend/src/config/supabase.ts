import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://srshalxtikpylcfztlmz.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyc2hhbHh0aWtweWxjZnp0bG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NDk4NDAsImV4cCI6MjA4NTQyNTg0MH0.15yIT0pGWgT5UloRyDSVSA88L0mnIJKBom0L1pw9CGw';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyc2hhbHh0aWtweWxjZnp0bG16Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg0OTg0MCwiZXhwIjoyMDg1NDI1ODQwfQ.Mw4wTRl8qMDLXMXClfPqbH2WbfTH4m5eGnGtK0cXXWU';
// Client for general operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role for privileged operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export default supabase;
