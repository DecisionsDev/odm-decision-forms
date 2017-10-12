"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
exports.receiveResult = function (payload) { return ({
    type: 0 /* RECEIVE_RESULT */,
    payload: payload
}); };
exports.execute = function (payload) {
    return function (dispatch, getState) {
        axios_1.default.post('/execute', payload).then(function (res) {
            dispatch(exports.receiveResult(res.data));
        }).catch(function (err) {
            console.log('Error: ' + err);
        });
    };
};
