module.exports = {
  apps : [{
    name   : 'ts-core',
    script: 'npm',
    args : 'start',
    env_production: {
      NODE_ENV: 'production'
    },
    env_development: {
      NODE_ENV: 'development'
    }
  }, {
    name   : 'ts-api',
    script: 'npm',
    args : 'run start:api',
    env_production: {
      NODE_ENV: 'production'
    },
    env_development: {
      NODE_ENV: 'development'
    }
  }]
};