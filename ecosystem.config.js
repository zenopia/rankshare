module.exports = {
  apps: [
    {
      name: 'curate',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 3000,
        NODE_ENV: 'production'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
      watch: false,
      kill_timeout: 3000,
      wait_ready: true
    }
  ]
} 