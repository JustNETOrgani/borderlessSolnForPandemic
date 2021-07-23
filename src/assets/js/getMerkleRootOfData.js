import MerkleTree from 'merkletreejs'
import SHA256 from 'crypto-js/sha256'

function getMerkleRootFromMkTree (dataArray) {
  const leaves = dataArray.map(x => SHA256(x))
  const tree = new MerkleTree(leaves, SHA256)
  const mkRoot = tree.getRoot().toString('hex')
  // verify proof
  const leaf = SHA256(dataArray[0])
  const proof = tree.getProof(leaf)
  const proofStatus = tree.verify(proof, leaf, mkRoot) // true
  return { merkleRoot: '0x' + mkRoot, aProof: proofStatus }
}

export default getMerkleRootFromMkTree
