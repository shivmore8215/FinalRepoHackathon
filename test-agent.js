#!/usr/bin/env node

// KMRL Train Plan Wise - RL Agent Demo Script
// This script demonstrates the core AI scheduling functionality

console.log('🚄 KMRL Train Plan Wise - RL Agent Demo');
console.log('=========================================');
console.log();

// Mock KMRL trainset data for demonstration
const mockTrainsets = [
  {
    id: '1',
    number: 'KMRL-001',
    status: 'ready',
    bay_position: 1,
    mileage: 15420.50,
    last_cleaning: '2024-01-15T08:00:00Z',
    branding_priority: 8,
    availability_percentage: 96.5,
    fitness_certificates: [
      {
        certificate_type: 'Annual Fitness',
        expiry_date: '2024-12-15',
        status: 'active'
      }
    ],
    job_cards: [
      {
        status: 'open',
        priority: 2,
        description: 'Routine brake inspection'
      }
    ]
  },
  {
    id: '2',
    number: 'KMRL-013',
    status: 'maintenance',
    bay_position: 13,
    mileage: 19850.25,
    last_cleaning: '2024-01-10T14:00:00Z',
    branding_priority: 5,
    availability_percentage: 72.0,
    fitness_certificates: [
      {
        certificate_type: 'Annual Fitness',
        expiry_date: '2024-10-30',
        status: 'expiring'
      }
    ],
    job_cards: [
      {
        status: 'open',
        priority: 4,
        description: 'Emergency brake system repair'
      },
      {
        status: 'open',
        priority: 5,
        description: 'HVAC system failure'
      }
    ]
  },
  {
    id: '3',
    number: 'KMRL-008',
    status: 'ready',
    bay_position: 8,
    mileage: 14560.75,
    last_cleaning: '2024-01-16T07:00:00Z',
    branding_priority: 8,
    availability_percentage: 98.5,
    fitness_certificates: [
      {
        certificate_type: 'Annual Fitness',
        expiry_date: '2025-03-15',
        status: 'active'
      }
    ],
    job_cards: []
  }
];

// Rule-based RL Agent Logic (Fallback when AI is unavailable)
function generateRuleBasedRecommendations(trainsets) {
  console.log('🤖 RL Agent Processing Trainset Data...');
  console.log('=====================================');
  
  const recommendations = [];
  
  for (const trainset of trainsets) {
    let recommendedStatus = 'ready';
    let reasoning = ['Rule-based RL recommendation'];
    let priorityScore = 5;
    let riskFactors = [];
    let confidenceScore = 0.7;
    
    console.log(`\n📊 Analyzing Trainset: ${trainset.number}`);
    console.log(`   Current Status: ${trainset.status}`);
    console.log(`   Availability: ${trainset.availability_percentage}%`);
    console.log(`   Open Job Cards: ${trainset.job_cards.length}`);
    
    // Critical status conditions (highest priority)
    const hasExpiredCerts = trainset.fitness_certificates.some(cert => 
      new Date(cert.expiry_date) <= new Date()
    );
    
    const hasExpiringCerts = trainset.fitness_certificates.some(cert => {
      const expiryDate = new Date(cert.expiry_date);
      const daysToExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysToExpiry <= 30;
    });
    
    const hasCriticalJobs = trainset.job_cards.some(job => 
      job.status === 'open' && job.priority >= 4
    );
    
    if (hasExpiredCerts) {
      recommendedStatus = 'critical';
      reasoning.push('Fitness certificate expired - safety critical');
      priorityScore = 10;
      riskFactors.push('Safety certificate expired');
      confidenceScore = 0.95;
      console.log('   ⚠️ CRITICAL: Expired fitness certificate detected');
    } else if (trainset.availability_percentage < 75) {
      recommendedStatus = 'critical';
      reasoning.push(`Low availability: ${trainset.availability_percentage}%`);
      priorityScore = 9;
      riskFactors.push('Low system availability');
      confidenceScore = 0.9;
      console.log('   ⚠️ CRITICAL: Very low availability');
    } else if (hasCriticalJobs) {
      recommendedStatus = 'critical';
      reasoning.push('High priority maintenance required');
      priorityScore = 8;
      riskFactors.push('Critical maintenance pending');
      confidenceScore = 0.85;
      console.log('   ⚠️ CRITICAL: High priority maintenance jobs');
    }
    // Maintenance conditions
    else if (trainset.availability_percentage < 90) {
      recommendedStatus = 'maintenance';
      reasoning.push('Preventive maintenance recommended');
      priorityScore = 6;
      confidenceScore = 0.8;
      console.log('   🔧 MAINTENANCE: Preventive maintenance needed');
    } else if (trainset.job_cards.filter(jc => jc.status === 'open').length > 2) {
      recommendedStatus = 'maintenance';
      reasoning.push('Multiple open job cards');
      priorityScore = 5;
      confidenceScore = 0.75;
      console.log('   🔧 MAINTENANCE: Multiple job cards open');
    }
    // Ready/Standby logic
    else if (trainset.branding_priority > 7) {
      recommendedStatus = 'ready';
      reasoning.push('High branding priority - optimal for service');
      priorityScore = 3;
      confidenceScore = 0.8;
      console.log('   ✅ READY: High branding priority');
    } else if (trainset.availability_percentage >= 95) {
      recommendedStatus = Math.random() > 0.7 ? 'ready' : 'standby';
      reasoning.push('High availability - optimal for service');
      priorityScore = 2;
      confidenceScore = 0.7;
      console.log(`   ✅ ${recommendedStatus.toUpperCase()}: High availability`);
    } else {
      recommendedStatus = 'standby';
      reasoning.push('Suitable for backup service');
      priorityScore = 4;
      confidenceScore = 0.65;
      console.log('   🟡 STANDBY: Suitable for backup');
    }
    
    if (hasExpiringCerts) {
      riskFactors.push('Fitness certificate expiring within 30 days');
      console.log('   ⚠️ WARNING: Certificate expiring soon');
    }
    
    const recommendation = {
      trainset_id: trainset.id,
      trainset_number: trainset.number,
      current_status: trainset.status,
      recommended_status: recommendedStatus,
      confidence_score: confidenceScore,
      reasoning,
      priority_score: priorityScore,
      risk_factors: riskFactors
    };
    
    recommendations.push(recommendation);
  }
  
  return recommendations;
}

// Generate and display recommendations
const recommendations = generateRuleBasedRecommendations(mockTrainsets);

console.log('\n🎯 RL Agent Scheduling Recommendations');
console.log('====================================');

recommendations.forEach((rec, index) => {
  const statusColor = {
    'ready': '🟢',
    'standby': '🟡', 
    'maintenance': '🟠',
    'critical': '🔴'
  };
  
  console.log(`\n${index + 1}. Trainset: ${rec.trainset_number}`);
  console.log(`   Current: ${rec.current_status} → Recommended: ${statusColor[rec.recommended_status]} ${rec.recommended_status.toUpperCase()}`);
  console.log(`   Confidence: ${Math.round(rec.confidence_score * 100)}%`);
  console.log(`   Priority Score: ${rec.priority_score}/10`);
  
  if (rec.reasoning.length > 1) {
    console.log('   Reasoning:');
    rec.reasoning.slice(1).forEach(reason => {
      console.log(`     • ${reason}`);
    });
  }
  
  if (rec.risk_factors.length > 0) {
    console.log('   Risk Factors:');
    rec.risk_factors.forEach(risk => {
      console.log(`     ⚠️ ${risk}`);
    });
  }
});

// Generate summary statistics
const statusCounts = recommendations.reduce((acc, rec) => {
  acc[rec.recommended_status] = (acc[rec.recommended_status] || 0) + 1;
  return acc;
}, {});

const avgConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence_score, 0) / recommendations.length;
const highRiskCount = recommendations.filter(r => r.risk_factors.length > 0).length;
const statusChanges = recommendations.filter(r => r.recommended_status !== r.current_status).length;

console.log('\n📈 Fleet Optimization Summary');
console.log('===========================');
console.log(`Total Trainsets Analyzed: ${recommendations.length}`);
console.log(`Average AI Confidence: ${Math.round(avgConfidence * 100)}%`);
console.log(`Recommended Status Changes: ${statusChanges}`);
console.log(`High Risk Trainsets: ${highRiskCount}`);
console.log('\nRecommended Fleet Distribution:');
Object.entries(statusCounts).forEach(([status, count]) => {
  const emoji = {
    'ready': '🟢',
    'standby': '🟡',
    'maintenance': '🟠', 
    'critical': '🔴'
  };
  console.log(`  ${emoji[status]} ${status.charAt(0).toUpperCase() + status.slice(1)}: ${count} trainsets`);
});

console.log('\n✅ RL Agent Analysis Complete!');
console.log('\nThe RL Agent has successfully analyzed the fleet and provided');
console.log('AI-powered scheduling recommendations to optimize operations');
console.log('while maintaining safety and reliability standards.\n');

console.log('🌐 Web Interface Available at: http://localhost:8081');
console.log('📊 Access the full dashboard to see real-time metrics,');
console.log('   interactive scheduling, and detailed fleet management.\n');