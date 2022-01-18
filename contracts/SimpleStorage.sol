// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <8.10.0;

contract SimpleStorage {
  string ipfsHash;
  //encrypted location of the file

  function set(string memory x) public {
    //change value of hash
    ipfsHash = x;
  }

  function get() public view returns (string memory) {
    //retrieve value of hash
    return ipfsHash;
  }
}
