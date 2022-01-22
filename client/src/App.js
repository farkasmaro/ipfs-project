//Client side application - handling back end & GUI

import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";  
//Included with truffle box - enables the client side app to talk to ethereum chain
//Can fetch read/write data from smart contracts. 
import ipfs from './ipfs'  //importing node connectino settings from ./ipfs.js

import "./App.css";

class App extends Component {
  state = { ipfsHash: '', storageValue: 0, web3: null, accounts: null, contract: null };

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


      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance});  //, this.runExample
      //Need to set ipfsHash here rather than running example.
      //this.setState({ipfsHash: ipfsHash}); 
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
      this.state.contract.methods.set(result[0].hash).send({
        from: this.state.accounts[0] }).then((r) =>{ //???
        return this.setState({ipfsHash: result[0].hash})
        console.log('ipfsHash', this.state.ipfsHash)
      })
      //this.setState({ipfsHash: result[0].hash})
      //console.log('ipfsHash', this.state.ipfsHash)
    })
  }

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
              <h1>My Image</h1>
              <p>This image is stored on IPFS & The Ethereum Blockchain!</p>
              <img src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`} alt=  " :( ~ Hash not found"/>
              <h2>Upload Image</h2>
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