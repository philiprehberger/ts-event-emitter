# Changelog

## 0.3.3

- Add Development section to README
- Fix CI badge to reference publish.yml

## 0.3.0
- Add error isolation in `emit()` — one throwing listener no longer prevents subsequent listeners from executing; errors are collected and re-thrown as `AggregateError`
- Add `onceAny()` method for one-time wildcard listeners
- Add `eventNames()` method to list events with registered listeners

## 0.2.3

- Fix npm package name references in README

## 0.2.2

- Fix npm package name (restore original name without ts- prefix)

## 0.2.1

- Update repository URLs to new ts-prefixed GitHub repo

## 0.2.0

- Add comprehensive test suite (14 tests covering on/off/once/emit, waitFor, onAny, offAll, listenerCount)
- Add CI workflow for push/PR testing
- Add test step to publish workflow
- Add API reference table to README

## 0.1.0
- Initial release
