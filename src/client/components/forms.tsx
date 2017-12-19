import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import {
	State, DecisionState, decisionStatusError, decisionStatusResult, decisionStatusNotRun
} from "../state";
import Form from "react-jsonschema-form";
import { execute } from "../actions";
import { RootSchemaElement } from "../schema";
import { RouterState } from 'react-router-redux'
import { buildUiSchema } from "../resapi";
import moment from 'moment';

require('es6-object-assign').polyfill();

export interface Props {
	requestSchema: RootSchemaElement;
	responseSchema: RootSchemaElement;
	executeResponse: DecisionState;
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
		const {requestSchema, responseSchema, executeResponse, dispatch} = this.props;
		const inuiSchema = {
			...buildUiSchema(requestSchema),
			"ui:rootFieldId": "in"
		};
		console.log(inuiSchema);
		const outuiSchema = {
			...buildUiSchema(responseSchema),
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
								liveValidate={true}
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
								case decisionStatusResult:
								case decisionStatusNotRun:
									return (
										<Form uiSchema={outuiSchema}
																ObjectFieldTemplate={MyObjectFieldTemplate}
																formData={(executeResponse.status === decisionStatusResult) ? executeResponse.result : null}
																schema={responseSchema}/>
									);
								case decisionStatusError:
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
								case decisionStatusResult:
									return makeFooterMessage([
										{ name: 'Last run', value: moment(executeResponse.start).format('LTS') },
										{ name: 'Decision ID', value: executeResponse.result['__DecisionID__'] },
									]);
								case decisionStatusNotRun:
									return <span>No output yet. Hit the 'Run' button to trigger the Decision.</span>;
								case decisionStatusError:
									return makeFooterMessage([ { name: 'Last run', value: moment(executeResponse.start).format('LTS') } ]);
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


const mapStateToProps = (state: State): Props => {
	return {
		requestSchema: state.requestSchema!,
		responseSchema: state.responseSchema!,
		executeResponse: state.executeResponse
	};
};

export default connect(mapStateToProps)(Forms);
