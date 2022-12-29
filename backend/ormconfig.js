module.exports = {
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWD,
  port: process.env.DB_PORT,
  name: process.env.DB_MAME,
  database: process.env.DB_NAME,
  seeds: ['common/ts-typeorm/src/seeds/*.seed.ts'],
  type: 'postgres',
  entities: ['common/ts-typeorm/src/**/*.entity.ts'],
};