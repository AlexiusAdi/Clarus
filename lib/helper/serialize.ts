import { Decimal } from "@prisma/client/runtime/client";

type Serialized<T> = T extends Decimal
  ? number
  : T extends Date
    ? Date
    : T extends object
      ? { [K in keyof T]: Serialized<T[K]> }
      : T;

export function serialize<T>(data: T): Serialized<T> {
  if (data instanceof Decimal) return data.toNumber() as Serialized<T>;
  if (data instanceof Date) return data as Serialized<T>;
  if (Array.isArray(data)) return data.map(serialize) as Serialized<T>;
  if (data !== null && typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, serialize(v)]),
    ) as Serialized<T>;
  }
  return data as Serialized<T>;
}
