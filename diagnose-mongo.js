const net = require('net');

const hosts = [
  'ac-2lo2nqb-shard-00-00.ebscku8.mongodb.net',
  'ac-2lo2nqb-shard-00-01.ebscku8.mongodb.net',
  'ac-2lo2nqb-shard-00-02.ebscku8.mongodb.net',
];

console.log('Testing TCP connectivity to MongoDB servers on port 27017...\n');

hosts.forEach(host => {
  const socket = new net.Socket();
  socket.setTimeout(5000);

  socket.on('connect', () => {
    console.log(`✅ ${host}:27017 — REACHABLE`);
    socket.destroy();
  });

  socket.on('timeout', () => {
    console.log(`❌ ${host}:27017 — TIMEOUT (port blocked by network)`);
    socket.destroy();
  });

  socket.on('error', (err) => {
    console.log(`❌ ${host}:27017 — ERROR: ${err.message}`);
    socket.destroy();
  });

  socket.connect(27017, host);
});

// Also test a standard HTTPS port for comparison
const testSocket = new net.Socket();
testSocket.setTimeout(5000);
testSocket.on('connect', () => {
  console.log(`\n✅ google.com:443 — REACHABLE (your internet works fine)`);
  testSocket.destroy();
});
testSocket.on('error', () => {
  console.log(`\n❌ google.com:443 — ERROR (no internet at all)`);
  testSocket.destroy();
});
testSocket.connect(443, 'google.com');
