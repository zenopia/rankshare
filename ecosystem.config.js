module.exports = {
  apps: [{
    name: 'curate.fileopia.com',
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
  }]
}; 