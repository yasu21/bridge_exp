import Web3 from 'web3'

export default function (context, inject) {
  let web3
  if (window.ethereum) {
    web3 = new Web3(window.ethereum)
  } else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider)
  } else {
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    return
  }
  // console.log(context)
  inject('web3', web3)
}
