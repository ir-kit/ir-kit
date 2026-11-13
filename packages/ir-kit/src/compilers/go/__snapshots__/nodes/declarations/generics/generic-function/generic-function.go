package main

func lookup[K comparable, V any](m map[K]V, key K) V {
	return m[key]
}
