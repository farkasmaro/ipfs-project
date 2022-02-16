//Client side application - handling back end & GUI
import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";  
import web3 from "web3";
//Included with truffle box - enables the client side app to talk to ethereum chain
//Can fetch read/write data from smart contracts. 
import ipfs from './ipfs'  //importing node connectino settings from ./ipfs.js

import "./App.css"

//--some encryption functions--
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = '123456789AJBCOAhsb';
    
function encrypt(buffer){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = Buffer.concat([cipher.update(buffer),cipher.final()]);
  return crypted;
}
 
function decrypt(buffer){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = Buffer.concat([decipher.update(buffer) , decipher.final()]);
  return dec;
}
//---

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
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
    
      //this.runExample();
      // Set web3, accounts, and contract to the state, and then proceed with an
      this.setState({web3, accounts, contract: instance});  //, this.runExample
      
      //console.log('web3: ', this.state.web3)
      console.log('Connected Account: ', this.state.accounts)
      console.log('Contract instance: ', this.state.contract)

      const readipfsHash = await this.state.contract.methods.get().call();
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
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };


  //Handlers for file capture and submit

  captureFile(event){
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
      contract.methods.set(result[0].hash).send({from : accounts[0]}).then((r) => {
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

/*
no longer required
checkCurrentBlock = async () => {
  let block = await this.state.web3.eth.getBlock("latest")
  console.log('Latest Block', block)
  return 
}
*/


button_latest_block = async (event) => {
  //needs to be asynchronous to read the latest transaction from block. 
  console.log('Latest block button pressed..')

  let block = await this.state.web3.eth.getBlock("latest")

  console.log('Latest Block', block)
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
//Edit the GUI below (currently just a template):
// - Favicon not working yet
  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
        <div className="App">
          <nav className= "navbar">
            <a href="#" className= "heading">IPFS File Upload</a>
            <link rel="icon" type="image/x-icon" href="/favicon_io/favicon.ico"></link>
          </nav>
          <main className="container">
              <h1>IPFS and Blockchain File Storage</h1>
                <p>This file is stored on IPFS & The Ethereum Blockchain!</p>
                <img src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`} alt=  " :( ~ Hash not found"/> 
              <h2>Upload File</h2>
                <form onSubmit={this.onSubmit} > 
                  <input className="captureFile" type='file' onChange={this.captureFile}/>
                  <input className="submit" type='submit' />
                  <br></br>
                    <output id="ipfsURL"></output>
                  <br></br>
                </form>
                <h3>Select Block</h3>
                  <p>Search blockchain using block number or transaction hash. (e.g., '1','2','0x46e5...')</p>
                    <form onSubmit={this.button_blockSelect} >
                      <input id="blockNum" type='text'/>
                      <input className="submit" type='submit' />
                    </form>
                    <button className="blockbutton" type="button" onClick={this.button_latest_block}> 
                      Show Latest Block
                    </button>
                    <br></br>
                      <output className="show_block" id="show_block"></output>
                    <br></br>
          </main>
        </div>
    );
  }
}

export default App;


//npm run start
//need to run in client directory