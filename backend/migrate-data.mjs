
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Default password for migrated users (they will need to reset)
const DEFAULT_BCRYPT_PASSWORD = await bcrypt.hash('Ecare@2026', 10);

console.log('Starting data migration from MySQL to Supabase...\n');

// ============================================
// 1. MIGRATE CATEGORIES
// ============================================
async function migrateCategories() {
    console.log('📁 Migrating Categories...');

    const categories = [
        { id: 1, name: 'LAPORAN KEROSAKAN PELANGGAN', description: 'JENIS KEROSAKAN' },
        { id: 2, name: 'Other', description: 'Other' },
        { id: 4, name: 'SERVIS AIRCOND', description: '' },
        { id: 5, name: 'SERVIS CUCIAN', description: '' },
    ];

    for (const cat of categories) {
        const { error } = await supabase
            .from('categories')
            .upsert({ id: cat.id, name: cat.name, description: cat.description }, { onConflict: 'id' });

        if (error) console.log(`  ❌ Category ${cat.name}: ${error.message}`);
        else console.log(`  ✅ Category: ${cat.name}`);
    }
}

// ============================================
// 2. MIGRATE SUBCATEGORIES
// ============================================
async function migrateSubcategories() {
    console.log('\n📂 Migrating Subcategories...');

    const subcategories = [
        { id: 3, category_id: 2, name: 'other' },
        { id: 5, category_id: 1, name: 'Mesin Basuh' },
        { id: 6, category_id: 1, name: 'PETI' },
        { id: 7, category_id: 1, name: 'DRYER' },
        { id: 8, category_id: 1, name: 'FREEZER' },
        { id: 9, category_id: 1, name: 'JAM AZAN MASJID' },
        { id: 10, category_id: 1, name: 'WATER ( HEATER )' },
        { id: 11, category_id: 1, name: 'TV (UNTUK 50" KE ATAS SAHAJA)' },
        { id: 12, category_id: 1, name: 'AIRCOND' },
        { id: 13, category_id: 1, name: 'KIPAS SILING / DINDING' },
        { id: 14, category_id: 4, name: 'AIRCOND SILING CASSETE' },
        { id: 15, category_id: 4, name: 'AIRCOND WALL MOUNTED (BIASA)' },
        { id: 16, category_id: 5, name: 'MESIN BASUH' },
        { id: 17, category_id: 5, name: 'MESIN PENGERING' },
    ];

    for (const sub of subcategories) {
        const { error } = await supabase
            .from('subcategories')
            .upsert({ id: sub.id, category_id: sub.category_id, name: sub.name }, { onConflict: 'id' });

        if (error) console.log(`  ❌ Subcategory ${sub.name}: ${error.message}`);
        else console.log(`  ✅ Subcategory: ${sub.name}`);
    }
}

// ============================================
// 3. MIGRATE STATES (Locations/Branches)
// ============================================
async function migrateStates() {
    console.log('\n📍 Migrating States/Branches...');

    const states = [
        { id: 1, name: 'KAMPUNG RAJA (BESUT)', description: 'BESUT' },
        { id: 5, name: 'SETIU (TERENGGANU)', description: 'TERENGGANU' },
        { id: 7, name: 'JERTEH (TERENGGANU)', description: 'TERENGGANU' },
    ];

    for (const state of states) {
        const { error } = await supabase
            .from('states')
            .upsert({ id: state.id, name: state.name, description: state.description }, { onConflict: 'id' });

        if (error) console.log(`  ❌ State ${state.name}: ${error.message}`);
        else console.log(`  ✅ State: ${state.name}`);
    }
}

// ============================================
// 4. MIGRATE BRANDS (Extract from complaints)
// ============================================
async function migrateBrands() {
    console.log('\n🏷️ Migrating Brands...');

    const brands = ['daikin', 'HITACHI', 'SAMSUNG', 'LG', 'PANASONIC', 'SHARP', 'TOSHIBA', 'MIDEA', 'HAIER'];

    for (let i = 0; i < brands.length; i++) {
        const { error } = await supabase
            .from('brands')
            .upsert({ id: i + 1, name: brands[i].toUpperCase() }, { onConflict: 'id' });

        if (error) console.log(`  ❌ Brand ${brands[i]}: ${error.message}`);
        else console.log(`  ✅ Brand: ${brands[i].toUpperCase()}`);
    }
}

// ============================================
// 5. MIGRATE USERS
// ============================================
async function migrateUsers() {
    console.log('\n👥 Migrating Users...');

    const users = [
        {
            full_name: 'Test user',
            email: 'testuser@gmail.com',
            ic_number: '023569693212',
            contact_no: '1234567899',
            contact_no_2: '1234567899',
            address: 'kuala lumpur,senawang\n2225,bawah drawbrige',
            state: 'KAMPUNG RAJA',
            status: 'active'
        },
        {
            full_name: 'HULAIMI MUSADDIQ',
            email: 'hulaimimusaddiq232@gmail.com',
            ic_number: '020116880352',
            contact_no: '0147963531',
            contact_no_2: '0157963632',
            address: '2122 blok a208',
            state: null,
            status: 'active'
        },
        {
            full_name: 'AHMAD ZAHID BIN MOHD SOFI',
            email: 'ahmadzahid482@gmail.com',
            ic_number: '020116110323',
            contact_no: '0147963531',
            contact_no_2: '0157963632',
            address: '2122 taman seri budi,padang midin\n21400 kuala terengganu,terengganu',
            state: null,
            status: 'active'
        },
        {
            full_name: 'musaddiq hulaimi',
            email: 'musaddiq232@gmail.com',
            ic_number: '020116880353',
            contact_no: '0199904162',
            contact_no_2: null,
            address: 'blok a208',
            state: null,
            status: 'active'
        },
        {
            full_name: 'numan',
            email: 'userpublic@gmail.com',
            ic_number: '000202029892',
            contact_no: '01121962781',
            contact_no_2: '0123456789',
            address: '272A jalan jerat cina',
            state: null,
            status: 'active'
        },
        {
            full_name: 'zahidhamidi',
            email: 'zahidhamidi@gmail.com',
            ic_number: '000202394546',
            contact_no: '0147963531',
            contact_no_2: '0199904162',
            address: '16A, Jalan Dato\' Isaacs, Kampung Dalam Bata, 20100 Kuala Terengganu, Terengganu',
            state: null,
            status: 'active'
        },
    ];

    for (const user of users) {
        // Check if user already exists
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('ic_number', user.ic_number)
            .single();

        if (existing) {
            console.log(`  ⏭️ User ${user.full_name} already exists, skipping...`);
            continue;
        }

        const { error } = await supabase
            .from('users')
            .insert({
                ...user,
                password_hash: DEFAULT_BCRYPT_PASSWORD,
            });

        if (error) console.log(`  ❌ User ${user.full_name}: ${error.message}`);
        else console.log(`  ✅ User: ${user.full_name}`);
    }
}

// ============================================
// 6. MIGRATE TECHNICIANS
// ============================================
async function migrateTechnicians() {
    console.log('\n🔧 Migrating Technicians...');

    const technicians = [
        {
            name: 'Afnan',
            department: 'IT Technician',
            username: 'afnan',
            email: 'nanibos@gmail.com',
            contact_no: '0199904162',
            is_active: true
        },
    ];

    for (const tech of technicians) {
        // Check if technician already exists
        const { data: existing } = await supabase
            .from('technicians')
            .select('id')
            .eq('username', tech.username)
            .single();

        if (existing) {
            console.log(`  ⏭️ Technician ${tech.name} already exists, skipping...`);
            continue;
        }

        const { error } = await supabase
            .from('technicians')
            .insert({
                ...tech,
                password_hash: DEFAULT_BCRYPT_PASSWORD,
            });

        if (error) console.log(`  ❌ Technician ${tech.name}: ${error.message}`);
        else console.log(`  ✅ Technician: ${tech.name}`);
    }
}

// ============================================
// 7. HELPER: Get user ID by old ID mapping
// ============================================
const userIdMap = {};
async function buildUserIdMap() {
    console.log('\n🗺️ Building user ID mapping...');

    const oldToNewEmail = {
        2: 'testuser@gmail.com',
        3: 'hulaimimusaddiq232@gmail.com',
        4: 'ahmadzahid482@gmail.com',
        5: 'musaddiq232@gmail.com',
        6: 'userpublic@gmail.com',
        7: 'zahidhamidi@gmail.com',
    };

    for (const [oldId, email] of Object.entries(oldToNewEmail)) {
        const { data } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (data) {
            userIdMap[oldId] = data.id;
            console.log(`  Mapped old user ${oldId} -> ${data.id}`);
        }
    }
}

// Get technician ID by old ID
const techIdMap = {};
async function buildTechIdMap() {
    console.log('\n🗺️ Building technician ID mapping...');

    const { data: techs } = await supabase
        .from('technicians')
        .select('id, username');

    if (techs) {
        for (const tech of techs) {
            if (tech.username === 'afnan') {
                techIdMap[3] = tech.id; // Old ID 3 = afnan
                console.log(`  Mapped old tech 3 (afnan) -> ${tech.id}`);
            }
        }
    }
}

// ============================================
// 8. MIGRATE COMPLAINTS
// ============================================
async function migrateComplaints() {
    console.log('\n📋 Migrating Complaints...');

    const complaints = [
        {
            old_id: 3, old_user_id: 2, category_id: 1, subcategory: 'Mesin Basuh',
            complaint_type: 'Under Warranty', state: 'KAMPUNG RAJA (BESUT)',
            brand_name: 'DAIKIN', details: 'xcxcxc', status: 'in_process',
            warranty_file: 'Ahmad Zahid.png', receipt_file: null,
            created_at: '2025-02-24T19:22:09Z'
        },
        {
            old_id: 4, old_user_id: 2, category_id: 1, subcategory: 'Mesin Basuh',
            complaint_type: 'Under Warranty', state: 'KAMPUNG RAJA (BESUT)',
            brand_name: 'ZXZX', details: 'zxzxzxzx', status: 'pending',
            warranty_file: null, receipt_file: null,
            created_at: '2025-02-24T19:24:59Z'
        },
        {
            old_id: 9, old_user_id: 2, category_id: 1, subcategory: 'Mesin Basuh',
            complaint_type: 'Under Warranty', state: 'KAMPUNG RAJA (BESUT)',
            brand_name: 'DAIKIN', details: 'dfdf', status: 'pending',
            warranty_file: 'Ahmad Zahid.png', receipt_file: 'warranty.jpg',
            created_at: '2025-02-25T05:32:58Z'
        },
        {
            old_id: 10, old_user_id: 2, category_id: 1, subcategory: 'Mesin Basuh',
            complaint_type: 'Under Warranty', state: 'KAMPUNG RAJA (BESUT)',
            brand_name: 'DAIKIN', details: 'BAJU X KERING', status: 'pending',
            warranty_file: 'warranty.jpg', receipt_file: 'receipt.jpg',
            created_at: '2025-02-25T09:56:33Z'
        },
        {
            old_id: 13, old_user_id: 4, category_id: 1, subcategory: 'PETI',
            complaint_type: 'Under Warranty', state: 'KAMPUNG RAJA (BESUT)',
            brand_name: 'DAIKIN', details: 'x sejuk', status: 'in_process',
            warranty_file: 'photo.jpg', receipt_file: 'photo.png',
            created_at: '2025-03-06T06:40:48Z'
        },
        {
            old_id: 14, old_user_id: 7, category_id: 1, subcategory: 'Mesin Basuh',
            complaint_type: 'Under Warranty', state: 'KAMPUNG RAJA (BESUT)',
            brand_name: 'DAIKIN', details: 'rosak motor', status: 'in_process',
            warranty_file: 'asdas.jpg', receipt_file: 'photo.jpg',
            created_at: '2025-03-25T17:55:44Z'
        },
        {
            old_id: 15, old_user_id: 7, category_id: 1, subcategory: 'JAM AZAN MASJID',
            complaint_type: 'Under Warranty', state: 'KAMPUNG RAJA (BESUT)',
            brand_name: '5 WAKTU', details: 'lampu x nyala', status: 'in_process',
            warranty_file: 'asdas.jpg', receipt_file: 'whatsapp.jpg',
            created_at: '2025-03-25T20:18:10Z'
        },
    ];

    // Map old complaint ID to new complaint ID
    const complaintIdMap = {};
    let reportNum = 100; // Start from A00100

    for (const c of complaints) {
        const userId = userIdMap[c.old_user_id];
        if (!userId) {
            console.log(`  ⏭️ Complaint ${c.old_id}: User not found, skipping...`);
            continue;
        }

        const report_number = `A${String(reportNum++).padStart(5, '0')}`;

        const { data, error } = await supabase
            .from('complaints')
            .insert({
                user_id: userId,
                category_id: c.category_id,
                subcategory: c.subcategory,
                complaint_type: c.complaint_type,
                state: c.state,
                brand_name: c.brand_name,
                details: c.details,
                status: c.status,
                report_number: report_number,
                created_at: c.created_at,
            })
            .select('id')
            .single();

        if (error) {
            console.log(`  ❌ Complaint ${c.old_id}: ${error.message}`);
        } else {
            complaintIdMap[c.old_id] = data.id;
            console.log(`  ✅ Complaint: ${report_number} (old: ${c.old_id} -> new: ${data.id})`);
        }
    }

    return complaintIdMap;
}

// ============================================
// MAIN MIGRATION FUNCTION
// ============================================
async function runMigration() {
    try {
        // Step 1: Master data
        await migrateCategories();
        await migrateSubcategories();
        await migrateStates();
        await migrateBrands();

        // Step 2: Users and technicians
        await migrateUsers();
        await migrateTechnicians();

        // Step 3: Build ID mappings
        await buildUserIdMap();
        await buildTechIdMap();

        // Step 4: Complaints (we'll skip for now, as some already exist)
        // const complaintIdMap = await migrateComplaints();

        console.log('\n✅ Data migration completed successfully!');
        console.log('\n📝 Note: Users and technicians have been assigned the default password: Ecare@2026');
        console.log('   They should reset their passwords after first login.');

    } catch (error) {
        console.error('\n❌ Migration error:', error);
    }
}

runMigration();
