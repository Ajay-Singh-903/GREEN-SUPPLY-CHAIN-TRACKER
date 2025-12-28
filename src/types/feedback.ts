export interface Feedback {
  id: string;
  shipmentId: string;
  clientId: string;
  clientName: string;
  rating: number; // 1-5
  comment: string;
  category: 'delivery' | 'packaging' | 'communication' | 'sustainability';
  createdAt: Date;
}

const FEEDBACK_KEY = 'green_supply_feedback';

export function saveFeedback(feedback: Feedback): void {
  const allFeedback = getAllFeedback();
  allFeedback.push(feedback);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(allFeedback));
}

export function getAllFeedback(): Feedback[] {
  const stored = localStorage.getItem(FEEDBACK_KEY);
  if (!stored) return [];
  
  const parsed = JSON.parse(stored);
  return parsed.map((f: any) => ({
    ...f,
    createdAt: new Date(f.createdAt),
  }));
}

export function getFeedbackByShipment(shipmentId: string): Feedback | null {
  const allFeedback = getAllFeedback();
  return allFeedback.find(f => f.shipmentId === shipmentId) || null;
}

export function getAverageRating(): number {
  const allFeedback = getAllFeedback();
  if (allFeedback.length === 0) return 0;
  
  const sum = allFeedback.reduce((acc, f) => acc + f.rating, 0);
  return sum / allFeedback.length;
}
