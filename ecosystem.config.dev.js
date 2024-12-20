module.exports = {
  apps: [
    {
      name: 'curate-dev.fileopia.com',
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