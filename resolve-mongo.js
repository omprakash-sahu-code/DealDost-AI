const dns = require('dns');

// Use Google DNS to bypass the mobile carrier's blocked DNS
dns.setServers(['8.8.8.8', '1.1.1.1']);

const srvHostname = '_mongodb._tcp.pinhup-cluster.ebscku8.mongodb.net';

dns.resolveSrv(srvHostname, (err, addresses) => {
  if (err) {
    console.error('Even Google DNS failed to resolve it:', err);
    process.exit(1);
  }

  // Build the direct seedlist connection string
  const hosts = addresses.map(addr => `${addr.name}:${addr.port}`).join(',');
  
  const directUri = `mongodb://omprakashsahu2067_db_user:h1JGsIViiCr4Jxvi@${hosts}/?ssl=true&replicaSet=atlas-13c5h8-shard-0&authSource=admin&retryWrites=true&w=majority`;
  
  console.log('\n--- SUCCESS! Here is your direct connection string ---');
  console.log(directUri);
  console.log('-----------------------------------------------------\n');
});
