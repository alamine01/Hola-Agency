import { NextResponse } from 'next/server';

export async function GET() {
    const rawSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    const cleanedSecret = rawSecret.trim().replace(/^["']|["']$/g, '');
    
    return NextResponse.json({
        exists: !!rawSecret,
        length: rawSecret.length,
        cleanedLength: cleanedSecret.length,
        start: rawSecret.slice(0, 10),
        end: rawSecret.slice(-10),
        cleanedStart: cleanedSecret.slice(0, 10),
        cleanedEnd: cleanedSecret.slice(-10),
        rawSecretMasked: rawSecret ? `${rawSecret.slice(0, 10)}...${rawSecret.slice(-10)}` : 'none'
    });
}
