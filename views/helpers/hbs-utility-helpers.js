const hbs = require("handlebars");

const escapeAll = (...args) => args.map((arg) => hbs.escapeExpression(arg));

exports.link = (...linkSegments) => {
  // final argument is metadata I need to splice out
  linkSegments.splice(linkSegments.length - 1, 1);

  const escapedSegments = escapeAll(...linkSegments);

  return escapedSegments.join("");
};

exports.ifeq = function (a, b, options) {
  const [safeA, safeB] = escapeAll(a, b);
  return safeA === safeB ? options.fn(this) : options.inverse(this);
};

exports.tern = (conditionUnsafe, trueResultUnsafe, falseResultUnsafe) => {
  const [condition, trueResult, falseResult] = escapeAll(
    conditionUnsafe,
    trueResultUnsafe,
    falseResultUnsafe
  );

  return condition ? trueResult : falseResult;
};
