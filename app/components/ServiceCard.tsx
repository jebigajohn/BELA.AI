import React from 'react'

interface ServiceCardProps {
  name: string
  durationMin: number
  priceCents: number
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  name,
  durationMin,
  priceCents,
}) => {
  return (
    <div
      className="rounded-2xl bg-neutral-100 dark:bg-neutral-900 shadow-sm p-6 flex flex-col gap-2 items-start w-full max-w-sm transition-colors"
      style={{ minWidth: 0 }}
    >
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1 truncate w-full">
        {name}
      </h2>
      <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
        <span>{durationMin} Min</span>
        <span className="mx-1">·</span>
        <span>{(priceCents / 100).toFixed(2)} €</span>
      </div>
    </div>
  )
}

export default ServiceCard
