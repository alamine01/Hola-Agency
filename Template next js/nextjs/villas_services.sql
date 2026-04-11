
-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLES DE BASE
CREATE TABLE IF NOT EXISTS villas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    owner_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    type TEXT,
    location TEXT,
    city TEXT,
    country TEXT,
    price INTEGER NOT NULL,
    rooms INTEGER DEFAULT 1,
    guests INTEGER DEFAULT 1,
    rating DECIMAL DEFAULT 0,
    image TEXT,
    description TEXT,
    payment_methods TEXT[],
    status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    provider_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    type TEXT,
    location TEXT,
    price INTEGER NOT NULL,
    rating DECIMAL DEFAULT 0,
    image TEXT,
    description TEXT,
    status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    owner_id UUID REFERENCES auth.users(id),
    item_id UUID,
    item_type TEXT,
    start_date DATE,
    end_date DATE,
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'en_attente',
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    item_id UUID,
    item_type TEXT,
    UNIQUE(user_id, item_id)
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    display_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'client',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. MIGRATIONS (S'assurer que les colonnes existent)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='villas' AND column_name='owner_id') THEN
        ALTER TABLE villas ADD COLUMN owner_id UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='provider_id') THEN
        ALTER TABLE services ADD COLUMN provider_id UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='owner_id') THEN
        ALTER TABLE bookings ADD COLUMN owner_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 3. POLITIQUES DE SÃ‰CURITÃ‰ (RLS)
ALTER TABLE villas ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Villas
DROP POLICY IF EXISTS "Villas are viewable by everyone" ON villas;
DROP POLICY IF EXISTS "Owners can insert their own villas" ON villas;
DROP POLICY IF EXISTS "Owners can update their own villas" ON villas;
DROP POLICY IF EXISTS "Owners can delete their own villas" ON villas;
CREATE POLICY "Villas are viewable by everyone" ON villas FOR SELECT USING (true);
CREATE POLICY "Owners can insert their own villas" ON villas FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their own villas" ON villas FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete their own villas" ON villas FOR DELETE USING (auth.uid() = owner_id);

-- Services
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
DROP POLICY IF EXISTS "Providers can insert their own services" ON services;
DROP POLICY IF EXISTS "Providers can update their own services" ON services;
DROP POLICY IF EXISTS "Providers can delete their own services" ON services;
CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);
CREATE POLICY "Providers can insert their own services" ON services FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Providers can update their own services" ON services FOR UPDATE USING (auth.uid() = provider_id);
CREATE POLICY "Providers can delete their own services" ON services FOR DELETE USING (auth.uid() = provider_id);

-- Bookings
DROP POLICY IF EXISTS "Users can see their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can insert their own bookings" ON bookings;
DROP POLICY IF EXISTS "Owners can update their own received bookings" ON bookings;
CREATE POLICY "Users can see their own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id OR auth.uid() = owner_id);
CREATE POLICY "Users can insert their own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update their own received bookings" ON bookings FOR UPDATE USING (auth.uid() = owner_id OR auth.uid() = user_id);

-- Favorites
DROP POLICY IF EXISTS "Users can manage their own favorites" ON favorites;
CREATE POLICY "Users can manage their own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- Profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Table des Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    type TEXT, -- 'reservation', 'paiement', 'message'
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notifications"
ON notifications FOR ALL USING (auth.uid() = user_id);

-- Table des Conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    participant_1 UUID REFERENCES profiles(id),
    participant_2 UUID REFERENCES profiles(id),
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(participant_1, participant_2)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
CREATE POLICY "Users can see their own conversations" ON conversations FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Users can insert conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Users can update their own conversations" ON conversations FOR UPDATE USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Table des Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see messages of their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;
CREATE POLICY "Users can see messages of their conversations" ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
);
CREATE POLICY "Users can insert messages in their conversations" ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
);
CREATE POLICY "Users can update messages" ON messages FOR UPDATE USING (
    EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
);
ALTER TABLE villas ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}';

-- 4. SYSTÈME FINANCIER (Wallets & Payouts)
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES profiles(id),
    pending_amount INTEGER DEFAULT 0,
    available_amount INTEGER DEFAULT 0,
    total_withdrawn INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES profiles(id),
    amount INTEGER NOT NULL,
    method TEXT, -- Wave, Orange Money, etc.
    status TEXT DEFAULT 'en_attente', -- en_attente, valide, rejete
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Ajouter is_validated à bookings si inexistant
DO  
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='is_validated') THEN
        ALTER TABLE bookings ADD COLUMN is_validated BOOLEAN DEFAULT false;
    END IF;
END ;

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY Users can see their own wallet ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY Users can see their own payouts ON payouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY Users can request payouts ON payouts FOR INSERT WITH CHECK (auth.uid() = user_id);


-- Migration pour s'assurer que la colonne image existe dans services
DO  
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='image') THEN
        ALTER TABLE services ADD COLUMN image TEXT;
    END IF;
END ;

