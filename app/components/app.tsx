import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {State, Error} from "../state";
import Form from "react-jsonschema-form";
import {execute} from "../actions";
import {RootSchemaElement} from "../schema";
const styles = require('../main.scss');

interface Props {
	requestSchema: RootSchemaElement;
	responseSchema: RootSchemaElement;
	result: object | null;
	error: Error | null;
}

interface DProps extends Props {
	dispatch: Dispatch<any>;
}

const log = (type) => console.log.bind(console, type);

class App extends React.Component<DProps, any> {
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
		return <div>
			<div id="input">
				<Form schema={requestSchema}
							formData={this.state}
							onChange={({formData}) => this.setState(formData)}
							onSubmit={data => this.handleOnSubtmit(data)}
							onError={log("errors")} ref={form => { this.form = form; }}>
					<button type="submit">
						<i className="fa fa-cog" aria-hidden="true"/>
						<span>Run Decision</span>
					</button>
				</Form>
			</div>
			{
				result && <div id="output"><Form formData={result} schema={responseSchema}/></div>
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
		requestSchema: state.requestSchema,
		responseSchema: state.responseSchema,
		result: state.result ? {response: state.result} : null,
		error: state.error
	};
};

export default connect(mapStateToProps)(App);
