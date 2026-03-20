import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const { createEmitter } = await import('../../dist/index.js');

describe('createEmitter', () => {
  it('creates an emitter with all methods', () => {
    const emitter = createEmitter();
    assert.equal(typeof emitter.on, 'function');
    assert.equal(typeof emitter.once, 'function');
    assert.equal(typeof emitter.off, 'function');
    assert.equal(typeof emitter.emit, 'function');
    assert.equal(typeof emitter.waitFor, 'function');
    assert.equal(typeof emitter.onAny, 'function');
    assert.equal(typeof emitter.offAll, 'function');
    assert.equal(typeof emitter.listenerCount, 'function');
  });
});

describe('on / emit', () => {
  it('listener receives emitted data', () => {
    const emitter = createEmitter();
    let received = null;
    emitter.on('test', (data) => { received = data; });
    emitter.emit('test', 'hello');
    assert.equal(received, 'hello');
  });

  it('multiple listeners fire in order', () => {
    const emitter = createEmitter();
    const order = [];
    emitter.on('test', () => order.push(1));
    emitter.on('test', () => order.push(2));
    emitter.emit('test', null);
    assert.deepEqual(order, [1, 2]);
  });

  it('emitting event with no listeners does not throw', () => {
    const emitter = createEmitter();
    assert.doesNotThrow(() => emitter.emit('nope', null));
  });

  it('on() returns unsubscribe function', () => {
    const emitter = createEmitter();
    let count = 0;
    const unsub = emitter.on('test', () => { count++; });
    emitter.emit('test', null);
    unsub();
    emitter.emit('test', null);
    assert.equal(count, 1);
  });
});

describe('once', () => {
  it('fires only once', () => {
    const emitter = createEmitter();
    let count = 0;
    emitter.once('test', () => { count++; });
    emitter.emit('test', null);
    emitter.emit('test', null);
    assert.equal(count, 1);
  });
});

describe('off', () => {
  it('removes a specific listener', () => {
    const emitter = createEmitter();
    let count = 0;
    const handler = () => { count++; };
    emitter.on('test', handler);
    emitter.emit('test', null);
    emitter.off('test', handler);
    emitter.emit('test', null);
    assert.equal(count, 1);
  });
});

describe('waitFor', () => {
  it('resolves with emitted data', async () => {
    const emitter = createEmitter();
    const promise = emitter.waitFor('test');
    emitter.emit('test', 42);
    const result = await promise;
    assert.equal(result, 42);
  });
});

describe('onAny (wildcard)', () => {
  it('catches all events', () => {
    const emitter = createEmitter();
    const events = [];
    emitter.onAny((event, data) => events.push({ event, data }));
    emitter.emit('a', 1);
    emitter.emit('b', 2);
    assert.equal(events.length, 2);
    assert.equal(events[0].event, 'a');
    assert.equal(events[1].data, 2);
  });

  it('returns unsubscribe function', () => {
    const emitter = createEmitter();
    let count = 0;
    const unsub = emitter.onAny(() => { count++; });
    emitter.emit('test', null);
    unsub();
    emitter.emit('test', null);
    assert.equal(count, 1);
  });
});

describe('offAll', () => {
  it('removes all listeners for a specific event', () => {
    const emitter = createEmitter();
    let count = 0;
    emitter.on('test', () => { count++; });
    emitter.on('test', () => { count++; });
    emitter.offAll('test');
    emitter.emit('test', null);
    assert.equal(count, 0);
  });

  it('removes all listeners when called without args', () => {
    const emitter = createEmitter();
    let count = 0;
    emitter.on('a', () => { count++; });
    emitter.on('b', () => { count++; });
    emitter.onAny(() => { count++; });
    emitter.offAll();
    emitter.emit('a', null);
    emitter.emit('b', null);
    assert.equal(count, 0);
  });
});

describe('listenerCount', () => {
  it('returns correct count', () => {
    const emitter = createEmitter();
    assert.equal(emitter.listenerCount('test'), 0);
    emitter.on('test', () => {});
    assert.equal(emitter.listenerCount('test'), 1);
    emitter.on('test', () => {});
    assert.equal(emitter.listenerCount('test'), 2);
  });

  it('decrements after off', () => {
    const emitter = createEmitter();
    const handler = () => {};
    emitter.on('test', handler);
    assert.equal(emitter.listenerCount('test'), 1);
    emitter.off('test', handler);
    assert.equal(emitter.listenerCount('test'), 0);
  });
});
