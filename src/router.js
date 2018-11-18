import React from 'react'
import {
    BrowserRouter as Router,
    Route,
    Switch
} from 'react-router-dom';

import App from './App';
import VerifyTicket from './components/verifyTicket';


class AppRouter extends React.Component {
    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path="/" component={App} />
                    <Route path="/:ticketId" component={VerifyTicket} />
                </Switch>
            </Router>
        );
    }
}

export default AppRouter