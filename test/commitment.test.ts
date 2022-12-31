import { ethers } from 'ethers';
import commitmentData from './example/zkobs-p1/0_register-acc1-p5-commitment.json';
import calldata from './example/zkobs-p1/0_register-acc1-p5-8-8-4-8-calldata-raw.json';
import { expect } from 'chai';

describe('compare commitment date sha256', function main() {
  it('compare commitment date sha256', async function () {
    const commitmentMessage = ethers.utils.solidityPack(
      ['bytes32', 'bytes32', 'bytes32', 'bytes'],
      [
        commitmentData.oriStateRoot,
        commitmentData.newStateRoot,
        commitmentData.newTsRoot,
        commitmentData.pubdata,
      ],
    );
    const commitmentHashOrigin = ethers.utils.sha256(commitmentMessage);

    const verifyInput = toHex(
      BigInt(
        '0b' +
          BigInt(commitmentHashOrigin).toString(2).padStart(256, '0').slice(3),
      ),
    );

    console.log({
      commitmentMessage,
      commitmentHashOrigin,
      verifyInput,
      actualInput: calldata[3][0],
    });

    expect(verifyInput).to.be.eq(calldata[3][0]);
  });
});

function toHex(n: string | BigInt) {
  const num = typeof n === 'bigint' ? n : BigInt(n as string);
  const rawHex = num.toString(16);
  return '0x' + (rawHex.length % 2 === 0 ? rawHex : '0' + rawHex);
}
