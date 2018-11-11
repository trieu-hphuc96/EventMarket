import React from 'react'
import {
    BrowserRouter as Router,
    Route,
    Switch
} from 'react-router-dom';

import Admin from './admin/components/admin';
import User from './user/components/user';


class AppRouter extends React.Component {
    render() {
        return (
            <Router>
                <Switch>
                    <Route path="/admin" component={Admin} />
                    <Route path="/" component={User} />
                </Switch>
            </Router>
        );
    }
}

export default AppRouter