const ERC20 = artifacts.require("./ERC20.sol");

module.exports = function(deployer) {
  deployer.deploy(ERC20, "SlotToken", "SLT");
};