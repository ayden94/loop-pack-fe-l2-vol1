import { ModalProvider } from '@ilokesto/modal'
        
import { ProductListPage } from "./productList/ProductListPage";

export function App() {
  return (
    <ModalProvider>
      <ProductListPage />
    </ModalProvider>
  )
}
