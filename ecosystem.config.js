require("dotenv").config();
module.exports = {
  apps: [
    {
      name: "cnaiapp",
      exec_mode: "cluster",
      instances: "max",
      script: "./node_modules/nuxt/bin/nuxt.js",
      args: "start",
    },
  ],
  deploy: {
    production: {
      user: "remoto",
      host: "200.0.183.27",
      path: "/var/www/html/cnaiapp",
      repo: "git@github.com:vencho-mdp/cnaiapp.git",
      ref: "origin/develop",
      "pre-deploy": " rm -r /var/www/html/cnaiapp",
      "post-deploy":
        "npm ci;pm2 startOrRestart ecosystem.config.js --env production",
    },
  },
};
