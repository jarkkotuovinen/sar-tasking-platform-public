import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface SatellitePass {
  id: string;
  satellite_name: string;
  start_time: Date;
  end_time: Date;
  max_elevation: number;
  direction: string;
  latitude: number;
  longitude: number;
  visibility_window_seconds: number;
}

export interface PredictionRequest {
  latitude: number;
  longitude: number;
  start_date: Date;
  end_date: Date;
  min_elevation?: number;
}

export interface PredictionResponse {
  passes: SatellitePass[];
  total_count: number;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface SatelliteInfo {
  name: string;
  norad_id: number;
  status: string;
  orbit_type: string;
  altitude_km: number;
  inclination: number;
}

@Injectable()
export class SatellitePassService {
  private readonly logger = new Logger(SatellitePassService.name);
  private readonly client: AxiosInstance;
  private readonly serviceUrl: string;

  constructor() {
    this.serviceUrl =
      process.env.SATELLITE_PASS_SERVICE_URL || 'http://localhost:8001';

    this.client = axios.create({
      baseURL: this.serviceUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.logger.log(
      `SatellitePassService initialized with URL: ${this.serviceUrl}`,
    );
  }

  /**
   * Predict satellite passes for a given location and time range
   */
  async predictPasses(
    request: PredictionRequest,
    authToken: string,
  ): Promise<PredictionResponse> {
    try {
      this.logger.debug(
        `Requesting satellite pass prediction for lat: ${request.latitude}, lon: ${request.longitude}`,
      );

      const response = await this.client.post<PredictionResponse>(
        '/api/v1/predict-passes',
        request,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      this.logger.debug(
        `Received ${response.data.total_count} predicted passes`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to get satellite pass predictions: ${error.message}`,
      );

      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new HttpException(
            error.response.data || 'Satellite pass service error',
            error.response.status,
          );
        } else if (error.code === 'ECONNREFUSED') {
          throw new HttpException(
            'Satellite pass service unavailable',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
      }

      throw new HttpException(
        'Failed to predict satellite passes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get information about SAR satellites
   */
  async getSatelliteInfo(authToken: string): Promise<SatelliteInfo[]> {
    try {
      const response = await this.client.get<{
        satellites: SatelliteInfo[];
        count: number;
      }>('/api/v1/satellite-info', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      return response.data.satellites;
    } catch (error) {
      this.logger.error(`Failed to get satellite info: ${error.message}`);

      if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
        throw new HttpException(
          'Satellite pass service unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      throw new HttpException(
        'Failed to get satellite information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Check if satellite pass service is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health', { timeout: 5000 });
      return response.status === 200 && response.data.status === 'healthy';
    } catch (error) {
      this.logger.warn(`Satellite pass service health check failed`);
      return false;
    }
  }
}
