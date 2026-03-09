export interface PrizeTier {
  level: number;
  percentage: number;
  amount?: number;
  label: string;
}

export interface Ticket {
  id: string;
  number: string;
  purchaseDate: string;
  status: 'active' | 'winner' | 'expired';
  prizeLevel?: number;
}

export interface User {
  id: string;
  name: string;
  balance: number;
  tickets: Ticket[];
}
