import { jsPDF } from 'jspdf';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface Trainset {
  number: string;
  status: string;
  mileage: number;
  availability_percentage: number;
}

interface Metrics {
  current_kpis?: {
    fleet_availability?: number;
    punctuality?: number;
    energy_consumption?: number;
  };
  alerts?: {
    trainset: string;
    message: string;
    priority: string;
  }[];
}

export class PDFReportGenerator {
  private doc: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageHeight = 297;
    this.pageWidth = 210;
    this.margin = 20;
    this.currentY = this.margin;
  }

  async generateFleetReport(trainsets: Trainset[], metrics: Metrics): Promise<jsPDF> {
    try {
      // Title Page
      this.addTitle('KOCHI METRO RAIL LIMITED', 16);
      this.addTitle('TRAIN FLEET MANAGEMENT REPORT', 14);
      this.currentY += 10;
      
      this.addText(`Report Generated: ${new Date().toLocaleString()}`, 10);
      this.addText(`Total Fleet Size: ${trainsets.length} Trainsets`, 10);
      this.currentY += 10;

      // Fleet Status Overview
      await this.addFleetStatusChart(trainsets);
      
      // Performance Metrics
      await this.addPerformanceCharts(trainsets, metrics);
      
      // Availability Analysis
      await this.addAvailabilityChart(trainsets);
      
      // Mileage Distribution
      await this.addMileageChart(trainsets);
      
      // Critical Alerts
      this.addCriticalAlerts(trainsets, metrics);
      
      // Summary and Recommendations
      this.addSummaryAndRecommendations(trainsets, metrics);
      
      return this.doc;
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw error;
    }
  }

  addTitle(text: string, fontSize = 12): void {
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'bold');
    const textWidth = this.doc.getTextWidth(text);
    const x = (this.pageWidth - textWidth) / 2;
    this.doc.text(text, x, this.currentY);
    this.currentY += fontSize * 0.5 + 5;
  }

  addText(text: string, fontSize = 10, style: 'normal' | 'bold' = 'normal'): void {
    this.checkPageBreak(fontSize);
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', style);
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += fontSize * 0.5 + 3;
  }

  addSectionHeader(text: string): void {
    this.currentY += 10;
    this.checkPageBreak(12);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 70, 150);
    this.doc.text(text, this.margin, this.currentY);
    this.doc.setTextColor(0, 0, 0);
    this.currentY += 8;
  }

  checkPageBreak(requiredSpace = 20): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  async addFleetStatusChart(trainsets: Trainset[]): Promise<void> {
    this.addSectionHeader('1. FLEET STATUS OVERVIEW');
    
    // Calculate status distribution
    const statusCounts = trainsets.reduce((acc: Record<string, number>, train) => {
      acc[train.status] = (acc[train.status] || 0) + 1;
      return acc;
    }, {});

    // Create canvas for pie chart
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    const chart = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusCounts).map(s => s.toUpperCase()),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: [
            '#10B981', // Ready - Green
            '#F59E0B', // Standby - Yellow
            '#F97316', // Maintenance - Orange
            '#EF4444'  // Critical - Red
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: 'Fleet Status Distribution',
            font: { size: 16 }
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    // Wait for chart to render
    await new Promise(resolve => setTimeout(resolve, 500));

    // Convert chart to image
    const chartImage = canvas.toDataURL('image/png');
    
    this.checkPageBreak(80);
    this.doc.addImage(chartImage, 'PNG', this.margin, this.currentY, 80, 80);
    
    // Add status breakdown text
    const textX = this.margin + 90;
    let textY = this.currentY + 10;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Status Breakdown:', textX, textY);
    textY += 6;
    
    this.doc.setFont('helvetica', 'normal');
    Object.entries(statusCounts).forEach(([status, count]) => {
      const percentage = ((count / trainsets.length) * 100).toFixed(1);
      this.doc.text(`${status.toUpperCase()}: ${count} trains (${percentage}%)`, textX, textY);
      textY += 5;
    });

    // Cleanup
    chart.destroy();
    canvas.remove();
    
    this.currentY += 90;
  }

  async addPerformanceCharts(_trainsets: Trainset[], metrics: Metrics): Promise<void> {
    this.addSectionHeader('2. PERFORMANCE METRICS');
    
    // KPIs Bar Chart
    if (metrics?.current_kpis) {
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        console.error('Could not get canvas context');
        return;
      }

      const kpiData = {
        'Fleet Availability': metrics.current_kpis.fleet_availability || 0,
        'Punctuality': metrics.current_kpis.punctuality || 0,
        'Energy Efficiency': 100 - ((metrics.current_kpis.energy_consumption || 8500) / 100), // Normalize
        'Safety Score': 95 // Placeholder
      };

      const chart = new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(kpiData),
          datasets: [{
            label: 'Performance %',
            data: Object.values(kpiData),
            backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Key Performance Indicators',
              font: { size: 14 }
            }
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 500));
      
      const chartImage = canvas.toDataURL('image/png');
      this.checkPageBreak(60);
      this.doc.addImage(chartImage, 'PNG', this.margin, this.currentY, 170, 60);
      
      chart.destroy();
      canvas.remove();
      
      this.currentY += 70;
    }
  }

  async addAvailabilityChart(trainsets: Trainset[]): Promise<void> {
    this.addSectionHeader('3. AVAILABILITY ANALYSIS');
    
    // Availability histogram
    const availabilityRanges = [
      { range: '95-100%', min: 95, max: 100 },
      { range: '85-94%', min: 85, max: 94 },
      { range: '75-84%', min: 75, max: 84 },
      { range: '60-74%', min: 60, max: 74 },
      { range: '<60%', min: 0, max: 59 }
    ];

    const rangeCounts = availabilityRanges.map(range => 
      trainsets.filter(t => t.availability_percentage >= range.min && t.availability_percentage <= range.max).length
    );

    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    const chart = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: availabilityRanges.map(r => r.range),
        datasets: [{
          label: 'Number of Trains',
          data: rangeCounts,
          backgroundColor: ['#10B981', '#84CC16', '#F59E0B', '#F97316', '#EF4444'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: 'Availability Distribution',
            font: { size: 14 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });

    await new Promise(resolve => setTimeout(resolve, 500));
    
    const chartImage = canvas.toDataURL('image/png');
    this.checkPageBreak(60);
    this.doc.addImage(chartImage, 'PNG', this.margin, this.currentY, 170, 60);
    
    chart.destroy();
    canvas.remove();
    
    this.currentY += 70;
  }

  async addMileageChart(trainsets: Trainset[]): Promise<void> {
    this.addSectionHeader('4. MILEAGE DISTRIBUTION');
    
    // Sort trainsets by mileage for better visualization
    const sortedTrainsets = [...trainsets].sort((a, b) => a.mileage - b.mileage);
    
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    const chart = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: sortedTrainsets.map(t => t.number),
        datasets: [{
          label: 'Mileage (km)',
          data: sortedTrainsets.map(t => t.mileage),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.1
        }]
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: 'Trainset Mileage Distribution',
            font: { size: 14 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Mileage (km)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Trainsets (sorted by mileage)'
            }
          }
        }
      }
    });

    await new Promise(resolve => setTimeout(resolve, 500));
    
    const chartImage = canvas.toDataURL('image/png');
    this.checkPageBreak(60);
    this.doc.addImage(chartImage, 'PNG', this.margin, this.currentY, 170, 60);
    
    chart.destroy();
    canvas.remove();
    
    this.currentY += 70;
  }

  addCriticalAlerts(trainsets: Trainset[], metrics: Metrics): void {
    this.addSectionHeader('5. CRITICAL ALERTS & MAINTENANCE PRIORITIES');
    
    // Find critical and maintenance trains
    const criticalTrains = trainsets.filter(t => 
      t.mileage > 60000 || t.availability_percentage < 70 || t.status === 'critical'
    );
    
    const maintenanceTrains = trainsets.filter(t => 
      (t.mileage > 45000 && t.mileage <= 60000) || 
      (t.availability_percentage >= 70 && t.availability_percentage < 85) ||
      t.status === 'maintenance'
    );

    this.addText(`Critical Attention Required: ${criticalTrains.length} trains`, 10, 'bold');
    criticalTrains.forEach(train => {
      this.addText(`• ${train.number}: ${train.mileage.toLocaleString()} km, ${train.availability_percentage}% availability`, 9);
    });

    this.currentY += 5;
    this.addText(`Maintenance Scheduled: ${maintenanceTrains.length} trains`, 10, 'bold');
    maintenanceTrains.forEach(train => {
      this.addText(`• ${train.number}: ${train.mileage.toLocaleString()} km, ${train.availability_percentage}% availability`, 9);
    });

    // System alerts
    if (metrics?.alerts && metrics.alerts.length > 0) {
      this.currentY += 10;
      this.addText('Recent System Alerts:', 10, 'bold');
      metrics.alerts.slice(0, 5).forEach(alert => {
        this.addText(`• ${alert.trainset}: ${alert.message} (${alert.priority})`, 9);
      });
    }
  }

  addSummaryAndRecommendations(trainsets: Trainset[], _metrics: Metrics): void {
    this.addSectionHeader('6. SUMMARY & RECOMMENDATIONS');
    
    const operationalTrains = trainsets.filter(t => t.status === 'ready' || t.status === 'standby').length;
    const avgAvailability = Math.round(trainsets.reduce((sum, t) => sum + t.availability_percentage, 0) / trainsets.length);
    const avgMileage = Math.round(trainsets.reduce((sum, t) => sum + t.mileage, 0) / trainsets.length);
    
    this.addText('Fleet Summary:', 10, 'bold');
    this.addText(`• Operational Fleet: ${operationalTrains}/${trainsets.length} (${Math.round(operationalTrains/trainsets.length*100)}%)`, 9);
    this.addText(`• Average Availability: ${avgAvailability}%`, 9);
    this.addText(`• Average Mileage: ${avgMileage.toLocaleString()} km`, 9);
    
    this.currentY += 5;
    this.addText('Key Recommendations:', 10, 'bold');
    
    if (avgAvailability < 85) {
      this.addText('• Increase preventive maintenance frequency to improve availability', 9);
    }
    
    const highMileageTrains = trainsets.filter(t => t.mileage > 50000).length;
    if (highMileageTrains > trainsets.length * 0.3) {
      this.addText('• Consider fleet renewal planning for high-mileage units', 9);
    }
    
    this.addText('• Implement predictive maintenance using AI recommendations', 9);
    this.addText('• Regular performance monitoring and optimization', 9);
    
    // Footer
    this.currentY = this.pageHeight - 30;
    this.addText(`Report generated by Train Plan Wise System on ${new Date().toLocaleString()}`, 8);
  }
}

export const generatePDFReport = async (trainsets: Trainset[], metrics: Metrics): Promise<jsPDF> => {
  const generator = new PDFReportGenerator();
  return await generator.generateFleetReport(trainsets, metrics);
};