import { z } from 'zod'

export const weightEntrySchema = z.object({
  weight: z
    .string()
    .min(1, 'Weight is required')
    .refine((val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num >= 30 && num <= 300
    }, 'Weight must be between 30 and 300 kg')
    .refine((val) => {
      const num = parseFloat(val)
      const decimalPlaces = val.split('.')[1]?.length || 0
      return decimalPlaces <= 2
    }, 'Maximum 2 decimal places'),
  date: z
    .date()
    .max(
      new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59),
      'Cannot log weight for future dates'
    ),
  memo: z.string().optional(),
})

export type WeightEntryInput = z.infer<typeof weightEntrySchema>

export type WeightEntry = {
  id: string
  user_id: string
  weight: number
  date: string
  memo: string | null
  created_at: string
  updated_at: string
}