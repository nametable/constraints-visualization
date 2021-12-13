import("./Variable").then((variable) => {

})

let a = new Var(5);
let b = new Var(() => {return Number(a.get()) + 2;})
console.log(b.get())