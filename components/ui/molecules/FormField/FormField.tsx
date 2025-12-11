'use client'

import { Input, type InputProps } from '@/components/ui/atoms'

export interface FormFieldProps extends Omit<InputProps, 'onChange'> {
  value: string
  onChange: (value: string) => void
}

export function FormField({ value, onChange, ...props }: FormFieldProps) {
  return <Input value={value} onChange={(e) => onChange(e.target.value)} {...props} />
}
