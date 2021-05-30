const hbs = require("handlebars");

exports.link = (...linkSegments) => {
  // final argument is metadata I need to splice out
  linkSegments.splice(linkSegments.length - 1, 1);

  console.log(linkSegments[linkSegments.length - 1]);
  const escapedSegments = linkSegments.map((seg) => hbs.escapeExpression(seg));

  return escapedSegments.join("");
};
