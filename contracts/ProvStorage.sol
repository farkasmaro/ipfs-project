// SPDX-License-Identifier: MIT
pragma solidity >=0.5.16 <8.10.0;

contract ProvStorage {
  string ipfsHash;
  //not using transaction ID like this. 
  uint txNumber = 0;

  uint blockNumber = block.number;
  uint256 txHash =  uint256(blockhash(blockNumber -1));
  //Has to be blockNumber -1 since the 

// ---------------------- TEST ---------------------------------
// Mappings
   struct Upload {
    //struct for each upload instance
    string ipfsHash;
    uint256 txHash;
    string author;
    string filename;
    uint timestamp;  
  }

  mapping(uint => Upload) public uploads;
  //Transaction ID maps to an Upload instance
  mapping(address => mapping(uint => Upload)) public address_uploads;
  //Uploads can also be mapped to an address (the account of the person who created the upload.)


  function upload(string memory _ipfsHash, string memory _author, string memory _filename, uint _timestamp) public {
    //associate an upload with address and create the instance
    //problem is the transaction ID doesn't generate until after this function?
    txNumber = txNumber +1;
    address_uploads[msg.sender][txNumber] = Upload(_ipfsHash, txHash, _author, _filename, _timestamp);
    
  }
  
  function getTxNumber() public view returns (uint){
    //return the latest transaction number
    return txNumber;
  }

  function getIPFS() public view returns (string memory){
    //return the ipfsHash taking transaction ID & msg.sender.
    return address_uploads[msg.sender][txNumber].ipfsHash;
  }

  function getTxHash() public view returns (uint256){
    //Return transactionHash
    return address_uploads[msg.sender][txNumber].txHash;
  }

  function getAuthor() public view returns (string memory){
    //return author based on txNumber and current account.
    return address_uploads[msg.sender][txNumber].author;
  }

   function getFileName() public view returns (string memory){
    //return author based on txNumber and current account.
    //return address_uploads[msg.sender][txNumber].filename;
    return uploads[txNumber].filename;
  }
  
   function getTimestamp() public view returns (uint){
    //return author based on txNumber and current account.
    return address_uploads[msg.sender][txNumber].timestamp;
  }
  
 //----------------------------------------------------------------  
 //             No Longer used:
  //Create constructor if I want to have a default value 
  function set(string memory x) public {
    //change value of hash
    ipfsHash = x;
  }

  function get() public view returns (string memory) {
    //retrieve value of hash
    return ipfsHash;
  }

  //-------------------------------------------------------------
}

//msg.sender = the address of the acccount currently running contract.