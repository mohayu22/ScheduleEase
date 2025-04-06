import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  bgColor: string;
  isLoading: boolean;
}

export default function StatsCard({ title, value, icon, bgColor, isLoading }: StatsCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${bgColor} rounded-md p-3`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                {isLoading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <div className="text-lg font-medium text-gray-900">{value}</div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </Card>
  );
}
