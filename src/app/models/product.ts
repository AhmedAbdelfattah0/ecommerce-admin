export interface Product {
  id: number;
  title: string;
  titleAr:string;
  discountedPrice: string;
  description: string;
  imgOne: string;
  imgTwo: string;
  imgThree: string;
  imgFour: string;
  videoLink: string;
  categoryId: string;
  subCategoryId: number;
  // stock: number;
  rating: number;
  isNew?: boolean;
  discount: number;
  originalPrice: string;
  reviews?: number;
  badge?:string;
  subtitle?:string;
  availability:string;
  qty:number;
}
export interface Product_v2 {
  id: number;
  title: string;
  titleAr:string;
  discountedPrice: string;
  description: string;
  images: Array<string>;
  videoLink: string;
  categoryId: string;
  subCategoryId: number;
  categoryName:string;
  // stock: number;
  rating: number;
  isNew?: boolean;
  discount: number;
  originalPrice: string;
  reviews?: number;
  badge?:string;
  subtitle?:string;
  availability:string;
}

export interface ProductsResponse{
  total:number;
  products:Product[]
}
export interface ProductList {
  id: number;
  title: string;
  titleAr:string;
  discountedPrice: string;
  description: string;
  imgOne: string;

   originalPrice: string;
  price: string;
  // categoryId: string;
  // subCategoryId: number;
  // stock: number;
  // rating: number;
  // isNew?: boolean;
  // discount: number;
  // reviews?: number;
  // badge?:string;
  // subtitle?:string;
  // availability:string;
  qty:number;
}