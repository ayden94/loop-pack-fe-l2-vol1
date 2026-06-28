import type { MutationOptions, MutationState } from './types'

export type MutationRecord<TData, TError, TVariables, TContext> = {
  mutationId: number
  state: MutationState<TData, TError, TVariables, TContext>
  options: MutationOptions<TData, TError, TVariables, TContext>
}

type MutationCacheListener = () => void

export class MutationCache {
  private readonly mutations: Array<
    MutationRecord<unknown, unknown, unknown, unknown>
  >
  private readonly listeners: Set<MutationCacheListener>
  private idCounter: number

  constructor() {
    this.mutations = []
    this.listeners = new Set()
    this.idCounter = 0
  }

  subscribe(listener: MutationCacheListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  notify(): void {
    for (const listener of this.listeners) {
      listener()
    }
  }

  add<TData, TError, TVariables, TContext>(
    options: MutationOptions<TData, TError, TVariables, TContext>,
  ): MutationRecord<TData, TError, TVariables, TContext> {
    this.idCounter += 1
    const record: MutationRecord<TData, TError, TVariables, TContext> = {
      mutationId: this.idCounter,
      state: {
        status: 'idle',
        data: undefined,
        error: null,
        variables: undefined,
        context: undefined,
      },
      options,
    }

    this.mutations.push(
      record as MutationRecord<unknown, unknown, unknown, unknown>,
    )
    this.notify()
    return record
  }

  update<TData, TError, TVariables, TContext>(
    record: MutationRecord<TData, TError, TVariables, TContext>,
    state: MutationState<TData, TError, TVariables, TContext>,
  ): void {
    record.state = state
    this.notify()
  }

  remove<TData, TError, TVariables, TContext>(
    record: MutationRecord<TData, TError, TVariables, TContext>,
  ): void {
    const index = this.mutations.indexOf(
      record as MutationRecord<unknown, unknown, unknown, unknown>,
    )
    if (index !== -1) {
      this.mutations.splice(index, 1)
    }
    this.notify()
  }

  getAll(): Array<MutationRecord<unknown, unknown, unknown, unknown>> {
    return this.mutations.slice()
  }

  clear(): void {
    this.mutations.length = 0
    this.notify()
  }
}
