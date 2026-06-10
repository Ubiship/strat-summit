import clsx from 'clsx';

type StatsCardProps = {
  title: string;
  value: string | number;
  change?: {
    value: string;
    positive?: boolean;
  };
  icon?: React.ReactNode;
};

export function StatsCard({ title, value, change, icon }: StatsCardProps) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-500">{title}</p>
        {icon && <div className="text-stone-400">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-semibold text-forest">{value}</p>
        {change && (
          <span
            className={clsx(
              'text-sm font-medium',
              change.positive ? 'text-green-600' : 'text-red-600'
            )}
          >
            {change.value}
          </span>
        )}
      </div>
    </div>
  );
}
