import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import {
	DecisionState, DecisionStatus, FormsState, Options
} from "../state";
import Form from "react-jsonschema-form";
import { execute } from "../actions";
import { RootSchemaElement } from "../schema";
import { RouterState } from 'react-router-redux'
import { buildUiSchema } from "../resapi";
import format from 'date-fns/format'

require('es6-object-assign').polyfill();

export interface Props {
	requestSchema: RootSchemaElement;
	responseSchema: RootSchemaElement;
	executeResponse: DecisionState;
	options: Options
}

export interface DProps extends Props {
	dispatch: Dispatch<any>;
}

const log = (type) => console.log.bind(console, type);

interface MessageField {
	name: string;
	value: string;
}

class Forms extends React.Component<DProps, any> {
	form: any;
	submitButton: any;

	constructor(props) {
		super(props);
		this.state = {};
	}

	handleOnSubtmit(data) {
		return this.props.dispatch(execute(data.formData));
	}

	render() {
		const {requestSchema, responseSchema, executeResponse, options, dispatch} = this.props;
		const inuiSchema = {
			...buildUiSchema(requestSchema, options),
			"ui:rootFieldId": "in"
		};
		const outuiSchema = {
			...buildUiSchema(responseSchema, options),
			"ui:rootFieldId": "out",
			"ui:readonly": true
		};
		const makeFooterMessage = (fields: MessageField[]) => {
			return <span>{ fields.map((f, i) => (
				<span>
					<span className="message-field-name">{f.name}: </span>
					<span className="message-field-value">{f.value}</span>{ (i < fields.length - 1) ? ' - ': ''}
				</span>
			))}</span>
		};
		console.log("In Forms#render: " + JSON.stringify(options));
		return <div className="odm-decision-forms">
			<div id="input" className="form-container">
				<div className="form-header">
					<h1>Input</h1>
					<button type="submit" className="btn btn-success btn-lg" onClick={() => this.submitButton.click()}>
						<span>Run</span>
						<i className="fa fa-play" aria-hidden="true"/>
					</button>
				</div>
				<div className="form-body">
					<Form schema={requestSchema}
								uiSchema={inuiSchema}
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
				</div>
			</div>
			<div id="output" className="form-container">
				<div className="form-header">
					<h1>Output</h1>
				</div>
				<div className="form-body">
					{
						(() => {
							switch (executeResponse.status) {
								case DecisionStatus.Result:
								case DecisionStatus.NotRun:
									return (
										<Form uiSchema={outuiSchema}
																ObjectFieldTemplate={MyObjectFieldTemplate}
																formData={(executeResponse.status === DecisionStatus.Result) ? executeResponse.result : null}
																schema={responseSchema}/>
									);
								case DecisionStatus.Error:
									return (
										<div className="decision-error">
											<h3>{executeResponse.error.title}</h3>
											{executeResponse.error.status && <div><b>Status:</b> {executeResponse.error.status.toUpperCase()}</div>}
											<div><b>Message:</b> {executeResponse.error.message}</div>
										</div>
									);
							}
						})()
					}
				</div>
				<div className="form-footer">
					{
						(() => {
							switch (executeResponse.status) {
								case DecisionStatus.Result:
									return makeFooterMessage([
										{ name: 'Last run', value: format(executeResponse.start, 'h:mm:ss A') },
										{ name: 'Decision ID', value: executeResponse.result['__DecisionID__'] },
									]);
								case DecisionStatus.NotRun:
									return <span>No output yet. Hit the 'Run' button to trigger the Decision.</span>;
								case DecisionStatus.Error:
									return makeFooterMessage([ { name: 'Last run', value: format(executeResponse.start, 'h:mm:ss A') } ]);
							}
						})()
					}
				</div>
			</div>
		</div>
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


const mapStateToProps = (state: FormsState): Props => {
	return {
		requestSchema: state.requestSchema,
		responseSchema: state.responseSchema,
		executeResponse: state.executeResponse,
		options: state.options
	};
};

export default connect(mapStateToProps)(Forms);
