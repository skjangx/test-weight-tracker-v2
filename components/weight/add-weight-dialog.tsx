'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { showSuccessToast, showErrorToast, ToastMessages } from '@/lib/utils/toast'
import { weightEntrySchema, type WeightEntryInput } from '@/lib/schemas/weight-entry'
import { supabase } from '@/lib/supabase/client'
import { WeightHelpTooltip } from '@/components/help/help-tooltip'

interface AddWeightDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function AddWeightDialog({ open, onOpenChange, onSuccess, trigger }: AddWeightDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [internalOpen, setInternalOpen] = useState(false)

  // Use internal state if no external control provided
  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  const form = useForm<WeightEntryInput>({
    resolver: zodResolver(weightEntrySchema),
    defaultValues: {
      weight: '',
      date: new Date(),
      memo: '',
    },
  })

  const onSubmit = async (data: WeightEntryInput) => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        showErrorToast('Please log in to save weight entries')
        return
      }

      // Check if entry for this date already exists
      const { data: existingEntry } = await supabase
        .from('weight_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', format(data.date, 'yyyy-MM-dd'))
        .single()

      const { error } = await supabase
        .from('weight_entries')
        .insert({
          user_id: user.id,
          weight: parseFloat(data.weight),
          date: format(data.date, 'yyyy-MM-dd'),
          memo: data.memo || null,
        })

      if (error) {
        console.error('Error saving weight entry:', error)
        showErrorToast(ToastMessages.general.saveError)
        return
      }

      if (existingEntry) {
        showSuccessToast(ToastMessages.weight.addSuccess, ToastMessages.weight.duplicateDate)
      } else {
        showSuccessToast(ToastMessages.weight.addSuccess)
      }
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('weightEntryCreated'))
      
      onSuccess?.()
      form.reset()
      setIsOpen(false)
    } catch (error) {
      console.error('Error:', error)
      showErrorToast(ToastMessages.general.saveError)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]" data-testid="add-weight-modal">
        <DialogHeader>
          <DialogTitle>Add Weight Entry</DialogTitle>
          <DialogDescription>
            Log your weight for today. You can add a memo to track how you're feeling.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <span>Weight (kg)</span>
                    <WeightHelpTooltip />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your weight"
                      type="number"
                      step="0.1"
                      min="30"
                      max="300"
                      {...field}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          form.handleSubmit(onSubmit)()
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
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
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Memo (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="How are you feeling today?"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Entry'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}