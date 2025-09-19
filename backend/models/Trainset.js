import mongoose from 'mongoose';

const trainsetSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['ready', 'standby', 'maintenance', 'critical'],
    default: 'ready'
  },
  bay_position: {
    type: Number,
    required: true,
    min: 1
  },
  mileage: {
    type: Number,
    required: true,
    min: 0
  },
  last_cleaning: {
    type: Date,
    required: true
  },
  branding_priority: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  availability_percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
trainsetSchema.index({ status: 1 });
trainsetSchema.index({ bay_position: 1 });
trainsetSchema.index({ availability_percentage: -1 });

const Trainset = mongoose.model('Trainset', trainsetSchema);

export default Trainset;