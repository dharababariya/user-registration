"use strict"
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require('joi'));

exports.validate = function (input, generate_schema, options) {
    const schema = generate_schema(joi_1.default);

    let default_options = {
        language: {
            key: '{{key}}',
        },
    };
    if (options) {
        default_options = Object.assign({}, default_options, options);
    }
    joi_1.default.validate(input, schema, default_options, (err) => {
        if (err) {
            const error = new Error(err.details[0].message);
            error.status = 400;
            throw error;
        }
        return undefined;
    })
}