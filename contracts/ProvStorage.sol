// SPDX-License-Identifier: MIT
pragma solidity >=0.5.16 <8.10.0;

contract ProvStorage {
//-- Declaration of State Variables (global)
  uint txNumber_upload = 0;
  uint txNumber_download = 0;
  string latest_txHash_upload = "";
  string latest_txHash_download = "";
  string temp_txHash = "origin";

//--Upload structure
struct Upload {
  //Properties of each upload instance
  uint txNumber;
  string ipfsHash;
  string txHash;
  string author;
  string filename;
  uint timestamp; 
  string IP; 
}
//--Download Structure - Download instances also added to chain
struct Download {
  //Properties of each Download Structure
  uint txNumber;
  string ipfsHash;
  string txHash;
  string downloader;
  string filename;
  uint timestamp;
  string IP;
}

//Mappings
mapping(string => Upload) public uploads;
//txHash maps to an Upload instance
mapping(string => Download) public downloads;
//txHash maps to Download instance too.

//mapping(address => mapping(uint => Upload)) public address_uploads;  //NOT IN USE
//Uploads can also be mapped to an address (the account of the person who created the upload.)

//--- Upload - Download ---
  function upload(string memory _ipfsHash, string memory _author, string memory _filename, uint _timestamp, string memory _IP) public {
    // Function to set the properties of an upload instance.
    txNumber_upload = txNumber_upload +1;
    uploads[temp_txHash] = Upload(txNumber_upload, _ipfsHash, "empty", _author, _filename, _timestamp, _IP);
  }
  
  function download(string memory _ipfsHash, string memory _filename, uint _time, string memory _downloader, string memory _IP) public {
    // Function to set the properties of a download instance.
    txNumber_download = txNumber_download +1;
    downloads[temp_txHash] = Download(txNumber_download, _ipfsHash, "empty", _downloader, _filename, _time, _IP);
  }
 
  //--Function to update txHash with correct value (blockhash) that gets generated after 'upload' is called
  function updateTxHash_upload(string memory _txHash) public {
    //set upload instance to have index as transaction hash
    uploads[_txHash] = uploads[temp_txHash];
    uploads[_txHash].txHash = _txHash;
    latest_txHash_upload = _txHash;
  }
  //-- function to update txHash with correct value (blockhash) that gets generated after 'upload' is called
  function updateTxHash_download(string memory _txHash) public {
    downloads[_txHash] = downloads[temp_txHash];
    downloads[_txHash].txHash = _txHash;
    latest_txHash_download = _txHash;
  }
  //-----------------------------------------------


  //---------Upload Get latest transaction---------
  //Return properties of the most recent upload instance
  function getTxNumber_up_latest() public view returns (uint){
    //return the latest transaction number
    return txNumber_upload;
  }

  function getIPFS_up_latest() public view returns (string memory){
    //return the ipfsHash taking transaction ID & msg.sender.
    return uploads[latest_txHash_upload].ipfsHash;
    //return getTxHash();
  }

  function getTxHash_up_latest() public view returns (string memory){
    //Return transactionHash
    return uploads[latest_txHash_upload].txHash;
  }

  function getAuthor_up_latest() public view returns (string memory){
    //return author based on txNumber and current account.
    return uploads[latest_txHash_upload].author;
  }

   function getFileName_up_latest() public view returns (string memory){
    //return author based on txNumber and current account.
    return uploads[latest_txHash_upload].filename;
  }
  
   function getTimestamp_up_latest() public view returns (uint){
    //return author based on txNumber and current account.
    return uploads[latest_txHash_upload].timestamp;
  }
   function getIP_up_latest() public view returns (string memory)
  {
    return uploads[latest_txHash_upload].IP;
  }
  //-------------------------------------------------------------

//----------- Download Get LATEST ------------------
// Returning the properties added to the most recent instance of a download
  function getTxNumber_down_latest() public view returns (uint){
    //return the latest transaction number
    return txNumber_download;
  }

  function getIPFS_down_latest() public view returns (string memory){
    return downloads[latest_txHash_download].ipfsHash;
  }

   function getTxHash_down_latest() public view returns (string memory){
    return downloads[latest_txHash_download].txHash;
  }

  function getFileName_down_latest() public view returns (string memory){
    return downloads[latest_txHash_download].filename;
  }

  function getTimestamp_down_latest() public view returns (uint){
    return downloads[latest_txHash_download].timestamp;
  }
  function getDownloader_latest() public view returns (string memory){
    return downloads[latest_txHash_download].downloader;
  }

  function getIP_down_latest() public view returns (string memory)
  {
    return downloads[latest_txHash_download].IP;
  }

  //---------Get upload properties based on txHash ---------
  // Each function takes a transaction hash as input to return the property mapped by transaction hash.
  function getTxNumber_up(string memory txHash) public view returns (uint){
    //return the latest transaction number
    return uploads[txHash].txNumber;
  }
  function getIPFS_up(string memory txHash) public view returns (string memory){
    //Return IPFS Hash of an upload of index 'tXHash'
    return uploads[txHash].ipfsHash;
  }

  function getTxHash_up(string memory txHash) public view returns (string memory){
    //Return transactionHash
    return uploads[txHash].txHash;
  }

  function getAuthor_up(string memory txHash) public view returns (string memory){
    //return author based on txNumber and current account.
    return uploads[txHash].author;
  }

   function getFileName_up(string memory txHash) public view returns (string memory){
    //return author based on txNumber and current account.
    return uploads[txHash].filename;
  }
  
   function getTimestamp_up(string memory txHash) public view returns (uint){
    //return author based on txNumber and current account.
    return uploads[txHash].timestamp;
  }
  function getIP_up(string memory txHash) public view returns (string memory)
  {
    return uploads[txHash].IP;
  }
  //-------------------------------------------------------------

  //----------- Download download properties based on txHash ------------------
  //Each function takes a transaction hash as input to return the property mapped by transaction hash.
  function getTxNumber_down(string memory txHash) public view returns (uint){
    //return the latest transaction number
    return downloads[txHash].txNumber;
  }

  function getIPFS_down(string memory txHash) public view returns (string memory){
    return downloads[txHash].ipfsHash;
  }

   function getTxHash_down(string memory txHash) public view returns (string memory){
    return downloads[txHash].txHash;
  }

  function getFileName_down(string memory txHash) public view returns (string memory){
    return downloads[txHash].filename;
  }

  function getTimestamp_down(string memory txHash) public view returns (uint){
    return downloads[txHash].timestamp;
  }
  function getDownloader(string memory txHash) public view returns (string memory){
    return downloads[txHash].downloader;
  }
  function getIP_down(string memory txHash) public view returns (string memory)
  {
    return downloads[txHash].IP;
  }
}
//msg.sender = the address of the acccount currently running contract.

