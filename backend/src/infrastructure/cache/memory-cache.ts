// 内存缓存（带 TTL + LRU）
type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  constructor(
    private readonly ttlMs: number = 60_000,
    private readonly maxSize: number = 1000
  ) {}

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    // LRU: 重新插入到队尾
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    if (this.store.size >= this.maxSize) {
      // 删最久未使用
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.ttlMs),
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}
