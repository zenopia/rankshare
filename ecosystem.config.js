module.exports = {
  apps: [
    {
      name: 'curate',
      script: 'npm',
      args: 'start',
      cwd: '/home/fileopia-curate/htdocs/curate.fileopia.com',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'curate-dev',
      script: 'npm',
      args: 'start',
      cwd: '/home/fileopia-curate-dev/htdocs/curate-dev.fileopia.com',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
} 