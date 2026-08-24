const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = 'mongodb+srv://admin:admin123@sp-proj.0vlarpn.mongodb.net/roofi?retryWrites=true&w=majority&appName=Sp-proj';

mongoose.connect(uri).then(async () => {
  console.log('Connected to Atlas!');
  const users = mongoose.connection.db.collection('users');
  const hash = await bcrypt.hash('roofi@2026', 10);
  const result = await users.updateMany({}, { $set: { password: hash } });
  console.log('Updated', result.modifiedCount, 'users with fresh bcrypt hash');
  const verify = await bcrypt.compare('roofi@2026', hash);
  console.log('Password verification test:', verify);
  const all = await users.find({}, { projection: { email: 1, role: 1, status: 1 } }).toArray();
  all.forEach(u => console.log(JSON.stringify(u)));
  await mongoose.disconnect();
  console.log('Done!');
}).catch(e => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
