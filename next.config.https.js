const nextConfig = {
  experimental: {
    appDir: true,
  },
  serverOptions: {
    key: './localhost+2-key.pem',
    cert: './localhost+2.pem'
  }
}

module.exports = nextConfig