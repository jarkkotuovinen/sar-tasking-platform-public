import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTaskDto: CreateTaskDto) {
    // Validate task parameters
    const validationErrors = this.validateTask(createTaskDto);

    // Create AOI first
    const aoi = await this.prisma.areaOfInterest.create({
      data: {
        geometry: createTaskDto.aoi.geometry,
        area: createTaskDto.aoi.area,
        centerLat: createTaskDto.aoi.centerLat,
        centerLon: createTaskDto.aoi.centerLon,
      },
    });

    // Create task
    const task = await this.prisma.task.create({
      data: {
        userId,
        aoiId: aoi.id,
        resolution: createTaskDto.resolution,
        polarization: createTaskDto.polarization,
        lookDirection: createTaskDto.lookDirection || 'RIGHT',
        priority: createTaskDto.priority || 'MEDIUM',
        requestedStart: createTaskDto.requestedStart
          ? new Date(createTaskDto.requestedStart)
          : undefined,
        requestedEnd: createTaskDto.requestedEnd
          ? new Date(createTaskDto.requestedEnd)
          : undefined,
        status: validationErrors.length > 0 ? TaskStatus.PENDING : TaskStatus.VALIDATING,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
        estimatedDelivery: this.calculateEstimatedDelivery(createTaskDto.priority || 'MEDIUM'),
      },
      include: {
        aoi: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Simulate status progression to SCHEDULED if no errors
    if (validationErrors.length === 0) {
      setTimeout(async () => {
        await this.prisma.task.update({
          where: { id: task.id },
          data: { status: TaskStatus.SCHEDULED },
        });
      }, 2000);
    }

    return task;
  }

  async findAll(userId: string) {
    return this.prisma.task.findMany({
      where: { userId },
      include: {
        aoi: true,
        scheduledPass: {
          include: {
            satellite: true,
          },
        },
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        aoi: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        scheduledPass: {
          include: {
            satellite: true,
          },
        },
        product: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(userId: string, id: string, updateTaskDto: UpdateTaskDto) {
    // Check if task exists and belongs to user
    await this.findOne(userId, id);

    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
      include: {
        aoi: true,
      },
    });
  }

  async remove(userId: string, id: string) {
    // Check if task exists and belongs to user
    await this.findOne(userId, id);

    return this.prisma.task.delete({
      where: { id },
    });
  }

  private validateTask(dto: CreateTaskDto): string[] {
    const errors: string[] = [];

    // Validate AOI size
    if (dto.aoi.area < 1) {
      errors.push('AOI too small (min 1 km²)');
    } else if (dto.aoi.area > 10000) {
      errors.push('AOI too large (max 10,000 km²)');
    }

    // Resolution-specific validations
    if (dto.resolution === 'SPOTLIGHT' && dto.aoi.area > 100) {
      errors.push('Spotlight mode limited to 100 km²');
    } else if (dto.resolution === 'STRIPMAP' && dto.aoi.area > 1000) {
      errors.push('Stripmap mode limited to 1,000 km²');
    }

    // Time window validation
    if (dto.requestedStart && dto.requestedEnd) {
      const start = new Date(dto.requestedStart);
      const end = new Date(dto.requestedEnd);
      const now = new Date();

      if (start < now) {
        errors.push('Start time must be in the future');
      }
      if (end <= start) {
        errors.push('End time must be after start time');
      }

      const duration = end.getTime() - start.getTime();
      const days = duration / (1000 * 60 * 60 * 24);
      if (days > 30) {
        errors.push('Time window cannot exceed 30 days');
      }
    }

    return errors;
  }

  private calculateEstimatedDelivery(priority: string): Date {
    const hoursMap = {
      URGENT: 2,
      HIGH: 12,
      MEDIUM: 24,
      LOW: 48,
    };

    const hours = hoursMap[priority] || 24;
    const delivery = new Date();
    delivery.setHours(delivery.getHours() + hours);

    return delivery;
  }
}
