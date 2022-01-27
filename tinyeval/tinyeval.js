import * as acorn1 from "acorn";
import * as walk1 from "acorn-walk";

/* have to do this weirdness to make rollup happy */
let acorn = acorn1;
let walk = walk1;
acorn = acorn.default ? acorn.default : acorn;
walk = walk.default ? walk.default : walk;

let exports = {acorn, walk};

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

class ReturnException extends Error {}


let cache = {};
exports.eval = function(buf, scope={}) {
    /*
    global.DEBUG = {
      tinyeval : true
    }
    //*/
    let debug = 0//_nGlobal.DEBUG && _nGlobal.DEBUG.tinyeval;


    let stack = [];
    let startstate = {stack : stack, scope : scope};

    if (!("undefined" in scope)) {
        scope["undefined"] = undefined;
    }
    if (!("null" in scope)) {
        scope["null"] = null;
    }

    let node;
    if (buf in cache) {
        node = cache[buf];
    } else {
        node = acorn.parse(buf);
    }

    let scopePush = (state, scope={}) => {
        let ret = {
            stack : state.stack,
            scope : Object.create(state.scope) //Object.assign({}, state.scope)
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
                let name = a.name;
                a = state.scope[name];
            }

            //let state2 = scopePush(state);
            let state2 = state;
            
            state2.scope["this"] = a;
            //console.log("---", a);

            visit(n.property, state);
            let b = state2.stack.pop();
            
            if (nodeIs(b, "Identifier")) {
                if (n.computed) {
                  b = state2.scope[b.name];
                } else {
                  b = b.name;
                }
            } else if (nodeIs(b, "Literal")) {
                b = b.value;
            }

            //console.log("+++", b);

            a = a[b];
            state.stack.push(a);
        },

        ArrowFunctionExpression(n, state, visit) {
          this.FunctionExpression(n, state, visit, true);
        },
        
        FunctionExpression(n, state, visit, useLexThis=false) {
            let args = [];

            let state2 = scopePush(state);
            state2.stack = [];

            for (let arg of n.params) {
                arg = arg.name;
                args.push(arg);
            }

            function func() {
              if (debug) {
              //  console.log(arguments, n.type);
              }
              
              //state2.scope = Object.assign({}, state2.scope);
              for (let i = 0; i < args.length; i++) {
                state2.scope[args[i]] = arguments[i];
              }

              //console.log("================", this)
              if (!useLexThis) {
                state2.scope["this"] = this;
              }
              let this2 = !useLexThis ? this : state2.scope["this"];
              
              if (state2.scope["this"] && state2.scope["this"].constructor.name[0].search(/[PAC]/) <0) {
                //console.log(state2.scope);
                //console.log(state2.scope["this"].constructor)
                //process.exit()
              }
              
              try {
                visit(n.body, state2);
              } catch (error) {
                if (!(error instanceof ReturnException)) {
                  console.log(error.stack);
                  console.log(error);
                  
                  console.log(state2.scope["this"]);
                  throw error;
                }
              }
              
              let ret = state2.stack.pop();

              if (debug) {
                console.log(" RET IN FUNC", ret, state2.stack);
              }

              if (ret && ret.type === "Identifier") {
                ret = state2.scope[ret.name];
              }

              
              /*
              if (_nGlobal.DEBUG && _nGlobal.DEBUG.tinyeval) {
                var func;
                buf = buf.replace(/\bthis\b/g, "this2");
                console.log(buf);
                func = eval(buf);
                
                //console.log(this2);
                let ret2 = func.apply(this2, arguments);

                //console.log("result:", ret, "should be", ret2, color(buf, 32));
              }
              //*/
              return ret;
            };

            state.stack.push(func);
        },
        ObjectExpression(n, state, visit) {
            let ret = {};

            for (let prop of n.properties) {
                let key = prop.key;

                if (!prop.computed) {
                    key = key.name;
                } else {
                    //state.stack.push(key);
                    visit(key, state);
                    key = this._getValue(state.stack.pop(), state);
                }

                visit(prop.value, state);
                let val = this._getValue(state.stack.pop(), state);

                ret[key] = val;
            }

            state.stack.push(ret);
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
            let ret = func.apply(thisvar, args);
            
            if (debug) {
              console.log("  RET", ret, args);
            }

            state.stack.push(ret);
            //console.log("FUNC", n, args);
            //console.log(func, Reflect.ownKeys(state.scope), state.scope["this"], "::")
        },

        ArrayExpression(n, state, visit) {
          let ret = [];
          
          for (let e of n.elements) {
            visit(e, state);
            let val = this._getValue(state.stack.pop(), state);
            
            ret.push(val);
          }
          
          state.stack.push(ret);
        },
        
        ReturnStatement(n, state, visit) {
          if (n.argument) {
            visit(n.argument, state);
          }
          
          throw new ReturnException();
        },

        Literal(n, state, visit) {
            state.stack.push(n.value);
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
    
    //*
    if (debug) {
      walk.full(node, (n) => {
        console.log(n.type);
      });
    }
    //*/
    
    try {
        walk.recursive(node, startstate, walkers);
    } catch (error) {
        console.log(formatLines(buf))
        console.log(error.message);
    }

    if (stack[0]) {
      stack[0] = walkers._getValue(stack[0], startstate);
    }
    
    if (debug) {
      console.log("final result", stack[0]);
    }
    
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

export default exports;
