
import firebase from './../firebase';

class UserService {
    constructor() {
        this.database = firebase.database();
    }

    setUser(userHash, phoneNumber) {
        this.database.ref('user/'+userHash).set({
            phoneNumber: phoneNumber
        })
    }
}

const userService = new UserService();

export default userService;