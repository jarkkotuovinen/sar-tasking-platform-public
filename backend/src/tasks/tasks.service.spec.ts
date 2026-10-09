import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';

describe('TasksService', () => {
  let tasksService: TasksService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    areaOfInterest: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(tasksService).toBeDefined();
  });

  describe('create', () => {
    const userId = 'user-123';
    const mockAOI = {
      id: 'aoi-123',
      geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] },
      area: 50,
      centerLat: 60.1695,
      centerLon: 24.9354,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockTask = {
      id: 'task-123',
      userId,
      aoiId: 'aoi-123',
      resolution: 'STRIPMAP',
      polarization: 'VV',
      lookDirection: 'RIGHT',
      priority: 'MEDIUM',
      status: TaskStatus.VALIDATING,
      validationErrors: null,
      requestedStart: null,
      requestedEnd: null,
      estimatedDelivery: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      aoi: mockAOI,
      user: {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      },
    };

    const createTaskDto = {
      aoi: {
        geometry: mockAOI.geometry,
        area: 50,
        centerLat: 60.1695,
        centerLon: 24.9354,
      },
      resolution: 'STRIPMAP' as const,
      polarization: 'VV' as const,
      lookDirection: 'RIGHT' as const,
      priority: 'MEDIUM' as const,
    };

    it('should create a valid task without errors', async () => {
      mockPrismaService.areaOfInterest.create.mockResolvedValue(mockAOI);
      mockPrismaService.task.create.mockResolvedValue(mockTask);

      const result = await tasksService.create(userId, createTaskDto);

      expect(mockPrismaService.areaOfInterest.create).toHaveBeenCalledWith({
        data: {
          geometry: createTaskDto.aoi.geometry,
          area: createTaskDto.aoi.area,
          centerLat: createTaskDto.aoi.centerLat,
          centerLon: createTaskDto.aoi.centerLon,
        },
      });

      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          aoiId: mockAOI.id,
          resolution: createTaskDto.resolution,
          polarization: createTaskDto.polarization,
          lookDirection: createTaskDto.lookDirection,
          priority: createTaskDto.priority,
          status: TaskStatus.VALIDATING,
        }),
        include: expect.any(Object),
      });

      expect(result).toEqual(mockTask);
    });

    it('should create task with PENDING status if validation errors exist', async () => {
      const invalidDto = {
        ...createTaskDto,
        aoi: {
          ...createTaskDto.aoi,
          area: 0.5, // Too small
        },
      };

      const taskWithErrors = {
        ...mockTask,
        status: TaskStatus.PENDING,
        validationErrors: ['AOI too small (min 1 km²)'],
      };

      mockPrismaService.areaOfInterest.create.mockResolvedValue({
        ...mockAOI,
        area: 0.5,
      });
      mockPrismaService.task.create.mockResolvedValue(taskWithErrors);

      const result = await tasksService.create(userId, invalidDto);

      expect(result.status).toBe(TaskStatus.PENDING);
      expect(result.validationErrors).toContain('AOI too small (min 1 km²)');
    });

    it('should reject AOI area > 10,000 km²', async () => {
      const invalidDto = {
        ...createTaskDto,
        aoi: {
          ...createTaskDto.aoi,
          area: 15000,
        },
      };

      const taskWithErrors = {
        ...mockTask,
        status: TaskStatus.PENDING,
        validationErrors: ['AOI too large (max 10,000 km²)'],
      };

      mockPrismaService.areaOfInterest.create.mockResolvedValue({
        ...mockAOI,
        area: 15000,
      });
      mockPrismaService.task.create.mockResolvedValue(taskWithErrors);

      const result = await tasksService.create(userId, invalidDto);

      expect(result.validationErrors).toContain('AOI too large (max 10,000 km²)');
    });

    it('should reject SPOTLIGHT mode with area > 100 km²', async () => {
      const invalidDto = {
        ...createTaskDto,
        resolution: 'SPOTLIGHT' as const,
        aoi: {
          ...createTaskDto.aoi,
          area: 150,
        },
      };

      const taskWithErrors = {
        ...mockTask,
        status: TaskStatus.PENDING,
        validationErrors: ['Spotlight mode limited to 100 km²'],
      };

      mockPrismaService.areaOfInterest.create.mockResolvedValue({
        ...mockAOI,
        area: 150,
      });
      mockPrismaService.task.create.mockResolvedValue(taskWithErrors);

      const result = await tasksService.create(userId, invalidDto);

      expect(result.validationErrors).toContain('Spotlight mode limited to 100 km²');
    });

    it('should reject STRIPMAP mode with area > 1000 km²', async () => {
      const invalidDto = {
        ...createTaskDto,
        resolution: 'STRIPMAP' as const,
        aoi: {
          ...createTaskDto.aoi,
          area: 1500,
        },
      };

      const taskWithErrors = {
        ...mockTask,
        status: TaskStatus.PENDING,
        validationErrors: ['Stripmap mode limited to 1,000 km²'],
      };

      mockPrismaService.areaOfInterest.create.mockResolvedValue({
        ...mockAOI,
        area: 1500,
      });
      mockPrismaService.task.create.mockResolvedValue(taskWithErrors);

      const result = await tasksService.create(userId, invalidDto);

      expect(result.validationErrors).toContain('Stripmap mode limited to 1,000 km²');
    });
  });

  describe('findAll', () => {
    const userId = 'user-123';
    const mockTasks = [
      {
        id: 'task-1',
        userId,
        status: TaskStatus.COMPLETED,
        aoi: { id: 'aoi-1', area: 50 },
      },
      {
        id: 'task-2',
        userId,
        status: TaskStatus.PENDING,
        aoi: { id: 'aoi-2', area: 100 },
      },
    ];

    it('should return all tasks for a user', async () => {
      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);

      const result = await tasksService.findAll(userId);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockTasks);
    });

    it('should return empty array if no tasks exist', async () => {
      mockPrismaService.task.findMany.mockResolvedValue([]);

      const result = await tasksService.findAll(userId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    const userId = 'user-123';
    const taskId = 'task-123';
    const mockTask = {
      id: taskId,
      userId,
      status: TaskStatus.COMPLETED,
      aoi: { id: 'aoi-1', area: 50 },
      user: {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      },
    };

    it('should return a single task if found', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);

      const result = await tasksService.findOne(userId, taskId);

      expect(mockPrismaService.task.findFirst).toHaveBeenCalledWith({
        where: { id: taskId, userId },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(null);

      await expect(tasksService.findOne(userId, taskId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(tasksService.findOne(userId, taskId)).rejects.toThrow(
        `Task with ID ${taskId} not found`,
      );
    });
  });

  describe('update', () => {
    const userId = 'user-123';
    const taskId = 'task-123';
    const mockTask = {
      id: taskId,
      userId,
      status: TaskStatus.PENDING,
      aoi: { id: 'aoi-1', area: 50 },
      user: {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      },
    };

    const updateDto = {
      status: TaskStatus.SCHEDULED,
    };

    it('should update a task', async () => {
      const updatedTask = { ...mockTask, status: TaskStatus.SCHEDULED };

      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
      mockPrismaService.task.update.mockResolvedValue(updatedTask);

      const result = await tasksService.update(userId, taskId, updateDto);

      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: updateDto,
        include: expect.any(Object),
      });
      expect(result.status).toBe(TaskStatus.SCHEDULED);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(null);

      await expect(
        tasksService.update(userId, taskId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const userId = 'user-123';
    const taskId = 'task-123';
    const mockTask = {
      id: taskId,
      userId,
      status: TaskStatus.COMPLETED,
      aoi: { id: 'aoi-1', area: 50 },
      user: {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      },
    };

    it('should delete a task', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
      mockPrismaService.task.delete.mockResolvedValue(mockTask);

      const result = await tasksService.remove(userId, taskId);

      expect(mockPrismaService.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(null);

      await expect(tasksService.remove(userId, taskId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
