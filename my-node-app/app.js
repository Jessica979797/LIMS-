const http = require('http');
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World node test \n');
})

const port = 3002;
server.listen(port, () => {
  console.log(`服务器运行地址：http://localhost:${port}/`);
  
})