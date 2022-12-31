import { ethers } from 'ethers';
import commitmentData from './example/zkobs-p1/0_register-acc1-p5-commitment.json';
import calldata from './example/zkobs-p1/0_register-acc1-p5-8-8-4-8-calldata-raw.json';
import { expect } from 'chai';
import { stateToCommitment } from './helper/helper';

describe('compare commitment date sha256', function main() {
  it('compare commitment date sha256', async function () {
    const { commitment, commitmentMessage, commitmentHashOrigin } =
      stateToCommitment(commitmentData);

    console.log({
      commitmentMessage,
      commitmentHashOrigin,
      commitment,
      actualInput: calldata[3][0],
    });

    expect(commitment).to.be.eq(calldata[3][0]);
  });
});
