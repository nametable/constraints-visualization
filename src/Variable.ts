import { v4 as uuidv4 } from 'uuid';
import { Stack } from 'stack-typescript';

/**
 * Var is a contrained variable
 * @public
 */
export class Var<T extends Primitive>
{
    /**
     * Creates a new Constrained Variable given a value or function
     * 
     * @param value A `Primitive` or function to evaluate
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

    /** 
     * Set's isValid to false and invalidates dependants
     **/
    private invalidate(): void {
        this.isValid = false;
        this.dependants.forEach(variable => {
            if (variable.isValid) {
                variable.invalidate();
            }
        });
        this.dependants = [];
    } 

    /**
     * Gets the value of the Constrained Variable
     * 
     * @returns the current value of the Constrained Variable, calculated if necessary
     * @remarks will forces variable to compute value if `isInvalid == false`
     */
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

    /**
     * Sets the value or evaluation function for the Constrained Variable
     * 
     * @param value A `Primitive` or function (constraint)
     */
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

/**
 * Values to be stored by the constrained variable
 */
export type Primitive = string | number | boolean | bigint | symbol
/**
 * A function which can be stored by a constrained variable to compute its value
 */
export type Constraint<T> = () => T