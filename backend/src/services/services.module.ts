import { Module } from '@nestjs/common';
import { SatellitePassService } from './satellite-pass.service';
import { AoiValidationService } from './aoi-validation.service';

@Module({
  providers: [SatellitePassService, AoiValidationService],
  exports: [SatellitePassService, AoiValidationService],
})
export class ServicesModule {}
