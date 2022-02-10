// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <8.10.0;

contract SimpleStorage {
  string ipfsHash;
  //encrypted location of the file
  //Here is where I want to declare the rest of my variables
  //- Pass 'author'/editor
  //- and timestamp


  //Create constructor if I want to have a default value 

  function set(string memory x) public {
    //change value of hash
    ipfsHash = x;
  }

  function get() public view returns (string memory) {
    //retrieve value of hash
    return ipfsHash;
  }
}
