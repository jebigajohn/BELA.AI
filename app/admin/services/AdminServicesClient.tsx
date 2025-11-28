'use client'

import React from 'react'
import PageWrapper from '@/app/components/PageWrapper'

export default function AdminServicesClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto">{children}</div>
    </PageWrapper>
  )
}
