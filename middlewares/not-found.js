const {StatusCodes} = require("http-status-codes");
const notFound = (req, resp) => resp.status(StatusCodes.NOT_FOUND).send("Route not found");
module.exports = notFound;
