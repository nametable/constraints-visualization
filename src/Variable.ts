import { v4 as uuidv4 } from 'uuid';
import { Stack } from 'stack-typescript';

/**
 * Var is a contrained variable
 * @public
 */
export class Var<T extends Primitive>
{
    /**
     * 
     * @param value 
     */
    constructor(value: T | Constraint<T>) {
        this.set(value)
    }

    private static stack = new Stack<Var<any>>();

    private id: string = uuidv4();
    private value?:T;
    private isValid: boolean = false;
    private eval?: Constraint<T>;
    private dependants: Var<Primitive>[] = [];

    private invalidate(): void {
        this.isValid = false;
        this.dependants.forEach(variable => {
            if (variable.isValid) {
                variable.invalidate();
            }
        });
        this.dependants = [];
    } 

    public get(): T {
        if(Var.stack.length) {
            this.dependants.push(Var.stack.top);
        }
        if(!this.isValid) {
            this.isValid = true;
            Var.stack.push(this);
            this.value = this.eval!();
            Var.stack.pop();
        }
        return this.value!
    }
    public set(value: T | Constraint<T>): void {
        if(typeof value === 'function') {
            this.eval = value;
            this.isValid = false;
        } else {
            this.value = value;
            this.eval = () => value;
            this.isValid = true;
        }
        this.dependants.forEach(variable => {
            if (variable.isValid) {
                variable.invalidate();
            }
        });
        this.dependants = [];
    }
}

export type Primitive = string | number | boolean | bigint | symbol
export type Constraint<T> = () => T