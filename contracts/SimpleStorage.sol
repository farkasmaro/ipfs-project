// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <8.10.0;

contract SimpleStorage {
  string ipfsHash;
  //not using transaction ID like this. 
  uint transactionID = 0;
  //encrypted location of the file
  //Here is where I want to declare the rest of my variables
  //- ipfsHash
  //- Transaction ID?
  //- Pass 'author'/editor
  //- and timestamp
  // Store these values using mappings?
  //  - nested mappings to ascosiate an upload with an address (i.e., metamask account)?

/* ---------------------- TEST ---------------------------------
// Mappings
  mapping(uint => Upload) public uploads;
  //Transaction ID maps to an Upload instance
  mapping(address => mapping(uint => Upload)) public address_uploads;
  //Uploads can also be mapped to an address (the account of the person who created the upload.)

  struct Upload {
    //struct for each upload instance1
    string ipfsHash;
    string author;
    uint timestamp;  
  }
  function upload(string memory _ipfsHash, string memory _author, uint _timestamp) public {
    //associate an upload with address and create the instance
    //problem is the transaction ID doesn't generate until after this function?
    transactionID = transactionID +1;
    address_uploads[msg.sender][transactionID] = Upload(_ipfsHash, _author, _timestamp);
  }

  function getIPFS() public view returns (string memory){
    //return the ipfsHash taking transaction ID & msg.sender.
    return address_uploads[msg.sender][transactionID].ipfsHash;
  }
  
 ---------------------------------------------------------------- */ 

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

//msg.sender = the address of the acccount currently running contract.