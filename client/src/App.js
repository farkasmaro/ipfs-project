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

class App extends Component {

  state = {ipfsHash: "empty", storageValue: 0, web3: null, accounts: null, contract: null };

  //specific to react.js - need to bind variables to 'this' instance
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
    
      //this.runExample();
      // Set web3, accounts, and contract to the state, and then proceed with an
      this.setState({web3, accounts, contract: instance});  //, this.runExample
      
      //console.log('web3: ', this.state.web3)
      console.log('Connected Account: ', this.state.accounts)
      console.log('Contract instance: ', this.state.contract)

      const readipfsHash = await this.state.contract.methods.getIPFS().call();
        //readIPFSHash is the promise not the value.
        //the 'await' returns the value inside the promise if value, and set the state. 

      this.setState({ipfsHash: readipfsHash});
      console.log('Latest hash: ', readipfsHash)  

      //-- try retrieve transaction information -- 
      const eth_address = await this.state.contract._address;
      console.log('Contract Address: ', eth_address)
      //const transactionDetails = await web3.eth.getTransaction(accounts);
      //console.log('Transaction Details: ', transactionDetails)

      // Display currrent block 
      //await this.checkCurrentBlock();
      //----------------------------

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

  
  onSubmit(event) {
    const { accounts, contract, buffer } = this.state;

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
      //- function upload(string memory _ipfsHash, string memory _author, uint _timestamp) public {
      
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
        console.log('new ipfsHash: ', result[0].hash)
        this.setState({ipfsHash: result[0].hash})
        let url = "url: www.ipfs.io/ipfs/" + this.state.ipfsHash;
        document.getElementById("ipfsURL").innerHTML = url;
        return
      })   
    })
    // --- Test symmetric encrypt ---
    // var hw = encrypt(new Buffer("Farkas Maro encrypt me", "utf8"))
    
    //console.log(hw);
    //console.log(decrypt(hw).toString('utf8'))
  }

button_latest_upload = async (event) => {
// CURRENTLY RETURNING OBJECT NOT ACTUAL VALUE OF VARIABLE.
  console.log('Latest upload button pressed...')
  const{ contract, address } = this.state;
  try{

    let txNumber = await this.state.contract.methods.getTxNumber().call();
    let ipfsHash = await this.state.contract.methods.getIPFS().call();
    let txHash = await this.state.contract.methods.getTxHash().call();
    let author = await this.state.contract.methods.getAuthor().call();
    let filename = await this.state.contract.methods.getFileName().call();
    let timestamp = await this.state.contract.methods.getTimestamp().call();
   
    //convert unix timestamp to datetime
    let date = new Date(+timestamp); //+ to convert to int
    let datetime  = ("Date: "+date.getDate()+
                     "/"+(date.getMonth()+1)+
                     "/"+date.getFullYear()+
                     " "+date.getHours()+
                     ":"+date.getMinutes()+
                     ":"+date.getSeconds()).toString();
    

    console.log('txNumber: ', txNumber)
    console.log('ipfsHash: ', ipfsHash)
    console.log('txHash: ', txHash)
    console.log('author: ', author)
    console.log('filename: ', filename)
    console.log('timestamp: ',  datetime)
    var buffer = "Transaction count: " + txNumber + "\nIPFS Hash: " + ipfsHash + "\nTrasanction Hash: " + txHash + "\nAuthor: " + author + "\nFilename: " + filename + "\nTimestamp (unix): " + timestamp + "\n" + datetime;

    document.getElementById("show_upload").innerHTML = buffer;
  }
  catch (error){
    alert('Error: Unable to show latest upload.')
    console.error(error)
  }
}

button_download = async (event) => {
    //Bit clunky, but download retrieves the file buffer from IPFS.
    //Buffer is converted to utf8 string and saved to plain text file
    //Filename resets the text file format.

    const download = (filename, filebuffer) => {
    //path = url
    //https://attacomsian.com/blog/javascript-download-file
    // Create a new link
    const anchor = document.createElement('a');
    anchor.style.display = 'none';
    // Append to the DOM
    document.body.appendChild(anchor);
    
    const blob = new Blob([filebuffer], {type:'text/plain'});
    const objectURL = URL.createObjectURL(blob);

    //Pass path and filename rather than file buffer. Issue is it is displayed in html?
    
    anchor.href = objectURL;
    anchor.href = URL.createObjectURL( blob );
    //anchor.href = path;
    anchor.download = filename;

    anchor.click();
    };

    const fileHash = await this.state.contract.methods.getIPFS().call();
    const fileName = await this.state.contract.methods.getFileName().call();
    let link = 'https://ipfs.io/ipfs/'+fileHash;

    //IPFS get? 

    //https://stackoverflow.com/questions/48035864/how-download-file-via-ipfs-using-nodejs
    try
    {
      ipfs.files.get(fileHash, function (err,files) {
        files.forEach((file) => {
          console.log("File Path >> ", link)
          console.log("File Content >> ",file.content.toString('utf8'))  //.toString('utf8')
          download(fileName, file.content);
          //download(link, fileName);
        })
      })
    }
    catch(error)
    {
      console.error(error);
      alert('Error: No file found.');
    }
}

button_latest_block = async (event) => {
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
              button_latest_upload = {this.button_latest_upload}
              button_download = {this.button_download}/>}></Route>
          <Route path='/verify' element={<Verify
              button_blockSelect = {this.button_blockSelect}
              button_latest_block = {this.button_latest_block}/>}></Route>
        </Routes>
        </div>
        <Footer />
      </div>
    );
  }
}

//Don't think this can work because props go to Main & then go to the individual functions
// - Removed main instead!

//            <a><NavLink to='/'>Home</NavLink></a>

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
            <br></br>
            <output id="ipfsURL"></output>
            <br></br>
         </form>
  </div>
);

const Download = (props) => (
  <div className= 'download'>
  <h3>View Uploads</h3>
         <p>Search elements on smart contract. </p>
         <button className="view_upload_button" type="button" onClick={props.button_latest_upload}> 
         Show Latest Upload
         </button>
         <button className="download_button" type="button" onClick={props.button_download}> 
         Download Latest File
         </button>
         <br></br>
         <output className="show_upload" id="show_upload"></output>
         <br></br>
  </div>
);

const Verify = (props) => (
  <div className='verify'>
  <h4>View Blockchain</h4>
         <p>Search blockchain using block number or transaction hash. (e.g., '1','2','0x46e5...')</p>
         <form onSubmit={props.button_blockSelect} >
            <input id="blockNum" type='text'/>
            <input className="submit" type='submit' />
         </form>
         <button className="blockbutton" type="button" onClick={props.button_latest_block}> 
         Show Latest Block
         </button>
         <br></br>
         <output className="show_block" id="show_block"></output>
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