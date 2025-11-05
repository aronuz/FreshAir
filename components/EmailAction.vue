<template>
    <UContainer class="px-0 sm:px-0 lg:px-0">
        <UButton  
            collor="primary"
            variant="solid"
            trailing-icon="i-heroicons-envelope"
            @click="showForm = true"
        >
        Send an Email
        </UButton>        
        
        <!-- Contact Form -->
        <ContactForm 
            v-if="showForm" 
            v-bind="$attrs" 
            class="w-full" 
            @close="showForm = false"/>
    </UContainer>
</template>

<script setup lang="ts">
    defineOptions({
        inheritAttrs: false
    })

    const showForm = ref(false)
</script>