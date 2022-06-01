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
  replaceWithUnaryDecimalExpression,
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

  const isIdentifier = (arg) => isDefiniedIdentifier(t, arg);
  const includesIdentifierArgument = [left, right].some(isIdentifier);
  const bothArgumentsAreIdentifiers = [left, right].every(isIdentifier);

  const leftIsDecimal = knownDecimalNodes.has(left);
  const rightIsDecimal = knownDecimalNodes.has(right);

  if (
    earlyReturn([
      !leftIsDecimal && !rightIsDecimal && !bothArgumentsAreIdentifiers,
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
