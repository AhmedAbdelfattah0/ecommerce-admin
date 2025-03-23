 export interface CreateOrderRequest {
  name: string;
  phoneNumber: string;
  address: string;
  state: string;
  statusId: number;
  date: Date;
  email: string;
  products: {
    productId: number;
    qty: number;
  }[];
}
