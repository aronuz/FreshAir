import { defineStore } from 'pinia'

interface userType {
  title: string,
  phone: string,
  email: string | undefined,
  role: string | undefined,
  user_id: string,
  created_at: string,
}

const { fetchUsers, deleteUsers } = useFetchQueries()

export const useUsersStore = defineStore('users', {            

    state: () => ({
        users: [] as userType[],
        loading: false,
        error: null as string | null,
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
        async fetchUsers(pending: boolean, forceReload = false) {
            if (this.isCacheValid && !forceReload) {
                return { data: this.users, error: null, status: 200, isPending: ref(false) }
            }
            this.error = null

            try {
                const { data, error, status, isPending } = await fetchUsers(pending)
                this.users = data || []
                this.lastFetched = new Date()
                return { data, error, status, isPending }
            } catch (error) {                        
                this.error = error instanceof Error ? error.message : 'Failed to fetch events'
                return { error: this.error, status: 500, isPending: ref(false) }
            }
        },
        // Update user data in store
        async updateUser(user: userType) {
            this.error = null
            let status = null
            debugger
            try {                               
                const index = this.users.findIndex((user: userType) => user.user_id === user.user_id)
                if (index !== -1) this.users[index] = user
            } catch (error) {
                this.error = error instanceof Error ? error.message : `Failed to update user`
                status = 500
            } finally {
                return { error: this.error, status }
            }
        },
        // Delete user
        async deleteUser(pending: boolean, user_ids: Array<number | string>) {
            try {
                const { error, status, isPending } = await deleteUsers(pending, user_ids)
                if (!error) {
                    this.users = this.users.filter((user: userType) => !user_ids.includes(user.user_id))  
                } 
                return { error, status, isPending }
            } catch (error) {
                this.error = error instanceof Error ? error.message : 'Failed to delete event'
                return { error: this.error, isPending: ref(false), status: 500 }
            }
        },

        // Clear cache and force refresh
        async refreshUsers() {
            return this.fetchUsers(true, true)
        },

        // Clear all data in current store
        clearUsers() {
            this.users = []
            this.lastFetched = null
            this.error = null
        },
    },
})