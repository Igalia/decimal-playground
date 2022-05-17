import {
  checkAndThrowForDecimal,
  createIdentifierNode,
  createLiteralsNode,
  earlyReturn,
  handleCallExpression,
  handleLogicalExpression,
  handleMixedOps,
  handleSpecialCaseOps,
  handleSingleTypeOps,
  isDefiniedIdentifier,
  replaceWithDecimal,
  sharedMixedOps,
  sharedSingleOps,
  specialCaseOps,
} from "./shared.js";

const implementationIdentifier = "Decimal128";

const opToName = {
  ...sharedMixedOps,
  ...sharedSingleOps,
  "/": "div",
};

const replaceWithBinaryDecimalExpression = (t, knownDecimalNodes) => (path) => {
  let { left, right, operator } = path.node;

  const includesIdentifierArgument =
    isDefiniedIdentifier(t, left) || isDefiniedIdentifier(t, right);

  const leftIsDecimal = knownDecimalNodes.has(left);
  const rightIsDecimal = knownDecimalNodes.has(right);

  if (
    earlyReturn([
      !leftIsDecimal && !rightIsDecimal && !includesIdentifierArgument,
    ])
  ) {
    return;
  }

  const isSpecialCaseOp = Reflect.has(specialCaseOps, operator);

  if (isSpecialCaseOp) {
    handleSpecialCaseOps(t, knownDecimalNodes, path, specialCaseOps);
    return;
  }

  const isMixedTypesOp = Reflect.has(sharedMixedOps, operator);

  const transformations = isMixedTypesOp
    ? handleMixedOps(
        t,
        knownDecimalNodes,
        path,
        opToName,
        implementationIdentifier
      )
    : handleSingleTypeOps(t, knownDecimalNodes, path, opToName);

  if (includesIdentifierArgument) {
    createIdentifierNode(t, knownDecimalNodes, path, transformations);
    return;
  }

  createLiteralsNode(t, knownDecimalNodes, path, transformations);
};

const replaceWithUnaryDecimalExpression = (t, knownDecimalNodes) => (path) => {
  const { argument, operator } = path.node;

  if (!knownDecimalNodes.has(argument)) {
    return;
  }

  if (operator !== "-") {
    throw path.buildCodeFrameError(
      new SyntaxError(`Unary ${operator} is not currently supported.`)
    );
  }

  /* Add function(s) for implementation-specific checks here */

  const member = t.memberExpression(argument, t.identifier("neg"));
  const newNode = t.callExpression(member, []);

  knownDecimalNodes.add(newNode);

  path.replaceWith(newNode);
  path.skip();
};

export default function (babel) {
  const { types: t } = babel;
  const knownDecimalNodes = new WeakSet();

  return {
    name: "plugin-decimal-128",
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("decimal");
    },
    visitor: {
      BinaryExpression: {
        exit: replaceWithBinaryDecimalExpression(t, knownDecimalNodes),
      },
      CallExpression: {
        exit: handleCallExpression(
          t,
          knownDecimalNodes,
          implementationIdentifier
        ),
      },
      DecimalLiteral: replaceWithDecimal(t, implementationIdentifier),
      LogicalExpression: {
        exit: handleLogicalExpression(t, knownDecimalNodes),
      },
      NewExpression: checkAndThrowForDecimal,
      UnaryExpression: {
        exit: replaceWithUnaryDecimalExpression(t, knownDecimalNodes),
      },
    },
  };
}
