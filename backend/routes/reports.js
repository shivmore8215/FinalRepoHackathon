import express from 'express';
import ExcelJS from 'exceljs';
import Trainset from '../models/Trainset.js';
import Metrics from '../models/Metrics.js';

const router = express.Router();

// @route   GET /api/reports/excel
// @desc    Generate Excel report with detailed numerical data
// @access  Public
router.get('/excel', async (req, res) => {
  try {
    console.log('Starting Excel report generation...');
    
    // Fetch all data
    const trainsets = await Trainset.find().sort({ number: 1 });
    const metrics = await Metrics.findOne().sort({ timestamp: -1 });
    
    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Train Plan Wise System';
    workbook.created = new Date();
    
    // 1. Fleet Overview Sheet
    const overviewSheet = workbook.addWorksheet('Fleet Overview');
    
    // Header styling
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };
    
    // Fleet status summary
    overviewSheet.addRow(['KOCHI METRO RAIL LIMITED - FLEET REPORT']);
    overviewSheet.getRow(1).font = { bold: true, size: 16 };
    overviewSheet.mergeCells('A1:F1');
    overviewSheet.addRow([]);
    
    overviewSheet.addRow(['Report Generated:', new Date().toLocaleString()]);
    overviewSheet.addRow(['Total Fleet Size:', trainsets.length]);
    overviewSheet.addRow([]);
    
    // Fleet status breakdown
    const statusCounts = trainsets.reduce((acc, train) => {
      acc[train.status] = (acc[train.status] || 0) + 1;
      return acc;
    }, {});
    
    overviewSheet.addRow(['FLEET STATUS BREAKDOWN']);
    overviewSheet.getRow(6).font = { bold: true };
    overviewSheet.addRow(['Status', 'Count', 'Percentage']);
    overviewSheet.getRow(7).eachCell(cell => cell.style = headerStyle);
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      const percentage = ((count / trainsets.length) * 100).toFixed(1);
      overviewSheet.addRow([status.toUpperCase(), count, `${percentage}%`]);
    });
    
    // KPIs section
    overviewSheet.addRow([]);
    overviewSheet.addRow(['KEY PERFORMANCE INDICATORS']);
    overviewSheet.getRow(overviewSheet.rowCount).font = { bold: true };
    
    if (metrics?.current_kpis) {
      overviewSheet.addRow(['Metric', 'Value', 'Unit']);
      overviewSheet.getRow(overviewSheet.rowCount).eachCell(cell => cell.style = headerStyle);
      
      overviewSheet.addRow(['Fleet Availability', metrics.current_kpis.fleet_availability || 0, '%']);
      overviewSheet.addRow(['Punctuality', metrics.current_kpis.punctuality || 0, '%']);
      overviewSheet.addRow(['Maintenance Cost', metrics.current_kpis.maintenance_cost || 0, 'INR']);
      overviewSheet.addRow(['Energy Consumption', metrics.current_kpis.energy_consumption || 0, 'kWh']);
    }
    
    // 2. Detailed Trainset Data Sheet
    const detailSheet = workbook.addWorksheet('Trainset Details');
    
    // Headers
    const headers = [
      'Trainset Number',
      'Current Status',
      'Bay Position',
      'Mileage (km)',
      'Availability %',
      'Last Cleaning',
      'Branding Priority',
      'Days Since Cleaning',
      'Maintenance Due'
    ];
    
    detailSheet.addRow(headers);
    detailSheet.getRow(1).eachCell(cell => cell.style = headerStyle);
    
    // Data rows
    trainsets.forEach(trainset => {
      const daysSinceCleaning = Math.floor(
        (new Date() - new Date(trainset.last_cleaning)) / (1000 * 60 * 60 * 24)
      );
      
      const maintenanceDue = trainset.mileage > 50000 || trainset.availability_percentage < 85 ? 'Yes' : 'No';
      
      detailSheet.addRow([
        trainset.number,
        trainset.status.toUpperCase(),
        trainset.bay_position,
        trainset.mileage.toLocaleString(),
        `${trainset.availability_percentage}%`,
        new Date(trainset.last_cleaning).toLocaleDateString(),
        trainset.branding_priority,
        daysSinceCleaning,
        maintenanceDue
      ]);
    });
    
    // 3. Maintenance Schedule Sheet
    const maintenanceSheet = workbook.addWorksheet('Maintenance Schedule');
    
    maintenanceSheet.addRow(['MAINTENANCE PRIORITY ANALYSIS']);
    maintenanceSheet.getRow(1).font = { bold: true, size: 14 };
    maintenanceSheet.addRow([]);
    
    const maintenanceHeaders = [
      'Priority',
      'Trainset',
      'Status',
      'Mileage',
      'Availability %',
      'Action Required',
      'Urgency Level'
    ];
    
    maintenanceSheet.addRow(maintenanceHeaders);
    maintenanceSheet.getRow(3).eachCell(cell => cell.style = headerStyle);
    
    // Sort trainsets by maintenance priority
    const maintenancePriority = trainsets
      .map(train => {
        let priority = 1;
        let action = 'Monitor';
        let urgency = 'Low';
        
        if (train.mileage > 65000) {
          priority = 10;
          action = 'Immediate Overhaul';
          urgency = 'Critical';
        } else if (train.availability_percentage < 60) {
          priority = 9;
          action = 'Emergency Repair';
          urgency = 'Critical';
        } else if (train.mileage > 50000) {
          priority = 7;
          action = 'Scheduled Maintenance';
          urgency = 'High';
        } else if (train.availability_percentage < 85) {
          priority = 6;
          action = 'Preventive Maintenance';
          urgency = 'Medium';
        } else if (train.mileage > 40000) {
          priority = 4;
          action = 'Inspection';
          urgency = 'Medium';
        }
        
        return { ...train._doc, priority, action, urgency };
      })
      .sort((a, b) => b.priority - a.priority);
    
    maintenancePriority.forEach(train => {
      const row = maintenanceSheet.addRow([
        train.priority,
        train.number,
        train.status.toUpperCase(),
        train.mileage.toLocaleString(),
        `${train.availability_percentage}%`,
        train.action,
        train.urgency
      ]);
      
      // Color coding based on urgency
      if (train.urgency === 'Critical') {
        row.eachCell((cell, colNumber) => {
          if (colNumber > 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6' } };
        });
      } else if (train.urgency === 'High') {
        row.eachCell((cell, colNumber) => {
          if (colNumber > 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2E6' } };
        });
      }
    });
    
    // 4. Performance Analytics Sheet
    const analyticsSheet = workbook.addWorksheet('Performance Analytics');
    
    analyticsSheet.addRow(['PERFORMANCE ANALYTICS']);
    analyticsSheet.getRow(1).font = { bold: true, size: 14 };
    analyticsSheet.addRow([]);
    
    // Availability distribution
    analyticsSheet.addRow(['AVAILABILITY DISTRIBUTION']);
    analyticsSheet.getRow(3).font = { bold: true };
    
    const availabilityRanges = [
      { range: '95-100%', min: 95, max: 100 },
      { range: '85-94%', min: 85, max: 94 },
      { range: '75-84%', min: 75, max: 84 },
      { range: '60-74%', min: 60, max: 74 },
      { range: 'Below 60%', min: 0, max: 59 }
    ];
    
    analyticsSheet.addRow(['Availability Range', 'Trainset Count', 'Trainset Numbers']);
    analyticsSheet.getRow(4).eachCell(cell => cell.style = headerStyle);
    
    availabilityRanges.forEach(range => {
      const trainsInRange = trainsets.filter(t => 
        t.availability_percentage >= range.min && t.availability_percentage <= range.max
      );
      const trainNumbers = trainsInRange.map(t => t.number).join(', ');
      
      analyticsSheet.addRow([range.range, trainsInRange.length, trainNumbers]);
    });
    
    // Mileage distribution
    analyticsSheet.addRow([]);
    analyticsSheet.addRow(['MILEAGE DISTRIBUTION']);
    analyticsSheet.getRow(analyticsSheet.rowCount).font = { bold: true };
    
    const mileageRanges = [
      { range: '0-30k km', min: 0, max: 30000 },
      { range: '30-45k km', min: 30001, max: 45000 },
      { range: '45-60k km', min: 45001, max: 60000 },
      { range: '60k+ km', min: 60001, max: Infinity }
    ];
    
    analyticsSheet.addRow(['Mileage Range', 'Trainset Count', 'Average Availability']);
    analyticsSheet.getRow(analyticsSheet.rowCount).eachCell(cell => cell.style = headerStyle);
    
    mileageRanges.forEach(range => {
      const trainsInRange = trainsets.filter(t => 
        t.mileage >= range.min && t.mileage <= range.max
      );
      const avgAvailability = trainsInRange.length > 0 
        ? (trainsInRange.reduce((sum, t) => sum + t.availability_percentage, 0) / trainsInRange.length).toFixed(1)
        : 0;
      
      analyticsSheet.addRow([range.range, trainsInRange.length, `${avgAvailability}%`]);
    });
    
    // Auto-size columns
    [overviewSheet, detailSheet, maintenanceSheet, analyticsSheet].forEach(sheet => {
      sheet.columns.forEach(column => {
        let maxLength = 10;
        if (column.eachCell) {
          column.eachCell({ includeEmpty: false }, cell => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          });
        }
        column.width = Math.min(maxLength + 2, 30);
      });
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Train_Fleet_Report_${new Date().toISOString().split('T')[0]}.xlsx"`);
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
    
    console.log('Excel report generated successfully');
    
  } catch (error) {
    console.error('Error generating Excel report:', error);
    res.status(500).json({
      message: 'Error generating Excel report',
      error: error.message
    });
  }
});

// @route   GET /api/reports/summary
// @desc    Get report data for frontend processing
// @access  Public
router.get('/summary', async (req, res) => {
  try {
    const trainsets = await Trainset.find().sort({ number: 1 });
    const metrics = await Metrics.findOne().sort({ timestamp: -1 });
    
    // Calculate summary statistics
    const statusCounts = trainsets.reduce((acc, train) => {
      acc[train.status] = (acc[train.status] || 0) + 1;
      return acc;
    }, {});
    
    const availabilityStats = {
      average: Math.round(trainsets.reduce((sum, t) => sum + t.availability_percentage, 0) / trainsets.length),
      highest: Math.max(...trainsets.map(t => t.availability_percentage)),
      lowest: Math.min(...trainsets.map(t => t.availability_percentage))
    };
    
    const mileageStats = {
      average: Math.round(trainsets.reduce((sum, t) => sum + t.mileage, 0) / trainsets.length),
      highest: Math.max(...trainsets.map(t => t.mileage)),
      lowest: Math.min(...trainsets.map(t => t.mileage))
    };
    
    // Maintenance priorities
    const criticalTrains = trainsets.filter(t => t.mileage > 60000 || t.availability_percentage < 70).length;
    const maintenanceNeeded = trainsets.filter(t => t.mileage > 45000 || t.availability_percentage < 85).length;
    
    res.json({
      fleet_overview: {
        total_trains: trainsets.length,
        status_breakdown: statusCounts,
        operational_trains: (statusCounts.ready || 0) + (statusCounts.standby || 0),
        serviceability: Math.round(((statusCounts.ready || 0) + (statusCounts.standby || 0)) / trainsets.length * 100)
      },
      performance_stats: {
        availability: availabilityStats,
        mileage: mileageStats
      },
      maintenance_overview: {
        critical_attention: criticalTrains,
        maintenance_needed: maintenanceNeeded,
        healthy_trains: trainsets.length - maintenanceNeeded
      },
      current_kpis: metrics?.current_kpis || {},
      alerts_count: metrics?.alerts?.length || 0,
      report_timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating report summary:', error);
    res.status(500).json({
      message: 'Error generating report summary',
      error: error.message
    });
  }
});

export default router;