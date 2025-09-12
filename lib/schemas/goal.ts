export interface Goal {
  id: string
  user_id: string
  target_weight: number
  deadline: string // ISO date string
  is_active: boolean
  starting_weight?: number
  created_at: string
  updated_at: string
}

export interface GoalFormData {
  target_weight: number
  deadline: string
  starting_weight?: number
}

export interface GoalProgress {
  progress: number
  remainingWeight: number
  isCompleted: boolean
  daysRemaining: number
  dailyWeightLossRequired?: number
}