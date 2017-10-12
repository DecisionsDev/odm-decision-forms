"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_redux_1 = require("react-redux");
var react_jsonschema_form_1 = require("react-jsonschema-form");
var actions_1 = require("../actions");
var styles = require('../main.scss');
var log = function (type) { return console.log.bind(console, type); };
var App = function (_a) {
    var requestSchema = _a.requestSchema, responseSchema = _a.responseSchema, result = _a.result, dispatch = _a.dispatch;
    return (<div>
		<div id="input">
			<react_jsonschema_form_1.default schema={requestSchema} onChange={log("changed")} onSubmit={function (data) { return dispatch(actions_1.execute(data.formData)); }} onError={log("errors")}/>
		</div>
		{result && <div id="output"><react_jsonschema_form_1.default formData={result} schema={responseSchema}/></div>}
	</div>);
};
var mapStateToProps = function (state) {
    return {
        requestSchema: state.requestSchema,
        responseSchema: state.responseSchema,
        result: state.result ? { response: state.result } : null
    };
};
exports.default = react_redux_1.connect(mapStateToProps)(App);
