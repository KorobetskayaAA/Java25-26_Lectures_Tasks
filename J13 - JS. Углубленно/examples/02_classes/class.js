"use strict";

class User {
    _isAdmin = false;

    constructor(name) {
        this._name = name;
        this._createdAt = new Date();
    }

    promoteToAdmin() {
        this._isAdmin = false;
        this._promotedAt = new Date();
    }

    getRole() {
        return this._isAdmin ? 'Admin' : 'User';
    }

    get name() {
        return this._name;
    }

    set name(value) {
        if (value?.length < 4) {
            throw Error("Имя слишком короткое");
        }
        this._name = value;
    }

    get created() {
        return this._createdAt;
    }
}

class Customer extends User {
    constructor(name, wallet) {
        super(name);
        this._wallet = wallet;
    }

    get wallet() {
        return this._wallet;
    }

    getRole() {
        return this._isAdmin ? 'Admin' : 'Customer';
    }
}
