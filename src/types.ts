export interface User {
  uid: string;
  email: string;
  isAdmin: boolean;
  dbId?: number;
}

export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  generation?: string;
  productionYears?: string;
  trimLevel?: string;
  engineType?: string;
  engineSize?: string;
  horsepower: number | null;
  torque: number | null;
  transmission?: string;
  drivetrain?: string;
  fuelType?: string;
  weight: number | null;
  dimensions?: string;
  fuelCapacity?: string;
  topSpeed: number | null;
  zeroToHundred?: string;
  zeroToSixty?: string;
  quarterMileTime?: string;
  powerToWeight?: string;
  fuelConsumption?: string;
  imageUrl?: string;
  interiorImageUrl?: string;
  exteriorImageUrl?: string;
  angleImageUrl?: string;
  isFeatured: boolean;
  createdAt?: string;
}

export interface Favorite {
  id: number;
  createdAt: string;
  vehicle: Vehicle;
}

export interface SavedComparison {
  id: number;
  userId: string;
  name: string;
  vehicleIds: string; // Comma separated IDs
  createdAt: string;
}

export interface RecentlyViewed {
  id: number;
  viewedAt: string;
  vehicle: Vehicle;
}
