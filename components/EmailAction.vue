<template>
    <UContainer class="px-0 sm:px-0 lg:px-0">
        <MyButton  
            variant="primary"
            icon="i-heroicons-envelope"
            rightIcon
            @click="showForm = true"
        >
        Send an Email
        </MyButton>        
        
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