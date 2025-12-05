import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Limpar cookies
  response.cookies.delete('directus_token');
  response.cookies.delete('directus_refresh_token');

  return response;
}
