import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {State, Error} from "../state";
import Form from "react-jsonschema-form";
import {execute} from "../actions";
import {RootSchemaElement} from "../schema";
import {RouterState} from 'react-router-redux'
const styles = require('../main.scss');

interface Props {
	requestSchema: RootSchemaElement;
	responseSchema: RootSchemaElement;
	result: object | null;
	error: Error | null;
	router: RouterState
}

interface DProps extends Props {
	dispatch: Dispatch<any>;
}

const log = (type) => console.log.bind(console, type);

class Forms extends React.Component<DProps, any> {
	form: any;
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
			"ui:rootFieldId": "in",
		};
		const outuiSchema = {
			"ui:rootFieldId": "out",
			"ui:readonly": true
		};
		return <div>
			<div id="input" className="form-container">
				<h1>Request</h1>
				<Form schema={requestSchema}
							uiSchema={inuiSchema}
							formData={this.state}
							onChange={({formData}) => this.setState(formData)}
							onSubmit={data => this.handleOnSubtmit(data)}
							onError={log("errors")} ref={form => { this.form = form; }}>
					<button type="submit" className="btn btn-success btn-lg">
						<i className="fa fa-cog" aria-hidden="true"/>
						<span>Run Decision</span>
					</button>
				</Form>
			</div>
			{
				result &&
				<div id="output" className="form-container">
					<h1>Response</h1>
					<Form uiSchema={outuiSchema} formData={result} schema={responseSchema}/>
				</div>
			}
			{
				error && <div>
					<h3>{error.title}</h3>
					{ error.status && <div><b>Status:</b> {error.status.toUpperCase()}</div>}
					<div><b>Message:</b> {error.message}</div>
				</div>
			}
		</div>
	}
}

const mapStateToProps = (state: State): Props => {
	return {
		requestSchema: state.requestSchema!,
		responseSchema: state.responseSchema!,
		result: state.result ? state.result : null,
		error: state.error,
		router: state.router
	};
};

export default connect(mapStateToProps)(Forms);
