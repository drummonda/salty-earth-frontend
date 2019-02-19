const SlotToken = artifacts.require("./SlotToken.sol");

module.exports = function(deployer) {
  deployer.deploy(SlotToken, "SlotToken", "SLT");
};