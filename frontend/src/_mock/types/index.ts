// Common type definitions for the application

// Basic product type
export interface Product {
  id: string | number;
  name: string;
  price: number;
  description?: string;
  [key: string]: any; // For additional properties
}

// Basic customer type
export interface Customer {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  [key: string]: any; // For additional properties
}

// Basic order type
export interface Order {
  id: string | number;
  customerId?: string | number;
  products?: Product[];
  total?: number;
  date?: string | Date;
  status?: string;
  [key: string]: any; // For additional properties
}

// Basic agent type
export interface Agent {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  [key: string]: any; // For additional properties
}

// Generic type for items with an ID
export interface BaseItem {
  id: string | number;
  [key: string]: any;
}