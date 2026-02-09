const Joi = require("joi");
const symbolSchema = Joi.string()
    .trim()
    .uppercase()
    .min(1)
    .max(20)
    .pattern(/[A-Z0-9]+$/)
    .required()
    .messages({
        'string.base': 'Symbol must be string',
        'string.empty': 'Symbol is required',
        'string.min': 'Symbol must be at least 1 character',
        'string.max': 'Symbol cannot exceed 20 characters',
        'string.pattern.base': 'Symbol must contain only letters and numbers',
        'any.required': 'Symbol is required'
    })

const quantitySchema = Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .required()
    .messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be a whole number',
        'number.min': 'Quantity must be at least 1',
        'number.max': 'Quantity cannot exceed 10000 per order',
        'any.required': 'Quantity is required'
    })

const orderTypeSchema = Joi.string()
    .valid('MARKET', 'LIMIT')
    .default('MARKET')
    .messages({
        'any.only': 'Order type must be either MARKET or LIMIT'
    })

const limitPriceSchema = Joi.number()
    .positive()
    .max(1000000)
    .precision(2)
    .when('orderType', {
        is: 'LIMIT',
        then: Joi.required,
        otherwise: Joi.forbidden()
    })
    .messages({
        'number.base': 'Limit must be a number',
        'number.positive': 'Limit price must be greater than 0',
        'number.max': 'Limit price cannot exceed 10000 per order',
        'number.precision': 'Limit price can have maximum 2 decimal places',
        'any.required': 'Limit price is required for Limit Order',
        'any.unknown': 'Limit price is not allowed for MARKET order'
    })


const buyOrderSchema = Joi.object({
    symbol: symbolSchema,
    quantity: quantitySchema,
    orderType: orderTypeSchema,
    limitPrice: limitPriceSchema
}).options({stripUnknown: true});

const sellOrderSchema = Joi.object({
    symbol: symbolSchema,
    quantity: quantitySchema,
    orderType: orderTypeSchema,
    limitPrice: limitPriceSchema 
}).options({ stripUnknown: true })


function validate(schema){
    return (req,res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if(error){
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }))
            return res.status(400).json({
                success: false,
                error: 'Validate failed',
                details: errors
            })
        }
        req.body = value;
        next();
    }
}

module.exports = {
    validateBuyOrder: validate(buyOrderSchema),
    validateSellOrder: validate(sellOrderSchema),
    schemas: {
        buyOrderSchema,
        sellOrderSchema
    }
}