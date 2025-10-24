<template>
  <div class="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6">{{ formdata.name ? `${formdata.name}'s` : 'New' }} Profile</h2>
    
    <UForm class="space-y-4" :state="formdata" ref="staffform" :schema="schema" :loading="pending" @submit="handleSubmit" @error="onError">
        <!-- Name Input -->
        <UFormField label="Name" name="name" required>
            <UInput placeholder="Staff Name" v-model="formdata.name"/>
        </UFormField>

        <!-- Bio Text Area -->
        <UFormField label="Bio" name="bio" required>
            <UTextarea class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" :rows="2" :maxrows="4" resize="none" :autoresize="true" variant="outline" v-model="formdata.bio" placeholder="Staff bio" />
        </UFormField>

        <!-- Image Upload -->
        <div :class="['grid gap-4', imagePreview ? 'md:grid-cols-2' : 'grid-cols-1']">
                        
            <UFormField name="profileImage" label="Photo" description="Allowed file types: JPG or PNG. 2MB Max.">
                <div class="flex items-center gap-3">
                    <input 
                        ref="fileInput"
                        type="file" 
                        accept="image/*" 
                        @change="handleFileChange"
                        class="hidden"
                    />
                    <UButton 
                        @click="openFileDialog"
                        icon="i-heroicons-photo"
                        color="info"
                        variant="outline"
                        label="Select Image"
                    />
                </div>
            </UFormField>
            
            <!-- Image Preview -->
            <div v-if="imagePreview && fileName" class="flex flex-col items-center justify-center border border-gray-300 rounded-md overflow-hidden p-4">
                <img :src="imagePreview as string" :alt="fileName" class="w-40 h-40 object-cover rounded mb-2" />
                <span class="text-xs text-gray-600 text-center truncate">{{ fileName }}</span>
            </div>
        </div>

        <!-- Submit Button -->
        <div class="md:grid grid-cols-2 gap-4 py-2 px-4 flex justify-center" >
            <!-- Submit Button -->
            <UButton class="w-36 justify-self-end bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed" :disabled="!formHasData" type="submit" color="primary" variant="solid" label="Save Profile" :loading="pending" icon="i-heroicons-arrow-up-on-square" />

            <!-- Cancel Button -->
            <UButton class="w-36 text-blue rounded-md hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed" :disabled="!formHasData || pending" color="primary" variant="outline" label="Clear Form" icon="i-heroicons-x-circle" @click="clearForm"/>
        </div>

        <!-- Error Messages -->
        <div v-show="hasErrors" class="col-span-3">          
            <UFormField name="errors"/>
        </div>
    </UForm>
  </div>
</template>

<script lang="ts" setup>
    import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
    import { z } from 'zod'

    const emit = defineEmits(['saved', 'formCleared'])

    interface staff {
        id?: number;
        name: string;
        bio: string;
        'image_url'?: string;
    }
        
    const props = defineProps<{
        staffSelected?: staff
    }>()
    
    const baseState = reactive({
      profileImage: undefined as File | undefined,
      name: null as string | null,
      bio: null as string | null
    })

    const formdata = reactive({...baseState})

    const initialData = ref<Record<string, any>>({})

    const selectedFile = ref<File | null>(null)
    const fileName = ref<string>('')
    const imagePreview = ref<string | ArrayBuffer | null>(null)
    const fileInput = ref<HTMLInputElement | null>(null)

    watchEffect(() => {
        if (props.staffSelected) {
            formdata.name = props.staffSelected.name
            formdata.bio = props.staffSelected.bio
            imagePreview.value = props.staffSelected.image_url || null
            fileName.value = props.staffSelected.image_url?.split('/').pop() || ''

            // Store initial data without triggering watchers
            initialData.value = {
                name: props.staffSelected.name,
                bio: props.staffSelected.bio,
                profileImage: undefined
            }
        }
    })

    const staffId = computed(() => props.staffSelected ? props.staffSelected.id : null)

    const { saveStaffProfile } = useFetchQueries()

    const pending = ref(false)

    const { toastBar } = useToastBar()

    const hasErrors = ref(false)

    const staffform = ref()

    const formHasData = computed(() => {
        const isNewData = Object.keys(initialData.value).length === 0
        if (isNewData) {
            // For new profiles: require name and bio (image is optional)
            return (formdata.name !== null && formdata.name.trim() !== '') || 
                   (formdata.bio !== null && formdata.bio.trim() !== '')
        } else {
            // For editing: detect changes between initialData and current formdata or if a new file is selected
            const isChanged = selectedFile.value !== null || Object.keys(initialData.value).some(key => {
                return initialData.value[key] !== (formdata as any)[key]
            })
            return isChanged
        }
    })
    
    const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
    const MIN_DIMENSIONS = { width: 200, height: 200 }
    const MAX_DIMENSIONS = { width: 4096, height: 4096 }
    const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024,
            sizes = ['Bytes', 'KB', 'MB', 'GB']
        let m = 0, uploadSize: number,
            i = Math.floor(Math.log(bytes) / Math.log(k))
        if (i >= sizes.length) {
            m = i - sizes.length + 1
            i = sizes.length - 1
        }
        uploadSize = Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) * m ? m : 1
        return `${uploadSize} ${sizes[i]}`
    }

    const schema = z.object({
        name: z.string().min(1, 'Name is required'),        
        bio: z.string().min(1, 'Bio is required').max(255, "Text is too long"),
        profileImage: z.union([
            z.instanceof(File).refine((file) => file.size <= MAX_FILE_SIZE, {
                message: `The image is too large. Please choose an image smaller than ${formatBytes(MAX_FILE_SIZE)}.`
            }).refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
                message: 'Please upload a valid image file (JPEG, PNG, or WebP).'
            }).refine(
                (file) =>
                    new Promise((resolve) => {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        const img = new Image()
                        img.onload = () => {
                        const meetsDimensions =
                            img.width >= MIN_DIMENSIONS.width &&
                            img.height >= MIN_DIMENSIONS.height &&
                            img.width <= MAX_DIMENSIONS.width &&
                            img.height <= MAX_DIMENSIONS.height
                        resolve(meetsDimensions)
                        }
                        img.src = e.target?.result as string
                    }
                    reader.readAsDataURL(file)
                    }),
                {
                    message: `The image dimensions are invalid. Please upload an image between ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height} and ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height} pixels.`
                }
            ),
            z.string().url('Invalid image URL')
        ]).optional()
    })

    const openFileDialog = () => {
        fileInput.value?.click()
    }

    const handleFileChange = (event: Event) => {
        const input = event.target as HTMLInputElement
        const files = input.files
        
        if (files && files.length > 0) {
            const file = files[0]
            selectedFile.value = file
            fileName.value = selectedFile.value.name
            formdata.profileImage = file
            
            // Generate preview
            const reader = new FileReader()
            reader.onload = (e) => {
                imagePreview.value = e.target?.result || null
            }
            reader.readAsDataURL(file)
        }
    }

    const clearForm = () => {
        Object.assign(formdata, baseState)
        selectedFile.value = null
        imagePreview.value = null
        fileName.value = ''
        staffform.value.clear()
        emit('formCleared')
    }

    const handleSubmit = async () => {
        pending.value = true
        try {
            let fileName: string | null = null, 
                filePath: string | null = null

            if (selectedFile.value) {
                // Set image file metadata
                const fileExt = selectedFile.value.name.split('.').pop()
                fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
                filePath = `staff/${fileName}`
            }

            const { error, status } = await saveStaffProfile(filePath, selectedFile.value, {
                    bio: formdata.bio,
                    name: formdata.name
                }, staffId.value
            )
            
            if(error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                showError(`There was an issue with submitting the form. Please try again later.\n${error}`, status || '500')
            } else {
                emit('saved')
                const action = staffId.value ? 'updated' : 'added'
                toastBar('success', `Profile for ${formdata.name} ${action} successfully!`)
            }           
        } catch (e) {
            const error = e instanceof Error ? e.message : String(e)
            showError(`There was an issue with submitting the form. Please try again later.\n${error}`, '500')
        } finally {
            clearForm()   
            pending.value = false
        }
    }

    const onError = async (event: FormErrorEvent) => {
        if (event?.errors.length){
        hasErrors.value = true
        let fieldName: string
        for(const error of event.errors){
        fieldName = error.name!.charAt(0).toUpperCase() + error.name!.slice(1)
        showError(`${fieldName} is missing`, error.message)
        await nextTick()
        }}
        if (event.errors[0]?.id) {
        const element = document.getElementById(event.errors[0].id)
        element?.focus()
        }
    }

    const showError = (error: string | undefined, status = 'Email Error') => {
        toastBar('error', status, error?.trim())
    }
</script>