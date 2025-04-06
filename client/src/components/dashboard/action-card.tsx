import { ReactNode } from "react";

interface ActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  bgColor: string;
}

export default function ActionCard({ title, description, icon, bgColor }: ActionCardProps) {
  return (
    <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-primary cursor-pointer">
      <div className={`flex-shrink-0 h-10 w-10 rounded-full ${bgColor} flex items-center justify-center`}>
        {icon}
      </div>
      <div className="flex-1">
        <span className="absolute inset-0" aria-hidden="true"></span>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}
