import React, { Component } from 'react';
import storehash from './../storehash';
import ipfs from './../ipfs';
import TicketService from './../service/ticket';
import TicketDetails from './ticket-details';

class VerifyTicket extends Component {
    constructor() {
        super();

        this.state = {
            eventsCid: '',
            events: [],
            ticketInfo: {},
            isVerify: null
        }
    }

    componentDidMount() {
        console.log('TicketDetails componentDidMount');
        console.log(this.props);
        console.log(this.props.match.params.ticketId);

        this.verifyTicket();
    }

    verifyTicket() {
        this.getEventHash().then(() => {
            TicketService.getTicketById(this.props.match.params.ticketId, (ticketInfo) => {
                if (ticketInfo === null) {
                    console.log(`Không tìm thấy ${this.props.match.params.ticketId}!!`);
                    this.setState(state => {
                        return {
                            ...state,
                            isVerify: false
                        }
                    })
                    return;
                }

                console.log(ticketInfo);
                this.setState(state => {
                    return {
                        ...state,
                        ticketInfo: ticketInfo,
                        isVerify: true
                    }
                })
            })
        });
    }

    getEventHash = async () => {
        await storehash.methods.eventHash().call((e, result) => {
            console.log(result);
            this.setState(state => {
                return {
                    ...state,
                    eventsCid: result
                }
            }, () => {
                this.getEventsData();
            })
        })
    };

    getEventsData = async () => {
        //get events from eventsCid
        console.log(this.state.eventsCid)
        await ipfs.dag.get(this.state.eventsCid, (err, result) => {
            if (err) {
                console.error('error: ' + err)
                throw err
            }
            console.log(result.value)
            this.setState(state => {
                return {
                    ...state,
                    events: result.value
                }
            })
        })
    }

    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    render() {
        return (
            <div className="App container" style={{ marginTop: '10px' }}>
                <h5>{this.state.isVerify ? `Ticket ${this.props.match.params.ticketId} verified!!!` : this.state.isVerify === null ? '' : `Not found ${this.props.match.params.ticketId}!!!`}</h5>
                {this.state.events.length > 0 ? <TicketDetails ticketInfo={this.state.ticketInfo} events={this.state.events}></TicketDetails> : ""}
            </div>
        );
    }
}

export default VerifyTicket;