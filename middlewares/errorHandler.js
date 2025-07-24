// middlewares/errorHandler.js
function errorHandler(err, req, res) {
  console.error(err.stack); // ou log dans un fichier/log service
  res.status(err.status || 500).json({
    error: err.message || "Something went wrong",
  });
}

module.exports = errorHandler;
