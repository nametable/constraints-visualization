import { Var as OrigVar, Constraint, Primitive } from "../src/Variable"
import { expect } from 'chai';
import { VariableContainer } from "../src/VariableContainer";
import { ContainedVarProxyHandler } from "../src/ContainedVarProxyHandler";

const container: VariableContainer = new VariableContainer();
const handler = ContainedVarProxyHandler(container, () => {})
const Var = new Proxy(OrigVar, handler);
type Var<T extends Primitive> = OrigVar<T>;

describe('Test Constraints Var', () => {
    it('Get/set literal', () => {
        let v1 = new Var<number>(1)
        expect(v1.get()).to.equal(1)
        v1.set(2)
        expect(v1.get()).to.equal(2)

        let v2 = new Var<string>("A")
        expect(v2.get()).to.equal("A")
        v2.set("B")
        expect(v2.get()).to.equal("B")
    });

    it('Get/set constraint', () => {
        let v1 = new Var<number>(() => 5)
        expect(v1.get()).to.equal(5)
        v1.set(() => 4)
        expect(v1.get()).to.equal(4)
    });

    it('Change value to constraint', () => {
        let v1 = new Var<string>("A")
        expect(v1.get()).to.equal("A")
        v1.set(() => "B")
        expect(v1.get()).to.equal("B")
    });

    it('Change constraint to value', () => {
        let v1 = new Var<boolean>(() => true)
        expect(v1.get()).to.equal(true)
        v1.set(false)
        expect(v1.get()).to.equal(false)
    });

    it('Basic dependency', () => {
        let a = new Var<number>(1)
        let b = new Var<number>(2)
        let c = new Var(() => a.get() + b.get())

        expect(c.get()).to.equal(3)

        a.set(5)
        expect(c.get()).to.equal(7)
    });


    it('Is lazy', () => {
        let a = new Var<string>("A")
        let b = new Var<string>("B")
        let computed = false
        let c = new Var(() => {
            computed = true
            return a.get() + b.get()
        })
        
        expect(computed).to.be.false
        expect(c.get()).to.equal("AB")
        expect(computed).to.be.true
        computed = false

        expect(c.get()).to.equal("AB")
        expect(computed).to.be.false // not computed again

        a.set("B")
        expect(computed).to.be.false // doesn't get computed on set
        expect(c.get()).to.equal("BB")
        expect(computed).to.be.true // no it should have been computed
    });

    it('Box', () => {     
        function Box(left: Var<number>, top: Var<number>, width: Var<number>, height: Var<number>) {
            return {
                left, top, width, height,
                right: new Var(() => left.get() + width.get()),
                bottom: new Var(() => top.get() + height.get()),
            }
        }
        
        let b1 = Box(new Var<number>(10), new Var<number>(15), new Var<number>(20), new Var<number>(25))
        expect(b1.right.get()).to.equal(30)
        expect(b1.bottom.get()).to.equal(40)

        b1.left.set(20)
        expect(b1.right.get()).to.equal(40)
        expect(b1.bottom.get()).to.equal(40)

        let b2 = Box(new Var(() => b1.right.get() + 10), b1.top, new Var<number>(10), new Var<number>(10))

        expect(b1.right.get()).to.equal(40) // hasn't changed
        expect(b1.bottom.get()).to.equal(40) // hasn't changed
        expect(b2.right.get()).to.equal(60)
        expect(b2.bottom.get()).to.equal(25)

        b1.top.set(100)
        expect(b1.bottom.get()).to.equal(125)
        expect(b2.bottom.get()).to.equal(110)
    });

    it('Dependents', () => {       
        let calc: number[] = []

        let a = new Var<number>(10)
        let a1 = new Var(() => {calc.push(1); return a.get() + 1})
        let a2 = new Var(() => {calc.push(2); return a.get() + 2})
        let a3 = new Var(() => {calc.push(3); return a.get() + 3})

        a.set(20)
        expect(calc).to.be.empty

        expect(a1.get()).to.equal(21)
        expect(calc).to.eql([1])

        expect(a2.get()).to.equal(22)
        expect(calc).to.eql([1, 2])

        expect(a3.get()).to.equal(23)
        expect(calc).to.eql([1, 2, 3])
    });

    it('Bad constraint', () => {       
        let a = new Var<number>(1)

        let aVal = a.get()
        let b = new Var(() => aVal + 1)

        a.set(10)
        expect(b.get()).to.equal(2) // Doesn't update reactively because we called get outside of the callback
    });

    // it('Errors in calculation', () => {
    //     let a = new Var<number>(0)
    //     let b = new Var(() => {
    //         if (a.get() == 0) throw Error("BOOM!")
    //         else return a.get() + 1
    //     })

    //     expect(() => b.get()).to.throw("BOOM!")
    //     expect(() => b.get()).to.throw("BOOM!") // should rethrow

    //     a.set(1)
    //     expect(b.get()).to.equal(2) // works now that the error has cleared up

    //     a.set(0)
    //     expect(() => b.get()).to.throw("BOOM!")
    //     b.set(() => a.get() + 1)
    //     expect(b.get()).to.equal(1)
    // })

    // it("Errors are still lazy", () => {
    //     let computed: string[] = []
    //     let b = new Var<number>(() => {
    //         computed.push("b")
    //         throw Error("BOOM!")
    //     })

    //     expect(() => b.get()).to.throw("BOOM!")
    //     expect(computed).to.deep.equal(["b"])
    //     expect(() => b.get()).to.throw("BOOM!") // should rethrow
    //     expect(computed).to.deep.equal(["b"]) // but not recalculate
    // })

    // it('Errors throw non Error ', () => {
    //     let a = new Var(() => {throw "BOOM!"})
    //     let b = new Var(() => {throw null})
    //     let c = new Var(() => {throw undefined})

    //     expect(() => a.get()).to.throw().which.equals("BOOM!")
    //     // chai doesn't work on falsy errors
    //     try { b.get() } catch (error) { expect(error).to.equal(null) }
    //     try { c.get() } catch (error) { expect(error).to.equal(undefined) }
    // })

    // it('Direct circular dependency', () => {
    //     let a = new Var<number>(1)
    //     a.set(() => a.get() + 1)

    //     expect(() => a.get()).to.throw("Circular dependency")
    // })

    // it('Indirect circular dependency', () => {
    //     let a = new Var<number>(1)
    //     let b = new Var(() => a.get() + 1)
    //     a.set(() => b.get() + 1)

    //     expect(() => a.get()).to.throw("Circular dependency")
    // })
});
