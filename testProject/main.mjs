import { split } from './modules/moduleOne.js';
import { sayHello } from './modules/moduleTwo.js';

const x = 1;
const y = 2;

const users = 'Mona Omar Mohamd';
const splitedUsers = split(users);

for (let i = 0; i < splitedUsers.length; i++) {
	console.log(sayHello(splitedUsers[i]));
}