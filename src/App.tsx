import { useEffect, useState } from 'react'
import logo from './logo.svg'
import './App.css'
import Graph from './components/Graph'
import { ContainedVarProxyHandler } from "./ContainedVarProxyHandler";
import { VariableContainer } from "./VariableContainer"
import { Var as OrigVar, Primitive } from "./Variable"
type Var<T extends Primitive> = OrigVar<T>;

// c.get()
// e.get()
// const d = new Var(() => { return "test " + e.get().toString() })
// d.get()
// a.set(11)

const initialContainer: VariableContainer = new VariableContainer();
initialContainer.snapshot("Start")

function App() {

  useEffect(() => {
    const handler = ContainedVarProxyHandler(initialContainer, (container) => {
      setContainer(container)
      setStep(container.length - 1)
    })

    const Var = new Proxy(OrigVar, handler);
    const a = new Var<number>(6)
    const b = new Var(3)
    const c = new Var(() => { return a.get() + 7 })
    const e = new Var(() => { return b.get() * c.get() })
    e.get();
    (window as any)['Var'] = Var;

  }, [])
  
  const [container, setContainer] = useState(initialContainer)
  const [step, setStep] = useState(container.length - 1)

  return (
    <div className="App">
      {/* <header className="App-header">
      </header> */}
      <Graph container={container} index={step}></Graph>
      <div style={{width: "100%"}}>
        <input 
          type="number" 
          value={step} 
          min={0}
          max={container.length - 1}
          onChange={(evt) => {setStep(parseInt(evt.target.value))}}
        >
        </input>
        <input 
          type="range" 
          value={step}
          max={container.length - 1}
          onChange={(evt) => {setStep(parseInt(evt.target.value))}}
        >
        </input>
      </div>
    </div>
  )
}

export default App
