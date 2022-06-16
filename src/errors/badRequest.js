//Use this function whenever you have a bad request (status 400). ~Mercy
function badRequest(errorMessage, request, response, next) {
  next({ status: 400, message: errorMessage });
}

module.exports = badRequest;
