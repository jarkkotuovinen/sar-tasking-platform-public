import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface ValidationError {
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResponse {
  valid: boolean;
  area_km2: number;
  perimeter_km: number;
  errors: ValidationError[];
  warnings: ValidationError[];
  geometry_type: string;
  is_simple: boolean;
  is_closed: boolean;
  centroid: [number, number];
}

export interface ValidationRequest {
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  resolution_mode: string;
  priority?: string;
}

export interface ValidationLimits {
  global: {
    min_area_km2: number;
    max_area_km2: number;
    coordinate_bounds: {
      latitude: [number, number];
      longitude: [number, number];
    };
  };
  resolution_modes: {
    [key: string]: {
      max_area_km2: number;
      recommended_max_km2?: number;
      description: string;
    };
  };
}

@Injectable()
export class AoiValidationService {
  private readonly logger = new Logger(AoiValidationService.name);
  private readonly client: AxiosInstance;
  private readonly serviceUrl: string;

  constructor() {
    this.serviceUrl =
      process.env.AOI_VALIDATION_SERVICE_URL || 'http://localhost:8002';

    this.client = axios.create({
      baseURL: this.serviceUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.logger.log(
      `AoiValidationService initialized with URL: ${this.serviceUrl}`,
    );
  }

  /**
   * Validate an Area of Interest (AOI)
   */
  async validateAoi(
    request: ValidationRequest,
    authToken: string,
  ): Promise<ValidationResponse> {
    try {
      this.logger.debug(
        `Validating AOI for resolution mode: ${request.resolution_mode}`,
      );

      const response = await this.client.post<ValidationResponse>(
        '/api/v1/validate',
        request,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      this.logger.debug(
        `AOI validation result: ${response.data.valid ? 'VALID' : 'INVALID'}, area: ${response.data.area_km2} km²`,
      );

      if (!response.data.valid) {
        this.logger.warn(
          `AOI validation failed with ${response.data.errors.length} errors`,
        );
      }

      if (response.data.warnings.length > 0) {
        this.logger.warn(
          `AOI validation has ${response.data.warnings.length} warnings`,
        );
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to validate AOI: ${error.message}`);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new HttpException(
            error.response.data || 'AOI validation service error',
            error.response.status,
          );
        } else if (error.code === 'ECONNREFUSED') {
          throw new HttpException(
            'AOI validation service unavailable',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
      }

      throw new HttpException(
        'Failed to validate AOI',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get validation limits for different resolution modes
   */
  async getValidationLimits(authToken: string): Promise<ValidationLimits> {
    try {
      const response = await this.client.get<ValidationLimits>(
        '/api/v1/limits',
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get validation limits: ${error.message}`);

      if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
        throw new HttpException(
          'AOI validation service unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      throw new HttpException(
        'Failed to get validation limits',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Check if AOI validation service is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health', { timeout: 5000 });
      return response.status === 200 && response.data.status === 'healthy';
    } catch (error) {
      this.logger.warn(`AOI validation service health check failed`);
      return false;
    }
  }

  /**
   * Extract validation errors as array of strings
   */
  extractErrorMessages(validation: ValidationResponse): string[] {
    return validation.errors.map((error) => error.message);
  }

  /**
   * Extract validation warnings as array of strings
   */
  extractWarningMessages(validation: ValidationResponse): string[] {
    return validation.warnings.map((warning) => warning.message);
  }
}
