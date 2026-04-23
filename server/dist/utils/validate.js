"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
function validate(schema, data) {
    const result = schema.safeParse(data);
    if (!result.success) {
        const error = new Error("VALIDATION_ERROR");
        error.issues = result.error.issues;
        throw error;
    }
    return result.data;
}
