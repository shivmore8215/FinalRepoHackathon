// Mock data for the RL agent to work without Supabase
export const mockTrainsets = [
  {
    id: '1',
    number: 'KMRL-001',
    status: 'ready' as const,
    bay_position: 1,
    mileage: 45000,
    last_cleaning: '2024-01-15T08:00:00Z',
    branding_priority: 8,
    availability_percentage: 95,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-16T00:00:00Z'
  },
  {
    id: '2',
    number: 'KMRL-002',
    status: 'ready' as const,
    bay_position: 2,
    mileage: 42000,
    last_cleaning: '2024-01-14T09:30:00Z',
    branding_priority: 7,
    availability_percentage: 98,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-16T00:00:00Z'
  },
  {
    id: '3',
    number: 'KMRL-003',
    status: 'maintenance' as const,
    bay_position: 3,
    mileage: 48000,
    last_cleaning: '2024-01-10T14:00:00Z',
    branding_priority: 6,
    availability_percentage: 85,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-16T00:00:00Z'
  },
  {
    id: '4',
    number: 'KMRL-004',
    status: 'standby' as const,
    bay_position: 4,
    mileage: 39000,
    last_cleaning: '2024-01-16T07:00:00Z',
    branding_priority: 9,
    availability_percentage: 92,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-16T00:00:00Z'
  },
  {
    id: '5',
    number: 'KMRL-005',
    status: 'ready' as const,
    bay_position: 5,
    mileage: 41000,
    last_cleaning: '2024-01-15T10:15:00Z',
    branding_priority: 8,
    availability_percentage: 96,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-16T00:00:00Z'
  },
  {
    id: '6',
    number: 'KMRL-006',
    status: 'critical' as const,
    bay_position: 6,
    mileage: 52000,
    last_cleaning: '2024-01-08T16:30:00Z',
    branding_priority: 5,
    availability_percentage: 70,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-16T00:00:00Z'
  }
]

export const mockMetrics = {
  timestamp: new Date().toISOString(),
  fleet_status: {
    total_fleet: 6,
    ready: 3,
    standby: 1,
    maintenance: 1,
    critical: 1,
    serviceability: 67,
    avg_availability: 89
  },
  current_kpis: {
    punctuality: 99.2,
    fleet_availability: 67,
    maintenance_cost: 125000,
    energy_consumption: 8500.50
  },
  planning_status: {
    schedules_generated: 0,
    ai_confidence_avg: 0,
    last_optimization: null
  },
  alerts: [
    {
      type: 'critical',
      trainset: 'KMRL-006',
      message: 'Low availability: 70%',
      priority: 'critical'
    },
    {
      type: 'warning',
      trainset: 'KMRL-003',
      message: 'Maintenance required',
      priority: 'high'
    }
  ]
}

// Mock AI recommendations
export const generateMockAIRecommendations = (trainsets: any[]) => {
  return trainsets.map(trainset => {
    let recommendedStatus = trainset.status
    let confidence = 0.8
    let priority = 5
    const reasoning = []
    const riskFactors = []

    // AI logic simulation
    if (trainset.availability_percentage < 75) {
      recommendedStatus = 'critical'
      confidence = 0.95
      priority = 9
      reasoning.push('Low availability percentage detected')
      riskFactors.push('Critical availability threshold breached')
    } else if (trainset.availability_percentage < 90) {
      recommendedStatus = 'maintenance'
      confidence = 0.85
      priority = 7
      reasoning.push('Availability below optimal threshold')
      reasoning.push('Preventive maintenance recommended')
    } else if (trainset.mileage > 50000) {
      recommendedStatus = 'maintenance'
      confidence = 0.8
      priority = 6
      reasoning.push('High mileage detected')
      reasoning.push('Scheduled maintenance due')
    } else if (trainset.branding_priority >= 8) {
      recommendedStatus = 'ready'
      confidence = 0.9
      priority = 8
      reasoning.push('High branding priority')
      reasoning.push('Revenue optimization')
    } else {
      recommendedStatus = 'standby'
      confidence = 0.75
      priority = 4
      reasoning.push('Optimal for backup service')
    }

    return {
      trainset_id: trainset.id,
      recommended_status: recommendedStatus,
      confidence_score: confidence,
      reasoning,
      priority_score: priority,
      risk_factors: riskFactors
    }
  })
}
