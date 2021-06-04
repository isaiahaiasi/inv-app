const path = require("path");

const pathFromRoot = (pathName) => path.join(__dirname, pathName);
const UPLOAD_PATH = pathFromRoot("/tmp/uploads");

module.exports = { pathFromRoot, UPLOAD_PATH };
