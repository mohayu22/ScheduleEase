import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Service } from "@shared/schema";

interface ServiceOptionProps {
  service: Service;
  onDelete: () => void;
}

export default function ServiceOption({ service, onDelete }: ServiceOptionProps) {
  // Format price as currency
  const formatPrice = (price: number | null | undefined) => {
    if (price == null) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100);
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours} hr ${remainingMinutes} mins` 
        : `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
  };

  return (
    <div className="relative border rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="mb-2 sm:mb-0">
          <h4 className="text-md font-medium text-gray-900">{service.name}</h4>
          <p className="text-sm text-gray-500">{formatDuration(service.duration)} - {service.description}</p>
        </div>
        <div className="flex items-center gap-3">
          {service.price ? (
            <span className="text-gray-900 font-medium">{formatPrice(service.price)}</span>
          ) : (
            <span className="text-gray-500 text-sm italic">No price set</span>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-500 hover:text-red-500"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete service</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
