import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();
const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USER', ''),
  password: configService.get<string>('DB_PASSWD', ''),
  database: configService.get<string>('DB_NAME', ''),
  migrations: ['common/ts-typeorm/src/migrations/*.ts']
});