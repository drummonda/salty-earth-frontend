pragma solidity ^0.5.0;

import './ERC20.sol';

/**
 * A token for using the slot machines, SlotToken
 */
contract SlotToken is ERC20 {

	/* -------------- Contract variables --------------*/
    uint256 public sellPrice;
    uint256 public buyPrice;

    /* -------------- Constructor function --------------*/
    constructor (string memory tokenName, string memory tokenSymbol)
    ERC20(tokenName, tokenSymbol) public {}

    /* -------------- Accept Ether --------------*/
    function() external payable {}

    /* Mint Tokens
     *
     * @notice create `mintedAmount` tokens and send to `target`
     * @param target Address to receive the tokens
     * @param mintedAmount the amount of tokens it will receive
    */
    function mintToken (address _target, uint256 _amount) internal {
        balanceOf[_target] += _amount;
        totalSupply += _amount;
        emit Transfer(address(0), address(this), _amount);
    }

    /* Set prices for new tokens
     *
     * @notice Allow users to buy tokens for `_buyPrice` eth and sell tokens for `_sellPrice` eth
     * @param _sellPrice Price the users can sell to the contract
     * @param _buyPrice Price users can buy from the contract
    */
    // function setPrices(uint256 _sellPrice, uint256 _buyPrice) onlyOwner public {
    //     sellPrice = _sellPrice;
    //     buyPrice = _buyPrice;
    // }

    /* User can buy tokens from contract
     *
     * @notice Buy tokens from contract by sending ether
    */
    function buy() public payable returns (uint amount) {
        // Amount is number of tokens they can buy
        amount = msg.value / buyPrice;
        _transfer(address(this), msg.sender, amount);
    }

    /* Users can sell tokens to contract
     *
     * @notice Sell `_amount` tokens to contract
     * @param _amount is amount of tokens to be sold
    */
    function sell(uint _amount) public returns (uint revenue) {
        require(
        	address(this).balance >= _amount * sellPrice,
        	"the contract needs to have enough ether to buy the SLT tokens"
        );
        _transfer(msg.sender, address(this), _amount);
        msg.sender.transfer(revenue);
        emit Transfer(msg.sender, address(this), _amount);
    }
}
