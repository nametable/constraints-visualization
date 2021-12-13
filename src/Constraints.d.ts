// let a = new Var(3)
// let b = new Var(() => a.get() + 1)
export class Var<T extends Primitive> {
    constructor(value: T | Constraint<T>)
    get(): T
    set(value: T | Constraint<T>): void
}

export type Primitive = string | number | boolean | bigint | symbol
export type Constraint<T> = () => T