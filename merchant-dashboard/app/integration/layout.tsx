import SharedLayout from '@/components/SharedLayout'

export default function IntegrationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SharedLayout>{children}</SharedLayout>
}

