import './env'; //Mujhe env.ts se kuch lena nahi hai, bas uski file execute karwa do.
import mongoose from 'mongoose';
import app from './app';

const DB = process.env.DATABASE;

if (!DB) {
  throw new Error('DATABASE connection string is missing in config.env');
}

try {
  await mongoose.connect(DB);
  console.log('DB connection successful!');
} catch (err) {
  console.error('DB connection failed:', err);
  process.exit(1);
}


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
