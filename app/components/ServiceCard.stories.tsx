import type { Meta, StoryObj } from '@storybook/react'
import { ServiceCard } from './ServiceCard'

const meta: Meta<typeof ServiceCard> = {
  component: ServiceCard,
  title: 'Components/ServiceCard',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof ServiceCard>

export const Basic: Story = {
  args: {
    name: 'Gesichtsbehandlung Basic',
    durationMin: 45,
    priceCents: 6900,
  },
}

export const Refill: Story = {
  args: {
    name: 'Refill Lash Extensions',
    durationMin: 30,
    priceCents: 3900,
  },
}
