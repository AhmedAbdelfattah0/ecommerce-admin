export interface Appointment {
  id: number;
  orderId: number;
  date: string;
  timeSlot: string;
  address: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AppointmentDetails {
  id: number;
  orderCode?: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  item: {
    id: number;
    itemName: string;
    itemType: string;
    itemDescription?: string;
    dimensions?: {
      width: number;
      height: number;
      depth: number;
      unit: string;
    };
  };
  appointment: Appointment;
}

export interface RescheduleRequest {
  appointmentId: number;
  date: string;
  timeSlot: string;
  notes?: string;
}
