import React, { Component } from 'react';
import web3 from './web3';
import storehash from './storehash';
import ipfs from './ipfs';
import { css } from 'react-emotion';
import { ClipLoader } from 'react-spinners';

import './App.css';

import UserService from './service/user';
import EventService from './service/event';
import TicketService from './service/ticket';
import TicketDetails from './components/ticket-details';

var QRCode = require('qrcode.react');

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
      events: [],
      selectedEvent: -1,
      ticketInfo: {},
      addEventForm: {
        name: '',
        place: '',
        price: 0,
        quantity: 0
      },
      eventsCid: '',
      getQrCodeByTicketId: '',
      loading: false
    };
  }

  componentWillMount() {
    //get Tickets from blockchain
    this.getTicket();

    //get EventHash and get EventsData from IPFS
    this.getEventHash();

    //get virtual data from Firebase to save on IPFS

    // EventService.getEvents((value) => {
    //   console.log(value);
    //   this.setState(state => {
    //     return {
    //       ...state,
    //       events: [...state.events, value['1'], value['2']]
    //     }
    //   },() => {
    //     console.log(this.state.events)
    //   })
    // });

  }

  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

    await storehash.methods.resultMessage().call((e, result) => {
      console.log(result);
      console.log(this.state);
      if (result === "Buy success!!") {
        TicketService.setTicket(ticketId, this.state.createTicket.phoneNumber, this.state.selectedEvent);
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
    console.log("Current blockchain account: ", accounts[0]);
    await storehash.methods.getTickets.call().call((error, result) => {
      this.setState(state => {
        return {
          ...state,
          tickets: result
        }
      })
      console.log("Tickets: ", this.state.tickets);
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

  onDetailsClick(ticketId, event) {
    event.preventDefault();

    TicketService.getTicketById(ticketId, (ticketInfo) => {
      if (ticketInfo === null) {
        console.log(`Không tìm thấy ${ticketId}!!`);
        return;
      }

      console.log(ticketInfo);
      this.setState(state => {
        return {
          ...state,
          ticketInfo: ticketInfo
        }
      })
    })
  }

  updateEventName(event) {
    event.preventDefault();
    const value = event.target.value;

    this.setState(state => {
      return {
        ...state,
        addEventForm: {
          ...state.addEventForm,
          name: value
        }
      }
    })
  }

  updateEventPlace(event) {
    event.preventDefault();
    const value = event.target.value;

    this.setState(state => {
      return {
        ...state,
        addEventForm: {
          ...state.addEventForm,
          place: value
        }
      }
    })
  }

  updateEventPrice(event) {
    event.preventDefault();
    const value = event.target.value;

    this.setState(state => {
      return {
        ...state,
        addEventForm: {
          ...state.addEventForm,
          price: value
        }
      }
    })
  }

  updateEventQuantity(event) {
    event.preventDefault();
    const value = event.target.value;

    this.setState(state => {
      return {
        ...state,
        addEventForm: {
          ...state.addEventForm,
          quantity: value
        }
      }
    })
  }

  addEvent() {
    this.setState(state => {
      return {
        ...state,
        events: [...state.events, this.state.addEventForm]
      }
    }, () => {
      console.log(this.state.events);
      //save events in ipfs
      ipfs.dag.put(this.state.events, (err, cid) => {
        if (err) {
          console.error('error: ' + err)
        }

        this.setState(state => {
          return {
            ...state,
            eventsCid: cid.toBaseEncodedString()
          }
        }, () => {
          console.log(this.state.eventsCid);
          this.setEventHash();
        })
      })
    })
  }

  setEventHash = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log(accounts[0]);
    await storehash.methods.setEventHash(this.state.eventsCid).send({
      from: accounts[0]
    }, (error, transactionHash) => {
      console.log(transactionHash);
      this.setState({ transactionHash });
    });
  };

  getEventHash = async () => {
    await storehash.methods.eventHash().call((e, result) => {
      console.log("Event Hash: ", result);
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

  getEventsData() {
    //get events from eventsCid
    ipfs.dag.get(this.state.eventsCid, (err, result) => {
      if (err) {
        console.error('error: ' + err)
        throw err
      }
      console.log("Events: ", result.value)
      this.setState(state => {
        return {
          ...state,
          events: result.value
        }
      })
    })
  }

  onGetQrCodeClick(ticketId, event) {
    event.preventDefault();

    console.log("onGetQrCodeClick", ticketId);
    this.setState(state => {
      return {
        ...state,
        getQrCodeByTicketId: ticketId
      }
    })
  }


  render() {
    let userTickets = this.state.tickets.filter((ticket) => {
      return ticket.owner === this.state.ownerHash
    })

    userTickets = userTickets.length === 0 && (this.state.verify === false || this.state.verify === null) ? this.state.tickets : userTickets;

    return (
      <div className="App container" >
        <header>
          <h1><strong>Event Tickets</strong></h1>
        </header>
        <hr />
        <div>
          <form>
            {/* Login */}
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
                <button type="button" className="btn btn-dark" onClick={this.verifyPhoneNumber.bind(this)}>Verify</button>&nbsp; <span>{this.state.verify ? "Phone number verified!!" : this.state.verify === null ? "" : "Verify code is wrong!!!"}</span>
              </div>
            </div>
            <hr />
            {/* Add Event */}
            <header className="offset-sm-1">
              <h3>Add Event</h3>
            </header>
            <div className="form-group row">
              <label htmlFor="eventName" className="col-sm-1 col-form-label">Name:</label>
              <div className="col-sm-5">
                <input type="text" className="form-control" id="eventName" value={this.state.addEventForm.name} onChange={this.updateEventName.bind(this)} />
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="eventPlace" className="col-sm-1 col-form-label">Place:</label>
              <div className="col-sm-5">
                <input type="text" className="form-control" id="eventPlace" value={this.state.addEventForm.place} onChange={this.updateEventPlace.bind(this)} />
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="eventPrice" className="col-sm-1 col-form-label">Price:</label>
              <div className="col-sm-5">
                <input type="number" className="form-control" id="eventPrice" value={this.state.addEventForm.price} onChange={this.updateEventPrice.bind(this)} />
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="eventQuantity" className="col-sm-1 col-form-label">Quantity:</label>
              <div className="col-sm-5">
                <input type="number" className="form-control" id="eventQuantity" value={this.state.addEventForm.quantity} onChange={this.updateEventQuantity.bind(this)} />
              </div>
            </div>
            <div className="form-group row">
              <div className="offset-sm-1 col-sm-5">
                <button type="button" className="btn btn-dark" onClick={this.addEvent.bind(this)}>Add Event</button>
              </div>
            </div>
            <hr />
            {/* Buy Ticket */}
            <div className="row">
              <div className="col">
                <div className="input-group mb-3">
                  <select className="custom-select" onChange={this.selectEvent.bind(this)} value={this.state.selectedEvent}>
                    <option key={'default'} value={-1}>Choose Event...</option>
                    {
                      this.state.events.map((item, i) => {
                        return (
                          <option key={i} value={i}>{item.name}</option>
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
                  <th scope="col" style={{ width: '25%' }}></th>
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
                        <td>{this.numberWithCommas(item['price']) + ' wei'}</td>
                        <td>
                          <button type="button" className="btn btn-dark" style={{ marginRight: '10px' }} onClick={this.onGetQrCodeClick.bind(this, item['ticketId'])}>Get QR Code</button>
                          <button type="button" className="btn btn-dark" onClick={this.onDetailsClick.bind(this, item['ticketId'])}>Details</button>
                        </td>
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

          {this.state.getQrCodeByTicketId === '' ? '' : (
            <div>
              <hr></hr>
              <p>
                <span className="h2" style={{ marginRight: '40px' }}>Ticket Id: </span>
                {this.state.getQrCodeByTicketId}
              </p>
              <header style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '40px' }}>
                <h2>QR Code:</h2>
              </header>
              <QRCode style={{ display: 'inline-block', verticalAlign: 'middle' }} value={"http://localhost:3000/" + this.state.getQrCodeByTicketId} />
            </div>
          )}

          <hr></hr>
          <TicketDetails ticketInfo={this.state.ticketInfo} events={this.state.events}></TicketDetails>
        </div>

      </div>
    );
  }
}
export default App;