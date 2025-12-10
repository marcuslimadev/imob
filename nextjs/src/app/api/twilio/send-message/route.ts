import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createDirectus, rest, staticToken } from '@directus/sdk';

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('directus_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { company_id, to, message } = body;

    if (!company_id || !to || !message) {
      return NextResponse.json(
        { error: 'Dados incompletos (company_id, to, message obrigatórios)' },
        { status: 400 }
      );
    }

    // Chamar endpoint customizado do Directus para enviar mensagem
    const response = await fetch(`${directusUrl}/twilio/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        company_id,
        to,
        message
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao enviar mensagem');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Erro no envio de mensagem:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erro ao enviar mensagem' 
      },
      { status: 500 }
    );
  }
}
