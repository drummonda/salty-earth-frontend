const ERC20 = artifacts.require("ERC20");
const Web3 = require("web3");
const ganache = require("ganache-cli");
const web3 = new Web3(ganache.provider());

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

	describe("Initial state", () => {
		beforeEach(deploy);

		it("has variable totalSupply - starts with a total supply", async () => {
			const totalSupply = await erc20.totalSupply.call();
		 	assert.ok(totalSupply);
		});

		it("has variables name, symbol - starts with a name and symbol", async () => {
			const name = await erc20.name.call();
			const symbol = await erc20.symbol.call();
			assert.equal(name, "SlotToken");
			assert.equal(symbol, "SLT");
		});

		it("has variable initialBalance - starts with a small balance for deployer", async () => {
			const balanceInWei = await erc20.balanceOf.call(owner);
			const balance = await web3.utils.fromWei(balanceInWei.toString(), "ether");
			assert.equal(balance, 100);
		})
	});	

	describe("Contract functions", () => {
		beforeEach(deploy);

		it("has function transfer - user can transfer tokens", async () => {
			// grab the tokens in wei first
			const tokensInWei = await web3.utils.toWei('10');
			// owner will transfer 10 tokens to user1
			await erc20.transfer(user1, tokensInWei, { from: owner });
			// grab the balance of user1 in wei
			const balanceInWei = await erc20.balanceOf.call(user1);
			// convert the balance of user1 into eth
			const balanceOfUser1 = await web3.utils.fromWei(balanceInWei.toString(), "ether");
			// the balance should be 10 tokens
			assert.equal(balanceOfUser1, 10);
		});

		it("has function transfer - a user cannot transfer tokens they don't have", async () => {
			try {
				// grab the tokens in wei first
				const tokensInWei = await web3.utils.toWei('10');
				// owner will transfer 10 tokens to user1
				await erc20.transfer(user1, tokensInWei, { from: user2 });
				// the test was supposed to throw an error
				assert.fail("The test was supposed to throw an error!")
			} catch (err) {
				// if an error was thrown then we good
			}
		});

		it("has function transferFrom - a user can set an allowance for another address", async () => {
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
		});

		it("has function transferFrom - an unapproved user cannot transfer another's tokens", async () => {
			try {
				// grab the tokens in wei first
				const tokensInWei = await web3.utils.toWei('10');
				// user1 can transfer 10 tokens to user2 on behalf of owner
				await erc20.transferFrom(owner, user2, tokensInWei, { from: user1 });
				// if we get here then something is wrong
				assert.fail("The test was supposed to throw an error!")
			} catch (err) {
				// do nothing, the test was supposed to throw an error
			}
		});

		it("has function burn - a user can destroy their tokens", async () => {
			// grab the tokens in wei first
			const tokensInWei = await web3.utils.toWei('10');
			// grab the totalSupply
			const totalSupply = await erc20.totalSupply.call();
			// burn the tokens, from the owner
			await erc20.burn(tokensInWei, { from: owner });
			// grab the new totalSupply
			const newTotalSupply = await erc20.totalSupply.call();
			// did the total supply go down
			assert.equal(totalSupply - tokensInWei, newTotalSupply);
		});

		it("has function burn - a user cannot destroy tokens if they don't have any", async () => {
			try {
				// grab the tokens in wei first
				const tokensInWei = await web3.utils.toWei('10');
				// burn the tokens, from the owner
				await erc20.burn(tokensInWei, { from: user1 });
				// if we get here then something is wrong
				assert.fail("The test was supposed to throw an error!");
			} catch (err) {
				// do nothing, it's supposed to throw an error
			}
		});

		it("has function burnFrom - a user can be approved to burn another address' tokens", async () => {
			// grab the tokens in wei first
			const tokensInWei = await web3.utils.toWei('10');
			// grab the totalSupply
			const totalSupply = await erc20.totalSupply.call();
			// owner will approve user1 to spend 10 tokens on their behalf
			await erc20.approve(user1, tokensInWei, { from: owner });
			// user1 can transfer 10 tokens to user2 on behalf of owner
			await erc20.burnFrom(owner, tokensInWei, { from: user1 });
			// grab the new totalSupply
			const newTotalSupply = await erc20.totalSupply.call();
			// did the total supply go down
			assert.equal(totalSupply - tokensInWei, newTotalSupply);
		});

		it("has function burnFrom - an unapproved user cannot destroy another's tokens", async () => {
			try {
				// grab the tokens in wei first
				const tokensInWei = await web3.utils.toWei('10');
				// burn the tokens, from the owner
				await erc20.burnFrom(owner, tokensInWei, { from: user1 });
				// if we get here then something is wrong
				assert.fail("The test was supposed to throw an error!");
			} catch (err) {
				// do nothing, it's supposed to throw an error
			}
		});
	})

})