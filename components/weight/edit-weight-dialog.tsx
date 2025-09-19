'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react'
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
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import type { WeightEntry } from '@/lib/schemas/weight-entry'
import { WeightHelpTooltip } from '@/components/help/help-tooltip'

interface EditWeightDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: WeightEntry | null
  onSuccess?: () => void
}

export function EditWeightDialog({ open, onOpenChange, entry, onSuccess }: EditWeightDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const form = useForm<WeightEntryInput>({
    resolver: zodResolver(weightEntrySchema),
    defaultValues: {
      weight: '',
      date: new Date(),
      memo: '',
    },
  })

  // Update form when entry changes
  useEffect(() => {
    if (entry && open) {
      form.reset({
        weight: entry.weight.toString(),
        date: new Date(entry.date),
        memo: entry.memo || '',
      })
    } else if (!open) {
      // Reset form when modal closes to prevent stale data
      form.reset({
        weight: '',
        date: new Date(),
        memo: '',
      })
    }
  }, [entry, open, form])

  const onSubmit = async (data: WeightEntryInput) => {
    if (!entry) return
    
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        showErrorToast('Please log in to update weight entries')
        return
      }

      const { error } = await supabase
        .from('weight_entries')
        .update({
          weight: parseFloat(data.weight),
          date: format(data.date, 'yyyy-MM-dd'),
          memo: data.memo || null,
        })
        .eq('id', entry.id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating weight entry:', error)
        showErrorToast(ToastMessages.general.saveError)
        return
      }

      showSuccessToast(ToastMessages.weight.editSuccess)
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('weightEntryUpdated'))
      
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error:', error)
      showErrorToast(ToastMessages.general.saveError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!entry) return
    
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        showErrorToast('Please log in to delete weight entries')
        return
      }

      const { error } = await supabase
        .from('weight_entries')
        .delete()
        .eq('id', entry.id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting weight entry:', error)
        showErrorToast(ToastMessages.general.saveError)
        return
      }

      showSuccessToast(ToastMessages.weight.deleteSuccess)
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('weightEntryUpdated'))
      
      onSuccess?.()
      onOpenChange(false)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Error:', error)
      showErrorToast('Failed to delete entry. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]" data-testid="edit-weight-modal">
          <DialogHeader>
            <DialogTitle>Edit Weight Entry</DialogTitle>
            <DialogDescription>
              Modify your weight entry details.
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
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
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
                          onSelect={(date) => {
                            field.onChange(date)
                            setDatePickerOpen(false)
                          }}
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
                        placeholder="Update your memo..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="destructive"
                  className="sm:mr-auto"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Entry
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent data-testid="delete-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Weight Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}