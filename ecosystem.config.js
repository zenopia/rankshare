module.exports = {
  apps: [
    {
      name: 'favely.net',
      script: './start.sh',
      cwd: '/home/favely/htdocs/favely.net',
      env: {
        NODE_ENV: 'production'
      },
    },
    {
      name: 'curate-dev.fileopia.com',
      script: './start.sh',
      cwd: '/home/fileopia-curate-dev/htdocs/curate-dev.fileopia.com',
      env: {
        NODE_ENV: 'production'
      },
    },
  ],
};