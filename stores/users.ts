import { defineStore } from 'pinia'

interface userType {
  title: string,
  phone: string,
  email: string | undefined,
  role: string | undefined,
  user_id: string,
  created_at: string,
}

export const useUsersStore = defineStore('users', {            

    state: () => ({
        users: [] as userType[],
        loading: false,
        error: null as string | null,
        status: null as number | string | null,
        lastFetched: null as Date | null,
        cacheExpiry: 5 * 60 * 1000, // 5 minutes
    }),

    getters: {
        // Get users sorted by name
        usersByName: (state) =>
        state.users.sort((a: userType, b: userType) => a.title.localeCompare(b.title)),
        
        // Check if cache is still valid
        isCacheValid: (state) => {
            if (!state.lastFetched) return false
            return Date.now() - state.lastFetched.getTime() < state.cacheExpiry
        },
        
        // Get user by ID
        getUserById: (state) => (user_id: string) =>
        state.users.find((user: userType) => user.user_id === user_id),
    },

    actions: {
        // Fetch events from database
        async fetchUsers({userId = undefined, forceReload = false}: {userId?: string, forceReload?: boolean} = {}) {
            if (this.isCacheValid && !forceReload) {
                return { data: this.users, error: null, status: 200 }
            }
            this.error = null
            this.status = null

            try {
                const { fetchUsers } = useFetchUsers()
                const { data, error, status } = await fetchUsers(userId)
                this.users = data || []
                if (!error) this.lastFetched = new Date()
                this.error = error
                this.status = status 
            } catch (error) {                        
                this.error = error instanceof Error ? error.message : 'Failed to fetch events'
                this.status = 500                
            } finally {
                return { data: this.users, error: this.error, status: this.status }
            }
        },
        // Update user data in store
        async updateUser(user: userType) {
            this.error = null
            this.status = null
            
            try {                               
                const index = this.users.findIndex((user: userType) => user.user_id === user.user_id)
                if (index !== -1) this.users[index] = user
            } catch (error) {
                this.error = error instanceof Error ? error.message : `Failed to update user`
                this.status = 500
            } finally {
                return { error: this.error, status: this.status }
            }
        },
        // Delete user
        async deleteUser(user_ids: Array<number | string>) {
            try {
                const { deleteUsers } = useFetchUsers()
                const { error, status } = await deleteUsers(user_ids)
                if (!error) {
                    this.users = this.users.filter((user: userType) => !user_ids.includes(user.user_id))  
                } else {
                    this.error = error
                    this.status = status
                }
                return { error, status }
            } catch (error) {
                this.error = error instanceof Error ? error.message : 'Failed to delete event'
                return { error: this.error, status: 500 }
            } finally {
                return { error: this.error, status: null }
            }
        },

        // Clear cache and force refresh
        async refreshUsers() {
            return this.fetchUsers({forceReload: true})
        },

        // Clear all data in current store
        clearUsers() {
            this.users = []
            this.lastFetched = null
            this.error = null
        },
    },
})