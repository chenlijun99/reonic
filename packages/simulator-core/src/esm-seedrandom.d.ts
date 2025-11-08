declare module 'esm-seedrandom' {
  type PRNG = () => number;

  export function prng_arc4(
    seed?: number | string | object,
    options?: object,
  ): PRNG;
}
