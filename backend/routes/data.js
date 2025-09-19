import express from 'express';
import Trainset from '../models/Trainset.js';
import Metrics from '../models/Metrics.js';

const router = express.Router();

// @route   GET /api/data/trainsets
// @desc    Get all trainsets from MongoDB
// @access  Public
router.get('/trainsets', async (req, res) => {
  try {
    const trainsets = await Trainset.find()
      .sort({ bay_position: 1 });

    // Transform data to match frontend interface
    const transformedTrainsets = trainsets.map(trainset => ({
      id: trainset._id.toString(),
      number: trainset.number,
      status: trainset.status,
      bay_position: trainset.bay_position,
      mileage: trainset.mileage,
      last_cleaning: trainset.last_cleaning.toISOString(),
      branding_priority: trainset.branding_priority,
      availability_percentage: trainset.availability_percentage,
      created_at: trainset.createdAt.toISOString(),
      updated_at: trainset.updatedAt.toISOString()
    }));

    res.json(transformedTrainsets);
  } catch (error) {
    console.error('Error fetching trainsets:', error);
    res.status(500).json({
      message: 'Server error while fetching trainsets'
    });
  }
});

// @route   GET /api/data/trainsets/:id
// @desc    Get single trainset by ID from MongoDB
// @access  Public
router.get('/trainsets/:id', async (req, res) => {
  try {
    const trainset = await Trainset.findById(req.params.id);

    if (!trainset) {
      return res.status(404).json({
        message: 'Trainset not found'
      });
    }

    const transformedTrainset = {
      id: trainset._id.toString(),
      number: trainset.number,
      status: trainset.status,
      bay_position: trainset.bay_position,
      mileage: trainset.mileage,
      last_cleaning: trainset.last_cleaning.toISOString(),
      branding_priority: trainset.branding_priority,
      availability_percentage: trainset.availability_percentage,
      created_at: trainset.createdAt.toISOString(),
      updated_at: trainset.updatedAt.toISOString()
    };

    res.json(transformedTrainset);
  } catch (error) {
    console.error('Error fetching trainset:', error);
    res.status(500).json({
      message: 'Server error while fetching trainset'
    });
  }
});

// @route   GET /api/data/metrics
// @desc    Get current realtime metrics from MongoDB
// @access  Public
router.get('/metrics', async (req, res) => {
  try {
    // Get the most recent metrics
    const metrics = await Metrics.findOne()
      .sort({ timestamp: -1 });

    if (!metrics) {
      return res.status(404).json({
        message: 'No metrics found'
      });
    }

    // Transform data to match frontend interface
    const transformedMetrics = {
      timestamp: metrics.timestamp.toISOString(),
      fleet_status: metrics.fleet_status,
      current_kpis: metrics.current_kpis,
      planning_status: {
        schedules_generated: metrics.planning_status.schedules_generated,
        ai_confidence_avg: metrics.planning_status.ai_confidence_avg,
        last_optimization: metrics.planning_status.last_optimization
      },
      alerts: metrics.alerts
    };

    res.json(transformedMetrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      message: 'Server error while fetching metrics'
    });
  }
});

// @route   PUT /api/data/trainsets/:id/status
// @desc    Update trainset status in MongoDB
// @access  Public
router.put('/trainsets/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: 'Status is required'
      });
    }

    const validStatuses = ['ready', 'standby', 'maintenance', 'critical'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status value'
      });
    }

    const trainset = await Trainset.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!trainset) {
      return res.status(404).json({
        message: 'Trainset not found'
      });
    }

    // Update metrics after status change
    await updateMetricsAfterStatusChange();

    res.json({
      message: 'Trainset status updated successfully',
      trainset: {
        id: trainset._id.toString(),
        number: trainset.number,
        status: trainset.status,
        availability_percentage: trainset.availability_percentage
      }
    });
  } catch (error) {
    console.error('Error updating trainset status:', error);
    res.status(500).json({
      message: 'Server error while updating trainset status'
    });
  }
});

// @route   POST /api/data/ai-schedule
// @desc    Generate AI-optimized schedule using MongoDB data
// @access  Public
router.post('/ai-schedule', async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        message: 'Date is required'
      });
    }

    // Get all trainsets for comprehensive AI analysis
    const allTrainsets = await Trainset.find()
      .sort({ availability_percentage: -1, branding_priority: -1 });

    if (allTrainsets.length === 0) {
      return res.status(400).json({
        message: 'No trainsets found for analysis'
      });
    }

    // Generate AI recommendations for all trainsets
    const recommendations = allTrainsets.map(trainset => {
      let recommendedStatus = trainset.status;
      let confidence = 0.8;
      let priority = 5;
      const reasoning = [];
      const riskFactors = [];

      // Enhanced AI logic simulation with comprehensive analysis
      
      // Critical conditions (highest priority)
      if (trainset.mileage > 65000) {
        recommendedStatus = 'critical';
        confidence = 0.98;
        priority = 10;
        reasoning.push('Extremely high mileage - immediate attention required');
        reasoning.push('Safety inspection required');
        riskFactors.push('Potential mechanical failure risk');
        riskFactors.push('Extended service intervals exceeded');
      } else if (trainset.availability_percentage < 55) {
        recommendedStatus = 'critical';
        confidence = 0.95;
        priority = 9;
        reasoning.push('Critical availability threshold breached');
        reasoning.push('Immediate maintenance intervention required');
        riskFactors.push('Service reliability compromised');
      } 
      
      // Maintenance conditions
      else if (trainset.mileage > 50000 && trainset.availability_percentage < 85) {
        recommendedStatus = 'maintenance';
        confidence = 0.9;
        priority = 8;
        reasoning.push('High mileage combined with declining availability');
        reasoning.push('Comprehensive maintenance scheduled');
        riskFactors.push('Performance degradation trend detected');
      } else if (trainset.availability_percentage < 80) {
        recommendedStatus = 'maintenance';
        confidence = 0.85;
        priority = 7;
        reasoning.push('Availability below operational threshold');
        reasoning.push('Preventive maintenance recommended');
      } else if (trainset.mileage > 45000) {
        recommendedStatus = 'maintenance';
        confidence = 0.8;
        priority = 6;
        reasoning.push('Scheduled maintenance window approaching');
        reasoning.push('Proactive service optimization');
      }
      
      // Ready for service conditions
      else if (trainset.availability_percentage >= 95 && trainset.branding_priority >= 8) {
        recommendedStatus = 'ready';
        confidence = 0.95;
        priority = 9;
        reasoning.push('Excellent performance metrics');
        reasoning.push('High revenue potential - premium branding');
        reasoning.push('Optimal passenger experience delivery');
      } else if (trainset.availability_percentage >= 90 && trainset.mileage < 40000) {
        recommendedStatus = 'ready';
        confidence = 0.9;
        priority = 8;
        reasoning.push('Strong operational performance');
        reasoning.push('Low wear and tear profile');
        reasoning.push('Suitable for high-frequency service');
      }
      
      // Standby conditions
      else if (trainset.availability_percentage >= 85 && trainset.branding_priority < 7) {
        recommendedStatus = 'standby';
        confidence = 0.85;
        priority = 5;
        reasoning.push('Good operational capacity');
        reasoning.push('Optimal for backup service role');
        reasoning.push('Cost-effective reserve deployment');
      } else {
        // Default standby recommendation
        recommendedStatus = 'standby';
        confidence = 0.75;
        priority = 4;
        reasoning.push('Standard operational capacity');
        reasoning.push('Available for flexible deployment');
      }

      // Additional risk factor analysis
      const daysSinceLastCleaning = Math.floor((new Date() - new Date(trainset.last_cleaning)) / (1000 * 60 * 60 * 24));
      if (daysSinceLastCleaning > 10) {
        riskFactors.push('Extended cleaning interval detected');
        priority = Math.min(priority + 1, 10);
      }

      if (trainset.branding_priority <= 3 && trainset.availability_percentage < 70) {
        riskFactors.push('Low priority train with declining performance');
      }

      return {
        trainset_id: trainset._id.toString(),
        recommended_status: recommendedStatus,
        confidence_score: confidence,
        reasoning,
        priority_score: priority,
        risk_factors: riskFactors
      };
    });

    // Update planning status in metrics
    await Metrics.findOneAndUpdate(
      {},
      {
        $inc: { 'planning_status.schedules_generated': 1 },
        $set: { 
          'planning_status.last_optimization': new Date(),
          'planning_status.ai_confidence_avg': Math.round(
            recommendations.reduce((sum, rec) => sum + rec.confidence_score, 0) / recommendations.length * 100
          )
        }
      },
      { sort: { timestamp: -1 } }
    );

    const summary = {
      total_trainsets: allTrainsets.length,
      recommendations: recommendations.reduce((acc, rec) => {
        acc[rec.recommended_status] = (acc[rec.recommended_status] || 0) + 1;
        return acc;
      }, {}),
      average_confidence: Math.round(recommendations.reduce((sum, rec) => sum + rec.confidence_score, 0) / recommendations.length * 100) / 100,
      high_risk_count: recommendations.filter(r => r.risk_factors.length > 0).length,
      optimization_timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      recommendations,
      summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating AI schedule:', error);
    res.status(500).json({
      message: 'Server error while generating AI schedule'
    });
  }
});

// Helper function to update metrics after status changes
const updateMetricsAfterStatusChange = async () => {
  try {
    const trainsets = await Trainset.find();
    
    const statusCounts = trainsets.reduce((acc, train) => {
      acc[train.status] = (acc[train.status] || 0) + 1;
      return acc;
    }, {});

    const totalFleet = trainsets.length;
    const readyCount = statusCounts.ready || 0;
    const standbyCount = statusCounts.standby || 0;
    const maintenanceCount = statusCounts.maintenance || 0;
    const criticalCount = statusCounts.critical || 0;

    const operationalFleet = readyCount + standbyCount;
    const serviceability = Math.round((operationalFleet / totalFleet) * 100);
    const avgAvailability = Math.round(
      trainsets.reduce((sum, train) => sum + train.availability_percentage, 0) / totalFleet
    );

    // Update the most recent metrics
    await Metrics.findOneAndUpdate(
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
      { sort: { timestamp: -1 } }
    );
  } catch (error) {
    console.error('Error updating metrics:', error);
  }
};

export default router;