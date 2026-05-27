import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  title?: string;
}

export function Card({
  children,
  className = '',
  bodyClassName = 'p-5',
  title,
}: CardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}
    >
      {title && (
        <div className="shrink-0 border-b border-slate-200 px-5 py-3 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">
            {title}
          </h3>
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
