// helpers/apiResponse.js
const apiResponse = (res, statusCode, status, message, data, token, page, perPage, total) => {
    const response = {
        status: {
            statusCode: statusCode,
            status: status,
            message: message
        },
        data: data,
        token: token
    };

    if (page !== undefined && perPage !== undefined && total !== undefined) {
        response.pagination = {
            page: page,
            perPage: perPage,
            total: total
        };
    }

    return res.status(statusCode).json(response);
};

module.exports = {
    apiResponse,
};
