import SharedLayout from '@/components/SharedLayout'

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SharedLayout>{children}</SharedLayout>
}

