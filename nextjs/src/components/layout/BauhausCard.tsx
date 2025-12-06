import { ReactNode } from 'react';

interface BauhausCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function BauhausCard({ children, className = '', padding = 'md' }: BauhausCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`bg-white rounded-none border-2 border-gray-200 ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}

interface BauhausStatCardProps {
  label: string;
  value: string | number;
  color?: 'gray' | 'green' | 'red' | 'blue' | 'yellow';
}

export function BauhausStatCard({ label, value, color = 'gray' }: BauhausStatCardProps) {
  const colorClasses = {
    gray: 'text-gray-900',
    green: 'text-green-700',
    red: 'text-red-700',
    blue: 'text-blue-700',
    yellow: 'text-yellow-700'
  };

  return (
    <BauhausCard>
      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
        {label}
      </p>
      <p className={`text-5xl font-light ${colorClasses[color]}`}>
        {value}
      </p>
    </BauhausCard>
  );
}
