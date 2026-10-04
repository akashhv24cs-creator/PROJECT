export interface SanitizedPayment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  advancePercent?: number;
  status: string;
  type: string;
  createdAt: any;
  refundStatus?: string;
  refundAmount?: number;
  refundInitiatedAt?: any;
  refundedAt?: any;
  deductionReason?: string;
}
