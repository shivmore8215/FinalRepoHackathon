import mongoose from 'mongoose';

const metricsSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  fleet_status: {
    total_fleet: {
      type: Number,
      required: true,
      min: 0
    },
    ready: {
      type: Number,
      required: true,
      min: 0
    },
    standby: {
      type: Number,
      required: true,
      min: 0
    },
    maintenance: {
      type: Number,
      required: true,
      min: 0
    },
    critical: {
      type: Number,
      required: true,
      min: 0
    },
    serviceability: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    avg_availability: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  current_kpis: {
    punctuality: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    fleet_availability: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    maintenance_cost: {
      type: Number,
      required: true,
      min: 0
    },
    energy_consumption: {
      type: Number,
      required: true,
      min: 0
    }
  },
  planning_status: {
    schedules_generated: {
      type: Number,
      default: 0,
      min: 0
    },
    ai_confidence_avg: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    last_optimization: {
      type: Date,
      default: null
    }
  },
  alerts: [{
    type: {
      type: String,
      enum: ['critical', 'warning', 'info'],
      required: true
    },
    trainset: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      required: true
    }
  }]
}, {
  timestamps: true
});

// Add indexes for better query performance
metricsSchema.index({ timestamp: -1 });

const Metrics = mongoose.model('Metrics', metricsSchema);

export default Metrics;