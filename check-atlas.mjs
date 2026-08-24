import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';

const uri = 'mongodb+srv://admin:admin123@sp-proj.0vlarpn.mongodb.net/roofi?retryWrites=true&w=majority&appName=Sp-proj';
console.log('Connecting to MongoDB Atlas...');
try {
  await mongoose.connect(uri);
  console.log('SUCCESS: Connected to MongoDB Atlas!');
  const users = mongoose.connection.db.collection('users');
  const count = await users.countDocuments();
  console.log('Users count:', count);
  const allUsers = await users.find({}, { projection: { email: 1, role: 1, status: 1, password: 1 } }).toArray();
  allUsers.forEach(u => console.log(JSON.stringify({
    email: u.email,
    role: u.role,
    status: u.status,
    hasPassword: !!u.password,
    passwordLength: u.password?.length
  })));
  await mongoose.disconnect();
  console.log('Done.');
} catch(e) {
  console.error('FAILED:', e.message);
}
