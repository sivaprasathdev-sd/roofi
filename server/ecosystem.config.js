module.exports = {
  apps: [
    {
      name: "roofi-server",

      script: "server.js",

      cwd: "/home/senseluto/roofi.asnroofings.com/server",

      instances: 1,

      exec_mode: "fork",

      autorestart: true,

      watch: false,

      max_memory_restart: "1G",

      env: {
        NODE_ENV: "production",
      },
    },
  ],
};