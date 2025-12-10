'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle, XCircle } from 'lucide-react';

export function ImportPropertiesButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImport() {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch('/api/import-properties', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Erro ao importar');
      }

      setResult(data);
      
      // Recarregar página após 2 segundos para mostrar novos imóveis
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col gap-2">
      <Button
        onClick={handleImport}
        disabled={loading}
        variant="outline"
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Importando...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Importar da API
          </>
        )}
      </Button>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
          <div className="flex items-center gap-2 text-green-700 font-medium mb-1">
            <CheckCircle className="h-4 w-4" />
            {result.message}
          </div>
          <div className="text-green-600 text-xs">
            Total: {result.total} | Novos: {result.imported} | Atualizados: {result.updated}
            {result.errors > 0 && ` | Erros: ${result.errors}`}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
          <div className="flex items-center gap-2 text-red-700 font-medium">
            <XCircle className="h-4 w-4" />
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
