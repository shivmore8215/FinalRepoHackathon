import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Trainset from '../models/Trainset.js';
import Metrics from '../models/Metrics.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/train_plan_wise');
    console.log('MongoDB Connected for seeding additional trains');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Additional 14 trainsets with diverse scenarios
const additionalTrainsets = [
  {
    number: 'KMRL-007',
    status: 'ready',
    bay_position: 7,
    mileage: 35000,
    last_cleaning: new Date('2024-01-17T06:30:00Z'),
    branding_priority: 9,
    availability_percentage: 97
  },
  {
    number: 'KMRL-008',
    status: 'maintenance',
    bay_position: 8,
    mileage: 62000,
    last_cleaning: new Date('2024-01-05T15:45:00Z'),
    branding_priority: 4,
    availability_percentage: 65
  },
  {
    number: 'KMRL-009',
    status: 'ready',
    bay_position: 9,
    mileage: 38000,
    last_cleaning: new Date('2024-01-18T09:15:00Z'),
    branding_priority: 8,
    availability_percentage: 94
  },
  {
    number: 'KMRL-010',
    status: 'critical',
    bay_position: 10,
    mileage: 75000,
    last_cleaning: new Date('2024-01-02T11:00:00Z'),
    branding_priority: 3,
    availability_percentage: 45
  },
  {
    number: 'KMRL-011',
    status: 'standby',
    bay_position: 11,
    mileage: 28000,
    last_cleaning: new Date('2024-01-19T08:00:00Z'),
    branding_priority: 7,
    availability_percentage: 99
  },
  {
    number: 'KMRL-012',
    status: 'ready',
    bay_position: 12,
    mileage: 44000,
    last_cleaning: new Date('2024-01-16T14:30:00Z'),
    branding_priority: 9,
    availability_percentage: 96
  },
  {
    number: 'KMRL-013',
    status: 'maintenance',
    bay_position: 13,
    mileage: 58000,
    last_cleaning: new Date('2024-01-08T12:15:00Z'),
    branding_priority: 5,
    availability_percentage: 72
  },
  {
    number: 'KMRL-014',
    status: 'ready',
    bay_position: 14,
    mileage: 31000,
    last_cleaning: new Date('2024-01-18T16:45:00Z'),
    branding_priority: 8,
    availability_percentage: 98
  },
  {
    number: 'KMRL-015',
    status: 'standby',
    bay_position: 15,
    mileage: 33000,
    last_cleaning: new Date('2024-01-17T10:20:00Z'),
    branding_priority: 6,
    availability_percentage: 93
  },
  {
    number: 'KMRL-016',
    status: 'critical',
    bay_position: 16,
    mileage: 68000,
    last_cleaning: new Date('2024-01-04T13:30:00Z'),
    branding_priority: 2,
    availability_percentage: 55
  },
  {
    number: 'KMRL-017',
    status: 'ready',
    bay_position: 17,
    mileage: 29000,
    last_cleaning: new Date('2024-01-19T07:45:00Z'),
    branding_priority: 10,
    availability_percentage: 99
  },
  {
    number: 'KMRL-018',
    status: 'maintenance',
    bay_position: 18,
    mileage: 54000,
    last_cleaning: new Date('2024-01-09T11:30:00Z'),
    branding_priority: 6,
    availability_percentage: 78
  },
  {
    number: 'KMRL-019',
    status: 'standby',
    bay_position: 19,
    mileage: 36000,
    last_cleaning: new Date('2024-01-17T15:00:00Z'),
    branding_priority: 7,
    availability_percentage: 91
  },
  {
    number: 'KMRL-020',
    status: 'ready',
    bay_position: 20,
    mileage: 27000,
    last_cleaning: new Date('2024-01-19T12:00:00Z'),
    branding_priority: 9,
    availability_percentage: 100
  }
];

const seedAdditionalTrains = async () => {
  try {
    console.log('🚂 Starting to seed additional trainsets...');
    
    // Check if additional trains already exist
    const existingTrains = await Trainset.find({
      number: { $in: additionalTrainsets.map(t => t.number) }
    });
    
    if (existingTrains.length > 0) {
      console.log('⚠️  Some additional trains already exist. Clearing them first...');
      await Trainset.deleteMany({
        number: { $in: additionalTrainsets.map(t => t.number) }
      });
    }
    
    // Insert additional trainsets
    const insertedTrainsets = await Trainset.insertMany(additionalTrainsets);
    console.log(`✅ Inserted ${insertedTrainsets.length} additional trainsets`);
    
    // Calculate updated fleet statistics
    const allTrainsets = await Trainset.find();
    const statusCounts = allTrainsets.reduce((acc, train) => {
      acc[train.status] = (acc[train.status] || 0) + 1;
      return acc;
    }, {});
    
    const totalFleet = allTrainsets.length;
    const readyCount = statusCounts.ready || 0;
    const standbyCount = statusCounts.standby || 0;
    const maintenanceCount = statusCounts.maintenance || 0;
    const criticalCount = statusCounts.critical || 0;
    
    const operationalFleet = readyCount + standbyCount;
    const serviceability = Math.round((operationalFleet / totalFleet) * 100);
    const avgAvailability = Math.round(
      allTrainsets.reduce((sum, train) => sum + train.availability_percentage, 0) / totalFleet
    );
    
    // Update metrics with new fleet data
    const updatedMetrics = await Metrics.findOneAndUpdate(
      {},
      {
        $set: {
          timestamp: new Date(),
          'fleet_status.total_fleet': totalFleet,
          'fleet_status.ready': readyCount,
          'fleet_status.standby': standbyCount,
          'fleet_status.maintenance': maintenanceCount,
          'fleet_status.critical': criticalCount,
          'fleet_status.serviceability': serviceability,
          'fleet_status.avg_availability': avgAvailability,
          'current_kpis.fleet_availability': serviceability
        }
      },
      { sort: { timestamp: -1 }, new: true }
    );
    
    console.log('✅ Updated fleet metrics');
    
    // Add additional alerts for new critical and maintenance trains
    const newAlerts = [
      {
        type: 'critical',
        trainset: 'KMRL-010',
        message: 'High mileage alert: 75,000 km',
        priority: 'critical',
        timestamp: new Date()
      },
      {
        type: 'critical',
        trainset: 'KMRL-016',
        message: 'Low availability: 55%',
        priority: 'critical',
        timestamp: new Date()
      },
      {
        type: 'warning',
        trainset: 'KMRL-008',
        message: 'Scheduled maintenance overdue',
        priority: 'high',
        timestamp: new Date()
      },
      {
        type: 'warning',
        trainset: 'KMRL-013',
        message: 'Extended cleaning interval',
        priority: 'medium',
        timestamp: new Date()
      },
      {
        type: 'info',
        trainset: 'KMRL-017',
        message: 'High priority branding opportunity',
        priority: 'low',
        timestamp: new Date()
      },
      {
        type: 'info',
        trainset: 'KMRL-020',
        message: 'Perfect availability score achieved',
        priority: 'low',
        timestamp: new Date()
      }
    ];
    
    await Metrics.findOneAndUpdate(
      {},
      {
        $push: { alerts: { $each: newAlerts } }
      },
      { sort: { timestamp: -1 } }
    );
    
    console.log('✅ Added alerts for new trainsets');
    
    // Display summary
    console.log('\n📊 Updated Fleet Summary:');
    console.log(`🚂 Total Trainsets: ${totalFleet}`);
    console.log(`✅ Ready: ${readyCount}`);
    console.log(`⏸️  Standby: ${standbyCount}`);
    console.log(`🔧 Maintenance: ${maintenanceCount}`);
    console.log(`⚠️  Critical: ${criticalCount}`);
    console.log(`📈 Fleet Serviceability: ${serviceability}%`);
    console.log(`📊 Average Availability: ${avgAvailability}%`);
    
    console.log('\n🎯 Scenario Coverage:');
    console.log('✅ High-priority branding trains (KMRL-017, KMRL-020)');
    console.log('✅ Critical maintenance needed (KMRL-010, KMRL-016)');
    console.log('✅ Optimal performance trains (KMRL-011, KMRL-020)');
    console.log('✅ Extended maintenance trains (KMRL-008, KMRL-013, KMRL-018)');
    console.log('✅ Ready for premium service (KMRL-007, KMRL-009, KMRL-012, KMRL-014)');
    console.log('✅ Backup/standby fleet (KMRL-011, KMRL-015, KMRL-019)');
    console.log('✅ Various mileage scenarios (27k - 75k km)');
    console.log('✅ Diverse cleaning schedules');
    console.log('✅ Full availability range (45% - 100%)');
    
    console.log('\n🎉 Additional trainset seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding additional trainsets:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await seedAdditionalTrains();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📤 Database connection closed');
    process.exit(0);
  }
};

main();