import { generateSimplePDFReport } from './lib/simplePdfGenerator';

// Test data
const testTrainsets = [
  {
    number: 'KMRL-001',
    status: 'ready',
    mileage: 45000,
    availability_percentage: 95
  },
  {
    number: 'KMRL-002',
    status: 'maintenance',
    mileage: 67000,
    availability_percentage: 72
  },
  {
    number: 'KMRL-003',
    status: 'critical',
    mileage: 71000,
    availability_percentage: 45
  }
];

const testMetrics = {
  current_kpis: {
    fleet_availability: 89,
    punctuality: 99.2,
    energy_consumption: 8750
  },
  alerts: [
    {
      trainset: 'KMRL-002',
      message: 'Scheduled maintenance due',
      priority: 'Medium'
    },
    {
      trainset: 'KMRL-003',
      message: 'Critical system alert',
      priority: 'High'
    }
  ]
};

// Test function
export function testPDFGeneration() {
  try {
    console.log('Testing PDF generation...');
    const pdfDoc = generateSimplePDFReport(testTrainsets, testMetrics);
    pdfDoc.save('test-report.pdf');
    console.log('PDF generated successfully!');
    return true;
  } catch (error) {
    console.error('PDF generation failed:', error);
    return false;
  }
}

// Auto-run test if this file is executed directly
if (typeof window !== 'undefined') {
  (window as any).testPDFGeneration = testPDFGeneration;
}