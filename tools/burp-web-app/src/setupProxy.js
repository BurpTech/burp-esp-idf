const {createProxyMiddleware} = require('http-proxy-middleware');

module.exports = function (app) {
  // app.use(
  //   createProxyMiddleware('/ws', {
  //     target: 'ws://localhost:8080',
  //     changeOrigin: true,
  //     ws: true
  //   }),
  // );
};
