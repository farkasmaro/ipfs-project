const IPFS = require('ipfs-api')  //renamed?
const ipfs = new IPFS({host: 'ipfs.infura.io', port: 5001, protocol: 'https'});

export default ipfs;

//import { create } from 'ipfs-http-client'
//const ipfs = create('https://ipfs.infura.io:5001')
