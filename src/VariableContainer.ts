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

export class VariableContainer {
    constructor() {
        this.index = 0
        return
    }

    private index: number;
    private variables: Var<Primitive>[] = [];
    private snapshots: VarSnapshot[] = [];


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

    public add = (variable: Var<Primitive>): void => {
        this.variables.push(variable)
    }

    public getVars = (): Var<Primitive>[] => {
        return this.variables
    }

    public getSnapshot = (index: number) => {
        return this.snapshots[index]
    }

    // public setIndex = (index: number) => {
    //     this.index = index
    // }

    // public getIndex = (): number => {
    //     return this.index
    // }

    public get length() {
        return this.snapshots.length
    }

}