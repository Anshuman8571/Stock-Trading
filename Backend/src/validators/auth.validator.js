const Joi = require("joi");

const emailSchema = Joi.string()
    .email()
    .lowercase()
    .trim()
    .max(255)
    .required()
    .messages({
        'string.email': 'Please provide a valid email address',
        'string.empty': 'Email is required',
        'any.required': 'Email is required'
    })

const passwordSchema = Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password cannot exceed 120 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter and one number',
        'any.required': 'Password is required'
    })

const usernameSchema = Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .trim()
    .required()
    .messages({
        'string.alphanum': 'Username must contain only letters and numbers',
        'string.min': 'Username must be atleast 3 characters',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required'
    })


const phoneSchema = Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
        'string.pattern.base': 'Please provide a valid 10 digit Indian mobile number',
        'any.required': 'Phone number is required'
    })

const fullNameSchema = Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
        'string.min': "Full name must be at least 2 characters",
        'string.max': 'Full name cannot exceed 100 characters',
        'any.required': 'Full name is required'
    })


const registerSchema = Joi.object({
    email: emailSchema,
    password: passwordSchema,
    username: usernameSchema,
    phone: phoneSchema,
    fullName: fullNameSchema
})


const loginSchema = Joi.object({
    email: emailSchema,
    password: Joi.string().required()
})

function validate(schema){
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if(error){ 
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            return res.status(400).json({
                success: false,
                error: 'Validation Failed',
                details: errors
            })
        }
        req.body = value,
        next()
    }
}

module.exports = {
    validateRegister: validate(registerSchema),
    validateLogin: validate(loginSchema)
}