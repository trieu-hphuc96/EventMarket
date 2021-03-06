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
                <hr />
                <header>
                    <h2>Ticket Details</h2>
                </header>
                <hr />
                <div>
                    <form>
                        <div className="row">
                            <div className="col">
                                {'Ticket ID: ' + this.props.ticketInfo.ticketId}
                            </div>
                        </div>
                        <hr />
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
                <hr />
            </div>
        );
    }
}

TicketDetails.propTypes = {
    ticketInfo: PropTypes.object,
    events: PropTypes.array
};

export default TicketDetails;