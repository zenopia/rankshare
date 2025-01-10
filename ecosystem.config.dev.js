module.exports = {
  apps: [{
    name: 'curate-dev',
    script: 'npm',
    args: 'start',
    env: {
      PORT: 3001,
      NODE_ENV: 'production'
    }
  }]
}; 