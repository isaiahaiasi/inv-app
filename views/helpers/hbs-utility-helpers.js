const hbs = require("handlebars");

const getSafeArgs = (...args) => args.map((arg) => hbs.escapeExpression(arg));

exports.link = (...linkSegments) => {
  // final argument is metadata I need to splice out
  linkSegments.splice(linkSegments.length - 1, 1);

  console.log(linkSegments[linkSegments.length - 1]);
  const escapedSegments = getSafeArgs(...linkSegments);

  return escapedSegments.join("");
};

exports.tern = (conditionUnsafe, trueResultUnsafe, falseResultUnsafe) => {
  const [condition, trueResult, falseResult] = getSafeArgs(
    conditionUnsafe,
    trueResultUnsafe,
    falseResultUnsafe
  );

  return condition ? trueResult : falseResult;
};
