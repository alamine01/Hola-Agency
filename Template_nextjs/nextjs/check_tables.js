
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('--- Checking Schema ---');

    const check = async (tableName) => {
        const { data, error } = await supabase.from(tableName).select('*').limit(1);
        console.log(`${tableName}:`, { exists: !error, count: data?.length, error: error?.message });
    };

    await check('villas');
    await check('services');
    await check('listings');
}

checkTables();
