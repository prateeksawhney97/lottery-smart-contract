
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { interface: abi, bytecode } = require('../comple.js');

describe('Lottery', () => {
  let lottery;
  let accounts;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    lottery = await new web3.eth.Contract(JSON.parse(abi))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' });
  });

  it('deploys a contract', () => {
    expect(lottery.options.address).toBeTruthy()
  });

  it('allows one account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    expect(accounts[0]).toEqual(players[0])
    expect(1).toEqual(players.length)
  });


  it('allows multiple accounts to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });

    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    });

    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    expect(accounts[0]).toEqual(players[0])
    expect(accounts[1]).toEqual(players[1])
    expect(accounts[2]).toEqual(players[2])
    expect(3).toEqual(players.length)
  });

  it('requires a minimum amount of ether to enter', () => {
    expect(async () => {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 0
      });
    }).toThrow();
  });
});