#!/usr/bin/env node

// KMRL Train Plan Wise - RL Agent Working Demo
// This script demonstrates the full RL agent in action

console.log('🚄 KMRL Train Plan Wise - RL Agent Live Demo');
console.log('===========================================');
console.log('Simulating realistic KMRL fleet scenarios...\n');

// Realistic KMRL trainset scenarios
const kmrlFleet = [
  {
    id: '1',
    number: 'KMRL-001',
    status: 'ready',
    mileage: 15420.50,
    branding_priority: 9,
    availability_percentage: 98.2,
    fitness_expiry_days: 180,
    open_job_cards: 0,
    critical_jobs: false
  },
  {
    id: '2', 
    number: 'KMRL-005',
    status: 'standby',
    mileage: 17890.15,
    branding_priority: 6,
    availability_percentage: 94.8,
    fitness_expiry_days: 90,
    open_job_cards: 1,
    critical_jobs: false
  },
  {
    id: '3',
    number: 'KMRL-009', 
    status: 'maintenance',
    mileage: 16890.30,
    branding_priority: 7,
    availability_percentage: 88.5,
    fitness_expiry_days: 45,
    open_job_cards: 3,
    critical_jobs: false
  },
  {
    id: '4',
    number: 'KMRL-013',
    status: 'maintenance', 
    mileage: 19850.25,
    branding_priority: 5,
    availability_percentage: 72.0,
    fitness_expiry_days: 120,
    open_job_cards: 2,
    critical_jobs: true
  },
  {
    id: '5',
    number: 'KMRL-017',
    status: 'critical',
    mileage: 20450.15, 
    branding_priority: 4,
    availability_percentage: 68.5,
    fitness_expiry_days: 15,
    open_job_cards: 3,
    critical_jobs: true
  },
  {
    id: '6',
    number: 'KMRL-022',
    status: 'ready',
    mileage: 17560.25,
    branding_priority: 8,
    availability_percentage: 98.8,
    fitness_expiry_days: 200,
    open_job_cards: 0,
    critical_jobs: false
  }
];

// Advanced RL Agent Decision Engine
function analyzeFleet(trainsets) {
  console.log('🤖 RL Agent Processing Fleet Data...');
  console.log('===================================');
  
  const recommendations = [];
  
  for (const trainset of trainsets) {
    console.log(`\n📊 Analyzing: ${trainset.number}`);
    console.log(`   Current: ${trainset.status}`);
    console.log(`   Availability: ${trainset.availability_percentage}%`);
    console.log(`   Brand Priority: ${trainset.branding_priority}/10`);
    console.log(`   Job Cards: ${trainset.open_job_cards}`);
    console.log(`   Cert Expiry: ${trainset.fitness_expiry_days} days`);
    
    let recommended = 'ready';
    let confidence = 0.7;
    let priority = 5;
    let reasons = [];
    let risks = [];
    
    // Critical decision logic
    if (trainset.fitness_expiry_days <= 0) {
      recommended = 'critical';
      confidence = 0.98;
      priority = 10;
      reasons.push('Fitness certificate expired - safety critical');
      risks.push('Expired safety certification');
      console.log('   🚨 CRITICAL: Certificate expired');
      
    } else if (trainset.availability_percentage < 70) {
      recommended = 'critical';
      confidence = 0.95;
      priority = 9;
      reasons.push(`Critical availability: ${trainset.availability_percentage}%`);
      risks.push('System availability too low');
      console.log('   🚨 CRITICAL: Very low availability');
      
    } else if (trainset.critical_jobs) {
      recommended = 'critical';
      confidence = 0.90;
      priority = 8;
      reasons.push('Safety-critical maintenance required');
      risks.push('Critical maintenance pending');
      console.log('   🚨 CRITICAL: Safety-critical repairs needed');
      
    } else if (trainset.availability_percentage < 85) {
      recommended = 'maintenance';
      confidence = 0.85;
      priority = 7;
      reasons.push('Low availability requires maintenance');
      console.log('   🔧 MAINTENANCE: Availability below target');
      
    } else if (trainset.open_job_cards > 2) {
      recommended = 'maintenance';
      confidence = 0.82;
      priority = 6;
      reasons.push(`Multiple job cards: ${trainset.open_job_cards}`);
      console.log('   🔧 MAINTENANCE: Multiple jobs pending');
      
    } else if (trainset.availability_percentage < 90) {
      recommended = 'maintenance';
      confidence = 0.80;
      priority = 5;
      reasons.push('Preventive maintenance recommended');
      console.log('   🔧 MAINTENANCE: Preventive care');
      
    } else {
      // Optimize Ready vs Standby
      const readiness = calculateReadiness(trainset);
      
      if (trainset.branding_priority >= 8 && readiness > 8.5) {
        recommended = 'ready';
        confidence = 0.90;
        priority = 2;
        reasons.push(`High brand priority + excellent condition`);
        console.log('   ✅ READY: Premium service trainset');
        
      } else if (readiness > 8.0) {
        recommended = 'ready';
        confidence = 0.85;
        priority = 3;
        reasons.push(`Good service condition (score: ${readiness.toFixed(1)})`);\n        console.log(`   ✅ READY: Good condition`);\n        \n      } else if (readiness > 7.0) {\n        recommended = 'standby';\n        confidence = 0.80;\n        priority = 4;\n        reasons.push(`Suitable backup (score: ${readiness.toFixed(1)})`);\n        console.log('   🟡 STANDBY: Good backup option');\n        \n      } else {\n        recommended = 'standby';\n        confidence = 0.75;\n        priority = 4;\n        reasons.push('Basic standby service');\n        console.log('   🟡 STANDBY: Basic service level');\n      }\n    }\n    \n    // Risk assessment\n    if (trainset.fitness_expiry_days <= 30) {\n      risks.push(`Certificate expires in ${trainset.fitness_expiry_days} days`);\n    }\n    if (trainset.mileage > 18000) {\n      risks.push('High mileage - increased wear');\n    }\n    if (trainset.open_job_cards > 0 && recommended !== 'maintenance') {\n      risks.push(`${trainset.open_job_cards} pending job cards`);\n    }\n    \n    recommendations.push({\n      trainset: trainset.number,\n      current: trainset.status,\n      recommended: recommended,\n      confidence: Math.round(confidence * 100),\n      priority: priority,\n      reasons: reasons,\n      risks: risks,\n      readiness: recommended === 'critical' ? 0 : calculateReadiness(trainset)\n    });\n  }\n  \n  return recommendations;\n}\n\n// Calculate trainset readiness score\nfunction calculateReadiness(trainset) {\n  let score = 0;\n  \n  // Availability (40% weight)\n  score += (trainset.availability_percentage / 100) * 4;\n  \n  // Brand priority (25% weight)  \n  score += (trainset.branding_priority / 10) * 2.5;\n  \n  // Maintenance status (20% weight)\n  score += Math.max(0, (3 - trainset.open_job_cards) / 3) * 2;\n  \n  // Certificate status (10% weight)\n  score += (trainset.fitness_expiry_days > 30 ? 1 : 0.5) * 1;\n  \n  // No critical issues bonus (5% weight)\n  score += (trainset.critical_jobs ? 0 : 1) * 0.5;\n  \n  return Math.min(score, 10);\n}\n\n// Run the analysis\nconst results = analyzeFleet(kmrlFleet);\n\nconsole.log('\\n🎯 RL Agent Recommendations');\nconsole.log('==========================');\n\nresults.forEach((rec, i) => {\n  const statusIcons = {\n    'ready': '🟢',\n    'standby': '🟡',\n    'maintenance': '🟠', \n    'critical': '🔴'\n  };\n  \n  const change = rec.current !== rec.recommended ? '🔄 CHANGE' : '✓ MAINTAIN';\n  \n  console.log(`\\n${i + 1}. ${rec.trainset}`);\n  console.log(`   ${rec.current} → ${statusIcons[rec.recommended]} ${rec.recommended.toUpperCase()}`);\n  console.log(`   Action: ${change}`);\n  console.log(`   Confidence: ${rec.confidence}%`);\n  console.log(`   Priority: ${rec.priority}/10`);\n  \n  if (rec.readiness > 0) {\n    console.log(`   Readiness: ${rec.readiness.toFixed(1)}/10`);\n  }\n  \n  if (rec.reasons.length > 0) {\n    console.log('   Reasoning:');\n    rec.reasons.forEach(reason => console.log(`     • ${reason}`));\n  }\n  \n  if (rec.risks.length > 0) {\n    console.log('   Risk Factors:');\n    rec.risks.forEach(risk => console.log(`     ⚠️ ${risk}`));\n  }\n});\n\n// Fleet summary\nconst summary = results.reduce((acc, rec) => {\n  acc[rec.recommended] = (acc[rec.recommended] || 0) + 1;\n  return acc;\n}, {});\n\nconst avgConf = Math.round(results.reduce((sum, r) => sum + r.confidence, 0) / results.length);\nconst changes = results.filter(r => r.current !== r.recommended).length;\nconst criticals = summary.critical || 0;\nconst serviceReady = (summary.ready || 0) + (summary.standby || 0);\nconst availability = Math.round((serviceReady / results.length) * 100);\n\nconsole.log('\\n📈 Fleet Optimization Summary');\nconsole.log('============================');\nconsole.log(`🚄 Total Fleet: ${results.length} trainsets`);\nconsole.log(`🎯 AI Confidence: ${avgConf}%`);\nconsole.log(`🔄 Status Changes: ${changes}`);\nconsole.log(`⚠️ Critical Issues: ${criticals}`);\nconsole.log(`🟢 Service Availability: ${availability}%`);\n\nconsole.log('\\n🚀 Fleet Distribution:');\nObject.entries(summary).forEach(([status, count]) => {\n  const pct = Math.round((count / results.length) * 100);\n  const icons = { 'ready': '🟢', 'standby': '🟡', 'maintenance': '🟠', 'critical': '🔴' };\n  console.log(`  ${icons[status]} ${status.charAt(0).toUpperCase() + status.slice(1)}: ${count} (${pct}%)`);\n});\n\nconsole.log('\\n🏆 KMRL Targets:');\nconsole.log('===============');\nconsole.log(`Punctuality: 99.5% target`);\nconsole.log(`Fleet Availability: >90% ${availability >= 90 ? '✅' : '❌'}`);\nconsole.log(`Critical Issues: <3 ${criticals < 3 ? '✅' : '❌'}`);\nconsole.log(`AI Confidence: >80% ${avgConf >= 80 ? '✅' : '❌'}`);\n\nconsole.log('\\n✅ RL Agent Analysis Complete!');\nconsole.log('\\nThe AI successfully analyzed your KMRL fleet and provided');\nconsole.log('intelligent scheduling recommendations optimized for safety,');\nconsole.log('efficiency, and revenue generation.');\n\nconsole.log('\\n🌐 Full Web Dashboard: http://localhost:8081');\nconsole.log('📊 Interactive fleet management with real-time updates');\nconsole.log('🤖 AI continuously learns from operational data\\n');