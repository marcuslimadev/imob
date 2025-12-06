interface BauhausPageHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
  accentColor?: string;
}

export function BauhausPageHeader({ 
  title, 
  description, 
  actions,
  accentColor = '#2563EB' // blue-600
}: BauhausPageHeaderProps) {
  return (
    <div className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-6 flex-1">
            <div 
              className="w-2 h-24 rounded-sm flex-shrink-0" 
              style={{ backgroundColor: accentColor }}
            />
            <div className="flex-1">
              <h1 className="text-5xl font-light tracking-tight text-gray-900 mb-3">
                {title}
              </h1>
              <p className="text-lg font-light text-gray-500">
                {description}
              </p>
            </div>
          </div>
          {actions && (
            <div className="flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
