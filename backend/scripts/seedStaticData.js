import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Trainset from '../models/Trainset.js';
import Metrics from '../models/Metrics.js';

// Load environment variables
dotenv.config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/train_plan_wise');
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Static trainset data from mockData.ts
const trainsetsData = [
  {
    number: 'KMRL-001',
    status: 'ready',
    bay_position: 1,
    mileage: 45000,
    last_cleaning: new Date('2024-01-15T08:00:00Z'),
    branding_priority: 8,
    availability_percentage: 95
  },
  {
    number: 'KMRL-002',
    status: 'ready',
    bay_position: 2,
    mileage: 42000,
    last_cleaning: new Date('2024-01-14T09:30:00Z'),
    branding_priority: 7,
    availability_percentage: 98
  },
  {
    number: 'KMRL-003',
    status: 'maintenance',
    bay_position: 3,
    mileage: 48000,
    last_cleaning: new Date('2024-01-10T14:00:00Z'),
    branding_priority: 6,
    availability_percentage: 85
  },
  {
    number: 'KMRL-004',
    status: 'standby',
    bay_position: 4,
    mileage: 39000,
    last_cleaning: new Date('2024-01-16T07:00:00Z'),
    branding_priority: 9,
    availability_percentage: 92
  },
  {
    number: 'KMRL-005',
    status: 'ready',
    bay_position: 5,
    mileage: 41000,
    last_cleaning: new Date('2024-01-15T10:15:00Z'),
    branding_priority: 8,
    availability_percentage: 96
  },
  {
    number: 'KMRL-006',
    status: 'critical',
    bay_position: 6,
    mileage: 52000,
    last_cleaning: new Date('2024-01-08T16:30:00Z'),
    branding_priority: 5,
    availability_percentage: 70
  }
];

// Static metrics data from mockData.ts
const metricsData = {
  timestamp: new Date(),
  fleet_status: {
    total_fleet: 6,
    ready: 3,
    standby: 1,
    maintenance: 1,
    critical: 1,
    serviceability: 67,
    avg_availability: 89
  },
  current_kpis: {
    punctuality: 99.2,
    fleet_availability: 67,
    maintenance_cost: 125000,
    energy_consumption: 8500.50
  },
  planning_status: {
    schedules_generated: 0,
    ai_confidence_avg: 0,
    last_optimization: null
  },
  alerts: [
    {
      type: 'critical',
      trainset: 'KMRL-006',
      message: 'Low availability: 70%',
      priority: 'critical'
    },
    {
      type: 'warning',
      trainset: 'KMRL-003',
      message: 'Maintenance required',
      priority: 'high'
    }
  ]
};

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await Trainset.deleteMany({});
    await Metrics.deleteMany({});

    console.log('🚂 Seeding trainsets...');
    await Trainset.insertMany(trainsetsData);
    console.log(`✅ Inserted ${trainsetsData.length} trainsets`);

    console.log('📊 Seeding metrics...');
    await Metrics.create(metricsData);
    console.log('✅ Inserted current metrics');

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📊 Summary:
- Trainsets: ${trainsetsData.length}
- Metrics: 1 current snapshot

🚂 Fleet Status:
- Ready: ${trainsetsData.filter(t => t.status === 'ready').length}
- Standby: ${trainsetsData.filter(t => t.status === 'standby').length}
- Maintenance: ${trainsetsData.filter(t => t.status === 'maintenance').length}
- Critical: ${trainsetsData.filter(t => t.status === 'critical').length}
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📴 Database connection closed');
    process.exit(0);
  }
};

// Run the seeding
seedDatabase();