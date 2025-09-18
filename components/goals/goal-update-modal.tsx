"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, addDays } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import { showSuccessToast, showErrorToast, ToastMessages } from '@/lib/utils/toast'

interface Goal {
  id: string
  target_weight: number
  deadline: string
  is_active: boolean
  created_at: string
}

interface GoalUpdateModalProps {
  goal: Goal | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const updateGoalSchema = z.object({
  targetWeight: z
    .number()
    .min(30, 'Weight must be at least 30 kg')
    .max(300, 'Weight must be at most 300 kg'),
  deadline: z
    .date()
    .min(addDays(new Date(), 1), 'Deadline must be in the future'),
})

type UpdateGoalData = z.infer<typeof updateGoalSchema>

export function GoalUpdateModal({ goal, open, onOpenChange }: GoalUpdateModalProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const form = useForm<UpdateGoalData>({
    resolver: zodResolver(updateGoalSchema),
    defaultValues: {
      targetWeight: goal?.target_weight || 70,
      deadline: goal ? new Date(goal.deadline) : addDays(new Date(), 30),
    },
  })

  // Update form values when goal changes
  useEffect(() => {
    if (goal) {
      form.reset({
        targetWeight: goal.target_weight,
        deadline: new Date(goal.deadline),
      })
    }
  }, [goal, form])

  const onSubmit = async (data: UpdateGoalData) => {
    if (!user || !goal) return

    setIsLoading(true)
    
    try {
      // Optimistic update - dispatch event first
      const updatedGoal = {
        ...goal,
        target_weight: data.targetWeight,
        deadline: data.deadline.toISOString(),
      }
      
      window.dispatchEvent(new CustomEvent('goalUpdated', { detail: updatedGoal }))

      // Update in database
      const { error } = await supabase
        .from('goals')
        .update({
          target_weight: data.targetWeight,
          deadline: data.deadline.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', goal.id)
        .eq('user_id', user.id)

      if (error) {
        // Rollback optimistic update
        window.dispatchEvent(new CustomEvent('goalUpdated', { detail: goal }))
        console.error('Error updating goal:', error)
        showErrorToast(ToastMessages.general.saveError)
        return
      }

      // Success
      showSuccessToast(ToastMessages.goals.updateSuccess)
      onOpenChange(false)
      
      // Trigger refreshes
      window.dispatchEvent(new CustomEvent('goalUpdated', { detail: updatedGoal }))
      window.dispatchEvent(new CustomEvent('statsRefresh', { detail: updatedGoal }))

    } catch (error) {
      console.error('Error updating goal:', error)
      showErrorToast(ToastMessages.general.saveError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  if (!goal) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Weight Goal</DialogTitle>
          <DialogDescription>
            Modify your target weight and deadline to keep your goal on track.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="targetWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Enter target weight"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Deadline</FormLabel>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date)
                          setDatePickerOpen(false)
                        }}
                        disabled={(date) => date <= new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Goal'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}