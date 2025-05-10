import { Product, BaseItem } from '../types';

// This would typically be a call to an API, but we're using localStorage for demo purposes
const ITEMS_KEY = 'products';

let items: Product[] = [];

export const init = () => {
  // Initialize with some default data if needed
  if (localStorage.getItem(ITEMS_KEY) === null) {
    items = [
      // Add sample products here if needed
    ];
    saveItems();
  } else {
    items = JSON.parse(localStorage.getItem(ITEMS_KEY) || '[]');
  }
};

export const getAllItems = (): Product[] => {
  if (items.length === 0) {
    items = JSON.parse(localStorage.getItem(ITEMS_KEY) || '[]');
  }
  return items;
};

export const saveItem = (data: Product): Product => {
  let items = getAllItems() as Product[];
  let index = items.findIndex((a: Product) => a.id === data.id);

  if (index !== -1) {
    items[index] = { ...items[index], ...data };
  } else {
    // Assign a new ID if it doesn't exist
    const newId = Math.max(0, ...items.map(item => Number(item.id))) + 1;
    items.push({
      ...data,
      id: newId
    });
  }

  saveItems();
  return data;
};

export const saveItems = () => {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
};

export const getItemById = (id: string | number): Product | undefined => {
  const ul = getAllItems();
  return ul.find((u: Product) => u.id === id);
};

export const deleteItem = (id: string | number): boolean => {
  const items = getAllItems();
  const index = items.findIndex((u: Product) => u.id === id);
  
  if (index !== -1) {
    items.splice(index, 1);
    saveItems();
    return true;
  }
  
  return false;
};