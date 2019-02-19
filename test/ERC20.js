const ERC20 = artifacts.require("ERC20");
const BN = require('bn.js');
const Web3 = require("web3");
const web3 = new Web3("http://localhost:8080");

contract("ERC20", accounts => {

	// define several users based on the accounts
	const owner = accounts[0];
	const user1 = accounts[1];
	const user2 = accounts[2];

	// deployed contract instances
	let erc20;

	// deploys a contract via owner account
	const deploy = async () => {
		erc20 = await ERC20.deployed("SlotToken", "SLT");
	}

	// creates a big number in wei, given a token input
	// const tokensInWei = tokens => {
	// 	// create a string representation of n
	// 	const str = tokens + '0'.repeat(18);
	// 	// return the big number representation
	// 	return new BN(str, 10);
	// }

	describe("Initial state", () => {
		beforeEach(deploy);

		it("has a total supply", async () => {
			const totalSupply = await erc20.totalSupply.call();
		 	assert.ok(totalSupply);
		});

		it("has a name and symbol", async () => {
			const name = await erc20.name.call();
			const symbol = await erc20.symbol.call();
			assert.equal(name, "SlotToken", "Name was not found");
			assert.equal(symbol, "SLT", "Symbol was not found");
		});

		it("has only a small balance for deployer", async () => {
			const balanceInWei = await erc20.balanceOf.call(owner);
			const balance = await web3.utils.fromWei(balanceInWei.toString(), "ether");
			assert.equal(balance, 100);
		})
	});	

	describe("Contract functions", () => {
		beforeEach(deploy);

		it("has a function transfer, allowing a user to transfer tokens", async () => {
			// grab the tokens in wei first
			const tokensInWei = await web3.utils.toWei('10');
			// owner will transfer 10 tokens to user1
			await erc20.transfer(user1, tokensInWei, { from: owner });
			const balanceInWei = await erc20.balanceOf.call(user1);
			const balanceUser1 = await web3.utils.fromWei(balanceInWei.toString(), "ether");
			assert.equal(balanceUser1, 10);
		});

		it("has a function transfer, a user cannot transfer tokens they don't have", async () => {
			try {
				// grab the tokens in wei first
				const tokensInWei = await web3.utils.toWei('10');
				// owner will transfer 10 tokens to user1
				await erc20.transfer(user1, tokensInWei, { from: user2 });
				// the test was supposed to throw an error
				assert.fail("The test was supposed to fail!")
			} catch (err) {
				// if an error was thrown then we good
			}
		});

		it("has a function approve, a user can set an allowance for another address", async () => {
			// grab the tokens in wei first
			const tokensInWei = await web3.utils.toWei('10');
			// owner will approve user1 to spend 10 tokens on their behalf
			await erc20.approve(user1, tokensInWei, { from: owner });
			// user1 can transfer 10 tokens to user2 on behalf of owner
			await erc20.transferFrom(owner, user2, tokensInWei, { from: user1 });
			// check user2's token balance
			const balanceInWei = await erc20.balanceOf.call(user2);
			// grab balance in eth
			const balanceOfUser2 = await web3.utils.fromWei(balanceInWei);
			// does it equal 10?
			assert.equal(balanceOfUser2, 10);
		})
	})

})