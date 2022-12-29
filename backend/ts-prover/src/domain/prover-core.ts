const util = require('util');
import {resolve} from 'path';

const _exec = util.promisify(require('child_process').exec);
const CIRCUIT_BASE = process.env.CIRCUIT_BASE || '';
const RAPIDSNARK_PATH = process.env.RAPIDSNARK_PATH ? resolve(__dirname, process.env.RAPIDSNARK_PATH) : '';
const CircomBuildBaseDir = resolve(__dirname, '../', CIRCUIT_BASE);
export const BatchesDir = resolve(__dirname, '../', CIRCUIT_BASE);
const cmdLogs: string[] = [];
const DEBUG = true;

export async function prove(inputName: string, inputPath: string, circuitName: string) {
  console.time(`prove ${inputPath}`);
  const { witnessPath } = await generateWitness(inputName, inputPath, circuitName);
  const {
    proofPath,
    publicPath,
  } = await generateProof(inputName, witnessPath, circuitName);
  console.timeEnd(`prove ${inputPath}`);
  return {
    witnessPath,
    proofPath,
    publicPath,
  };
}

export async function generateProof(inputName: string, witnessPath: string, circuitName: string) {
  const baseFolderPath = resolve(__dirname, `${CircomBuildBaseDir}/${circuitName}`);

  const proofPath = resolve(__dirname, `${BatchesDir}/${inputName}-proof.json`);
  const publicPath = resolve(__dirname, `${BatchesDir}/${inputName}-public.json`);
  const proveCmd = RAPIDSNARK_PATH ? `${RAPIDSNARK_PATH}` : 'npx snarkjs groth16 prove';
  const { stdout, } = await exec(`${proveCmd} ${baseFolderPath}/${circuitName}.zkey ${witnessPath} ${proofPath} ${publicPath}`);

  return {
    stdout,
    proofPath,
    publicPath,
  };
}

export async function generateWitness(inputName: string, inputPath: string, circuitName: string) {
  const buildDir = resolve(__dirname, `${CircomBuildBaseDir}/${circuitName}`);
  const witnessPath = resolve(__dirname, `${BatchesDir}/${inputName}-witness.wtns`);
  const { stdout, } = await exec(`node ${buildDir}/${circuitName}_js/generate_witness.js ${buildDir}/${circuitName}_js/${circuitName}.wasm ${inputPath} ${witnessPath}`);

  return {
    stdout,
    circuitName,
    witnessPath,
  };
}


function exec(cmd: string): Promise<{id: number, cmd: string, stdout: string}> {
  cmdLogs.push(cmd);
  const id = cmdLogs.length - 1;
  console.log(`exec command(${id}): ${cmd}`);
  return new Promise((resolve, reject) => {
    _exec(cmd).then(({stdout, stderr}: {stdout: string, stderr: string}) => {
      if(stderr) throw new Error(stderr);
      if(DEBUG) console.log(stdout);
      return resolve({id, cmd: cmdLogs[id], stdout});
    }).catch((stderr: any) => {
      if(DEBUG) console.error(stderr);
      return reject(stderr);
    });
  });
}
