// utils/errorHandler.js

export const notFound = (req, res, next) => {
    const err = {
        status: 404,
        message: `Not Found - ${req.originalUrl}`
    };
    next(err);
};

export const errorHandler = (err, req, res, next) => {
    // Normalize error
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Server Error';

    if (process.env.NODE_ENV === 'development') {
        console.error(err);
        return res.status(status).json({
            ok: false,
            status,
            message,
            stack: err.stack
        });
    }

    res.status(status).json({
        ok: false,
        status,
        message
    });
};
