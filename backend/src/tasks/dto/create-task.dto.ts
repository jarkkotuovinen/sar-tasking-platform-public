import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ResolutionMode, Polarization, LookDirection, Priority } from '@prisma/client';

class AreaOfInterestDto {
  @ApiProperty({ description: 'GeoJSON Polygon geometry' })
  @IsObject()
  geometry: any;

  @ApiProperty({ description: 'Area in square kilometers' })
  @IsNotEmpty()
  area: number;

  @ApiProperty({ description: 'Center latitude' })
  @IsNotEmpty()
  centerLat: number;

  @ApiProperty({ description: 'Center longitude' })
  @IsNotEmpty()
  centerLon: number;
}

export class CreateTaskDto {
  @ApiProperty({ type: AreaOfInterestDto })
  @ValidateNested()
  @Type(() => AreaOfInterestDto)
  aoi: AreaOfInterestDto;

  @ApiProperty({ enum: ResolutionMode, example: 'STRIPMAP' })
  @IsEnum(ResolutionMode)
  resolution: ResolutionMode;

  @ApiProperty({ enum: Polarization, example: 'VV' })
  @IsEnum(Polarization)
  polarization: Polarization;

  @ApiPropertyOptional({ enum: LookDirection, example: 'RIGHT' })
  @IsEnum(LookDirection)
  @IsOptional()
  lookDirection?: LookDirection;

  @ApiPropertyOptional({ enum: Priority, example: 'MEDIUM' })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({ example: '2026-10-10T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  requestedStart?: string;

  @ApiPropertyOptional({ example: '2026-10-15T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  requestedEnd?: string;
}
