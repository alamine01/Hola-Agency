const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local if it exists
try {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }
                process.env[key] = value;
            }
        });
    }
} catch (e) {
    console.error("Failed to load .env.local manually:", e.message);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const clientId = "97a7785e-af24-452f-86aa-6e4f595db682";
    const ownerId = "ef60353c-e6bf-4077-bda1-c0d00a81107e";

    console.log("--- CLIENT CHECK (ID:", clientId, ") ---");
    try {
        const { data: authClient } = await supabase.auth.admin.getUserById(clientId);
        console.log("Auth Client User:", authClient?.user ? { email: authClient.user.email, metadata: authClient.user.user_metadata } : "Not found in Auth");
    } catch (e) {
        console.error("Auth Client check failed:", e.message);
    }

    try {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', clientId).maybeSingle();
        console.log("Profile Client:", profile);
    } catch (e) {
        console.error("Profile Client check failed:", e.message);
    }

    try {
        const { data: user } = await supabase.from('users').select('*').eq('id', clientId).maybeSingle();
        console.log("User Table Client:", user);
    } catch (e) {
        console.error("User Table Client check failed:", e.message);
    }

    console.log("\n--- OWNER CHECK (ID:", ownerId, ") ---");
    try {
        const { data: authOwner } = await supabase.auth.admin.getUserById(ownerId);
        console.log("Auth Owner User:", authOwner?.user ? { email: authOwner.user.email, metadata: authOwner.user.user_metadata } : "Not found in Auth");
    } catch (e) {
        console.error("Auth Owner check failed:", e.message);
    }

    try {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', ownerId).maybeSingle();
        console.log("Profile Owner:", profile);
    } catch (e) {
        console.error("Profile Owner check failed:", e.message);
    }

    try {
        const { data: user } = await supabase.from('users').select('*').eq('id', ownerId).maybeSingle();
        console.log("User Table Owner:", user);
    } catch (e) {
        console.error("User Table Owner check failed:", e.message);
    }
}

run();
