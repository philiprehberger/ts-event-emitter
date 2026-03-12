# @philiprehberger/event-emitter

Tiny, fully type-safe event emitter for Node, browser, and edge runtimes.

## Installation

```bash
npm install @philiprehberger/event-emitter
```

## Usage

### Basic

```ts
import { createEmitter } from '@philiprehberger/event-emitter';

type Events = {
  'user:login': { userId: string };
  'user:logout': { userId: string; reason?: string };
  'error': Error;
};

const emitter = createEmitter<Events>();

// Fully typed — event names and payloads are autocompleted
emitter.on('user:login', ({ userId }) => {
  console.log(`User ${userId} logged in`);
});
```

### Once / Off

```ts
// Listen once
emitter.once('user:login', ({ userId }) => { /* fires once */ });

// Manual unsubscribe
const off = emitter.on('error', (err) => console.error(err));
off(); // removes listener

// Or use off() directly
const handler = (data) => { /* ... */ };
emitter.on('user:logout', handler);
emitter.off('user:logout', handler);
```

### Wait for Event

```ts
const data = await emitter.waitFor('user:logout');
console.log(data.userId); // typed
```

### Wildcard Listener

```ts
emitter.onAny((event, data) => {
  console.log(`Event: ${String(event)}`, data);
});
```

### Cleanup

```ts
emitter.offAll('user:login'); // remove all listeners for one event
emitter.offAll();             // remove all listeners
```

### Listener Count

```ts
emitter.listenerCount('error'); // number
```

### Options

```ts
const emitter = createEmitter<Events>({
  maxListeners: 20, // warn if exceeded (default: 10)
});
```

## API Reference

### `createEmitter<E extends EventMap>(options?: EmitterOptions): Emitter<E>`

Creates a new type-safe emitter. `E` is a record mapping event names to their payload types.

### `EmitterOptions`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxListeners` | `number` | `10` | Warn in console if exceeded. Set to `0` to disable. |

### `Emitter<E>` Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `on` | `(event, listener) => () => void` | Subscribe. Returns unsubscribe function. |
| `once` | `(event, listener) => () => void` | Subscribe for one emission only. |
| `off` | `(event, listener) => void` | Remove a specific listener. |
| `emit` | `(event, data) => void` | Emit an event to all listeners. |
| `waitFor` | `(event) => Promise<data>` | Returns a promise that resolves on next emission. |
| `onAny` | `(listener) => () => void` | Listen to all events. Listener receives `(event, data)`. |
| `offAll` | `(event?) => void` | Remove all listeners for an event, or all listeners if no event given. |
| `listenerCount` | `(event) => number` | Number of listeners for an event. |

## License

MIT
