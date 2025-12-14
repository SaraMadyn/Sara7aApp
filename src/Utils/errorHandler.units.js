export const globalErrorHandler = (err,req,res,next) => {
        const status = err.status || 500; 
        return res.status(status).json({ message: "something went wrong", error : err.message , stack : err.stack });
    };