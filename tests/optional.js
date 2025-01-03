import * as nstructjs from '../src/structjs.js';

class Test1 {
    static STRUCT = nstructjs.inlineRegister(this, `
        Test1 {
            value: double;
        }    
    `)
    constructor(value = 0) {
        this.value = value
    }
}
class Test2 {
    static STRUCT = nstructjs.inlineRegister(this, `
        Test2 {
            a: optional(Test1);
            b?: Test1;
        }    
    `)
    constructor(a = new Test1(), b = new Test1()) {
        this.a = a
        this.b = b
    }
}

function test_main() {
    const test1a = new Test1(3.23)
    const test1b = new Test1(3.24)
    const test2 = new Test2(test1a, test1b)
    test2.b = undefined

    const json1 = JSON.stringify(nstructjs.writeJSON(test2), undefined, 2)

    const test2b = nstructjs.readJSON(JSON.parse(json1), Test2)
    const json2 = JSON.stringify(nstructjs.writeJSON(test2b), undefined, 2)

    let result = true
    result = result && json1 === json2
    result = result && test2b.b === undefined

    console.log(json1)
    console.log(json2)
    console.log(test2b)
    
    let data1 = []
    nstructjs.writeObject(data1, test2)

    let test2c = nstructjs.readObject(new DataView(new Uint8Array(data1).buffer), Test2)
    const json3 = JSON.stringify(nstructjs.writeJSON(test2c), undefined, 2)
    console.log(json3)
    
    result = result && json3 === json1
    result = result && test2c.b === undefined

    console.log(nstructjs.write_scripts())
    console.log(result ? 'PASSED' : 'FAILED')
    return result ? 0 : -1
}

process.exit(test_main())