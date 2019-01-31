import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import {
	FormController, Options, StandaloneFormState
} from "../state";
import { RootSchemaElement } from "../schema";
import { RouterState } from 'react-router-redux'
import {JsonForm} from "./jsonForm";

require('es6-object-assign').polyfill();

export interface Props {
	schema: RootSchemaElement;
	data: object;
	controller: FormController;
	options: Options
}

export interface DProps extends Props {
	dispatch: Dispatch<any>;
}

class StandaloneForm extends React.Component<DProps, any> {
	form: any;

	constructor(props) {
		super(props);
	}

	render() {
		const {schema, data, options, controller} = this.props;
		return <div className="odm-decision-forms">
			<div id="input" className="form-container">
				<div className="form-body">
					<JsonForm schema={schema}
										data={data}
										readonly={false}
										rootFieldId={"in"}
										controller={controller}
										options={options}/>
				</div>
			</div>
		</div>
	}
}

const mapStateToProps = (state: StandaloneFormState): Props => {
	return {
		schema: state.schema,
		data: state.data,
		options: state.options,
		controller: state.controller
	};
};

export default connect(mapStateToProps)(StandaloneForm);
