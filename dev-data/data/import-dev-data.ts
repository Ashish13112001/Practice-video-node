import '../../env'; // Same as server.ts: run env.ts so config.env is loaded into process.env
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

import Tour from '../../models/tourModels';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB = process.env.DATABASE;

if (!DB) {
  throw new Error('DATABASE connection string is missing in config.env');
}

const tours = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'tours-simple.json'), 'utf-8'),
);

const importData = async (): Promise<void> => {
  try {
    await mongoose.connect(DB);

    await Tour.create(tours);

    console.log('Data successfully loaded!');
  } catch (err) {
    console.error('Error importing data:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

const deleteData = async (): Promise<void> => {
  try {
    await mongoose.connect(DB);

    await Tour.deleteMany();

    console.log('Data successfully deleted!');
  } catch (err) {
    console.error('Error deleting data:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

const run = async (): Promise<void> => {
  const command = process.argv[2];

  if (command === '--import') {
    await importData();
  } else if (command === '--delete') {
    await deleteData();
  } else {
    console.log('Usage: npm run data:import | npm run data:delete');
    process.exitCode = 1;
  }
};

run();
