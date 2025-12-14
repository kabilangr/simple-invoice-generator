export interface IProduct {
  id: string;
  userId: string;
  name: string;
  description: string;
  rate: number;
  gst?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductFormData {
  name: string;
  description: string;
  rate: number;
  gst?: number;
}
