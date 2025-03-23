export interface OrderItem {
  id: number;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  originalPrice?: string;
  discountedPrice?: string | null;
  discount?: string | null;
  availability?: string;
  categoryId?: number | null;
  subCategoryId?: number | null;
  imgOne?: string;
  imgTwo?: string;
  imgThree?: string;
  imgFour?: string;
  videoLink?: string;
  qty: number;
  // Keep backwards compatibility
  productId?: string;
  productName?: string;
  sku?: string;
  price?: number;
  quantity?: number;
  productImage?: string;
  image?: string;
  name?: string;
}

export interface Order {
  id: number;
  name: string;
  phoneNumber: string;
  statusId: number;
  created_at: string;
  address: string;
  state: string;
  date: string;
  email: string;
  products?: OrderItem[];
  // Keep backwards compatibility
  statusName?: string;
  statusNameAr?: string;
  status?: string;
  items?: OrderItem[];
  total?: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  shippingCost?: number;
  discount?: number;
  paymentMethod?: string;
  notes?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface OrderListItem {
  id: number;
  name: string;
  phoneNumber: string;
  statusId: number;
  created_at: string;
  address: string;
  state: string;
  date: string;
  email: string;
  statusName?: string;
  statusNameAr?: string;
  statusLabel?: string;
}
