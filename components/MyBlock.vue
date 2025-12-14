<template>
  <section :class="containerClasses">
    <slot />
  </section>
</template>

<script lang="ts" setup>
  const props = withDefaults(defineProps<{
  padSize?: 'small' | 'medium' | 'large';
  spacing?: 'compact' | 'relaxed';
}>(), {
  padSize: 'small', // Default maps to 'p-2'
  spacing: 'relaxed'    // Default maps to 'my-8'
});

const paddingMap = {
  small: 'p-2',
  medium: 'p-4',
  large: 'p-6'
};

const spacingMap = {
  compact: 'my-2',
  relaxed: 'my-4'
};

const containerClasses = computed(() => {
  return [
    paddingMap[props.padSize],
    spacingMap[props.spacing],
    'bg-gray-100/25 rounded-lg shadow-md'
  ];
});
</script>

<style>

</style>