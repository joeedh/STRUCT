exports.acorn = require("acorn");
exports.walk = require("acorn-walk");


let color = exports.color = function color(str, c) {
  return "\u001b[" + c + "m" + str + "\u001b[0m";
};

let formatLines = (buf) => {
    let i = 1;
    let s = "";

    for (let l of buf.split("\n")) {
        let j = "" + i;
        while (j.length < 4) {
            j = " " + j;
        }

        s += j + ": " + l + "\n";
    }

    return s;
}

let cache = {};
exports.eval = function(buf, scope={}) {
    let acorn = exports.acorn, walk = exports.walk;

    let stack = [];
    let startstate = {stack : stack, scope : scope};

    scope["undefined"] = undefined;
    scope["null"] = null;

    let node;
    if (buf in cache) {
        node = cache[buf];
    } else {
        node = acorn.parse(buf);
    }

    let scopePush = (state, scope={}) => {
        let ret = {
            stack : state.stack,
            scope : Object.assign({}, state.scope)
        };
        for (let k in scope) {
            ret.scope[k] = scope[k];
        }
        return ret;
    };


    let nodeIs= (n, type) => {
        return n && typeof n === 'object' && n.type === type;
    }

    let walkers = {
        ThisExpression(n, state, visit) {
          state.stack.push(state.scope["this"]);
        },

        VariableDeclaration(n, state, visit) {
            for (let d of n.declarations) {
                let name = d.id.name;

                visit(d.init, state);

                state.scope[name] = state.stack.pop();
            }
        },

        MemberExpression(n, state, visit) {
            visit(n.object, state);
            let a = state.stack.pop();

            if (nodeIs(a, "Identifier")) {
                a = state.scope[a.name];
            }

            state.scope["this"] = a;

            visit(n.property, state);
            let b = state.stack.pop();

            if (nodeIs(b, "Identifier")) {
                b = b.name;
            } else if (nodeIs(b, "Literal")) {
                b = b.value;
            }

            a = a[b];
            state.stack.push(a);
        },

        FunctionExpression(n, state, visit) {
            let args = [];

            let state2 = scopePush(state);
            state2.stack = [];
            
            for (let arg of n.params) {
                arg = arg.name;
                args.push(arg);
            }

            function func() {
              //state2.scope = Object.assign({}, state2.scope);
              for (let i = 0; i < args.length; i++) {
                state2.scope[args[i]] = arguments[i];
              }

              //console.log("================", this)
              state2.scope["this"] = this;

              visit(n.body, state2);
              let ret = state2.stack.pop();

              //*
              if (_nGlobal.DEBUG && _nGlobal.DEBUG.tinyeval) {
                var func;
                func = eval(buf);
                let ret2 = func.apply(this, arguments);

                console.log("result:", ret, "should be", ret2, color(buf, 32));
                //*/
              }
              return ret;
            };

            state.stack.push(func);
        },
        CallExpression(n, state, visit) {
            state = scopePush(state);
            visit(n.callee, state);

            let func = state.stack.pop();
            
            let args = [];

            for (let arg of n.arguments) {
                visit(arg, state);
                let val = this._getValue(state.stack.pop(), state);
                args.push(val);
            }

            let thisvar = state.scope["this"];
            stack.push(func.apply(thisvar, args));
            //console.log(func, Reflect.ownKeys(state.scope), state.scope["this"], "::")
        },

        Literal(n, state, visit) {
            state.stack.push(n);
        },

        _getValue(n, state) {
            if (n === undefined || n === null) {
                return n;
            }

            if (nodeIs(n, "Identifier")) {
                if (!(n.name in state.scope)) {
                    console.log(buf);
                    throw new Error(n.name + " is not defined");
                }
                return state.scope[n.name];
            }
            if (nodeIs(n, "Literal")) {
                return n.value;
            }

            return n;
        },

        BinaryExpression (n, state, visit) {
            //console.log(n.operator);
            visit(n.left, state);
            let a = state.stack.pop();
            a = this._getValue(a, state);

            visit(n.right, state);
            let b = state.stack.pop();
            b = this._getValue(b, state);
            
            switch (n.operator) {
                case "+":
                    if (typeof a === "string" || typeof b === "string") {
                        stack.push(""+a+b);
                        break;
                    }

                    stack.push(a+b);
                    break;
                case "-":
                    stack.push(a-b);
                    break;
                case "/":
                    stack.push(a/b);
                    break;
                case "*":
                    stack.push(a*b);
                    break;
                case "**":
                    stack.push(a**b);
                    break;
                case ">":
                    stack.push(a>b);
                    break;
                case "<":
                    stack.push(a<b);
                    break;
                case ">=":
                    stack.push(a>=b);
                    break;
                case "<=":
                    stack.push(a<=b);
                    break;
                case "==":
                    stack.push(a==b);
                    break;
                case "===":
                    stack.push(a===b);
                    break;
                case "!=":
                    stack.push(a!=b);
                    break;
                case "!==":
                    stack.push(a!==b);
                    break;
                case "%":
                    stack.push(a%b);
                    break;
                case "^":
                    stack.push(a^b);
                    break;
                case "&":
                    stack.push(a&b);
                    break;
                case "|":
                    stack.push(a|b);
                    break;
                case "<<":
                    stack.push(a<<b);
                    break;
                case ">>":
                    stack.push(a>>b);
                    break;
                case ">>>":
                    stack.push(a>>>b);
                    break;
                case "instanceof":
                    stack.push(a instanceof b);
                    break;
            }
        },

        UnaryExpression (n, state, visit) {
            visit(n.argument, state);
            let val = this._getValue(state.stack.pop(), state);
            
            switch (n.operator) {
                case "!":
                    val = !val;
                    break;
                case "~":
                    val = ~val;
                    break;
                case "-":
                    val = -val;
                    break;
                case "+":
                    val = +val;
                    break;
                case "delete":
                    delete state.scope["this"][val];
                    return;
                case "typeof":
                    val = typeof val;
                    break;
            }

            state.stack.push(val);
        },
        ConditionalExpression (n, state, visit) {
            visit(n.test, state);
            let val = state.stack.pop();

            if (val) {
                visit(n.consequent, state);
            } else {
                visit(n.alternate, state);
            }

            let v = state.stack.pop();
            v = this._getValue(v, state);
            
            state.stack.push(v);
        },
        LogicalExpression(n, state, visit) {
          visit(n.left, state);
          let a = this._getValue(state.stack.pop(), state);
          
          visit(n.right, state);
          let b = this._getValue(state.stack.pop(), state);  

          switch (n.operator) {
              case "||":
                  state.stack.push(a || b);
                 break;
              case "&&":
                  state.stack.push(a && b);
                  break;
          }
        },
        Identifier(n, state, visit) {
            state.stack.push(n);
        }
    };
    for (let k in walk.base) {
        if (!(k in walkers)) {
            walkers[k] = walk.base[k];
        }
    }

    try {
        walk.recursive(node, startstate, walkers);
    } catch (error) {
        console.log(formatLines(buf))
        console.log(error.message);
    }

    if (stack[0]) {
      stack[0] = walkers._getValue(stack[0], startstate);
    }

    //console.log("final result", stack[0]);
    return stack[0];
}

function test() {
    let a = {b : {c : {d : (e) => [1+e, 2, 3]}}}
    let t = 0.3;
    console.log(a && a.y ? 1 : -1);
    "a.b.c.d(t)[0] + 1 + t"
    let fn = exports.eval(`
    a = function(a, b){
        return a && a.y ? 1 : -1;
    }
    `, {a : a, t : t});

    console.log(fn({y : 1}))
}
