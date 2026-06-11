import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  backTo,
  backLabel = '뒤로',
  action,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-5 sm:mb-8', className)}>
      <div className="mobile-stack justify-between gap-3">
        <div className="min-w-0 flex-1">
          {backTo && (
            <Link
              to={backTo}
              className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-400 hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{backLabel}</span>
            </Link>
          )}
          <h1 className="heading-page truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-400 mt-1 truncate">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0 w-full sm:w-auto">{action}</div>}
      </div>
    </div>
  );
}
