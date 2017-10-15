import * as React from 'react';
const styles = require('../main.scss');

interface Props {
	error: any;
}

const Error: React.SFC<Props> = ({ error }) => {
	if (error.response && error.response.statusText) {
			return <div>
				<h3>Error reading Swagger file</h3>
				<div><b>Status:</b> {error.response.statusText.toUpperCase()}</div>
				<div><b>Message:</b> {error.response.data}</div>
			</div>
	} else {
			return <div>
				<h3>Error while rendering form</h3>
				<div><b>Error:</b> {error.toString()}</div>
			</div>
	}
};

export default Error;