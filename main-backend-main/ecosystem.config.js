module.exports = {
    apps: [{
      name: "backend",
      script: "app.js",
      env: {
        NODE_ENV: "production",
      },
      error_file: "err.log",
      out_file: "out.log"
    }]
  }