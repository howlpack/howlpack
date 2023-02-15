import Joi from "joi";

/**
 * Helper function to validate an object against the provided schema,
 * and to throw a custom error if object is not valid.
 *
 * @param {Object} [object] The object to be validated.
 * @param {String} label The label to use in the error message.
 * @param {JoiSchema} schema The Joi schema to validate the object against.
 */
function validateObject(object = {}, label, schema, options) {
  if (schema) {
    if (!schema.validate) {
      schema = Joi.object(schema);
    }
    const { error } = schema.validate(object, options);
    if (error) {
      throw new Error(`Invalid ${label} - ${error.message}`);
    }
  }
}

/**
 * Generate a Koa middleware function to validate a request using
 * the provided validation objects.
 *
 * @param {{ headers: Object?, params: Object?, query: Object?, body: Object? }} validationObj
 * @returns {import("koa").Middleware} A validation middleware function.
 */
export function validate(validationObj) {
  return (ctx, next) => {
    try {
      validateObject(ctx.headers, "Headers", validationObj.headers, {
        allowUnknown: true,
      });
      validateObject(ctx.params, "URL Parameters", validationObj.params);
      validateObject(ctx.query, "URL Query", validationObj.query);

      if (ctx.request.body) {
        validateObject(ctx.request.body, "Request Body", validationObj.body);
      }

      return next();
    } catch (err) {
      console.error(err.message);
      ctx.throw(400, err.message);
    }
  };
}
