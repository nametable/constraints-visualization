import { Var as OrigVar } from '../src/Variable'
var assert = require('assert');
import { expect } from 'chai';
import { VariableContainer } from '../src/VariableContainer';
import { ContainedVarProxyHandler } from '../src/ContainedVarProxyHandler';

const container: VariableContainer = new VariableContainer();
const handler = ContainedVarProxyHandler(container, () => {})
const Var = new Proxy(OrigVar, handler);


describe("Var getter should return initial value", () => {
    it("Numeric value", () => {
        let testvar = new Var(5);
        expect(testvar.get()).to.be.equal(5);
    })
    it("String value", () => {
        let teststringvar = new Var("string");
        expect(teststringvar.get()).to.be.equal("string");
    })
})

describe("Var setter should set new value", () => {
    it("After setting Var to 1111, get should return 1111", () => {
        let testvar = new Var<any>(0);
        testvar.set(1111);
        expect(testvar).to.be.not.undefined;
        expect(testvar.get()).to.be.equal(1111);
    })
})

describe("Var should have valid value initially (primitive)", () => {
    it("Var has true isValid after construction", () => {
        expect((new Var(5))['isValid']).is.true
    })
})

describe("Var should have invalid value initially (function)", () => {
    it("Var has false isValid after construction", () => {
        expect((new Var(() => {return 5;}))['isValid']).is.not.true
    })
})
