/**
 * Indian Rupee & Number Formatting Utilities
 * Adheres strictly to Indian numbering system (e.g., ₹1,24,500.00)
 */

export function formatINR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₹0.00';
  }
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function formatINRCompact(amount: number | string): string {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numeric)) return '₹0';
  if (Math.abs(numeric) >= 10000000) {
    return `₹${(numeric / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(numeric) >= 100000) {
    return `₹${(numeric / 100000).toFixed(2)} L`;
  }
  if (Math.abs(numeric) >= 1000) {
    return `₹${(numeric / 1000).toFixed(1)}k`;
  }
  return formatINR(numeric);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateString);
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return String(dateString);
  }
}
