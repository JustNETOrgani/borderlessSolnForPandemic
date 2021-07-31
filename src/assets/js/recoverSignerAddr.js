import ethUtil from 'ethereumjs-utils'

function recoveredAddrFromSig (msg, signature) {
  const msgBuffer = ethUtil.toBuffer(msg)
  const msgHash = ethUtil.hashPersonalMessage(msgBuffer)
  const signatureBuffer = ethUtil.toBuffer(signature)
  const signatureParams = ethUtil.fromRpcSig(signatureBuffer)
  const publicKey = ethUtil.ecrecover(
    msgHash,
    signatureParams.v,
    signatureParams.r,
    signatureParams.s
  )
  const addressBuffer = ethUtil.publicToAddress(publicKey)
  const address = ethUtil.bufferToHex(addressBuffer)
  return address
}
export default recoveredAddrFromSig
