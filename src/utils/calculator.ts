export interface CalculationItem {
  label: string;
  amount: number;
}

export interface CalculationResult {
  earnings: number;
  expenses: number;
  totalExpenses: number;
  remaining: number;
  /** Expense line items (kept for backwards compatibility). */
  items: CalculationItem[];
  earningItems: CalculationItem[];
  expenseItems: CalculationItem[];
}

type Section = 'earning' | 'expense';

const NUMBER = String.raw`\d[\d,]*(?:\.\d+)?`;
const OPERATOR = String.raw`[+\-*x×]`;

/** "5000", "2000+3000", "4 x 500" at the very end of a line. */
const TRAILING_EXPRESSION = new RegExp(`(${NUMBER}(?:\\s*${OPERATOR}\\s*${NUMBER})*)\\s*$`, 'i');
/** Fallback: any number anywhere in the line ("Salary 50000 received"). */
const ANY_NUMBER = new RegExp(NUMBER, 'g');

/** 12/05/2025, 5-8-2026, 01.02.26 — dates are not amounts. */
const DATE_LIKE = /\b\d{1,4}[/.\-]\d{1,2}(?:[/.\-]\d{1,4})?\b/g;
const CURRENCY = /(?:rs\.?|pkr|₨|rupees?|usd|\$|€|£)/gi;
/** "--- EARNINGS ---", "* Expenses:", "# Income" etc. */
const DECORATION = /^[\s\-–—*_#=•]+|[\s\-–—*_#=•:]+$/g;

const EARNING_HEADER = /\b(earnings?|incomes?|revenues?|credits?|profits?)\b/i;
const EXPENSE_HEADER = /\b(expenses?|expenditures?|bills?|spendings?|debits?|costs?|outgoings?)\b/i;

function toNumber(raw: string): number {
  return parseFloat(raw.replace(/,/g, ''));
}

/** Evaluates a simple chain like "2000+3000-500" or "4x250" (× before + / -). */
function evaluateExpression(expression: string): number {
  const tokens = expression.replace(/\s+/g, '').match(new RegExp(`${NUMBER}|${OPERATOR}`, 'gi'));
  if (!tokens || tokens.length === 0) return NaN;

  // Pass 1: multiplication.
  const collapsed: string[] = [];
  for (const token of tokens) {
    if (/^[*x×]$/i.test(token)) {
      collapsed.push(token);
    } else if (collapsed.length >= 2 && /^[*x×]$/i.test(collapsed[collapsed.length - 1])) {
      const left = toNumber(collapsed[collapsed.length - 2]);
      collapsed.splice(-2, 2, String(left * toNumber(token)));
    } else {
      collapsed.push(token);
    }
  }

  // Pass 2: addition / subtraction.
  let total = toNumber(collapsed[0]);
  if (isNaN(total)) return NaN;
  for (let i = 1; i < collapsed.length - 1; i += 2) {
    const value = toNumber(collapsed[i + 1]);
    if (isNaN(value)) return NaN;
    total += collapsed[i] === '-' ? -value : value;
  }
  return total;
}

function cleanLabel(raw: string): string {
  return raw.replace(CURRENCY, ' ').replace(DECORATION, '').replace(/\s+/g, ' ').trim();
}

/**
 * Pulls an amount out of a single line. Accepts a bare number ("123000"),
 * "Label 5000", "Label: 5,000", "Rent - 15000" and "Groceries 4x500".
 */
function parseLine(line: string): CalculationItem | null {
  const cleaned = line.replace(DATE_LIKE, ' ');
  if (!/\d/.test(cleaned)) return null;

  const trailing = cleaned.match(TRAILING_EXPRESSION);
  let amount: number;
  let prefix: string;

  if (trailing) {
    amount = evaluateExpression(trailing[1]);
    prefix = cleaned.slice(0, trailing.index ?? 0);
  } else {
    // Number sits mid-line: use the last one found.
    ANY_NUMBER.lastIndex = 0;
    let last: RegExpExecArray | null = null;
    let match: RegExpExecArray | null;
    while ((match = ANY_NUMBER.exec(cleaned)) !== null) last = match;
    if (!last) return null;
    amount = toNumber(last[0]);
    prefix = cleaned.slice(0, last.index);
  }

  if (isNaN(amount)) return null;

  const label = cleanLabel(prefix);
  return { label: label || 'Amount', amount };
}

function detectSection(line: string): Section | null {
  // Header lines carry no amount — that keeps "Income tax 5000" an expense item.
  if (EARNING_HEADER.test(line)) return 'earning';
  if (EXPENSE_HEADER.test(line)) return 'expense';
  return null;
}

export function calculateExpenses(content: string): CalculationResult {
  const empty: CalculationResult = {
    earnings: 0,
    expenses: 0,
    totalExpenses: 0,
    remaining: 0,
    items: [],
    earningItems: [],
    expenseItems: [],
  };

  if (!content || typeof content !== 'string') return empty;

  let earnings = 0;
  let totalExpenses = 0;
  const earningItems: CalculationItem[] = [];
  const expenseItems: CalculationItem[] = [];

  // Anything before the first header is treated as an expense (legacy behaviour).
  let currentSection: Section = 'expense';

  for (const line of content.split('\n')) {
    if (!line.trim()) continue;

    const item = parseLine(line);

    if (!item) {
      const section = detectSection(line);
      if (section) currentSection = section;
      continue;
    }

    if (currentSection === 'earning') {
      earnings += item.amount;
      earningItems.push(item);
    } else {
      totalExpenses += item.amount;
      expenseItems.push(item);
    }
  }

  return {
    earnings,
    expenses: totalExpenses,
    totalExpenses,
    remaining: earnings - totalExpenses,
    items: expenseItems,
    earningItems,
    expenseItems,
  };
}
