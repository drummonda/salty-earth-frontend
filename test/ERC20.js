const ERC20 = artifacts.require("ERC20");

contract("ERC20", accounts => {

	// define several users based on the accounts
	const owner = accounts[0];
	const user1 = accounts[1];
	const user2 = accounts[2];

	// deployed contract instances
	let erc20;

	// deploys a contract via owner account
	const deploy = async () => {
		erc20 = await ERC20.deployed(1000, "SlotToken", "SLT");
	}

	describe("Initial state", () => {
		beforeEach(deploy);

		it("the owner account holds the initial supply", async () => {
			const balance = await erc20.balanceOf.call(accounts[0]);
		 	assert.equal(balance.valueOf(), 1000, "1000 wasn't in the first account");
		});

		it("has a name and symbol", async () => {
			const name = await erc20.name.call();
			const symbol = await erc20.symbol.call();
			assert.equal(name, "SlotToken", "Name was not found");
			assert.equal(symbol, "SLT", "Symbol was not found");
		});
	});	

})