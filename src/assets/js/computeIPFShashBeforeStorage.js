import ipfshash from 'ipfs-only-hash'

async function computeIPFShash (data) {
  const cid = await ipfshash.of(data)
  return cid
}

export default computeIPFShash
