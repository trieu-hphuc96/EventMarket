import React, { Component } from 'react';
import web3 from './web3';
import storehash from './storehash';
import { runInThisContext } from 'vm';
import { css } from 'react-emotion';
import { ClipLoader } from 'react-spinners';
import './App.css';
import UserService from './service/user';
import EventService from './service/event';
import TicketService from './service/ticket';
import TicketDetails from './components/ticket-details';

var sha256 = require('js-sha256');
const Nexmo = require('nexmo');
const nexmo = new Nexmo({
  apiKey: '183b8647',
  apiSecret: 'CnEz6Udfa4HBfcnm'
});
const override = css`
  position: absolute;
  top: 25%;
  left: 43%;  
`;

class App extends Component {
  constructor() {
    super();
    this.state = {
      contractAddress: '',
      tickets: [],
      createTicket: {
        phoneNumber: '',
        verifyCode: '',
      },
      verifyCode: '',
      verify: null,
      ownerHash: '',
      events: {},
      selectedEvent: 0,
      ticketInfo: {},
      loading: false
    };
  }

  componentDidMount() {
    this.getTicket();
    EventService.getEvents((value) => {
      this.setState(state => {
        return {
          ...state,
          events: value
        }
      })
    });


  }

  randomPhoneNum() {
    return Math.floor(Math.random() * 1000000000);
  }

  randomVerifyCode() {
    return Math.floor(Math.random() * 10000);
  }

  randomQuantity() {
    return Math.floor(Math.random() * 100);
  }

  buyTicket = async (e) => {
    e.preventDefault();
    await this.setState(state => {
      return {
        ...state,
        loading: true
      }
    })

    const eventName = this.state.events[this.state.selectedEvent].name;
    const eventPrice = this.state.events[this.state.selectedEvent].price.toString();
    const ownerHash = sha256(this.state.createTicket.phoneNumber);
    const ticketId = sha256(ownerHash + eventName + eventPrice + this.randomQuantity().toString());

    const accounts = await web3.eth.getAccounts();

    console.log(`Ticket ID: ${ticketId}`);
    console.log(`Owner: ${ownerHash}`);
    console.log(`Account: ${accounts[0]}`);

    await storehash.methods.buyTicket(ticketId, ownerHash, eventName, eventPrice).send({
      from: accounts[0],
      value: eventPrice
    }, (error, transactionHash) => {
      console.log(transactionHash);
      this.setState({ transactionHash });
    });

    await storehash.methods.resultMessage().call((e,result) => {
      console.log(result);
      console.log(this.state);
      if(result === "Buy success!!") {
        TicketService.setTicket(ticketId,this.state.createTicket.phoneNumber,this.state.selectedEvent);
      }
    })
    
    console.log("Run getTicket()");
    this.getTicket();
  }

  getTicket = async () => {
    //event.preventDefault();
    //bring in user's metamask account address
    await this.setState(state => {
      return {
        ...state,
        loading: true
      }
    })
    //web3.eth.enable();
    const accounts = await web3.eth.getAccounts();
    console.log(accounts[0]);
    await storehash.methods.getTickets.call().call((error, result) => {
      this.setState(state => {
        return {
          ...state,
          tickets: result
        }
      })
      console.log(this.state.tickets);
    });

    this.setState(state => {
      return {
        ...state,
        loading: false
      }
    })
  };

  updatePhoneNumber(event) {
    event.preventDefault();
    const value = event.target.value;

    this.setState(state => {
      return {
        ...state,
        createTicket: {
          ...state.createTicket,
          phoneNumber: value
        }
      }
    })
  }

  sendVerifyCode(event) {
    event.preventDefault();

    let phoneNumber;
    if (this.state.createTicket.phoneNumber.slice(0, 2) !== "84") {
      phoneNumber = "84" + this.state.createTicket.phoneNumber.slice(1, this.state.createTicket.phoneNumber.length);
    } else {
      phoneNumber = this.state.createTicket.phoneNumber;
    }

    const verifyCode = this.randomVerifyCode().toString();
    this.setState(state => {
      return {
        ...state,
        createTicket: {
          ...state.createTicket,
        },
        verifyCode: verifyCode,
        verify: null
      }
    })

    const messageContent = 'Your verify code: ' + verifyCode;
    console.log(messageContent);
    // nexmo.message.sendSms(
    //   'NEXMO', phoneNumber, messageContent,
    //   (err, responseData) => {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       console.log(responseData);
    //     }
    //   }
    // );
  }

  updateVerifyCode(event) {
    event.preventDefault();
    const value = event.target.value;

    this.setState(state => {
      return {
        ...state,
        createTicket: {
          ...state.createTicket,
          verifyCode: value
        }
      }
    })
  }

  verifyPhoneNumber(event) {
    event.preventDefault();
    this.setState(state => {
      return {
        ...state,
        verify: this.state.verifyCode === this.state.createTicket.verifyCode && this.state.verifyCode !== '' ? true : false,
        ownerHash: sha256(this.state.createTicket.phoneNumber)
      }
    })

    setTimeout(() => {
      console.log(this.state);
      if (this.state.verify) {
        UserService.setUser(this.state.ownerHash, this.state.createTicket.phoneNumber);
      }
    })
  }

  selectEvent(event) {
    const value = event.target.value;
    this.setState(state => {
      return {
        ...state,
        selectedEvent: value
      }
    })
  }

  onDetailsClick(ticketId, event){
    event.preventDefault();

    TicketService.getTicketById(ticketId, (ticketInfo) => {
      console.log(ticketInfo);
      this.setState(state => {
        return {
          ...state,
          ticketInfo: ticketInfo
        }
      })
    })
  }


  render() {
    let userTickets = this.state.tickets.filter((ticket) => {
      return ticket.owner === this.state.ownerHash
    })

    userTickets = userTickets.length === 0 && (this.state.verify === false || this.state.verify === null) ?  this.state.tickets : userTickets;

    return (
      <div className="App container" >
        <header>
          <h1>Event Tickets</h1>
        </header>
        <hr />
        <div>
          <form>
            <div className="row">
              <div className="col">
                <input type="text" className="form-control" placeholder="Phone Number..." value={this.state.createTicket.phoneNumber} onChange={this.updatePhoneNumber.bind(this)} />
              </div>
              <div className="col">
                <button type="button" className="btn btn-dark" onClick={this.sendVerifyCode.bind(this)}>Send Code</button>
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col">
                <input type="text" className="form-control" placeholder="Verify Code..." onChange={this.updateVerifyCode.bind(this)} />
              </div>
              <div className="col">
                <button type="button" className="btn btn-dark" onClick={this.verifyPhoneNumber.bind(this)}>Verify</button> <span>{this.state.verify ? "   Phone number verified!!" : this.state.verify === null ? "" : "   Verify code is wrong!!!"}</span>
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col">
                <div className="input-group mb-3">
                  <select className="custom-select" onChange={this.selectEvent.bind(this)} value={this.state.selectedEvent}>
                    <option key={'default'} value={0}>Choose Event...</option>
                    {
                      Object.keys(this.state.events).map((item, i) => {
                        return item === 'counter' ? '' : (
                          <option key={i} value={item}>{this.state.events[item].name}</option>
                        );
                      })
                    }
                  </select>
                </div>
              </div>
              <div className="col"> <button type="button" className="btn btn-dark" onClick={this.buyTicket.bind(this)} disabled={!this.state.verify}>Buy Ticket</button>
              </div>
            </div>
          </form>
          <hr />
          <div className="table-responsive sweet-loading" style={{ position: 'relative' }}>
            <table className="table table-md " style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th scope="col" style={{ width: '10%' }}>#</th>
                  <th scope="col">Ticket ID</th>
                  <th scope="col" style={{ width: '20%' }}>Event Name</th>
                  <th scope="col" style={{ width: '15%' }}>Price</th>
                  <th scope="col" style={{ width: '15%' }}></th>
                </tr>
              </thead>
              <tbody>
                {
                  userTickets.map((item, i) => {
                    return (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{item['ticketId']}</td>
                        <td>{item['eventName']}</td>
                        <td>{item['price']}</td>
                        <td><button type="button" className="btn btn-dark" onClick={this.onDetailsClick.bind(this, item['ticketId'])}>Details</button></td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>

            <div className="spinner-bg" style={{ display: this.state.loading ? "block" : "none" }}></div>
            <ClipLoader
              className={override}
              sizeUnit={"px"}
              size={150}
              color={'#000'}
              loading={this.state.loading}
            />
          </div>

          <hr></hr>
          <TicketDetails ticketInfo={this.state.ticketInfo} events={this.state.events}></TicketDetails>
        </div>

      </div>
    );
  }
}
export default App;