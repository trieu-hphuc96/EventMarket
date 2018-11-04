import firebase from './../firebase';

class TicketService {
    constructor() {
        this.database = firebase.database();
    }

    getTickets(callback) {
        this.database.ref('ticket').on('value', (snapshot) => {
            callback(snapshot.val());
        })
    }

    getTicketById(ticketId, callback) {
        this.database.ref('ticket/'+ ticketId).on('value', (snapshot) => {
            callback(snapshot.val());
        })
    }

    setTicket(ticketId, phoneNumber, eventId) {
        this.database.ref('ticket/' + ticketId).set({
            phoneNumber: phoneNumber,
            eventId: eventId
        })
    }
}

const ticketService = new TicketService();

export default ticketService;