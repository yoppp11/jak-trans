import { getStatusLabel } from "../helpers/getStatusLabel";

export default function LabelStatus({ status }: { status: string }) {

    const statusColors: Record<string, string> = {
      IN_TRANSIT_TO: 'bg-blue-100 text-blue-800',
      STOPPED_AT: 'bg-yellow-100 text-yellow-800',
      INCOMING_AT: 'bg-green-100 text-green-800',
    };
    
    const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {getStatusLabel(status)}
      </span>
    );
  }