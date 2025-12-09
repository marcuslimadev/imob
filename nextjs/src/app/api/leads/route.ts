import { NextRequest, NextResponse } from 'next/server';
import { createDirectus, rest, createItem } from '@directus/sdk';

const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055')
  .with(rest());

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, phone, interest_type, property_id, company_id, budget_min, budget_max, message } = body;

    // Validação básica
    if (!name || !email || !phone || !company_id) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'E-mail inválido' },
        { status: 400 }
      );
    }

    // Criar lead no Directus
    // @ts-ignore
    const lead = await directus.request(
      createItem('leads', {
        name,
        email,
        phone,
        interest_type: interest_type || 'buy',
        property_id: property_id || null,
        company_id,
        budget_min: budget_min || null,
        budget_max: budget_max || null,
        message: message || null,
        stage: 'new',
        source: 'website',
        created_at: new Date().toISOString()
      })
    );

    // Opcional: Criar atividade inicial
    try {
      // @ts-ignore
      await directus.request(
        createItem('lead_activities', {
          lead_id: lead.id,
          activity_type: 'note',
          notes: 'Lead criado através do formulário de contato do website',
          created_at: new Date().toISOString()
        })
      );
    } catch (activityError) {
      console.error('Error creating initial activity:', activityError);
      // Não falhar se a atividade não for criada
    }

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
      lead_id: lead.id
    });

  } catch (error) {
    console.error('Error creating lead:', error);

    return NextResponse.json(
      { error: 'Erro ao processar sua solicitação. Tente novamente.' },
      { status: 500 }
    );
  }
}
