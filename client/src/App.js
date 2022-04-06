//Client side application - handling back end & GUI
import React, { Component } from "react";
import { NavLink, Routes, Route } from 'react-router-dom';
import ProvStorageContract from "./contracts/ProvStorage.json";
import getWeb3 from "./getWeb3";  
//import web3 from "web3";
//Included with truffle box - enables the client side app to talk to ethereum chain
//Can fetch read/write data from smart contracts. 
import ipfs from './ipfs'  //importing node connectino settings from ./ipfs.js
import "./App.css"
import axios from 'axios' //To get IP

//Arrays to hold all transaction hashes - needs to be globally accessible
var upload_hashes = []
var download_hashes = []

//Attempting to retrieve IP from amazon AWS checkIP but currently fails to return a value. 
//https://ipdata.co/blog/how-to-get-the-ip-address-in-javascript/
function getIPFromAmazon() {
  fetch("https://checkip.amazonaws.com/", {mode: 'no-cors'}).then(res => res.text()).then(data => console.log('IP Address: ',data))
// 'no-cors' mode does not return anything
// See this for resolution:  https://stackoverflow.com/questions/43262121/trying-to-use-fetch-and-pass-in-mode-no-cors
}
const getIP = async () => {
  const result = await axios.get('https://geolocation-db.com/json/')
  console.log(result.data);
  return(result.data.IPv4)
}

function getDateFromUnix(timestamp)
{
  //convert unix timestamp to datetime
  let date = new Date(+timestamp); //+ to convert to int
  let datetime  = ("Date: "+date.getDate()+
                   "/"+(date.getMonth()+1)+
                   "/"+date.getFullYear()+
                   " "+date.getHours()+
                   ":"+date.getMinutes()+
                   ":"+date.getSeconds()).toString();
  return datetime ;
}

//Function to download a file, taking the array buffer contents, and filename.
const download = (filename, filebuffer) => {
  //https://attacomsian.com/blog/javascript-download-file
  // Create a new link
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  // Append to the DOM
  document.body.appendChild(anchor);

  const blob = new Blob([filebuffer], {type:'text/plain'});
  anchor.href = URL.createObjectURL( blob );
  //anchor.href = path;
  anchor.download = filename;
  anchor.click();
};

class App extends Component {

  state = {ipfsHash: "empty", web3: null, accounts: null, contract: null};

  //Specific to react.js - need to bind variables to 'this' instance
  captureFile = this.captureFile.bind(this);
  onSubmit = this.onSubmit.bind(this);

  componentDidMount = async () => {
    //This fucntion handles the asynchronous update of the web page.
    try {
      document.title = "EthIPFS - IPFS File Share";
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = ProvStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        ProvStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
    
      // Set web3, accounts, and contract to the state, and then proceed with an
      this.setState({web3, accounts, contract: instance}); 
      
      //console.log('web3: ', this.state.web3)
      console.log('Connected Account: ', this.state.accounts)
      console.log('Contract instance: ', this.state.contract)

      const readipfsHash = await this.state.contract.methods.getIPFS_up_latest().call();
     
      //*****latest hash is pulled to display image but this is not necassary*******

      this.setState({ipfsHash: readipfsHash});
      console.log('Latest ipfshash: ', readipfsHash)  

      //-- try retrieve transaction information -- 
      const eth_address = await this.state.contract._address;
      console.log('Contract Address: ', eth_address)
      //const transactionDetails = await web3.eth.getTransaction(accounts);
      //console.log('Transaction Details: ', transactionDetails)

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(`Failed to load web3, accounts, or contract. Check console for details.`,);
      console.error(error);
    }
  };

  //Handlers for file capture and submit
  captureFile(event){
    try
    {
      //Need to convert the file capture to 'buffer' format for ipfs to understand
      //console.log('capture file...')
      event.preventDefault()
      const file = event.target.files[0]
      //reading the submitted files [0] as 'file' - limit to one file only?
      const reader = new window.FileReader()
      reader.readAsArrayBuffer(file) //this is the conversion to buffer
      //take result array and we want to set this to compnent state
      reader.onloadend = () => {
        this.setState({buffer: Buffer.from(reader.result)})
        //log
        console.log('buffer', this.state.buffer)
        alert('Uploaded file converted to array buffer.');
      }
    }
    catch (error)
    {
      alert('Error: Unsupported File');
      console.error(error);
    }
  }
  
  getLatestBlockHash = async (event) =>{
    //-- Function to return the hash of the most recently added transaction block
    let block =  await this.state.web3.eth.getBlock("latest"); 
    let blockhash = block.hash;
    console.log("new blockhash: ", blockhash);
    return blockhash; 
  }

  onSubmit(event){
    //-- Function completes when submit file button is pressed

    const { accounts, contract, buffer, ipfsHash} = this.state;

    event.preventDefault()  //Prevent refreshing of page
    console.log('On submit...')
    console.log('previous upload ipfsHash: ', this.state.ipfsHash)
    //-- Update ipfs with the contents of 'buffer' from capture button.
    ipfs.files.add(buffer, (error, result) => {
      if (error) {
        alert('Error: No file selected.');
        console.error(error)  //error handling
        return
      }
      //--   Update blockchain   --
      // test sending more details to contract:
      let author = document.getElementById("author").value; //get author from text box
      let time = new Date();
      time = time.getTime();  //unix timestamp
      let filename = document.getElementById("captureFile").value;
      filename = filename.split("\\").pop();
      console.log('Author: ', author);
      console.log('Time: ', time);
      console.log('Filename: ', filename);

      //contract.methods.set(result[0].hash).send({from : accounts[0]}).then((r) => {
      contract.methods.upload(result[0].hash, author, filename, time).send({from : accounts[0]}).then((r) => {
        //Need to call after .then() to get the hash of the completed transaction.
        this.getLatestBlockHash().then(function(result){
          //Need to access the promise 'result' using .then()
          let blockhash = result;
          //call ' update' after the creation of the transaction.
          contract.methods.updateTxHash_upload(blockhash).send({from : accounts[0]});
          //This method requires also requires gas.
          blockhash = blockhash.concat('\n') //Add new line to display neater
          //Update global array holding all uploads hashes, within upload method so blockhash is reachable.
          upload_hashes = upload_hashes.concat([blockhash])
          console.log(upload_hashes)
          document.getElementById("list_uploads").innerHTML = (upload_hashes); 
          //^Updates output straight away but not compulsory bc also in HTML
        })
      })
      console.log('new ipfsHash: ', result[0].hash)
      this.setState({ipfsHash: result[0].hash})   //set the state to latest ipfs hash, which 
      let url = "url: www.ipfs.io/ipfs/" + ipfsHash;
      document.getElementById("ipfsURL").innerHTML = url;
    })
  }

button_show_latest_upload = async (event) => {
  console.log('Latest upload button pressed...')
  //getIPFromAmazon()
  const{ contract } = this.state;
  try{
    let txNumber = await contract.methods.getTxNumber_up_latest().call();
    let ipfsHash = await contract.methods.getIPFS_up_latest().call();
    let txHash = await contract.methods.getTxHash_up_latest().call();
    let author = await contract.methods.getAuthor_up_latest().call();
    let filename = await contract.methods.getFileName_up_latest().call();
    let timestamp = await contract.methods.getTimestamp_up_latest().call();
    
    let datetime = getDateFromUnix(timestamp);

    console.log('txNumber: ', txNumber)
    console.log('ipfsHash: ', ipfsHash)
    console.log('txHash: ', txHash);
    console.log('author: ', author)
    console.log('filename: ', filename)
    console.log('timestamp: ',  timestamp)
    console.log(datetime)
    var buffer = "Transaction Type: UPLOAD\nUploads count: " + txNumber + "\nIPFS Hash: " + ipfsHash + "\nTransaction Hash: " + txHash + "\nAuthor: " + author + "\nFilename: " + filename + "\n" + datetime;
  
    //let fullblock = await contract.methods.getUploadByTxNumber(4).call();
    document.getElementById("show_latest").innerHTML = buffer;
    //console.log(fullblock);
    //document.getElementById("show_latest").innerHTML = fullblock;
  }
  catch (error){
    alert('Error: Unable to show latest upload.')
    console.error(error)
  }
}

button_show_latest_download = async (event) =>{
  console.log('Latest download button pressed...')
  const{ contract } = this.state;
  try
  {
    let txNumber = await contract.methods.getTxNumber_down_latest().call();
    let ipfsHash = await contract.methods.getIPFS_down_latest().call();
    let txHash = await contract.methods.getTxHash_down_latest().call();
    let downloader = await contract.methods.getDownloader_latest().call();
    let filename = await contract.methods.getFileName_down_latest().call();
    let timestamp = await contract.methods.getTimestamp_down_latest().call();
    let IP = await contract.methods.getIP_down_latest().call();

    let datetime = getDateFromUnix(timestamp);

    console.log('----- Download -----');
    console.log('downloader: ', downloader);
    console.log('ipfsHash: ', ipfsHash);
    console.log('txHash: ', txHash);
    console.log('filename: ', filename);
    console.log('datetime: ', datetime);
    console.log('IP :', IP);

    var buffer = "Transaction Type: DOWNLOAD\nDownloads count: " + txNumber + "\nIPFS Hash: " + ipfsHash + "\nTransaction Hash: " + txHash + "\nDownloader: " + downloader + "\nFilename: " + filename + "\n" + datetime + "\nIP: " + IP;
    document.getElementById("show_latest").innerHTML = buffer;
  }
  catch (error)
  {
    console.error(error);
    alert('Error: Unable to show latest download.');
  }
}

button_show_upload_by_txHash = async (event) => {
  event.preventDefault();
  console.log('Test button pressed')
  //getIPFromAmazon()
  //Failing to return ip
  const{ contract } = this.state;
  try{

    let input_txHash = document.getElementById("upload_txHash").value

    let txNumber = await contract.methods.getTxNumber_up(input_txHash).call();
    let ipfsHash = await contract.methods.getIPFS_up(input_txHash).call();
    let txHash = await contract.methods.getTxHash_up(input_txHash).call();
    let author = await contract.methods.getAuthor_up(input_txHash).call();
    let filename = await contract.methods.getFileName_up(input_txHash).call();
    let timestamp = await contract.methods.getTimestamp_up(input_txHash).call();
   
    let datetime = getDateFromUnix(timestamp);

    console.log('txNumber: ', txNumber)
    console.log('ipfsHash: ', ipfsHash)
    console.log('txHash: ', txHash)
    console.log('author: ', author)
    console.log('filename: ', filename)
    console.log('timestamp: ',  timestamp)
    console.log(datetime)
    var buffer = "Transaction Type: UPLOAD\nUploads count: " + txNumber + "\nIPFS Hash: " + ipfsHash + "\nTransaction Hash: " + txHash + "\nAuthor: " + author + "\nFilename: " + filename + "\n" + datetime;
  
    //let fullblock = await contract.methods.getUploadByTxNumber(4).call();
    document.getElementById("show_by_txHash").innerHTML = buffer;
    //console.log(fullblock);
    //document.getElementById("show_latest").innerHTML = fullblock;
  }
  catch (error){
    alert('Error: Unable to show upload by transaction hash.')
    console.error(error)
  }
}

button_show_download_by_txHash = async (event) => {
  event.preventDefault();
  console.log('Test button pressed')
  //getIPFromAmazon()
  //Failing to return ip
  const{ contract } = this.state;
  try{

    let input_txHash = document.getElementById("show_download_txHash").value

    let txNumber = await contract.methods.getTxNumber_down(input_txHash).call();
    let ipfsHash = await contract.methods.getIPFS_down(input_txHash).call();
    let txHash = await contract.methods.getTxHash_down(input_txHash).call();
    let downloader = await contract.methods.getDownloader(input_txHash).call();
    let filename = await contract.methods.getFileName_down(input_txHash).call();
    let timestamp = await contract.methods.getTimestamp_down(input_txHash).call();
    let IP = await contract.methods.getIP_down(input_txHash).call();
    
    let datetime = getDateFromUnix(timestamp);

    console.log('txNumber: ', txNumber)
    console.log('ipfsHash: ', ipfsHash)
    console.log('txHash: ', txHash)
    console.log('downloader: ', downloader)
    console.log('filename: ', filename)
    console.log('timestamp: ',  timestamp)
    console.log('IP: ', IP)
    console.log(datetime)
    var buffer = "Transaction Type: DOWNLOAD\nDownloads count: " + txNumber + "\nIPFS Hash: " + ipfsHash + "\nTransaction Hash: " + txHash + "\nDownloader: " + downloader + "\nFilename: " + filename + "\n" + datetime + "\nIP: " + IP;
  
    //let fullblock = await contract.methods.getUploadByTxNumber(4).call();
    document.getElementById("show_by_txHash").innerHTML = buffer;
    //console.log(fullblock);
    //document.getElementById("show_latest").innerHTML = fullblock;
  }
  catch (error){
    alert('Error: Unable to show download by transaction hash.')
    console.error(error)
  }
}

button_download_latest = async (event) => {
    const {contract, accounts } = this.state;
    //Bit clunky, but download retrieves the file buffer from IPFS.
    //Buffer is converted to utf8 string and saved to plain text file
    //Filename resets the text file format.
    let IP = await getIP()
    console.log('IP: ', IP)

    const fileHash = await contract.methods.getIPFS_up_latest().call();
    const fileName = await contract.methods.getFileName_up_latest().call();
    let downloader = document.getElementById("downloader").value;
    let link = 'https://ipfs.io/ipfs/'+fileHash;

    //First Create a transaction for the download
    try
    {
      let time = "" + Date.now();
      contract.methods.download(fileHash, fileName, time, downloader, IP).send({from : accounts[0]}).then((r) => {
        console.log('Download transaction created.')
        this.getLatestBlockHash().then(function(result){
        //Need to access the promise 'result' so need .then() otherwise the entire promsie is used.
        let blockhash = result;
        //console.log("**** update txHash", blockhash);
        //call ' update' after the creation of the transaction.
        contract.methods.updateTxHash_download(blockhash).send({from : accounts[0]});
        //This method requires Gas to be called, but now working.
        blockhash = blockhash.concat('\n') //Add new line to display neater
        download_hashes = download_hashes.concat([blockhash])
        console.log(download_hashes)
        document.getElementById("list_downloads").innerHTML = (download_hashes);
      })
    });
    } 
    catch (error)
    {
      console.error(error);
      alert('Error: Unable to create transaction.');
    }
    //-- Then initiate download
    //https://stackoverflow.com/questions/48035864/how-download-file-via-ipfs-using-nodejs  ?????
    ipfs.files.get(fileHash, function (err,files) {
      if(err){
        alert('Error: File not retrievable. ')
        console.error(err)
        return
      }
      else {
        files.forEach((file) => {
          console.log("File Path: ", link)
          console.log("File Content: ",file.content.toString('utf8'))  //.toString('utf8')
          download(fileName, file.content);
          //download(link, fileName);
        })
      }
    })
}

button_download_latest_by_txHash = async (event) => {
  event.preventDefault();
  const {contract, accounts } = this.state;
  let IP = await getIP()
  console.log('IP: ', IP)
 
  let txHash = document.getElementById("download_txHash").value;
  const fileHash = await contract.methods.getIPFS_up(txHash).call();
  const fileName = await contract.methods.getFileName_up(txHash).call();
  let downloader = document.getElementById("downloader").value;
  let link = 'https://ipfs.io/ipfs/'+fileHash;

  //First Create a transaction for the download
  try
  {
    let time = "" + Date.now();
    contract.methods.download(fileHash, fileName, time, downloader, IP).send({from : accounts[0]}).then((r) => {
      console.log('Download transaction created.')
      this.getLatestBlockHash().then(function(result){
      //Need to access the promise 'result' so need .then() otherwise the entire promsie is used.
      let blockhash = result;
      //console.log("**** update txHash", blockhash);
      //call ' update' after the creation of the transaction.
      contract.methods.updateTxHash_download(blockhash).send({from : accounts[0]});
      //This method requires Gas to be called, but now working.
      //Update global array holding download Tx hashes
      blockhash = blockhash.concat('\n') //Add new line to display neater
      download_hashes = download_hashes.concat([blockhash])
      console.log(download_hashes)
      //document.getElementById("list_downloads").innerHTML = (download_hashes);
    })
  });
  } 
  catch (error)
  {
    console.error(error);
    alert('Error: Unable to create transaction.');
  }
  //-- Then initiate download
  //https://stackoverflow.com/questions/48035864/how-download-file-via-ipfs-using-nodejs  ?????
  ipfs.files.get(fileHash, function (err,files) {
    if(err){
      alert('Error: File not retrievable. ')
      console.error(err)
      return
    }
    else {
      files.forEach((file) => {
        console.log("File Path: ", link)
        console.log("File Content: ",file.content.toString('utf8'))  //.toString('utf8')
        download(fileName, file.content);
        //download(link, fileName);
      })
    }
  })
}

button_show_latest_block = async (event) => {
  event.preventDefault();
  //needs to be asynchronous to read the latest transaction from block. 
  console.log('Latest block button pressed..');

  let block = await this.state.web3.eth.getBlock("latest");
  
  console.log('Latest Block', block);
  let block_txt = "";
  for (const [key, value] of Object.entries(block)) {
    block_txt += (key + ": " + value + " \n");
  };
  document.getElementById("show_block").innerHTML = block_txt;
  //Get Hash 
  var blockhash = block.hash;
  console.log('Hash: ', blockhash);
  return
}

// When block number is specified, show block details.
// - To edit so only the key details are displayed (e.g., transaction hash, parent hash, timestamp, gas fees etc.,)
button_blockSelect = async (event) =>
{
  try
  {
    event.preventDefault()
    console.log('Selected block button pressed..')
    let blocknumber = document.getElementById("blockNum").value
    let block = await this.state.web3.eth.getBlock(blocknumber)
    //console.log("Block " + blocknumber + ": " + block)
    let block_txt = "";
    for (const [key, value] of Object.entries(block)) {
      block_txt += (key + ": " + value + " \n");
    };  
    document.getElementById("show_block").innerHTML = block_txt;
    return
  }
  catch (error) {
    // Catch any errors for any of the above operations.
    alert('Error: Invalid block number.');
    console.error(error);
  }
}

//-- Render functions --
//This is my react render that couples components with markup
// In order to maintain the state variables, I need to pass them to from the source component to the functional components
  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className='App'>
        <Navigation />
        <div className="container">
        <Routes>
          <Route path='/upload' element={<Upload 
              //passing state
              ipfsHash = {this.state.ipfsHash}
              onSubmit = {this.onSubmit}
              captureFile = {this.captureFile}/>}></Route>
          <Route path='/download' element={<Download
              //passing state functions
              button_download_latest = {this.button_download_latest}
              button_download_latest_by_txHash ={this.button_download_latest_by_txHash}/>}></Route>
          <Route path='/verify' element={<Verify
              button_blockSelect = {this.button_blockSelect}
              button_show_latest_block = {this.button_show_latest_block}
              button_show_latest_upload = {this.button_show_latest_upload}
              button_show_latest_download = {this.button_show_latest_download}
              button_show_upload_by_txHash = {this.button_show_upload_by_txHash}
              button_show_download_by_txHash = {this.button_show_download_by_txHash}/>}></Route>   
        </Routes>
        </div>
        <Footer />
      </div>
    );
  }
}

// Render functions need to be called outside of the class component. 
const Navigation = () => (
  <nav className= "navbar">
      <b href="#" className= "heading"> IPFS File Upload</b>    
            <a><NavLink to='/verify'>Verify</NavLink></a>
            <a><NavLink to='/download'>Download</NavLink></a>
            <a><NavLink to='/upload'>Upload</NavLink></a>       
  </nav>
);

const Upload = (props) => (
  //access state using 'props' aka properties.
  <div className ='upload'>
  <h1>IPFS and Blockchain File Storage</h1>
         <p>This file is stored on IPFS & The Ethereum Blockchain!</p>
         <img src={`https://ipfs.io/ipfs/${props.ipfsHash}`} alt=  " :( ~ Hash not found"/> 
         <h2>Upload File</h2>
         <form onSubmit={props.onSubmit} > 
            <label htmlFor="author"> Insert Name:  </label>
            <input className="author" id="author" type='text'/>
            <br></br>
            <input className="captureFile" id="captureFile" type='file' onChange={props.captureFile}/>
            <input className="submit" type='submit' />
            </form>
          <br></br>
          <output id="ipfsURL"></output>
          <br></br>
          <hr></hr>
          <p>All Uploads by Transaction Hash:</p>
          <br></br>
          <output className="list_uploads" id="list_uploads">{upload_hashes}</output> 
  </div>
);

const Download = (props) => (
  <div className= 'download'>
  <h3>Download file from IPFS</h3>
        <label htmlFor="downloader"> Insert Name:  </label>
            <input className="downloader" id="downloader" type='text'/>
            <br></br>
            <hr></hr>
         <p>Download most recently added file:</p>
         <button className="download_button" type="button" onClick={props.button_download_latest}> 
         Download Latest File
         </button>
      <hr></hr>
      <p>Download file by Transaction Hash:</p>
      <form onSubmit={props.button_download_latest_by_txHash} >
            <input id="download_txHash" type='text'/>
            <input className="submit" type='submit' />
         </form>
      <hr></hr>
      <p>All Downloads by Transaction Hash: </p>
      <output className="list_downloads" id="list_downloads">{download_hashes}</output> 
  </div>
);

const Verify = (props) => (
  <div className='verify'>
  <h4>View Blockchain & Smart Contract</h4>
         <p>Search blockchain using block number or transaction hash. (e.g., '1','2','0x46e5...')</p>
         <form onSubmit={props.button_blockSelect} >
            <input id="blockNum" type='text'/>
            <input className="submit" type='submit' />
         </form>
         <button className="blockbutton" type="button" onClick={props.button_show_latest_block}> 
         Show Latest Block
         </button>
         <br></br>
         <output className="show_block" id="show_block"></output>
         <br></br>
         <hr></hr>
         <p>Search elements on smart contract. </p>
         <button className="view_upload_button" type="button" onClick={props.button_show_latest_upload}> 
         Show Latest Upload
         </button>
         <button className="view_download_button" type="button" onClick={props.button_show_latest_download}> 
         Show Latest Download
         </button>
         <br></br>
         <output className="show_latest" id="show_latest"></output>
         <br></br>
         <hr></hr>
         <p>Search Uploads - Enter Transaction hash of an upload to view details</p>
         <form onSubmit={props.button_show_upload_by_txHash} >
            <input id="upload_txHash" type='text'/>
            <input className="submit" type='submit' />
         </form>
         <br></br>
         <hr></hr>
         <p>Search Downloads - Enter Transaction hash of a download to view details</p>
         <form onSubmit={props.button_show_download_by_txHash} >
            <input id="show_download_txHash" type='text'/>
            <input className="submit" type='submit' />
         </form>
         <br></br>
         <output className="show_by_txHash" id="show_by_txHash"></output>
         <br></br>
         
  </div>
);

const Footer = () => (
    <div className='footer'>
    Farkas Maro | farkasmaro@gmail.com | UWE: Digital Systems Project 
  </div>
);

export default App;

//npm run start
//need to run in client directory
