import { defineStore } from 'pinia'

export interface Event {
  id: number
  name: string
  date: string
  // other event props
}

export interface TimesDataItem {
  record_id: number
  [key: string]: any
}

const storeMap = new Map()

export function getDynamicStore(storeId: string) {
    if (storeMap.has(storeId)) {
        return storeMap.get(storeId)
    } else {
        const { fetchAppointments,
                submitAppointment,
                deleteAppointment,
            } = useFetchQueries()
        const useEventsStore = defineStore(`events-${storeId}`, {
            

            state: () => ({
                events: [] as Event[],
                timesData: [] as TimesDataItem[],
                loading: false,
                error: null as string | null,
                lastFetched: null as Date | null,
                cacheExpiry: 5 * 60 * 1000, // 5 minutes
            }),

            getters: {
                // Get events sorted by date
                eventsByDate: (state) =>
                state.events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
                
                // Get upcoming events
                upcomingEvents: (state) =>
                state.events.filter(event => new Date(event.date) > new Date()),
                
                // Check if cache is still valid
                isCacheValid: (state) => {
                if (!state.lastFetched) return false
                return Date.now() - state.lastFetched.getTime() < state.cacheExpiry
                },
                
                // Get event by ID
                getEventById: (state) => (id: number) =>
                state.events.find(event => event.id === id),

            },

            actions: {
                // Fetch events from database
                async fetchEvents(pending: boolean, forceRefresh = false) {
                console.log('fetchEvents called')
                // Return cached data if valid and not forcing refresh
                if (!forceRefresh && this.isCacheValid && this.events.length > 0) {
                    return { data: this.events, timesData: this.timesData, isPending: false }
                }

                this.loading = pending
                this.error = null

                try {
                    const { data, timesData, isPending, error, status } = await fetchAppointments(pending)
                    
                    if(error){
                        return { error, status }
                    }

                    this.events = data
                    this.timesData = [...timesData]
                    this.lastFetched = new Date()
                    this.loading = isPending
                    
                    return { data, timesData, isPending }
                } catch (error) {
                    this.error = error instanceof Error ? error.message : 'Failed to fetch events'
                    this.loading = false
                    throw error
                }
                },
                // Add or update an event
                async saveEvent(appointment: Omit<Event, 'id'> | Partial<Event>, update: boolean) {
                this.loading = true
                debugger
                try {
                    const { data, timesData, error, status } = await submitAppointment(appointment)
                    if (data) {
                        if (!update) {
                            this.events.push(data)    
                        } else {
                            const index = this.events.findIndex(e => e.id === data.id)
                            if (index !== -1) this.events[index] = data
                        }
                        this.updateTimesData(data.id, timesData)
                    }
                    return { error, status }
                } catch (error) {
                    this.error = error instanceof Error ? error.message : `Failed to ${update? 'update' : 'add'} appointment`
                    this.loading = false
                    throw error
                } finally {
                    this.loading = false
                }
                },

                // Delete an event
                async deleteEvent(id: number, pending: boolean) {
                this.loading = true
                
                try {
                    const { error, isPending, status } = await deleteAppointment(id, pending)
                    if (error) {
                    return { error, isPending, status }
                    }
                    this.events = this.events.filter(e => e.id !== id)
                    await this.updateTimesData(id, null, true); // Remove from timesData
                    this.loading = false
                } catch (error) {
                    this.error = error instanceof Error ? error.message : 'Failed to delete event'
                    this.loading = false
                    throw error
                }
                },

                // Clear cache and force refresh
                async refreshEvents() {
                return this.fetchEvents(true, true)
                },

                // Clear all data
                clearEvents() {
                this.events = []
                this.lastFetched = null
                this.error = null
                },

                async updateTimesData(id: number, updateData: TimesDataItem | null = null, isDelete = false) {
                const index = this.timesData.findIndex(item => item && item.record_id === id)
                    
                    if (isDelete) {
                        // Remove times item
                        if (index !== -1) {
                            this.timesData.splice(index, 1)
                        }
                    } else if (index !== -1) {
                        // Update existing times items
                        Object.assign(this.timesData[index], { record_id: id, ...updateData })
                    } else if (updateData) {
                        // Add new times data
                        this.timesData.push({ ...updateData })
                    }
                }
            },
        })
        storeMap.set(storeId, useEventsStore())
        return useEventsStore
    }
}