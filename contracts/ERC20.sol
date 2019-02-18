pragma solidity ^0.5.0;

/**
 * The ERC20 contract is an Ethereum ERC20 Fungible Asset Token
 */
contract ERC20 {

	/* -------------- Contract variables --------------*/
	string public name;
	string public symbol;
	uint8 public decimals = 18;
	uint256 public totalSupply;

	mapping (address => uint2556) public balanceOf;
	mapping (address => mapping (address => uint256)) allowance;
	
	/* -------------- Contract Events --------------*/
	event Transfer(address indexed from, address indexed to, uint256 value);
	event Approval(address indexed _owner, address indexed _spender, uint256 _value);
	event Burn(address indexed from, uint256 value);

	/* -------------- Constructor function --------------*/
	constructor (uint256 initialSupply, string tokenName, string tokenSymbol) {
		totalSupply = initialSupply * 10 * uint256(decimals);
		balanceOf[msg.sender] = initialSupply;
		name = tokenName;
		symbol = tokenSymbol;
	}

	/**
     * Internal transfer, can oly be called by this contract
     */
    function _transfer (address _from, address _to, uint _value) internal {
    	require(
    				_to != 0x0, 
    				"a transfer can only be sent to a valid Ethereum address"
    			);
    	require(
    				balanceOf[_from] >= _value,
    				"the sender does not have enough tokens to send"
    			);
    	require(
    				balanceOf[_to] _ _value >= balanceOf[_to], 
    				"the transfer amount cannot be negative"
    			);
    	uint previousBalances = balanceOf[_from] + balanceOf[_to];
    	balanceOf[_from] -= _value;
    	balanceOf[_to] += _value;
    	emit Transfer(_from, _to, _value);
    	assert(
    				balanceOf[_from] + balanceOf[_to] == previousBalances,
    				"the previous balances must equate to the new balances"
    		   )
    }

}