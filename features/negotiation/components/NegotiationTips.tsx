'use client'

import { Card, Icon } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'

export function NegotiationTips() {
  return (
    <Card variant="default" padding="md" className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
        <Icon name="tips_and_updates" size="md" className="text-[var(--primary)]" />
        {TEXT.negotiationTips.title}
      </h2>
      <ul className="space-y-2 text-sm text-[var(--text-main)]">
        {TEXT.negotiationTips.items.map(item => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
