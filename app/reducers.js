"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var schema_1 = require("./schema");
exports.schemaReducer = function (state, action) {
    if (state === void 0) { state = { $schema: '', type: schema_1.Type.TObject }; }
    return state;
};
exports.resultReducer = function (state, action) {
    if (state === void 0) { state = null; }
    switch (action.type) {
        case 0 /* RECEIVE_RESULT */:
            return action.payload;
        default:
            return state;
    }
};
