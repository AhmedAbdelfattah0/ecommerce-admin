export interface OrderStatus {
  id: string;
  status: string;
  statusAr?: string;
  description?: string;
}

export const ORDER_STATUSES: OrderStatus[] = [
  {
    "id": "1",
    "status": "Delivered",
    "statusAr": "تم التوصيل"
  },
  {
    "id": "2",
    "status": "Pending",
    "statusAr": "قيد الأنتظار"
  },
  {
    "id": "3",
    "status": "Confirmed",
    "statusAr": "مؤكد"
  },
  {
    "id": "4",
    "status": "Processing",
    "statusAr": "قيد المعالجة"
  },
  {
    "id": "5",
    "status": "Shipped",
    "statusAr": "تم الشحن"
  },
  {
    "id": "6",
    "status": "Out for Delivery",
    "statusAr": "قيد التوصيل"
  },
  {
    "id": "7",
    "status": "Canceled",
    "statusAr": "ملغي"
  },
  {
    "id": "8",
    "status": "Returned",
    "statusAr": "تم الإرجاع"
  },
  {
    "id": "9",
    "status": "Refunded",
    "statusAr": "تم الاسترداد"
  },
  {
    "id": "10",
    "status": "Failed",
    "statusAr": "فشل"
  },
  {
    "id": "11",
    "status": "On Hold",
    "statusAr": "معلق"
  },
  {
    "id": "12",
    "status": "Partially Shipped",
    "statusAr": "تم الشحن جزئيًا"
  },
  {
    "id": "13",
    "status": "Awaiting Payment",
    "statusAr": "في انتظار الدفع"
  }
];
