import type { ReactNode } from 'react';

interface ScrollPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
  /** Tailwind height classes for the scroll region, e.g. h-[500px] */
  heightClass?: string;
  headerRight?: ReactNode;
  footer?: ReactNode;
}

/**
 * Fixed-height panel with sticky title and vertically scrollable body.
 */
export function ScrollPanel({
  title,
  children,
  className = '',
  heightClass = 'h-[min(500px,50vh)] min-h-[280px] sm:min-h-[320px]',
  headerRight,
  footer,
}: ScrollPanelProps) {
  return (
    <section
      className={`flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}
      aria-label={title}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800 sm:px-5">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </h3>
        {headerRight}
      </div>

      <div
        className={`scroll-panel scroll-panel-fade relative overflow-y-auto overflow-x-auto ${heightClass}`}
      >
        <div className="p-4 sm:p-5">{children}</div>
      </div>

      {footer && (
        <div className="shrink-0 border-t border-slate-200 bg-slate-50/80 px-4 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 sm:px-5">
          {footer}
        </div>
      )}
    </section>
  );
}
