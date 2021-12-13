import { Var, Primitive } from "./Variable"

class SimpleVar {
    public id: string = ''
    public value?:any;
    public isValid: boolean = false;
    public dependants: string[] = [];
}

interface SimpleLink {
    src: string
    dst: string
}

class VarSnapshot {
    public description?: string
    public vars: SimpleVar[] = []
    public links: SimpleLink[] = []
}

/**
 * This class is a tool for storing the current Constrained Variable system
 * state and snapshots of the systems state. It allows for retrieval of
 * specific states for the purposes or representing them in
 * visualizations.
 * @public
 * @example
 * ```typescript
 * const container = new VariableContainer()
 * container.add(new Var(77))
 * container.snapshot("Just added a var with value of 77")
 * const snapshot = container.getSnapshot(container.length - 1)
 * ```
 */
export class VariableContainer {
    
    /**
     * Creates a new `VariableContainer` object for storing Constrained Variables
     * @returns 
     */
    constructor() {
        this.index = 0
        return
    }

    private index: number;
    private variables: Var<Primitive>[] = [];
    private snapshots: VarSnapshot[] = [];

    /**
     * Takes a snapshot of the current Constrained Variable system state
     * if the last state is different than the current state.
     * 
     * @param description A description or name of the current state to be saved
     * @returns void
     */
    public snapshot = (description: string) => {
        let newSnapshot: VarSnapshot = new VarSnapshot()
        this.variables.forEach(variable => {
            newSnapshot.vars.push({
                id: variable['id'],
                value: variable['value'],
                isValid: variable['isValid'],
                dependants: variable['dependants'].map(variable => variable['id']),
            })
            variable['dependants'].forEach(dependant => {
                newSnapshot.links.push({
                    src: variable['id'],
                    dst: dependant['id']
                })
            })
        })
        const {links, vars} = newSnapshot
        const newStr = JSON.stringify({links, vars})
        const oldSnapshot = this.getSnapshot(this.length - 1)
        console.log(oldSnapshot)
        if (oldSnapshot) {
            const oldStr = JSON.stringify({links: oldSnapshot.links, vars: oldSnapshot.vars})
            if (oldStr === newStr) {
                console.log("Found duplicate snapshot")
                return
            }
        }
        newSnapshot.description = description
        this.snapshots.push(newSnapshot)
    }

    /**
     * Adds a constrained variable for tracking
     * 
     * @param variable a `Var<Primitive>` constrained variable to add to the system for tracking
     */
    public add = (variable: Var<Primitive>): void => {
        this.variables.push(variable)
    }

    /**
     * Gets the array of tracked constrained variables in the system
     * @returns `Var<Primitive>[]` array of variables
     */
    public getVars = (): Var<Primitive>[] => {
        return this.variables
    }

    /**
     * Gets one of the `VariableContainer`s snapshots by index
     * @param index number representing which snapshot to get
     * @returns `VarSnapshot` an object with vars, links, and a description
     */
    public getSnapshot = (index: number) => {
        return this.snapshots[index]
    }

    /**
     * Gets the current number of snapshots being stored
     * @returns number of snapshots
     */
    public get length() {
        return this.snapshots.length
    }

}