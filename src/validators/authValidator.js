// validators/authValidator.js
const Joi = require('joi');

// Validation schema for user registration
const registrationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    username: Joi.string().min(3).max(30).required(),
});

// Validation schema for user login
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

module.exports = {
    registrationSchema,
    loginSchema,
};
