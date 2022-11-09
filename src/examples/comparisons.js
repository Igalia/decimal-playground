import dedent from "dedent";

const title = "Basics: Comparisons";
const description = "Contrast comparisons: < > <= >=.";
const text = dedent`
// The usual Javascript comparator operators
// < > <= >= work with Decimal values
// Unlike arithmetic operators, these accept
// mixed arguments.

const lt = 0.33m < 0.99m;
const ltMixed = 0.33m < 0.99;

log("less than:", lt);
log("less than mixed:", ltMixed);

const lte = 0.33m <= 0.33m;
const lteMixed = 0.33m <= 0.33;

log("less than or equal:", lte);
log("less than or equal mixed:", lteMixed);

const gt = 0.33m > 0.99m;
const gtMixed = 0.33m > 0.99;

log("greater than:", gt);
log("greater than mixed:", gtMixed);

const gte = 0.33m >= 0.33m;
const gteMixed = 0.33m >= 0.33;

log("greater than or equal:", gte);
log("greater than or equal mixed:", gteMixed);
`;

export const COMPARISONS = {
  title,
  description,
  text,
};
