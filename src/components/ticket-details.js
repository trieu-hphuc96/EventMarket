import React, { Component } from 'react';
import PropTypes from 'prop-types';

class TicketDetails extends Component {
    constructor() {
        super();
    }

    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    render() {
        return Object.keys(this.props.ticketInfo).length === 0 ? '' : (
            <div className="App container" >
                <header>
                    <h1>Ticket Details</h1>
                </header>
                <hr />
                <div>
                    <form>
                        <div className="row">
                            <div className="col">
                                {'Owner\'s Phone Number: ' + this.props.ticketInfo.phoneNumber}
                            </div>
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col">
                                {'Event Name: ' + this.props.events[this.props.ticketInfo.eventId].name}
                            </div>
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col">
                                {'Place: ' + this.props.events[this.props.ticketInfo.eventId].place}
                            </div>
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col">
                                {'Price: ' + this.numberWithCommas(this.props.events[this.props.ticketInfo.eventId].price) + ' wei'}
                            </div>
                        </div>
                    </form>
                </div>

            </div>
        );
    }
}

TicketDetails.propTypes = {
    ticketInfo: PropTypes.object,
    events: PropTypes.object
};

export default TicketDetails;