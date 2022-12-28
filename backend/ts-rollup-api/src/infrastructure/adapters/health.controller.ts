import { Controller, Get } from '@nestjs/common';
// import { BullHealthIndicator } from '@anchan828/nest-bullmq-terminus';
import { HealthCheckService, HttpHealthIndicator, HealthCheck } from '@nestjs/terminus';

@Controller('/health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    // private bull: BullHealthIndicator
  ) {

  }

  @Get()
  @HealthCheck()
  checkSelf() {
    return {
      status: 'ok'
    };
  }

  // @Get('queue')
  // @HealthCheck()
  // check() {
  //   return this.health.check([() => this.bull.isHealthy()]);
  // }
}
