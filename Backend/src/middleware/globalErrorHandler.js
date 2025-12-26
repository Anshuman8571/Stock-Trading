function globalErrorHandler (error,req,res,next) {
    console.error("Global Error",error)
    res.status(error.status || 500).json({
        success: false,
        error: error.message || "Internal Server Error"
    })
}

module.exports = globalErrorHandler;