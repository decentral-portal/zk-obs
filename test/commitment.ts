import { ethers } from 'ethers';
import commitmentData from '../test/example/zkobs-p1/0_register-acc1-p5-commitment.json';
import calldata from '../test/example/zkobs-p1/0_register-acc1-p5-8-8-4-8-calldata-raw.json';

async function main() {
  console.log({
    ol: commitmentData.o_chunk.length,
    cl: commitmentData.isCriticalChunk.length,
  });
  const commitment = ethers.utils.solidityPack(
    ['bytes32', 'bytes32', 'bytes32', 'bytes'],
    [
      commitmentData.oriStateRoot,
      commitmentData.newStateRoot,
      commitmentData.newTsRoot,
      commitmentData.pubdata,
    ],
  );
  const commitmentHash = ethers.utils.sha256(commitment);
  console.log('commitmentHash:', commitmentHash);
  console.log({
    commitmentData,
    commitmentHash,
    actual: calldata[3][0],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
