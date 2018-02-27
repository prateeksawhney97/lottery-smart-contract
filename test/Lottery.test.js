
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { interface: abi, bytecode } = require('../comple.js');

describe('Lottery', () => {
  let lottery;
  let accounts;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    inbox = await new web3.eth.Contract(JSON.parse(abi))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' });
  });
});