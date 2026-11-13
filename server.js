const http = require('http');
const vehicles = require('./resources/vehicles');
const slots = require('./resources/slots');

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/vehicles')) {
    return vehicles.handle(req, res);
  }

  if (req.url.startsWith('/slots')) {
    return slots.handle(req, res);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Not found' }));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}/vehicles`);
});
