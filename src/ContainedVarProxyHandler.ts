import { Var } from "./Variable"
import { VariableContainer } from "./VariableContainer"

/**
 * This function returns a Javascript Proxy handler for proxying a constrained variable `Var`
 * It will handle taking snapshots when changes are made to constrained variables through the proxy
 * 
 * @param container The container in which the proxy should place new variables or take snapshots in
 * @param callback A callback for when the proxy takes a snapshot of state
 * @returns A handler for a Javascript Proxy
 */
export const ContainedVarProxyHandler = (container: VariableContainer, callback: (container: VariableContainer) => void) => {
    
    const takeSnapshot = (description: string) => {
        container.snapshot(description)
        callback(container)
    }
    
    const handler: ProxyHandler<typeof Var> = {
        construct: (target, argArray, newTarget) => {
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
                                // const retVal = target.apply(receiver, argArray)
                                const retVal = Reflect.apply(target, receiver, argArray)
                                takeSnapshot(`After ${String(prop)}${JSON.stringify(argArray)}`)

                                return retVal
                            }
                        })
                    }
            
                    return property
                }
            })
            container.add(varObj)
            takeSnapshot(`After new with value ${argArray[0]}`)
            return varObjProxy
        },
    }

    return handler
}

