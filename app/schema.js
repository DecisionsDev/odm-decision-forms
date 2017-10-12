"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaVersion = "http://json-schema.org/draft-06/schema#";
var Type;
(function (Type) {
    Type["TObject"] = "object";
    Type["TString"] = "string";
    Type["TArray"] = "array";
    Type["TNumber"] = "number";
    Type["TBoolean"] = "boolean";
})(Type = exports.Type || (exports.Type = {}));
var Format;
(function (Format) {
    Format["Html"] = "html";
    Format["Markdown"] = "markdown";
    Format["TextArea"] = "textarea";
    Format["Double"] = "double";
})(Format = exports.Format || (exports.Format = {}));
