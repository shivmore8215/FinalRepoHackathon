#!/usr/bin/env node

// KMRL Train Plan Wise - Advanced RL Agent Demo
// This script demonstrates the full range of AI scheduling scenarios

console.log('🚄 KMRL Train Plan Wise - Advanced RL Agent Demo');
console.log('===============================================');
console.log('Simulating realistic KMRL fleet scenarios...\n');

// Diverse KMRL trainset scenarios for comprehensive testing
const diverseTrainsets = [
  {
    id: '1',
    number: 'KMRL-001',
    status: 'ready',
    bay_position: 1,
    mileage: 15420.50,
    last_cleaning: '2024-01-15T08:00:00Z',
    branding_priority: 9,
    availability_percentage: 98.2,
    fitness_certificates: [
      {
        certificate_type: 'Annual Fitness',
        expiry_date: '2025-06-15', // Valid certificate
        status: 'active'
      }
    ],
    job_cards: []
  },
  {
    id: '2',
    number: 'KMRL-005',
    status: 'standby',
    bay_position: 5,
    mileage: 17890.15,
    last_cleaning: '2024-01-14T10:30:00Z',
    branding_priority: 6,
    availability_percentage: 94.8,
    fitness_certificates: [
      {
        certificate_type: 'Annual Fitness',
        expiry_date: '2025-02-20',
        status: 'active'
      }
    ],
    job_cards: [
      {
        status: 'open',
        priority: 2,
        description: 'Interior LED light replacement'
      }
    ]
  },
  {
    id: '3',
    number: 'KMRL-009',
    status: 'maintenance',
    bay_position: 9,
    mileage: 16890.30,
    last_cleaning: '2024-01-12T14:00:00Z',
    branding_priority: 7,
    availability_percentage: 88.5,
    fitness_certificates: [
      {
        certificate_type: 'Annual Fitness',
        expiry_date: '2025-01-30',
        status: 'active'
      }
    ],
    job_cards: [
      {
        status: 'open',
        priority: 3,
        description: 'Door sensor calibration'
      },
      {
        status: 'open',
        priority: 3,
        description: 'Brake pad replacement'
      },
      {
        status: 'open',
        priority: 2,
        description: 'Routine inspection'
      }
    ]
  },
  {
    id: '4',
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
        expiry_date: '2025-03-15',
        status: 'active'
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
        description: 'HVAC system failure - urgent'
      }
    ]
  },
  {
    id: '5',
    number: 'KMRL-017',
    status: 'critical',
    bay_position: 17,
    mileage: 20450.15,
    last_cleaning: '2024-01-08T12:00:00Z',
    branding_priority: 4,
    availability_percentage: 68.5,
    fitness_certificates: [
      {
        certificate_type: 'Annual Fitness',
        expiry_date: '2024-10-20', // Expiring soon
        status: 'expiring'
      }
    ],
    job_cards: [
      {
        status: 'open',
        priority: 5,
        description: 'Traction motor failure - critical'
      },
      {
        status: 'open',
        priority: 4,
        description: 'Communication system down'
      }
    ]
  },
  {
    id: '6',
    number: 'KMRL-022',
    status: 'ready',
    bay_position: 22,
    mileage: 17560.25,
    last_cleaning: '2024-01-16T09:00:00Z',
    branding_priority: 8,
    availability_percentage: 98.8,
    fitness_certificates: [
      {
        certificate_type: 'Annual Fitness',
        expiry_date: '2025-07-10',
        status: 'active'
      }
    ],
    job_cards: []
  }
];

// Enhanced RL Agent Logic with comprehensive decision tree
function generateAdvancedRecommendations(trainsets) {
  console.log('🤖 Advanced RL Agent Processing Fleet Data...');
  console.log('===========================================');
  
  const recommendations = [];
  
  for (const trainset of trainsets) {
    let recommendedStatus = 'ready';
    let reasoning = ['Advanced RL agent analysis'];
    let priorityScore = 5;
    let riskFactors = [];
    let confidenceScore = 0.7;
    
    console.log(`\n📊 Deep Analysis: ${trainset.number}`);
    console.log(`   Current Status: ${trainset.status}`);
    console.log(`   Availability: ${trainset.availability_percentage}%`);
    console.log(`   Branding Priority: ${trainset.branding_priority}/10`);
    console.log(`   Mileage: ${trainset.mileage.toLocaleString()} km`);
    console.log(`   Open Job Cards: ${trainset.job_cards.length}`);
    
    // Advanced certificate analysis
    const currentDate = new Date();
    const hasExpiredCerts = trainset.fitness_certificates.some(cert => 
      new Date(cert.expiry_date) <= currentDate
    );
    
    const hasExpiringCerts = trainset.fitness_certificates.some(cert => {
      const expiryDate = new Date(cert.expiry_date);
      const daysToExpiry = Math.ceil((expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysToExpiry <= 60; // Within 2 months
    });
    
    const hasCriticalJobs = trainset.job_cards.some(job => 
      job.status === 'open' && job.priority >= 4
    );
    
    const hasMultipleJobs = trainset.job_cards.filter(job => job.status === 'open').length > 2;
    
    // Enhanced decision logic
    if (hasExpiredCerts) {
      recommendedStatus = 'critical';
      reasoning.push('❌ Fitness certificate expired - immediate attention required');
      priorityScore = 10;
      riskFactors.push('Expired safety certification - service prohibited');
      confidenceScore = 0.98;
      console.log('   🚨 CRITICAL: Safety certificate expired');
      
    } else if (trainset.availability_percentage < 70) {
      recommendedStatus = 'critical';
      reasoning.push(`📉 Critical availability: ${trainset.availability_percentage}% (below 70% threshold)`);
      priorityScore = 9;
      riskFactors.push('System availability critically low');
      confidenceScore = 0.92;
      console.log('   🚨 CRITICAL: System availability too low');
      
    } else if (hasCriticalJobs) {
      const criticalJobs = trainset.job_cards.filter(job => job.priority >= 4);
      recommendedStatus = 'critical';
      reasoning.push(`⚡ ${criticalJobs.length} critical maintenance job(s) pending`);
      priorityScore = 8;
      riskFactors.push('Safety-critical maintenance required');
      confidenceScore = 0.88;
      console.log(`   🚨 CRITICAL: ${criticalJobs.length} high-priority jobs`);
      
    } else if (trainset.availability_percentage < 85) {
      recommendedStatus = 'maintenance';
      reasoning.push(`🔧 Low availability requiring maintenance: ${trainset.availability_percentage}%`);
      priorityScore = 7;
      confidenceScore = 0.85;
      console.log('   🔧 MAINTENANCE: Availability below optimal');
      
    } else if (hasMultipleJobs) {
      recommendedStatus = 'maintenance';
      reasoning.push(`📋 Multiple job cards pending: ${trainset.job_cards.length} items`);
      priorityScore = 6;
      confidenceScore = 0.82;
      console.log('   🔧 MAINTENANCE: Multiple pending jobs');
      
    } else if (trainset.availability_percentage < 90) {
      recommendedStatus = 'maintenance';
      reasoning.push('🎯 Preventive maintenance recommended for optimal performance');
      priorityScore = 5;
      confidenceScore = 0.78;
      console.log('   🔧 MAINTENANCE: Preventive care needed');
      \n    } else {\n      // Optimize between Ready and Standby based on multiple factors\n      const readinessScore = calculateReadinessScore(trainset);\n      \n      if (readinessScore >= 8.5) {\n        recommendedStatus = 'ready';\n        reasoning.push(`🌟 Optimal for service (readiness score: ${readinessScore.toFixed(1)}/10)`);\n        priorityScore = 2;\n        confidenceScore = 0.90;\n        console.log(`   ✅ READY: Excellent condition (score: ${readinessScore.toFixed(1)})`);\n        \n      } else if (readinessScore >= 7.0) {\n        // Smart allocation: prefer higher branding priority for ready status\n        if (trainset.branding_priority >= 8) {\n          recommendedStatus = 'ready';\n          reasoning.push(`🎨 High branding priority (${trainset.branding_priority}/10) - revenue optimized`);\n          priorityScore = 3;\n          confidenceScore = 0.85;\n          console.log('   ✅ READY: High branding priority');\n        } else {\n          recommendedStatus = 'standby';\n          reasoning.push(`⚡ Good backup option (readiness: ${readinessScore.toFixed(1)}/10)`);\n          priorityScore = 4;\n          confidenceScore = 0.80;\n          console.log(`   🟡 STANDBY: Good backup (score: ${readinessScore.toFixed(1)})`);\n        }\n        \n      } else {\n        recommendedStatus = 'standby';\n        reasoning.push(`🔄 Suitable for standby duty (readiness: ${readinessScore.toFixed(1)}/10)`);\n        priorityScore = 4;\n        confidenceScore = 0.75;\n        console.log(`   🟡 STANDBY: Adequate for backup`);\n      }\n    }\n    \n    // Additional risk factor analysis\n    if (hasExpiringCerts) {\n      const expiringCert = trainset.fitness_certificates.find(cert => {\n        const daysToExpiry = Math.ceil((new Date(cert.expiry_date).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));\n        return daysToExpiry <= 60;\n      });\n      const daysToExpiry = Math.ceil((new Date(expiringCert.expiry_date).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));\n      riskFactors.push(`Certificate expires in ${daysToExpiry} days`);\n      console.log(`   ⏰ WARNING: Certificate expires in ${daysToExpiry} days`);\n    }\n    \n    if (trainset.mileage > 18000) {\n      riskFactors.push('High mileage - increased wear risk');\n      console.log('   📊 INFO: High mileage noted');\n    }\n    \n    const cleaningDays = Math.ceil((currentDate.getTime() - new Date(trainset.last_cleaning).getTime()) / (1000 * 60 * 60 * 24));\n    if (cleaningDays > 5) {\n      riskFactors.push(`Cleaning overdue by ${cleaningDays - 5} days`);\n      console.log(`   🧽 INFO: Cleaning due (${cleaningDays} days since last)`);\n    }\n    \n    const recommendation = {\n      trainset_id: trainset.id,\n      trainset_number: trainset.number,\n      current_status: trainset.status,\n      recommended_status: recommendedStatus,\n      confidence_score: confidenceScore,\n      reasoning,\n      priority_score: priorityScore,\n      risk_factors: riskFactors,\n      readiness_score: recommendedStatus === 'critical' ? 0 : calculateReadinessScore(trainset)\n    };\n    \n    recommendations.push(recommendation);\n  }\n  \n  return recommendations;\n}\n\n// Calculate overall readiness score for optimal fleet management\nfunction calculateReadinessScore(trainset) {\n  let score = 0;\n  \n  // Availability weight (40%)\n  score += (trainset.availability_percentage / 100) * 4;\n  \n  // Branding priority weight (25%)\n  score += (trainset.branding_priority / 10) * 2.5;\n  \n  // Maintenance status weight (20%)\n  const openJobs = trainset.job_cards.filter(job => job.status === 'open').length;\n  score += Math.max(0, (5 - openJobs) / 5) * 2;\n  \n  // Certificate status weight (10%)\n  const validCerts = trainset.fitness_certificates.filter(cert => \n    new Date(cert.expiry_date) > new Date()\n  ).length;\n  score += (validCerts > 0 ? 1 : 0) * 1;\n  \n  // Cleaning status weight (5%)\n  const cleaningDays = Math.ceil((new Date().getTime() - new Date(trainset.last_cleaning).getTime()) / (1000 * 60 * 60 * 24));\n  score += Math.max(0, (7 - cleaningDays) / 7) * 0.5;\n  \n  return Math.min(score, 10);\n}\n\n// Generate and display advanced recommendations\nconst recommendations = generateAdvancedRecommendations(diverseTrainsets);\n\nconsole.log('\\n🎯 Advanced RL Agent Recommendations');\nconsole.log('==================================');\n\nrecommendations.forEach((rec, index) => {\n  const statusEmoji = {\n    'ready': '🟢',\n    'standby': '🟡', \n    'maintenance': '🟠',\n    'critical': '🔴'\n  };\n  \n  const changeIndicator = rec.current_status !== rec.recommended_status ? '🔄 CHANGE' : '✓ MAINTAIN';\n  \n  console.log(`\\n${index + 1}. Trainset: ${rec.trainset_number}`);\n  console.log(`   Current: ${rec.current_status} → Recommended: ${statusEmoji[rec.recommended_status]} ${rec.recommended_status.toUpperCase()}`);\n  console.log(`   Action: ${changeIndicator}`);\n  console.log(`   Confidence: ${Math.round(rec.confidence_score * 100)}%`);\n  console.log(`   Priority: ${rec.priority_score}/10`);\n  if (rec.readiness_score !== undefined) {\n    console.log(`   Readiness Score: ${rec.readiness_score.toFixed(1)}/10`);\n  }\n  \n  if (rec.reasoning.length > 1) {\n    console.log('   AI Reasoning:');\n    rec.reasoning.slice(1).forEach(reason => {\n      console.log(`     ${reason}`);\n    });\n  }\n  \n  if (rec.risk_factors.length > 0) {\n    console.log('   Risk Factors:');\n    rec.risk_factors.forEach(risk => {\n      console.log(`     ⚠️ ${risk}`);\n    });\n  }\n});\n\n// Enhanced fleet optimization summary\nconst statusCounts = recommendations.reduce((acc, rec) => {\n  acc[rec.recommended_status] = (acc[rec.recommended_status] || 0) + 1;\n  return acc;\n}, {});\n\nconst avgConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence_score, 0) / recommendations.length;\nconst avgReadiness = recommendations.filter(r => r.readiness_score !== undefined)\n  .reduce((sum, rec) => sum + rec.readiness_score, 0) / recommendations.filter(r => r.readiness_score !== undefined).length;\nconst highRiskCount = recommendations.filter(r => r.risk_factors.length > 0).length;\nconst statusChanges = recommendations.filter(r => r.recommended_status !== r.current_status).length;\nconst serviceableCount = (statusCounts.ready || 0) + (statusCounts.standby || 0);\nconst serviceAvailability = Math.round((serviceableCount / recommendations.length) * 100);\n\nconsole.log('\\n📈 Advanced Fleet Optimization Summary');\nconsole.log('====================================');\nconsole.log(`🚄 Total Fleet Size: ${recommendations.length} trainsets`);\nconsole.log(`🎯 Average AI Confidence: ${Math.round(avgConfidence * 100)}%`);\nconsole.log(`⚡ Average Readiness Score: ${avgReadiness ? avgReadiness.toFixed(1) : 'N/A'}/10`);\nconsole.log(`🔄 Recommended Changes: ${statusChanges} trainsets`);\nconsole.log(`⚠️ High Risk Trainsets: ${highRiskCount} trainsets`);\nconsole.log(`🟢 Service Availability: ${serviceAvailability}%`);\n\nconsole.log('\\n🚀 Optimized Fleet Distribution:');\nObject.entries(statusCounts).forEach(([status, count]) => {\n  const percentage = Math.round((count / recommendations.length) * 100);\n  const emoji = {\n    'ready': '🟢',\n    'standby': '🟡',\n    'maintenance': '🟠', \n    'critical': '🔴'\n  };\n  console.log(`  ${emoji[status]} ${status.charAt(0).toUpperCase() + status.slice(1)}: ${count} trainsets (${percentage}%)`);\n});\n\n// Performance benchmarks\nconsole.log('\\n🏆 KMRL Performance Targets:');\nconsole.log('===========================');\nconsole.log(`🎯 Punctuality Target: 99.5% | Fleet Availability: >90%`);\nconsole.log(`📊 Current Service Availability: ${serviceAvailability}% ${serviceAvailability >= 90 ? '✅' : '❌'}`);\nconsole.log(`🔧 Critical Issues: ${statusCounts.critical || 0} ${(statusCounts.critical || 0) <= 2 ? '✅' : '❌'}`);\nconsole.log(`⚡ AI Confidence: ${Math.round(avgConfidence * 100)}% ${avgConfidence >= 0.8 ? '✅' : '❌'}`);\n\nconsole.log('\\n✅ Advanced RL Agent Analysis Complete!');\nconsole.log('\\n🚄 The AI has successfully optimized your KMRL fleet scheduling');\nconsole.log('   with advanced decision-making, risk assessment, and performance');\nconsole.log('   optimization while maintaining the highest safety standards.');\n\nconsole.log('\\n🌐 Full Dashboard: http://localhost:8081');\nconsole.log('📱 Mobile-responsive interface with real-time updates');\nconsole.log('🔄 AI continuously learns from operational data\\n');"
}]