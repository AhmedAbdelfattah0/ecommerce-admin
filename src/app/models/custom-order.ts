export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface MaterialItem {
  materialId: number;
  materialName: string;
  quantity: number;
  colorHex?: string;
  price?: number; // Added for admin to set price
}

export interface AddOnItem {
  addOnId: number;
  addOnName: string;
  quantity: number;
  price?: number; // Added for admin to set price
}

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
  unit: string;
  notes?: string;
}

export interface Appointment {
  id?: number;
  itemId?: number;
  orderId?: number;
  date: string;
  timeSlot: string;
  address: string;
  notes?: string;
  status?: string;
}

export interface CustomOrderItem {
  id?: number;
  itemName: string;
  itemType: string;
  itemDescription: string;
  quantity: number;
  notes?: string;
  materials?: MaterialItem[];
  addOns?: AddOnItem[];
  dimensions?: Dimensions;
  hasCustomDimensions: boolean;
  appointment?: Appointment;
  price?: number; // Added for admin to set price
  engraving?: string;
}

export interface CustomOrder {
  id?: number;
  saveCode?: string;
  customerInfo: CustomerInfo;
  items: CustomOrderItem[];
  deliveryMethod: string;
  assemblyOption: string;
  notes?: string;
  status?: string;
  created_at?: string;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  total?: number;
  adminNotes?: string; // Internal notes for admin
}

export interface CustomOrderPricing {
  itemPrices: {
    itemId: number;
    price: number;
    materialPrices?: {
      materialId: number;
      price: number;
    }[];
    addOnPrices?: {
      addOnId: number;
      price: number;
    }[];
  }[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface MeasurementAppointment {
  id: number;
  orderId: number;
  itemId: number;
  appointment: Appointment;
  item: {
    itemName: string;
    itemType: string;
  };
  customerInfo: CustomerInfo;
}
