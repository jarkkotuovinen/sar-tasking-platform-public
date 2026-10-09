import type { Task } from '../types';

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    userId: 'user-1',
    status: 'COMPLETED',
    resolution: 'STRIPMAP',
    polarization: 'VV',
    lookDirection: 'RIGHT',
    priority: 'HIGH',
    validationErrors: null,
    createdAt: '2024-10-08T10:00:00Z',
    updatedAt: '2024-10-08T12:00:00Z',
    estimatedDelivery: '2024-10-09T10:00:00Z',
    aoi: {
      id: 'aoi-1',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [24.9354, 60.1695],
            [24.9454, 60.1695],
            [24.9454, 60.1795],
            [24.9354, 60.1795],
            [24.9354, 60.1695],
          ],
        ],
      },
      area: 50.5,
      centerLat: 60.1745,
      centerLon: 24.9404,
      createdAt: '2024-10-08T10:00:00Z',
      updatedAt: '2024-10-08T10:00:00Z',
    },
  },
  {
    id: 'task-2',
    userId: 'user-1',
    status: 'PENDING',
    resolution: 'SPOTLIGHT',
    polarization: 'HH',
    lookDirection: 'LEFT',
    priority: 'URGENT',
    validationErrors: ['AOI too large for Spotlight mode'],
    createdAt: '2024-10-08T14:00:00Z',
    updatedAt: '2024-10-08T14:00:00Z',
    estimatedDelivery: '2024-10-08T16:00:00Z',
    aoi: {
      id: 'aoi-2',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [25.0, 60.2],
            [25.1, 60.2],
            [25.1, 60.3],
            [25.0, 60.3],
            [25.0, 60.2],
          ],
        ],
      },
      area: 120.0,
      centerLat: 60.25,
      centerLon: 25.05,
      createdAt: '2024-10-08T14:00:00Z',
      updatedAt: '2024-10-08T14:00:00Z',
    },
  },
  {
    id: 'task-3',
    userId: 'user-1',
    status: 'ACQUIRING',
    resolution: 'SCANSAR',
    polarization: 'VH',
    lookDirection: 'RIGHT',
    priority: 'MEDIUM',
    validationErrors: null,
    createdAt: '2024-10-07T08:00:00Z',
    updatedAt: '2024-10-08T08:00:00Z',
    estimatedDelivery: '2024-10-09T08:00:00Z',
    aoi: {
      id: 'aoi-3',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [24.5, 59.9],
            [25.5, 59.9],
            [25.5, 60.5],
            [24.5, 60.5],
            [24.5, 59.9],
          ],
        ],
      },
      area: 500.0,
      centerLat: 60.2,
      centerLon: 25.0,
      createdAt: '2024-10-07T08:00:00Z',
      updatedAt: '2024-10-07T08:00:00Z',
    },
  },
];

export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER' as const,
};
