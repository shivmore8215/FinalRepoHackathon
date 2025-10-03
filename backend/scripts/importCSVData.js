import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import { parse } from 'csv-parse';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';
import Trainset from '../models/Trainset.js';
import Metrics from '../models/Metrics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const datasetPath = join(__dirname, '../../DATASET');

// Helper function to read CSV files
const readCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// Helper function to parse date
const parseDate = (dateString) => {
  if (!dateString) return new Date();
  const parts = dateString.split('-');
  if (parts.length === 3) {
    // Assuming DD-MM-YYYY format
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }
  return new Date(dateString);
};

// Map CSV status to our model status
const mapTrainsetStatus = (csvStatus) => {
  const statusMap = {
    'in_service': 'ready',
    'standby': 'standby', 
    'IBL_maintenance': 'maintenance',
    'major_maintenance': 'maintenance',
    'critical_issue': 'critical'
  };
  return statusMap[csvStatus] || 'standby';
};

const importData = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️ Clearing existing trainset and metrics data...');
    await Trainset.deleteMany({});
    await Metrics.deleteMany({});

    // Import Trainset data
    console.log('📊 Importing trainset master data...');
    const trainsetMaster = await readCSV(join(datasetPath, '1 trainset_master.csv'));
    
    console.log('📊 Importing mileage records...');
    const mileageRecords = await readCSV(join(datasetPath, '5 mileage_records.csv'));
    
    console.log('📊 Importing cleaning schedule...');
    const cleaningSchedule = await readCSV(join(datasetPath, '6 cleaning_schedule.csv'));
    
    console.log('📊 Importing branding commitments...');
    const brandingCommitments = await readCSV(join(datasetPath, '4 branding_commitments.csv'));

    // Create a map of trainset data
    const trainsetData = new Map();
    
    // Process trainset master data
    trainsetMaster.forEach(train => {
      const trainsetId = train.trainset_id;
      trainsetData.set(trainsetId, {
        number: train.rake_number,
        status: mapTrainsetStatus(train.current_status),
        bay_position: Math.floor(Math.random() * 20) + 1, // Random bay for now
        mileage: 0,
        last_cleaning: new Date(),
        branding_priority: 5, // Default priority
        availability_percentage: 85 // Default availability
      });
    });

    // Enrich with mileage data
    mileageRecords.forEach(record => {
      const trainsetId = record.trainset_id;
      if (trainsetData.has(trainsetId)) {
        const train = trainsetData.get(trainsetId);
        train.mileage = parseInt(record.total_km_run) || 0;
        trainsetData.set(trainsetId, train);
      }
    });

    // Enrich with cleaning data (get last completed cleaning)
    cleaningSchedule.forEach(cleaning => {
      const trainsetId = cleaning.trainset_id;
      if (trainsetData.has(trainsetId) && cleaning.status === 'completed') {
        const train = trainsetData.get(trainsetId);
        const cleaningDate = parseDate(cleaning.scheduled_date_time);
        if (cleaningDate > train.last_cleaning) {
          train.last_cleaning = cleaningDate;
        }
        trainsetData.set(trainsetId, train);
      }
    });

    // Enrich with branding priority
    brandingCommitments.forEach(branding => {
      const trainsetId = branding.trainset_id;
      if (trainsetData.has(trainsetId)) {
        const train = trainsetData.get(trainsetId);
        const priority = branding.priority === 'critical' ? 9 : 
                        branding.priority === 'high' ? 7 : 
                        branding.priority === 'normal' ? 5 : 3;
        train.branding_priority = priority;
        
        // Adjust availability based on campaign status
        const hoursAchieved = parseInt(branding.exposure_achieved_hours) || 0;
        const hoursTarget = parseInt(branding.exposure_target_hours) || 1;
        const campaignPerformance = Math.min(100, (hoursAchieved / hoursTarget) * 100);
        train.availability_percentage = Math.max(60, Math.min(100, 
          train.availability_percentage + (campaignPerformance - 85) * 0.2
        ));
        
        trainsetData.set(trainsetId, train);
      }
    });

    // Insert trainset data into database
    console.log('💾 Inserting trainset data into database...');
    const trainsets = Array.from(trainsetData.values());
    
    if (trainsets.length > 0) {
      await Trainset.insertMany(trainsets);
      console.log(`✅ Inserted ${trainsets.length} trainsets successfully`);
    }

    // Create initial metrics data
    console.log('📈 Creating initial metrics data...');
    const totalTrainsets = trainsets.length;
    const statusCounts = {
      ready: 0,
      standby: 0,
      maintenance: 0,
      critical: 0
    };

    trainsets.forEach(train => {
      statusCounts[train.status]++;
    });

    const avgAvailability = trainsets.reduce((sum, train) => sum + train.availability_percentage, 0) / totalTrainsets || 0;
    const serviceability = ((statusCounts.ready + statusCounts.standby) / totalTrainsets) * 100 || 0;

    const initialMetrics = new Metrics({
      timestamp: new Date(),
      fleet_status: {
        total_fleet: totalTrainsets,
        ready: statusCounts.ready,
        standby: statusCounts.standby,
        maintenance: statusCounts.maintenance,
        critical: statusCounts.critical,
        serviceability: Math.round(serviceability * 100) / 100,
        avg_availability: Math.round(avgAvailability * 100) / 100
      },
      current_kpis: {
        punctuality: Math.floor(Math.random() * 10) + 90, // Random between 90-99%
        fleet_availability: Math.round(avgAvailability * 100) / 100,
        maintenance_cost: Math.floor(Math.random() * 100000) + 500000, // Random cost
        energy_consumption: Math.floor(Math.random() * 1000) + 2000 // Random consumption
      },
      planning_status: {
        schedules_generated: Math.floor(Math.random() * 50) + 100,
        ai_confidence_avg: Math.floor(Math.random() * 20) + 80,
        last_optimization: new Date()
      },
      alerts: []
    });

    // Add some sample alerts for critical/maintenance trainsets
    trainsets.forEach(train => {
      if (train.status === 'critical') {
        initialMetrics.alerts.push({
          type: 'critical',
          trainset: train.number,
          message: `Trainset ${train.number} requires immediate attention`,
          priority: 'critical'
        });
      } else if (train.status === 'maintenance') {
        initialMetrics.alerts.push({
          type: 'warning',
          trainset: train.number,
          message: `Trainset ${train.number} is under maintenance`,
          priority: 'high'
        });
      }
    });

    await initialMetrics.save();
    console.log('✅ Created initial metrics data');

    // Final summary
    console.log('\n🎉 DATA IMPORT COMPLETED SUCCESSFULLY!');
    console.log('=====================================');
    console.log(`📊 Imported ${trainsets.length} trainsets`);
    console.log(`📈 Created 1 metrics record`);
    console.log(`🚂 Fleet Status:`);
    console.log(`   - Ready: ${statusCounts.ready}`);
    console.log(`   - Standby: ${statusCounts.standby}`);
    console.log(`   - Maintenance: ${statusCounts.maintenance}`);
    console.log(`   - Critical: ${statusCounts.critical}`);
    console.log(`📈 Average Availability: ${avgAvailability.toFixed(2)}%`);
    console.log(`⚡ Serviceability: ${serviceability.toFixed(2)}%`);
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Error importing data:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the import
importData();