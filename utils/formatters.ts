
/**
 * Author: Emmanuel Owusu
 * Project: Public Utility Platform
 * Date: Jan 2025
 * Contact: emmanuel.owusu@levincore.cloud
 */
// Format the amount to currency format (GHS)
export const formatAmount = (amount: number | undefined | null): string => {
    const safeAmount = typeof amount === 'number' ? amount : 0;
    return `GHS ${safeAmount.toFixed(2)}`;
  };
  
  // Format the date to a readable format
  export const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  