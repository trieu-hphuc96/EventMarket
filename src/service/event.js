import firebase from './../firebase';

class EventService {
    constructor() {
        this.database = firebase.database();
    }

    getEvents(callback) {
        this.database.ref('event').on('value', (snapshot) => {
            callback(snapshot.val());
        })
    }
}

const eventService = new EventService();

export default eventService;