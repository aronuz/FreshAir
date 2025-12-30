import { defineStore } from 'pinia'
import Fuse from 'fuse.js'

import type { IFuseOptions } from 'fuse.js'

import type { AppointmentData } from '../composables/useFetchAppointments'

export interface FetchParams {
    limit?: number,
    user_id?: string | null,
    list?: boolean
}

export interface StoreID {
    range: string | null
    type: string
    user_id: string | null
}

export interface Event {
   [key: string]: number | string | Date;
}

export interface TimesDataItem {
    record_id: number
    [key: string]: any
}

const storeMap = new Map()

export const removeAllStores = () => {
    storeMap.clear()
}

export function getDynamicStore(storeId: StoreID) {
    const storeKey = `${storeId.range}-${storeId.type}-${storeId.user_id || 'all'}`
    if (storeMap.has(storeKey)) {
        return storeMap.get(storeKey)
    } else {
        
        // Configure fuse.js options
        const fuseOptions: IFuseOptions<AppointmentData> = {
            keys: ['address', 'notes', 'users.title', 'users.email', 'users.phone'],
            threshold: 0.3, // Sensitivity: 0.0 requires a perfect match, 1.0 matches anything
        }

        const { fetchAppointments,
                submitAppointment,
                deleteAppointment,
            } = useFetchAppointments()

        const useEventsStore = defineStore(`events-${storeKey}`, {            

            state: () => ({
                events: [] as AppointmentData[],
                timesData: [] as TimesDataItem[],
                loading: false,
                error: null as string | null,
                status: null as string | number | null,
                lastFetched: null as Date | null,
                cacheExpiry: 5 * 60 * 1000, // 5 minutes
                hasBeenFetched: false, // Track if data has been fetched at least once
                searchTerm: '',
            }),

            getters: {

                // Getter to perform the fuzzy search
                filteredEvents: (state) => {
                    if (!state.searchTerm) {
                        return state.events // Return all events if search term is empty
                    }

                    const fuse = new Fuse(state.events, fuseOptions);
                    // fuse.search returns an array of objects with a 'item' property
                    return fuse.search(state.searchTerm).map(result => result.item.id);
                },

                // Get events sorted by date
                eventsByDate: (state) =>
                state.events.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()),
                
                // Get upcoming events
                upcomingEvents: (state) =>
                state.events.filter(event => new Date(event.start_date) > new Date()),
                
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
                // Action to update the search term
                setSearchTerm(term: string) {
                    this.searchTerm = term;
                },

                // Fetch events from database
                async fetchEvents({fetchParams = {}, forceRefresh = false}: {fetchParams?: FetchParams, forceRefresh?: boolean} = {}, ) {
                    //console.log('fetchEvents called, events length:', this.events?.length, 'lastFetched:', !!this.lastFetched)
                    
                    // If we already have data and this isn't a force refresh, return cached data
                    // This handles the case where useAsyncData runs multiple times during hydration
                    if (!forceRefresh && this.lastFetched && this.events?.length > 0) {
                        //console.log('Returning already fetched data from store cache')
                        return { data: this.events, timesData: this.timesData }
                    }
                    
                    // Return cached data if valid and not forcing refresh (normal cache behavior)
                    if (!forceRefresh && this.isCacheValid && this.events?.length > 0) {
                        //console.log('Returning valid cached data')
                        return { data: this.events, timesData: this.timesData }
                    }

                    //console.log('Calling fetchAppointments')
                    try {
                        const { data, timesData, error, status } = await fetchAppointments(fetchParams)
                        
                        //console.log('fetchAppointments returned, data length:', data?.length, 'error:', !!error)
                        
                        if(error){
                            return { error, status }
                        }

                        // Always update store state with the returned data, even if it came from useAsyncData cache
                        this.events = data as AppointmentData[]|| []
                        if (fetchParams?.limit) this.timesData = [...(timesData || [])]
                        this.lastFetched = new Date()
                        
                        //console.log('Store updated, events length:', this.events.length)
                        return { data: this.events, timesData: this.timesData }
                    } catch (error) {
                        console.error('Error in fetchEvents:', error)
                        throw error
                    }
                },
                // Add or update an event
                async saveEvent(appointment: Omit<AppointmentData, 'id'> | Partial<AppointmentData>, update: boolean) {
                    try {
                        const { data, error, status } = await submitAppointment(appointment)
                        if (data) {      
                            const record = data as AppointmentData                      
                            if (!update) {
                                this.events.push(record)    
                            } else {                                
                                const index = this.events.findIndex(e => e.id === record.id)
                                if (index !== -1) this.events[index] = data as AppointmentData
                            }
                            const { id: record_id, ...rest } = record
                            const timesDataItem = { 'record_id': record_id, ...rest } as TimesDataItem
                            this.updateTimesData(record_id as number, timesDataItem)
                        }
                        return { error, status}
                    } catch (error) {
                        // this.error = error instanceof Error ? error.message : `Failed to ${update? 'update' : 'add'} appointment`
                        throw error
                    }
                },

                // Delete an event
                async deleteEvent(id: number) {
                    this.loading = true
                    this.error = null
                    this.status = null
                    try {
                        const { error, status } = await deleteAppointment(id)
                        if (!error) {                            
                            this.events = this.events.filter(e => e.id !== id)
                            await this.updateTimesData(id, null, true); // Remove from timesData
                        } else this.error = error
                        this.status = status
                    } catch (error) {
                        this.error = error instanceof Error ? error.message : 'Failed to delete event'
                        this.status = 500
                    } finally {
                        this.loading = false
                        return { error: this.error, status: this.status }
                    }
                },

                async updateTimesData(id: number, updateData: TimesDataItem | null = null, isDelete = false) {
                    try {
                        const index = this.timesData.findIndex(item => item && item.record_id === id)
                        
                        if (isDelete) {
                            // Remove times item
                            if (index !== -1) {
                                this.timesData.splice(index, 1)
                            }
                        } else if (index !== -1) {
                            // Update existing times items
                            Object.assign(this.timesData[index], { ...updateData })
                        } else if (updateData) {
                            // Add new times data
                            this.timesData.push({ ...updateData })
                        }
                    } catch (error) {
                        this.error = error instanceof Error ? error.message : 'Failed to update times data'
                        throw error
                    }
                },

                // Clear cache and force refresh
                async refreshEvents() {
                    return this.fetchEvents({forceRefresh: true})
                },

                // Clear all data in current store
                clearEvents() {
                    this.events = []
                    this.lastFetched = null
                    this.error = null
                    this.hasBeenFetched = false
                },

                // Remove the current store
                removeStore() {
                    storeMap.delete(storeKey)
                }
            },
        })
        const storeInstance = useEventsStore()
        storeMap.set(storeKey, storeInstance)
        return storeInstance
    }
}