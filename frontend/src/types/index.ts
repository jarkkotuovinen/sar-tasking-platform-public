// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'OPERATOR';
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Task types
export type ResolutionMode = 'SPOTLIGHT' | 'STRIPMAP' | 'SCANSAR';
export type Polarization = 'HH' | 'VV' | 'HV' | 'VH';
export type LookDirection = 'LEFT' | 'RIGHT';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus =
  | 'PENDING'
  | 'VALIDATING'
  | 'SCHEDULED'
  | 'ACQUIRING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface AreaOfInterest {
  id: string;
  geometry: GeoJSON.Polygon;
  area: number;
  centerLat: number;
  centerLon: number;
}

export interface Task {
  id: string;
  userId: string;
  aoi: AreaOfInterest;
  resolution: ResolutionMode;
  polarization: Polarization;
  lookDirection: LookDirection;
  priority: Priority;
  requestedStart?: string;
  requestedEnd?: string;
  status: TaskStatus;
  validationErrors?: string[];
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  aoi: {
    geometry: GeoJSON.Polygon;
    area: number;
    centerLat: number;
    centerLon: number;
  };
  resolution: ResolutionMode;
  polarization: Polarization;
  lookDirection?: LookDirection;
  priority?: Priority;
  requestedStart?: string;
  requestedEnd?: string;
}
