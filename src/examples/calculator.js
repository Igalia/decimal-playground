import dedent from "dedent";

export const CALCULATOR = {
  title: "In Action: Calculator",
  description: `This example is a small calculator app written in React, which
  uses exact Decimal calculations instead of floating point. It shows how to
  manipulate the DOM from the playground. (React is pre-loaded in the
  playground.)`,
  text: dedent`
  // Make sure to click "Toggle DOM" above
  // to see the app!

  // The React object is pre-loaded;
  // let's put useState in scope
  const { useState } = React;

  function Key({ onClick, children }) {
    const keyStyle = {
      background: "dimgray",
      borderRadius: "50%",
      color: "white",
    };
    return (
      <button style={keyStyle} onClick={onClick}>
        {children}
      </button>
    );
  }

  function Display({ value, inputExponent }) {
    const displayStyle = {
      backgroundColor: "lightgray",
      borderRadius: 5,
      gridColumnEnd: "span 4",
      fontSize: "2em",
      fontFamily: "sans",
      textAlign: "end",
      padding: 5,
    };

    let display;
    if (inputExponent !== 0m) {
      // The display should show a trailing decimal point
      // and trailing zeroes if any have been entered.
      const numZeroes = -Number(inputExponent) - 1;
      display = value.toFixed(numZeroes);
      const isInteger = value % 1m === 0m;
      if (isInteger && numZeroes < 1) {
        display += ".";
      }
    } else {
      display = value.toString();
    }

    return <div style={displayStyle}>{display}</div>;
  }

  function calculate(left, binOp, right) {
    switch (binOp) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        return Decimal.divide(left, right);
      default:
        log("something went wrong");
        return 0;
    }
  }

  function Calc() {
    // Decimal value where we accumulate typed digits
    let [accum, setAccum] = useState(0m);
    // If this is non-zero, the user entered a decimal
    // point, and the value of the next typed digit
    // will be multiplied by 10**inputExponent
    let [inputExponent, setInputExponent] = useState(0m);
    // Pending binary operation
    let [op, setOp] = useState(null);
    // First operand for the pending binary operation
    let [store, setStore] = useState(null);
    // If true, typing another digit will not add that
    // digit to the accumulator, but instead clear the
    // accumulator first. (This happens after typing
    // the = key, or an operator)
    let [nextDigitClears, setNextDigitClears] = useState(false);

    function clear() {
      setAccum(0m);
      setInputExponent(0m);
      setOp(null);
      setStore(null);
      setNextDigitClears(false);
    }

    function appendDigit(digit) {
      if (nextDigitClears) {
        accum = 0m;
        inputExponent = 0m;
      }
      // FIXME: *=, +=, -= operators don't work
      if (inputExponent === 0m) {
        accum = accum * 10m;
        accum = accum + digit;
      } else {
        accum = accum + Math.pow(10m, inputExponent) * digit;
        inputExponent = inputExponent - 1m;
      }
      setAccum(accum);
      setInputExponent(inputExponent);
      setNextDigitClears(false);
    }

    function enterDecimalPoint() {
      if (inputExponent !== 0m) {
        return;
      }
      if (nextDigitClears) {
        setAccum(0m);
        setNextDigitClears(false);
      }
      setInputExponent(-1m);
    }

    function enterOperator(newOp) {
      if (op) {
        accum = calculate(store, op, accum);
        setAccum(accum);
      }
      setStore(accum);
      setOp(newOp);
      setInputExponent(0m);
      setNextDigitClears(true);
    }

    function doOperation() {
      setInputExponent(0m);
      setNextDigitClears(true);
      if (!op) {
        return;
      }
      setAccum(calculate(store, op, accum));
      setOp(null);
      setStore(null);
    }

    function doUnaryOperation(unaryOp) {
      let result;
      switch (unaryOp) {
        case "sqrt":
          // FIXME: shouldn't need to wrap this in Decimal()
          result = Math.pow(Decimal(accum), 0.5m);
          break;
        case "square":
          // FIXME: shouldn't need to wrap this in Decimal()
          result = Math.pow(Decimal(accum), 2m);
          break;
        case "negate":
          result = -1m * accum;
          break;
        default:
          log("something went wrong!");
          result = 0;
      }
      setAccum(result);
      setInputExponent(0m);
      setNextDigitClears(true);
    }

    const gridStyle = {
      columnGap: 10,
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1fr",
      gridTemplateRows: "3fr 2fr 2fr 2fr 2fr 2fr",
      rowGap: 10,
      maxWidth: 190,
      maxHeight: 310,
      justifyItems: "stretch",
    };

    const NumberKey = ({ value }) => (
      <Key onClick={() => appendDigit(value)}>{value.toString()}</Key>
    );

    return (
      <div style={gridStyle}>
        <Display value={accum} inputExponent={inputExponent} />
        <Key onClick={clear}>C</Key>
        <Key onClick={() => doUnaryOperation("sqrt")}>&radic;</Key>
        <Key onClick={() => doUnaryOperation("square")}>x&sup2;</Key>
        <Key onClick={() => enterOperator("/")}>&divide;</Key>
        <NumberKey value={7m} />
        <NumberKey value={8m} />
        <NumberKey value={9m} />
        <Key onClick={() => enterOperator("*")}>&times;</Key>
        <NumberKey value={4m} />
        <NumberKey value={5m} />
        <NumberKey value={6m} />
        <Key onClick={() => enterOperator("-")}>&minus;</Key>
        <NumberKey value={1m} />
        <NumberKey value={2m} />
        <NumberKey value={3m} />
        <Key onClick={() => enterOperator("+")}>+</Key>
        <Key onClick={() => doUnaryOperation("negate")}>&plusmn;</Key>
        <NumberKey value={0m} />
        <Key onClick={enterDecimalPoint}>.</Key>
        <Key onClick={doOperation}>=</Key>
      </div>
    );
  }

  // ========================================

  const div = document.createElement("div");
  document.querySelector("body").append(div);
  const root = ReactDOM.createRoot(div);
  root.render(<Calc />);
  `,
};
