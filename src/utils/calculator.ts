export interface CalculationResult {
  earnings: number;
  expenses: number;
  totalExpenses: number;
  remaining: number;
  items: { label: string; amount: number }[];
}

export function calculateExpenses(content: string): CalculationResult {
  if (!content) {
    return { earnings: 0, expenses: 0, totalExpenses: 0, remaining: 0, items: [] };
  }

  const lines = content.split('\n');
  let earnings = 0;
  let totalExpenses = 0;
  const items: { label: string; amount: number }[] = [];
  
  // Track which section we are currently in
  let currentSection: 'earning' | 'expense' | null = null;

  lines.forEach((line) => {
    const lowerLine = line.toLowerCase().trim();
    
    // Detect section headers
    if (lowerLine.includes('earning') || lowerLine.includes('income')) {
      currentSection = 'earning';
    } else if (lowerLine.includes('expense') || lowerLine.includes('bill')) {
      currentSection = 'expense';
    }

    // Regex matches "Label 1234" or "Label: 1234"
    const match = line.match(/(.*?)\s*[:\-\s]\s*(\d+[\d,.]*)/);
    
    if (match) {
      const label = match[1].trim();
      const amountStr = match[2].replace(/,/g, '');
      const amount = parseFloat(amountStr);

      if (!isNaN(amount) && label) {
        // If we are in the Earning section, add to earnings
        if (currentSection === 'earning') {
          earnings += amount;
        } 
        // If we are in the Expense section or no section yet, add to expenses
        else {
          totalExpenses += amount;
          items.push({ label, amount });
        }
      }
    }
  });

  return {
    earnings,
    expenses: totalExpenses,
    totalExpenses,
    remaining: earnings - totalExpenses,
    items,
  };
}
