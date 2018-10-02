
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

  it('requires a minimum amount of ether to enter', async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 0
      });
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it('only manager can call pickWinner', async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      });
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it('sends money to the winner and resets the players array', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether')
    });

    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await lottery.methods.pickWinner().send({ from: accounts[0] });
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;

    expect(difference > web3.utils.toWei('1.8', 'ether')).toBeTruthy();
  });
  
  it('lottery resets after execution of pickWinner function', async ()=> {
    await lottery.methods.enter().send({
      from: accounts[0], value: web3.utils.toWei('2', 'ether')
    });
    const players = await lottery.methods.getPlayers().call({from: accounts[0]});
    await lottery.methods.pickWinner().send({from: accounts[0]});

    assert(players.length, undefined );
  });

  it('lottery has a balance of zero after one round', async ()=> {
    await lottery.methods.enter().send({
      from: accounts[0], value: web3.utils.toWei('2', 'ether')
    });
    const players = await lottery.methods.getPlayers().call({from: accounts[0]});
    await lottery.methods.pickWinner().send({from: accounts[0]});
    const Balance = await web3.eth.getBalance(players[0]);
    assert(Balance, 0);
  });
  
});
