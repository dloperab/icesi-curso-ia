import { HabitDashboard } from '@/components/HabitDashboard';

interface HabitDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function HabitDetailPage({ params }: HabitDetailPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Detalles del Hábito
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <HabitDashboard habitId={id} />
      </main>
    </div>
  );
}
