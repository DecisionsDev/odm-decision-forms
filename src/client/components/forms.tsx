import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import {
	DecisionState, DecisionStatus, FormController, FormsState, Options
} from "../state";
import { execute } from "../actions";
import { RootSchemaElement } from "../schema";
import { RouterState } from 'react-router-redux'
import format from 'date-fns/format'
import {JsonForm} from "./jsonForm";

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

interface MessageField {
	name: string;
	value: string;
}

const log = (type) => console.log.bind(console, type);

class Forms extends React.Component<DProps, any> {
	form: any;
	inputController: FormController;
	outputController: FormController;

	constructor(props) {
		super(props);
		this.inputController = new FormController({
			onSubmit: formData => props.dispatch(execute(formData)),
			onError: error => log(error)
		});
		this.outputController = new FormController({
			onError: error => log(error)
		});
	}

	doSubmit() {
		this.inputController.submit();
	}

	render() {
		const {requestSchema, responseSchema, executeResponse, options} = this.props;
		const makeFooterMessage = (fields: MessageField[]) => {
			return <span>{ fields.map((f, i) => (
				<span key={"message-field-" + i}>
					<span className="message-field-name">{f.name}: </span>
					<span className="message-field-value">{f.value}</span>{ (i < fields.length - 1) ? ' - ': ''}
				</span>
			))}</span>
		};
		return <div className="odm-decision-forms">
			<div id="input" className="form-container">
				<div className="form-header">
					<h1>Input</h1>
					<button type="submit" className="btn btn-success btn-lg" onClick={() => this.doSubmit()}>
						<span>Run</span>
						<i className="fa fa-play" aria-hidden="true"/>
					</button>
				</div>
				<div className="form-body">
					<JsonForm schema={requestSchema}
										data={{}}
										readonly={false}
										rootFieldId={"in"}
										controller={this.inputController}
										options={options}/>
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
										<JsonForm schema={responseSchema}
															data={(executeResponse.status === DecisionStatus.Result) ? executeResponse.result : {}}
															readonly={true}
															rootFieldId={"out"}
															controller={this.outputController}
															options={options}/>
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

const mapStateToProps = (state: FormsState): Props => {
	return {
		requestSchema: state.requestSchema,
		responseSchema: state.responseSchema,
		executeResponse: state.executeResponse,
		options: state.options
	};
};

export default connect(mapStateToProps)(Forms);
