import { For, Show } from '@ilokesto/utilinent'

type ProductCardTitleProps = {
  readonly searchQuery: string
  readonly title: string
}

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function ProductCardTitle({
  searchQuery,
  title,
}: ProductCardTitleProps) {
  return (
    <h3 className="m-0 mb-2 text-sm leading-[1.35] font-medium">
      <HighlightedText searchQuery={searchQuery} text={title} />
    </h3>
  )
}

type HighlightedTextProps = {
  readonly searchQuery: string
  readonly text: string
}

function HighlightedText({ searchQuery, text }: HighlightedTextProps) {
  if (!searchQuery) return <>{text}</>

  const escapedSearchQuery = escapeRegExp(searchQuery)
  const parts = text.split(new RegExp(`(${escapedSearchQuery})`, 'gi'))

  return (
    <>
      <For each={parts}>
        {(part, index) => (
          <Show
            key={`${part}-${String(index)}`}
            when={part.toLowerCase() === searchQuery.toLowerCase()}
            fallback={part}
          >
            <mark className="bg-[#fff176] p-0">{part}</mark>
          </Show>
        )}
      </For>
    </>
  )
}
