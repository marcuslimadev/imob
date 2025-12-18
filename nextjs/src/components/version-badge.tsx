'use client';

type VersionBadgeProps = {
  version?: string;
  buildTime?: string;
};

export function VersionBadge({ version, buildTime }: VersionBadgeProps) {
  const resolvedVersion = version || process.env.NEXT_PUBLIC_BUILD_VERSION || '0.0.0';
  const resolvedBuildTime = buildTime || process.env.NEXT_PUBLIC_BUILD_TIME;

  const formattedDate = resolvedBuildTime
    ? new Date(resolvedBuildTime).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="fixed bottom-2 right-2 z-[9999]">
      <div className="rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
        <span className="font-semibold">v{resolvedVersion}</span>
        {formattedDate ? (
          <>
            <span className="mx-1.5">•</span>
            <span>{formattedDate}</span>
          </>
        ) : null}
      </div>
    </div>
  );
}
