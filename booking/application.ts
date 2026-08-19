export interface BookingApplication {
  id: string;
  name: string;
  department: string;
  email: string;
  attendees: number;
  topic: string;
  submittedAt: number;
  approved: boolean;
}
