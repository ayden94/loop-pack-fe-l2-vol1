import { parseDiagnosticScenario } from '@/entities/product/model/DiagnosticScenario'
import { HomeView } from '@/views/home/ui/HomeView'

type HomePageProps = {
  readonly searchParams: Promise<{
    readonly scenario?: string | Array<string>
  }>
}

export default async function Home({ searchParams }: HomePageProps) {
  const { scenario } = await searchParams
  return <HomeView diagnosticScenario={parseDiagnosticScenario(scenario)} />
}
