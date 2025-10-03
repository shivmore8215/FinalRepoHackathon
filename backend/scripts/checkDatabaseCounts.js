import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Trainset from '../models/Trainset.js';
import Metrics from '../models/Metrics.js';

dotenv.config();

const checkDatabaseCounts = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    console.log(`Database: ${mongoose.connection.name}`);
    console.log('================================');

    // Get counts for each collection
    const userCount = await User.countDocuments();
    const trainsetCount = await Trainset.countDocuments();
    const metricsCount = await Metrics.countDocuments();

    // Display results
    console.log('\n📊 DATABASE TABLE COUNTS:');
    console.log('================================');
    console.log(`👥 Users: ${userCount} entries`);
    console.log(`🚂 Trainsets: ${trainsetCount} entries`);
    console.log(`📈 Metrics: ${metricsCount} entries`);
    console.log('================================');

    // Get additional details for each collection
    if (userCount > 0) {
      console.log('\n👥 USER DETAILS:');
      const usersByRole = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);
      const usersByStatus = await User.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      console.log('By Role:', usersByRole);
      console.log('By Status:', usersByStatus);
    }

    if (trainsetCount > 0) {
      console.log('\n🚂 TRAINSET DETAILS:');
      const trainsetsByStatus = await Trainset.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      console.log('By Status:', trainsetsByStatus);
      
      const avgAvailability = await Trainset.aggregate([
        { $group: { _id: null, avgAvailability: { $avg: '$availability_percentage' } } }
      ]);
      if (avgAvailability[0]) {
        console.log(`Average Availability: ${avgAvailability[0].avgAvailability.toFixed(2)}%`);
      }
    }

    if (metricsCount > 0) {
      console.log('\n📈 METRICS DETAILS:');
      const latestMetric = await Metrics.findOne().sort({ timestamp: -1 });
      if (latestMetric) {
        console.log(`Latest entry: ${latestMetric.timestamp}`);
        console.log(`Fleet total: ${latestMetric.fleet_status.total_fleet}`);
      }
    }

    console.log('\n✅ Database check completed successfully!');

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
};

checkDatabaseCounts();