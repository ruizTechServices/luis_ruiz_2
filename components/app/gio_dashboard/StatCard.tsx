import * as React from "react";

type StatCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBgClassName?: string;
  className?: string;
};

export default function StatCard({
  title,
  value,
  icon,
  iconBgClassName = "bg-gray-100 dark:bg-gray-900",
  className = "",
}: StatCardProps) {
  return (
    <div
      className={
        "bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 " +
        className
      }
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${iconBgClassName}`}>{icon}</div>
      </div>
    </div>
  );
}
