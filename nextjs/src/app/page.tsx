import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-center">
        <h1 className="text-4xl font-bold mb-4">
          IMOBI - CRM Multi-tenant
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Plataforma SaaS para imobiliárias com WhatsApp, IA e automação
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard?company=exclusiva">
            <Button size="lg">
              Acessar Dashboard (Exclusiva)
            </Button>
          </Link>
          <Link href="http://localhost:8055" target="_blank">
            <Button size="lg" variant="outline">
              Acessar Directus
            </Button>
          </Link>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-2">✅ Configurado</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 12 Collections no Directus</li>
              <li>• Multi-tenant via subdomínio</li>
              <li>• TypeScript types completos</li>
              <li>• Middleware configurado</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-2">🚧 Em Desenvolvimento</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Dashboard com métricas</li>
              <li>• Chat WhatsApp</li>
              <li>• Kanban de Leads</li>
              <li>• Webhook Twilio</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-2">📋 Próximas Etapas</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Super Admin Panel</li>
              <li>• Onboarding de empresas</li>
              <li>• Vitrine pública</li>
              <li>• Sistema de assinaturas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
