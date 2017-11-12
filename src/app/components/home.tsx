import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {ResState, RuleApp, Ruleset, RulesetVersion, State} from "../state";
import {ReactElement} from "react";
require('es6-map/implement');

const styles = require('../main.scss');

interface Props {
	res: ResState;
}

const valuesPolyfill = function values (object) {
	return Object.keys(object).map(key => object[key]);
};

const Home: React.SFC<Props> = ({res}) => {
	const ruleapps = flatMap(ruleapp => renderRuleApp(ruleapp), valuesPolyfill(res));
	return <div id="home">
		<table>
			<thead>
				<tr>
					<td>Ruleapp</td>
					<td>Ruleset</td>
					<td>Version</td>
				</tr>
			</thead>
			{ruleapps}
		</table>
	</div>;
};

const flatMap = (f,xs) => xs.reduce((acc,x) => acc.concat(f(x)), []);

const renderRuleApp = (ruleapp: RuleApp) => {
	let rulesets = valuesPolyfill(ruleapp.rulesets);
	let all : JSX.Element[] = [];
	rulesets.forEach((ruleset, rulesetIndex) => {
		let items = renderRuleset(ruleapp, ruleset, rulesetIndex);
		all = [...all, ...items];
	});
	return all;
};

const renderRuleset = (ruleapp: RuleApp, ruleset: Ruleset, rulesetIndex: number) => {
	let latest = <RulesetVersionSFC name='latest' path={ruleset.path} ruleapp={ruleapp} ruleset={ruleset} versionIndex={0} rulesetIndex={rulesetIndex} />;
	const versions = valuesPolyfill(ruleset.versions).map((version, versionIndex) => {
		return (<RulesetVersionSFC name={version.version} path={version.path} ruleapp={ruleapp} ruleset={ruleset} rulesetIndex={rulesetIndex} versionIndex={versionIndex + 1} />);
	});
	return [ latest, ...versions];
};

interface RulesetVersionProps {
	name: string,
	path: string,
	ruleapp: RuleApp,
	ruleset: Ruleset,
	rulesetIndex: number,
	versionIndex: number
}

const RulesetVersionSFC: React.SFC<RulesetVersionProps> = ({ name, path, ruleapp, ruleset, rulesetIndex, versionIndex }) => {
	const ruleAppSpan = flatMap(ruleset => valuesPolyfill(ruleset.versions), valuesPolyfill(ruleapp.rulesets)).length + valuesPolyfill(ruleapp.rulesets).length;
	const rulesetSpan = valuesPolyfill(ruleset.versions).length + 1;
	const url = '/ruleapp/' + path;
	return <tr>
		{
			rulesetIndex === 0 && versionIndex === 0 && <td rowSpan={ruleAppSpan}>{ruleapp.name} </td>
		}
		{
			versionIndex === 0 && <td rowSpan={rulesetSpan}>{ruleset.name}</td>
		}
		<td>
			<a href={url} target='_blank'>{name}</a>
		</td>
	</tr>;
};

const mapStateToProps = (state: State): Props => {
	return {
		res: state.res
	};
};

export default connect(mapStateToProps)(Home);
