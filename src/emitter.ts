type EventMap = Record<string, unknown>;
type Listener<T> = (data: T) => void;
type AnyListener<E extends EventMap> = <K extends keyof E>(event: K, data: E[K]) => void;

export interface Emitter<E extends EventMap> {
  on<K extends keyof E>(event: K, listener: Listener<E[K]>): () => void;
  once<K extends keyof E>(event: K, listener: Listener<E[K]>): () => void;
  off<K extends keyof E>(event: K, listener: Listener<E[K]>): void;
  emit<K extends keyof E>(event: K, data: E[K]): void;
  waitFor<K extends keyof E>(event: K): Promise<E[K]>;
  onAny(listener: AnyListener<E>): () => void;
  offAll(event?: keyof E): void;
  listenerCount(event: keyof E): number;
}

export interface EmitterOptions {
  maxListeners?: number;
}

export function createEmitter<E extends EventMap>(options: EmitterOptions = {}): Emitter<E> {
  const { maxListeners = 10 } = options;
  const listeners = new Map<keyof E, Set<Listener<unknown>>>();
  const anyListeners = new Set<AnyListener<E>>();

  function getListeners(event: keyof E): Set<Listener<unknown>> {
    let set = listeners.get(event);
    if (!set) {
      set = new Set();
      listeners.set(event, set);
    }
    return set;
  }

  function on<K extends keyof E>(event: K, listener: Listener<E[K]>): () => void {
    const set = getListeners(event);
    set.add(listener as Listener<unknown>);

    if (maxListeners > 0 && set.size > maxListeners) {
      console.warn(
        `[event-emitter] Possible memory leak: ${set.size} listeners for "${String(event)}" (max: ${maxListeners})`,
      );
    }

    return () => off(event, listener);
  }

  function once<K extends keyof E>(event: K, listener: Listener<E[K]>): () => void {
    const wrapper = ((data: E[K]) => {
      off(event, wrapper as Listener<E[K]>);
      listener(data);
    }) as Listener<E[K]>;
    return on(event, wrapper);
  }

  function off<K extends keyof E>(event: K, listener: Listener<E[K]>): void {
    const set = listeners.get(event);
    if (set) {
      set.delete(listener as Listener<unknown>);
      if (set.size === 0) {
        listeners.delete(event);
      }
    }
  }

  function emit<K extends keyof E>(event: K, data: E[K]): void {
    const set = listeners.get(event);
    if (set) {
      for (const listener of [...set]) {
        listener(data);
      }
    }
    for (const listener of [...anyListeners]) {
      listener(event, data);
    }
  }

  function waitFor<K extends keyof E>(event: K): Promise<E[K]> {
    return new Promise<E[K]>((resolve) => {
      once(event, resolve);
    });
  }

  function onAny(listener: AnyListener<E>): () => void {
    anyListeners.add(listener);
    return () => {
      anyListeners.delete(listener);
    };
  }

  function offAll(event?: keyof E): void {
    if (event !== undefined) {
      listeners.delete(event);
    } else {
      listeners.clear();
      anyListeners.clear();
    }
  }

  function listenerCount(event: keyof E): number {
    return listeners.get(event)?.size ?? 0;
  }

  return { on, once, off, emit, waitFor, onAny, offAll, listenerCount };
}
