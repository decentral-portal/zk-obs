import fs from 'fs';
import { expect } from 'chai';
import { stateToCommitment } from '../lib/helper';
import { resolve } from 'path';
const BaseDir = './test/example/zkobs-10-8-4';

function initTestData(baseDir: string) {
  const result = [];
  const files = fs.readdirSync(baseDir, {
    withFileTypes: true,
  });
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    // if (file.isDirectory()) {
    //   const r: any = initTestData(resolve(baseDir, file.name));
    //   result.push(r);
    // }
    if (file.isFile() && file.name.endsWith('-commitment.json')) {
      const name = file.name.replace('-commitment.json', '');
      const commitmentPath = resolve(baseDir, file.name);
      const calldataPath = resolve(baseDir, `${name}-calldata-raw.json`);
      const commitmentData = JSON.parse(
        fs.readFileSync(commitmentPath, 'utf-8'),
      );
      const callData = JSON.parse(fs.readFileSync(calldataPath, 'utf-8'));
      result.push({
        path: resolve(baseDir, file.name),
        commitmentData,
        callData,
      });
    }
  }
  return result;
}
describe('compare commitment date sha256', function main() {
  const result = initTestData(BaseDir);
  it('compare commitment date sha256', async function () {
    for (let index = 0; index < result.length; index++) {
      const { path, commitmentData, callData } = result[index];
      const { commitment, commitmentMessage, commitmentHashOrigin } =
        stateToCommitment(commitmentData);
      const isSame = commitment === callData[3][0];
      console.log({
        path,
        isSame,
      });
      expect(commitment).to.be.eq(callData[3][0]);
    }
  });
});
