import { Var } from "./Variable"
import { VariableContainer } from "./VariableContainer"

export const ContainedVarProxyHandler = (container: VariableContainer) => {
    const handler: ProxyHandler<typeof Var> = {
        construct: (target, argArray, newTarget) => {
            console.log(`Creating new Constrained Variable with value ${argArray[0]}`)
            const varObj = new target(argArray[0])
            const varObjProxy = new Proxy(varObj, {
                // apply: (target, thisArg, argArray) => {
                // // console.log(`Apply: ${target}, ${thisArg}, ${argArray}`)
                // },
            
                get: (targetVar, prop, receiver) => {
                    // console.log(`Get: ${target}, ${String(prop)}`)
                    
                    const property = (targetVar as any)[prop]
                    if (typeof property === 'function') {
                        return new Proxy(property, {
                            apply: (target, thisArg, argArray) => {
                                // console.log(`Apply: ${target}, ${argArray}`)
                                // const retVal = target.apply(thisArg, argArray)
                                const retVal = Reflect.apply(target, receiver, argArray)
                                // const retVal = receiver[prop](...argArray)
                                container.snapshot(`After ${String(prop)}${argArray}`)
                                // container.setIndex(container.length - 1)
                                console.log(container.getSnapshot(container.length - 1))
                                return retVal
                            }
                        })
                        // return function(this: any, ...argArray: any[]) {
                        //     // console.log(`Apply: ${target}, ${argArray}`)
                        //     // const retVal = target.apply(thisArg, argArray)
                        //     console.log(this)
                        //     const retVal = property.apply(this, argArray)
                        //     // const retVal = receiver[prop](...argArray)
                        //     container.snapshot(`After ${String(prop)}${argArray}`)
                        //     container.setIndex(container.length - 1)
                        //     console.log(container.getSnapshot())
                        //     return retVal
                        // }
                    }
            
                    return property
                }
            })
            container.add(varObj)
            return varObjProxy
        },
    }

    return handler
}

