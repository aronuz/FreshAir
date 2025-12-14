<template>
    <UButton
      v-bind="buttonProps"
      :class="attrs.class"
      :ui="(attrs.ui as unknown) || undefined "
      :label="(attrs.label as string)"
      :block="(attrs.block as boolean) || false"
      :type="(attrs.type as ButtonType)"
      @click="onClick($event)"
      @mouseenter="onMouseenter"
      @mouseleave="onMouseleave"
    >
      <slot></slot>
  </UButton>
</template>

<script lang="ts" setup>
  type Variant = 'ghost' | 'solid' | 'soft' | 'outline' | 'subtle' | 'link'
  type Color = 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'neutral'
  type ButtonVariant = Color | 'error' | 'nutural' | 'danger' | 'primary' | 'success' |'successOutline' | 'infoOutline' | 'ghost' | 'ghostError' | 'ghostPrimary'
  type Size = 'sm' | 'md' | 'lg' | 'xl'
  type ButtonType = "button" | "submit" | "reset" | undefined

  interface Props {
    variant?: Variant
    loading?: boolean
    disabled?: boolean
    icon?: string
    rightIcon?: boolean
    color?: Color,
    size?: Size,
    to?: string | object | undefined,
    trackingId?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'solid'
  })

  defineOptions({
    inheritAttrs: false
  })

  const attrs = useAttrs()

  const emit = defineEmits(['click', 'mouseenter', 'mouseleave'])

  const isDisabled = computed(() => 
    props.disabled || props.loading
  )

  const buttonTypeMap: Partial<Record<ButtonVariant, {color: Color, variant: Variant}>> = {
    primary: { color: 'primary', variant: 'solid' },
    success: { color: 'success', variant: 'solid' },
    successOutline: { color: 'success', variant: 'outline' },
    info: { color: 'info', variant: 'solid' },
    infoOutline: { color: 'info', variant: 'outline' },
    warning: { color: 'warning', variant: 'solid' },
    secondary: { color: 'secondary', variant: 'soft' },
    danger: { color: 'error', variant: 'solid' },
    ghost: { color: 'neutral', variant: 'ghost' },
    ghostError: { color: 'error', variant: 'ghost' },
    ghostPrimary: { color: 'primary', variant: 'ghost' }
  }

  const buttonProps = computed<Props>(() => ({
    ...buttonTypeMap[props.variant as ButtonVariant],
    loading: props.loading,
    disabled: isDisabled.value,
    icon: props.icon,
    leading: !props.rightIcon,
    trailing: props.rightIcon,
    to: props.to
  }))

  const onClick = async (event: MouseEvent) => {
    // to-do: handle analytics tracking with trackingId
    console.log('Button clicked', event, props.trackingId)
    emit('click', event)
  }

  const onMouseenter = () => {
    emit('mouseenter')
  }

  const onMouseleave = () => {
    emit('mouseleave')
  }
</script>

<style>

</style>