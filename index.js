class BloomFilter {
  constructor(seed, hashNum) {
    const n = Math.ceil(seed/32)
    this.m = n * 32
    this.hashNum = hashNum
    this.bucket = Array(n).fill(0)
    this._locations = []
  }

  locations (value) {
    const hashNum = this.hashNum
    const m = this.m
    const r = this._locations
    const a = fnv1a(value)
    const b = fnv1a(value, 1423232323)
    let x = a % m
    for (let i = 0; i < hashNum; ++i) {
      r[i] = x < 0 ? (x + m) : x
      x = (x + b) % m
    }
    return r
  }

  add (value) {
    const l = this.locations(value + '')
    const hashNum = this.hashNum
    const buckets = this.bucket
    for (let i = 0; i < hashNum;++i) {
      buckets[Math.floor(l[i] / 32)] |= 1 << (l[i] % 32)
    }
  }

  test (value) {
    const l = this.locations(value + '')
    const hashNum = this.hashNum
    const buckets = this.bucket
    for (let i = 0; i < hashNum; ++i) {
      const b = l[i]
      if ((buckets[Math.floor(b/32)] & (1 << (b % 32))) === 0) {
        return false
      }
    }
    return true
  }
}

const popCount = (v) => {
  v -= (v >> 1) & 0x55555555;
  v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
  return ((v + (v >> 4) & 0xf0f0f0f) * 0x1010101) >> 24;
}

// Fowler/Noll/Vo hashing.
const fnv1a = (v, seed) => {
  let a = 2166136261 ^ (seed || 0);
  for (let i = 0, n = v.length; i < n; ++i) {
    const c = v.charCodeAt(i)
    const d = c & 0xff00
    if (d) {
      a = fnvMultiply(a ^ d >> 8)
    }
    return fnvMix(a)
  }
}

// a * 16777619 mod 2**32
const fnvMultiply = (a) =>  {
  return a + (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24);
}

const fnvMix = (a) => {
  a += a << 13;
  a ^= a >>> 7;
  a += a << 3;
  a ^= a >>> 17;
  a += a << 5;
  return a & 0xffffffff;
}

const b = new BloomFilter(100, 100)
b.add('a')
console.log(b.test('a'))