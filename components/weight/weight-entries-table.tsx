'use client'

import { useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import type { WeightEntry } from '@/lib/schemas/weight-entry'
import { EditWeightDialog } from './edit-weight-dialog'

export interface WeightEntriesTableRef {
  refreshEntries: () => void
}

export const WeightEntriesTable = forwardRef<WeightEntriesTableRef>((props, ref) => {
  const [entries, setEntries] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<WeightEntry | null>(null)
  const [individualEntries, setIndividualEntries] = useState<WeightEntry[]>([])
  const { user } = useAuth()

  const fetchEntries = useCallback(async () => {
    if (!user) return
    
    try {
        const { data, error } = await supabase
          .from('weight_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })

        if (error) {
          console.error('Error fetching weight entries:', error)
          return
        }

        // Group entries by date and calculate averages for multiple entries per day
        const groupedEntries = (data || []).reduce((acc, entry) => {
          const date = entry.date
          if (!acc[date]) {
            acc[date] = {
              ...entry,
              weights: [entry.weight],
              memos: [entry.memo].filter(Boolean)
            }
          } else {
            acc[date].weights.push(entry.weight)
            if (entry.memo) {
              acc[date].memos.push(entry.memo)
            }
          }
          return acc
        }, {} as Record<string, any>)

        // Convert to array and calculate averages
        const averagedEntries = Object.values(groupedEntries).map((group: any) => {
          const avgWeight = Math.round((group.weights.reduce((sum: number, w: number) => sum + w, 0) / group.weights.length) * 100) / 100
          const isAveraged = group.weights.length > 1
          
          return {
            ...group,
            weight: avgWeight,
            isAveraged,
            entryCount: group.weights.length,
            memo: isAveraged 
              ? `Average of ${group.weights.length} entries (${group.weights.join(', ')} kg)${group.memos.length > 0 ? '; ' + group.memos.join('; ') : ''}`
              : group.memos.join('; ') || null
          }
        })

        setEntries(averagedEntries)
        
        // Store individual entries for editing
        setIndividualEntries(data || [])
      } catch (error) {
        console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    fetchEntries()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('weight_entries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weight_entries',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Weight entries subscription triggered:', payload)
          fetchEntries()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchEntries])

  // Expose refresh function to parent components
  useImperativeHandle(ref, () => ({
    refreshEntries: fetchEntries
  }))

  const handleRowClick = (entry: any) => {
    // For averaged entries, find the most recent individual entry for that date
    if (entry.isAveraged) {
      const entriesForDate = individualEntries.filter(e => e.date === entry.date)
      const mostRecentEntry = entriesForDate.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]
      setSelectedEntry(mostRecentEntry)
    } else {
      // Find the individual entry by date (since ID might be different after averaging)
      const individualEntry = individualEntries.find(e => e.date === entry.date)
      setSelectedEntry(individualEntry || entry)
    }
    setEditModalOpen(true)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight Entries</CardTitle>
          <CardDescription>Your recent weight tracking history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight Entries</CardTitle>
          <CardDescription>Your recent weight tracking history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">No weight entries yet. Add your first entry!</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight Entries</CardTitle>
        <CardDescription>Your recent weight tracking history</CardDescription>
      </CardHeader>
      <CardContent>
        <Table data-testid="weight-entries-table">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Weight (kg)</TableHead>
              <TableHead>Memo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow 
                key={entry.id} 
                data-testid="weight-entry-row"
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleRowClick(entry)}
              >
                <TableCell>{format(new Date(entry.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell className="font-medium">
                  {entry.weight}
                  {entry.isAveraged && <span className="text-amber-600 ml-1" title={`Average of ${entry.entryCount} entries`}>*</span>}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.memo || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      
      {selectedEntry && (
        <EditWeightDialog
          open={editModalOpen}
          onOpenChange={(open) => {
            setEditModalOpen(open)
            if (!open) {
              setSelectedEntry(null) // Clear selection when modal closes
            }
          }}
          entry={selectedEntry}
          onSuccess={() => {
            fetchEntries() // Refresh table after successful edit
          }}
        />
      )}
    </Card>
  )
})

WeightEntriesTable.displayName = 'WeightEntriesTable'