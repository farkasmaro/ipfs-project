// SPDX-License-Identifier: MIT
pragma solidity >=0.5.16 <8.10.0;

contract ProvStorage {
  //string ipfsHash;
  //not using transaction ID like this. 
  uint txNumber = 0;
  uint txNumber_download = 0;

  //uint blockNumber = block.number;
  //bytes32 txHash =  (blockhash(blockNumber -1));
  string txHash = "empty";

// Upload structure
struct Upload {
  //struct for each upload instance
  string ipfsHash;
  string txHash;
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
//Mappings
mapping(uint => Upload) public uploads;
//txNumber maps to an Upload instance
mapping(uint=> Download) public downloads;
//txNumber_downloads maps to Download instance?

mapping(address => mapping(uint => Upload)) public address_uploads;  //NOT IN USE
//Uploads can also be mapped to an address (the account of the person who created the upload.)


//Conversion functions:
/*
function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
  //From: https://ethereum.stackexchange.com/questions/2519/how-to-convert-a-bytes32-to-string
  //Converts a bytes32 num to string.
  uint8 i = 0;
  while(i < 32 && _bytes32[i] != 0) {
    i++;
  }
  bytes memory bytesArray = new bytes(i);
    for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
      bytesArray[i] = _bytes32[i];
    }
  return string(bytesArray);
}

function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
  //From: https://stackoverflow.com/questions/47129173/how-to-convert-uint-to-string-in-solidity
  //Converts Uint to string
  if (_i == 0) {
    return "0";
  }
  uint j = _i;
  uint len;
  while (j != 0) {
    len++;
    j /= 10;
  }
  bytes memory bstr = new bytes(len);
  uint k = len;
  while (_i != 0) {
    k = k-1;
    uint8 temp = (48 + uint8(_i - _i / 10 * 10));
    bytes1 b1 = bytes1(temp);
    bstr[k] = b1;
    _i /= 10;
  }
  return string(bstr);
}
*/

//DateUtils- https://github.com/SkeletonCodeworks/DateUtils 

//Mappings:

  
  function upload(string memory _ipfsHash, string memory _author, string memory _filename, uint _timestamp) public {
    //associate an upload with address and create the instance
    txNumber = txNumber +1;
    //address_uploads[msg.sender][txNumber] = Upload(_ipfsHash, txHash, _author, _filename, _timestamp);
    uploads[txNumber] = Upload(_ipfsHash, txHash , _author, _filename, _timestamp);  
  }

  function download(string memory _ipfsHash, string memory _filename, uint _time, string memory _downloader) public {
    txNumber_download = txNumber_download +1;
    downloads[txNumber_download] = Download(_ipfsHash, _filename, _time, _downloader);
  }
  //----- Conditional Getters ----------
  // Function can only return one variable in Solidity, 
  // returning entire transaction as a string instead. 
  /*
  function append(string memory a, string memory b, string memory c, string memory d, string memory e, string memory f) internal pure returns (string memory) {

    return string(abi.encodePacked(a, b, c, d, e, f));
  }

  function getUploadByTxNumber(uint txNum) public view returns (string memory){
    //storage or memory?
    string memory a = uint2str(txNum);
    string memory b = uploads[txNum].ipfsHash;
    string memory c = bytes32ToString(uploads[txNum].txHash); //need to convert to string
    string memory d = uploads[txNum].author;
    string memory e = uploads[txNum].filename;
    string memory f = uint2str(uploads[txNum].timestamp);  
    //Solidity does not let you concat strings. 
    //return "Transaction Type: UPLOAD\nTransaction count: " + a + "\nIPFS Hash: " + b + "\nTrasanction Hash: " + c + "\nAuthor: " + d + "\nFilename: " + e + "\nTimestamp (unix): " + f;
    return append(a,b,c,d,e,f);
  }
  */
  //function to update txHash with correct value (blockhash) that gets generated after 'upload' is called
  function updateTxHash(string memory _txHash) public {
    uploads[txNumber].txHash = _txHash;
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

  function getTxHash() public view returns (string memory){
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