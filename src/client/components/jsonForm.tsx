import * as React from 'react';
import {Options} from "../state";
import Form from "react-jsonschema-form";
import {RootSchemaElement} from "../schema";
import {RouterState} from 'react-router-redux'
import {buildUiSchema} from "../resapi";
import {FormController} from "../state";

require('es6-object-assign').polyfill();

export interface Props {
	schema: RootSchemaElement;
	data: object;
	rootFieldId?: string;
	readonly: boolean;
	controller: FormController;
	options: Options;
}

//const log = (type) => console.log.bind(console, type);

export class JsonForm extends React.Component<Props, any> {
	private form: any;
	private submitButton: any;

	constructor(props) {
		super(props);
		if (!props.readonly) {
			this.state = props.data;
			const self = this;
			props.controller.setSubmitter(() => {
				self.submitButton.click();
			});
		}
	}

	handleOnSubtmit(formData) {
		return this.props.controller.handleOnSubmit(formData);
	}

	handleOnError(error) {
		return this.props.controller.handleOnError(error);
	}

	handleOnChange(formData) {
		if (!this.props.readonly) {
			this.setState(formData);
			return this.props.controller.handleOnChange(formData);
		}
	}

	componentWillReceiveProps(nextProps) {
		if (!this.props.readonly && nextProps.data != this.props.data) {
			this.setState(nextProps.data);
			return true;
		}
	}

	removeNullFields(data) {
		// When displaying the output, we remove null 'parameters' (not undefined, but null!), ie first level data fields
		// Otherwise if set to null by the RES (eg: if decision not taken), they would invalidate the Json schema that
		// states that any parameter is non nullable
		if (data) {
			const clone = JSON.parse(JSON.stringify(data));
			for (let p in clone) {
				if (clone[p] == null) {
					delete clone[p];
				}
			}
			return clone;
		}
		return data;
	}

	render() {
		const {schema, rootFieldId, readonly, options, data} = this.props;
		const uiSchema = {
			...buildUiSchema(schema, options),
			"ui:rootFieldId": rootFieldId || "root",
			"ui:readonly": readonly
		};
		return <Form schema={schema}
								 uiSchema={uiSchema}
								 ObjectFieldTemplate={MyObjectFieldTemplate}
								 liveValidate={options.liveValidation}
								 formData={readonly ? this.removeNullFields(data): this.state}
								 onChange={({formData}) => this.handleOnChange(formData)}
								 onSubmit={({formData}) => this.handleOnSubtmit(formData)}
								 onError={(error) => this.handleOnError(error)} ref={form => {
			this.form = form;
		}}>
			<button ref={(btn) => {
				this.submitButton = btn;
			}} className="hidden"/>
		</Form>
	}
}

// Redefine the object field template to add a 'form-grid' div because CSS directive 'display:grid' does not work
// on <fieldset>
function MyObjectFieldTemplate(props) {
	const {TitleField, DescriptionField} = props;
	return (
		<fieldset>
			{(props.uiSchema["ui:title"] || props.title) && (
				<TitleField
					id={`${props.idSchema.$id}__title`}
					title={props.title || props.uiSchema["ui:title"]}
					required={props.required}
					formContext={props.formContext}
				/>
			)}
			{props.description && (
				<DescriptionField
					id={`${props.idSchema.$id}__description`}
					description={props.description}
					formContext={props.formContext}
				/>
			)}
			<div className="form-grid">
				{props.properties.map(prop => prop.content)}
			</div>
		</fieldset>
	);
}
