
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
    console.log('📊 Verifying Migration Data...\n');

    // Categories
    const { data: categories } = await supabase.from('categories').select('id, name');
    console.log(`📁 Categories: ${categories?.length || 0}`);
    categories?.forEach(c => console.log(`   ${c.id}. ${c.name}`));

    // Subcategories  
    const { data: subcategories } = await supabase.from('subcategories').select('id, name, category_id');
    console.log(`\n📂 Subcategories: ${subcategories?.length || 0}`);
    subcategories?.forEach(s => console.log(`   ${s.id}. ${s.name} (Cat: ${s.category_id})`));

    // States
    const { data: states } = await supabase.from('states').select('id, name');
    console.log(`\n📍 States/Branches: ${states?.length || 0}`);
    states?.forEach(s => console.log(`   ${s.id}. ${s.name}`));

    // Brands
    const { data: brands } = await supabase.from('brands').select('id, name');
    console.log(`\n🏷️ Brands: ${brands?.length || 0}`);
    brands?.forEach(b => console.log(`   ${b.id}. ${b.name}`));

    // Users
    const { data: users } = await supabase.from('users').select('id, full_name, ic_number, email, status');
    console.log(`\n👥 Users: ${users?.length || 0}`);
    users?.forEach(u => console.log(`   - ${u.full_name} (IC: ${u.ic_number}, Email: ${u.email}, Status: ${u.status})`));

    // Technicians
    const { data: technicians } = await supabase.from('technicians').select('id, name, username, department, is_active');
    console.log(`\n🔧 Technicians: ${technicians?.length || 0}`);
    technicians?.forEach(t => console.log(`   - ${t.name} (${t.username}) - ${t.department} - Active: ${t.is_active}`));

    // Admins
    const { data: admins } = await supabase.from('admins').select('id, username, admin_name');
    console.log(`\n👑 Admins: ${admins?.length || 0}`);
    admins?.forEach(a => console.log(`   - ${a.admin_name} (${a.username})`));

    // Complaints
    const { data: complaints } = await supabase.from('complaints').select('id, report_number, status');
    console.log(`\n📋 Complaints: ${complaints?.length || 0}`);
    complaints?.forEach(c => console.log(`   - ${c.report_number} (${c.status})`));

    console.log('\n✅ Verification complete!');
}

verifyMigration();
