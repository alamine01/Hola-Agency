-- Script de migration pour HOLA AGENCY
-- Ce script configure la table des messages de contact et ajuste le statut des nouvelles villas.

-- 1. Table des messages de contact
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false
);

-- Activation de RLS pour les messages de contact
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (RLS) pour contact_messages
DROP POLICY IF EXISTS "Tout le monde peut envoyer un message de contact" ON contact_messages;
CREATE POLICY "Tout le monde peut envoyer un message de contact" 
ON contact_messages FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Seuls les admins peuvent lire les messages de contact" ON contact_messages;
CREATE POLICY "Seuls les admins peuvent lire les messages de contact" 
ON contact_messages FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

DROP POLICY IF EXISTS "Seuls les admins peuvent modifier les messages de contact" ON contact_messages;
CREATE POLICY "Seuls les admins peuvent modifier les messages de contact" 
ON contact_messages FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

DROP POLICY IF EXISTS "Seuls les admins peuvent supprimer les messages de contact" ON contact_messages;
CREATE POLICY "Seuls les admins peuvent supprimer les messages de contact" 
ON contact_messages FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);
