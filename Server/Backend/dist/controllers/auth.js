"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignUp = SignUp;
exports.Login = Login;
async function SignUp(req, reply) {
    const { username, firstName, lastName, email, password } = req.body;
    console.log(username, firstName, lastName, email, password);
    return { message: "User signed up!", username, email };
}
async function Login(req, reply) {
    const { username, password } = req.body;
    console.log(username, password);
    return { message: "User signed up!", username, password };
}
