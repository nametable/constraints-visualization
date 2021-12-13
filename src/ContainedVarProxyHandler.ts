import { Var } from "./Variable"
import { VariableContainer } from "./VariableContainer"

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

