const SlotToken = artifacts.require("SlotToken");
const Web3 = require("web3");
const ganache = require("ganache-cli");
const web3 = new Web3('http://localhost:8545');

contract("SlotToken", accounts => {

	// define several users based on the accounts
	const owner = accounts[0];
	const user1 = accounts[1];
	const user2 = accounts[2];

	// deployed contract instances
	let token;

	// deploys a contract via owner account
	const deploy = async () => {
		token = await SlotToken.new("SlotToken", "SLT", { from: owner });
	}

	describe("Initial state", () => {
		beforeEach(deploy);

		it("has variable buyPrice - starts with a buyPrice", async () => {
			const buyPrice = await token.buyPrice.call();
		 	assert.ok(buyPrice);
		});

		it("has variable sellPrice - starts with a sellPrice", async () => {
			const sellPrice = await token.sellPrice.call();
		 	assert.ok(sellPrice);
		});

		it("has variable owner - the deployer has a unique privelege", async () => {
			const ownerAddr = await token.owner.call();
			assert.equal(owner, ownerAddr);
		});
	});	

	describe("Contract functions", async () => {
		beforeEach(deploy);

		it("has function payable - the contract can accept ether", async () => {
			// 1 eth in wei
			const oneETH = await web3.utils.toWei('1');
			// grab initial contract account balance
			const initTokenBalance = await web3.eth.getBalance(token.address);
			// send the contract 1 eth from owner account
			await web3.eth.sendTransaction({
				from: owner,
				to: token.address,
				value: oneETH
			});
			// grab the new token balance
			const newTokenBalance = await web3.eth.getBalance(token.address);
			// make sure they are different
			assert.equal(initTokenBalance, 0);
			assert.equal(newTokenBalance, oneETH);
		});

		it("has function setPrices - the owner can modify prices", async () => {
			// 1 eth in wei
			const oneETH = await web3.utils.toWei('1');
			// old buyPrice
			const oldBuyPrice = await token.buyPrice.call();
			// old sellPrice
			const oldSellPrice = await token.sellPrice.call();
			// set the prices to 1 eth, for simplicity
			await token.setPrices(oneETH, oneETH, { from: owner });
			// old buyPrice
			const newBuyPrice = await token.buyPrice.call();
			// old sellPrice
			const newSellPrice = await token.sellPrice.call();
			// make sure the original prices are different from the new
			assert.notEqual(oldBuyPrice, newBuyPrice);
			assert.notEqual(oldSellPrice, newSellPrice);
			assert.equal(newSellPrice, oneETH);
			assert.equal(newBuyPrice, oneETH);
		});

		it("has function setPrices - a non-owner cannot modify prices", async () => {
			try {
				// 1 eth in wei
				const oneETH = await web3.utils.toWei('1');
				// set the prices to 1 eth, for simplicity
				await token.setPrices(oneETH, oneETH, { from: user1 });
				// yowza, we was supposed to see an error
				assert.fail("The test was supposed to throw an error!");
			} catch (err) {
				// do nothing, the test was supposed to throw an error 
			}
		});

		it("has function buy - address can buy SLT with ETH", async () => {
			// 1 eth in wei
			const oneETH = await web3.utils.toWei("1", "ether");
			// old totalSupply - new tokens will be minted here
			const oldTotalSupply = await token.totalSupply.call();
			// user1 old token balance
			const oldTokenBalanceUser1 = await token.balanceOf.call(user1);
			// user1 buys 1 eth worth of tokens
			token.buy({ from: user1, value: oneETH });
			// new totalSupply - see if new tokens are minted
			const newTotalSupply = await token.totalSupply.call();
			// user1 new token balance
			const newTokenBalanceUser1 = await token.balanceOf.call(user1);
			// get new token balance in eth
			const balanceInEth = await web3.utils.fromWei(newTokenBalanceUser1);
			// check to see if conditions pass
			assert.ok(oldTokenBalanceUser1 < newTokenBalanceUser1);
			assert.ok(oldTotalSupply < newTotalSupply);
			assert.equal(balanceInEth, 1000);
		});

		it("has function sell - address can sell SLT for ETH", async () => {
			// 1 eth in wei
			const oneETH = await web3.utils.toWei("1", "ether");
			// .5 eth in wei
			const fivehundoSLT = await web3.utils.toWei("500", "ether");
			// user1 buys 1 eth worth of tokens
			token.buy({ from: user1, value: oneETH });
			// old totalSupply - new tokens will be minted here
			const oldTotalSupply = await token.totalSupply.call();
			// user1 old token balance
			const oldTokenBalanceUser1 = await token.balanceOf.call(user1);
			// user1 old token balance in eth
			const oldTokenBalanceUser1Eth = await web3.utils.fromWei(oldTokenBalanceUser1);
			console.log("old token balance", oldTokenBalanceUser1Eth);
			// // user1 sells 500 SLT tokens
			token.sell(`${oldTokenBalanceUser1}`, { from: user1 });
			// new totalSupply - see if tokens are burned
			const newTotalSupply = await token.totalSupply.call();
			// user1 new token balance
			const newTokenBalanceUser1 = await token.balanceOf.call(user1);
			// get new token balance in eth
			const newTokenBalanceUser1Eth = await web3.utils.fromWei(newTokenBalanceUser1);
			console.log("new Token balance", newTokenBalanceUser1Eth);
			// check to see if conditions pass
			assert.ok(oldTokenBalanceUser1Eth > newTokenBalanceUser1Eth);
			assert.ok(oldTotalSupply > newTotalSupply);
			assert.equal(balanceInEth, 500);
		})
	})

})