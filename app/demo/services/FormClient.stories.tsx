import type { Meta, StoryObj } from '@storybook/react'
import FormClient from './FormClient'

const meta: Meta<typeof FormClient> = {
  component: FormClient,
  title: 'Demo/Services/FormClient',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof FormClient>

const mockServices = [
  {
    id: '1',
    name: 'Gesichtsbehandlung Basic',
    price_cents: 6900,
    duration_min: 45,
  },
  {
    id: '2',
    name: 'Refill Lash Extensions',
    price_cents: 3900,
    duration_min: 30,
  },
]

export const Default: Story = {
  args: {
    services: [],
  },
}

export const WithService: Story = {
  args: {
    services: mockServices,
  },
}
