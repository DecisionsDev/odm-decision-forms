import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {State, Error} from "../state";
import Form from "react-jsonschema-form";
import {execute} from "../actions";
import {RootSchemaElement} from "../schema";
import {RouterState} from 'react-router-redux'
import {buildUiSchema} from "../resapi";

require('es6-object-assign').polyfill();

export interface Props {
	requestSchema: RootSchemaElement;
	responseSchema: RootSchemaElement;
	result: object | null;
	error: Error | null;
}

export interface DProps extends Props {
	dispatch: Dispatch<any>;
}

const log = (type) => console.log.bind(console, type);

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
		const {requestSchema, responseSchema, result, error, dispatch} = this.props;
		const inuiSchema = {
			...buildUiSchema(requestSchema),
			"ui:rootFieldId": "in"
		};
		const outuiSchema = {
			...buildUiSchema(responseSchema),
			"ui:rootFieldId": "out",
			"ui:readonly": true
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
						error ?
							<div className="decision-error">
								<h3>{error.title}</h3>
								{error.status && <div><b>Status:</b> {error.status.toUpperCase()}</div>}
								<div><b>Message:</b> {error.message}</div>
							</div>
							: <Form uiSchema={outuiSchema}
											ObjectFieldTemplate={MyObjectFieldTemplate}
											formData={result}
											schema={responseSchema}/>
					}
				</div>
				<div className="form-footer">
					{result ? <span>Decision ID: {result['__DecisionID__']}</span>
						: <span>No output yet. Hit the 'Run' button to trigger the Decision.</span>}
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
		result: state.result ? state.result : null,
		error: state.error
	};
};

export default connect(mapStateToProps)(Forms);
