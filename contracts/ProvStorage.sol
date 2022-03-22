// SPDX-License-Identifier: MIT
pragma solidity >=0.5.16 <8.10.0;

contract ProvStorage {
  string ipfsHash;
  //not using transaction ID like this. 
  uint txNumber= 0;
  uint txNumber_download = 0;

  uint blockNumber = block.number;
  bytes32 txHash =  (blockhash(blockNumber -1));

// Upload structure
struct Upload {
  //struct for each upload instance
  string ipfsHash;
  bytes32 txHash;
  string author;
  string filename;
  uint timestamp;  
}
//Download Structure - Download instances also added to chain
struct Download {
  string ipfsHash;
  string filename;
  uint timestamp;
  string downloader;
  //string ip;  need to pull from dapp
}
//Mappings:

  mapping(uint => Upload) public uploads;
  //txNumber maps to an Upload instance
  mapping(uint=> Download) public downloads;
  //txNumber_downloads maps to Download instance?

  mapping(address => mapping(uint => Upload)) public address_uploads;  //NOT IN USE
  //Uploads can also be mapped to an address (the account of the person who created the upload.)

  function upload(string memory _ipfsHash, string memory _author, string memory _filename, uint _timestamp) public {
    //associate an upload with address and create the instance
    //problem is the transaction ID doesn't generate until after this function?
    txNumber = txNumber +1;
    //address_uploads[msg.sender][txNumber] = Upload(_ipfsHash, txHash, _author, _filename, _timestamp);
    uploads[txNumber] = Upload(_ipfsHash, txHash, _author, _filename, _timestamp);  
  }

  function download(string memory _ipfsHash, string memory _filename, uint _time, string memory _downloader) public {
    txNumber_download = txNumber_download +1;
    downloads[txNumber_download] = Download(_ipfsHash, _filename, _time, _downloader);
  }
  
  //---------Upload Get---------
  function getTxNumber() public view returns (uint){
    //return the latest transaction number
    return txNumber;
  }

  function getIPFS() public view returns (string memory){
    //return the ipfsHash taking transaction ID & msg.sender.
    //return address_uploads[msg.sender][txNumber].ipfsHash;
    return uploads[txNumber].ipfsHash;
  }

  function getTxHash() public view returns (bytes32){
    //Return transactionHash
    //return address_uploads[msg.sender][txNumber].txHash;
    return uploads[txNumber].txHash;
  }

  function getAuthor() public view returns (string memory){
    //return author based on txNumber and current account.
    //return address_uploads[msg.sender][txNumber].author;
    return uploads[txNumber].author;
  }

   function getFileName() public view returns (string memory){
    //return author based on txNumber and current account.
    //return address_uploads[msg.sender][txNumber].filename;
    return uploads[txNumber].filename;
  }
  
   function getTimestamp() public view returns (uint){
    //return author based on txNumber and current account.
    //return address_uploads[msg.sender][txNumber].timestamp;
    return uploads[txNumber].timestamp;
  }
  //-------------------------------------------------------------
//----------- Download Get ------------------
  function getTxNumber_down() public view returns (uint){
    //return the latest transaction number
    return txNumber_download;
  }

  function getIPFS_down() public view returns (string memory){
    return downloads[txNumber_download].ipfsHash;
  }

  function getFileName_down() public view returns (string memory){
    return downloads[txNumber_download].filename;
  }

  function getTimestamp_down() public view returns (uint){
    return downloads[txNumber_download].timestamp;
  }
  function getDownloader() public view returns (string memory){
    return downloads[txNumber_download].downloader;
  }
}

//msg.sender = the address of the acccount currently running contract.