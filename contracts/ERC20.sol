pragma solidity ^0.5.0;

interface tokenRecipient {
    function receiveApproval(address _from, uint256 _value, address _token, bytes calldata _extraData) external;
}

/**
 * The ERC20 contract is an Ethereum ERC20 Fungible Asset Token
 */
contract ERC20 {

	/* -------------- Contract variables --------------*/
	string public name;
	string public symbol;
	uint8 public constant decimals = 18;
	uint256 public totalSupply;

	mapping (address => uint256) public balanceOf;
	mapping (address => mapping (address => uint256)) allowance;
	
	/* -------------- Contract Events --------------*/
	event Transfer(address indexed from, address indexed to, uint256 value);
	event Approval(address indexed _owner, address indexed _spender, uint256 _value);
	event Burn(address indexed from, uint256 value);

	/* -------------- Constructor function --------------*/
	constructor (string memory tokenName, string memory tokenSymbol) public {
		name = tokenName;
		symbol = tokenSymbol;
        totalSupply = 1000 * 10 **uint(decimals);
        balanceOf[msg.sender] = 100 * 10**uint(decimals);
	}

	/**
     * Internal transfer, can oly be called by this contract
     */
    function _transfer (address _from, address _to, uint _value) internal {
    	require(
    		_to != address(0), 
    		"a transfer can only be sent to a valid Ethereum address"
    	);
    	require(
    		balanceOf[_from] >= _value,
    		"the sender does not have enough tokens to send"
    	);
    	require(
    		balanceOf[_to] + _value >= balanceOf[_to], 
    		"the transfer amount cannot be negative"
    	);
    	uint previousBalances = balanceOf[_from] + balanceOf[_to];
    	balanceOf[_from] -= _value;
    	balanceOf[_to] += _value;
    	emit Transfer(_from, _to, _value);
        // the previous balances must equate to the new balances
    	assert(balanceOf[_from] + balanceOf[_to] == previousBalances);
    }

    /**
     * Transfer tokens
     *
     * Send `_value` tokens `_to` from your account
     *
     * @param _to the address of the recipient
     * @param _value the amount to send
     */
    function transfer (address _to, uint256 _value) public returns (bool success) {
        _transfer(msg.sender, _to, _value);
        return true;
    }

    /**
     * Transfer tokens from other address
     *
     * Send `_value` tokens `_to` in behalf of `_from`
     *
     * @param _from the address of the sender
     * @param _to the address of the recipient
     * @param _value the amount to send
     */
    function transferFrom (address _from, address _to, uint256 _value) public returns (bool success) {
        require(
            _value <= allowance[_from][msg.sender],
            "the value of tokens to send cannot be greater than the allowance for this address"
        );
        allowance[_from][msg.sender] -= _value;
        _transfer(_from, _to, _value);
        return true;
    }

    /**
     * Set allowance for other address
     *
     * Allows `_spender` to spend no more than `_value` tokens on your behalf
     *
     * @param _spender the address authorized to spend
     * @param _value the amount to send
     */
    function approve (address _spender, uint256 _value) public returns(bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     * Set allowance for other address and notify
     *
     * Allows `_spender` to spend no more than `_value` tokens on your behalf
     *
     * @param _spender the address authorized to spend
     * @param _value the amount to send
     * @param _extraData some extra information to send to the approved contract
     */
    function approveAndCall (address _spender, uint256 _value, bytes memory _extraData) public returns(bool success) {
        tokenRecipient spender = tokenRecipient(_spender);
        if (approve(_spender, _value)) {
            spender.receiveApproval(msg.sender, _value, address(this), _extraData);
            return true;
        }
    }

    /**
     * Destroy tokens from the other account
     *
     * Remove `_value` tokens from the system irreversibly
     *
     * @param _value the amount of money to burn
     */
    function burn (uint256 _value) public returns (bool success) {
        require(
            balanceOf[msg.sender] >= _value,
            "the value to burn must be less than or equal to the number of tokens owned"
        );
        balanceOf[msg.sender] -= _value;
        totalSupply -= _value;
        emit Burn(msg.sender, _value);
        return true;
    }

    /**
     * Destroy tokens from the other account
     *
     * Remove `_value` tokens from the system irreversibly on behalf of `_from`
     *
     * @param _from the address of the sender
     * @param _value the amount of money to burn
     */
    function burnFrom (address _from, uint256 _value) public returns (bool success) {
        require(
            balanceOf[_from] >= _value,
            "the value to burn must be less than or equal to the number of tokens owned"
        );
        require(
            _value <= allowance[_from][msg.sender],
            "the value to burn must be less than or equal to the number of tokens allowed for this address"
        );
        balanceOf[_from] -= _value;
        allowance[_from][msg.sender] -= _value;
        totalSupply -= _value;
        emit Burn(_from, _value);
        return true;
    }

}