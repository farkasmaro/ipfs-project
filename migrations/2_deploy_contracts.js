var ProvStorage = artifacts.require("./ProvStorage.sol");

module.exports = function(deployer) {
  deployer.deploy(ProvStorage);
};
