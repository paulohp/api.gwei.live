const Web3 = require('web3')

const web3 = new Web3('ws://139.59.93.208:8883')

const fastify = require('fastify')()
fastify.use(require('cors')())
fastify.get('/tx/:txHash', async (request, reply) => {
  const { params } = request
  const tx = await web3.eth.getTransaction(params.txHash)
  const txReceipt = await web3.eth.getTransactionReceipt(params.txHash)
  tx.status = txReceipt.status === true ? 'success' : 'fail'
  tx.gasUsed = txReceipt.gasUsed
  tx.gasPrice = web3.utils.fromWei(tx.gasPrice, 'ether')
  tx.cumulativeGasUsed = txReceipt.cumulativeGasUsed
  tx.logs = txReceipt.logs
  tx.blockHeight = await web3.eth.getBlockNumber() - tx.blockNumber
  tx.value = web3.utils.fromWei(tx.value, 'ether')

  reply.send(tx)
})

fastify.get('/address/:address', async (request, reply) => {
  const { params } = request
  const balanceInWei = await web3.eth.getBalance(params.address)
  const txCount = await web3.eth.getTransactionCount(params.address)

  reply.send({
    balance: web3.utils.fromWei(balanceInWei, 'ether'),
    txCount,
    balanceInWei,
    address: params.address
  })
})

// Run the server!
fastify.listen(3002, function (err) {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})


// web3.eth.subscribe('newBlockHeaders', (err, res) => {
//   if (err) { console.error(err) }
// })
//   .on('data', (block) => {
//     web3.eth.isSyncing()
//     .then((syncing) => {
//       if(!syncing) {
//         console.log(block)
//       }
//     })
//   })
//   .on('error', err => console.error(err))