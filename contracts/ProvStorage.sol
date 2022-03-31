// SPDX-License-Identifier: MIT
pragma solidity >=0.5.16 <8.10.0;

contract ProvStorage {
//Global variables storing latest transaction count.
  uint txNumber_upload = 0;
  uint txNumber_download = 0;
  string latest_txHash_upload = "";
  string latest_txHash_download = "";

  string temp_txHash = "origin";

// Upload structure
struct Upload {
  //struct for each upload instance
  uint txNumber;
  string ipfsHash;
  string txHash;
  string author;
  string filename;
  uint timestamp;  
}
//Download Structure - Download instances also added to chain
struct Download {
  uint txNumber;
  string ipfsHash;
  string txHash;
  string filename;
  uint timestamp;
  string downloader;
  //string ip;  need to pull from dapp
}

//Mappings
mapping(uint => Upload) public uploads;
mapping(string => Upload) public uploads_t;
//txNumber maps to an Upload instance
mapping(uint => Download) public downloads;
//txNumber_downloads maps to Download instance?

//mapping(address => mapping(uint => Upload)) public address_uploads;  //NOT IN USE
//Uploads can also be mapped to an address (the account of the person who created the upload.)


//Conversion functions:
/*
function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
  //From: https://ethereum.stackexchange.com/questions/2519/how-to-convert-a-bytes32-to-string

function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
  //From: https://stackoverflow.com/questions/47129173/how-to-convert-uint-to-string-in-solidity
*/
//DateUtils- https://github.com/SkeletonCodeworks/DateUtils 

//------------------------------------------------------------------------
//--- Upload - Download ---

  function upload(string memory _ipfsHash, string memory _author, string memory _filename, uint _timestamp) public {
    //associate an upload with address and create the instance
    txNumber_upload = txNumber_upload +1;
    //address_uploads[msg.sender][txNumber] = Upload(_ipfsHash, txHash, _author, _filename, _timestamp);
    uploads[txNumber_upload] = Upload(txNumber_upload, _ipfsHash, "empty" , _author, _filename, _timestamp);  
    //This is new struct mapped with the hash!!!!!! Change this works.
    uploads_t[temp_txHash] = Upload(txNumber_upload, _ipfsHash, "empty", _author, _filename, _timestamp);
  }
  
  function download(string memory _ipfsHash, string memory _filename, uint _time, string memory _downloader) public {
    txNumber_download = txNumber_download +1;
    downloads[txNumber_download] = Download(txNumber_upload,_ipfsHash, "empty", _filename, _time, _downloader);
  }
 
  //function to update txHash with correct value (blockhash) that gets generated after 'upload' is called
  function updateTxHash_upload(string memory _txHash) public {
    uploads[txNumber_upload].txHash = _txHash;
    //set upload instance to have index as transaction hash
    uploads_t[_txHash] = uploads_t[temp_txHash];
    uploads_t[_txHash].txHash = _txHash;
    latest_txHash_upload = _txHash;
  }

  //---------Upload Get---------
  function getTxNumber_up_latest() public view returns (uint){
    //return the latest transaction number
    return txNumber_upload;
  }

  function getIPFS_up_latest() public view returns (string memory){
    //return the ipfsHash taking transaction ID & msg.sender.
    return uploads[txNumber_upload].ipfsHash;
    //return getTxHash();
  }

  function getTxHash_up_latest() public view returns (string memory){
    //Return transactionHash
    return uploads[txNumber_upload].txHash;
  }

  function getAuthor_up_latest() public view returns (string memory){
    //return author based on txNumber and current account.
    return uploads[txNumber_upload].author;
  }

   function getFileName_up_latest() public view returns (string memory){
    //return author based on txNumber and current account.
    return uploads[txNumber_upload].filename;
  }
  
   function getTimestamp_up_latest() public view returns (uint){
    //return author based on txNumber and current account.
    return uploads[txNumber_upload].timestamp;
  }
  //-------------------------------------------------------------

  //----- test getters for transaction hash -----

 function getIPFS_t() public view returns (string memory){
    return uploads_t[latest_txHash_upload].ipfsHash;
  }

  function getTxHash_t() public view returns (string memory){
    return uploads_t[latest_txHash_upload].txHash;
  }

  function getAuthor_t() public view returns (string memory){
    return uploads_t[latest_txHash_upload].author;
  }

   function getFileName_t() public view returns (string memory){
    return uploads_t[latest_txHash_upload].filename;
  }
  
   function getTimestamp_t() public view returns (uint){
    return uploads_t[latest_txHash_upload].timestamp;
   }

  //-----

  //function to update txHash with correct value (blockhash) that gets generated after 'upload' is called
  function updateTxHash_download(string memory _txHash) public {
    downloads[txNumber_download].txHash = _txHash;
    latest_txHash_download = _txHash;
  }
//----------- Download Get LATEST ------------------
  function getTxNumber_down_latest() public view returns (uint){
    //return the latest transaction number
    return txNumber_download;
  }

  function getIPFS_down_latest() public view returns (string memory){
    return downloads[txNumber_download].ipfsHash;
  }

   function getTxHash_down_latest() public view returns (string memory){
    return downloads[txNumber_download].txHash;
  }

  function getFileName_down_latest() public view returns (string memory){
    return downloads[txNumber_download].filename;
  }

  function getTimestamp_down_latest() public view returns (uint){
    return downloads[txNumber_download].timestamp;
  }
  function getDownloader_latest() public view returns (string memory){
    return downloads[txNumber_download].downloader;
  }
}

//msg.sender = the address of the acccount currently running contract.