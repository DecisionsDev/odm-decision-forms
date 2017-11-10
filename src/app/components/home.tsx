import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {ResState, State} from "../state";
import {ReactElement} from "react";
const styles = require('../main.scss');

interface Props {
	res: ResState;
}

const Home: React.SFC<Props> = ({ res }) => {
	const paths : string[] = res.paths;
	const links : ReactElement<any>[] = [];
	paths.forEach(path => {
		const url = '/ruleapp/' + path;
		links.push(<li><a href={url}>{path}</a></li>);
	});
	return <div>
		<h1>Ruleset paths:</h1>
		<ul>
			{links}
		</ul>
	</div>;
};

const mapStateToProps = (state: State): Props => {
	return {
		res: state.res
	};
};

export default connect(mapStateToProps)(Home);
