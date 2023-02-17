export interface Product {
  id: string;
  article: string,
  title: string;
  description: string;
  price: number;
  image: string;
  count?: number;
}

export interface ProductCount {
  productId: string;
  count: number;
}
