module lib {
  export function dictmap<T, U>(
    src: Dict<T>,
    map: (t: T, key: number) => U,
    trg?: Dict<U>,
    keymap?: (t: T, key: number, u: U) => any
  )
    : Dict<U>
  {
    if (!trg) {
      trg = {};
    }

    if (!keymap) {
      keymap = (t: T, key: number, u: U) => key;
    }

    var key: string,
        val: U;

    for (key in src) {
      if (src.hasOwnProperty(key)) {
        val = map(src[key], +key);
        trg[keymap(src[key], +key, val)] = val;
      }
    }

    return trg;
  }
}
