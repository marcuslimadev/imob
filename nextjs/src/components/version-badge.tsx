'use client';

export function VersionBadge() {
  const version = process.env.NEXT_PUBLIC_BUILD_VERSION || '1.0.0';
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString();
  
  // Format date in Brazilian timezone
  const formattedDate = new Date(buildTime).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed bottom-2 right-2 z-50">
      <div className="bg-gray-900/80 text-gray-300 text-xs px-3 py-1.5 rounded-full backdrop-blur-sm border border-gray-700 shadow-lg">
        <span className="font-semibold text-green-400">v{version}</span>
        <span className="mx-1.5 text-gray-500">•</span>
        <span>{formattedDate}</span>
      </div>
    </div>
  );
}
