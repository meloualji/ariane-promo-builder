module.exports = {
  apps: [
    {
      name: 'ariane-promo',
      script: 'server/index.js',
      cwd: '/var/www/ariane-promo-builder',
      env: {
        NODE_ENV: 'production',
        PORT: 3042,
        // Uncomment to use system Chromium instead of Puppeteer's bundled binary:
        // PUPPETEER_EXECUTABLE_PATH: '/usr/bin/chromium-browser',
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
    },
  ],
};
