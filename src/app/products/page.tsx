import { parseDiagnosticScenario } from '@/entities/product/model/DiagnosticScenario'
import { ProductListView } from '@/views/product-list/ui/ProductListView'

type ProductsPageProps = {
  readonly searchParams: Promise<{
    readonly scenario?: string | Array<string>
  }>
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { scenario } = await searchParams
  return (
    <ProductListView diagnosticScenario={parseDiagnosticScenario(scenario)} />
  )
}
