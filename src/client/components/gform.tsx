import * as React from 'react';
import { Options } from "../state";
import Form from "react-jsonschema-form";
import {RootSchemaElement} from "../schema";
import {RouterState} from 'react-router-redux'
import {buildUiSchema} from "../resapi";
import {Deferred} from "../utils";
import Rx from 'rxjs';

require('es6-object-assign').polyfill();

export class Trigger {
	private runner: any;
	run(data?: any) : Promise<object> {
		return this.runner(data);
	}
	setRunner(o) {
		this.runner = o;
	}
}

export interface Props {
	schema: RootSchemaElement;
	data: object;
	rootFieldId?: string;
	readonly: boolean;
	submit?: Trigger;
	options: Options;
}

const log = (type) => console.log.bind(console, type);

export class JsonForm extends React.Component<Props, any> {
	private form: any;
	private submitButton: any;
	private deferred: Deferred<object>;

	constructor(props) {
		super(props);
		this.state = props.data;
		const self = this;
		if (props.submit) {
			props.submit.setRunner(() => {
				self.deferred = new Deferred();
				self.submitButton.click();
				return self.deferred.promise;
			});
		}
	}

	handleOnSubtmit(data) {
		return this.deferred.resolve(data.formData);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.data != this.props.data) {
			this.setState(nextProps.data);
		}
		return true;
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
								 formData={this.state}
								 onChange={({formData}) => this.setState(formData)}
								 onSubmit={data => this.handleOnSubtmit(data)}
								 onError={log("errors")} ref={form => {
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
