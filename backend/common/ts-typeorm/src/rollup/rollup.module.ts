import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RollupInformation } from './rollupInformation.entity';
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([RollupInformation])],
  exports: [TypeOrmModule]
})
export class RollupModule {}