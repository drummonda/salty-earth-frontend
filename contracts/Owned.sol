pragma solidity ^0.5.0;

/**
 * The Owned contract designed to restrict contract actions to certain parties
 */
contract Owned {
	
	/* -------------- Contract variables --------------*/
	address public owner;
	mapping (address => bool) public approved;

	/* -------------- Constructor --------------*/
	constructor() {
		owner = msg.sender;
	}

	/* -------------- only owner can perform this action --------------*/
	modifier onlyOwner {
		require(
					msg.sender == owner,
					"only the contract owner can call this function"
				);
		_;
	}

	/* -------------- only approved can perform this action --------------*/
	modifier onlyApproved {
		require(
					approved[msg.sender] == true,
					"only approved addresses can call this function"
				);
		_;
	}

	/* -------------- transfer the ownership to a new party --------------*/
	function transferOwnership(address newOwner) public onlyOwner {
		owner = newOwner;
	}

	/* -------------- mark a given address as approved --------------*/
	function approveAddress(address _address) internal {
		approved[_address] = true;
	}

	/* -------------- remove approval priveleges for an address --------------*/
	function removeApproval(address _address) internal {
		approved[_address] = false;
	}
}
