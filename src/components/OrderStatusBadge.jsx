import { orderStatusLabels } from '@/lib/labels.js';

const statusStyles = {
  received: 'bg-status-received-bg text-status-received-text',
  processing: 'bg-status-processing-bg text-status-processing-text',
  ready: 'bg-status-ready-bg text-status-ready-text',
  completed: 'bg-status-completed-bg text-status-completed-text',
};

export default function OrderStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status] ?? 'bg-border text-text-muted'}`}
    >
      {orderStatusLabels[status] ?? status}
    </span>
  );
}
