"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'

const goalSchema = z.object({
  targetWeight: z
    .number()
    .min(30, 'Weight must be between 30 and 300 kg')
    .max(300, 'Weight must be between 30 and 300 kg'),
  deadline: z
    .date()
    .refine(date => date > new Date(), 'Deadline must be in the future')
})

type GoalFormData = z.infer<typeof goalSchema>

interface GoalCreationModalProps {
  onGoalCreated?: () => void
  trigger?: React.ReactNode
}

export function GoalCreationModal({ onGoalCreated, trigger }: GoalCreationModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const { user } = useAuth()

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    mode: 'onChange',
    defaultValues: {
      targetWeight: 0,
    }
  })

  const onSubmit = async (data: GoalFormData) => {
    if (!user) {
      toast.error('You must be logged in to create a goal')
      return
    }

    console.log('Creating goal with user:', user)
    console.log('Goal data:', data)

    setIsLoading(true)
    try {
      // First, deactivate any existing active goals
      const { error: updateError } = await supabase
        .from('goals')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (updateError) {
        console.error('Error deactivating goals:', updateError)
      }

      // Create new goal
      const goalData = {
        user_id: user.id,
        target_weight: data.targetWeight,
        deadline: format(data.deadline, 'yyyy-MM-dd'),
        is_active: true
      }

      console.log('Inserting goal data:', goalData)

      const { data: insertedGoal, error } = await supabase
        .from('goals')
        .insert(goalData)
        .select()

      if (error) {
        console.error('Error inserting goal:', error)
        throw error
      }

      console.log('Goal created successfully:', insertedGoal)
      toast.success('Goal created successfully')
      setOpen(false)
      form.reset()
      
      // Trigger any callback to refresh components
      onGoalCreated?.()
      
      // Force a page refresh of components by triggering state change events
      window.dispatchEvent(new CustomEvent('goalCreated', { detail: insertedGoal }))
      window.dispatchEvent(new CustomEvent('statsRefresh', { detail: insertedGoal }))
    } catch (error) {
      console.error('Error creating goal:', error)
      toast.error('Failed to create goal. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const defaultTrigger = (
    <Button size="lg">
      Set Goal
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" data-testid="add-weight-modal">
        <DialogHeader>
          <DialogTitle>Create Weight Goal</DialogTitle>
          <DialogDescription>
            Set your target weight and deadline to start tracking your progress.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      placeholder="75.0"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
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
                          className="w-full pl-3 text-left font-normal"
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
                          setDatePickerOpen(false) // Close the popover when date is selected
                        }}
                        disabled={date => date <= new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Goal'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}