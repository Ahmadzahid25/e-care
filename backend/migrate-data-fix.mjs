
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
// 1. MIGRATE USERS (Fixed)
// ============================================
async function migrateUsers() {
    console.log('👥 Migrating Users...');

    const users = [
        {
            full_name: 'Test user',
            email: 'testuser@gmail.com',
            ic_number: '023569693212',
            contact_no: '1234567899',
            contact_no_2: '1234567899',
            address: 'kuala lumpur,senawang\n2225,bawah drawbrige',
            state: 'KAMPUNG RAJA',
            status: 'Active'  // Fixed: Capital A
        },
        {
            full_name: 'HULAIMI MUSADDIQ',
            email: 'hulaimimusaddiq232@gmail.com',
            ic_number: '020116880352',
            contact_no: '0147963531',
            contact_no_2: '0157963632',
            address: '2122 blok a208',
            state: null,
            status: 'Active'
        },
        {
            full_name: 'musaddiq hulaimi',
            email: 'musaddiq232@gmail.com',
            ic_number: '020116880353',
            contact_no: '0199904162',
            contact_no_2: null,
            address: 'blok a208',
            state: null,
            status: 'Active'
        },
        {
            full_name: 'numan',
            email: 'userpublic@gmail.com',
            ic_number: '000202029892',
            contact_no: '01121962781',
            contact_no_2: '0123456789',
            address: '272A jalan jerat cina',
            state: null,
            status: 'Active'
        },
        {
            full_name: 'zahidhamidi',
            email: 'zahidhamidi@gmail.com',
            ic_number: '000202394546',
            contact_no: '0147963531',
            contact_no_2: '0199904162',
            address: '16A, Jalan Dato\' Isaacs, Kampung Dalam Bata, 20100 Kuala Terengganu, Terengganu',
            state: null,
            status: 'Active'
        },
    ];

    for (const user of users) {
        // Check if user already exists by IC or email
        const { data: existingIC } = await supabase
            .from('users')
            .select('id')
            .eq('ic_number', user.ic_number)
            .single();

        const { data: existingEmail } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email)
            .single();

        if (existingIC || existingEmail) {
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
// 2. MIGRATE TECHNICIANS (Fixed)
// ============================================
async function migrateTechnicians() {
    console.log('\n🔧 Migrating Technicians...');

    const technicians = [
        {
            name: 'Afnan',
            department: 'IT Technician',
            username: 'afnan',
            email: 'nanibos@gmail.com',
            contact_number: 199904162,  // Fixed: use contact_number (BIGINT)
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
// 3. UPDATE STATES (Fix names)
// ============================================
async function updateStates() {
    console.log('\n📍 Updating States/Branches...');

    // Update existing states to match the MySQL data format
    const updates = [
        { id: 1, name: 'KAMPUNG RAJA (BESUT)' },
    ];

    for (const state of updates) {
        const { error } = await supabase
            .from('states')
            .update({ name: state.name })
            .eq('id', state.id);

        if (error) console.log(`  ❌ State update ${state.name}: ${error.message}`);
        else console.log(`  ✅ State updated: ${state.name}`);
    }
}

// ============================================
// MAIN MIGRATION FUNCTION
// ============================================
async function runMigration() {
    try {
        // Update states
        await updateStates();

        // Migrate users
        await migrateUsers();

        // Migrate technicians
        await migrateTechnicians();

        console.log('\n✅ Data migration completed successfully!');
        console.log('\n📝 Note: Users and technicians have been assigned the default password: Ecare@2026');
        console.log('   They should reset their passwords after first login.');

    } catch (error) {
        console.error('\n❌ Migration error:', error);
    }
}

runMigration();
