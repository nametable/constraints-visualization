export abstract class BaseConstraint<T> {
    abstract get(): Readonly<T>
    abstract invalidate(): void
}

export class Var<T> extends BaseConstraint<T> {
    constructor(value: T)
    set(value: T): void
    // Readonly will keep you from directly modifying mutable objects, but its not actually a "deep" readonly
    // so we still need to document that mutation doesn't work.
    get(): Readonly<T>
    invalidate(): void
}

export class Constraint<T> extends BaseConstraint<T> {
    constructor(constraint: () => T)
    set(constraint: () => T): void
    get(): Readonly<T>
    invalidate(): void
}