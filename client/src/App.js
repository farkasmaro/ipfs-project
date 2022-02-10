//Client side application - handling back end & GUI

import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";  
//Included with truffle box - enables the client side app to talk to ethereum chain
//Can fetch read/write data from smart contracts. 
import ipfs from './ipfs'  //importing node connectino settings from ./ipfs.js


//import "./css/oswald.css"
//import "./css/open-sans.css"
//import './css/pure-min.css'
import "./App.css"
import Web3 from "web3";

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
    try {

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

      //Get IPFShash? - if updated before refresh
      
      //this.runExample();
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({web3, accounts, contract: instance});  //, this.runExample
      //Need to set ipfsHash here rather than running example.

      //not getting hte right value, I want to set the ipfsHash vakue, and then retreive. 
      //const ipfsHash = this.state.contract.get;
      //------
      this.setState({ipfsHash: this.state.ipfsHash});

      console.log('ipfsHash2: ', this.state.ipfsHash)
      console.log('web3: ', this.state.web3)
      console.log('accounts: ', this.state.accounts)
      console.log('contract: ', this.state.contract)

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

 
  runExample = async () => {
    //I haven't yet changed this function, but it's running 'Example'.
    //This just sets the origin state to 'ipfsHash'
    const { accounts, contract, ipfsHash } = this.state;
    console.log('runExample being called...');
    // Stores a given value, 5 by default.
    //await contract.methods.set(5).send({ from: accounts[0] });   ??

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ipfsHash: ipfsHash});  // storageValue: response ?
  };

  //Handlers for file capture and submit

  captureFile(event) {
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
      alert(
        'Uploaded file converted to array buffer.',
      );
    }
  }
  
  onSubmit(event) {
    event.preventDefault()  //Prevent refreshing of page
    //console.log('on submit...')
    //read files add add the buffer value to 'add
    //update ipfs
    ipfs.files.add(this.state.buffer, (error, result) => {
      if (error) {
        console.error(error)  //error handling
        return
      }
      //Update blockchain
      //Setting the ipfshash 'state' isn't working?

      this.state.contract.methods.set(result[0].hash).send({from : this.state.accounts[0]})
      console.log('result hash: ', result[0].hash)
      this.state.ipfsHash = result[0].hash.toString()   //At this point the state value for ipfshash is't being updated
      console.log('new state ipfsHash: ', this.state.ipfsHash)
      //now returning the right value?
      return
      //this.setState({ipfsHash: result[0].hash})
      
    })

    //Test symmetric encrypt
    var hw = encrypt(new Buffer("Farkas Maro encrypt me", "utf8"))
// outputs hello world
    console.log(hw);
    console.log(decrypt(hw).toString('utf8'));

    console.log('ipfsHash2: ', this.state.ipfsHash)
  }

//Render functions

//This is my react render that couples components with markup
//Edit the GUI below (currently just a template):
  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <nav className= "navbar pure-menu pure-menu horizontal">
          <a href="#" className= "pure-menu-heading pure-menu-link">IPFS File Upload</a>
        </nav>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>IPFS and Blockchain File Storage</h1>
              <p>This file is stored on IPFS & The Ethereum Blockchain!</p>
              <img src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`} alt=  " :( ~ Hash not found"/> 
              <h2>Upload File</h2>
              <form onSubmit={this.onSubmit} > 
                <input type='file' onChange={this.captureFile} />
                <input type='submit' />
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App;


//npm run start
//need to run in client directory