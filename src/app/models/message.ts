export interface Message {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
  date: string;
  created_at?: string;
  status?: 'read' | 'unread';
}
