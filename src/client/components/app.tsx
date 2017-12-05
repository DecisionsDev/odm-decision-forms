import * as React from 'react';
import {connect} from 'react-redux';
import {Switch, Route} from 'react-router-dom';
import {withRouter} from 'react-router';
import {State} from "../state";
import Forms from './forms';
import Home from './home';

interface Props {
}

const App: React.SFC<Props> = () => (
	<div>
		<Switch>
			<Route exact path='/' component={Home}/>
			<Route path='/ruleapp/*' component={Forms}/>
		</Switch>
	</div>
);

const mapStateToProps = (state : State ) : Props => {
	return {
	};
};

export default withRouter(connect(mapStateToProps)(App));
