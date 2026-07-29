import { useState } from 'react'

type UseInlineQueryRetryOptions = {
  readonly isFetching: boolean
  readonly refetch: () => Promise<unknown>
}

export function useInlineQueryRetry({
  isFetching,
  refetch,
}: UseInlineQueryRetryOptions) {
  const [message, setMessage] = useState<string | null>(null)

  const retry = (nextMessage: string) => {
    setMessage(nextMessage)
    void refetch().then(() => {
      setMessage(null)
    })
  }

  return {
    isRetrying: message !== null && isFetching,
    message,
    retry,
  }
}
