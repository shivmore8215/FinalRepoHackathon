import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'ready':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'standby':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'maintenance':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function calculateAvailabilityPercentage(available: number, total: number): number {
  if (total === 0) return 0
  return Math.round((available / total) * 100)
}

export function generateTrainId(): string {
  return `KMRL-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num)
}