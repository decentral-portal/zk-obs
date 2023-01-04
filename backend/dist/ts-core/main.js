/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("cluster");;

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.bootstrap = void 0;
const ts_operator_module_1 = __webpack_require__(3);
const setup_helper_1 = __webpack_require__(78);
async function bootstrap() {
    const app = await (0, setup_helper_1.setupApp)(ts_operator_module_1.TsOperatorModule);
    return app;
}
exports.bootstrap = bootstrap;


/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsOperatorModule = void 0;
const operator_processor_1 = __webpack_require__(4);
const pinoLogger_service_1 = __webpack_require__(6);
const common_1 = __webpack_require__(7);
const logger_module_1 = __webpack_require__(15);
const config_1 = __webpack_require__(11);
const constant_1 = __webpack_require__(5);
const BullQueue_module_1 = __webpack_require__(19);
const nestjs_ethers_1 = __webpack_require__(10);
const nest_bullmq_1 = __webpack_require__(13);
const tstypeorm_module_1 = __webpack_require__(20);
const operator_producer_1 = __webpack_require__(66);
const rollupInformation_entity_1 = __webpack_require__(64);
const typeorm_1 = __webpack_require__(21);
const transactionInfo_entity_1 = __webpack_require__(27);
const cluster_module_1 = __webpack_require__(73);
const worker_service_1 = __webpack_require__(67);
const db_pubsub_module_1 = __webpack_require__(75);
const accountInformation_entity_1 = __webpack_require__(23);
const localNetwork = {
    name: 'LOCAL',
    chainId: 31337,
    _defaultProvider: (providers) => {
        return new providers.JsonRpcProvider('http://localhost:8545');
    },
};
let TsOperatorModule = class TsOperatorModule {
    logger;
    workerService;
    constructor(logger, workerService) {
        this.logger = logger;
        this.workerService = workerService;
    }
    onModuleInit() {
        this.workerService.ready();
    }
};
TsOperatorModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            logger_module_1.LoggerModule,
            BullQueue_module_1.BullQueueModule,
            nest_bullmq_1.BullModule.registerQueue({
                queueName: constant_1.TsWorkerName.CORE,
            }, {
                queueName: constant_1.TsWorkerName.OPERATOR,
            }),
            tstypeorm_module_1.TsTypeOrmModule,
            typeorm_1.TypeOrmModule.forFeature([rollupInformation_entity_1.RollupInformation, transactionInfo_entity_1.TransactionInfo, accountInformation_entity_1.AccountInformation]),
            nestjs_ethers_1.EthersModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    network: configService.get('ETHEREUM_NETWORK', 'TESTNET') === 'MAINNET' ? nestjs_ethers_1.MAINNET_NETWORK : nestjs_ethers_1.GOERLI_NETWORK,
                    etherscan: configService.get('ETHERSCAN_API_KEY'),
                    quorum: 1,
                    useDefaultProvider: true,
                }),
            }),
            cluster_module_1.WorkerModule,
            db_pubsub_module_1.DatabasePubSubModule,
        ],
        controllers: [],
        providers: [operator_processor_1.OperatorConsumer, operator_producer_1.OperatorProducer,],
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _a : Object, typeof (_b = typeof worker_service_1.WorkerService !== "undefined" && worker_service_1.WorkerService) === "function" ? _b : Object])
], TsOperatorModule);
exports.TsOperatorModule = TsOperatorModule;


/***/ }),
/* 4 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OperatorConsumer = void 0;
const constant_1 = __webpack_require__(5);
const pinoLogger_service_1 = __webpack_require__(6);
const nestjs_ethers_1 = __webpack_require__(10);
const config_1 = __webpack_require__(11);
const ABI = __webpack_require__(12);
const nest_bullmq_1 = __webpack_require__(13);
const bullmq_1 = __webpack_require__(14);
let OperatorConsumer = class OperatorConsumer {
    config;
    logger;
    ethersSigner;
    ethersContract;
    wallet;
    contract;
    constructor(config, logger, ethersSigner, ethersContract) {
        this.config = config;
        this.logger = logger;
        this.ethersSigner = ethersSigner;
        this.ethersContract = ethersContract;
        this.wallet = this.ethersSigner.createWallet(this.config.get('ETHEREUM_OPERATOR_PRIV', ''));
        this.contract = this.ethersContract.create(this.config.get('ETHEREUM_ROLLUP_CONTRACT_ADDR', ''), ABI, this.wallet);
    }
    async process(job) {
        this.logger.log(`OperatorConsumer.process ${job.data.blockNumber}`);
        return true;
    }
};
__decorate([
    (0, nest_bullmq_1.BullWorkerProcess)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof bullmq_1.Job !== "undefined" && bullmq_1.Job) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], OperatorConsumer.prototype, "process", null);
OperatorConsumer = __decorate([
    (0, nest_bullmq_1.BullWorker)({
        queueName: constant_1.TsWorkerName.OPERATOR,
        options: {
            concurrency: 1,
        },
    }),
    __param(2, (0, nestjs_ethers_1.InjectSignerProvider)()),
    __param(3, (0, nestjs_ethers_1.InjectContractProvider)()),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _b : Object, typeof (_c = typeof nestjs_ethers_1.EthersSigner !== "undefined" && nestjs_ethers_1.EthersSigner) === "function" ? _c : Object, typeof (_d = typeof nestjs_ethers_1.EthersContract !== "undefined" && nestjs_ethers_1.EthersContract) === "function" ? _d : Object])
], OperatorConsumer);
exports.OperatorConsumer = OperatorConsumer;


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsWorkerName = void 0;
var TsWorkerName;
(function (TsWorkerName) {
    TsWorkerName["UNKNOWN"] = "unknown";
    TsWorkerName["CORE"] = "TsCore";
    TsWorkerName["OPERATOR"] = "TsOperator";
    TsWorkerName["PROVER"] = "TsProver";
    TsWorkerName["SEQUENCER"] = "TsSequencer";
    TsWorkerName["GATEWAY"] = "TsGateway";
})(TsWorkerName = exports.TsWorkerName || (exports.TsWorkerName = {}));


/***/ }),
/* 6 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PinoLoggerService = void 0;
const common_1 = __webpack_require__(7);
const helper_1 = __webpack_require__(8);
const nestjs_pino_1 = __webpack_require__(9);
let PinoLoggerService = class PinoLoggerService extends common_1.ConsoleLogger {
    logger;
    contextName;
    constructor(logger) {
        super();
        this.logger = logger;
        this.contextName = 'context';
    }
    setContext(name) {
        this.logger.setContext(name);
    }
    verbose(message, context, ...args) {
        if (context) {
            this.logger.trace({ [this.contextName]: context, process: (0, helper_1.getProcessName)() }, message, ...args);
        }
        else {
            this.logger.trace(message, ...args);
        }
    }
    debug(message, context, ...args) {
        if (context) {
            this.logger.debug({ [this.contextName]: context, process: (0, helper_1.getProcessName)() }, message, ...args);
        }
        else {
            this.logger.debug(message, ...args);
        }
    }
    log(message, context, ...args) {
        if (context) {
            this.logger.info({ [this.contextName]: context, process: (0, helper_1.getProcessName)() }, message, ...args);
        }
        else {
            this.logger.info(message, ...args);
        }
    }
    warn(message, context, ...args) {
        if (context) {
            this.logger.warn({ [this.contextName]: context, process: (0, helper_1.getProcessName)() }, message, ...args);
        }
        else {
            this.logger.warn(message, ...args);
        }
    }
    error(message, trace, context, ...args) {
        if (context) {
            this.logger.error({ [this.contextName]: context, trace, process: (0, helper_1.getProcessName)() }, message, ...args);
        }
        else if (trace) {
            this.logger.error({ trace }, message, ...args);
        }
        else {
            this.logger.error(message, ...args);
        }
    }
};
PinoLoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof nestjs_pino_1.PinoLogger !== "undefined" && nestjs_pino_1.PinoLogger) === "function" ? _a : Object])
], PinoLoggerService);
exports.PinoLoggerService = PinoLoggerService;


/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("@nestjs/common");;

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.delay = exports.getWorkerName = exports.getProcessName = void 0;
function getProcessName() {
    return `${getWorkerName()}-${process.pid}`;
}
exports.getProcessName = getProcessName;
function getWorkerName() {
    return process.env.TS_WORKER_NAME;
}
exports.getWorkerName = getWorkerName;
function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}
exports.delay = delay;


/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("nestjs-pino");;

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("nestjs-ethers");;

/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("@nestjs/config");;

/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = JSON.parse('[{"inputs":[{"internalType":"address","name":"wETHAddr_","type":"address"},{"internalType":"address","name":"verifierAddr_","type":"address"},{"internalType":"bytes32","name":"genesisStateRoot","type":"bytes32"},{"internalType":"address","name":"poseidon2Addr_","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint32","name":"blockNumber","type":"uint32"}],"name":"BlockCommitted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint32","name":"accountId","type":"uint32"},{"indexed":false,"internalType":"uint16","name":"tokenId","type":"uint16"},{"indexed":false,"internalType":"uint128","name":"amount","type":"uint128"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint64","name":"requestId","type":"uint64"},{"indexed":false,"internalType":"enum Operations.OpType","name":"opType","type":"uint8"},{"indexed":false,"internalType":"bytes","name":"pubData","type":"bytes"}],"name":"NewL1Request","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint32","name":"accountId","type":"uint32"},{"indexed":false,"internalType":"uint256","name":"tsPubX","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"tsPubY","type":"uint256"},{"indexed":false,"internalType":"bytes20","name":"l2Addr","type":"bytes20"}],"name":"Register","type":"event"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"accountIdOf","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"accountNum","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddr","type":"address"}],"name":"addToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"uint32","name":"accountId","type":"uint32"},{"internalType":"uint16","name":"tokenId","type":"uint16"},{"internalType":"uint128","name":"amount","type":"uint128"}],"internalType":"struct Operations.Deposit","name":"deposit","type":"tuple"},{"internalType":"uint64","name":"requestId","type":"uint64"}],"name":"checkDepositL1Request","outputs":[{"internalType":"bool","name":"isExisted","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"uint32","name":"accountId","type":"uint32"},{"internalType":"bytes20","name":"l2Addr","type":"bytes20"}],"internalType":"struct Operations.Register","name":"register","type":"tuple"},{"internalType":"uint64","name":"requestId","type":"uint64"}],"name":"checkRegisterL1Request","outputs":[{"internalType":"bool","name":"isExisted","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"uint32","name":"blockNumber","type":"uint32"},{"internalType":"bytes32","name":"stateRoot","type":"bytes32"},{"internalType":"uint64","name":"l1RequestNum","type":"uint64"},{"internalType":"bytes32","name":"pendingRollupTxHash","type":"bytes32"},{"internalType":"bytes32","name":"commitment","type":"bytes32"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"internalType":"struct ZkOBS.StoredBlock","name":"lastCommittedBlock","type":"tuple"},{"components":[{"internalType":"uint32","name":"blockNumber","type":"uint32"},{"internalType":"bytes32","name":"newStateRoot","type":"bytes32"},{"internalType":"bytes32","name":"newTsRoot","type":"bytes32"},{"internalType":"bytes","name":"publicData","type":"bytes"},{"internalType":"uint32[]","name":"publicDataOffsets","type":"uint32[]"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"internalType":"struct ZkOBS.CommitBlock[]","name":"newBlocks","type":"tuple[]"}],"name":"commitBlocks","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"committedBlockNum","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"committedL1RequestNum","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddr","type":"address"},{"internalType":"uint128","name":"amount","type":"uint128"}],"name":"depositERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"depositETH","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"executedBlockNum","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"firstL1RequestId","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint64","name":"","type":"uint64"}],"name":"l1RequestQueue","outputs":[{"internalType":"bytes32","name":"hashedPubData","type":"bytes32"},{"internalType":"enum Operations.OpType","name":"opType","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pendingL1RequestNum","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"uint32","name":"blockNumber","type":"uint32"},{"internalType":"bytes32","name":"stateRoot","type":"bytes32"},{"internalType":"uint64","name":"l1RequestNum","type":"uint64"},{"internalType":"bytes32","name":"pendingRollupTxHash","type":"bytes32"},{"internalType":"bytes32","name":"commitment","type":"bytes32"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"internalType":"struct ZkOBS.StoredBlock[]","name":"committedBlocks","type":"tuple[]"},{"components":[{"internalType":"uint256[2]","name":"a","type":"uint256[2]"},{"internalType":"uint256[2][2]","name":"b","type":"uint256[2][2]"},{"internalType":"uint256[2]","name":"c","type":"uint256[2]"},{"internalType":"uint256[1]","name":"commitment","type":"uint256[1]"}],"internalType":"struct ZkOBS.Proof[]","name":"proof","type":"tuple[]"}],"name":"proveBlocks","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"provedBlockNum","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tsPubX","type":"uint256"},{"internalType":"uint256","name":"tsPubY","type":"uint256"},{"internalType":"address","name":"tokenAddr","type":"address"},{"internalType":"uint128","name":"amount","type":"uint128"}],"name":"registerERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tsPubX","type":"uint256"},{"internalType":"uint256","name":"tsPubY","type":"uint256"}],"name":"registerETH","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint32","name":"","type":"uint32"}],"name":"storedBlockHashes","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"tokenIdOf","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tokenNum","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"verifierAddr","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"wETHAddr","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]');

/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("@anchan828/nest-bullmq");;

/***/ }),
/* 14 */
/***/ ((module) => {

module.exports = require("bullmq");;

/***/ }),
/* 15 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggerModule = void 0;
const common_1 = __webpack_require__(7);
const nestjs_pino_1 = __webpack_require__(9);
const pino_1 = __webpack_require__(16);
const uuid = __webpack_require__(17);
const FakeLogger_service_1 = __webpack_require__(18);
const pinoLogger_service_1 = __webpack_require__(6);
let LoggerModule = class LoggerModule {
};
LoggerModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    name: 'API',
                    level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
                    genReqId: (req) => req.requestId || uuid.v4(),
                    formatters: { bindings: () => ({}) },
                    timestamp: pino_1.stdTimeFunctions.unixTime,
                },
            }),
        ],
        providers: [FakeLogger_service_1.FakeLoggerService, pinoLogger_service_1.PinoLoggerService],
        exports: [FakeLogger_service_1.FakeLoggerService, pinoLogger_service_1.PinoLoggerService],
    })
], LoggerModule);
exports.LoggerModule = LoggerModule;


/***/ }),
/* 16 */
/***/ ((module) => {

module.exports = require("pino");;

/***/ }),
/* 17 */
/***/ ((module) => {

module.exports = require("uuid");;

/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FakeLoggerService = void 0;
const common_1 = __webpack_require__(7);
class FakeLoggerService extends common_1.ConsoleLogger {
    logger;
    contextName;
    constructor(logger) {
        super();
        this.logger = logger;
        this.contextName = 'context';
    }
    log = () => { };
    debug = () => { };
    verbose = () => { };
    info = () => { };
    warn = () => { };
    error = () => { };
    setContext = () => { };
}
exports.FakeLoggerService = FakeLoggerService;


/***/ }),
/* 19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BullQueueModule = void 0;
const nest_bullmq_1 = __webpack_require__(13);
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
let BullQueueModule = class BullQueueModule {
};
BullQueueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nest_bullmq_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    options: {
                        connection: {
                            host: configService.get('BULL_QUEUE_REDIS_HOST', 'localhost'),
                            port: configService.get('BULL_QUEUE_REDIS_PORT', 6379),
                        }
                    },
                })
            }),
        ],
    })
], BullQueueModule);
exports.BullQueueModule = BullQueueModule;


/***/ }),
/* 20 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsTypeOrmModule = void 0;
const pinoLogger_service_1 = __webpack_require__(6);
const logger_module_1 = __webpack_require__(15);
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
const typeorm_1 = __webpack_require__(21);
const account_module_1 = __webpack_require__(22);
const auctionOrder_module_1 = __webpack_require__(53);
const rollup_module_1 = __webpack_require__(63);
let TsTypeOrmModule = class TsTypeOrmModule {
};
TsTypeOrmModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            logger_module_1.LoggerModule,
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const isProduction = configService.get('NODE_ENV') === 'prod';
                    return {
                        ssl: isProduction,
                        extra: {
                            ssl: isProduction ? { rejectUnauthorized: false } : null,
                        },
                        type: 'postgres',
                        host: configService.get('DB_HOST', ''),
                        port: configService.get('DB_PORT', 5432),
                        username: configService.get('DB_USER', ''),
                        password: configService.get('DB_PASSWD', ''),
                        database: configService.get('DB_NAME', ''),
                        autoLoadEntities: true,
                        synchronize: configService.get('NODE_ENV', 'dev') == 'dev',
                    };
                },
            }),
            account_module_1.AccountModule, auctionOrder_module_1.AuctionOrderMoudle, rollup_module_1.RollupModule
        ],
        providers: [
            typeorm_1.TypeOrmModule,
            pinoLogger_service_1.PinoLoggerService
        ],
        exports: [typeorm_1.TypeOrmModule]
    })
], TsTypeOrmModule);
exports.TsTypeOrmModule = TsTypeOrmModule;


/***/ }),
/* 21 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");;

/***/ }),
/* 22 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccountModule = void 0;
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
const typeorm_1 = __webpack_require__(21);
const accountInformation_entity_1 = __webpack_require__(23);
const accountLeafNode_entity_1 = __webpack_require__(37);
const accountMerkleTreeNode_entity_1 = __webpack_require__(38);
const blockInformation_entity_1 = __webpack_require__(29);
const obsMerkleTreeService_1 = __webpack_require__(39);
const tokenLeafNode_entity_1 = __webpack_require__(51);
const tokenMerkleTreeNode_entity_1 = __webpack_require__(52);
const transactionInfo_entity_1 = __webpack_require__(27);
const tsAccountTree_service_1 = __webpack_require__(40);
const tsTokenTree_service_1 = __webpack_require__(50);
let AccountModule = class AccountModule {
};
AccountModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([
                accountInformation_entity_1.AccountInformation,
                accountLeafNode_entity_1.AccountLeafNode,
                accountMerkleTreeNode_entity_1.AccountMerkleTreeNode,
                tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode,
                tokenLeafNode_entity_1.TokenLeafNode,
                transactionInfo_entity_1.TransactionInfo,
                blockInformation_entity_1.BlockInformation
            ])
        ],
        providers: [tsAccountTree_service_1.TsAccountTreeService, tsTokenTree_service_1.TsTokenTreeService, obsMerkleTreeService_1.ObsMerkleTreeService],
        controllers: [],
        exports: [tsAccountTree_service_1.TsAccountTreeService, tsTokenTree_service_1.TsTokenTreeService, obsMerkleTreeService_1.ObsMerkleTreeService, typeorm_1.TypeOrmModule]
    })
], AccountModule);
exports.AccountModule = AccountModule;


/***/ }),
/* 23 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccountInformation = void 0;
const typeorm_1 = __webpack_require__(24);
const obsOrder_entity_1 = __webpack_require__(25);
const baseTimeEntity_1 = __webpack_require__(28);
const ts_helper_1 = __webpack_require__(33);
const role_enum_1 = __webpack_require__(36);
const transactionInfo_entity_1 = __webpack_require__(27);
let AccountInformation = class AccountInformation extends baseTimeEntity_1.BaseTimeEntity {
    L1Address;
    accountId;
    email;
    lastedLoginIp;
    lastLoginTime;
    role;
    password;
    refreshToken;
    label;
    labelBy;
    tsPubKeyX;
    tsPubKeyY;
    transactionInfos;
    obsOrders;
    get hashedTsPubKey() {
        const raw = BigInt((0, ts_helper_1.tsHashFunc)([
            this.tsPubKeyX, this.tsPubKeyY
        ]));
        const hash = raw % BigInt(2 ** 160);
        return hash;
    }
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'varchar',
        name: 'L1Address',
        length: 256,
        primary: true,
    }),
    __metadata("design:type", String)
], AccountInformation.prototype, "L1Address", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'accountId',
        precision: 86,
        scale: 0,
        nullable: false,
    }),
    __metadata("design:type", String)
], AccountInformation.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'email',
        length: 256,
        nullable: true,
        unique: false,
    }),
    __metadata("design:type", String)
], AccountInformation.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'lastedLoginIp',
        length: 256,
        nullable: true,
        default: null,
    }),
    __metadata("design:type", Object)
], AccountInformation.prototype, "lastedLoginIp", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp without time zone',
        name: 'lastLoginTime',
        nullable: true,
    }),
    __metadata("design:type", Object)
], AccountInformation.prototype, "lastLoginTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        name: 'role',
        enumName: 'Role',
        enum: [role_enum_1.Role.ADMIN, role_enum_1.Role.MEMBER, role_enum_1.Role.OPERATOR],
        nullable: false,
        default: role_enum_1.Role.MEMBER,
    }),
    __metadata("design:type", typeof (_b = typeof role_enum_1.Role !== "undefined" && role_enum_1.Role) === "function" ? _b : Object)
], AccountInformation.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'password',
        length: 300,
        nullable: true,
    }),
    __metadata("design:type", Object)
], AccountInformation.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'refreshToken',
        length: 400,
        nullable: true,
    }),
    __metadata("design:type", Object)
], AccountInformation.prototype, "refreshToken", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        name: 'label',
        nullable: true,
        default: () => '\'{}\'',
    }),
    __metadata("design:type", Object)
], AccountInformation.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'labelBy',
        length: 256,
        nullable: true,
    }),
    __metadata("design:type", Object)
], AccountInformation.prototype, "labelBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'tsPubKeyX',
        length: '100',
        nullable: false,
        default: '\'0\'',
    }),
    __metadata("design:type", String)
], AccountInformation.prototype, "tsPubKeyX", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'tsPubKeyY',
        length: '100',
        nullable: false,
        default: '\'0\'',
    }),
    __metadata("design:type", String)
], AccountInformation.prototype, "tsPubKeyY", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transactionInfo_entity_1.TransactionInfo, (transactionInfo) => transactionInfo.L2AccountInfo),
    __metadata("design:type", Array)
], AccountInformation.prototype, "transactionInfos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => obsOrder_entity_1.ObsOrderEntity, (obsOrder) => obsOrder.accountInfo),
    (0, typeorm_1.JoinColumn)({
        name: 'accountId',
        referencedColumnName: 'accountId',
    }),
    __metadata("design:type", Object)
], AccountInformation.prototype, "obsOrders", void 0);
AccountInformation = __decorate([
    (0, typeorm_1.Entity)('AccountInformation', { schema: 'public' })
], AccountInformation);
exports.AccountInformation = AccountInformation;


/***/ }),
/* 24 */
/***/ ((module) => {

module.exports = require("typeorm");;

/***/ }),
/* 25 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ObsOrderEntity = void 0;
const typeorm_1 = __webpack_require__(24);
const accountInformation_entity_1 = __webpack_require__(23);
const matchObsOrder_entity_1 = __webpack_require__(26);
const tsSide_enum_1 = __webpack_require__(32);
let ObsOrderEntity = class ObsOrderEntity {
    id;
    side;
    txId;
    reqType;
    accountId;
    marketPair;
    price;
    orderStatus;
    mainQty;
    baseQty;
    remainMainQty;
    remainBaseQty;
    accumulatedMainQty;
    accumulatedBaseQty;
    mainTokenId;
    baseTokenId;
    timestamp;
    isMaker;
    orderLeafId;
    matchOrders;
    accountInfo;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        type: 'int8',
        name: 'id',
    }),
    __metadata("design:type", Number)
], ObsOrderEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        name: 'side',
        enumName: 'SIDE',
        enum: [
            tsSide_enum_1.TsSide.BUY,
            tsSide_enum_1.TsSide.SELL,
        ],
        nullable: false,
        default: () => `\'${tsSide_enum_1.TsSide.BUY}\'`,
    }),
    __metadata("design:type", typeof (_a = typeof tsSide_enum_1.TsSide !== "undefined" && tsSide_enum_1.TsSide) === "function" ? _a : Object)
], ObsOrderEntity.prototype, "side", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int8',
        name: 'txId',
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], ObsOrderEntity.prototype, "txId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'reqType',
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], ObsOrderEntity.prototype, "reqType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'accountId',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], ObsOrderEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'marketPair',
        length: 100,
        nullable: false,
        default: '\'ETH/USDC\'',
    }),
    __metadata("design:type", String)
], ObsOrderEntity.prototype, "marketPair", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'price',
        precision: 86,
        scale: 8,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], ObsOrderEntity.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'orderStatus',
        nullable: false,
        default: 1,
    }),
    __metadata("design:type", Number)
], ObsOrderEntity.prototype, "orderStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'mainQty',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], ObsOrderEntity.prototype, "mainQty", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'baseQty',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], ObsOrderEntity.prototype, "baseQty", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'remainMainQty',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], ObsOrderEntity.prototype, "remainMainQty", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'remainBaseQty',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], ObsOrderEntity.prototype, "remainBaseQty", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'accumulatedMainQty',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], ObsOrderEntity.prototype, "accumulatedMainQty", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'accumulatedBaseQty',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], ObsOrderEntity.prototype, "accumulatedBaseQty", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'mainTokenId',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", String)
], ObsOrderEntity.prototype, "mainTokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'baseTokenId',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", String)
], ObsOrderEntity.prototype, "baseTokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp without time zone',
        name: 'timestamp',
        nullable: false,
        precision: 3,
        default: () => 'now()',
    }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], ObsOrderEntity.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'boolean',
        name: 'isMaker',
        nullable: false,
        default: false,
    }),
    __metadata("design:type", Boolean)
], ObsOrderEntity.prototype, "isMaker", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int8',
        name: 'orderLeafId',
        nullable: true,
        unique: true,
    }),
    __metadata("design:type", Object)
], ObsOrderEntity.prototype, "orderLeafId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => matchObsOrder_entity_1.MatchObsOrderEntity, (matchOrders) => matchOrders.marketPair),
    (0, typeorm_1.JoinColumn)({
        name: 'id',
        referencedColumnName: 'referenceOrder'
    }),
    __metadata("design:type", Array)
], ObsOrderEntity.prototype, "matchOrders", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => accountInformation_entity_1.AccountInformation, (accountInfo) => accountInfo.obsOrders, {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'accountId',
        referencedColumnName: 'accountId'
    }),
    __metadata("design:type", typeof (_c = typeof accountInformation_entity_1.AccountInformation !== "undefined" && accountInformation_entity_1.AccountInformation) === "function" ? _c : Object)
], ObsOrderEntity.prototype, "accountInfo", void 0);
ObsOrderEntity = __decorate([
    (0, typeorm_1.Entity)('ObsOrder', { schema: 'public' })
], ObsOrderEntity);
exports.ObsOrderEntity = ObsOrderEntity;


/***/ }),
/* 26 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MatchObsOrderEntity = void 0;
const typeorm_1 = __webpack_require__(24);
const transactionInfo_entity_1 = __webpack_require__(27);
const obsOrder_entity_1 = __webpack_require__(25);
const tsSide_enum_1 = __webpack_require__(32);
let MatchObsOrderEntity = class MatchObsOrderEntity {
    id;
    side;
    txId;
    txId2;
    referenceOrder;
    reqType;
    marketPair;
    matchedMQ;
    matchedBQ;
    timestamp;
    orderStatus;
    isVoid;
    isCancel;
    mainOrder;
    matchedTx;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        type: 'int8',
        name: 'id'
    }),
    __metadata("design:type", Number)
], MatchObsOrderEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        name: 'side',
        enumName: 'SIDE',
        enum: [
            tsSide_enum_1.TsSide.BUY,
            tsSide_enum_1.TsSide.SELL
        ],
        default: () => `'${tsSide_enum_1.TsSide.BUY}'`,
        nullable: false,
    }),
    __metadata("design:type", typeof (_a = typeof tsSide_enum_1.TsSide !== "undefined" && tsSide_enum_1.TsSide) === "function" ? _a : Object)
], MatchObsOrderEntity.prototype, "side", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int8',
        name: 'txId',
        nullable: true,
    }),
    __metadata("design:type", Object)
], MatchObsOrderEntity.prototype, "txId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int8',
        name: 'txId2',
        nullable: true,
    }),
    __metadata("design:type", Object)
], MatchObsOrderEntity.prototype, "txId2", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int8',
        name: 'referenceOrder',
        nullable: false,
    }),
    __metadata("design:type", Number)
], MatchObsOrderEntity.prototype, "referenceOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'reqType',
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], MatchObsOrderEntity.prototype, "reqType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'marketPair',
        length: 100,
        default: '\'ETH/USDC\'',
        nullable: false
    }),
    __metadata("design:type", String)
], MatchObsOrderEntity.prototype, "marketPair", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'matchedMQ',
        precision: 86,
        scale: 0,
        default: 0n,
    }),
    __metadata("design:type", String)
], MatchObsOrderEntity.prototype, "matchedMQ", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'matchedBQ',
        precision: 86,
        scale: 0,
        default: 0n
    }),
    __metadata("design:type", String)
], MatchObsOrderEntity.prototype, "matchedBQ", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp without time zone',
        name: 'timestamp',
        precision: 3,
        nullable: false,
        default: 'now()'
    }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], MatchObsOrderEntity.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'orderStatus',
        default: 1,
    }),
    __metadata("design:type", Number)
], MatchObsOrderEntity.prototype, "orderStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'boolean',
        name: 'isVoid',
        default: false,
    }),
    __metadata("design:type", Boolean)
], MatchObsOrderEntity.prototype, "isVoid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'boolean',
        name: 'isCancel',
        default: false,
    }),
    __metadata("design:type", Boolean)
], MatchObsOrderEntity.prototype, "isCancel", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => obsOrder_entity_1.ObsOrderEntity, (obsOrder) => obsOrder.matchOrders, {
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'referenceOrder',
        referencedColumnName: 'id',
    }),
    __metadata("design:type", typeof (_c = typeof obsOrder_entity_1.ObsOrderEntity !== "undefined" && obsOrder_entity_1.ObsOrderEntity) === "function" ? _c : Object)
], MatchObsOrderEntity.prototype, "mainOrder", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => transactionInfo_entity_1.TransactionInfo, (transaction) => transaction.matchedOrder, {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'txId',
        referencedColumnName: 'txId'
    }),
    __metadata("design:type", Object)
], MatchObsOrderEntity.prototype, "matchedTx", void 0);
MatchObsOrderEntity = __decorate([
    (0, typeorm_1.Entity)('MatchObsOrder', { schema: 'public' })
], MatchObsOrderEntity);
exports.MatchObsOrderEntity = MatchObsOrderEntity;


/***/ }),
/* 27 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransactionInfo = void 0;
const typeorm_1 = __webpack_require__(24);
const matchObsOrder_entity_1 = __webpack_require__(26);
const baseTimeEntity_1 = __webpack_require__(28);
const accountInformation_entity_1 = __webpack_require__(23);
const blockInformation_entity_1 = __webpack_require__(29);
const tsStatus_enum_1 = __webpack_require__(31);
let TransactionInfo = class TransactionInfo extends baseTimeEntity_1.BaseTimeEntity {
    txId;
    blockNumber;
    reqType;
    accountId;
    tokenId;
    accumulatedSellAmt;
    accumulatedBuyAmt;
    amount;
    nonce;
    eddsaSig;
    ecdsaSig;
    arg0;
    arg1;
    arg2;
    arg3;
    arg4;
    tsPubKeyX;
    tsPubKeyY;
    fee;
    feeToken;
    metadata;
    txStatus;
    L2AccountInfo;
    blockInfo;
    matchedOrder;
    get tokenAddr() {
        return this.tokenId.toString();
    }
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'integer',
        name: 'txId',
        primary: true,
        nullable: false,
        generated: 'increment',
    }),
    __metadata("design:type", Number)
], TransactionInfo.prototype, "txId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'blockNumber',
        nullable: true,
        default: 0,
    }),
    __metadata("design:type", Object)
], TransactionInfo.prototype, "blockNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'reqType',
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], TransactionInfo.prototype, "reqType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'accountId',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], TransactionInfo.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'tokenId',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], TransactionInfo.prototype, "tokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'accumulatedSellAmt',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], TransactionInfo.prototype, "accumulatedSellAmt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'accumulatedBuyAmt',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], TransactionInfo.prototype, "accumulatedBuyAmt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'amount',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], TransactionInfo.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'nonce',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], TransactionInfo.prototype, "nonce", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'json',
        name: 'eddsaSig',
        nullable: false,
        default: () => JSON.stringify({ R8: ['0', '0'], S: '0' }),
    }),
    __metadata("design:type", Object)
], TransactionInfo.prototype, "eddsaSig", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'ecdsaSig',
        length: '66',
        nullable: false,
        default: '\'\'',
    }),
    __metadata("design:type", String)
], TransactionInfo.prototype, "ecdsaSig", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'arg0',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], TransactionInfo.prototype, "arg0", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'arg1',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], TransactionInfo.prototype, "arg1", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'arg2',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], TransactionInfo.prototype, "arg2", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'arg3',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], TransactionInfo.prototype, "arg3", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'arg4',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], TransactionInfo.prototype, "arg4", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'tsPubKeyX',
        length: '100',
        nullable: false,
        default: '\'0\'',
    }),
    __metadata("design:type", String)
], TransactionInfo.prototype, "tsPubKeyX", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'tsPubKeyY',
        length: '100',
        nullable: false,
        default: '\'0\'',
    }),
    __metadata("design:type", String)
], TransactionInfo.prototype, "tsPubKeyY", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'fee',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], TransactionInfo.prototype, "fee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'feeToken',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], TransactionInfo.prototype, "feeToken", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'json',
        name: 'metadata',
        nullable: false,
        default: () => '\'{}\'',
    }),
    __metadata("design:type", Object)
], TransactionInfo.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        name: 'txStatus',
        enum: [
            tsStatus_enum_1.TS_STATUS.PENDING,
            tsStatus_enum_1.TS_STATUS.PROCESSING,
            tsStatus_enum_1.TS_STATUS.L2EXECUTED,
            tsStatus_enum_1.TS_STATUS.L2CONFIRMED,
            tsStatus_enum_1.TS_STATUS.L1CONFIRMED,
            tsStatus_enum_1.TS_STATUS.FAILED,
            tsStatus_enum_1.TS_STATUS.REJECTED,
        ],
        nullable: false,
        default: `'${tsStatus_enum_1.TS_STATUS.PENDING}'`,
    }),
    __metadata("design:type", typeof (_a = typeof tsStatus_enum_1.TS_STATUS !== "undefined" && tsStatus_enum_1.TS_STATUS) === "function" ? _a : Object)
], TransactionInfo.prototype, "txStatus", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => accountInformation_entity_1.AccountInformation, (accountInformation) => accountInformation.transactionInfos, {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'accountId',
        referencedColumnName: 'accountId',
    }),
    __metadata("design:type", typeof (_b = typeof accountInformation_entity_1.AccountInformation !== "undefined" && accountInformation_entity_1.AccountInformation) === "function" ? _b : Object)
], TransactionInfo.prototype, "L2AccountInfo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => blockInformation_entity_1.BlockInformation, (blockInformation) => blockInformation.transactionInfos, {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'blockNumber',
        referencedColumnName: 'blockNumber',
    }),
    __metadata("design:type", typeof (_c = typeof blockInformation_entity_1.BlockInformation !== "undefined" && blockInformation_entity_1.BlockInformation) === "function" ? _c : Object)
], TransactionInfo.prototype, "blockInfo", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => matchObsOrder_entity_1.MatchObsOrderEntity, (matchedObsOrder) => matchedObsOrder.matchedTx),
    (0, typeorm_1.JoinColumn)({
        name: 'txId',
        referencedColumnName: 'txId',
    }),
    __metadata("design:type", Object)
], TransactionInfo.prototype, "matchedOrder", void 0);
TransactionInfo = __decorate([
    (0, typeorm_1.Entity)('TransactionInfo', { schema: 'public' })
], TransactionInfo);
exports.TransactionInfo = TransactionInfo;


/***/ }),
/* 28 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseTimeEntity = void 0;
const typeorm_1 = __webpack_require__(24);
class BaseTimeEntity {
    createdAt;
    createdBy;
    updatedAt;
    updatedBy;
    deletedAt;
    deletedBy;
}
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'timestamp without time zone',
        name: 'createdAt',
        default: () => 'now()',
    }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], BaseTimeEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'createdBy',
        length: 300,
        nullable: true,
    }),
    __metadata("design:type", Object)
], BaseTimeEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: 'timestamp without time zone',
        name: 'updatedAt',
        default: () => 'now()',
    }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], BaseTimeEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'updatedBy',
        length: 300,
        nullable: true,
    }),
    __metadata("design:type", Object)
], BaseTimeEntity.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({
        type: 'timestamp without time zone',
        name: 'deletedAt',
        nullable: true,
    }),
    __metadata("design:type", Object)
], BaseTimeEntity.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'deletedBy',
        length: 300,
        nullable: true,
    }),
    __metadata("design:type", Object)
], BaseTimeEntity.prototype, "deletedBy", void 0);
exports.BaseTimeEntity = BaseTimeEntity;


/***/ }),
/* 29 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BlockInformation = void 0;
const typeorm_1 = __webpack_require__(24);
const baseTimeEntity_1 = __webpack_require__(28);
const blockStatus_enum_1 = __webpack_require__(30);
const transactionInfo_entity_1 = __webpack_require__(27);
let BlockInformation = class BlockInformation extends baseTimeEntity_1.BaseTimeEntity {
    blockNumber;
    blockHash;
    L1TransactionHash;
    verifiedAt;
    operatorAddress;
    rawData;
    callData;
    proof;
    blockStatus;
    transactionInfos;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        type: 'integer',
        name: 'blockNumber'
    }),
    __metadata("design:type", Number)
], BlockInformation.prototype, "blockNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'blockHash',
        length: 256,
        nullable: true,
    }),
    __metadata("design:type", Object)
], BlockInformation.prototype, "blockHash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'L1TransactionHash',
        length: 512,
    }),
    __metadata("design:type", String)
], BlockInformation.prototype, "L1TransactionHash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp without time zone',
        name: 'verifiedAt',
        nullable: false,
    }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], BlockInformation.prototype, "verifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'operatorAddress',
        length: 256,
        nullable: false,
    }),
    __metadata("design:type", String)
], BlockInformation.prototype, "operatorAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        name: 'rawData',
        nullable: true,
    }),
    __metadata("design:type", Object)
], BlockInformation.prototype, "rawData", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'json',
        name: 'callData',
        nullable: true,
        default: () => '\'{}\'',
    }),
    __metadata("design:type", Object)
], BlockInformation.prototype, "callData", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'json',
        name: 'proof',
        nullable: true,
        default: () => '\'{}\'',
    }),
    __metadata("design:type", Object)
], BlockInformation.prototype, "proof", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        name: 'blockStatus',
        nullable: false,
        enumName: 'BLOCK_STATUS',
        enum: [
            blockStatus_enum_1.BLOCK_STATUS.PROCESSING,
            blockStatus_enum_1.BLOCK_STATUS.L2EXECUTED,
            blockStatus_enum_1.BLOCK_STATUS.L2CONFIRMED,
            blockStatus_enum_1.BLOCK_STATUS.L1CONFIRMED
        ],
        default: `'${blockStatus_enum_1.BLOCK_STATUS.PROCESSING}'`,
    }),
    __metadata("design:type", typeof (_b = typeof blockStatus_enum_1.BLOCK_STATUS !== "undefined" && blockStatus_enum_1.BLOCK_STATUS) === "function" ? _b : Object)
], BlockInformation.prototype, "blockStatus", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transactionInfo_entity_1.TransactionInfo, transactionInfo => transactionInfo.blockInfo),
    (0, typeorm_1.JoinColumn)({
        name: 'blockNumber',
        referencedColumnName: 'blockNumber'
    }),
    __metadata("design:type", Object)
], BlockInformation.prototype, "transactionInfos", void 0);
BlockInformation = __decorate([
    (0, typeorm_1.Entity)('BlockInformation', { schema: 'public' })
], BlockInformation);
exports.BlockInformation = BlockInformation;


/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BLOCK_STATUS = void 0;
var BLOCK_STATUS;
(function (BLOCK_STATUS) {
    BLOCK_STATUS["PROCESSING"] = "PROCESSING";
    BLOCK_STATUS["L2EXECUTED"] = "L2EXECUTED";
    BLOCK_STATUS["L2CONFIRMED"] = "L2CONFIRMED";
    BLOCK_STATUS["L1CONFIRMED"] = "L1CONFIRMED";
})(BLOCK_STATUS = exports.BLOCK_STATUS || (exports.BLOCK_STATUS = {}));


/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TS_STATUS = void 0;
var TS_STATUS;
(function (TS_STATUS) {
    TS_STATUS["PENDING"] = "PENDING";
    TS_STATUS["PROCESSING"] = "PROCESSING";
    TS_STATUS["L2EXECUTED"] = "L2EXECUTED";
    TS_STATUS["L2CONFIRMED"] = "L2CONFIRMED";
    TS_STATUS["L1CONFIRMED"] = "L1CONFIRMED";
    TS_STATUS["FAILED"] = "FAILED";
    TS_STATUS["REJECTED"] = "REJECTED";
})(TS_STATUS = exports.TS_STATUS || (exports.TS_STATUS = {}));


/***/ }),
/* 32 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsSide = void 0;
var TsSide;
(function (TsSide) {
    TsSide["BUY"] = "0";
    TsSide["SELL"] = "1";
})(TsSide = exports.TsSide || (exports.TsSide = {}));


/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.tsHashFunc = exports.toTreeLeaf = exports.bigint_to_hex = void 0;
const poseiden_hash_dp_1 = __webpack_require__(34);
function bigint_to_hex(x) {
    return '0x' + x.toString(16);
}
exports.bigint_to_hex = bigint_to_hex;
function toTreeLeaf(inputs) {
    return bigint_to_hex((0, poseiden_hash_dp_1.dpPoseidonHash)(inputs));
}
exports.toTreeLeaf = toTreeLeaf;
function poseidonHash(val) {
    if (val instanceof Array) {
        const inputs = val.map((v) => BigInt(v));
        return bigint_to_hex((0, poseiden_hash_dp_1.dpPoseidonHash)(inputs));
    }
    return bigint_to_hex((0, poseiden_hash_dp_1.dpPoseidonHash)([BigInt(val.toString())]));
}
exports.tsHashFunc = poseidonHash;


/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dpPoseidonHash = void 0;
const poseidon_1 = __webpack_require__(35);
class dpPoseidonCache {
    static cache = new Map();
    static getCache(x) {
        if (x instanceof Array) {
            const key = x.join();
            return dpPoseidonCache.getCache(key);
        }
        return dpPoseidonCache
            .cache
            .get(x);
    }
    static setCache(x, v) {
        if (x instanceof Array) {
            const key = x.join();
            dpPoseidonCache.setCache(key, v);
            return;
        }
        dpPoseidonCache
            .cache
            .set(x, v);
    }
}
function dpPoseidonHash(inputs, isDpEnabled = true) {
    if (isDpEnabled) {
        const cache = dpPoseidonCache.getCache(inputs);
        if (cache) {
            return cache;
        }
    }
    const res = (0, poseidon_1.poseidon)(inputs);
    if (isDpEnabled) {
        dpPoseidonCache.setCache(inputs, res);
    }
    return res;
}
exports.dpPoseidonHash = dpPoseidonHash;


/***/ }),
/* 35 */
/***/ ((module) => {

module.exports = require("@big-whale-labs/poseidon");;

/***/ }),
/* 36 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Role = void 0;
var Role;
(function (Role) {
    Role["ADMIN"] = "ADMIN";
    Role["MEMBER"] = "MEMBER";
    Role["OPERATOR"] = "OPERATOR";
})(Role = exports.Role || (exports.Role = {}));


/***/ }),
/* 37 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccountLeafNode = void 0;
const typeorm_1 = __webpack_require__(24);
const ts_helper_1 = __webpack_require__(33);
const accountMerkleTreeNode_entity_1 = __webpack_require__(38);
let AccountLeafNode = class AccountLeafNode {
    leafId;
    tsAddr;
    nonce;
    tokenRoot;
    accountMerkleTreeNode;
    encode() {
        return [
            BigInt(this.tsAddr), BigInt(this.nonce), BigInt(this.tokenRoot)
        ];
    }
    encodeHash() {
        return (0, ts_helper_1.toTreeLeaf)(this.encode());
    }
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'decimal',
        name: 'leafId',
        primary: true,
        precision: 86,
        scale: 0
    }),
    __metadata("design:type", String)
], AccountLeafNode.prototype, "leafId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'tsAddr',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], AccountLeafNode.prototype, "tsAddr", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'nonce',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n
    }),
    __metadata("design:type", String)
], AccountLeafNode.prototype, "nonce", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'tokenRoot',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n
    }),
    __metadata("design:type", String)
], AccountLeafNode.prototype, "tokenRoot", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, (accountMerkleTreeNode) => accountMerkleTreeNode.accountLeafNode, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({
        name: 'leafId',
        referencedColumnName: 'leafId'
    }),
    __metadata("design:type", typeof (_a = typeof accountMerkleTreeNode_entity_1.AccountMerkleTreeNode !== "undefined" && accountMerkleTreeNode_entity_1.AccountMerkleTreeNode) === "function" ? _a : Object)
], AccountLeafNode.prototype, "accountMerkleTreeNode", void 0);
AccountLeafNode = __decorate([
    (0, typeorm_1.Entity)('AccountLeafNode', { schema: 'public' })
], AccountLeafNode);
exports.AccountLeafNode = AccountLeafNode;


/***/ }),
/* 38 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccountMerkleTreeNode = void 0;
const typeorm_1 = __webpack_require__(24);
const accountLeafNode_entity_1 = __webpack_require__(37);
let AccountMerkleTreeNode = class AccountMerkleTreeNode {
    id;
    hash;
    leafId;
    accountLeafNode;
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'decimal',
        name: 'id',
        precision: 86,
        scale: 0,
        primary: true,
    }),
    __metadata("design:type", String)
], AccountMerkleTreeNode.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'hash',
        precision: 86,
        scale: 0,
        nullable: false,
    }),
    __metadata("design:type", String)
], AccountMerkleTreeNode.prototype, "hash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'leafId',
        precision: 86,
        scale: 0,
        nullable: true,
    }),
    __metadata("design:type", Object)
], AccountMerkleTreeNode.prototype, "leafId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => accountLeafNode_entity_1.AccountLeafNode, (accountLeafNode) => accountLeafNode.accountMerkleTreeNode),
    __metadata("design:type", typeof (_a = typeof accountLeafNode_entity_1.AccountLeafNode !== "undefined" && accountLeafNode_entity_1.AccountLeafNode) === "function" ? _a : Object)
], AccountMerkleTreeNode.prototype, "accountLeafNode", void 0);
AccountMerkleTreeNode = __decorate([
    (0, typeorm_1.Entity)('AccountMerkleTreeNode', { schema: 'public' })
], AccountMerkleTreeNode);
exports.AccountMerkleTreeNode = AccountMerkleTreeNode;


/***/ }),
/* 39 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ObsMerkleTreeService = void 0;
const common_1 = __webpack_require__(7);
const tsAccountTree_service_1 = __webpack_require__(40);
const tsTokenTree_service_1 = __webpack_require__(50);
let ObsMerkleTreeService = class ObsMerkleTreeService {
    obsTokenTreeService;
    obsAccountTreeService;
    constructor(obsTokenTreeService, obsAccountTreeService) {
        this.obsTokenTreeService = obsTokenTreeService;
        this.obsAccountTreeService = obsAccountTreeService;
    }
    async updateStateTree(accountId, tokenId, lockedAmt, availableAmt) {
        await this.obsTokenTreeService.updateLeaf(tokenId, {
            leafId: tokenId.toString(),
            accountId: accountId.toString(),
            lockedAmt: lockedAmt.toString(),
            availableAmt: availableAmt.toString()
        });
        const [tokenRoot, accountLeaf] = await Promise.all([
            this.obsTokenTreeService.getRoot(accountId.toString()),
            this.obsAccountTreeService.getLeaf(accountId)
        ]);
        await this.obsAccountTreeService.updateLeaf(accountId, {
            leafId: accountId.toString(),
            tokenRoot: tokenRoot.hash.toString(),
            nonce: accountLeaf.nonce.toString(),
            tsAddr: accountLeaf.tsAddr.toString()
        });
    }
};
ObsMerkleTreeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof tsTokenTree_service_1.TsTokenTreeService !== "undefined" && tsTokenTree_service_1.TsTokenTreeService) === "function" ? _a : Object, typeof (_b = typeof tsAccountTree_service_1.TsAccountTreeService !== "undefined" && tsAccountTree_service_1.TsAccountTreeService) === "function" ? _b : Object])
], ObsMerkleTreeService);
exports.ObsMerkleTreeService = ObsMerkleTreeService;


/***/ }),
/* 40 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TsAccountTreeService_1;
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsAccountTreeService = void 0;
const common_1 = __webpack_require__(7);
const typeorm_1 = __webpack_require__(21);
const typeorm_2 = __webpack_require__(24);
const accountMerkleTreeNode_entity_1 = __webpack_require__(38);
const accountLeafNode_entity_1 = __webpack_require__(37);
const typeorm_3 = __webpack_require__(24);
const ts_helper_1 = __webpack_require__(33);
const tsMerkleTree_1 = __webpack_require__(41);
const config_1 = __webpack_require__(11);
const mkAccount_helper_1 = __webpack_require__(42);
const tsTokenTree_service_1 = __webpack_require__(50);
let TsAccountTreeService = TsAccountTreeService_1 = class TsAccountTreeService extends tsMerkleTree_1.TsMerkleTree {
    accountLeafNodeRepository;
    accountMerkleTreeRepository;
    connection;
    tokenTreeService;
    configService;
    logger = new common_1.Logger(TsAccountTreeService_1.name);
    TOKENS_TREE_HEIGHT;
    constructor(accountLeafNodeRepository, accountMerkleTreeRepository, connection, tokenTreeService, configService) {
        console.time('create Account Tree');
        super(configService.getOrThrow('ACCOUNTS_TREE_HEIGHT'), ts_helper_1.tsHashFunc);
        this.accountLeafNodeRepository = accountLeafNodeRepository;
        this.accountMerkleTreeRepository = accountMerkleTreeRepository;
        this.connection = connection;
        this.tokenTreeService = tokenTreeService;
        this.configService = configService;
        console.timeEnd('create Account Tree');
        this.TOKENS_TREE_HEIGHT = configService.getOrThrow('TOKENS_TREE_HEIGHT');
        this.setLevelDefaultHash();
    }
    async getCurrentLeafIdCount() {
        const leafIdCount = await this.accountLeafNodeRepository.count();
        return leafIdCount;
    }
    getDefaultTokenTreeRoot() {
        return BigInt(this.tokenTreeService.getDefaultRoot()).toString();
    }
    getDefaultRoot() {
        return this.getDefaultHashByLevel(1);
    }
    getLeafDefaultVavlue() {
        return (0, mkAccount_helper_1.getDefaultAccountLeaf)(this.getDefaultTokenTreeRoot());
    }
    async updateLeaf(leafId, value) {
        console.time('updateLeaf for account tree');
        await this.connection.transaction(async (manager) => {
            await this._updateLeaf(manager, leafId, value);
        });
        console.timeEnd('updateLeaf for account tree');
    }
    async _updateLeaf(manager, leafId, value) {
        const prf = this.getProofIds(leafId);
        const id = this.getLeafIdInTree(leafId);
        const originValue = await this.getLeaf(leafId);
        const newValue = {
            tsAddr: value.tsAddr || originValue.tsAddr,
            nonce: value.nonce || originValue.nonce,
            tokenRoot: value.tokenRoot || originValue.tokenRoot,
        };
        await manager.upsert(accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, {
            id: id.toString(),
            leafId: leafId,
            hash: BigInt((0, ts_helper_1.toTreeLeaf)([
                BigInt(newValue.tsAddr),
                BigInt(newValue.nonce),
                BigInt(newValue.tokenRoot)
            ])).toString()
        }, ['id']);
        await manager.upsert(accountLeafNode_entity_1.AccountLeafNode, {
            tsAddr: (newValue.tsAddr),
            nonce: (newValue.nonce),
            tokenRoot: (newValue.tokenRoot),
            leafId: leafId.toString(),
        }, ['leafId']);
        for (let i = id, j = 0; i > 1n; i = i >> 1n) {
            const [iValue, jValue] = await Promise.all([
                this.accountMerkleTreeRepository.findOneBy({ id: i.toString() }),
                this.accountMerkleTreeRepository.findOneBy({ id: prf[j].toString() })
            ]);
            const jLevel = Math.floor(Math.log2(Number(prf[j])));
            const iLevel = Math.floor(Math.log2(Number(i)));
            const jHashValue = (jValue == null) ? this.getDefaultHashByLevel(jLevel) : jValue.hash.toString();
            const iHashValue = (iValue == null) ? this.getDefaultHashByLevel(iLevel) : iValue.hash.toString();
            const r = (id % 2n == 0n) ? [jHashValue, iHashValue] : [iHashValue, jHashValue];
            const hashDecString = BigInt(this.hashFunc(r)).toString();
            const jobs = [];
            if (iValue == null) {
                jobs.push(manager.upsert(accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, {
                    id: i.toString(),
                    hash: (iHashValue)
                }, ['id']));
            }
            if (jValue == null && j < prf.length) {
                jobs.push(manager.upsert(accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, {
                    id: prf[j].toString(),
                    hash: (jHashValue)
                }, ['id']));
            }
            const updateRoot = i >> 1n;
            if (updateRoot >= 1n) {
                jobs.push(manager.upsert(accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, {
                    id: updateRoot.toString(),
                    hash: hashDecString,
                }, ['id']));
            }
            await Promise.all(jobs);
            j++;
        }
    }
    async updateTokenLeaf(leafId, tokenDto) {
        return await this.connection.transaction(async (manager) => {
            const tokenRoot = await this.tokenTreeService._updateLeaf(manager, tokenDto.leafId, tokenDto);
            await this._updateLeaf(manager, (tokenDto.accountId), {
                leafId: leafId,
                tokenRoot: tokenRoot.hash,
            });
        });
    }
    async getLeaf(leaf_id) {
        const result = await this.accountLeafNodeRepository.findOneBy({ leafId: leaf_id.toString() });
        if (result == null) {
            const emptyAccount = this.accountLeafNodeRepository.create();
            emptyAccount.tsAddr = '0';
            emptyAccount.nonce = '0';
            emptyAccount.tokenRoot = BigInt(this.getDefaultTokenTreeRoot()).toString();
            emptyAccount.leafId = leaf_id.toString();
            return emptyAccount;
        }
        return result;
    }
    async getRoot() {
        const result = await this.accountMerkleTreeRepository.findOneBy({
            id: 1n.toString(),
        });
        if (result == null) {
            const hashDecString = BigInt(this.getDefaultHashByLevel(1)).toString();
            await this.accountMerkleTreeRepository.insert({
                id: 1n.toString(),
                hash: hashDecString
            });
            return {
                id: 1n.toString(),
                hash: hashDecString
            };
        }
        return result;
    }
    async addLeaf(value) {
        const leafId = (value.leafId);
        if (!value.tsAddr) {
            throw new Error('tsAddr should not be null');
        }
        const id = this.getLeafIdInTree(leafId);
        const level = Math.floor(Math.log2(Number(id)));
        const hashDecString = BigInt(this.getDefaultHashByLevel(level)).toString();
        await this.connection.transaction(async (manager) => {
            await manager.upsert(accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, {
                leafId: leafId,
                id: id.toString(),
                hash: hashDecString,
            }, ['id']);
            await manager.upsert(accountLeafNode_entity_1.AccountLeafNode, {
                leafId: leafId.toString(),
                tsAddr: value.tsAddr,
                nonce: '0',
                tokenRoot: (this.getDefaultTokenTreeRoot())
            }, ['leafId']);
        });
    }
    async getMerklerProof(leafId) {
        console.log('getMerklerProof', leafId);
        const ids = this.getProofIds(leafId);
        const r = await this.accountMerkleTreeRepository.find({
            where: {
                id: (0, typeorm_2.In)(ids.map(id => id.toString()))
            },
            order: {
                id: 'ASC'
            }
        });
        return r.map(item => BigInt(item.hash));
    }
};
TsAccountTreeService = TsAccountTreeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(accountLeafNode_entity_1.AccountLeafNode)),
    __param(1, (0, typeorm_1.InjectRepository)(accountMerkleTreeNode_entity_1.AccountMerkleTreeNode)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_3.Repository !== "undefined" && typeorm_3.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_3.Repository !== "undefined" && typeorm_3.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_3.Connection !== "undefined" && typeorm_3.Connection) === "function" ? _c : Object, typeof (_d = typeof tsTokenTree_service_1.TsTokenTreeService !== "undefined" && tsTokenTree_service_1.TsTokenTreeService) === "function" ? _d : Object, typeof (_e = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _e : Object])
], TsAccountTreeService);
exports.TsAccountTreeService = TsAccountTreeService;


/***/ }),
/* 41 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsMerkleTree = void 0;
class TsMerkleTree {
    treeHeigt;
    lastLevel;
    levelsDefaultHash;
    hashFunc;
    constructor(treeHeight, hashFunc) {
        console.log({
            treeHeight,
        });
        this.treeHeigt = Number(treeHeight);
        this.hashFunc = hashFunc;
        this.lastLevel = Number(this.treeHeigt);
    }
    getProofIds(_leaf_id) {
        const leaf_id = BigInt(_leaf_id);
        const prf = [];
        const height = this.treeHeigt;
        const leafStart = leaf_id + (1n << BigInt(height));
        for (let i = leafStart; i > 1n; i = i >> 1n) {
            if (i % 2n == 0n) {
                prf.push(i + 1n);
            }
            else {
                prf.push(i - 1n);
            }
        }
        return prf;
    }
    setLevelDefaultHash() {
        this.levelsDefaultHash = new Map();
        this.levelsDefaultHash.set(this.lastLevel, BigInt(this.getLeafDefaultVavlue()).toString());
        for (let level = this.lastLevel - 1; level >= 0; level--) {
            const prevLevelHash = this.levelsDefaultHash.get(level + 1);
            if (prevLevelHash != undefined) {
                this.levelsDefaultHash.set(level, BigInt(this.hashFunc([prevLevelHash, prevLevelHash])).toString());
            }
        }
    }
    getLeafIdInTree(_leafId) {
        return BigInt(_leafId) + (1n << BigInt(this.treeHeigt));
    }
    getLastLevel() {
        return this.lastLevel;
    }
    getDefaultHashByLevel(level) {
        const result = this.levelsDefaultHash.get(level);
        if (!result) {
            console.log({
                level,
                heigt: this.treeHeigt,
            });
            throw new Error('getDefaultHashByLevel null');
        }
        return BigInt(result).toString();
    }
}
exports.TsMerkleTree = TsMerkleTree;


/***/ }),
/* 42 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getDefaultObsOrderLeaf = exports.getDefaultTokenLeaf = exports.getDefaultAccountLeaf = exports.getDefaultObsOrderLeafMessage = exports.getDefaultTokenLeafMessage = exports.getDefaultAccountLeafMessage = void 0;
const ts_helper_1 = __webpack_require__(43);
function getDefaultAccountLeafMessage(tokenRoot) {
    return [0n, 0n, BigInt(tokenRoot)];
}
exports.getDefaultAccountLeafMessage = getDefaultAccountLeafMessage;
function getDefaultTokenLeafMessage() {
    return [0n, 0n];
}
exports.getDefaultTokenLeafMessage = getDefaultTokenLeafMessage;
function getDefaultObsOrderLeafMessage() {
    return [
        0n, 0n, 0n, 0n, 0n,
        0n, 0n, 0n, 0n, 0n,
        0n, 0n, 0n,
    ];
}
exports.getDefaultObsOrderLeafMessage = getDefaultObsOrderLeafMessage;
function getDefaultAccountLeaf(tokenRoot) {
    return (0, ts_helper_1.toTreeLeaf)(getDefaultAccountLeafMessage(tokenRoot));
}
exports.getDefaultAccountLeaf = getDefaultAccountLeaf;
function getDefaultTokenLeaf() {
    return (0, ts_helper_1.toTreeLeaf)(getDefaultTokenLeafMessage());
}
exports.getDefaultTokenLeaf = getDefaultTokenLeaf;
function getDefaultObsOrderLeaf() {
    return (0, ts_helper_1.toTreeLeaf)(getDefaultObsOrderLeafMessage());
}
exports.getDefaultObsOrderLeaf = getDefaultObsOrderLeaf;


/***/ }),
/* 43 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toTreeLeaf = exports.txToCircuitInput = exports.tsHashFunc = void 0;
const helper_1 = __webpack_require__(44);
const poseidon_hash_dp_1 = __webpack_require__(49);
const exclude = {};
exports.tsHashFunc = poseidonHash;
function txToCircuitInput(obj, initData = {}) {
    const result = initData;
    Object.keys(obj).forEach((key) => {
        if (exclude[key]) {
            return;
        }
        const item = obj[key];
        if (!result[key]) {
            result[key] = [];
        }
        result[key].push((0, helper_1.recursiveToString)(item));
    });
    return result;
}
exports.txToCircuitInput = txToCircuitInput;
function toTreeLeaf(inputs) {
    return (0, helper_1.bigint_to_hex)((0, poseidon_hash_dp_1.dpPoseidonHash)(inputs));
}
exports.toTreeLeaf = toTreeLeaf;
function poseidonHash(val) {
    if (val instanceof Array) {
        const inputs = val.map((v) => BigInt(v));
        return (0, helper_1.bigint_to_hex)((0, poseidon_hash_dp_1.dpPoseidonHash)(inputs));
    }
    return (0, helper_1.bigint_to_hex)((0, poseidon_hash_dp_1.dpPoseidonHash)([BigInt(val.toString())]));
}


/***/ }),
/* 44 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.bufferToBigInt = exports.tsPubKeyTypeConverter = exports.eddsaSigTypeConverter = exports.uint8ArrayToHexString = exports.bigintToHexString = exports.bigintToUint8Array = exports.uint8ArrayToBigint = exports.recursiveToString = exports.hexToBuffer = exports.uint8ArrayToBuffer = exports.objectToHexString = exports.bigint_to_hex = exports.bigint_to_tuple = exports.hexToUint8Array = exports.bufferIsEmpty = exports.bufferToDec = exports.privKeyStringToBigInt = exports.Uint8Array_to_bigint = exports.bigint_to_Uint8Array = exports.stringToUint8Array = exports.genEthereumPrivateKey = exports.privateKeyToAddress = exports.hexToDec = void 0;
const ethers_1 = __webpack_require__(45);
const eddsa_1 = __webpack_require__(46);
const NumberOfBits = 256;
const hexToDec = (hex) => {
    return ethers_1.BigNumber.from(hex).toString();
};
exports.hexToDec = hexToDec;
const privateKeyToAddress = (_privateKey) => {
    const address = ethers_1.utils.computeAddress(_privateKey);
    return address;
};
exports.privateKeyToAddress = privateKeyToAddress;
function genEthereumPrivateKey() {
    const privateKey = uint8ArrayToHexString(ethers_1.utils.randomBytes(32));
    return privateKey;
}
exports.genEthereumPrivateKey = genEthereumPrivateKey;
function stringToUint8Array(str) {
    const ret = new Uint8Array(str.length);
    for (let idx = 0; idx < str.length; idx++) {
        ret[idx] = str.charCodeAt(idx);
    }
    return ret;
}
exports.stringToUint8Array = stringToUint8Array;
function bigint_to_Uint8Array(x) {
    const ret = new Uint8Array(32);
    for (let idx = 31; idx >= 0; idx--) {
        ret[idx] = Number(x % 256n);
        x = x / 256n;
    }
    return ret;
}
exports.bigint_to_Uint8Array = bigint_to_Uint8Array;
function Uint8Array_to_bigint(x) {
    let ret = 0n;
    for (let idx = 0; idx < x.length; idx++) {
        ret = ret * 256n;
        ret = ret + BigInt(x[idx]);
    }
    return ret;
}
exports.Uint8Array_to_bigint = Uint8Array_to_bigint;
function privKeyStringToBigInt(privKeyHex) {
    const privKeyBytes = ethers_1.utils.arrayify(privKeyHex);
    const privKeyNum = Uint8Array_to_bigint(privKeyBytes);
    return privKeyNum;
}
exports.privKeyStringToBigInt = privKeyStringToBigInt;
function bufferToDec(buffer) {
    const hex = bufferIsEmpty(buffer) ? '0x0' : '0x' + buffer.toString('hex');
    return ethers_1.BigNumber.from(hex).toString();
}
exports.bufferToDec = bufferToDec;
function bufferIsEmpty(buffer) {
    return buffer.length === 0;
}
exports.bufferIsEmpty = bufferIsEmpty;
function hexToUint8Array(hex) {
    return ethers_1.utils.arrayify(hex);
}
exports.hexToUint8Array = hexToUint8Array;
function bigint_to_tuple(x) {
    const mod = 2n ** 64n;
    const ret = [0n, 0n, 0n, 0n];
    let x_temp = x;
    for (let idx = 0; idx < ret.length; idx++) {
        ret[idx] = x_temp % mod;
        x_temp = x_temp / mod;
    }
    return ret;
}
exports.bigint_to_tuple = bigint_to_tuple;
function bigint_to_hex(x) {
    return '0x' + x.toString(16);
}
exports.bigint_to_hex = bigint_to_hex;
function objectToHexString(obj) {
    const hex = ethers_1.utils.hexlify(ethers_1.utils.toUtf8Bytes(JSON.stringify(obj)));
    return hex;
}
exports.objectToHexString = objectToHexString;
function uint8ArrayToBuffer(acc1PrivateKey) {
    return Buffer.from(acc1PrivateKey);
}
exports.uint8ArrayToBuffer = uint8ArrayToBuffer;
function hexToBuffer(L2MintAccountPriv) {
    L2MintAccountPriv = L2MintAccountPriv.replace('0x', '');
    return Buffer.from(L2MintAccountPriv, 'hex');
}
exports.hexToBuffer = hexToBuffer;
function recursiveToString(data) {
    if (data instanceof Array) {
        return data.map(t => recursiveToString(t));
    }
    if (typeof data === 'bigint') {
        return data.toString(10);
    }
    if (typeof data === 'string') {
        if (/[0-9A-Fa-f]{6}/g.test(data) || /^0x/g.test(data)) {
            return (0, exports.hexToDec)(data);
        }
        return data;
    }
    return data.toString();
}
exports.recursiveToString = recursiveToString;
function uint8ArrayToBigint(uint8Array, numberOfBits = NumberOfBits) {
    return BigInt('0x' + Buffer.from(uint8Array).toString('hex'));
}
exports.uint8ArrayToBigint = uint8ArrayToBigint;
function bigintToUint8Array(value, numberOfBits = NumberOfBits) {
    if (numberOfBits % 8)
        throw new Error('Only 8-bit increments are supported when (de)serializing a bigint.');
    const valueAsHexString = bigintToHexString(value, numberOfBits);
    return hexStringToUint8Array(valueAsHexString);
}
exports.bigintToUint8Array = bigintToUint8Array;
function bigintToHexString(value, numberOfBits = NumberOfBits) {
    if (numberOfBits % 8)
        throw new Error('Only 8-bit increments are supported when (de)serializing a bigint.');
    const valueToSerialize = twosComplement(value, numberOfBits);
    return unsignedBigintToHexString(valueToSerialize, numberOfBits);
}
exports.bigintToHexString = bigintToHexString;
function validateAndNormalizeHexString(hex) {
    const match = new RegExp('^(?:0x)?([a-fA-F0-9]*)$').exec(hex);
    if (match === null)
        throw new Error(`Expected a hex string encoded byte array with an optional '0x' prefix but received ${hex}`);
    if (match.length % 2)
        throw new Error('Hex string encoded byte array must be an even number of charcaters long.');
    return `0x${match[1]}`;
}
function uint8ArrayToHexString(array) {
    const hexStringFromByte = (byte) => ('00' + byte.toString(16)).slice(-2);
    const appendByteToString = (value, byte) => value + hexStringFromByte(byte);
    return array.reduce(appendByteToString, '');
}
exports.uint8ArrayToHexString = uint8ArrayToHexString;
function hexStringToUint8Array(hex) {
    const match = new RegExp('^(?:0x)?([a-fA-F0-9]*)$').exec(hex);
    if (match === null)
        throw new Error(`Expected a hex string encoded byte array with an optional '0x' prefix but received ${hex}`);
    if (match.length % 2)
        throw new Error('Hex string encoded byte array must be an even number of charcaters long.');
    const normalized = match[1];
    const byteLength = normalized.length / 2;
    const bytes = new Uint8Array(byteLength);
    for (let i = 0; i < byteLength; ++i) {
        bytes[i] = (Number.parseInt(`${normalized[i * 2]}${normalized[i * 2 + 1]}`, 16));
    }
    return bytes;
}
function unsignedBigintToHexString(value, bits) {
    const byteSize = bits / 8;
    const hexStringLength = byteSize * 2;
    return ('0'.repeat(hexStringLength) + value.toString(16)).slice(-hexStringLength);
}
function twosComplement(value, numberOfBits = NumberOfBits) {
    const mask = 2n ** (BigInt(numberOfBits) - 1n) - 1n;
    return (value & mask) - (value & ~mask);
}
const eddsaSigTypeConverter = (sig) => {
    return {
        R8: [eddsa_1.EddsaSigner.toObject(sig.R8[0]).toString(), eddsa_1.EddsaSigner.toObject(sig.R8[1]).toString()],
        S: sig.S.toString(),
    };
};
exports.eddsaSigTypeConverter = eddsaSigTypeConverter;
const tsPubKeyTypeConverter = (tsPubKey) => {
    return [eddsa_1.EddsaSigner.toE(tsPubKey[0]), eddsa_1.EddsaSigner.toE(tsPubKey[1])];
};
exports.tsPubKeyTypeConverter = tsPubKeyTypeConverter;
exports.default = {
    hexToDec: exports.hexToDec,
    genEthereumPrivateKey,
    privateKeyToAddress: exports.privateKeyToAddress,
    uint8ArrayToHexString,
    stringToUint8Array,
    bigint_to_Uint8Array,
    Uint8Array_to_bigint,
    privKeyStringToBigInt,
    bufferToDec,
    bufferIsEmpty,
    hexToUint8Array,
    bigint_to_tuple,
    bigint_to_hex,
    objectToHexString,
    uint8ArrayToBuffer,
    hexToBuffer,
    uint8ArrayToBigint,
    recursiveToString,
    eddsaSigTypeConverter: exports.eddsaSigTypeConverter,
};
function bufferToBigInt(buffer) {
    return BigInt('0x' + buffer.toString('hex'));
}
exports.bufferToBigInt = bufferToBigInt;


/***/ }),
/* 45 */
/***/ ((module) => {

module.exports = require("ethers");;

/***/ }),
/* 46 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EddsaSigner = exports.asyncEdDSA = exports.EdDSA = void 0;
const circomlibjs = __webpack_require__(47);
const ff = __webpack_require__(48);
exports.asyncEdDSA = circomlibjs.buildEddsa();
(async function () {
    exports.EdDSA = await exports.asyncEdDSA;
})();
const bigInt2Buffer = (i) => {
    let hexStr = i.toString(16);
    while (hexStr.length < 64) {
        hexStr = '0' + hexStr;
    }
    return Buffer.from(hexStr, 'hex');
};
class EddsaSigner {
    privateKey;
    publicKey;
    constructor(privateKey) {
        this.privateKey = privateKey;
        this.publicKey = (privateKey.length === 0) ? [
            new Uint8Array(), new Uint8Array()
        ] : exports.EdDSA.prv2pub(privateKey);
    }
    static toObject(i) {
        return exports.EdDSA.babyJub.F.toObject(i);
    }
    static toE(i) {
        return exports.EdDSA.babyJub.F.e(i);
    }
    signPoseidon(msgHash) {
        const msgField = exports.EdDSA.babyJub.F.e(msgHash);
        const signature = exports.EdDSA.signPoseidon(this.privateKey, msgField);
        return signature;
    }
    static verify(msgHash, signature, publicKey) {
        return exports.EdDSA.verifyPoseidon(Uint8Array, signature, publicKey);
    }
}
exports.EddsaSigner = EddsaSigner;


/***/ }),
/* 47 */
/***/ ((module) => {

module.exports = require("circomlibjs");;

/***/ }),
/* 48 */
/***/ ((module) => {

module.exports = require("ffjavascript");;

/***/ }),
/* 49 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dpPoseidonHash = void 0;
const poseidon_1 = __webpack_require__(35);
class dpPoseidonCache {
    static cache = new Map();
    static getCache(x) {
        if (x instanceof Array) {
            const key = x.join();
            return dpPoseidonCache.getCache(key);
        }
        return dpPoseidonCache
            .cache
            .get(x);
    }
    static setCache(x, v) {
        if (x instanceof Array) {
            const key = x.join();
            dpPoseidonCache.setCache(key, v);
            return;
        }
        dpPoseidonCache
            .cache
            .set(x, v);
    }
}
function dpPoseidonHash(inputs, isDpEnabled = true) {
    if (isDpEnabled) {
        const cache = dpPoseidonCache.getCache(inputs);
        if (cache) {
            return cache;
        }
    }
    const res = (0, poseidon_1.poseidon)(inputs);
    if (isDpEnabled) {
        dpPoseidonCache.setCache(inputs, res);
    }
    return res;
}
exports.dpPoseidonHash = dpPoseidonHash;


/***/ }),
/* 50 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TsTokenTreeService_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsTokenTreeService = void 0;
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
const typeorm_1 = __webpack_require__(21);
const typeorm_2 = __webpack_require__(24);
const ts_helper_1 = __webpack_require__(33);
const tsMerkleTree_1 = __webpack_require__(41);
const mkAccount_helper_1 = __webpack_require__(42);
const tokenLeafNode_entity_1 = __webpack_require__(51);
const tokenMerkleTreeNode_entity_1 = __webpack_require__(52);
let TsTokenTreeService = TsTokenTreeService_1 = class TsTokenTreeService extends tsMerkleTree_1.TsMerkleTree {
    tokenLeafRepository;
    tokenMerkleTreeRepository;
    connection;
    configService;
    logger = new common_1.Logger(TsTokenTreeService_1.name);
    constructor(tokenLeafRepository, tokenMerkleTreeRepository, connection, configService) {
        console.time('init token tree');
        super(configService.get('TOKENS_TREE_HEIGHT', 2), ts_helper_1.tsHashFunc);
        this.tokenLeafRepository = tokenLeafRepository;
        this.tokenMerkleTreeRepository = tokenMerkleTreeRepository;
        this.connection = connection;
        this.configService = configService;
        console.timeEnd('init token tree');
        this.setLevelDefaultHash();
    }
    async getCurrentLeafIdCount(accountId) {
        const leafIdCount = await this.tokenMerkleTreeRepository.count({
            where: {
                accountId: accountId.toString(),
                leafId: (0, typeorm_2.Not)((0, typeorm_2.IsNull)())
            }
        });
        return leafIdCount;
    }
    getDefaultRoot() {
        return this.getDefaultHashByLevel(1);
    }
    getLeafDefaultVavlue() {
        return (0, mkAccount_helper_1.getDefaultTokenLeaf)();
    }
    async updateLeaf(leafId, value) {
        console.time('updateLeaf for token tree');
        await this.connection.transaction(async (manager) => {
            await this._updateLeaf(manager, leafId, value);
        });
        console.timeEnd('updateLeaf for token tree');
    }
    async _updateLeaf(manager, tokenLeafId, value) {
        const prf = this.getProofIds(tokenLeafId);
        const id = this.getLeafIdInTree(tokenLeafId);
        const leafHashDecString = BigInt((0, ts_helper_1.toTreeLeaf)([BigInt(value.leafId), BigInt(value.lockedAmt), BigInt(value.availableAmt)])).toString();
        const accountId = value.accountId;
        await manager.upsert(tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode, {
            accountId: accountId,
            id: id.toString(),
            leafId: tokenLeafId.toString(),
            hash: leafHashDecString
        }, ['id', 'accountId']);
        await manager.upsert(tokenLeafNode_entity_1.TokenLeafNode, {
            leafId: tokenLeafId.toString(),
            accountId: accountId,
            lockedAmt: value.lockedAmt,
            availableAmt: value.availableAmt
        }, ['leafId', 'accountId']);
        for (let i = id, j = 0; i > 1n; i = i >> 1n) {
            const [iValue, jValue] = await Promise.all([
                this.tokenMerkleTreeRepository.findOneBy({ id: i.toString(), accountId: accountId }),
                this.tokenMerkleTreeRepository.findOneBy({ id: prf[j].toString(), accountId: accountId })
            ]);
            const jLevel = Math.floor(Math.log2(Number(prf[j])));
            const iLevel = Math.floor(Math.log2(Number(i)));
            const jHashValue = (jValue == null) ? this.getDefaultHashByLevel(jLevel) : jValue.hash.toString();
            const iHashValue = (iValue == null) ? this.getDefaultHashByLevel(iLevel) : iValue.hash.toString();
            const r = (id % 2n == 0n) ? [jHashValue, iHashValue] : [iHashValue, jHashValue];
            const hashDecString = BigInt(this.hashFunc(r)).toString();
            console.log({
                id, value,
                tokenLeafId,
                i,
                jLevel,
                iLevel,
                jHashValue,
                iHashValue,
                height: this.treeHeigt,
                hashDecString
            });
            const jobs = [];
            if (iValue == null) {
                jobs.push(manager.upsert(tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode, {
                    id: i.toString(), accountId: accountId, hash: (iHashValue)
                }, ['id', 'accountId']));
            }
            if (jValue == null && j < prf.length) {
                jobs.push(manager.upsert(tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode, {
                    id: prf[j].toString(), accountId: accountId, hash: (jHashValue)
                }, ['id', 'accountId']));
            }
            const updateRoot = i >> 1n;
            if (updateRoot >= 1n) {
                jobs.push(this.tokenMerkleTreeRepository.upsert([{
                        id: updateRoot.toString(), accountId: accountId, hash: hashDecString
                    }], ['id', 'accountId']));
            }
            await Promise.all(jobs);
            j++;
        }
        const root = await this.getRoot(accountId);
        return root;
    }
    async getLeaf(leaf_id, accountId) {
        const result = await this.tokenLeafRepository.findOneBy({ leafId: leaf_id.toString(),
            accountId: accountId });
        if (result == null) {
            const id = this.getLeafIdInTree(leaf_id);
            const level = Math.floor(Math.log2(Number(id)));
            const hashDecString = BigInt(this.getDefaultHashByLevel(level)).toString();
            await this.connection.transaction(async (manager) => {
                await manager.upsert(tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode, {
                    accountId: accountId,
                    id: id.toString(),
                    leafId: leaf_id.toString(),
                    hash: hashDecString,
                }, [
                    'id', 'accountId'
                ]);
                await manager.upsert(tokenLeafNode_entity_1.TokenLeafNode, {
                    leafId: leaf_id.toString(),
                    accountId: accountId,
                    lockedAmt: '0',
                    availableAmt: '0',
                }, ['leafId', 'accountId']);
            });
            return await this.tokenLeafRepository.findOneByOrFail({ leafId: leaf_id.toString(), accountId: accountId });
        }
        return result;
    }
    async getRoot(accountId) {
        const result = await this.tokenMerkleTreeRepository.findOneBy({ accountId: accountId, id: 1n.toString() });
        if (result == null) {
            const hashDecString = BigInt(this.getDefaultHashByLevel(1)).toString();
            await this.tokenMerkleTreeRepository.insert({
                accountId: accountId,
                id: 1n.toString(),
                hash: hashDecString
            });
            return {
                accountId: accountId,
                id: 1,
                leafId: null,
                hash: hashDecString
            };
        }
        const resultHash = result.hash ? BigInt(result.hash).toString() : '';
        return {
            accountId: accountId,
            id: 1,
            leafId: null,
            hash: resultHash,
        };
    }
    async getMerklerProof(leafId) {
        throw new Error('canot use getMerklerProof in TokenTree');
    }
    async getMerklerProofByAccountId(leafId, accountId) {
        const ids = this.getProofIds(leafId);
        const r = await this.tokenMerkleTreeRepository.find({
            where: {
                accountId: accountId,
                id: (0, typeorm_2.In)(ids.map(v => v.toString()))
            },
            order: {
                id: 'ASC'
            }
        });
        return r.map(item => BigInt(item.hash));
    }
};
TsTokenTreeService = TsTokenTreeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tokenLeafNode_entity_1.TokenLeafNode)),
    __param(1, (0, typeorm_1.InjectRepository)(tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Connection !== "undefined" && typeorm_2.Connection) === "function" ? _c : Object, typeof (_d = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _d : Object])
], TsTokenTreeService);
exports.TsTokenTreeService = TsTokenTreeService;


/***/ }),
/* 51 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TokenLeafNode = void 0;
const typeorm_1 = __webpack_require__(24);
const ts_helper_1 = __webpack_require__(33);
const tokenMerkleTreeNode_entity_1 = __webpack_require__(52);
let TokenLeafNode = class TokenLeafNode {
    leafId;
    accountId;
    availableAmt;
    lockedAmt;
    tokenMerkleNode;
    encode() {
        return [
            BigInt(this.availableAmt), BigInt(this.lockedAmt)
        ];
    }
    encodeHash() {
        return (0, ts_helper_1.toTreeLeaf)(this.encode());
    }
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'decimal',
        name: 'leafId',
        precision: 86,
        scale: 0,
        primary: true,
        nullable: false,
    }),
    __metadata("design:type", String)
], TokenLeafNode.prototype, "leafId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'decimal',
        name: 'accountId',
        precision: 86,
        scale: 0,
        primary: true,
        nullable: false,
    }),
    __metadata("design:type", String)
], TokenLeafNode.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'availableAmt',
        precision: 86,
        scale: 0,
        default: 0n
    }),
    __metadata("design:type", String)
], TokenLeafNode.prototype, "availableAmt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'lockedAmt',
        precision: 86,
        scale: 0,
        default: 0n
    }),
    __metadata("design:type", String)
], TokenLeafNode.prototype, "lockedAmt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode, (tokenMerkleTreeNode) => tokenMerkleTreeNode.leaf, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)([
        { name: 'leafId', referencedColumnName: 'leafId' },
        { name: 'accountId', referencedColumnName: 'accountId' }
    ]),
    __metadata("design:type", typeof (_a = typeof tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode !== "undefined" && tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode) === "function" ? _a : Object)
], TokenLeafNode.prototype, "tokenMerkleNode", void 0);
TokenLeafNode = __decorate([
    (0, typeorm_1.Entity)('TokenLeafNode', { schema: 'public' })
], TokenLeafNode);
exports.TokenLeafNode = TokenLeafNode;


/***/ }),
/* 52 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TokenMerkleTreeNode = void 0;
const typeorm_1 = __webpack_require__(24);
const tokenLeafNode_entity_1 = __webpack_require__(51);
let TokenMerkleTreeNode = class TokenMerkleTreeNode {
    accountId;
    id;
    hash;
    leafId;
    leaf;
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'decimal',
        name: 'accountId',
        primary: true,
        precision: 86,
        scale: 0,
        nullable: false,
        unique: false,
    }),
    __metadata("design:type", String)
], TokenMerkleTreeNode.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'decimal',
        name: 'id',
        primary: true,
        precision: 86,
        scale: 0,
        nullable: false,
        unique: false,
    }),
    __metadata("design:type", String)
], TokenMerkleTreeNode.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'hash',
        precision: 86,
        scale: 0,
        nullable: false
    }),
    __metadata("design:type", String)
], TokenMerkleTreeNode.prototype, "hash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'leafId',
        precision: 86,
        scale: 0,
        nullable: true,
        unique: false,
    }),
    __metadata("design:type", Object)
], TokenMerkleTreeNode.prototype, "leafId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => tokenLeafNode_entity_1.TokenLeafNode, (tokenLeafNode) => tokenLeafNode.tokenMerkleNode),
    (0, typeorm_1.JoinColumn)([{
            name: 'leafId',
            referencedColumnName: 'leafId'
        }, {
            name: 'accountId',
            referencedColumnName: 'accountId'
        }]),
    __metadata("design:type", typeof (_a = typeof tokenLeafNode_entity_1.TokenLeafNode !== "undefined" && tokenLeafNode_entity_1.TokenLeafNode) === "function" ? _a : Object)
], TokenMerkleTreeNode.prototype, "leaf", void 0);
TokenMerkleTreeNode = __decorate([
    (0, typeorm_1.Entity)('TokenMerkleTreeNode', { schema: 'public' })
], TokenMerkleTreeNode);
exports.TokenMerkleTreeNode = TokenMerkleTreeNode;


/***/ }),
/* 53 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuctionOrderMoudle = void 0;
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
const typeorm_1 = __webpack_require__(21);
const auctionBondToken_entity_1 = __webpack_require__(54);
const obsOrder_entity_1 = __webpack_require__(25);
const obsOrderLeaf_entity_1 = __webpack_require__(56);
const matchObsOrder_entity_1 = __webpack_require__(26);
const candleStick_entity_1 = __webpack_require__(58);
const obsOrderLeafMerkleTreeNode_entity_1 = __webpack_require__(57);
const marketPairInfo_entity_1 = __webpack_require__(59);
const marketPairInfo_service_1 = __webpack_require__(60);
const availableView_entity_1 = __webpack_require__(61);
const obsOrderTree_service_1 = __webpack_require__(62);
let AuctionOrderMoudle = class AuctionOrderMoudle {
};
AuctionOrderMoudle = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, typeorm_1.TypeOrmModule.forFeature([
                obsOrder_entity_1.ObsOrderEntity,
                obsOrderLeaf_entity_1.ObsOrderLeafEntity,
                obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode,
                matchObsOrder_entity_1.MatchObsOrderEntity,
                marketPairInfo_entity_1.MarketPairInfoEntity,
                candleStick_entity_1.CandleStickEntity,
                auctionBondToken_entity_1.AuctionBondTokenEntity,
                availableView_entity_1.AvailableViewEntity
            ])],
        providers: [config_1.ConfigService, obsOrderTree_service_1.ObsOrderTreeService, marketPairInfo_service_1.MarketPairInfoService],
        exports: [marketPairInfo_service_1.MarketPairInfoService, obsOrderTree_service_1.ObsOrderTreeService, typeorm_1.TypeOrmModule]
    })
], AuctionOrderMoudle);
exports.AuctionOrderMoudle = AuctionOrderMoudle;


/***/ }),
/* 54 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuctionBondTokenEntity = exports.BondTokenStatusIndex = void 0;
const ts_types_1 = __webpack_require__(55);
const typeorm_1 = __webpack_require__(24);
var BondTokenStatusIndex;
(function (BondTokenStatusIndex) {
    BondTokenStatusIndex[BondTokenStatusIndex["isL1Deployed"] = 1] = "isL1Deployed";
    BondTokenStatusIndex[BondTokenStatusIndex["isAvailable"] = 2] = "isAvailable";
    BondTokenStatusIndex[BondTokenStatusIndex["isExcceeded"] = 4] = "isExcceeded";
})(BondTokenStatusIndex = exports.BondTokenStatusIndex || (exports.BondTokenStatusIndex = {}));
let AuctionBondTokenEntity = class AuctionBondTokenEntity {
    bondId;
    L1Addr;
    L2Addr;
    underlyingToken;
    lastSyncBlocknumberForDepositEvent;
    maturityDate;
    status;
    getStatus(statusId) {
        return this.status & statusId;
    }
    setStatus(statusId) {
        this.status |= statusId;
    }
    createdAt;
    updatedAt;
    updatedBy;
    deletedBy;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        type: 'integer',
        name: 'bondId',
    }),
    __metadata("design:type", Number)
], AuctionBondTokenEntity.prototype, "bondId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'L1Addr',
        nullable: true,
        length: 256,
    }),
    __metadata("design:type", String)
], AuctionBondTokenEntity.prototype, "L1Addr", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'L2Addr',
        precision: 86,
        scale: 0,
        nullable: false,
    }),
    __metadata("design:type", typeof (_a = typeof ts_types_1.TsTokenAddress !== "undefined" && ts_types_1.TsTokenAddress) === "function" ? _a : Object)
], AuctionBondTokenEntity.prototype, "L2Addr", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'underlyingToken',
        precision: 86,
        scale: 0,
        nullable: false,
    }),
    __metadata("design:type", typeof (_b = typeof ts_types_1.TsTokenAddress !== "undefined" && ts_types_1.TsTokenAddress) === "function" ? _b : Object)
], AuctionBondTokenEntity.prototype, "underlyingToken", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'lastSyncBlocknumberForDepositEvent',
        default: 0,
        nullable: false,
    }),
    __metadata("design:type", Number)
], AuctionBondTokenEntity.prototype, "lastSyncBlocknumberForDepositEvent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp without time zone',
        name: 'maturityDate',
        nullable: false,
    }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], AuctionBondTokenEntity.prototype, "maturityDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'status',
        nullable: false,
        default: () => 0,
    }),
    __metadata("design:type", Number)
], AuctionBondTokenEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'timestamp without time zone',
        name: 'createdAt',
        nullable: false,
        default: 'now()',
    }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], AuctionBondTokenEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: 'time without time zone',
        name: 'updatedAt',
        nullable: false,
        default: 'now()',
    }),
    __metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], AuctionBondTokenEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'updatedBy',
        nullable: true,
        length: 256,
    }),
    __metadata("design:type", Object)
], AuctionBondTokenEntity.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'deletedBy',
        nullable: true,
        length: 256,
    }),
    __metadata("design:type", Object)
], AuctionBondTokenEntity.prototype, "deletedBy", void 0);
AuctionBondTokenEntity = __decorate([
    (0, typeorm_1.Entity)('AuctionBondToken', { schema: 'public' })
], AuctionBondTokenEntity);
exports.AuctionBondTokenEntity = AuctionBondTokenEntity;


/***/ }),
/* 55 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TxNoop = exports.TsTokenAddress = exports.TsDeciaml = exports.TsTxType = exports.TsDefaultValue = exports.TsSystemAccountAddress = exports.getOChunksSize = exports.MAX_CHUNKS_BYTES_PER_REQ = exports.MAX_CHUNKS_PER_REQ = exports.MIN_CHUNKS_PER_REQ = exports.CHUNK_BITS_SIZE = exports.CHUNK_BYTES_SIZE = exports.LEN_OF_REQUEST = void 0;
const tsStatus_enum_1 = __webpack_require__(31);
exports.LEN_OF_REQUEST = 10;
exports.CHUNK_BYTES_SIZE = 12;
exports.CHUNK_BITS_SIZE = exports.CHUNK_BYTES_SIZE * 8;
exports.MIN_CHUNKS_PER_REQ = 3;
exports.MAX_CHUNKS_PER_REQ = 9;
exports.MAX_CHUNKS_BYTES_PER_REQ = exports.MAX_CHUNKS_PER_REQ * exports.CHUNK_BYTES_SIZE;
function getOChunksSize(batchSize) {
    return exports.MAX_CHUNKS_PER_REQ * batchSize;
}
exports.getOChunksSize = getOChunksSize;
var TsSystemAccountAddress;
(function (TsSystemAccountAddress) {
    TsSystemAccountAddress["BURN_ADDR"] = "0";
    TsSystemAccountAddress["MINT_ADDR"] = "0";
    TsSystemAccountAddress["WITHDRAW_ADDR"] = "0";
    TsSystemAccountAddress["AUCTION_ADDR"] = "0";
})(TsSystemAccountAddress = exports.TsSystemAccountAddress || (exports.TsSystemAccountAddress = {}));
exports.TsDefaultValue = {
    NONCE_ZERO: '0',
    BIGINT_DEFAULT_VALUE: 0n,
    STRING_DEFAULT_VALUE: '0',
    ADDRESS_DEFAULT_VALUE: '0x00',
};
var TsTxType;
(function (TsTxType) {
    TsTxType[TsTxType["UNKNOWN"] = 0] = "UNKNOWN";
    TsTxType[TsTxType["NOOP"] = 0] = "NOOP";
    TsTxType[TsTxType["REGISTER"] = 1] = "REGISTER";
    TsTxType[TsTxType["DEPOSIT"] = 2] = "DEPOSIT";
    TsTxType[TsTxType["WITHDRAW"] = 3] = "WITHDRAW";
    TsTxType[TsTxType["SecondLimitOrder"] = 4] = "SecondLimitOrder";
    TsTxType[TsTxType["SecondLimitStart"] = 5] = "SecondLimitStart";
    TsTxType[TsTxType["SecondLimitExchange"] = 6] = "SecondLimitExchange";
    TsTxType[TsTxType["SecondLimitEnd"] = 7] = "SecondLimitEnd";
    TsTxType[TsTxType["SecondMarketOrder"] = 8] = "SecondMarketOrder";
    TsTxType[TsTxType["SecondMarketExchange"] = 9] = "SecondMarketExchange";
    TsTxType[TsTxType["SecondMarketEnd"] = 10] = "SecondMarketEnd";
    TsTxType[TsTxType["CancelOrder"] = 11] = "CancelOrder";
    TsTxType[TsTxType["AUCTION_LEND"] = 99] = "AUCTION_LEND";
    TsTxType[TsTxType["AUCTION_BORROW"] = 100] = "AUCTION_BORROW";
    TsTxType[TsTxType["AUCTION_CANCEL"] = 101] = "AUCTION_CANCEL";
})(TsTxType = exports.TsTxType || (exports.TsTxType = {}));
exports.TsDeciaml = {
    TS_TOKEN_AMOUNT_DEC: 18,
    TS_INTEREST_DEC: 6,
};
var TsTokenAddress;
(function (TsTokenAddress) {
    TsTokenAddress["Unknown"] = "0";
    TsTokenAddress["WETH"] = "1";
    TsTokenAddress["USDT"] = "2";
})(TsTokenAddress = exports.TsTokenAddress || (exports.TsTokenAddress = {}));
exports.TxNoop = {
    reqType: Number(TsTxType.UNKNOWN),
    txId: 0,
    accountId: '0',
    tokenId: '0',
    accumulatedSellAmt: '0',
    accumulatedBuyAmt: '0',
    amount: '0',
    nonce: '0',
    eddsaSig: {
        R8: ['0', '0'],
        S: '0',
    },
    ecdsaSig: '0',
    arg0: '0',
    arg1: '0',
    arg2: '0',
    arg3: '0',
    arg4: '0',
    fee: '0',
    feeToken: '0',
    tsPubKeyX: '',
    tsPubKeyY: '',
    blockNumber: null,
    metadata: null,
    txStatus: tsStatus_enum_1.TS_STATUS.PENDING,
    L2AccountInfo: {},
    blockInfo: {},
    matchedOrder: null,
    createdAt: new Date(0),
    createdBy: null,
    updatedAt: new Date(0),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    tokenAddr: TsTokenAddress.Unknown,
};


/***/ }),
/* 56 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ObsOrderLeafEntity = void 0;
const typeorm_1 = __webpack_require__(24);
const obsOrderLeafMerkleTreeNode_entity_1 = __webpack_require__(57);
const ts_helper_1 = __webpack_require__(43);
let ObsOrderLeafEntity = class ObsOrderLeafEntity {
    orderLeafId;
    txId;
    reqType;
    sender;
    sellTokenId;
    sellAmt;
    nonce;
    buyTokenId;
    buyAmt;
    accumulatedSellAmt;
    accumulatedBuyAmt;
    merkleTreeNode;
    encode() {
        return [
            BigInt(this.reqType),
            BigInt(this.sender),
            BigInt(this.sellTokenId),
            BigInt(this.sellAmt),
            BigInt(this.nonce),
            0n,
            0n,
            BigInt(this.buyTokenId),
            BigInt(this.buyAmt),
            0n,
            BigInt(this.txId || 0),
            BigInt(this.accumulatedSellAmt),
            BigInt(this.accumulatedBuyAmt),
        ];
    }
    encodeLeaf() {
        return (0, ts_helper_1.toTreeLeaf)(this.encode());
    }
    convertToObsOrderDto() {
        return {
            orderLeafId: this.orderLeafId,
            txId: String(this.txId) || '0',
            reqType: this.reqType.toString(),
            sender: this.sender,
            sellTokenId: this.sellTokenId,
            nonce: this.nonce,
            sellAmt: this.sellAmt,
            buyTokenId: this.buyTokenId,
            buyAmt: this.buyAmt,
            accumulatedSellAmt: this.accumulatedSellAmt,
            accumulatedBuyAmt: this.accumulatedBuyAmt,
        };
    }
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'decimal',
        name: 'orderLeafId',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], ObsOrderLeafEntity.prototype, "orderLeafId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int8',
        name: 'txId',
        nullable: true,
    }),
    __metadata("design:type", Object)
], ObsOrderLeafEntity.prototype, "txId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'reqType',
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], ObsOrderLeafEntity.prototype, "reqType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'sender',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], ObsOrderLeafEntity.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'sellTokenId',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], ObsOrderLeafEntity.prototype, "sellTokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'sellAmt',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], ObsOrderLeafEntity.prototype, "sellAmt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'nonce',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], ObsOrderLeafEntity.prototype, "nonce", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'buyTokenId',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], ObsOrderLeafEntity.prototype, "buyTokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'buyAmt',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], ObsOrderLeafEntity.prototype, "buyAmt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'accumulatedSellAmt',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], ObsOrderLeafEntity.prototype, "accumulatedSellAmt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'accumulatedBuyAmt',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], ObsOrderLeafEntity.prototype, "accumulatedBuyAmt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode, (obsOrderLeafMerkleTreeNode) => obsOrderLeafMerkleTreeNode.leaf, {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'orderLeafId',
        referencedColumnName: 'leafId',
    }),
    __metadata("design:type", typeof (_a = typeof obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode !== "undefined" && obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode) === "function" ? _a : Object)
], ObsOrderLeafEntity.prototype, "merkleTreeNode", void 0);
ObsOrderLeafEntity = __decorate([
    (0, typeorm_1.Entity)('ObsOrderLeaf', { schema: 'public' })
], ObsOrderLeafEntity);
exports.ObsOrderLeafEntity = ObsOrderLeafEntity;


/***/ }),
/* 57 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ObsOrderLeafMerkleTreeNode = void 0;
const typeorm_1 = __webpack_require__(24);
const obsOrderLeaf_entity_1 = __webpack_require__(56);
let ObsOrderLeafMerkleTreeNode = class ObsOrderLeafMerkleTreeNode {
    id;
    hash;
    leafId;
    leaf;
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'decimal',
        name: 'id',
        precision: 86,
        scale: 0,
        primary: true,
    }),
    __metadata("design:type", String)
], ObsOrderLeafMerkleTreeNode.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'hash',
        precision: 86,
        scale: 0,
        nullable: false,
        default: 0n,
    }),
    __metadata("design:type", String)
], ObsOrderLeafMerkleTreeNode.prototype, "hash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'leafId',
        precision: 86,
        scale: 0,
        nullable: true
    }),
    __metadata("design:type", Object)
], ObsOrderLeafMerkleTreeNode.prototype, "leafId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => obsOrderLeaf_entity_1.ObsOrderLeafEntity, (obsOrderLeaf) => obsOrderLeaf.merkleTreeNode),
    (0, typeorm_1.JoinColumn)({
        name: 'leafId',
        referencedColumnName: 'orderLeafId'
    }),
    __metadata("design:type", Object)
], ObsOrderLeafMerkleTreeNode.prototype, "leaf", void 0);
ObsOrderLeafMerkleTreeNode = __decorate([
    (0, typeorm_1.Entity)('ObsOrderLeafMerkleTreeNode', { schema: 'public' })
], ObsOrderLeafMerkleTreeNode);
exports.ObsOrderLeafMerkleTreeNode = ObsOrderLeafMerkleTreeNode;


/***/ }),
/* 58 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CandleStickEntity = void 0;
const typeorm_1 = __webpack_require__(24);
let CandleStickEntity = class CandleStickEntity {
    id;
    timestamp;
    maxPrice;
    minPrice;
    openPrice;
    closePrice;
    volume;
    marketPair;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        type: 'integer',
        name: 'id'
    }),
    __metadata("design:type", Number)
], CandleStickEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp without time zone',
        name: 'timestamp',
        precision: 3,
        nullable: false,
        default: 'now()'
    }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], CandleStickEntity.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'maxPrice',
        length: '300',
        nullable: false,
        default: '0'
    }),
    __metadata("design:type", String)
], CandleStickEntity.prototype, "maxPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'minPrice',
        length: '300',
        nullable: false,
        default: '0'
    }),
    __metadata("design:type", String)
], CandleStickEntity.prototype, "minPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'openPrice',
        length: '300',
        nullable: false,
        default: '0'
    }),
    __metadata("design:type", String)
], CandleStickEntity.prototype, "openPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'closePrice',
        length: '300',
        nullable: false,
        default: '0'
    }),
    __metadata("design:type", String)
], CandleStickEntity.prototype, "closePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'volume',
        length: '300',
        nullable: false,
        default: '0'
    }),
    __metadata("design:type", String)
], CandleStickEntity.prototype, "volume", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'marketPair',
        length: '300',
        nullable: false,
        default: '\'ETH/USDC\''
    }),
    __metadata("design:type", String)
], CandleStickEntity.prototype, "marketPair", void 0);
CandleStickEntity = __decorate([
    (0, typeorm_1.Entity)('CandleStick', { schema: 'public' })
], CandleStickEntity);
exports.CandleStickEntity = CandleStickEntity;


/***/ }),
/* 59 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MarketPairInfoEntity = void 0;
const typeorm_1 = __webpack_require__(24);
let MarketPairInfoEntity = class MarketPairInfoEntity {
    id;
    mainTokenId;
    baseTokenId;
    marketPair;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        type: 'integer',
        name: 'id'
    }),
    __metadata("design:type", Number)
], MarketPairInfoEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'mainTokenId',
        precision: 86,
        scale: 0,
        default: 0n,
        nullable: false
    }),
    __metadata("design:type", String)
], MarketPairInfoEntity.prototype, "mainTokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'baseTokenId',
        precision: 86,
        scale: 0,
        default: 0n,
        nullable: false
    }),
    __metadata("design:type", String)
], MarketPairInfoEntity.prototype, "baseTokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'marketPair',
        length: '100',
        nullable: false,
        default: () => 'ETH/USDC'
    }),
    __metadata("design:type", String)
], MarketPairInfoEntity.prototype, "marketPair", void 0);
MarketPairInfoEntity = __decorate([
    (0, typeorm_1.Entity)('MarketPairInfo', { schema: 'public' })
], MarketPairInfoEntity);
exports.MarketPairInfoEntity = MarketPairInfoEntity;


/***/ }),
/* 60 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MarketPairInfoService = void 0;
const common_1 = __webpack_require__(7);
const typeorm_1 = __webpack_require__(21);
const typeorm_2 = __webpack_require__(24);
const marketPairInfo_entity_1 = __webpack_require__(59);
let MarketPairInfoService = class MarketPairInfoService {
    marketPairInfoRepository;
    constructor(marketPairInfoRepository) {
        this.marketPairInfoRepository = marketPairInfoRepository;
    }
    async findOneMarketPairInfo(marketPairDto) {
        console.log(marketPairDto);
        try {
            const marketPairInfo = await this.marketPairInfoRepository.findOneOrFail({
                select: ['mainTokenId', 'baseTokenId', 'marketPair'],
                where: [{
                        mainTokenId: marketPairDto.pairs[0].mainTokenId,
                        baseTokenId: marketPairDto.pairs[0].baseTokenId,
                    }, {
                        mainTokenId: marketPairDto.pairs[1].mainTokenId,
                        baseTokenId: marketPairDto.pairs[1].baseTokenId,
                    }]
            });
            return marketPairInfo;
        }
        catch (error) {
            throw new common_1.NotFoundException('MarketPairInfo not found');
        }
    }
};
MarketPairInfoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(marketPairInfo_entity_1.MarketPairInfoEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], MarketPairInfoService);
exports.MarketPairInfoService = MarketPairInfoService;


/***/ }),
/* 61 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AvailableViewEntity = void 0;
const typeorm_1 = __webpack_require__(24);
let AvailableViewEntity = class AvailableViewEntity {
    accountId;
    tokenId;
    availableAmt;
    lockedAmt;
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        name: 'accountId',
        type: 'decimal',
        precision: 86,
        scale: 0
    }),
    __metadata("design:type", String)
], AvailableViewEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        name: 'tokenId',
        type: 'decimal',
        precision: 86,
        scale: 0
    }),
    __metadata("design:type", String)
], AvailableViewEntity.prototype, "tokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'availableAmt',
        type: 'decimal',
        precision: 86,
        scale: 0,
        default: 0n
    }),
    __metadata("design:type", String)
], AvailableViewEntity.prototype, "availableAmt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'lockedAmt',
        type: 'decimal',
        precision: 86,
        scale: 0,
        default: 0n
    }),
    __metadata("design:type", String)
], AvailableViewEntity.prototype, "lockedAmt", void 0);
AvailableViewEntity = __decorate([
    (0, typeorm_1.ViewEntity)('AvailableView', {
        schema: 'public',
        expression: `
SELECT 
  "tokenleaf"."accountId",
  "pendingOrder"."tokenId",
  ("tokenleaf"."lockedAmt" +  "pendingOrder"."sellAmt") AS "lockedAmt",
  ("tokenleaf"."availableAmt" - "pendingOrder"."sellAmt") AS "availableAmt"
FROM (SELECT 
  "accountId",
  SUM(ti.amount) AS "sellAmt",
  "tokenId"
FROM "TransactionInfo" ti 
WHERE ti."txStatus" = 'PENDING'
GROUP BY ti."accountId", ti."tokenId"
) AS "pendingOrder"
JOIN "TokenLeafNode" "tokenleaf"
ON "tokenleaf"."accountId" = "pendingOrder"."accountId" AND "tokenleaf"."leafId" = "pendingOrder"."tokenId"; 
  `
    })
], AvailableViewEntity);
exports.AvailableViewEntity = AvailableViewEntity;


/***/ }),
/* 62 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ObsOrderTreeService_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ObsOrderTreeService = void 0;
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
const typeorm_1 = __webpack_require__(21);
const typeorm_2 = __webpack_require__(24);
const mkAccount_helper_1 = __webpack_require__(42);
const ts_helper_1 = __webpack_require__(33);
const tsMerkleTree_1 = __webpack_require__(41);
const obsOrderLeaf_entity_1 = __webpack_require__(56);
const obsOrderLeafMerkleTreeNode_entity_1 = __webpack_require__(57);
let ObsOrderTreeService = ObsOrderTreeService_1 = class ObsOrderTreeService extends tsMerkleTree_1.TsMerkleTree {
    obsOrderLeafRepository;
    obsOrderMerkleTreeRepository;
    connection;
    configService;
    logger = new common_1.Logger(ObsOrderTreeService_1.name);
    currentOrderId = 1n;
    constructor(obsOrderLeafRepository, obsOrderMerkleTreeRepository, connection, configService) {
        console.time('init order tree');
        super(configService.getOrThrow('ORDER_TREE_HEIGHT'), ts_helper_1.tsHashFunc);
        this.obsOrderLeafRepository = obsOrderLeafRepository;
        this.obsOrderMerkleTreeRepository = obsOrderMerkleTreeRepository;
        this.connection = connection;
        this.configService = configService;
        console.timeEnd('init order tree');
        this.setLevelDefaultHash();
        this.setCurrentOrderId();
    }
    async setCurrentOrderId() {
        await this.updateLeaf('0', {
            orderLeafId: '0',
            txId: '0',
            reqType: '0',
            sender: '0',
            sellTokenId: '0',
            sellAmt: '0',
            nonce: '0',
            buyTokenId: '0',
            buyAmt: '0',
            accumulatedSellAmt: '0',
            accumulatedBuyAmt: '0',
        });
        const last = await this.obsOrderLeafRepository.count({
            order: {
                orderLeafId: 'DESC'
            },
        });
        this.currentOrderId = BigInt(last) + 1n;
    }
    async addCurrentOrderId() {
        this.currentOrderId += 1n;
    }
    async updateLeaf(leafId, value) {
        console.time('updateLeaf for obsOrder tree');
        const prf = this.getProofIds(leafId);
        const id = this.getLeafIdInTree(leafId);
        await this.connection.transaction(async (manager) => {
            await manager.upsert(obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode, {
                id: id.toString(),
                leafId: leafId,
                hash: BigInt((0, ts_helper_1.toTreeLeaf)([
                    BigInt(value.reqType),
                    BigInt(value.sender),
                    BigInt(value.sellTokenId),
                    BigInt(value.sellAmt),
                    BigInt(value.nonce),
                    0n, 0n,
                    BigInt(value.buyTokenId),
                    BigInt(value.buyAmt),
                    0n,
                    BigInt(value.txId),
                    BigInt(value.accumulatedSellAmt),
                    BigInt(value.accumulatedBuyAmt),
                ])).toString()
            }, ['id']);
            await manager.upsert(obsOrderLeaf_entity_1.ObsOrderLeafEntity, {
                orderLeafId: (value.orderLeafId),
                txId: Number(value.txId),
                reqType: Number(value.reqType),
                sender: (value.sender),
                sellTokenId: (value.sellTokenId),
                sellAmt: (value.sellAmt),
                nonce: (value.nonce),
                buyTokenId: (value.buyTokenId),
                buyAmt: (value.buyAmt),
                accumulatedSellAmt: (value.accumulatedSellAmt),
                accumulatedBuyAmt: (value.accumulatedBuyAmt),
            }, ['orderLeafId']);
            for (let i = id, j = 0; i > 1n; i = i >> 1n) {
                const [iValue, jValue] = await Promise.all([
                    this.obsOrderMerkleTreeRepository.findOneBy({ id: i.toString() }),
                    this.obsOrderMerkleTreeRepository.findOneBy({ id: prf[j].toString() })
                ]);
                const jLevel = Math.floor(Math.log2(Number(prf[j])));
                const iLevel = Math.floor(Math.log2(Number(i)));
                const jHashValue = (jValue == null) ? this.getDefaultHashByLevel(jLevel) : jValue.hash.toString();
                const iHashValue = (iValue == null) ? this.getDefaultHashByLevel(iLevel) : iValue.hash.toString();
                const r = (id % 2n == 0n) ? [jHashValue, iHashValue] : [iHashValue, jHashValue];
                const hashDecString = BigInt(this.hashFunc(r)).toString();
                const jobs = [];
                if (iValue == null) {
                    jobs.push(manager.upsert(obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode, {
                        id: i.toString(),
                        hash: (iHashValue)
                    }, ['id']));
                }
                if (jValue == null && j < prf.length) {
                    jobs.push(manager.upsert(obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode, {
                        id: prf[j].toString(),
                        hash: (jHashValue)
                    }, ['id']));
                }
                const updateRoot = i >> 1n;
                if (updateRoot >= 1n) {
                    jobs.push(manager.upsert(obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode, {
                        id: updateRoot.toString(),
                        hash: hashDecString
                    }, ['id']));
                }
                await Promise.all(jobs);
                j++;
            }
        });
        console.timeEnd('updateLeaf for obsOrder tree');
    }
    async getLeaf(leaf_id) {
        const result = this.obsOrderLeafRepository.findOneBy({
            orderLeafId: leaf_id
        });
        if (result == null) {
            const id = this.getLeafIdInTree(leaf_id);
            const level = Math.floor(Math.log2(Number(id)));
            const hashDecString = BigInt(this.getDefaultHashByLevel(level)).toString();
            await this.connection.transaction(async (manager) => {
                await manager.insert(obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode, {
                    leafId: leaf_id,
                    id: id.toString(),
                    hash: hashDecString,
                });
                await manager.insert(obsOrderLeaf_entity_1.ObsOrderLeafEntity, {
                    orderLeafId: leaf_id,
                });
            });
            return this.obsOrderLeafRepository.findOneBy({
                orderLeafId: leaf_id
            });
        }
        return result;
    }
    async getRoot() {
        const result = await this.obsOrderMerkleTreeRepository.findOne({
            where: {
                id: 1n.toString(),
            }
        });
        if (result == null) {
            const hashDecString = BigInt(this.getDefaultHashByLevel(1)).toString();
            await this.obsOrderMerkleTreeRepository.insert({
                id: 1n.toString(),
                hash: hashDecString,
            });
            return {
                id: 1n.toString(),
                hash: hashDecString
            };
        }
        return {
            id: result.id,
            hash: result.hash.toString()
        };
    }
    getDefaultRoot() {
        return this.getDefaultHashByLevel(1);
    }
    getLeafDefaultVavlue() {
        return (0, mkAccount_helper_1.getDefaultObsOrderLeaf)();
    }
    async getMerklerProof(leafId) {
        const ids = this.getProofIds(leafId);
        const r = await this.obsOrderMerkleTreeRepository.find({
            where: {
                id: (0, typeorm_2.In)(ids.map(id => id.toString()))
            },
            order: {
                id: 'ASC'
            }
        });
        return r.map(item => BigInt(item.hash));
    }
};
ObsOrderTreeService = ObsOrderTreeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(obsOrderLeaf_entity_1.ObsOrderLeafEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Connection !== "undefined" && typeorm_2.Connection) === "function" ? _c : Object, typeof (_d = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _d : Object])
], ObsOrderTreeService);
exports.ObsOrderTreeService = ObsOrderTreeService;


/***/ }),
/* 63 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RollupModule = void 0;
const common_1 = __webpack_require__(7);
const typeorm_1 = __webpack_require__(21);
const rollupInformation_entity_1 = __webpack_require__(64);
let RollupModule = class RollupModule {
};
RollupModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([rollupInformation_entity_1.RollupInformation])],
        exports: [typeorm_1.TypeOrmModule]
    })
], RollupModule);
exports.RollupModule = RollupModule;


/***/ }),
/* 64 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RollupInformation = void 0;
const lodash_1 = __webpack_require__(65);
const helper_1 = __webpack_require__(8);
const typeorm_1 = __webpack_require__(24);
let RollupInformation = class RollupInformation {
    id;
    lastSyncBlocknumberForRegisterEvent;
    lastSyncBlocknumberForDepositEvent;
    currentOrderId;
    createdAt;
    updatedAt;
    deletedAt;
    updatedBy;
    deletedBy;
    setUpdatedBy() {
        this.updatedBy = (0, helper_1.getProcessName)();
    }
    setDeletedBy() {
        this.deletedBy = (0, helper_1.getProcessName)();
    }
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'integer',
        name: 'id',
        primary: true,
        nullable: false,
        generated: 'increment',
    }),
    __metadata("design:type", Number)
], RollupInformation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'lastSyncBlocknumberForRegisterEvent',
        nullable: false,
    }),
    __metadata("design:type", Number)
], RollupInformation.prototype, "lastSyncBlocknumberForRegisterEvent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        name: 'lastSyncBlocknumberForDepositEvent',
        nullable: false,
    }),
    __metadata("design:type", Number)
], RollupInformation.prototype, "lastSyncBlocknumberForDepositEvent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'currentOrderId',
        precision: 86,
        scale: 0,
        nullable: false,
        default: '0',
    }),
    __metadata("design:type", String)
], RollupInformation.prototype, "currentOrderId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'timestamp without time zone',
        name: 'createdAt',
        nullable: false,
        default: 'now()',
    }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], RollupInformation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: 'timestamp without time zone',
        name: 'updatedAt',
        nullable: false,
        default: (0, lodash_1.now)(),
    }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], RollupInformation.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({
        type: 'timestamp without time zone',
        name: 'deletedAt',
        nullable: true,
    }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], RollupInformation.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'updatedBy',
        length: 256,
        nullable: false,
    }),
    __metadata("design:type", Object)
], RollupInformation.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'deletedBy',
        length: 256,
        nullable: true,
    }),
    __metadata("design:type", Object)
], RollupInformation.prototype, "deletedBy", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RollupInformation.prototype, "setUpdatedBy", null);
__decorate([
    (0, typeorm_1.BeforeRemove)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RollupInformation.prototype, "setDeletedBy", null);
RollupInformation = __decorate([
    (0, typeorm_1.Entity)('RollupInformation', { schema: 'public' })
], RollupInformation);
exports.RollupInformation = RollupInformation;


/***/ }),
/* 65 */
/***/ ((module) => {

module.exports = require("lodash");;

/***/ }),
/* 66 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OperatorProducer = void 0;
const pinoLogger_service_1 = __webpack_require__(6);
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
const typeorm_1 = __webpack_require__(21);
const transactionInfo_entity_1 = __webpack_require__(27);
const nestjs_ethers_1 = __webpack_require__(10);
const typeorm_2 = __webpack_require__(24);
const ABI = __webpack_require__(12);
const rollupInformation_entity_1 = __webpack_require__(64);
const worker_service_1 = __webpack_require__(67);
const firstValueFrom_1 = __webpack_require__(71);
const accountInformation_entity_1 = __webpack_require__(23);
const messageBroker_1 = __webpack_require__(72);
const constant_1 = __webpack_require__(5);
const nest_bullmq_1 = __webpack_require__(13);
const bullmq_1 = __webpack_require__(14);
const ts_types_1 = __webpack_require__(55);
const ts_types_2 = __webpack_require__(55);
let OperatorProducer = class OperatorProducer {
    config;
    logger;
    ethersSigner;
    ethersContract;
    coreQueue;
    txRepository;
    rollupInfoRepository;
    accountRepository;
    messageBrokerService;
    connection;
    workerService;
    wallet;
    contract;
    constructor(config, logger, ethersSigner, ethersContract, coreQueue, txRepository, rollupInfoRepository, accountRepository, messageBrokerService, connection, workerService) {
        this.config = config;
        this.logger = logger;
        this.ethersSigner = ethersSigner;
        this.ethersContract = ethersContract;
        this.coreQueue = coreQueue;
        this.txRepository = txRepository;
        this.rollupInfoRepository = rollupInfoRepository;
        this.accountRepository = accountRepository;
        this.messageBrokerService = messageBrokerService;
        this.connection = connection;
        this.workerService = workerService;
        this.wallet = this.ethersSigner.createWallet(this.config.get('ETHEREUM_OPERATOR_PRIV', ''));
        this.contract = this.ethersContract.create(this.config.get('ETHEREUM_ROLLUP_CONTRACT_ADDR', ''), ABI, this.wallet);
        this.logger.log({
            address: this.wallet.address,
            contract: this.contract.address,
        });
        this.listenRegisterEvent();
        this.listenDepositEvent();
    }
    async listenRegisterEvent() {
        await (0, firstValueFrom_1.firstValueFrom)(this.workerService.onReadyObserver);
        this.logger.log(`OperatorProducer.listenRegisterEvent contract=${this.contract.address}`);
        const filters = this.contract.filters.Register();
        const handler = (log) => {
            console.log({
                registerLog: log,
            });
            this.logger.log(`OperatorProducer.listenRegisterEvent log:${JSON.stringify(log)}`);
            this.handleRegisterEvent(log.args.sender, log.args.accountId, log.args.tsPubX, log.args.tsPubY, log.args.l2Addr, log);
        };
        this.contract.queryFilter(filters, 0, 'latest').then((logs) => {
            logs.forEach((log) => {
                handler(log);
            });
        });
        this.contract.on(filters, handler);
    }
    async handleRegisterEvent(sender, accountId, tsPubX, tsPubY, l2Addr, tx) {
        const rollupInfo = await this.rollupInfoRepository.findOneOrFail({ where: { id: 1 } });
        const { blockNumber = 0 } = tx;
        if (blockNumber < rollupInfo.lastSyncBlocknumberForRegisterEvent) {
            this.logger.log(`OperatorProducer.listenRegisterEvent SKIP blockNumber=${blockNumber} lastSyncBlocknumberForRegisterEvent=${rollupInfo.lastSyncBlocknumberForRegisterEvent}`);
            return;
        }
        const txRegister = {
            L1Address: sender,
            accountId: accountId.toString(),
            tsPubKeyX: tsPubX.toString(),
            tsPubKeyY: tsPubY.toString(),
        };
        this.logger.log(`OperatorProducer.handleRegisterEvent txRegister:${JSON.stringify(txRegister)}`);
        await Promise.all([
            this.accountRepository.upsert(txRegister, ['L1Address']),
            this.txRepository.insert({
                reqType: Number(ts_types_1.TsTxType.REGISTER),
                accountId: '0',
                tokenId: '0',
                amount: '0',
                arg0: (BigInt(accountId.toString()).toString()),
                arg1: BigInt(l2Addr).toString(),
            }),
        ]);
        this.coreQueue.add('TransactionInfo', {
            test: true
        });
    }
    async listenDepositEvent() {
        await (0, firstValueFrom_1.firstValueFrom)(this.workerService.onReadyObserver);
        this.logger.log(`OperatorProducer.listenDepositEvent contract=${this.contract.address}`);
        const filters = this.contract.filters.Deposit();
        const handler = (log) => {
            this.logger.log(`OperatorProducer.listenDepositEvent log:${JSON.stringify(log)}`);
            console.log({
                depositLog: log,
            });
            this.handleDepositEvent(log.args.sender, log.args.accountId, log.args.tokenId, log.args.amount, log.transactionHash);
        };
        this.contract.queryFilter(filters, 0, 'latest').then((logs) => {
            logs.forEach((log) => {
                handler(log);
            });
        });
        this.contract.on(filters, handler);
    }
    async handleDepositEvent(sender, accountId, tokenId, amount, tx) {
        const rollupInfo = await this.rollupInfoRepository.findOneOrFail({ where: { id: 1 } });
        const { blockNumber = 0 } = tx;
        if (blockNumber < rollupInfo.lastSyncBlocknumberForDepositEvent) {
            this.logger.log(`OperatorProducer.listenDepositEvent SKIP blockNumber=${blockNumber} lastSyncBlocknumberForDepositEvent=${rollupInfo.lastSyncBlocknumberForDepositEvent}`);
            return;
        }
        this.logger.log(`OperatorProducer.handleDepositEvent txDeposit:${JSON.stringify({ tokenId, amount, accountId })}`);
        await this.txRepository.insert({
            reqType: Number(ts_types_1.TsTxType.DEPOSIT),
            tokenId: getRandomItemFromArray([ts_types_2.TsTokenAddress.WETH, ts_types_2.TsTokenAddress.USDT]),
            amount: (amount.toString()),
            arg0: (BigInt(accountId.toString()).toString()),
        });
        this.coreQueue.add('TransactionInfo', {
            test: true
        });
    }
};
OperatorProducer = __decorate([
    (0, common_1.Injectable)({
        scope: common_1.Scope.DEFAULT,
    }),
    __param(2, (0, nestjs_ethers_1.InjectSignerProvider)()),
    __param(3, (0, nestjs_ethers_1.InjectContractProvider)()),
    __param(4, (0, nest_bullmq_1.BullQueueInject)(constant_1.TsWorkerName.CORE)),
    __param(5, (0, typeorm_1.InjectRepository)(transactionInfo_entity_1.TransactionInfo)),
    __param(6, (0, typeorm_1.InjectRepository)(rollupInformation_entity_1.RollupInformation)),
    __param(7, (0, typeorm_1.InjectRepository)(accountInformation_entity_1.AccountInformation)),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _b : Object, typeof (_c = typeof nestjs_ethers_1.EthersSigner !== "undefined" && nestjs_ethers_1.EthersSigner) === "function" ? _c : Object, typeof (_d = typeof nestjs_ethers_1.EthersContract !== "undefined" && nestjs_ethers_1.EthersContract) === "function" ? _d : Object, typeof (_e = typeof bullmq_1.Queue !== "undefined" && bullmq_1.Queue) === "function" ? _e : Object, typeof (_f = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _f : Object, typeof (_g = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _g : Object, typeof (_h = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _h : Object, typeof (_j = typeof messageBroker_1.MessageBroker !== "undefined" && messageBroker_1.MessageBroker) === "function" ? _j : Object, typeof (_k = typeof typeorm_2.Connection !== "undefined" && typeorm_2.Connection) === "function" ? _k : Object, typeof (_l = typeof worker_service_1.WorkerService !== "undefined" && worker_service_1.WorkerService) === "function" ? _l : Object])
], OperatorProducer);
exports.OperatorProducer = OperatorProducer;
function getRandomItemFromArray(items) {
    return items[Math.floor(Math.random() * items.length)];
}


/***/ }),
/* 67 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkerService = void 0;
const _cluster = __webpack_require__(1);
const rxjs_1 = __webpack_require__(68);
const pinoLogger_service_1 = __webpack_require__(6);
const cluster_1 = __webpack_require__(69);
const common_1 = __webpack_require__(7);
const constant_1 = __webpack_require__(5);
const helper_1 = __webpack_require__(8);
const cluster = _cluster;
let WorkerService = class WorkerService {
    logger;
    isListening = false;
    workerName;
    workerReadySubject = new rxjs_1.ReplaySubject(1);
    onReadyObserver = this.workerReadySubject.asObservable();
    constructor(logger) {
        this.logger = logger;
        this.workerName = (0, helper_1.getWorkerName)();
        if (!cluster.isPrimary) {
            this.startListen();
        }
    }
    onReceivedMessage(payload) {
        this.logger.log({
            msg: 'ON MESSAGE', workerName: this.workerName, payload
        });
        switch (payload.type) {
            case cluster_1.ClusterMessageType.READY:
                this.workerReadySubject.next(true);
                this.workerReadySubject.complete();
                break;
        }
    }
    startListen() {
        if (this.isListening) {
            throw new Error('WorkerService is already listening');
        }
        this.logger.debug('ON LISTEN', this.workerName);
        process.on('message', (payload) => {
            if (payload.to === this.workerName) {
                this.onReceivedMessage(payload);
            }
            else {
                throw new Error(`message send to wrong Worker to=${payload.to}, current=${this.workerName}`);
            }
        });
    }
    sendMessage(payload) {
        if (process?.send) {
            process.send({
                from: this.workerName,
                ...payload,
            });
            return;
        }
        throw new Error('process.send is not defined');
    }
    ready() {
        this.sendMessage({
            to: constant_1.TsWorkerName.CORE,
            type: cluster_1.ClusterMessageType.READY,
        });
    }
    stop() {
        this.sendMessage({
            to: constant_1.TsWorkerName.CORE,
            type: cluster_1.ClusterMessageType.STOP,
        });
    }
};
WorkerService = __decorate([
    (0, common_1.Injectable)({
        scope: common_1.Scope.DEFAULT,
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _a : Object])
], WorkerService);
exports.WorkerService = WorkerService;


/***/ }),
/* 68 */
/***/ ((module) => {

module.exports = require("rxjs");;

/***/ }),
/* 69 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClusterMessageEventPayload = exports.ClusterMessageType = void 0;
const constant_1 = __webpack_require__(5);
const runtypes_1 = __webpack_require__(70);
const TsWorkerNameBrand = runtypes_1.String.withConstraint((s) => Object.values(constant_1.TsWorkerName).includes(s));
var ClusterMessageType;
(function (ClusterMessageType) {
    ClusterMessageType[ClusterMessageType["UNKNOWN"] = 0] = "UNKNOWN";
    ClusterMessageType[ClusterMessageType["START"] = 1] = "START";
    ClusterMessageType[ClusterMessageType["READY"] = 2] = "READY";
    ClusterMessageType[ClusterMessageType["ALL_READY"] = 3] = "ALL_READY";
    ClusterMessageType[ClusterMessageType["STOP"] = 4] = "STOP";
    ClusterMessageType[ClusterMessageType["MESSAGE"] = 5] = "MESSAGE";
})(ClusterMessageType = exports.ClusterMessageType || (exports.ClusterMessageType = {}));
exports.ClusterMessageEventPayload = (0, runtypes_1.Record)({
    from: TsWorkerNameBrand,
    to: TsWorkerNameBrand,
});


/***/ }),
/* 70 */
/***/ ((module) => {

module.exports = require("runtypes");;

/***/ }),
/* 71 */
/***/ ((module) => {

module.exports = require("rxjs/internal/firstValueFrom");;

/***/ }),
/* 72 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MessageBroker = void 0;
const common_1 = __webpack_require__(7);
let MessageBroker = class MessageBroker {
    connect;
    addChannels;
    removeChannel;
    publish;
    subscribe;
    close;
};
MessageBroker = __decorate([
    (0, common_1.Injectable)()
], MessageBroker);
exports.MessageBroker = MessageBroker;


/***/ }),
/* 73 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkerModule = exports.MainProcessModule = void 0;
const logger_module_1 = __webpack_require__(15);
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
const main_process_service_1 = __webpack_require__(74);
const worker_service_1 = __webpack_require__(67);
let MainProcessModule = class MainProcessModule {
};
MainProcessModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            logger_module_1.LoggerModule,
        ],
        providers: [
            main_process_service_1.MainProcessService,
        ],
        exports: [main_process_service_1.MainProcessService]
    })
], MainProcessModule);
exports.MainProcessModule = MainProcessModule;
let WorkerModule = class WorkerModule {
};
WorkerModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            logger_module_1.LoggerModule,
        ],
        providers: [
            worker_service_1.WorkerService,
        ],
        exports: [worker_service_1.WorkerService]
    })
], WorkerModule);
exports.WorkerModule = WorkerModule;


/***/ }),
/* 74 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MainProcessService = void 0;
const _cluster = __webpack_require__(1);
const cluster = _cluster;
const cluster_1 = __webpack_require__(69);
const pinoLogger_service_1 = __webpack_require__(6);
const common_1 = __webpack_require__(7);
const constant_1 = __webpack_require__(5);
const helper_1 = __webpack_require__(8);
const rxjs_1 = __webpack_require__(68);
let MainProcessService = class MainProcessService {
    logger;
    workerMap = {};
    selfWorkerName;
    workerReadySubject = new rxjs_1.ReplaySubject(1);
    isReady = this.workerReadySubject.asObservable();
    constructor(logger) {
        this.logger = logger;
        this.selfWorkerName = (0, helper_1.getWorkerName)();
        this.workerReadySubject.next(false);
        this.logger.setContext('MainProcessService');
        this.handleAllWorkerReady();
    }
    handleAllWorkerReady() {
        this.isReady.pipe((0, rxjs_1.filter)((isReady) => isReady), (0, rxjs_1.first)(), (0, rxjs_1.delay)(1000 * 3)).subscribe(() => {
            Object.values(this.workerMap).forEach((item) => {
                this.sendMessage({
                    from: this.selfWorkerName,
                    to: item.name,
                    type: cluster_1.ClusterMessageType.READY,
                });
            });
        });
    }
    onReceivedMessage(payload) {
        this.logger.log({ name: this.selfWorkerName, type: 'message', payload });
        switch (payload.type) {
            case cluster_1.ClusterMessageType.READY:
                this.getWorker(payload.from).isReady = true;
                const isAllReady = Object.values(this.workerMap).every((item) => item.isReady);
                this.workerReadySubject.next(isAllReady);
                break;
            default:
                break;
        }
    }
    setWorker(name, workerItem) {
        if (!cluster.isPrimary) {
            throw new Error('setWorker() should only be called in primary process');
        }
        this.workerMap[name] = workerItem;
    }
    getWorker(name) {
        const worker = this.workerMap[name];
        if (!worker) {
            throw new Error(`worker ${name} is not found`);
        }
        return worker;
    }
    sendMessage(payload) {
        this.logger.log({ type: 'sendMessage', payload });
        if (payload.to === this.selfWorkerName) {
            this.onReceivedMessage(payload);
            return;
        }
        if (!this.workerMap[payload.to]) {
            this.logger.error(`Worker ${payload.to} not found`);
        }
        else {
            this.workerMap[payload.to].worker?.send(payload);
        }
    }
    clusterize(workers) {
        if (!cluster.isPrimary) {
            throw new Error('clusterize() should only be called in primary process');
        }
        for (let index = 0; index < workers.length; index++) {
            const item = workers[index];
            this.logger.log(`${constant_1.TsWorkerName.CORE}: fork cluster ${item.name}`);
            const worker = cluster.fork({
                TS_WORKER_NAME: item.name,
            });
            this.setWorker(item.name, {
                ...item,
                worker,
            });
            worker.once('online', () => {
                this.logger.log(`Worker ${item.name}-${worker.process.pid} online!`);
            });
            worker.once('exit', () => {
                this.logger.error(`Worker ${item.name}-${worker.process.pid} died.`);
            });
            worker.on('message', this.sendMessage.bind(this));
        }
    }
};
MainProcessService = __decorate([
    (0, common_1.Injectable)({
        scope: common_1.Scope.DEFAULT,
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _a : Object])
], MainProcessService);
exports.MainProcessService = MainProcessService;


/***/ }),
/* 75 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabasePubSubModule = void 0;
const pinoLogger_service_1 = __webpack_require__(6);
const logger_module_1 = __webpack_require__(15);
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
const messageBroker_service_1 = __webpack_require__(76);
const messageBroker_1 = __webpack_require__(72);
let DatabasePubSubModule = class DatabasePubSubModule {
};
DatabasePubSubModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, logger_module_1.LoggerModule],
        providers: [config_1.ConfigService, pinoLogger_service_1.PinoLoggerService, {
                provide: messageBroker_1.MessageBroker,
                useClass: messageBroker_service_1.MessageBrokerService
            }],
        exports: [messageBroker_1.MessageBroker]
    })
], DatabasePubSubModule);
exports.DatabasePubSubModule = DatabasePubSubModule;


/***/ }),
/* 76 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MessageBrokerService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MessageBrokerService = void 0;
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
const pg_pubsub_1 = __webpack_require__(77);
const pinoLogger_service_1 = __webpack_require__(6);
let MessageBrokerService = MessageBrokerService_1 = class MessageBrokerService {
    configService;
    logger;
    DATABASE_URL;
    pubSubInstance;
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
        this.logger.setContext(MessageBrokerService_1.name);
        this.DATABASE_URL = this.configService.get('DATABASE_URL', '');
        this.pubSubInstance = new pg_pubsub_1.PgPubSub({
            connectionString: this.DATABASE_URL,
            singleListener: false
        });
        this.connect();
    }
    async connect() {
        this.pubSubInstance.connect()
            .catch(err => {
            this.logger.error(err);
        });
    }
    async addChannels(channelNames) {
        this.logger.log(channelNames);
        await Promise.all(channelNames.map(channelName => () => this.pubSubInstance.listen(channelName)));
    }
    async subscribe(channelName, eventListener) {
        this.logger.log(`addChannelListener: ${channelName}`);
        console.log('subscribe', channelName);
        await this.pubSubInstance.channels.on(channelName, eventListener);
    }
    async removeChannel(channelName) {
        this.logger.log(`removeChannel: ${channelName}`);
        await this.pubSubInstance.unlisten(channelName);
    }
    async publish(channelName, data) {
        console.log({ name: 'publish', channelName, data });
        this.logger.log({ name: 'publish', channelName, data });
        await this.pubSubInstance.channels.emit(channelName, data);
    }
    async close() {
        this.logger.log('close');
        await this.pubSubInstance.close();
    }
};
MessageBrokerService = MessageBrokerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _b : Object])
], MessageBrokerService);
exports.MessageBrokerService = MessageBrokerService;


/***/ }),
/* 77 */
/***/ ((module) => {

module.exports = require("@imqueue/pg-pubsub");;

/***/ }),
/* 78 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setupApp = void 0;
const pinoLogger_service_1 = __webpack_require__(6);
const config_1 = __webpack_require__(11);
const core_1 = __webpack_require__(79);
const helper_1 = __webpack_require__(8);
async function setupApp(module) {
    const app = await core_1.NestFactory.createApplicationContext(module);
    const configService = app.get(config_1.ConfigService);
    const workerName = (0, helper_1.getWorkerName)();
    const logger = app.get(pinoLogger_service_1.PinoLoggerService);
    logger.setContext((0, helper_1.getProcessName)());
    app.useLogger(logger);
    logger.log(`${(0, helper_1.getProcessName)()}: server started!`);
    return app;
}
exports.setupApp = setupApp;


/***/ }),
/* 79 */
/***/ ((module) => {

module.exports = require("@nestjs/core");;

/***/ }),
/* 80 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.bootstrap = void 0;
const ts_sequencer_module_1 = __webpack_require__(81);
const setup_helper_1 = __webpack_require__(78);
async function bootstrap() {
    const app = await (0, setup_helper_1.setupApp)(ts_sequencer_module_1.TsSequencerModule);
    return app;
}
exports.bootstrap = bootstrap;


/***/ }),
/* 81 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsSequencerModule = void 0;
const pinoLogger_service_1 = __webpack_require__(6);
const common_1 = __webpack_require__(7);
const logger_module_1 = __webpack_require__(15);
const config_1 = __webpack_require__(11);
const constant_1 = __webpack_require__(5);
const BullQueue_module_1 = __webpack_require__(19);
const sequencer_processor_1 = __webpack_require__(82);
const nest_bullmq_1 = __webpack_require__(13);
const schedule_1 = __webpack_require__(88);
const typeorm_1 = __webpack_require__(21);
const blockInformation_entity_1 = __webpack_require__(29);
const transactionInfo_entity_1 = __webpack_require__(27);
const tstypeorm_module_1 = __webpack_require__(20);
const cluster_module_1 = __webpack_require__(73);
const worker_service_1 = __webpack_require__(67);
const db_pubsub_module_1 = __webpack_require__(75);
const rollup_module_1 = __webpack_require__(63);
const account_module_1 = __webpack_require__(22);
const auctionOrder_module_1 = __webpack_require__(53);
let TsSequencerModule = class TsSequencerModule {
    logger;
    workerService;
    constructor(logger, workerService) {
        this.logger = logger;
        this.workerService = workerService;
    }
    onModuleInit() {
        this.workerService.ready();
    }
};
TsSequencerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            logger_module_1.LoggerModule,
            schedule_1.ScheduleModule.forRoot(),
            BullQueue_module_1.BullQueueModule,
            nest_bullmq_1.BullModule.registerQueue({
                queueName: constant_1.TsWorkerName.SEQUENCER
            }, {
                queueName: constant_1.TsWorkerName.CORE
            }),
            tstypeorm_module_1.TsTypeOrmModule,
            typeorm_1.TypeOrmModule.forFeature([
                transactionInfo_entity_1.TransactionInfo,
                blockInformation_entity_1.BlockInformation,
            ]),
            cluster_module_1.WorkerModule,
            db_pubsub_module_1.DatabasePubSubModule,
            account_module_1.AccountModule,
            auctionOrder_module_1.AuctionOrderMoudle,
            rollup_module_1.RollupModule,
        ],
        controllers: [],
        providers: [
            sequencer_processor_1.SequencerConsumer,
        ]
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _a : Object, typeof (_b = typeof worker_service_1.WorkerService !== "undefined" && worker_service_1.WorkerService) === "function" ? _b : Object])
], TsSequencerModule);
exports.TsSequencerModule = TsSequencerModule;


/***/ }),
/* 82 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SequencerConsumer = void 0;
const constant_1 = __webpack_require__(5);
const pinoLogger_service_1 = __webpack_require__(6);
const nest_bullmq_1 = __webpack_require__(13);
const bullmq_1 = __webpack_require__(14);
const typeorm_1 = __webpack_require__(21);
const blockInformation_entity_1 = __webpack_require__(29);
const transactionInfo_entity_1 = __webpack_require__(27);
const typeorm_2 = __webpack_require__(24);
const tsStatus_enum_1 = __webpack_require__(31);
const helper_1 = __webpack_require__(44);
const ts_rollup_1 = __webpack_require__(83);
const ts_rollup_helper_1 = __webpack_require__(84);
const ts_tx_helper_1 = __webpack_require__(85);
const ts_types_1 = __webpack_require__(55);
const assert_1 = __webpack_require__(87);
const poseidon_hash_dp_1 = __webpack_require__(49);
const tsAccountTree_service_1 = __webpack_require__(40);
const tsTokenTree_service_1 = __webpack_require__(50);
const obsOrderTree_service_1 = __webpack_require__(62);
const accountLeafNode_entity_1 = __webpack_require__(37);
const mkAccount_helper_1 = __webpack_require__(42);
const accountInformation_entity_1 = __webpack_require__(23);
const blockStatus_enum_1 = __webpack_require__(30);
const obsOrder_entity_1 = __webpack_require__(25);
const DefaultRollupConfig = {
    order_tree_height: 8,
    l2_acc_addr_size: 8,
    token_tree_height: 4,
    nullifier_tree_height: 8,
    numOfReqs: 20,
    numOfChunks: 50,
    register_batch_size: 1,
    l2_token_addr_size: 32,
    auction_market_count: 8,
    auction_lender_count: 8,
    auction_borrower_count: 8,
};
let SequencerConsumer = class SequencerConsumer {
    logger;
    txRepository;
    blockRepository;
    accountLeafNodeRepository;
    accountInfoRepository;
    obsOrderRepository;
    tsAccountTreeService;
    tsTokenTreeService;
    obsOrderTreeService;
    connection;
    async process(job) {
        this.logger.log(`SEQUENCER.process ${job.data.txId} start`);
        console.log({
            log: 'SEQUENCER.process start'
        });
        const req = await this.txRepository.findOne({
            where: {
                txId: job.data.txId,
            },
        });
        if (!req) {
            this.logger.log(`SEQUENCER.process ${job.data.txId} not found`);
            return false;
        }
        req.txStatus = tsStatus_enum_1.TS_STATUS.PROCESSING;
        this.txRepository.save(req);
        console.log({
            log: 'SEQUENCER.doTransaction start'
        });
        await this.doTransaction(req);
        this.logger.log(`SEQUENCER.process ${job.data.txId} done`);
        await this.txRepository.update({
            txId: req.txId,
        }, {
            txStatus: tsStatus_enum_1.TS_STATUS.L2EXECUTED,
        });
        return true;
    }
    constructor(logger, txRepository, blockRepository, accountLeafNodeRepository, accountInfoRepository, obsOrderRepository, tsAccountTreeService, tsTokenTreeService, obsOrderTreeService, connection) {
        this.logger = logger;
        this.txRepository = txRepository;
        this.blockRepository = blockRepository;
        this.accountLeafNodeRepository = accountLeafNodeRepository;
        this.accountInfoRepository = accountInfoRepository;
        this.obsOrderRepository = obsOrderRepository;
        this.tsAccountTreeService = tsAccountTreeService;
        this.tsTokenTreeService = tsTokenTreeService;
        this.obsOrderTreeService = obsOrderTreeService;
        this.connection = connection;
        this.logger.log('SEQUENCER.process START');
        this.config = DefaultRollupConfig;
    }
    config = DefaultRollupConfig;
    get txNormalPerBatch() {
        return this.config.numOfReqs;
    }
    get txRegisterPerBatch() {
        return this.config.register_batch_size;
    }
    async stateRoot() {
        const accountTreeRoot = (await this.tsAccountTreeService.getRoot()).hash;
        const orderTreeRoot = (await this.obsOrderTreeService.getRoot()).hash;
        const oriTxNum = this.oriTxId;
        const oriTsRoot = '0x' +
            (0, poseidon_hash_dp_1.dpPoseidonHash)([BigInt(orderTreeRoot), oriTxNum])
                .toString(16)
                .padStart(64, '0');
        const oriStateRoot = '0x' +
            (0, poseidon_hash_dp_1.dpPoseidonHash)([BigInt(oriTsRoot), BigInt(accountTreeRoot)])
                .toString(16)
                .padStart(64, '0');
        return oriStateRoot;
    }
    rollupStatus = ts_rollup_1.RollupStatus.Idle;
    blockNumber = 0n;
    oriTxId = 0n;
    get latestTxId() {
        return this.oriTxId + BigInt(this.currentTxLogs.length);
    }
    currentTxLogs = [];
    currentAccountRootFlow = [];
    currentOrderRootFlow = [];
    currentAccountPayload = this.prepareTxAccountPayload();
    currentOrderPayload = this.prepareTxOrderPayload();
    blockLogs = new Map();
    async getObsOrder(orderId) {
        return await this.obsOrderTreeService.getLeaf(orderId);
    }
    async getAccount(accAddr) {
        const acc = await this.tsAccountTreeService.getLeaf(accAddr);
        if (acc.tsAddr === '0' || !acc) {
            return null;
        }
        return acc;
    }
    addAccount(l2addr, account) {
        this.tsAccountTreeService.addLeaf({
            leafId: l2addr.toString(),
            tsAddr: account.tsAddr.toString(),
        });
        return l2addr;
    }
    async updateAccountToken(leaf_id, tokenAddr, tokenAmt, lockedAmt) {
        const acc = this.getAccount(leaf_id);
        if (!acc) {
            throw new Error(`updateAccountToken: account id=${leaf_id} not found`);
        }
        await this.tsAccountTreeService.updateTokenLeaf(leaf_id, {
            lockedAmt: lockedAmt.toString(),
            availableAmt: tokenAmt.toString(),
            leafId: tokenAddr,
            accountId: leaf_id,
        });
    }
    async updateAccountNonce(leaf_id, nonce) {
        const acc = await this.getAccount(leaf_id);
        if (!acc) {
            throw new Error(`updateAccountNonce: account id=${leaf_id} not found`);
        }
        await this.tsAccountTreeService.updateLeaf(leaf_id, {
            leafId: leaf_id,
            nonce: nonce.toString(),
        });
    }
    addFirstRootFlow() {
        if (this.currentAccountRootFlow.length !== 0 || this.currentOrderRootFlow.length !== 0) {
            throw new Error('addFirstRootFlow must run on new block');
        }
        this.addAccountRootFlow();
        this.addOrderRootFlow();
    }
    flushBlock(blocknumber) {
        if (this.blockLogs.has(blocknumber.toString())) {
            throw new Error(`Block ${blocknumber} already exist`);
        }
        const logs = { ...this.currentTxLogs };
        const accountRootFlow = [...this.currentAccountRootFlow];
        const auctionOrderRootFlow = [...this.currentOrderRootFlow];
        this.blockNumber = blocknumber;
        this.currentAccountRootFlow = [];
        this.currentOrderRootFlow = [];
        this.currentTxLogs = [];
        this.currentAccountPayload = this.prepareTxAccountPayload();
        this.currentOrderPayload = this.prepareTxOrderPayload();
        return {
            logs,
            accountRootFlow,
            auctionOrderRootFlow,
        };
    }
    async addAccountRootFlow() {
        const root = await this.tsAccountTreeService.getRoot();
        this.currentAccountRootFlow.push(BigInt(root.hash));
    }
    async addOrderRootFlow() {
        const root = await this.obsOrderTreeService.getRoot();
        this.currentOrderRootFlow.push(BigInt(root.hash));
    }
    addTxLogs(detail) {
        this.currentTxLogs.push(detail);
    }
    newBlockNumber = 0n;
    async startRollup() {
        if (this.rollupStatus === ts_rollup_1.RollupStatus.Running) {
            throw new Error('Rollup is running');
        }
        this.rollupStatus = ts_rollup_1.RollupStatus.Running;
        const r = await this.blockRepository.insert({
            blockHash: '',
            L1TransactionHash: '',
            verifiedAt: new Date(0),
            blockStatus: blockStatus_enum_1.BLOCK_STATUS.PROCESSING,
            operatorAddress: '',
        });
        const newBlock = r.identifiers[0];
        this.newBlockNumber = BigInt(newBlock.blockNumber || 0);
        this.addFirstRootFlow();
        return {
            blockNumber: this.newBlockNumber,
        };
    }
    async endRollup() {
        return await this.connection.transaction(async (manager) => {
            this.rollupStatus = ts_rollup_1.RollupStatus.Idle;
            const currentBlockNumber = this.newBlockNumber;
            const currentBlcok = await manager.findOneByOrFail(blockInformation_entity_1.BlockInformation, {
                blockNumber: Number(currentBlockNumber),
            });
            const perBatch = this.txNormalPerBatch;
            if (this.currentTxLogs.length !== perBatch) {
                console.log(`Rollup txNumbers=${this.currentTxLogs.length} not match txPerBatch=${perBatch}`);
                const emptyTxNum = perBatch - this.currentTxLogs.length;
                for (let i = 0; i < emptyTxNum; i++) {
                    await this.doTransaction(ts_types_1.TxNoop);
                }
            }
            const circuitInputs = (0, ts_tx_helper_1.txsToRollupCircuitInput)(this.currentTxLogs);
            circuitInputs['o_chunks'] = circuitInputs['o_chunks'].flat();
            const o_chunk_remains = this.config.numOfChunks - circuitInputs['o_chunks'].length;
            circuitInputs['isCriticalChunk'] = circuitInputs['isCriticalChunk'].flat();
            (0, assert_1.default)(circuitInputs['isCriticalChunk'].length === circuitInputs['o_chunks'].length, `isCriticalChunk=${circuitInputs['isCriticalChunk'].length} length not match o_chunks=${circuitInputs['o_chunks'].length} `);
            for (let index = 0; index < o_chunk_remains; index++) {
                circuitInputs['o_chunks'].push('0');
                circuitInputs['isCriticalChunk'].push('0');
            }
            (0, assert_1.default)(circuitInputs['o_chunks'].length === this.config.numOfChunks, `o_chunks=${circuitInputs['o_chunks'].length} length not match numOfChunks=${this.config.numOfChunks} `);
            (0, assert_1.default)(circuitInputs['isCriticalChunk'].length === this.config.numOfChunks, `isCriticalChunk=${circuitInputs['isCriticalChunk'].length} length not match numOfChunks=${this.config.numOfChunks} `);
            circuitInputs['r_accountLeafId'] = circuitInputs['r_accountLeafId'][0];
            circuitInputs['r_oriAccountLeaf'] = circuitInputs['r_oriAccountLeaf'][0];
            circuitInputs['r_newAccountLeaf'] = circuitInputs['r_newAccountLeaf'][0];
            circuitInputs['r_accountRootFlow'] = circuitInputs['r_accountRootFlow'][0];
            circuitInputs['r_accountMkPrf'] = circuitInputs['r_accountMkPrf'][0];
            circuitInputs['r_tokenLeafId'] = circuitInputs['r_tokenLeafId'][0];
            circuitInputs['r_oriTokenLeaf'] = circuitInputs['r_oriTokenLeaf'][0];
            circuitInputs['r_newTokenLeaf'] = circuitInputs['r_newTokenLeaf'][0];
            circuitInputs['r_tokenRootFlow'] = circuitInputs['r_tokenRootFlow'][0];
            circuitInputs['r_tokenMkPrf'] = circuitInputs['r_tokenMkPrf'][0];
            circuitInputs['r_orderLeafId'] = circuitInputs['r_orderLeafId'][0];
            circuitInputs['r_oriOrderLeaf'] = circuitInputs['r_oriOrderLeaf'][0];
            circuitInputs['r_newOrderLeaf'] = circuitInputs['r_newOrderLeaf'][0];
            circuitInputs['r_orderRootFlow'] = circuitInputs['r_orderRootFlow'][0];
            circuitInputs['r_orderMkPrf'] = circuitInputs['r_orderMkPrf'][0];
            circuitInputs['oriTxNum'] = this.oriTxId.toString();
            circuitInputs['accountRootFlow'] = this.currentAccountRootFlow.map((x) => (0, helper_1.recursiveToString)(x));
            circuitInputs['orderRootFlow'] = this.currentOrderRootFlow.map((x) => (0, helper_1.recursiveToString)(x));
            this.oriTxId = this.latestTxId;
            this.flushBlock(currentBlockNumber);
            currentBlcok.blockStatus = blockStatus_enum_1.BLOCK_STATUS.L2EXECUTED;
            currentBlcok.rawData = JSON.stringify(circuitInputs);
            await manager.save(currentBlcok);
            return {
                inputs: circuitInputs,
            };
        });
    }
    prepareTxAccountPayload() {
        return {
            r_accountLeafId: [],
            r_oriAccountLeaf: [],
            r_newAccountLeaf: [],
            r_accountRootFlow: [],
            r_accountMkPrf: [],
            r_tokenLeafId: [],
            r_oriTokenLeaf: [],
            r_newTokenLeaf: [],
            r_tokenRootFlow: [],
            r_tokenMkPrf: [],
        };
    }
    prepareTxOrderPayload() {
        return {
            r_orderLeafId: [],
            r_oriOrderLeaf: [],
            r_newOrderLeaf: [],
            r_orderRootFlow: [],
            r_orderMkPrf: [],
        };
    }
    async tokenBeforeUpdate(accountLeafId, tokenAddr) {
        const account = this.getAccount(accountLeafId);
        if (this.currentAccountPayload.r_tokenLeafId[this.currentAccountPayload.r_tokenLeafId.length - 1]?.length === 1) {
            this.currentAccountPayload.r_tokenLeafId[this.currentAccountPayload.r_tokenLeafId.length - 1].push(tokenAddr);
        }
        else {
            this.currentAccountPayload.r_tokenLeafId.push([tokenAddr]);
        }
        if (!account) {
            const mkp = await this.tsTokenTreeService.getMerklerProofByAccountId('0', '0');
            this.currentAccountPayload.r_tokenRootFlow.push([this.tsTokenTreeService.getDefaultRoot()]);
            this.currentAccountPayload.r_oriTokenLeaf.push((0, mkAccount_helper_1.getDefaultTokenLeafMessage)());
            this.currentAccountPayload.r_tokenMkPrf.push(mkp);
        }
        else {
            const tokenInfo = await this.tsTokenTreeService.getLeaf(tokenAddr, accountLeafId.toString());
            const tokenRoot = await this.tsTokenTreeService.getRoot(accountLeafId.toString());
            const mkPrf = await this.tsTokenTreeService.getMerklerProofByAccountId(tokenAddr, accountLeafId.toString());
            this.currentAccountPayload.r_tokenRootFlow.push([tokenRoot.hash]);
            this.currentAccountPayload.r_oriTokenLeaf.push(tokenInfo.encode());
            this.currentAccountPayload.r_tokenMkPrf.push(mkPrf);
        }
    }
    async tokenAfterUpdate(accountLeafId, tokenAddr) {
        const account = this.getAccount(accountLeafId);
        if (!account) {
            throw new Error('accountAfterUpdate: account not found');
        }
        const tokenInfo = await this.tsTokenTreeService.getLeaf(tokenAddr, accountLeafId.toString());
        const tokenRoot = await this.tsTokenTreeService.getRoot(accountLeafId.toString());
        const idx = this.currentAccountPayload.r_tokenRootFlow.length - 1;
        this.currentAccountPayload.r_newTokenLeaf.push(tokenInfo.encode());
        this.currentAccountPayload.r_tokenRootFlow[idx].push(tokenRoot.hash);
    }
    async accountBeforeUpdate(accountLeafId) {
        const account = await this.getAccount(accountLeafId);
        if (this.currentAccountPayload.r_accountLeafId[this.currentAccountPayload.r_accountLeafId.length - 1]?.length === 1) {
            this.currentAccountPayload.r_accountLeafId[this.currentAccountPayload.r_accountLeafId.length - 1].push(accountLeafId);
        }
        else {
            this.currentAccountPayload.r_accountLeafId.push([accountLeafId]);
        }
        if (!account) {
            const mkp = await this.tsAccountTreeService.getMerklerProof('0');
            const root = await this.tsAccountTreeService.getRoot();
            const tokenRoot = await this.tsTokenTreeService.getRoot(accountLeafId.toString());
            const leaf = (0, mkAccount_helper_1.getDefaultAccountLeafMessage)(tokenRoot.hash);
            this.currentAccountPayload.r_oriAccountLeaf.push(leaf);
            this.currentAccountPayload.r_accountRootFlow.push([root.hash]);
            this.currentAccountPayload.r_accountMkPrf.push(mkp);
        }
        else {
            const mkp = await this.tsAccountTreeService.getMerklerProof(accountLeafId);
            const leaf = await this.tsAccountTreeService.getLeaf(accountLeafId);
            const root = await this.tsAccountTreeService.getRoot();
            this.currentAccountPayload.r_oriAccountLeaf.push(leaf.encode());
            this.currentAccountPayload.r_accountRootFlow.push([root]);
            this.currentAccountPayload.r_accountMkPrf.push(mkp);
        }
    }
    async accountAfterUpdate(accountLeafId) {
        const account = await this.getAccount(accountLeafId);
        if (!account) {
            throw new Error('accountAfterUpdate: account not found');
        }
        const idx = this.currentAccountPayload.r_accountRootFlow.length - 1;
        const root = await this.tsAccountTreeService.getRoot();
        this.currentAccountPayload.r_newAccountLeaf.push(account.encode());
        this.currentAccountPayload.r_accountRootFlow[idx].push(root);
    }
    async accountAndTokenBeforeUpdate(accountLeafId, tokenAddr) {
        const account = this.getAccount(accountLeafId);
        if (this.currentAccountPayload.r_accountLeafId[this.currentAccountPayload.r_accountLeafId.length - 1]?.length === 1) {
            this.currentAccountPayload.r_accountLeafId[this.currentAccountPayload.r_accountLeafId.length - 1].push(accountLeafId);
        }
        else {
            this.currentAccountPayload.r_accountLeafId.push([accountLeafId]);
        }
        if (this.currentAccountPayload.r_tokenLeafId[this.currentAccountPayload.r_tokenLeafId.length - 1]?.length === 1) {
            this.currentAccountPayload.r_tokenLeafId[this.currentAccountPayload.r_tokenLeafId.length - 1].push(tokenAddr);
        }
        else {
            this.currentAccountPayload.r_tokenLeafId.push([tokenAddr]);
        }
        const root = await this.tsAccountTreeService.getRoot();
        this.currentAccountPayload.r_accountRootFlow.push([root]);
        if (!account) {
            const tokenRoot = await this.tsTokenTreeService.getRoot(accountLeafId.toString());
            const leaf = (0, mkAccount_helper_1.getDefaultAccountLeafMessage)(tokenRoot.hash);
            const AccountMkp = await this.tsAccountTreeService.getMerklerProof('0');
            const tokenMkp = await this.tsTokenTreeService.getMerklerProofByAccountId('0', '0');
            this.currentAccountPayload.r_oriAccountLeaf.push(leaf);
            this.currentAccountPayload.r_accountMkPrf.push(AccountMkp);
            this.currentAccountPayload.r_tokenRootFlow.push([this.tsTokenTreeService.getDefaultRoot()]);
            this.currentAccountPayload.r_oriTokenLeaf.push((0, mkAccount_helper_1.getDefaultTokenLeafMessage)());
            this.currentAccountPayload.r_tokenMkPrf.push(tokenMkp);
        }
        else {
            const accountMkp = await this.tsAccountTreeService.getMerklerProof(accountLeafId);
            const accountLeaf = await this.tsAccountTreeService.getLeaf(accountLeafId);
            const tokenInfo = await this.tsTokenTreeService.getLeaf((tokenAddr), accountLeafId.toString());
            const tokenRoot = await this.tsTokenTreeService.getRoot(accountLeafId.toString());
            const tokenMkPr = await this.tsTokenTreeService.getMerklerProofByAccountId((tokenAddr), accountLeafId.toString());
            this.currentAccountPayload.r_oriAccountLeaf.push(accountLeaf.encode());
            this.currentAccountPayload.r_accountMkPrf.push(accountMkp);
            this.currentAccountPayload.r_tokenRootFlow.push([tokenRoot.hash]);
            this.currentAccountPayload.r_oriTokenLeaf.push(tokenInfo.encode());
            this.currentAccountPayload.r_tokenMkPrf.push(tokenMkPr);
        }
    }
    async accountAndTokenAfterUpdate(accountLeafId, tokenAddr) {
        const account = this.getAccount(accountLeafId);
        if (!account) {
            throw new Error('accountAfterUpdate: account not found');
        }
        const tokenInfo = await this.tsTokenTreeService.getLeaf((tokenAddr), accountLeafId.toString());
        const tokenRoot = await this.tsTokenTreeService.getRoot(accountLeafId.toString());
        const accountRoot = await this.tsAccountTreeService.getRoot();
        const accountLeaf = await this.tsAccountTreeService.getLeaf(accountLeafId);
        const idx = this.currentAccountPayload.r_accountRootFlow.length - 1;
        this.currentAccountPayload.r_newAccountLeaf.push(accountLeaf.encode());
        this.currentAccountPayload.r_accountRootFlow[idx].push(accountRoot);
        this.currentAccountPayload.r_newTokenLeaf.push(tokenInfo.encode());
        this.currentAccountPayload.r_tokenRootFlow[idx].push(tokenRoot.hash);
    }
    async orderBeforeUpdate(orderLeafId) {
        const order = await this.getObsOrder(orderLeafId);
        this.currentOrderPayload.r_orderLeafId.push([orderLeafId.toString()]);
        const root = await this.obsOrderTreeService.getRoot();
        const orderMkp = await this.obsOrderTreeService.getMerklerProof(orderLeafId);
        if (order) {
            this.currentOrderPayload.r_oriOrderLeaf.push(order.encode());
            this.currentOrderPayload.r_orderRootFlow.push([root.hash]);
            this.currentOrderPayload.r_orderMkPrf.push(orderMkp);
        }
        else {
            const defaultOrderLeafMessage = (0, mkAccount_helper_1.getDefaultObsOrderLeafMessage)();
            this.currentOrderPayload.r_oriOrderLeaf.push(defaultOrderLeafMessage);
            this.currentOrderPayload.r_orderRootFlow.push([root.hash]);
            this.currentOrderPayload.r_orderMkPrf.push(orderMkp);
        }
    }
    async orderAfterUpdate(orderLeafId) {
        const order = await this.getObsOrder(orderLeafId);
        const root = await this.obsOrderTreeService.getRoot();
        this.currentOrderPayload.r_orderRootFlow[this.currentOrderPayload.r_orderRootFlow.length - 1].push(root.hash);
        if (order) {
            this.currentOrderPayload.r_newOrderLeaf.push(order.encode());
        }
        else {
            const defaultOrderLeafMessage = (0, mkAccount_helper_1.getDefaultObsOrderLeafMessage)();
            this.currentOrderPayload.r_newOrderLeaf.push(defaultOrderLeafMessage);
        }
    }
    addObsOrder(order) {
        this.obsOrderRepository.update({
            txId: Number(order.txId),
        }, {
            orderLeafId: Number(order.orderLeafId),
        });
        this.obsOrderTreeService.updateLeaf(order.orderLeafId, order);
        this.obsOrderTreeService.addCurrentOrderId();
    }
    async removeObsOrder(leafId) {
        const order = await this.getObsOrder(leafId);
        if (!order) {
            throw new Error('removeObsOrder: order not found');
        }
        if (order.reqType === ts_types_1.TsTxType.UNKNOWN) {
            throw new Error('removeObsOrder: order not found (0)');
        }
        this.obsOrderTreeService.updateLeaf(order.orderLeafId, {
            orderLeafId: order.orderLeafId,
            txId: '0',
            reqType: '0',
            sender: '0',
            sellTokenId: '0',
            nonce: '0',
            sellAmt: '0',
            buyTokenId: '0',
            buyAmt: '0',
            accumulatedSellAmt: '0',
            accumulatedBuyAmt: '0',
        });
    }
    updateObsOrder(order) {
        (0, assert_1.default)(BigInt(order.orderLeafId) > 0n, 'updateObsOrder: orderLeafId should be exist');
        this.obsOrderTreeService.updateLeaf(order.orderLeafId, order);
    }
    getTxChunks(txEntity, metadata) {
        const { r_chunks, o_chunks, isCritical } = (0, ts_tx_helper_1.encodeRChunkBuffer)(txEntity, metadata);
        const r_chunks_bigint = (0, ts_tx_helper_1.bigint_to_chunk_array)(BigInt('0x' + r_chunks.toString('hex')), BigInt(ts_types_1.CHUNK_BITS_SIZE));
        const o_chunks_bigint = (0, ts_tx_helper_1.bigint_to_chunk_array)(BigInt('0x' + o_chunks.toString('hex')), BigInt(ts_types_1.CHUNK_BITS_SIZE));
        const isCriticalChunk = o_chunks_bigint.map((_) => '0');
        if (isCritical) {
            isCriticalChunk[0] = '1';
        }
        return { r_chunks_bigint, o_chunks_bigint, isCriticalChunk };
    }
    async getTsPubKey(accountId) {
        const tsPubKey = await this.accountInfoRepository.findOneOrFail({
            select: ['tsPubKeyX', 'tsPubKeyY'],
            where: {
                accountId: accountId,
            },
        });
        return [tsPubKey.tsPubKeyX, tsPubKey.tsPubKeyY];
    }
    async doTransaction(req) {
        try {
            console.time(`doTransaction txid=${req.txId}, reqType=${req.reqType}`);
            console.log({
                req,
                accountId: req.accountId,
                tpye: typeof req.accountId,
            });
            if (this.rollupStatus !== ts_rollup_1.RollupStatus.Running) {
                await this.startRollup();
            }
            let inputs;
            const reqType = req.reqType;
            switch (reqType) {
                case ts_types_1.TsTxType.REGISTER:
                    inputs = await this.doRegister(req);
                    break;
                case ts_types_1.TsTxType.DEPOSIT:
                    inputs = await this.doDeposit(req);
                    break;
                case ts_types_1.TsTxType.WITHDRAW:
                    inputs = await this.doWithdraw(req);
                    break;
                case ts_types_1.TsTxType.SecondLimitOrder:
                    inputs = await this.doSecondLimitOrder(req);
                    break;
                case ts_types_1.TsTxType.SecondLimitStart:
                    inputs = await this.doSecondLimitStart(req);
                    break;
                case ts_types_1.TsTxType.SecondLimitExchange:
                    inputs = await this.doSecondLimitExchange(req);
                    break;
                case ts_types_1.TsTxType.SecondLimitEnd:
                    inputs = await this.doSecondLimitEnd(req);
                    break;
                case ts_types_1.TsTxType.NOOP:
                    inputs = await this.doNoop();
                    break;
                case ts_types_1.TsTxType.UNKNOWN:
                default:
                    throw new Error(`Unknown request type reqType=${req.reqType}`);
            }
            this.addAccountRootFlow();
            this.addOrderRootFlow();
            const remains = this.txNormalPerBatch - this.currentTxLogs.length;
            if (remains < 3) {
                await this.endRollup();
            }
            console.time(`doTransaction txid=${req.txId}, reqType=${req.reqType}`);
            return inputs;
        }
        catch (error) {
            console.error('-----------------------');
            console.error(error);
            console.error('-----------------------');
            throw error;
        }
    }
    async doSecondLimitOrder(req) {
        const accountLeafId = (req.accountId);
        const reqData = [
            BigInt(ts_types_1.TsTxType.SecondLimitOrder),
            BigInt(req.accountId),
            BigInt(req.tokenAddr),
            BigInt(req.amount),
            BigInt(req.nonce),
            0n,
            0n,
            BigInt(req.arg2),
            BigInt(req.arg3),
            0n,
        ];
        const from = await this.getAccount(accountLeafId);
        if (!from) {
            throw new Error(`account not found L2Addr=${from}`);
        }
        const newNonce = BigInt(from.nonce) + 1n;
        const tokenAddr = req.tokenAddr;
        await this.accountAndTokenBeforeUpdate(accountLeafId, tokenAddr);
        await this.updateAccountToken(accountLeafId, tokenAddr, -BigInt(req.amount), BigInt(req.amount));
        await this.updateAccountNonce(accountLeafId, newNonce);
        await this.accountAndTokenAfterUpdate(accountLeafId, tokenAddr);
        await this.accountAndTokenBeforeUpdate(accountLeafId, tokenAddr);
        await this.accountAndTokenAfterUpdate(accountLeafId, tokenAddr);
        const orderLeafId = this.obsOrderTreeService.currentOrderId.toString();
        const txId = this.latestTxId;
        const order = {
            orderLeafId,
            txId: txId.toString(),
            reqType: req.reqType.toString(),
            sender: accountLeafId,
            sellTokenId: req.tokenAddr,
            sellAmt: req.amount,
            nonce: req.nonce,
            buyTokenId: req.arg2,
            buyAmt: req.arg3,
            accumulatedSellAmt: '0',
            accumulatedBuyAmt: '0'
        };
        console.log({
            doSecondLimitOrder: order,
        });
        await this.orderBeforeUpdate(orderLeafId);
        this.addObsOrder(order);
        await this.orderAfterUpdate(orderLeafId);
        const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req);
        const tsPubKey = await this.getTsPubKey(accountLeafId);
        const tx = {
            reqData,
            tsPubKey,
            sigR: req.eddsaSig.R8,
            sigS: req.eddsaSig.S,
            r_chunks: r_chunks_bigint,
            o_chunks: o_chunks_bigint,
            isCriticalChunk,
            ...this.currentAccountPayload,
            ...this.currentOrderPayload,
        };
        this.addTxLogs(tx);
        return tx;
    }
    currentHoldTakerOrder = null;
    async doSecondLimitStart(req) {
        const reqData = [BigInt(ts_types_1.TsTxType.SecondLimitStart), 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, BigInt(req.arg4)];
        const orderLeafId = req.arg4;
        const order = await this.getObsOrder(orderLeafId);
        if (!order) {
            throw new Error(`doCancelOrder: order not found orderLeafId=${orderLeafId}`);
        }
        if (order.sender === '0') {
            throw new Error(`doCancelOrder: order not found orderLeafId=${orderLeafId} (order.sender=0)`);
        }
        this.currentHoldTakerOrder = order;
        const from = await this.getAccount(order.sender);
        if (!from) {
            throw new Error(`account not found L2Addr=${from}`);
        }
        const sellTokenId = order.sellTokenId.toString();
        await this.accountAndTokenBeforeUpdate(order.sender, sellTokenId);
        await this.accountAndTokenAfterUpdate(order.sender, sellTokenId);
        await this.accountAndTokenBeforeUpdate(order.sender, sellTokenId);
        await this.accountAndTokenAfterUpdate(order.sender, sellTokenId);
        await this.orderBeforeUpdate(orderLeafId);
        this.removeObsOrder(orderLeafId);
        await this.orderAfterUpdate(orderLeafId);
        const txId = this.latestTxId;
        const orderTxId = BigInt(order.txId?.toString() || '0');
        const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req, {
            txOffset: txId - orderTxId,
            makerBuyAmt: 0n,
        });
        const tsPubKey = await this.getTsPubKey(req.accountId);
        const tx = {
            reqData,
            tsPubKey,
            sigR: ['0', '0'],
            sigS: '0',
            r_chunks: r_chunks_bigint,
            o_chunks: o_chunks_bigint,
            isCriticalChunk,
            ...this.currentAccountPayload,
            ...this.currentOrderPayload,
        };
        this.addTxLogs(tx);
        return tx;
    }
    async doSecondLimitExchange(req) {
        const reqData = [BigInt(ts_types_1.TsTxType.SecondLimitExchange), 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, BigInt(req.arg4)];
        const orderLeafId = req.arg4;
        const makerOrder = await this.getObsOrder(req.arg4);
        if (!makerOrder) {
            throw new Error(`doCancelOrder: order not found orderLeafId=${orderLeafId}`);
        }
        if (makerOrder.sender === '0') {
            throw new Error(`doCancelOrder: order not found orderLeafId=${orderLeafId} (order.sender=0)`);
        }
        const makerAcc = await this.getAccount(makerOrder.sender);
        if (!makerAcc) {
            throw new Error(`account not found L2Addr=${makerOrder.sender}`);
        }
        const sellTokenId = makerOrder.sellTokenId.toString();
        const buyTokenId = makerOrder.buyTokenId.toString();
        const accumulatedBuyAmt = BigInt(req.accumulatedBuyAmt);
        const accumulatedSellAmt = BigInt(req.accumulatedSellAmt);
        this.accountBeforeUpdate(makerOrder.sender);
        this.tokenBeforeUpdate(makerOrder.sender, buyTokenId);
        await this.updateAccountToken(makerAcc.leafId, buyTokenId, accumulatedBuyAmt, 0n);
        this.tokenAfterUpdate(makerOrder.sender, buyTokenId);
        this.tokenBeforeUpdate(makerOrder.sender, sellTokenId);
        await this.updateAccountToken(makerAcc.leafId, sellTokenId, 0n, -accumulatedSellAmt);
        this.tokenAfterUpdate(makerOrder.sender, sellTokenId);
        this.accountAfterUpdate(makerOrder.sender);
        this.accountBeforeUpdate(makerOrder.sender);
        this.accountAfterUpdate(makerOrder.sender);
        await this.orderBeforeUpdate(orderLeafId);
        makerOrder.accumulatedSellAmt = (BigInt(makerOrder.accumulatedSellAmt) + accumulatedSellAmt).toString();
        makerOrder.accumulatedBuyAmt = (BigInt(makerOrder.accumulatedBuyAmt) + accumulatedBuyAmt).toString();
        const isAllSellAmtMatched = makerOrder.accumulatedSellAmt === makerOrder.sellAmt;
        if (isAllSellAmtMatched) {
            this.removeObsOrder(orderLeafId);
        }
        else {
            this.updateObsOrder(makerOrder.convertToObsOrderDto());
        }
        await this.orderAfterUpdate(orderLeafId);
        const txId = this.latestTxId;
        const orderTxId = BigInt(makerOrder.txId?.toString() || '0');
        const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req, {
            txOffset: txId - orderTxId,
            makerBuyAmt: BigInt(makerOrder.buyAmt),
        });
        const tsPubKey = await this.getTsPubKey(makerAcc.leafId);
        const tx = {
            reqData,
            tsPubKey,
            sigR: ['0', '0'],
            sigS: '0',
            r_chunks: r_chunks_bigint,
            o_chunks: o_chunks_bigint,
            isCriticalChunk,
            ...this.currentAccountPayload,
            ...this.currentOrderPayload,
        };
        this.addTxLogs(tx);
        return tx;
    }
    async doSecondLimitEnd(req) {
        (0, assert_1.default)(!!this.currentHoldTakerOrder, 'doSecondLimitEnd: currentHoldTakerOrder is null');
        const reqData = [BigInt(ts_types_1.TsTxType.SecondLimitEnd), 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, BigInt(req.arg4)];
        const orderLeafId = req.arg4;
        (0, assert_1.default)(orderLeafId === this.currentHoldTakerOrder.orderLeafId, 'doSecondLimitEnd: orderLeafId not match');
        const takerOrder = this.currentHoldTakerOrder;
        if (!takerOrder) {
            throw new Error(`doSecondLimitEnd: order not found orderLeafId=${orderLeafId}`);
        }
        if (takerOrder.sender === '0') {
            throw new Error(`doSecondLimitEnd: order not found orderLeafId=${orderLeafId} (order.sender=0)`);
        }
        const takerAcc = await this.getAccount(takerOrder.sender);
        if (!takerAcc) {
            throw new Error(`account not found L2Addr=${takerOrder.sender}`);
        }
        const sellTokenId = takerOrder.sellTokenId.toString();
        const buyTokenId = takerOrder.buyTokenId.toString();
        const accumulatedBuyAmt = BigInt(req.accumulatedBuyAmt);
        const accumulatedSellAmt = BigInt(req.accumulatedSellAmt);
        this.accountBeforeUpdate(takerOrder.sender);
        this.tokenBeforeUpdate(takerOrder.sender, buyTokenId);
        await this.updateAccountToken(takerAcc.leafId, buyTokenId, accumulatedBuyAmt, 0n);
        this.tokenAfterUpdate(takerOrder.sender, buyTokenId);
        this.tokenBeforeUpdate(takerOrder.sender, sellTokenId);
        await this.updateAccountToken(takerAcc.leafId, sellTokenId, 0n, -accumulatedSellAmt);
        this.tokenAfterUpdate(takerOrder.sender, sellTokenId);
        this.accountAfterUpdate(takerOrder.sender);
        this.accountBeforeUpdate(takerOrder.sender);
        this.accountAfterUpdate(takerOrder.sender);
        await this.orderBeforeUpdate(orderLeafId);
        takerOrder.accumulatedSellAmt = (BigInt(takerOrder.accumulatedSellAmt) + accumulatedSellAmt).toString();
        takerOrder.accumulatedBuyAmt = (BigInt(takerOrder.accumulatedBuyAmt) + accumulatedBuyAmt).toString();
        const isAllSellAmtMatched = takerOrder.accumulatedSellAmt === takerOrder.sellAmt;
        if (isAllSellAmtMatched) {
            this.removeObsOrder(orderLeafId);
        }
        else {
            this.updateObsOrder(takerOrder.convertToObsOrderDto());
        }
        await this.orderAfterUpdate(orderLeafId);
        const txId = this.latestTxId;
        const orderTxId = BigInt(takerOrder.txId?.toString() || '0');
        const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req, {
            txOffset: txId - orderTxId,
            makerBuyAmt: 0n,
        });
        this.currentHoldTakerOrder = null;
        const tsPubKey = await this.getTsPubKey(takerAcc.leafId);
        const tx = {
            reqData,
            tsPubKey,
            sigR: ['0', '0'],
            sigS: '0',
            r_chunks: r_chunks_bigint,
            o_chunks: o_chunks_bigint,
            isCriticalChunk,
            ...this.currentAccountPayload,
            ...this.currentOrderPayload,
        };
        this.addTxLogs(tx);
        return tx;
    }
    async doCancelOrder(req) {
        const orderLeafId = req.arg4;
        const reqData = [BigInt(ts_types_1.TsTxType.CancelOrder), 0n, 0n, 0n, 0n, BigInt(req.arg0), BigInt(orderLeafId), 0n, 0n, 0n];
        const order = await this.getObsOrder(orderLeafId);
        if (!order) {
            throw new Error(`doCancelOrder: order not found orderLeafId=${orderLeafId}`);
        }
        if (order.sender === '0') {
            throw new Error(`doCancelOrder: order not found orderLeafId=${orderLeafId} (order.sender=0)`);
        }
        const account = await this.getAccount(order.sender);
        if (!account) {
            throw new Error(`doCancelOrder: account not found L2Addr=${order.sender}`);
        }
        if (req.arg0 !== account.leafId) {
            throw new Error(`doCancelOrder: account not match L2Addr=${order.sender} req.arg0=${req.arg0}`);
        }
        const refundTokenAddr = order.sellTokenId.toString();
        const refundAmount = BigInt(order.sellAmt) - BigInt(order.accumulatedSellAmt);
        await this.accountAndTokenBeforeUpdate(account.leafId, refundTokenAddr);
        await this.updateAccountToken(account.leafId, refundTokenAddr, BigInt(refundAmount), -BigInt(refundAmount));
        await this.accountAndTokenAfterUpdate(account.leafId, refundTokenAddr);
        await this.accountAndTokenBeforeUpdate(account.leafId, refundTokenAddr);
        await this.accountAndTokenAfterUpdate(account.leafId, refundTokenAddr);
        await this.orderBeforeUpdate(order.orderLeafId);
        this.removeObsOrder(order.orderLeafId);
        await this.orderAfterUpdate(order.orderLeafId);
        const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req);
        const tsPubKey = await this.getTsPubKey(account.leafId);
        const tx = {
            reqData,
            tsPubKey,
            sigR: req.eddsaSig.R8,
            sigS: req.eddsaSig.S,
            r_chunks: r_chunks_bigint,
            o_chunks: o_chunks_bigint,
            isCriticalChunk,
            ...this.currentAccountPayload,
            ...this.currentOrderPayload,
        };
        this.addTxLogs(tx);
        return tx;
    }
    async doNoop() {
        const orderLeafId = '0';
        const account = await this.getAccount('0');
        if (!account) {
            throw new Error('doNoop: account not found');
        }
        await this.accountAndTokenBeforeUpdate('0', ts_types_1.TsTokenAddress.Unknown);
        await this.accountAndTokenAfterUpdate('0', ts_types_1.TsTokenAddress.Unknown);
        await this.accountAndTokenBeforeUpdate('0', ts_types_1.TsTokenAddress.Unknown);
        await this.accountAndTokenAfterUpdate('0', ts_types_1.TsTokenAddress.Unknown);
        await this.orderBeforeUpdate(orderLeafId);
        await this.orderAfterUpdate(orderLeafId);
        const tx = {
            reqData: [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n],
            tsPubKey: ['0', '0'],
            sigR: [0n, 0n],
            sigS: 0n,
            r_chunks: new Array(ts_types_1.MAX_CHUNKS_PER_REQ).fill(0n),
            o_chunks: [ts_types_1.TsTxType.UNKNOWN],
            isCriticalChunk: [ts_types_1.TsTxType.UNKNOWN],
            ...this.currentAccountPayload,
            ...this.currentOrderPayload,
        };
        this.addTxLogs(tx);
        return tx;
    }
    async doDeposit(req) {
        const accountLeafId = req.arg0;
        const depositL2Addr = BigInt(req.arg0);
        const reqData = [
            BigInt(ts_types_1.TsTxType.DEPOSIT),
            BigInt(ts_types_1.TsSystemAccountAddress.MINT_ADDR),
            BigInt(req.tokenId),
            BigInt(req.amount),
            BigInt(req.nonce),
            depositL2Addr,
            0n,
            0n,
            0n,
            0n,
        ];
        const orderLeafId = '0';
        const depositAccount = this.getAccount(req.arg0);
        if (!depositAccount) {
            throw new Error(`Deposit account not found L2Addr=${depositL2Addr}`);
        }
        const tokenId = req.tokenId.toString();
        await this.accountAndTokenBeforeUpdate(accountLeafId, tokenId);
        await this.orderBeforeUpdate(orderLeafId);
        await this.updateAccountToken(accountLeafId, tokenId, BigInt(req.amount), 0n);
        await this.accountAndTokenAfterUpdate(accountLeafId, tokenId);
        await this.orderAfterUpdate(orderLeafId);
        await this.accountAndTokenBeforeUpdate(accountLeafId, tokenId);
        await this.accountAndTokenAfterUpdate(accountLeafId, tokenId);
        const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req);
        const tx = {
            reqData,
            sigR: ['0', '0'],
            sigS: '0',
            r_chunks: r_chunks_bigint,
            o_chunks: o_chunks_bigint,
            isCriticalChunk,
            ...this.currentAccountPayload,
            ...this.currentOrderPayload,
        };
        this.addTxLogs(tx);
        return tx;
    }
    async doRegister(req) {
        const registerL2Addr = BigInt(req.arg0);
        const accountLeafId = registerL2Addr.toString();
        const registerTokenId = req.tokenAddr;
        const t = {
            [req.tokenAddr]: {
                amount: BigInt(req.amount),
                lockAmt: 0n,
            },
        };
        const tokenInfos = req.tokenAddr !== ts_types_1.TsTokenAddress.Unknown && Number(req.amount) > 0 ? t : {};
        const accountInfo = await this.accountInfoRepository.findOneOrFail({
            where: {
                accountId: registerL2Addr.toString(),
            }
        });
        const hashedTsPubKey = accountInfo.hashedTsPubKey;
        const registerAccount = this.accountLeafNodeRepository.create();
        registerAccount.leafId = registerL2Addr.toString();
        registerAccount.tsAddr = hashedTsPubKey.toString();
        const orderLeafId = '0';
        const reqData = [
            BigInt(ts_types_1.TsTxType.REGISTER),
            BigInt(ts_types_1.TsSystemAccountAddress.MINT_ADDR),
            BigInt(req.tokenId),
            BigInt(req.amount),
            BigInt(0),
            registerL2Addr,
            hashedTsPubKey,
            0n,
            0n,
            0n,
        ];
        await this.accountAndTokenBeforeUpdate(accountLeafId, registerTokenId);
        this.addAccount(registerL2Addr, {
            l2Addr: registerL2Addr,
            tsAddr: hashedTsPubKey,
        });
        await this.accountAndTokenAfterUpdate(accountLeafId, registerTokenId);
        await this.accountAndTokenBeforeUpdate(accountLeafId, registerTokenId);
        await this.accountAndTokenAfterUpdate(accountLeafId, registerTokenId);
        await this.orderBeforeUpdate(orderLeafId);
        await this.orderAfterUpdate(orderLeafId);
        const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req);
        const tx = {
            reqData,
            tsPubKey: [accountInfo.tsPubKeyX, accountInfo.tsPubKeyY],
            sigR: ['0', '0'],
            sigS: '0',
            r_chunks: r_chunks_bigint,
            o_chunks: o_chunks_bigint,
            isCriticalChunk,
            ...this.currentAccountPayload,
            ...this.currentOrderPayload,
        };
        this.addTxLogs(tx);
        return tx;
    }
    async doWithdraw(req) {
        const reqData = (0, ts_rollup_helper_1.encodeRollupWithdrawMessage)(req);
        const orderLeafId = '0';
        const transferL2AddrFrom = BigInt(req.accountId);
        const accountLeafId = req.accountId;
        const from = await this.getAccount(transferL2AddrFrom.toString());
        if (!from) {
            throw new Error(`Deposit account not found L2Addr=${from}`);
        }
        const newNonce = BigInt(from.nonce) + 1n;
        await this.accountAndTokenBeforeUpdate(accountLeafId, req.tokenAddr);
        await this.updateAccountToken(from.leafId, req.tokenAddr, -BigInt(req.amount), 0n);
        await this.updateAccountNonce(from.leafId, newNonce);
        await this.accountAndTokenAfterUpdate(accountLeafId, req.tokenAddr);
        await this.accountAndTokenBeforeUpdate(accountLeafId, req.tokenAddr);
        await this.accountAndTokenAfterUpdate(accountLeafId, req.tokenAddr);
        await this.orderBeforeUpdate(orderLeafId);
        await this.orderAfterUpdate(orderLeafId);
        const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req);
        const tsPubKey = await this.getTsPubKey(accountLeafId);
        const tx = {
            reqData,
            tsPubKey,
            sigR: req.eddsaSig.R8,
            sigS: req.eddsaSig.S,
            r_chunks: r_chunks_bigint,
            o_chunks: o_chunks_bigint,
            isCriticalChunk,
            ...this.currentAccountPayload,
            ...this.currentOrderPayload,
        };
        this.addTxLogs(tx);
        return tx;
    }
};
__decorate([
    (0, nest_bullmq_1.BullWorkerProcess)({
        autorun: true,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_l = typeof bullmq_1.Job !== "undefined" && bullmq_1.Job) === "function" ? _l : Object]),
    __metadata("design:returntype", Promise)
], SequencerConsumer.prototype, "process", null);
SequencerConsumer = __decorate([
    (0, nest_bullmq_1.BullWorker)({
        queueName: constant_1.TsWorkerName.SEQUENCER,
        options: {
            concurrency: 1,
        },
    }),
    __param(1, (0, typeorm_1.InjectRepository)(transactionInfo_entity_1.TransactionInfo)),
    __param(2, (0, typeorm_1.InjectRepository)(blockInformation_entity_1.BlockInformation)),
    __param(3, (0, typeorm_1.InjectRepository)(accountLeafNode_entity_1.AccountLeafNode)),
    __param(4, (0, typeorm_1.InjectRepository)(accountInformation_entity_1.AccountInformation)),
    __param(5, (0, typeorm_1.InjectRepository)(obsOrder_entity_1.ObsOrderEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object, typeof (_e = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _e : Object, typeof (_f = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _f : Object, typeof (_g = typeof tsAccountTree_service_1.TsAccountTreeService !== "undefined" && tsAccountTree_service_1.TsAccountTreeService) === "function" ? _g : Object, typeof (_h = typeof tsTokenTree_service_1.TsTokenTreeService !== "undefined" && tsTokenTree_service_1.TsTokenTreeService) === "function" ? _h : Object, typeof (_j = typeof obsOrderTree_service_1.ObsOrderTreeService !== "undefined" && obsOrderTree_service_1.ObsOrderTreeService) === "function" ? _j : Object, typeof (_k = typeof typeorm_2.Connection !== "undefined" && typeorm_2.Connection) === "function" ? _k : Object])
], SequencerConsumer);
exports.SequencerConsumer = SequencerConsumer;


/***/ }),
/* 83 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RollupCircuitType = exports.RollupStatus = void 0;
var RollupStatus;
(function (RollupStatus) {
    RollupStatus[RollupStatus["Unknown"] = 0] = "Unknown";
    RollupStatus[RollupStatus["Idle"] = 1] = "Idle";
    RollupStatus[RollupStatus["Running"] = 2] = "Running";
})(RollupStatus = exports.RollupStatus || (exports.RollupStatus = {}));
var RollupCircuitType;
(function (RollupCircuitType) {
    RollupCircuitType[RollupCircuitType["Unknown"] = 0] = "Unknown";
    RollupCircuitType[RollupCircuitType["Register"] = 1] = "Register";
    RollupCircuitType[RollupCircuitType["Transfer"] = 2] = "Transfer";
})(RollupCircuitType = exports.RollupCircuitType || (exports.RollupCircuitType = {}));


/***/ }),
/* 84 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.encodeRollupWithdrawMessage = void 0;
const ts_types_1 = __webpack_require__(55);
function encodeRollupWithdrawMessage(req) {
    return [BigInt(ts_types_1.TsTxType.WITHDRAW), BigInt(req.accountId), BigInt(req.tokenId), BigInt(req.amount), BigInt(req.nonce), 0n, 0n, 0n, 0n, 0n];
}
exports.encodeRollupWithdrawMessage = encodeRollupWithdrawMessage;


/***/ }),
/* 85 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.bigint_to_chunk_array = exports.bigint_to_chunk_arrayV2 = exports.toBigIntChunkArray = exports.padAndToBuffer = exports.toHexString = exports.encodeRChunkBuffer = exports.encodeTokenLeaf = exports.encodeTxCancelOrderMessage = exports.encodeTsTxMarketOrderMessage = exports.encodeTsTxLimitOrderMessage = exports.getEmptyRegisterTx = exports.encodeTxWithdrawMessage = exports.encodeTxDepositMessage = exports.txsToRollupCircuitInput = exports.exportTransferCircuitInput = void 0;
const ethers_1 = __webpack_require__(45);
const helper_1 = __webpack_require__(44);
const ts_types_1 = __webpack_require__(55);
const ts_helper_1 = __webpack_require__(43);
const bigint_helper_1 = __webpack_require__(86);
function exportTransferCircuitInput(txLogs, oriTxNum, accountRootFlow, orderRootFlow) {
    const inputs = txsToRollupCircuitInput(txLogs);
    inputs['oriTxNum'] = oriTxNum.toString();
    inputs['accountRootFlow'] = accountRootFlow.map((x) => (0, helper_1.recursiveToString)(x));
    inputs['orderRootFlow'] = orderRootFlow.map((x) => (0, helper_1.recursiveToString)(x));
    return inputs;
}
exports.exportTransferCircuitInput = exportTransferCircuitInput;
function txsToRollupCircuitInput(obj, initData = {}) {
    obj.forEach((item) => {
        (0, ts_helper_1.txToCircuitInput)(item, initData);
    });
    return initData;
}
exports.txsToRollupCircuitInput = txsToRollupCircuitInput;
function encodeTxDepositMessage(txDepositReq) {
    return [BigInt(ts_types_1.TsTxType.DEPOSIT), BigInt(txDepositReq.sender), BigInt(txDepositReq.tokenId), BigInt(txDepositReq.stateAmt), 0n, 0n, 0n, 0n, 0n, 0n];
}
exports.encodeTxDepositMessage = encodeTxDepositMessage;
function encodeTxWithdrawMessage(txTransferReq) {
    return [
        BigInt(ts_types_1.TsTxType.WITHDRAW),
        BigInt(txTransferReq.sender),
        BigInt(txTransferReq.tokenId),
        BigInt(txTransferReq.stateAmt),
        BigInt(txTransferReq.nonce),
        0n,
        0n,
        0n,
        0n,
        0n,
    ];
}
exports.encodeTxWithdrawMessage = encodeTxWithdrawMessage;
function getEmptyRegisterTx() {
    const req = {
        sender: '0',
        reqType: ts_types_1.TsTxType.REGISTER,
        tokenId: ts_types_1.TsTokenAddress.Unknown,
        tsAddr: '0',
        stateAmt: '0',
        L1Addr: '0x00',
        tsPubKey: ['0', '0'],
    };
    return req;
}
exports.getEmptyRegisterTx = getEmptyRegisterTx;
function encodeTsTxLimitOrderMessage(txLimitOrderReq) {
    return [
        BigInt(ts_types_1.TsTxType.SecondLimitOrder),
        BigInt(txLimitOrderReq.sender),
        BigInt(txLimitOrderReq.sellTokenId),
        BigInt(txLimitOrderReq.sellAmt),
        BigInt(txLimitOrderReq.nonce),
        0n,
        0n,
        BigInt(txLimitOrderReq.buyTokenId),
        BigInt(txLimitOrderReq.buyAmt),
        0n,
    ];
}
exports.encodeTsTxLimitOrderMessage = encodeTsTxLimitOrderMessage;
function encodeTsTxMarketOrderMessage(txMarketOrderReq) {
    return [
        BigInt(ts_types_1.TsTxType.SecondMarketOrder),
        BigInt(txMarketOrderReq.sender),
        BigInt(txMarketOrderReq.sellTokenId),
        BigInt(txMarketOrderReq.sellAmt),
        BigInt(txMarketOrderReq.nonce),
        0n,
        0n,
        BigInt(txMarketOrderReq.buyTokenId),
        0n,
        0n,
    ];
}
exports.encodeTsTxMarketOrderMessage = encodeTsTxMarketOrderMessage;
function encodeTxCancelOrderMessage(txCancelOrderReq) {
    return [
        BigInt(ts_types_1.TsTxType.CancelOrder),
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        BigInt(txCancelOrderReq.orderLeafId),
    ];
}
exports.encodeTxCancelOrderMessage = encodeTxCancelOrderMessage;
function encodeTokenLeaf(token) {
    return [BigInt(token.amount), BigInt(token.lockAmt)];
}
exports.encodeTokenLeaf = encodeTokenLeaf;
function encodeRChunkBuffer(txTransferReq, metadata) {
    const reqType = txTransferReq.reqType;
    switch (reqType) {
        case ts_types_1.TsTxType.REGISTER:
            if (!txTransferReq.arg0) {
                throw new Error('arg0 is required');
            }
            if (!txTransferReq.arg1) {
                throw new Error('hashedTsPubKey is required');
            }
            const out_r = ethers_1.ethers.utils
                .solidityPack(['uint8', 'uint32', 'uint16', 'uint128', 'uint160'], [
                ethers_1.BigNumber.from(txTransferReq.reqType),
                ethers_1.BigNumber.from(txTransferReq.arg0),
                ethers_1.BigNumber.from(txTransferReq.tokenId),
                ethers_1.BigNumber.from(txTransferReq.amount),
                ethers_1.BigNumber.from(txTransferReq.arg1),
            ])
                .replaceAll('0x', '');
            return {
                r_chunks: Buffer.concat([Buffer.from(out_r, 'hex')], ts_types_1.MAX_CHUNKS_BYTES_PER_REQ),
                o_chunks: Buffer.concat([Buffer.from(out_r, 'hex')], 4 * ts_types_1.CHUNK_BYTES_SIZE),
                isCritical: true,
            };
        case ts_types_1.TsTxType.DEPOSIT:
            if (!txTransferReq.arg0) {
                throw new Error('arg0 is required');
            }
            const out_d = ethers_1.ethers.utils
                .solidityPack(['uint8', 'uint32', 'uint16', 'uint128'], [
                ethers_1.BigNumber.from(txTransferReq.reqType),
                ethers_1.BigNumber.from(txTransferReq.arg0),
                ethers_1.BigNumber.from(txTransferReq.tokenId),
                ethers_1.BigNumber.from(txTransferReq.amount),
            ])
                .replaceAll('0x', '');
            return {
                r_chunks: Buffer.concat([Buffer.from(out_d, 'hex')], ts_types_1.MAX_CHUNKS_BYTES_PER_REQ),
                o_chunks: Buffer.concat([Buffer.from(out_d, 'hex')], 2 * ts_types_1.CHUNK_BYTES_SIZE),
                isCritical: true,
            };
        case ts_types_1.TsTxType.WITHDRAW:
            const out_w = ethers_1.ethers.utils
                .solidityPack(['uint8', 'uint32', 'uint16', 'uint128'], [
                ethers_1.BigNumber.from(txTransferReq.reqType),
                ethers_1.BigNumber.from(txTransferReq.accountId),
                ethers_1.BigNumber.from(txTransferReq.tokenId),
                ethers_1.BigNumber.from(txTransferReq.amount),
            ])
                .replaceAll('0x', '');
            return {
                r_chunks: Buffer.concat([Buffer.from(out_w, 'hex')], ts_types_1.MAX_CHUNKS_BYTES_PER_REQ),
                o_chunks: Buffer.concat([Buffer.from(out_w, 'hex')], 2 * ts_types_1.CHUNK_BYTES_SIZE),
                isCritical: true,
            };
        case ts_types_1.TsTxType.SecondLimitOrder:
            const out_slo = ethers_1.ethers.utils
                .solidityPack(['uint8', 'uint32', 'uint16', 'uint40'], [
                ethers_1.BigNumber.from(txTransferReq.reqType),
                ethers_1.BigNumber.from(txTransferReq.accountId),
                ethers_1.BigNumber.from(txTransferReq.tokenId),
                ethers_1.BigNumber.from((0, bigint_helper_1.amountToTxAmountV3_40bit)(BigInt(txTransferReq.amount))),
            ])
                .replaceAll('0x', '');
            return {
                r_chunks: Buffer.concat([Buffer.from(out_slo, 'hex')], ts_types_1.MAX_CHUNKS_BYTES_PER_REQ),
                o_chunks: Buffer.concat([Buffer.from(out_slo, 'hex')], 1 * ts_types_1.CHUNK_BYTES_SIZE),
                isCritical: false,
            };
        case ts_types_1.TsTxType.CancelOrder:
            const out_co = ethers_1.ethers.utils
                .solidityPack(['uint8', 'uint32', 'uint16', 'uint40'], [
                ethers_1.BigNumber.from(txTransferReq.reqType),
                ethers_1.BigNumber.from(txTransferReq.arg0),
                ethers_1.BigNumber.from(txTransferReq.tokenId),
                ethers_1.BigNumber.from((0, bigint_helper_1.amountToTxAmountV3_40bit)(BigInt(txTransferReq.amount))),
            ])
                .replaceAll('0x', '');
            return {
                r_chunks: Buffer.concat([Buffer.from(out_co, 'hex')], ts_types_1.MAX_CHUNKS_BYTES_PER_REQ),
                o_chunks: Buffer.concat([Buffer.from(out_co, 'hex')], 1 * ts_types_1.CHUNK_BYTES_SIZE),
                isCritical: false,
            };
        case ts_types_1.TsTxType.SecondLimitStart:
            if (!metadata?.txOffset) {
                throw new Error('txOffset is required');
            }
            const out_sls = ethers_1.ethers.utils
                .solidityPack(['uint8', 'uint32'], [ethers_1.BigNumber.from(txTransferReq.reqType), ethers_1.BigNumber.from(metadata?.txOffset)])
                .replaceAll('0x', '');
            return {
                r_chunks: Buffer.concat([Buffer.from(out_sls, 'hex')], ts_types_1.MAX_CHUNKS_BYTES_PER_REQ),
                o_chunks: Buffer.concat([Buffer.from(out_sls, 'hex')], 1 * ts_types_1.CHUNK_BYTES_SIZE),
                isCritical: false,
            };
        case ts_types_1.TsTxType.SecondLimitExchange:
            if (!metadata?.txOffset) {
                throw new Error('txOffset is required');
            }
            if (!metadata?.makerBuyAmt) {
                throw new Error('buyAmt is required');
            }
            const out_sle = ethers_1.ethers.utils
                .solidityPack(['uint8', 'uint32', 'uint40'], [
                ethers_1.BigNumber.from(txTransferReq.reqType),
                ethers_1.BigNumber.from(metadata?.txOffset),
                ethers_1.BigNumber.from((0, bigint_helper_1.amountToTxAmountV3_40bit)(metadata?.makerBuyAmt)),
            ])
                .replaceAll('0x', '');
            console.log({
                out_sle: [
                    ethers_1.BigNumber.from(txTransferReq.reqType),
                    ethers_1.BigNumber.from(metadata?.txOffset),
                    ethers_1.BigNumber.from((0, bigint_helper_1.amountToTxAmountV3_40bit)(metadata?.makerBuyAmt)),
                ],
            });
            return {
                r_chunks: Buffer.concat([Buffer.from(out_sle, 'hex')], ts_types_1.MAX_CHUNKS_BYTES_PER_REQ),
                o_chunks: Buffer.concat([Buffer.from(out_sle, 'hex')], 1 * ts_types_1.CHUNK_BYTES_SIZE),
                isCritical: false,
            };
        case ts_types_1.TsTxType.SecondLimitEnd:
            const out_slend = ethers_1.ethers.utils.solidityPack(['uint8'], [ethers_1.BigNumber.from(txTransferReq.reqType)]).replaceAll('0x', '');
            return {
                r_chunks: Buffer.concat([Buffer.from(out_slend, 'hex')], ts_types_1.MAX_CHUNKS_BYTES_PER_REQ),
                o_chunks: Buffer.concat([Buffer.from(out_slend, 'hex')], 1 * ts_types_1.CHUNK_BYTES_SIZE),
                isCritical: false,
            };
        case ts_types_1.TsTxType.NOOP:
        case ts_types_1.TsTxType.UNKNOWN:
            return {
                r_chunks: Buffer.alloc(ts_types_1.MAX_CHUNKS_BYTES_PER_REQ),
                o_chunks: Buffer.concat([Buffer.from('00', 'hex')], 1 * ts_types_1.CHUNK_BYTES_SIZE),
                isCritical: false,
            };
        default:
            throw new Error('unknown reqType');
    }
}
exports.encodeRChunkBuffer = encodeRChunkBuffer;
function padHexByBytes(hex, bytes) {
    if (hex.length % 2 !== 0)
        throw new Error('hex should be even length');
    if (hex.length / 2 > bytes)
        throw new Error('hex should be less than bytes');
    const padding = '0'.repeat(bytes * 2 - hex.length);
    return padding + hex;
}
function toHexString(value) {
    if (typeof value === 'string') {
        if (/^0x/.test(value))
            return value;
        return BigInt(value).toString(16);
    }
    if (typeof value === 'number') {
        return value.toString(16);
    }
    if (typeof value === 'bigint') {
        return value.toString(16);
    }
    if (value instanceof Buffer) {
        return value.toString('hex');
    }
    if (value instanceof Uint8Array) {
        return Buffer.from(value).toString('hex');
    }
    throw new Error('value should be string, number, bigint, Buffer or Uint8Array');
}
exports.toHexString = toHexString;
function padAndToBuffer(value, bytes) {
    const hexString = toHexString(value);
    const buffer = Buffer.from(/^0x/.test(hexString) ? hexString.slice(2) : hexString, 'hex');
    return Buffer.concat([buffer], bytes);
}
exports.padAndToBuffer = padAndToBuffer;
function toBigIntChunkArray(data, chunkBytesSize) {
    const result = [];
    const uint8arr = new Uint8Array(data);
    for (let i = 0; i < uint8arr.length; i += chunkBytesSize) {
        const chunk = uint8arr.slice(i, i + chunkBytesSize);
        result.push(BigInt('0x' + Buffer.from(chunk).toString('hex')));
    }
    return result;
}
exports.toBigIntChunkArray = toBigIntChunkArray;
function bigint_to_chunk_arrayV2(x, chunkBytes) {
    const ret = [];
    for (let i = x.length - 1; i >= 0; i -= chunkBytes) {
        let val = 0n;
        for (let offset = 0; offset < chunkBytes; offset++) {
            const element = x[i - offset];
            val += BigInt(element) << BigInt(offset * 8);
        }
        ret.push(val);
    }
    return ret;
}
exports.bigint_to_chunk_arrayV2 = bigint_to_chunk_arrayV2;
function bigint_to_chunk_array(x, chunkBits) {
    const mod = 2n ** BigInt(chunkBits);
    const ret = [];
    let x_temp = x;
    while (x_temp > 0n) {
        ret.push(x_temp % mod);
        x_temp = x_temp >> chunkBits;
    }
    return ret.reverse();
}
exports.bigint_to_chunk_array = bigint_to_chunk_array;


/***/ }),
/* 86 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.arrayChunkToHexString = exports.amountToTxAmountV3_40bit = exports.amountToTxAmountV2 = exports.bigIntMin = exports.bigIntMax = void 0;
const ts_types_1 = __webpack_require__(55);
const bigIntMax = (arr) => {
    return arr.reduce((max, e) => {
        return e > max ? e : max;
    }, arr[0]);
};
exports.bigIntMax = bigIntMax;
const bigIntMin = (arr) => {
    return arr.reduce((min, e) => {
        return e > min ? e : min;
    }, arr[0]);
};
exports.bigIntMin = bigIntMin;
function amountToTxAmountV2(number) {
    const sign = (number >> 127n) << 47n;
    const fraction = number - sign;
    const fractionLength = BigInt(fraction.toString(2).length);
    const bias = (1n << 5n) - 1n;
    const exp = fractionLength - 28n + bias;
    const modNumber = fractionLength > 0n ? 1n << (fractionLength - 1n) : 1n;
    const modifiedFraction = fraction % modNumber;
    const modifiedFractionLength = fractionLength > 0n ? fractionLength - 1n : 0n;
    const finalFraction = modifiedFractionLength < 41n ? modifiedFraction << (41n - modifiedFractionLength) : modifiedFraction >> (modifiedFractionLength - 41n);
    const retVal = sign + (exp << 41n) + finalFraction;
    return retVal;
}
exports.amountToTxAmountV2 = amountToTxAmountV2;
function amountToTxAmountV3_40bit(number) {
    let val_exp = 0n;
    if (number === 0n) {
        return 0n;
    }
    while (number % 10n === 0n) {
        number /= 10n;
        val_exp += 1n;
    }
    return number + (val_exp << 35n);
}
exports.amountToTxAmountV3_40bit = amountToTxAmountV3_40bit;
function arrayChunkToHexString(arr, chunkSize = ts_types_1.CHUNK_BYTES_SIZE) {
    const hex = arr
        .map((e) => {
        return BigInt(e)
            .toString(16)
            .padStart(chunkSize * 2, '0');
    })
        .join('');
    return '0x' + hex;
}
exports.arrayChunkToHexString = arrayChunkToHexString;


/***/ }),
/* 87 */
/***/ ((module) => {

module.exports = require("assert");;

/***/ }),
/* 88 */
/***/ ((module) => {

module.exports = require("@nestjs/schedule");;

/***/ }),
/* 89 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.bootstrap = void 0;
const ts_prover_module_1 = __webpack_require__(90);
const setup_helper_1 = __webpack_require__(78);
const pinoLogger_service_1 = __webpack_require__(6);
const constant_1 = __webpack_require__(5);
async function bootstrap() {
    const app = await (0, setup_helper_1.setupApp)(ts_prover_module_1.TsProverModule);
    const logger = app.get(pinoLogger_service_1.PinoLoggerService);
    logger.setContext(constant_1.TsWorkerName.PROVER);
    return app;
}
exports.bootstrap = bootstrap;


/***/ }),
/* 90 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsProverModule = void 0;
const pinoLogger_service_1 = __webpack_require__(6);
const common_1 = __webpack_require__(7);
const logger_module_1 = __webpack_require__(15);
const config_1 = __webpack_require__(11);
const constant_1 = __webpack_require__(5);
const BullQueue_module_1 = __webpack_require__(19);
const prover_processor_1 = __webpack_require__(91);
const nest_bullmq_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(21);
const blockInformation_entity_1 = __webpack_require__(29);
const transactionInfo_entity_1 = __webpack_require__(27);
const tstypeorm_module_1 = __webpack_require__(20);
const worker_service_1 = __webpack_require__(67);
const cluster_module_1 = __webpack_require__(73);
let TsProverModule = class TsProverModule {
    logger;
    workerService;
    constructor(logger, workerService) {
        this.logger = logger;
        this.workerService = workerService;
    }
    onModuleInit() {
        this.workerService.ready();
    }
};
TsProverModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            logger_module_1.LoggerModule,
            BullQueue_module_1.BullQueueModule,
            nest_bullmq_1.BullModule.registerQueue(constant_1.TsWorkerName.PROVER),
            tstypeorm_module_1.TsTypeOrmModule,
            typeorm_1.TypeOrmModule.forFeature([
                transactionInfo_entity_1.TransactionInfo,
                blockInformation_entity_1.BlockInformation,
            ]),
            cluster_module_1.WorkerModule,
        ],
        controllers: [],
        providers: [
            prover_processor_1.ProverConsumer,
        ],
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _a : Object, typeof (_b = typeof worker_service_1.WorkerService !== "undefined" && worker_service_1.WorkerService) === "function" ? _b : Object])
], TsProverModule);
exports.TsProverModule = TsProverModule;


/***/ }),
/* 91 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProverConsumer = void 0;
const constant_1 = __webpack_require__(5);
const pinoLogger_service_1 = __webpack_require__(6);
const prover_core_1 = __webpack_require__(92);
const fs_1 = __webpack_require__(96);
const path_1 = __webpack_require__(94);
const config_1 = __webpack_require__(11);
const typeorm_1 = __webpack_require__(21);
const blockInformation_entity_1 = __webpack_require__(29);
const typeorm_2 = __webpack_require__(24);
const nest_bullmq_1 = __webpack_require__(13);
const bullmq_1 = __webpack_require__(14);
const blockStatus_enum_1 = __webpack_require__(30);
let ProverConsumer = class ProverConsumer {
    config;
    logger;
    blockRepository;
    constructor(config, logger, blockRepository) {
        this.config = config;
        this.logger = logger;
        this.blockRepository = blockRepository;
    }
    getCircuitInputPath(name) {
        return path_1.default.resolve(this.config.get('CIRCUIT_INPUT_PATH_BASE', ''), `./${name}-input.json`);
    }
    async process(job) {
        this.logger.log(`ProverConsumer.process ${job.data.blockNumber}`);
        const inputName = job.data.blockNumber.toString();
        const inputPath = this.getCircuitInputPath(inputName);
        const { proofPath, publicPath } = await (0, prover_core_1.prove)(inputName, inputPath, 'circuit');
        const proof = JSON.parse(fs_1.default.readFileSync(proofPath, 'utf8'));
        const publicInput = JSON.parse(fs_1.default.readFileSync(publicPath, 'utf8'));
        await this.blockRepository.update({
            blockNumber: job.data.blockNumber,
        }, {
            blockStatus: blockStatus_enum_1.BLOCK_STATUS.L2CONFIRMED,
            proof,
        });
        return true;
    }
};
__decorate([
    (0, nest_bullmq_1.BullWorkerProcess)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof bullmq_1.Job !== "undefined" && bullmq_1.Job) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], ProverConsumer.prototype, "process", null);
ProverConsumer = __decorate([
    (0, nest_bullmq_1.BullWorker)({ queueName: constant_1.TsWorkerName.PROVER }),
    __param(2, (0, typeorm_1.InjectRepository)(blockInformation_entity_1.BlockInformation)),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object])
], ProverConsumer);
exports.ProverConsumer = ProverConsumer;


/***/ }),
/* 92 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateWitness = exports.generateProof = exports.prove = exports.BatchesDir = void 0;
const util = __webpack_require__(93);
const path_1 = __webpack_require__(94);
const _exec = util.promisify(__webpack_require__(95).exec);
const CIRCUIT_BASE = process.env.CIRCUIT_BASE || '';
const RAPIDSNARK_PATH = process.env.RAPIDSNARK_PATH ? (0, path_1.resolve)(__dirname, process.env.RAPIDSNARK_PATH) : '';
const CircomBuildBaseDir = (0, path_1.resolve)(__dirname, '../', CIRCUIT_BASE);
exports.BatchesDir = (0, path_1.resolve)(__dirname, '../', CIRCUIT_BASE);
const cmdLogs = [];
const DEBUG = true;
async function prove(inputName, inputPath, circuitName) {
    console.time(`prove ${inputPath}`);
    const { witnessPath } = await generateWitness(inputName, inputPath, circuitName);
    const { proofPath, publicPath, } = await generateProof(inputName, witnessPath, circuitName);
    console.timeEnd(`prove ${inputPath}`);
    return {
        witnessPath,
        proofPath,
        publicPath,
    };
}
exports.prove = prove;
async function generateProof(inputName, witnessPath, circuitName) {
    const baseFolderPath = (0, path_1.resolve)(__dirname, `${CircomBuildBaseDir}/${circuitName}`);
    const proofPath = (0, path_1.resolve)(__dirname, `${exports.BatchesDir}/${inputName}-proof.json`);
    const publicPath = (0, path_1.resolve)(__dirname, `${exports.BatchesDir}/${inputName}-public.json`);
    const proveCmd = RAPIDSNARK_PATH ? `${RAPIDSNARK_PATH}` : 'npx snarkjs groth16 prove';
    const { stdout, } = await exec(`${proveCmd} ${baseFolderPath}/${circuitName}.zkey ${witnessPath} ${proofPath} ${publicPath}`);
    return {
        stdout,
        proofPath,
        publicPath,
    };
}
exports.generateProof = generateProof;
async function generateWitness(inputName, inputPath, circuitName) {
    const buildDir = (0, path_1.resolve)(__dirname, `${CircomBuildBaseDir}/${circuitName}`);
    const witnessPath = (0, path_1.resolve)(__dirname, `${exports.BatchesDir}/${inputName}-witness.wtns`);
    const { stdout, } = await exec(`node ${buildDir}/${circuitName}_js/generate_witness.js ${buildDir}/${circuitName}_js/${circuitName}.wasm ${inputPath} ${witnessPath}`);
    return {
        stdout,
        circuitName,
        witnessPath,
    };
}
exports.generateWitness = generateWitness;
function exec(cmd) {
    cmdLogs.push(cmd);
    const id = cmdLogs.length - 1;
    console.log(`exec command(${id}): ${cmd}`);
    return new Promise((resolve, reject) => {
        _exec(cmd).then(({ stdout, stderr }) => {
            if (stderr)
                throw new Error(stderr);
            if (DEBUG)
                console.log(stdout);
            return resolve({ id, cmd: cmdLogs[id], stdout });
        }).catch((stderr) => {
            if (DEBUG)
                console.error(stderr);
            return reject(stderr);
        });
    });
}


/***/ }),
/* 93 */
/***/ ((module) => {

module.exports = require("util");;

/***/ }),
/* 94 */
/***/ ((module) => {

module.exports = require("path");;

/***/ }),
/* 95 */
/***/ ((module) => {

module.exports = require("child_process");;

/***/ }),
/* 96 */
/***/ ((module) => {

module.exports = require("fs");;

/***/ }),
/* 97 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const pinoLogger_service_1 = __webpack_require__(6);
const logger_module_1 = __webpack_require__(15);
const common_1 = __webpack_require__(7);
const cqrs_1 = __webpack_require__(98);
const config_1 = __webpack_require__(11);
const constant_1 = __webpack_require__(5);
const schedule_1 = __webpack_require__(88);
const producer_service_1 = __webpack_require__(99);
const BullQueue_module_1 = __webpack_require__(19);
const tstypeorm_module_1 = __webpack_require__(20);
const typeorm_1 = __webpack_require__(21);
const blockInformation_entity_1 = __webpack_require__(29);
const nest_bullmq_1 = __webpack_require__(13);
const db_pubsub_module_1 = __webpack_require__(75);
const transactionInfo_entity_1 = __webpack_require__(27);
const cluster_module_1 = __webpack_require__(73);
let AppModule = class AppModule {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    onModuleInit() {
        this.logger.setContext(constant_1.TsWorkerName.CORE);
    }
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            cqrs_1.CqrsModule,
            logger_module_1.LoggerModule,
            schedule_1.ScheduleModule.forRoot(),
            BullQueue_module_1.BullQueueModule,
            tstypeorm_module_1.TsTypeOrmModule,
            typeorm_1.TypeOrmModule.forFeature([
                transactionInfo_entity_1.TransactionInfo,
                blockInformation_entity_1.BlockInformation,
            ]),
            nest_bullmq_1.BullModule.registerQueue({
                queueName: constant_1.TsWorkerName.CORE,
            }, {
                queueName: constant_1.TsWorkerName.SEQUENCER,
            }, {
                queueName: constant_1.TsWorkerName.PROVER,
            }, {
                queueName: constant_1.TsWorkerName.OPERATOR,
            }),
            db_pubsub_module_1.DatabasePubSubModule,
            cluster_module_1.MainProcessModule,
        ],
        controllers: [],
        providers: [
            producer_service_1.ProducerService,
        ]
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _a : Object])
], AppModule);
exports.AppModule = AppModule;


/***/ }),
/* 98 */
/***/ ((module) => {

module.exports = require("@nestjs/cqrs");;

/***/ }),
/* 99 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProducerService = void 0;
const nest_bullmq_1 = __webpack_require__(13);
const pubSub_constants_1 = __webpack_require__(100);
const messageBroker_1 = __webpack_require__(72);
const pinoLogger_service_1 = __webpack_require__(6);
const common_1 = __webpack_require__(7);
const typeorm_1 = __webpack_require__(21);
const blockInformation_entity_1 = __webpack_require__(29);
const transactionInfo_entity_1 = __webpack_require__(27);
const tsStatus_enum_1 = __webpack_require__(31);
const typeorm_2 = __webpack_require__(24);
const bullmq_1 = __webpack_require__(14);
const constant_1 = __webpack_require__(5);
const blockStatus_enum_1 = __webpack_require__(30);
const schedule_1 = __webpack_require__(88);
let ProducerService = class ProducerService {
    logger;
    txRepository;
    blockRepository;
    seqQueue;
    operatorQueue;
    proverQueue;
    messageBrokerService;
    currentPendingTxId = 0;
    currentPendingBlock = 0;
    currentProvedBlock = 0;
    constructor(logger, txRepository, blockRepository, seqQueue, operatorQueue, proverQueue, messageBrokerService) {
        this.logger = logger;
        this.txRepository = txRepository;
        this.blockRepository = blockRepository;
        this.seqQueue = seqQueue;
        this.operatorQueue = operatorQueue;
        this.proverQueue = proverQueue;
        this.messageBrokerService = messageBrokerService;
        logger.log('DispatchService');
    }
    async process() {
        await this.dispatchPendingTransaction();
    }
    async subscribe() {
        await this.messageBrokerService.addChannels([pubSub_constants_1.CHANNEL.ORDER_CREATED, pubSub_constants_1.CHANNEL.ORDER_PROCCESSD, pubSub_constants_1.CHANNEL.ORDER_VERIFIED]);
        this.messageBrokerService.subscribe(pubSub_constants_1.CHANNEL.ORDER_CREATED, this.dispatchPendingTransaction.bind(this));
        this.messageBrokerService.subscribe(pubSub_constants_1.CHANNEL.ORDER_PROCCESSD, this.dispatchPeningBlock.bind(this));
        this.messageBrokerService.subscribe(pubSub_constants_1.CHANNEL.ORDER_VERIFIED, this.dispatchProvedBlock.bind(this));
    }
    unsubscribe() {
        this.messageBrokerService.close();
    }
    prevJobId;
    async dispatchPendingTransaction() {
        this.logger.log('dispatchPendingTransaction...');
        const transactions = await this.txRepository.find({
            select: {
                txId: true,
            },
            where: {
                txId: (0, typeorm_2.MoreThan)(this.currentPendingTxId),
                txStatus: tsStatus_enum_1.TS_STATUS.PENDING,
            },
            order: {
                txId: 'asc',
            },
        });
        if (transactions.length) {
            this.logger.log(`dispatchPendingTransaction add ${transactions.length} blocks`);
            this.currentPendingTxId = transactions[transactions.length - 1].txId;
            for (let index = 0; index < transactions.length; index++) {
                const tx = transactions[index];
                const jobId = `${constant_1.TsWorkerName.SEQUENCER}-${tx.txId}`;
                try {
                    const job = await this.seqQueue.add(tx.txId.toString(), {
                        jobId,
                        txId: tx.txId,
                    });
                }
                catch (error) {
                    console.error(error);
                }
            }
        }
    }
    async dispatchPeningBlock() {
        this.logger.log('dispatchPeningBlock');
        const blocks = await this.blockRepository.find({
            where: {
                blockNumber: (0, typeorm_2.MoreThan)(this.currentPendingBlock),
                blockStatus: blockStatus_enum_1.BLOCK_STATUS.PROCESSING,
            },
            order: {
                blockNumber: 'asc',
            },
        });
        if (blocks.length) {
            this.logger.log(`dispatchPeningBlock add ${blocks.length} blocks`);
            this.currentPendingBlock = blocks[blocks.length - 1].blockNumber;
            for (let index = 0; index < blocks.length; index++) {
                const block = blocks[index];
                this.proverQueue.add(block.blockNumber.toString(), block);
            }
        }
    }
    async dispatchProvedBlock() {
        this.logger.log('dispatchProvedBlock');
        const blocks = await this.blockRepository.find({
            where: {
                blockNumber: (0, typeorm_2.MoreThan)(this.currentProvedBlock),
                blockStatus: blockStatus_enum_1.BLOCK_STATUS.L2CONFIRMED,
            },
            order: {
                blockNumber: 'asc',
            },
        });
        if (blocks.length) {
            this.logger.log(`dispatchProvedBlock add ${blocks.length} blocks`);
            this.currentProvedBlock = blocks[blocks.length - 1].blockNumber;
            for (let index = 0; index < blocks.length; index++) {
                const block = blocks[index];
                this.operatorQueue.add(block.blockNumber.toString(), block);
            }
        }
    }
};
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProducerService.prototype, "process", null);
ProducerService = __decorate([
    (0, common_1.Injectable)({
        scope: common_1.Scope.DEFAULT,
    }),
    __param(1, (0, typeorm_1.InjectRepository)(transactionInfo_entity_1.TransactionInfo)),
    __param(2, (0, typeorm_1.InjectRepository)(blockInformation_entity_1.BlockInformation)),
    __param(3, (0, nest_bullmq_1.BullQueueInject)(constant_1.TsWorkerName.SEQUENCER)),
    __param(4, (0, nest_bullmq_1.BullQueueInject)(constant_1.TsWorkerName.OPERATOR)),
    __param(5, (0, nest_bullmq_1.BullQueueInject)(constant_1.TsWorkerName.PROVER)),
    __metadata("design:paramtypes", [typeof (_a = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof bullmq_1.Queue !== "undefined" && bullmq_1.Queue) === "function" ? _d : Object, typeof (_e = typeof bullmq_1.Queue !== "undefined" && bullmq_1.Queue) === "function" ? _e : Object, typeof (_f = typeof bullmq_1.Queue !== "undefined" && bullmq_1.Queue) === "function" ? _f : Object, typeof (_g = typeof messageBroker_1.MessageBroker !== "undefined" && messageBroker_1.MessageBroker) === "function" ? _g : Object])
], ProducerService);
exports.ProducerService = ProducerService;


/***/ }),
/* 100 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CHANNELS = exports.CHANNEL = void 0;
var CHANNEL;
(function (CHANNEL) {
    CHANNEL["ORDER_CREATED"] = "ORDER_CREATED";
    CHANNEL["ORDER_VERIFIED"] = "ORDER_VERIFIED";
    CHANNEL["ORDER_PROCCESSD"] = "ORDER_PROCCESSD";
})(CHANNEL = exports.CHANNEL || (exports.CHANNEL = {}));
exports.CHANNELS = [
    CHANNEL.ORDER_CREATED,
    CHANNEL.ORDER_VERIFIED,
    CHANNEL.ORDER_PROCCESSD
];


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const _cluster = __webpack_require__(1);
const cluster = _cluster;
const main_1 = __webpack_require__(2);
const main_2 = __webpack_require__(80);
const main_3 = __webpack_require__(89);
const constant_1 = __webpack_require__(5);
const app_module_1 = __webpack_require__(97);
const core_1 = __webpack_require__(79);
const pinoLogger_service_1 = __webpack_require__(6);
const helper_1 = __webpack_require__(8);
const main_process_service_1 = __webpack_require__(74);
clusterize([
    {
        name: constant_1.TsWorkerName.OPERATOR,
        bootstrap: main_1.bootstrap,
    },
    {
        name: constant_1.TsWorkerName.SEQUENCER,
        bootstrap: main_2.bootstrap,
    },
    {
        name: constant_1.TsWorkerName.PROVER,
        bootstrap: main_3.bootstrap,
    },
]);
async function clusterize(workers) {
    if (cluster.isPrimary) {
        await setupMasterApp(app_module_1.AppModule, workers);
    }
    else {
        const workerName = (0, helper_1.getWorkerName)();
        const worker = workers.find((item) => item.name === workerName);
        if (worker) {
            await worker.bootstrap();
        }
        else {
            throw new Error(`Worker ${workerName} not found`);
        }
    }
}
async function setupMasterApp(module, workers) {
    const app = await core_1.NestFactory.createApplicationContext(module);
    const logger = app.get(pinoLogger_service_1.PinoLoggerService);
    logger.setContext((0, helper_1.getWorkerName)());
    const clusterService = app.get(main_process_service_1.MainProcessService);
    clusterService.clusterize(workers);
    logger.setContext((0, helper_1.getProcessName)());
    logger.log(`${constant_1.TsWorkerName.CORE}: server started!`);
    return app;
}

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwiY2x1c3RlclwiIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi90cy1vcGVyYXRvci9zcmMvbWFpbi50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtb3BlcmF0b3Ivc3JjL3RzLW9wZXJhdG9yLm1vZHVsZS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtb3BlcmF0b3Ivc3JjL2luZnJhc3RydWN0dXJlL29wZXJhdG9yLnByb2Nlc3Nvci50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtc2RrL3NyYy9jb25zdGFudC50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL2xvZ2dlci9zcmMvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcIkBuZXN0anMvY29tbW9uXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLXNkay9zcmMvaGVscGVyLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJuZXN0anMtcGlub1wiIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJuZXN0anMtZXRoZXJzXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcIkBuZXN0anMvY29uZmlnXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcIkBhbmNoYW44MjgvbmVzdC1idWxsbXFcIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwiYnVsbG1xXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi9sb2dnZXIvc3JjL2xvZ2dlci5tb2R1bGUudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcInBpbm9cIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwidXVpZFwiIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vbG9nZ2VyL3NyYy9hZGFwdGVycy9mYWtlL0Zha2VMb2dnZXIuc2VydmljZS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL2J1bGwtcXVldWUvc3JjL0J1bGxRdWV1ZS5tb2R1bGUudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy90c3R5cGVvcm0ubW9kdWxlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJAbmVzdGpzL3R5cGVvcm1cIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvYWNjb3VudC5tb2R1bGUudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L2FjY291bnRJbmZvcm1hdGlvbi5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcInR5cGVvcm1cIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2F1Y3Rpb25PcmRlci9vYnNPcmRlci5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hdWN0aW9uT3JkZXIvbWF0Y2hPYnNPcmRlci5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L3RyYW5zYWN0aW9uSW5mby5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9jb21tb24vYmFzZVRpbWVFbnRpdHkudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L2Jsb2NrSW5mb3JtYXRpb24uZW50aXR5LnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC9ibG9ja1N0YXR1cy5lbnVtLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC90c1N0YXR1cy5lbnVtLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYXVjdGlvbk9yZGVyL3RzU2lkZS5lbnVtLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvY29tbW9uL3RzLWhlbHBlci50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2NvbW1vbi9wb3NlaWRlbi1oYXNoLWRwLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJAYmlnLXdoYWxlLWxhYnMvcG9zZWlkb25cIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvcm9sZS5lbnVtLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC9hY2NvdW50TGVhZk5vZGUuZW50aXR5LnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC9hY2NvdW50TWVya2xlVHJlZU5vZGUuZW50aXR5LnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC9vYnNNZXJrbGVUcmVlU2VydmljZS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvdHNBY2NvdW50VHJlZS5zZXJ2aWNlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvY29tbW9uL3RzTWVya2xlVHJlZS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvaGVscGVyL21rQWNjb3VudC5oZWxwZXIudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLXNkay9zcmMvZG9tYWluL2xpYi90cy1yb2xsdXAvdHMtaGVscGVyLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi90cy1zZGsvc3JjL2RvbWFpbi9saWIvaGVscGVyLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJldGhlcnNcIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtc2RrL3NyYy9kb21haW4vbGliL2VkZHNhLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJjaXJjb21saWJqc1wiIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJmZmphdmFzY3JpcHRcIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtc2RrL3NyYy9kb21haW4vbGliL3Bvc2VpZG9uLWhhc2gtZHAudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L3RzVG9rZW5UcmVlLnNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L3Rva2VuTGVhZk5vZGUuZW50aXR5LnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC90b2tlbk1lcmtsZVRyZWVOb2RlLmVudGl0eS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2F1Y3Rpb25PcmRlci9hdWN0aW9uT3JkZXIubW9kdWxlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYXVjdGlvbk9yZGVyL2F1Y3Rpb25Cb25kVG9rZW4uZW50aXR5LnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi90cy1zZGsvc3JjL2RvbWFpbi9saWIvdHMtdHlwZXMvdHMtdHlwZXMudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hdWN0aW9uT3JkZXIvb2JzT3JkZXJMZWFmLmVudGl0eS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2F1Y3Rpb25PcmRlci9vYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZS5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hdWN0aW9uT3JkZXIvY2FuZGxlU3RpY2suZW50aXR5LnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYXVjdGlvbk9yZGVyL21hcmtldFBhaXJJbmZvLmVudGl0eS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2F1Y3Rpb25PcmRlci9tYXJrZXRQYWlySW5mby5zZXJ2aWNlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYXVjdGlvbk9yZGVyL2F2YWlsYWJsZVZpZXcuZW50aXR5LnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYXVjdGlvbk9yZGVyL29ic09yZGVyVHJlZS5zZXJ2aWNlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvcm9sbHVwL3JvbGx1cC5tb2R1bGUudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9yb2xsdXAvcm9sbHVwSW5mb3JtYXRpb24uZW50aXR5LnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJsb2Rhc2hcIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtb3BlcmF0b3Ivc3JjL2luZnJhc3RydWN0dXJlL29wZXJhdG9yLnByb2R1Y2VyLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vY2x1c3Rlci9zcmMvd29ya2VyLnNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcInJ4anNcIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtc2RrL3NyYy9kb21haW4vZXZlbnRzL2NsdXN0ZXIudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcInJ1bnR5cGVzXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcInJ4anMvaW50ZXJuYWwvZmlyc3RWYWx1ZUZyb21cIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL2RiLXB1YnN1Yi9zcmMvcG9ydHMvbWVzc2FnZUJyb2tlci50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL2NsdXN0ZXIvc3JjL2NsdXN0ZXIubW9kdWxlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vY2x1c3Rlci9zcmMvbWFpbi1wcm9jZXNzLnNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi9kYi1wdWJzdWIvc3JjL2RiLXB1YnN1Yi5tb2R1bGUudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi9kYi1wdWJzdWIvc3JjL2FkYXB0ZXJzL21lc3NhZ2VCcm9rZXIuc2VydmljZS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwiQGltcXVldWUvcGctcHVic3ViXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLXNkay9zcmMvc2V0dXAuaGVscGVyLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJAbmVzdGpzL2NvcmVcIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtc2VxdWVuY2VyL3NyYy9tYWluLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi90cy1zZXF1ZW5jZXIvc3JjL3RzLXNlcXVlbmNlci5tb2R1bGUudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLXNlcXVlbmNlci9zcmMvaW5mcmFzdHJ1Y3R1cmUvc2VxdWVuY2VyLnByb2Nlc3Nvci50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtc2RrL3NyYy9kb21haW4vbGliL3RzLXJvbGx1cC90cy1yb2xsdXAudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLXNkay9zcmMvZG9tYWluL2xpYi90cy1yb2xsdXAvdHMtcm9sbHVwLWhlbHBlci50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtc2RrL3NyYy9kb21haW4vbGliL3RzLXJvbGx1cC90cy10eC1oZWxwZXIudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLXNkay9zcmMvZG9tYWluL2xpYi9iaWdpbnQtaGVscGVyLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJhc3NlcnRcIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwiQG5lc3Rqcy9zY2hlZHVsZVwiIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi90cy1wcm92ZXIvc3JjL21haW4udHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLXByb3Zlci9zcmMvdHMtcHJvdmVyLm1vZHVsZS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtcHJvdmVyL3NyYy9pbmZyYXN0cnVjdHVyZS9wcm92ZXIucHJvY2Vzc29yLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi90cy1wcm92ZXIvc3JjL2RvbWFpbi9wcm92ZXItY29yZS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwidXRpbFwiIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJwYXRoXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcImNoaWxkX3Byb2Nlc3NcIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwiZnNcIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtY29yZS9zcmMvYXBwLm1vZHVsZS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwiQG5lc3Rqcy9jcXJzXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLWNvcmUvc3JjL3Byb2R1Y2VyLnNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi9kYi1wdWJzdWIvc3JjL2RvbWFpbnMvdmFsdWUtb2JqZWN0cy9wdWJTdWIuY29uc3RhbnRzLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLWNvcmUvc3JjL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBLHFDOzs7Ozs7Ozs7QUNBQSxvREFBd0Q7QUFDeEQsK0NBQWdEO0FBQ3pDLEtBQUssVUFBVSxTQUFTO0lBQzdCLE1BQU0sR0FBRyxHQUFHLE1BQU0sMkJBQVEsRUFBQyxxQ0FBZ0IsQ0FBQyxDQUFDO0lBRTdDLE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUpELDhCQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ05ELG9EQUF1RTtBQUN2RSxvREFBb0Y7QUFDcEYsd0NBQXNEO0FBQ3RELGdEQUE0RDtBQUM1RCx5Q0FBNkQ7QUFDN0QsMENBQWdEO0FBQ2hELG1EQUF5RTtBQUN6RSxnREFBdUY7QUFDdkYsOENBQW9EO0FBQ3BELG1EQUF5RTtBQUN6RSxvREFBc0U7QUFDdEUsMkRBQTBGO0FBQzFGLDBDQUFnRDtBQUNoRCx5REFBdUY7QUFDdkYsaURBQThEO0FBQzlELGlEQUErRDtBQUMvRCxtREFBMEU7QUFDMUUsNERBQTBGO0FBRTFGLE1BQU0sWUFBWSxHQUFHO0lBQ25CLElBQUksRUFBRSxPQUFPO0lBQ2IsT0FBTyxFQUFFLEtBQUs7SUFDZCxnQkFBZ0IsRUFBRSxDQUFDLFNBQWMsRUFBRSxFQUFFO1FBQ25DLE9BQU8sSUFBSSxTQUFTLENBQUMsZUFBZSxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDaEUsQ0FBQztDQUNGLENBQUM7QUFrQ0ssSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBZ0I7SUFFRTtJQUE0QztJQUF6RSxZQUE2QixNQUF5QixFQUFtQixhQUE0QjtRQUF4RSxXQUFNLEdBQU4sTUFBTSxDQUFtQjtRQUFtQixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtJQUFHLENBQUM7SUFFekcsWUFBWTtRQUNWLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDN0IsQ0FBQztDQUNGO0FBUFksZ0JBQWdCO0lBakM1QixtQkFBTSxFQUFDO1FBQ04sT0FBTyxFQUFFO1lBQ1AscUJBQVk7WUFDWiw0QkFBWTtZQUNaLGtDQUFlO1lBQ2Ysd0JBQVUsQ0FBQyxhQUFhLENBQUM7Z0JBQ3ZCLFNBQVMsRUFBRSx1QkFBWSxDQUFDLElBQUk7YUFDN0IsRUFDRDtnQkFDRSxTQUFTLEVBQUUsdUJBQVksQ0FBQyxRQUFRO2FBQ2pDLENBQUM7WUFDRixrQ0FBZTtZQUNmLHVCQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsNENBQWlCLEVBQUUsd0NBQWUsRUFBRSw4Q0FBa0IsQ0FBQyxDQUFDO1lBQ2xGLDRCQUFZLENBQUMsWUFBWSxDQUFDO2dCQUN4QixPQUFPLEVBQUUsQ0FBQyxxQkFBWSxDQUFDO2dCQUN2QixNQUFNLEVBQUUsQ0FBQyxzQkFBYSxDQUFDO2dCQUN2QixVQUFVLEVBQUUsQ0FBQyxhQUE0QixFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUM3QyxPQUFPLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLENBQUMsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLCtCQUFlLENBQUMsQ0FBQyxDQUFDLDhCQUFjO29CQUMxRyxTQUFTLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQztvQkFLakQsTUFBTSxFQUFFLENBQUM7b0JBQ1Qsa0JBQWtCLEVBQUUsSUFBSTtpQkFDekIsQ0FBQzthQUNILENBQUM7WUFDRiw2QkFBWTtZQUNaLHVDQUFvQjtTQUNyQjtRQUNELFdBQVcsRUFBRSxFQUFFO1FBQ2YsU0FBUyxFQUFFLENBQUMscUNBQWdCLEVBQUUsb0NBQWdCLEVBQUU7S0FDakQsQ0FBQzt5REFHcUMsc0NBQWlCLG9CQUFqQixzQ0FBaUIsb0RBQWtDLDhCQUFhLG9CQUFiLDhCQUFhO0dBRjFGLGdCQUFnQixDQU81QjtBQVBZLDRDQUFnQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMxRDdCLDBDQUFnRDtBQUNoRCxvREFBb0Y7QUFDcEYsZ0RBQW1IO0FBQ25ILHlDQUErQztBQUMvQyxvQ0FBbUQ7QUFDbkQsOENBQXVFO0FBQ3ZFLHlDQUE2QjtBQVN0QixJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFnQjtJQUlSO0lBQ0E7SUFDd0I7SUFDRTtJQU5yQyxNQUFNLENBQVM7SUFDZixRQUFRLENBQVE7SUFDeEIsWUFDbUIsTUFBcUIsRUFDckIsTUFBeUIsRUFDRCxZQUEwQixFQUN4QixjQUE4QjtRQUh4RCxXQUFNLEdBQU4sTUFBTSxDQUFlO1FBQ3JCLFdBQU0sR0FBTixNQUFNLENBQW1CO1FBQ0QsaUJBQVksR0FBWixZQUFZLENBQWM7UUFDeEIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1FBRXpFLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM1RixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLCtCQUErQixFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFxQixDQUFDO0lBQ3pJLENBQUM7SUFHSyxLQUFELENBQUMsT0FBTyxDQUFDLEdBQTBCO1FBQ3RDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDRCQUE0QixHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFvQnBFLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUNGO0FBdkJPO0lBREwsbUNBQWlCLEdBQUU7O3lEQUNELFlBQUcsb0JBQUgsWUFBRzs7K0NBc0JyQjtBQXBDVSxnQkFBZ0I7SUFONUIsNEJBQVUsRUFBQztRQUNWLFNBQVMsRUFBRSx1QkFBWSxDQUFDLFFBQVE7UUFDaEMsT0FBTyxFQUFFO1lBQ1AsV0FBVyxFQUFFLENBQUM7U0FDZjtLQUNGLENBQUM7SUFPRyxtREFBb0IsR0FBRTtJQUN0QixxREFBc0IsR0FBRTt5REFIQSxzQkFBYSxvQkFBYixzQkFBYSxvREFDYixzQ0FBaUIsb0JBQWpCLHNDQUFpQixvREFDYSw0QkFBWSxvQkFBWiw0QkFBWSxvREFDUiw4QkFBYyxvQkFBZCw4QkFBYztHQVBoRSxnQkFBZ0IsQ0FxQzVCO0FBckNZLDRDQUFnQjs7Ozs7Ozs7OztBQ2I3QixJQUFZLFlBT1g7QUFQRCxXQUFZLFlBQVk7SUFDdEIsbUNBQW1CO0lBQ25CLCtCQUFlO0lBQ2YsdUNBQXVCO0lBQ3ZCLG1DQUFtQjtJQUNuQix5Q0FBeUI7SUFDekIscUNBQXFCO0FBQ3ZCLENBQUMsRUFQVyxZQUFZLEdBQVosb0JBQVksS0FBWixvQkFBWSxRQU92Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNWRCx3Q0FBMkQ7QUFDM0Qsd0NBQWdEO0FBQ2hELDZDQUF5QztBQUdsQyxJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFrQixTQUFRLHNCQUFhO0lBRzdCO0lBRlosV0FBVyxDQUFTO0lBRTdCLFlBQXFCLE1BQWtCO1FBQ3JDLEtBQUssRUFBRSxDQUFDO1FBRFcsV0FBTSxHQUFOLE1BQU0sQ0FBWTtRQUVyQyxJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztJQUMvQixDQUFDO0lBRUQsVUFBVSxDQUFDLElBQVk7UUFDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVELE9BQU8sQ0FBQyxPQUFZLEVBQUUsT0FBZ0IsRUFBRSxHQUFHLElBQVc7UUFDcEQsSUFBSSxPQUFPLEVBQUU7WUFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsMkJBQWMsR0FBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDakc7YUFBTTtZQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQ3JDO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFZLEVBQUUsT0FBZ0IsRUFBRSxHQUFHLElBQVc7UUFDbEQsSUFBSSxPQUFPLEVBQUU7WUFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsMkJBQWMsR0FBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDakc7YUFBTTtZQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQ3JDO0lBQ0gsQ0FBQztJQUVELEdBQUcsQ0FBQyxPQUFZLEVBQUUsT0FBZ0IsRUFBRSxHQUFHLElBQVc7UUFDaEQsSUFBSSxPQUFPLEVBQUU7WUFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsMkJBQWMsR0FBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDaEc7YUFBTTtZQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQ3BDO0lBQ0gsQ0FBQztJQUVELElBQUksQ0FBQyxPQUFZLEVBQUUsT0FBZ0IsRUFBRSxHQUFHLElBQVc7UUFDakQsSUFBSSxPQUFPLEVBQUU7WUFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsMkJBQWMsR0FBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDaEc7YUFBTTtZQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQ3BDO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFZLEVBQUUsS0FBYyxFQUFFLE9BQWdCLEVBQUUsR0FBRyxJQUFXO1FBQ2xFLElBQUksT0FBTyxFQUFFO1lBQ1gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSwyQkFBYyxHQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUN4RzthQUFNLElBQUksS0FBSyxFQUFFO1lBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDaEQ7YUFBTTtZQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQ3JDO0lBQ0gsQ0FBQztDQUNGO0FBckRZLGlCQUFpQjtJQUQ3Qix1QkFBVSxHQUFFO3lEQUlrQix3QkFBVSxvQkFBVix3QkFBVTtHQUg1QixpQkFBaUIsQ0FxRDdCO0FBckRZLDhDQUFpQjs7Ozs7OztBQ0w5Qiw0Qzs7Ozs7Ozs7O0FDRUEsU0FBZ0IsY0FBYztJQUM1QixPQUFPLEdBQUcsYUFBYSxFQUFFLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzdDLENBQUM7QUFGRCx3Q0FFQztBQUVELFNBQWdCLGFBQWE7SUFDM0IsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQThCLENBQUM7QUFDcEQsQ0FBQztBQUZELHNDQUVDO0FBR0QsU0FBZ0IsS0FBSyxDQUFDLElBQVk7SUFDaEMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzdELENBQUM7QUFGRCxzQkFFQzs7Ozs7OztBQ2JELHlDOzs7Ozs7QUNBQSwyQzs7Ozs7O0FDQUEsNEM7Ozs7Ozs7Ozs7OztBQ0FBLG9EOzs7Ozs7QUNBQSxvQzs7Ozs7Ozs7Ozs7Ozs7O0FDQUEsd0NBQWdEO0FBQ2hELDZDQUErRDtBQUMvRCx1Q0FBd0M7QUFDeEMscUNBQTZCO0FBQzdCLHFEQUF1RTtBQUN2RSxvREFBdUU7QUF5QmhFLElBQU0sWUFBWSxHQUFsQixNQUFNLFlBQVk7Q0FBRztBQUFmLFlBQVk7SUFqQnhCLG1CQUFNLEdBQUU7SUFDUixtQkFBTSxFQUFDO1FBQ04sT0FBTyxFQUFFO1lBQ1AsMEJBQWdCLENBQUMsT0FBTyxDQUFDO2dCQUN2QixRQUFRLEVBQUU7b0JBQ1IsSUFBSSxFQUFFLEtBQUs7b0JBQ1gsS0FBSyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNO29CQUMvRCxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRTtvQkFDN0MsVUFBVSxFQUFFLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7b0JBRXBDLFNBQVMsRUFBRSx1QkFBZ0IsQ0FBQyxRQUFRO2lCQUNyQzthQUNGLENBQUM7U0FDSDtRQUNELFNBQVMsRUFBRSxDQUFDLHNDQUFpQixFQUFFLHNDQUFpQixDQUFDO1FBQ2pELE9BQU8sRUFBRSxDQUFDLHNDQUFpQixFQUFFLHNDQUFpQixDQUFDO0tBQ2hELENBQUM7R0FDVyxZQUFZLENBQUc7QUFBZixvQ0FBWTs7Ozs7OztBQzlCekIsa0M7Ozs7OztBQ0FBLGtDOzs7Ozs7Ozs7QUNBQSx3Q0FBK0M7QUFFL0MsTUFBYSxpQkFBa0IsU0FBUSxzQkFBYTtJQUc3QjtJQUZaLFdBQVcsQ0FBUztJQUU3QixZQUFxQixNQUFZO1FBQy9CLEtBQUssRUFBRSxDQUFDO1FBRFcsV0FBTSxHQUFOLE1BQU0sQ0FBTTtRQUUvQixJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztJQUMvQixDQUFDO0lBRU0sR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQztJQUNmLEtBQUssR0FBRyxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUM7SUFDakIsT0FBTyxHQUFHLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQztJQUNuQixJQUFJLEdBQUcsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDO0lBQ2hCLElBQUksR0FBRyxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUM7SUFDaEIsS0FBSyxHQUFHLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQztJQUNqQixVQUFVLEdBQUcsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDO0NBQzlCO0FBZkQsOENBZUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNqQkQsOENBQW9EO0FBQ3BELHdDQUF3QztBQUN4Qyx5Q0FBNkQ7QUFrQnRELElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWU7Q0FBRztBQUFsQixlQUFlO0lBaEIzQixtQkFBTSxFQUFDO1FBQ04sT0FBTyxFQUFFO1lBQ1Asd0JBQVUsQ0FBQyxZQUFZLENBQUM7Z0JBQ3RCLE9BQU8sRUFBRSxDQUFDLHFCQUFZLENBQUM7Z0JBQ3ZCLE1BQU0sRUFBRSxDQUFDLHNCQUFhLENBQUM7Z0JBQ3ZCLFVBQVUsRUFBRSxLQUFLLEVBQUUsYUFBNEIsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDbkQsT0FBTyxFQUFFO3dCQUNQLFVBQVUsRUFBRTs0QkFDVixJQUFJLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBUyx1QkFBdUIsRUFBRSxXQUFXLENBQUM7NEJBQ3JFLElBQUksRUFBRSxhQUFhLENBQUMsR0FBRyxDQUFTLHVCQUF1QixFQUFFLElBQUksQ0FBQzt5QkFDL0Q7cUJBQ0Y7aUJBQ0YsQ0FBQzthQUNILENBQUM7U0FDSDtLQUNGLENBQUM7R0FDVyxlQUFlLENBQUc7QUFBbEIsMENBQWU7Ozs7Ozs7Ozs7Ozs7Ozs7QUNwQjVCLG9EQUFvRjtBQUNwRixnREFBNEQ7QUFDNUQsd0NBQWdEO0FBQ2hELHlDQUE2RDtBQUM3RCwwQ0FBZ0Q7QUFDaEQsaURBQTBFO0FBQzFFLHNEQUF5RjtBQUN6RixnREFBdUU7QUF1Q2hFLElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWU7Q0FBRztBQUFsQixlQUFlO0lBdEMzQixtQkFBTSxHQUFFO0lBQ1IsbUJBQU0sRUFBQztRQUNOLE9BQU8sRUFBRTtZQUNQLHFCQUFZO1lBQ1osNEJBQVk7WUFDWix1QkFBYSxDQUFDLFlBQVksQ0FBQztnQkFDekIsT0FBTyxFQUFFLENBQUMscUJBQVksQ0FBQztnQkFDdkIsTUFBTSxFQUFFLENBQUMsc0JBQWEsQ0FBQztnQkFDdkIsVUFBVSxFQUFFLENBQUMsYUFBNEIsRUFBRSxFQUFFO29CQUMzQyxNQUFNLFlBQVksR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxLQUFLLE1BQU0sQ0FBQztvQkFDOUQsT0FBTzt3QkFDTCxHQUFHLEVBQUUsWUFBWTt3QkFDakIsS0FBSyxFQUFFOzRCQUNMLEdBQUcsRUFBRSxZQUFZLEVBQUMsQ0FBQyxFQUFFLGtCQUFrQixFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJO3lCQUN4RDt3QkFDRCxJQUFJLEVBQUUsVUFBVTt3QkFDaEIsSUFBSSxFQUFFLGFBQWEsQ0FBQyxHQUFHLENBQVMsU0FBUyxFQUFFLEVBQUUsQ0FBQzt3QkFDOUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxHQUFHLENBQVMsU0FBUyxFQUFFLElBQUksQ0FBQzt3QkFDaEQsUUFBUSxFQUFFLGFBQWEsQ0FBQyxHQUFHLENBQVMsU0FBUyxFQUFDLEVBQUUsQ0FBQzt3QkFDakQsUUFBUSxFQUFFLGFBQWEsQ0FBQyxHQUFHLENBQVMsV0FBVyxFQUFFLEVBQUUsQ0FBQzt3QkFDcEQsUUFBUSxFQUFFLGFBQWEsQ0FBQyxHQUFHLENBQVMsU0FBUyxFQUFFLEVBQUUsQ0FBQzt3QkFDbEQsZ0JBQWdCLEVBQUUsSUFBSTt3QkFDdEIsV0FBVyxFQUFFLGFBQWEsQ0FBQyxHQUFHLENBQVMsVUFBVSxFQUFFLEtBQUssQ0FBQyxJQUFJLEtBQUs7cUJBSW5FLENBQUM7Z0JBQ0osQ0FBQzthQUNGLENBQUM7WUFFRiw4QkFBYSxFQUFFLHdDQUFrQixFQUFFLDRCQUFZO1NBQ2hEO1FBQ0QsU0FBUyxFQUFFO1lBQ1QsdUJBQWE7WUFDYixzQ0FBaUI7U0FDbEI7UUFDRCxPQUFPLEVBQUUsQ0FBQyx1QkFBYSxDQUFDO0tBQ3pCLENBQUM7R0FDVyxlQUFlLENBQUc7QUFBbEIsMENBQWU7Ozs7Ozs7QUM5QzVCLDZDOzs7Ozs7Ozs7Ozs7Ozs7QUNBQSx3Q0FBZ0Q7QUFDaEQseUNBQThDO0FBQzlDLDBDQUFnRDtBQUVoRCw0REFBaUU7QUFDakUseURBQTJEO0FBQzNELCtEQUF1RTtBQUN2RSwwREFBNkQ7QUFFN0QsdURBQThEO0FBRTlELHVEQUF1RDtBQUN2RCw2REFBbUU7QUFDbkUseURBQTJEO0FBQzNELHdEQUErRDtBQUMvRCxzREFBMkQ7QUFtQnBELElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWE7Q0FBRTtBQUFmLGFBQWE7SUFsQnpCLG1CQUFNLEdBQUU7SUFDUixtQkFBTSxFQUFDO1FBQ04sT0FBTyxFQUFFO1lBQ1AscUJBQVk7WUFDWix1QkFBYSxDQUFDLFVBQVUsQ0FBQztnQkFDdkIsOENBQWtCO2dCQUNsQix3Q0FBZTtnQkFDZixvREFBcUI7Z0JBQ3JCLGdEQUFtQjtnQkFDbkIsb0NBQWE7Z0JBQ2Isd0NBQWU7Z0JBQ2YsMENBQWdCO2FBQ2pCLENBQUM7U0FDSDtRQUNELFNBQVMsRUFBRSxDQUFDLDRDQUFvQixFQUFFLHdDQUFrQixFQUFFLDJDQUFvQixDQUFDO1FBQzNFLFdBQVcsRUFBRSxFQUFFO1FBQ2YsT0FBTyxFQUFFLENBQUMsNENBQW9CLEVBQUUsd0NBQWtCLEVBQUUsMkNBQW9CLEVBQUUsdUJBQWEsQ0FBQztLQUN6RixDQUFDO0dBQ1csYUFBYSxDQUFFO0FBQWYsc0NBQWE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDbEMxQiwwQ0FBeUY7QUFFekYsa0RBQWlFO0FBQ2pFLGlEQUEwRDtBQUMxRCw0Q0FBaUQ7QUFFakQsNENBQW1DO0FBQ25DLHlEQUEyRDtBQUdwRCxJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFtQixTQUFRLCtCQUFjO0lBT3BELFNBQVMsQ0FBVTtJQVNuQixTQUFTLENBQVU7SUFRbkIsS0FBSyxDQUFVO0lBUWYsYUFBYSxDQUFpQjtJQU05QixhQUFhLENBQWU7SUFTNUIsSUFBSSxDQUFRO0lBT1osUUFBUSxDQUFpQjtJQU96QixZQUFZLENBQWlCO0lBTzdCLEtBQUssQ0FBVTtJQU9mLE9BQU8sQ0FBaUI7SUFTeEIsU0FBUyxDQUFVO0lBUW5CLFNBQVMsQ0FBVTtJQWVuQixnQkFBZ0IsQ0FBcUI7SUFNckMsU0FBUyxDQUEyQjtJQUVwQyxJQUFJLGNBQWM7UUFDaEIsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLDBCQUFVLEVBQUM7WUFDNUIsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztTQUMvQixDQUFDLENBQUMsQ0FBQztRQUNKLE1BQU0sSUFBSSxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ3BDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUNGO0FBekhDO0lBQUMsMkJBQWEsRUFBQztRQUNiLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFdBQVc7UUFDakIsTUFBTSxFQUFFLEdBQUc7UUFDWCxPQUFPLEVBQUUsSUFBSTtLQUNkLENBQUM7O3FEQUNpQjtBQUVuQjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxXQUFXO1FBQ2pCLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixRQUFRLEVBQUUsS0FBSztLQUNoQixDQUFDOztxREFDaUI7QUFDbkI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsT0FBTztRQUNiLE1BQU0sRUFBRSxHQUFHO1FBQ1gsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsS0FBSztLQUNkLENBQUM7O2lEQUNhO0FBQ2Y7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsZUFBZTtRQUNyQixNQUFNLEVBQUUsR0FBRztRQUNYLFFBQVEsRUFBRSxJQUFJO1FBQ2QsT0FBTyxFQUFFLElBQUk7S0FDZCxDQUFDOzt5REFDNEI7QUFDOUI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLDZCQUE2QjtRQUNuQyxJQUFJLEVBQUUsZUFBZTtRQUNyQixRQUFRLEVBQUUsSUFBSTtLQUNmLENBQUM7O3lEQUMwQjtBQUM1QjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsTUFBTTtRQUNaLElBQUksRUFBRSxNQUFNO1FBQ1osUUFBUSxFQUFFLE1BQU07UUFDaEIsSUFBSSxFQUFFLENBQUMsZ0JBQUksQ0FBQyxLQUFLLEVBQUUsZ0JBQUksQ0FBQyxNQUFNLEVBQUUsZ0JBQUksQ0FBQyxRQUFRLENBQUM7UUFDOUMsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLEVBQUUsZ0JBQUksQ0FBQyxNQUFNO0tBQ3JCLENBQUM7a0RBQ0ssZ0JBQUksb0JBQUosZ0JBQUk7Z0RBQUM7QUFDWjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxVQUFVO1FBQ2hCLE1BQU0sRUFBRSxHQUFHO1FBQ1gsUUFBUSxFQUFFLElBQUk7S0FDZixDQUFDOztvREFDdUI7QUFDekI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsY0FBYztRQUNwQixNQUFNLEVBQUUsR0FBRztRQUNYLFFBQVEsRUFBRSxJQUFJO0tBQ2YsQ0FBQzs7d0RBQzJCO0FBQzdCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxPQUFPO1FBQ2IsSUFBSSxFQUFFLE9BQU87UUFDYixRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxRQUFRO0tBQ3hCLENBQUM7O2lEQUNhO0FBQ2Y7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsU0FBUztRQUNmLE1BQU0sRUFBRSxHQUFHO1FBQ1gsUUFBUSxFQUFFLElBQUk7S0FDZixDQUFDOzttREFDc0I7QUFFeEI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsV0FBVztRQUNqQixNQUFNLEVBQUUsS0FBSztRQUNiLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLE9BQU87S0FDakIsQ0FBQzs7cURBQ2lCO0FBQ25CO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFdBQVc7UUFDakIsTUFBTSxFQUFFLEtBQUs7UUFDYixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxPQUFPO0tBQ2pCLENBQUM7O3FEQUNpQjtBQWNuQjtJQUFDLHVCQUFTLEVBQUMsR0FBRyxFQUFFLENBQUMsd0NBQWUsRUFBRSxDQUFDLGVBQWdDLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUM7OzREQUNqRTtBQUNyQztJQUFDLHVCQUFTLEVBQUMsR0FBRyxFQUFFLENBQUMsZ0NBQWMsRUFBRSxDQUFDLFFBQXdCLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7SUFDbkYsd0JBQVUsRUFBQztRQUNWLElBQUksRUFBRSxXQUFXO1FBQ2pCLG9CQUFvQixFQUFFLFdBQVc7S0FDbEMsQ0FBQzs7cURBQ2tDO0FBakh6QixrQkFBa0I7SUFEOUIsb0JBQU0sRUFBQyxvQkFBb0IsRUFBRSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQztHQUN0QyxrQkFBa0IsQ0EwSDlCO0FBMUhZLGdEQUFrQjs7Ozs7OztBQ1YvQixxQzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0NBLDBDQUE2RztBQUM3Ryw0REFBMEU7QUFDMUUsdURBQTZEO0FBRTdELDhDQUF1QztBQUdoQyxJQUFNLGNBQWMsR0FBcEIsTUFBTSxjQUFjO0lBS3pCLEVBQUUsQ0FBVTtJQVlaLElBQUksQ0FBVTtJQU9kLElBQUksQ0FBVTtJQU9kLE9BQU8sQ0FBVTtJQVNqQixTQUFTLENBQVU7SUFRbkIsVUFBVSxDQUFVO0lBU3BCLEtBQUssQ0FBVTtJQU9mLFdBQVcsQ0FBVTtJQVNyQixPQUFPLENBQVU7SUFTakIsT0FBTyxDQUFVO0lBU2pCLGFBQWEsQ0FBVTtJQVN2QixhQUFhLENBQVU7SUFTdkIsa0JBQWtCLENBQVU7SUFTNUIsa0JBQWtCLENBQVU7SUFTNUIsV0FBVyxDQUFVO0lBU3JCLFdBQVcsQ0FBVTtJQVFyQixTQUFTLENBQVE7SUFPakIsT0FBTyxDQUFXO0lBT2xCLFdBQVcsQ0FBaUI7SUFrQjVCLFdBQVcsQ0FBeUI7SUFhcEMsV0FBVyxDQUFzQjtDQUNsQztBQTdMQztJQUFDLG9DQUFzQixFQUFDO1FBQ3RCLElBQUksRUFBRSxNQUFNO1FBQ1osSUFBSSxFQUFFLElBQUk7S0FDWCxDQUFDOzswQ0FDVTtBQUNaO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxNQUFNO1FBQ1osSUFBSSxFQUFFLE1BQU07UUFDWixRQUFRLEVBQUUsTUFBTTtRQUNoQixJQUFJLEVBQUU7WUFDSixvQkFBTSxDQUFDLEdBQUc7WUFDVixvQkFBTSxDQUFDLElBQUk7U0FDWjtRQUNELFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssb0JBQU0sQ0FBQyxHQUFHLElBQUk7S0FDbkMsQ0FBQztrREFDSyxvQkFBTSxvQkFBTixvQkFBTTs0Q0FBQztBQUNkO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxNQUFNO1FBQ1osSUFBSSxFQUFFLE1BQU07UUFDWixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxDQUFDO0tBQ1gsQ0FBQzs7NENBQ1k7QUFDZDtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxTQUFTO1FBQ2YsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLEVBQUUsQ0FBQztLQUNYLENBQUM7OytDQUNlO0FBQ2pCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFdBQVc7UUFDakIsU0FBUyxFQUFFLEVBQUU7UUFDYixLQUFLLEVBQUUsQ0FBQztRQUNSLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLEVBQUU7S0FDWixDQUFDOztpREFDaUI7QUFDbkI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsWUFBWTtRQUNsQixNQUFNLEVBQUUsR0FBRztRQUNYLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLGNBQWM7S0FDeEIsQ0FBQzs7a0RBQ2tCO0FBQ3BCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLE9BQU87UUFDYixTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUM7OzZDQUNhO0FBQ2Y7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsYUFBYTtRQUNuQixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxDQUFDO0tBQ1gsQ0FBQzs7bURBQ21CO0FBQ3JCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFNBQVM7UUFDZixTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUM7OytDQUNlO0FBQ2pCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFNBQVM7UUFDZixTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUM7OytDQUNlO0FBQ2pCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLGVBQWU7UUFDckIsU0FBUyxFQUFFLEVBQUU7UUFDYixLQUFLLEVBQUUsQ0FBQztRQUNSLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLEVBQUU7S0FDWixDQUFDOztxREFDcUI7QUFDdkI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsZUFBZTtRQUNyQixTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUM7O3FEQUNxQjtBQUN2QjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxvQkFBb0I7UUFDMUIsU0FBUyxFQUFFLEVBQUU7UUFDYixLQUFLLEVBQUUsQ0FBQztRQUNSLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLEVBQUU7S0FDWixDQUFDOzswREFDMEI7QUFDNUI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsb0JBQW9CO1FBQzFCLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxFQUFFO0tBQ1osQ0FBQzs7MERBQzBCO0FBQzVCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLGFBQWE7UUFDbkIsU0FBUyxFQUFFLEVBQUU7UUFDYixLQUFLLEVBQUUsQ0FBQztRQUNSLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLENBQUM7S0FDWCxDQUFDOzttREFDbUI7QUFDckI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsYUFBYTtRQUNuQixTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLEVBQUUsQ0FBQztLQUNYLENBQUM7O21EQUNtQjtBQUNyQjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsNkJBQTZCO1FBQ25DLElBQUksRUFBRSxXQUFXO1FBQ2pCLFFBQVEsRUFBRSxLQUFLO1FBQ2YsU0FBUyxFQUFFLENBQUM7UUFDWixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTztLQUN2QixDQUFDO2tEQUNVLElBQUksb0JBQUosSUFBSTtpREFBQztBQUNqQjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxTQUFTO1FBQ2YsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLEVBQUUsS0FBSztLQUNmLENBQUM7OytDQUNnQjtBQUNsQjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsTUFBTTtRQUNaLElBQUksRUFBRSxhQUFhO1FBQ25CLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLElBQUk7S0FDYixDQUFDOzttREFDMEI7QUFVNUI7SUFBQyx1QkFBUyxFQUNSLEdBQUcsRUFBRSxDQUFDLDBDQUFtQixFQUN6QixDQUFDLFdBQWdDLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQzdEO0lBQ0Esd0JBQVUsRUFBQztRQUNWLElBQUksRUFBRSxJQUFJO1FBQ1Ysb0JBQW9CLEVBQUUsZ0JBQWdCO0tBQ3ZDLENBQUM7O21EQUNrQztBQUNwQztJQUFDLHVCQUFTLEVBQ1IsR0FBRyxFQUFFLENBQUMsOENBQWtCLEVBQ3hCLENBQUMsV0FBK0IsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFDMUQ7UUFDRSxRQUFRLEVBQUUsVUFBVTtRQUNwQixRQUFRLEVBQUUsU0FBUztLQUNwQixDQUNGO0lBQ0Esd0JBQVUsRUFBQztRQUNWLElBQUksRUFBRSxXQUFXO1FBQ2pCLG9CQUFvQixFQUFFLFdBQVc7S0FDbEMsQ0FBQztrREFDWSw4Q0FBa0Isb0JBQWxCLDhDQUFrQjttREFBQztBQTdMdEIsY0FBYztJQUQxQixvQkFBTSxFQUFDLFVBQVUsRUFBRSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUMsQ0FBQztHQUMzQixjQUFjLENBOEwxQjtBQTlMWSx3Q0FBYzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNSM0IsMENBQWtHO0FBQ2xHLHlEQUFvRTtBQUVwRSxrREFBbUQ7QUFDbkQsOENBQXVDO0FBR2hDLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW1CO0lBSzlCLEVBQUUsQ0FBVTtJQVlaLElBQUksQ0FBVTtJQU1kLElBQUksQ0FBaUI7SUFNckIsS0FBSyxDQUFpQjtJQU10QixjQUFjLENBQVU7SUFPeEIsT0FBTyxDQUFVO0lBUWpCLFVBQVUsQ0FBVTtJQVFwQixTQUFTLENBQVU7SUFRbkIsU0FBUyxDQUFVO0lBUW5CLFNBQVMsQ0FBUTtJQU1qQixXQUFXLENBQVU7SUFNckIsTUFBTSxDQUFXO0lBTWpCLFFBQVEsQ0FBVztJQWFuQixTQUFTLENBQWtCO0lBYTNCLFNBQVMsQ0FBMEI7Q0FVcEM7QUEvSEM7SUFBQyxvQ0FBc0IsRUFBQztRQUN0QixJQUFJLEVBQUUsTUFBTTtRQUNaLElBQUksRUFBRSxJQUFJO0tBQ1gsQ0FBQzs7K0NBQ1U7QUFDWjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsTUFBTTtRQUNaLElBQUksRUFBRSxNQUFNO1FBQ1osUUFBUSxFQUFFLE1BQU07UUFDaEIsSUFBSSxFQUFFO1lBQ0osb0JBQU0sQ0FBQyxHQUFHO1lBQ1Ysb0JBQU0sQ0FBQyxJQUFJO1NBQ1o7UUFDRCxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxvQkFBTSxDQUFDLEdBQUcsR0FBRztRQUNoQyxRQUFRLEVBQUUsS0FBSztLQUNoQixDQUFDO2tEQUNLLG9CQUFNLG9CQUFOLG9CQUFNO2lEQUFDO0FBQ2Q7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLE1BQU07UUFDWixJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxJQUFJO0tBQ2YsQ0FBQzs7aURBQ21CO0FBQ3JCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxNQUFNO1FBQ1osSUFBSSxFQUFFLE9BQU87UUFDYixRQUFRLEVBQUUsSUFBSTtLQUNmLENBQUM7O2tEQUNvQjtBQUN0QjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsTUFBTTtRQUNaLElBQUksRUFBRSxnQkFBZ0I7UUFDdEIsUUFBUSxFQUFFLEtBQUs7S0FDaEIsQ0FBQzs7MkRBQ3NCO0FBQ3hCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFNBQVM7UUFDZixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxDQUFDO0tBQ1gsQ0FBQzs7b0RBQ2U7QUFDakI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsWUFBWTtRQUNsQixNQUFNLEVBQUUsR0FBRztRQUNYLE9BQU8sRUFBRSxjQUFjO1FBQ3ZCLFFBQVEsRUFBRSxLQUFLO0tBQ2hCLENBQUM7O3VEQUNrQjtBQUNwQjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxXQUFXO1FBQ2pCLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUM7O3NEQUNpQjtBQUNuQjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxXQUFXO1FBQ2pCLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUM7O3NEQUNpQjtBQUNuQjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsNkJBQTZCO1FBQ25DLElBQUksRUFBRSxXQUFXO1FBQ2pCLFNBQVMsRUFBRSxDQUFDO1FBQ1osUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLEVBQUUsT0FBTztLQUNqQixDQUFDO2tEQUNVLElBQUksb0JBQUosSUFBSTtzREFBQztBQUNqQjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxhQUFhO1FBQ25CLE9BQU8sRUFBRSxDQUFDO0tBQ1gsQ0FBQzs7d0RBQ21CO0FBQ3JCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsS0FBSztLQUNmLENBQUM7O21EQUNlO0FBQ2pCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFVBQVU7UUFDaEIsT0FBTyxFQUFFLEtBQUs7S0FDZixDQUFDOztxREFDaUI7QUFDbkI7SUFBQyx1QkFBUyxFQUNSLEdBQUcsRUFBRSxDQUFDLGdDQUFjLEVBQ3BCLENBQUMsUUFBd0IsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFDbEQ7UUFDRSxRQUFRLEVBQUUsU0FBUztRQUNuQixRQUFRLEVBQUUsVUFBVTtLQUNyQixDQUNGO0lBQ0Esd0JBQVUsRUFBQztRQUNWLElBQUksRUFBRSxnQkFBZ0I7UUFDdEIsb0JBQW9CLEVBQUUsSUFBSTtLQUMzQixDQUFDO2tEQUNVLGdDQUFjLG9CQUFkLGdDQUFjO3NEQUFDO0FBQzNCO0lBQUMsc0JBQVEsRUFDUCxHQUFHLEVBQUUsQ0FBQyx3Q0FBZSxFQUNyQixDQUFDLFdBQTRCLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQzFEO1FBQ0UsUUFBUSxFQUFFLFVBQVU7UUFDcEIsUUFBUSxFQUFFLFNBQVM7S0FDcEIsQ0FDRjtJQUNBLHdCQUFVLEVBQUM7UUFDVixJQUFJLEVBQUUsTUFBTTtRQUNaLG9CQUFvQixFQUFFLE1BQU07S0FDN0IsQ0FBQzs7c0RBQ2lDO0FBdEh4QixtQkFBbUI7SUFEL0Isb0JBQU0sRUFBQyxlQUFlLEVBQUUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFDLENBQUM7R0FDaEMsbUJBQW1CLENBZ0kvQjtBQWhJWSxrREFBbUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDUGhDLDBDQU9pQjtBQUNqQix1REFBMkU7QUFDM0UsaURBQTBEO0FBQzFELDREQUFpRTtBQUNqRSwwREFBNkQ7QUFDN0QsZ0RBQTRDO0FBSXJDLElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWdCLFNBQVEsK0JBQWM7SUFRakQsSUFBSSxDQUFVO0lBT2QsV0FBVyxDQUFpQjtJQU81QixPQUFPLENBQVU7SUFTakIsU0FBUyxDQUFVO0lBU25CLE9BQU8sQ0FBVTtJQVNqQixrQkFBa0IsQ0FBVTtJQVM1QixpQkFBaUIsQ0FBVTtJQVMzQixNQUFNLENBQVU7SUFTaEIsS0FBSyxDQUFVO0lBT2YsUUFBUSxDQUdOO0lBUUYsUUFBUSxDQUFVO0lBU2xCLElBQUksQ0FBVTtJQVNkLElBQUksQ0FBVTtJQVNkLElBQUksQ0FBVTtJQVNkLElBQUksQ0FBVTtJQVNkLElBQUksQ0FBVTtJQVFkLFNBQVMsQ0FBVTtJQVFuQixTQUFTLENBQVU7SUFTbkIsR0FBRyxDQUFVO0lBU2IsUUFBUSxDQUFVO0lBT2xCLFFBQVEsQ0FBaUI7SUFnQnpCLFFBQVEsQ0FBYTtJQWNyQixhQUFhLENBQXNCO0lBYW5DLFNBQVMsQ0FBb0I7SUFTN0IsWUFBWSxDQUE4QjtJQUMxQyxJQUFJLFNBQVM7UUFDWCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFvQixDQUFDO0lBQ25ELENBQUM7Q0FPRjtBQWpQQztJQUFDLDJCQUFhLEVBQUM7UUFDYixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxNQUFNO1FBQ1osT0FBTyxFQUFFLElBQUk7UUFDYixRQUFRLEVBQUUsS0FBSztRQUNmLFNBQVMsRUFBRSxXQUFXO0tBQ3ZCLENBQUM7OzZDQUNZO0FBQ2Q7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsYUFBYTtRQUNuQixRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxDQUFDO0tBQ1gsQ0FBQzs7b0RBQzBCO0FBQzVCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFNBQVM7UUFDZixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxDQUFDO0tBQ1gsQ0FBQzs7Z0RBQ2U7QUFDakI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsV0FBVztRQUNqQixTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUM7O2tEQUNpQjtBQUNuQjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxTQUFTO1FBQ2YsU0FBUyxFQUFFLEVBQUU7UUFDYixLQUFLLEVBQUUsQ0FBQztRQUNSLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLEVBQUU7S0FDWixDQUFDOztnREFDZTtBQUNqQjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxvQkFBb0I7UUFDMUIsU0FBUyxFQUFFLEVBQUU7UUFDYixLQUFLLEVBQUUsQ0FBQztRQUNSLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLEVBQUU7S0FDWixDQUFDOzsyREFDMEI7QUFDNUI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsbUJBQW1CO1FBQ3pCLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxFQUFFO0tBQ1osQ0FBQzs7MERBQ3lCO0FBQzNCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFFBQVE7UUFDZCxTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUM7OytDQUNjO0FBQ2hCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLE9BQU87UUFDYixTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUM7OzhDQUNhO0FBQ2Y7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLE1BQU07UUFDWixJQUFJLEVBQUUsVUFBVTtRQUNoQixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztLQUMxRCxDQUFDOztpREFJQTtBQUNGO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFVBQVU7UUFDaEIsTUFBTSxFQUFFLElBQUk7UUFDWixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxNQUFNO0tBQ2hCLENBQUM7O2lEQUNnQjtBQUNsQjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxNQUFNO1FBQ1osU0FBUyxFQUFFLEVBQUU7UUFDYixLQUFLLEVBQUUsQ0FBQztRQUNSLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLEVBQUU7S0FDWixDQUFDOzs2Q0FDWTtBQUNkO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLE1BQU07UUFDWixTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUM7OzZDQUNZO0FBQ2Q7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsTUFBTTtRQUNaLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxFQUFFO0tBQ1osQ0FBQzs7NkNBQ1k7QUFDZDtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxNQUFNO1FBQ1osU0FBUyxFQUFFLEVBQUU7UUFDYixLQUFLLEVBQUUsQ0FBQztRQUNSLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLEVBQUU7S0FDWixDQUFDOzs2Q0FDWTtBQUNkO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLE1BQU07UUFDWixTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUM7OzZDQUNZO0FBQ2Q7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsV0FBVztRQUNqQixNQUFNLEVBQUUsS0FBSztRQUNiLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLE9BQU87S0FDakIsQ0FBQzs7a0RBQ2lCO0FBQ25CO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFdBQVc7UUFDakIsTUFBTSxFQUFFLEtBQUs7UUFDYixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxPQUFPO0tBQ2pCLENBQUM7O2tEQUNpQjtBQUNuQjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxLQUFLO1FBQ1gsU0FBUyxFQUFFLEVBQUU7UUFDYixLQUFLLEVBQUUsQ0FBQztRQUNSLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLEVBQUU7S0FDWixDQUFDOzs0Q0FDVztBQUNiO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFVBQVU7UUFDaEIsU0FBUyxFQUFFLEVBQUU7UUFDYixLQUFLLEVBQUUsQ0FBQztRQUNSLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLEVBQUU7S0FDWixDQUFDOztpREFDZ0I7QUFDbEI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLE1BQU07UUFDWixJQUFJLEVBQUUsVUFBVTtRQUNoQixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxRQUFRO0tBQ3hCLENBQUM7O2lEQUN1QjtBQUN6QjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsTUFBTTtRQUNaLElBQUksRUFBRSxVQUFVO1FBQ2hCLElBQUksRUFBRTtZQUNKLHlCQUFTLENBQUMsT0FBTztZQUNqQix5QkFBUyxDQUFDLFVBQVU7WUFDcEIseUJBQVMsQ0FBQyxVQUFVO1lBQ3BCLHlCQUFTLENBQUMsV0FBVztZQUNyQix5QkFBUyxDQUFDLFdBQVc7WUFDckIseUJBQVMsQ0FBQyxNQUFNO1lBQ2hCLHlCQUFTLENBQUMsUUFBUTtTQUNuQjtRQUNELFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLElBQUkseUJBQVMsQ0FBQyxPQUFPLEdBQUc7S0FDbEMsQ0FBQztrREFDUyx5QkFBUyxvQkFBVCx5QkFBUztpREFBQztBQUNyQjtJQUFDLHVCQUFTLEVBQ1IsR0FBRyxFQUFFLENBQUMsOENBQWtCLEVBQ3hCLENBQUMsa0JBQXNDLEVBQUUsRUFBRSxDQUN6QyxrQkFBa0IsQ0FBQyxnQkFBZ0IsRUFDckM7UUFDRSxRQUFRLEVBQUUsVUFBVTtRQUNwQixRQUFRLEVBQUUsU0FBUztLQUNwQixDQUNGO0lBQ0Esd0JBQVUsRUFBQztRQUNWLElBQUksRUFBRSxXQUFXO1FBQ2pCLG9CQUFvQixFQUFFLFdBQVc7S0FDbEMsQ0FBQztrREFDYyw4Q0FBa0Isb0JBQWxCLDhDQUFrQjtzREFBQztBQUNuQztJQUFDLHVCQUFTLEVBQ1IsR0FBRyxFQUFFLENBQUMsMENBQWdCLEVBQ3RCLENBQUMsZ0JBQWtDLEVBQUUsRUFBRSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixFQUN6RTtRQUNFLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLFFBQVEsRUFBRSxTQUFTO0tBQ3BCLENBQ0Y7SUFDQSx3QkFBVSxFQUFDO1FBQ1YsSUFBSSxFQUFFLGFBQWE7UUFDbkIsb0JBQW9CLEVBQUUsYUFBYTtLQUNwQyxDQUFDO2tEQUNVLDBDQUFnQixvQkFBaEIsMENBQWdCO2tEQUFDO0FBQzdCO0lBQUMsc0JBQVEsRUFDUCxHQUFHLEVBQUUsQ0FBQywwQ0FBbUIsRUFDekIsQ0FBQyxlQUFvQyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUNwRTtJQUNBLHdCQUFVLEVBQUM7UUFDVixJQUFJLEVBQUUsTUFBTTtRQUNaLG9CQUFvQixFQUFFLE1BQU07S0FDN0IsQ0FBQzs7cURBQ3dDO0FBeE8vQixlQUFlO0lBRDNCLG9CQUFNLEVBQUMsaUJBQWlCLEVBQUUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLENBQUM7R0FDbkMsZUFBZSxDQWtQM0I7QUFsUFksMENBQWU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDaEI1QiwwQ0FBdUY7QUFFdkYsTUFBc0IsY0FBYztJQU1sQyxTQUFTLENBQVE7SUFPakIsU0FBUyxDQUFpQjtJQU0xQixTQUFTLENBQVE7SUFPakIsU0FBUyxDQUFpQjtJQU0xQixTQUFTLENBQWU7SUFPeEIsU0FBUyxDQUFpQjtDQUMzQjtBQXZDQztJQUFDLDhCQUFnQixFQUFDO1FBQ2hCLElBQUksRUFBRSw2QkFBNkI7UUFDbkMsSUFBSSxFQUFFLFdBQVc7UUFDakIsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU87S0FDdkIsQ0FBQztrREFDVSxJQUFJLG9CQUFKLElBQUk7aURBQUM7QUFDakI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsV0FBVztRQUNqQixNQUFNLEVBQUUsR0FBRztRQUNYLFFBQVEsRUFBRSxJQUFJO0tBQ2YsQ0FBQzs7aURBQ3dCO0FBQzFCO0lBQUMsOEJBQWdCLEVBQUM7UUFDaEIsSUFBSSxFQUFFLDZCQUE2QjtRQUNuQyxJQUFJLEVBQUUsV0FBVztRQUNqQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTztLQUN2QixDQUFDO2tEQUNVLElBQUksb0JBQUosSUFBSTtpREFBQztBQUNqQjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxXQUFXO1FBQ2pCLE1BQU0sRUFBRSxHQUFHO1FBQ1gsUUFBUSxFQUFFLElBQUk7S0FDZixDQUFDOztpREFDd0I7QUFDMUI7SUFBQyw4QkFBZ0IsRUFBQztRQUNoQixJQUFJLEVBQUUsNkJBQTZCO1FBQ25DLElBQUksRUFBRSxXQUFXO1FBQ2pCLFFBQVEsRUFBRSxJQUFJO0tBQ2YsQ0FBQzs7aURBQ3NCO0FBQ3hCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFdBQVc7UUFDakIsTUFBTSxFQUFFLEdBQUc7UUFDWCxRQUFRLEVBQUUsSUFBSTtLQUNmLENBQUM7O2lEQUN3QjtBQXZDNUIsd0NBd0NDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzFDRCwwQ0FBd0Y7QUFDeEYsaURBQTBEO0FBQzFELG1EQUFrRDtBQUNsRCx5REFBMkQ7QUFHcEQsSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBaUIsU0FBUSwrQkFBYztJQUtsRCxXQUFXLENBQVU7SUFPckIsU0FBUyxDQUFpQjtJQU0xQixpQkFBaUIsQ0FBVTtJQU0zQixVQUFVLENBQVE7SUFPbEIsZUFBZSxDQUFVO0lBTXpCLE9BQU8sQ0FBaUI7SUFPeEIsUUFBUSxDQUFpQjtJQU96QixLQUFLLENBQWlCO0lBY3RCLFdBQVcsQ0FBZ0I7SUFTM0IsZ0JBQWdCLENBQTRCO0NBQzdDO0FBMUVDO0lBQUMsb0NBQXNCLEVBQUM7UUFDdEIsSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsYUFBYTtLQUNwQixDQUFDOztxREFDbUI7QUFDckI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsV0FBVztRQUNqQixNQUFNLEVBQUUsR0FBRztRQUNYLFFBQVEsRUFBRSxJQUFJO0tBQ2YsQ0FBQzs7bURBQ3dCO0FBQzFCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLG1CQUFtQjtRQUN6QixNQUFNLEVBQUUsR0FBRztLQUNaLENBQUM7OzJEQUN5QjtBQUMzQjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsNkJBQTZCO1FBQ25DLElBQUksRUFBRSxZQUFZO1FBQ2xCLFFBQVEsRUFBRSxLQUFLO0tBQ2hCLENBQUM7a0RBQ1csSUFBSSxvQkFBSixJQUFJO29EQUFDO0FBQ2xCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLGlCQUFpQjtRQUN2QixNQUFNLEVBQUUsR0FBRztRQUNYLFFBQVEsRUFBRSxLQUFLO0tBQ2hCLENBQUM7O3lEQUN1QjtBQUN6QjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsTUFBTTtRQUNaLElBQUksRUFBRSxTQUFTO1FBQ2YsUUFBUSxFQUFFLElBQUk7S0FDZixDQUFDOztpREFDc0I7QUFDeEI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLE1BQU07UUFDWixJQUFJLEVBQUUsVUFBVTtRQUNoQixRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxRQUFRO0tBQ3hCLENBQUM7O2tEQUN1QjtBQUN6QjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsTUFBTTtRQUNaLElBQUksRUFBRSxPQUFPO1FBQ2IsUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsUUFBUTtLQUN4QixDQUFDOzsrQ0FDb0I7QUFDdEI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLE1BQU07UUFDWixJQUFJLEVBQUUsYUFBYTtRQUNuQixRQUFRLEVBQUUsS0FBSztRQUNmLFFBQVEsRUFBRSxjQUFjO1FBQ3hCLElBQUksRUFBRTtZQUNKLCtCQUFZLENBQUMsVUFBVTtZQUN2QiwrQkFBWSxDQUFDLFVBQVU7WUFDdkIsK0JBQVksQ0FBQyxXQUFXO1lBQ3hCLCtCQUFZLENBQUMsV0FBVztTQUN6QjtRQUNELE9BQU8sRUFBRSxJQUFJLCtCQUFZLENBQUMsVUFBVSxHQUFHO0tBQ3hDLENBQUM7a0RBQ1ksK0JBQVksb0JBQVosK0JBQVk7cURBQUM7QUFDM0I7SUFBQyx1QkFBUyxFQUNSLEdBQUcsRUFBRSxDQUFDLHdDQUFlLEVBQ3JCLGVBQWUsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FDN0M7SUFDQSx3QkFBVSxFQUFDO1FBQ1YsSUFBSSxFQUFFLGFBQWE7UUFDbkIsb0JBQW9CLEVBQUUsYUFBYTtLQUNwQyxDQUFDOzswREFDMEM7QUExRWpDLGdCQUFnQjtJQUQ1QixvQkFBTSxFQUFDLGtCQUFrQixFQUFFLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUFDO0dBQ3BDLGdCQUFnQixDQTJFNUI7QUEzRVksNENBQWdCOzs7Ozs7Ozs7O0FDTjdCLElBQVksWUFLWDtBQUxELFdBQVksWUFBWTtJQUN0Qix5Q0FBdUI7SUFDdkIseUNBQXVCO0lBQ3ZCLDJDQUF5QjtJQUN6QiwyQ0FBeUI7QUFDM0IsQ0FBQyxFQUxXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBS3ZCOzs7Ozs7Ozs7O0FDTEQsSUFBWSxTQVFYO0FBUkQsV0FBWSxTQUFTO0lBQ25CLGdDQUFpQjtJQUNqQixzQ0FBdUI7SUFDdkIsc0NBQXVCO0lBQ3ZCLHdDQUF5QjtJQUN6Qix3Q0FBeUI7SUFDekIsOEJBQWU7SUFDZixrQ0FBbUI7QUFDckIsQ0FBQyxFQVJXLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBUXBCOzs7Ozs7Ozs7O0FDUkQsSUFBWSxNQUdYO0FBSEQsV0FBWSxNQUFNO0lBQ2hCLG1CQUFTO0lBQ1Qsb0JBQVU7QUFDWixDQUFDLEVBSFcsTUFBTSxHQUFOLGNBQU0sS0FBTixjQUFNLFFBR2pCOzs7Ozs7Ozs7O0FDRkQsbURBQW9EO0FBRXBELFNBQWdCLGFBQWEsQ0FBQyxDQUFTO0lBQ3JDLE9BQU8sSUFBSSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDL0IsQ0FBQztBQUZELHNDQUVDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLE1BQWdCO0lBQ3pDLE9BQU8sYUFBYSxDQUFDLHFDQUFjLEVBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBRkQsZ0NBRUM7QUFFRCxTQUFTLFlBQVksQ0FBQyxHQUE2QjtJQUNqRCxJQUFJLEdBQUcsWUFBWSxLQUFLLEVBQUU7UUFDeEIsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQU8sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0MsT0FBTyxhQUFhLENBQUMscUNBQWMsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0tBQzlDO0lBRUQsT0FBUSxhQUFhLENBQUMscUNBQWMsRUFBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRSxDQUFDO0FBRVksa0JBQVUsR0FBRyxZQUFZLENBQUM7Ozs7Ozs7Ozs7QUNwQnZDLDJDQUFrRDtBQUVsRCxNQUFNLGVBQWU7SUFDbkIsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBRXpCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBOEI7UUFDNUMsSUFBSSxDQUFDLFlBQVksS0FBSyxFQUFFO1lBQ3RCLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNyQixPQUFPLGVBQWUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdEM7UUFFRCxPQUFPLGVBQWU7YUFDbkIsS0FBSzthQUNMLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNaLENBQUM7SUFFRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQThCLEVBQUUsQ0FBVTtRQUN4RCxJQUFJLENBQUMsWUFBWSxLQUFLLEVBQUU7WUFDdEIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3JCLGVBQWUsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLE9BQU87U0FDUjtRQUVELGVBQWU7YUFDWixLQUFLO2FBQ0wsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNmLENBQUM7O0FBR0gsU0FBZ0IsY0FBYyxDQUFDLE1BQWlCLEVBQUUsV0FBVyxHQUFHLElBQUk7SUFDbEUsSUFBSSxXQUFXLEVBQUU7UUFDZixNQUFNLEtBQUssR0FBRyxlQUFlLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQy9DLElBQUksS0FBSyxFQUFFO1lBQ1QsT0FBTyxLQUFLLENBQUM7U0FDZDtLQUNGO0lBRUQsTUFBTSxHQUFHLEdBQUcsdUJBQVEsRUFBQyxNQUFNLENBQUMsQ0FBQztJQUM3QixJQUFJLFdBQVcsRUFBRTtRQUNmLGVBQWUsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQ3ZDO0lBQ0QsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBYkQsd0NBYUM7Ozs7Ozs7QUMxQ0Qsc0Q7Ozs7Ozs7OztBQ0FBLElBQVksSUFJWDtBQUpELFdBQVksSUFBSTtJQUNkLHVCQUFlO0lBQ2YseUJBQWlCO0lBQ2pCLDZCQUFxQjtBQUN2QixDQUFDLEVBSlcsSUFBSSxHQUFKLFlBQUksS0FBSixZQUFJLFFBSWY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDSEQsMENBQW9JO0FBQ3BJLDRDQUFpRDtBQUNqRCwrREFBdUU7QUFHaEUsSUFBTSxlQUFlLEdBQXJCLE1BQU0sZUFBZTtJQVExQixNQUFNLENBQVU7SUFTaEIsTUFBTSxDQUFVO0lBU2hCLEtBQUssQ0FBVTtJQVNmLFNBQVMsQ0FBVTtJQVduQixxQkFBcUIsQ0FBeUI7SUFHOUMsTUFBTTtRQUNKLE9BQU87WUFDTCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7U0FDaEUsQ0FBQztJQUNKLENBQUM7SUFFRCxVQUFVO1FBQ1IsT0FBTywwQkFBVSxFQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ25DLENBQUM7Q0FDRjtBQXpEQztJQUFDLDJCQUFhLEVBQUM7UUFDYixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLElBQUk7UUFDYixTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO0tBQ1QsQ0FBQzs7K0NBQ2M7QUFDaEI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsUUFBUTtRQUNkLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxFQUFFO0tBQ1osQ0FBQzs7K0NBQ2M7QUFDaEI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsT0FBTztRQUNiLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxFQUFFO0tBQ1osQ0FBQzs7OENBQ2E7QUFDZjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxXQUFXO1FBQ2pCLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxFQUFFO0tBQ1osQ0FBQzs7a0RBQ2lCO0FBRW5CO0lBQUMsc0JBQVEsRUFDUCxHQUFHLEVBQUUsQ0FBQyxvREFBcUIsRUFDM0IsQ0FBQyxxQkFBMkMsRUFBRSxFQUFFLENBQUMscUJBQXFCLENBQUMsZUFBZSxFQUN0RixFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxDQUM5QztJQUNBLHdCQUFVLEVBQUM7UUFDVixJQUFJLEVBQUUsUUFBUTtRQUNkLG9CQUFvQixFQUFFLFFBQVE7S0FDL0IsQ0FBQztrREFDc0Isb0RBQXFCLG9CQUFyQixvREFBcUI7OERBQUM7QUE5Q25DLGVBQWU7SUFEM0Isb0JBQU0sRUFBQyxpQkFBaUIsRUFBRSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUMsQ0FBQztHQUNsQyxlQUFlLENBMEQzQjtBQTFEWSwwQ0FBZTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNONUIsMENBQXlGO0FBRXpGLHlEQUEyRDtBQUlwRCxJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFxQjtJQVFoQyxFQUFFLENBQVU7SUFRWixJQUFJLENBQVU7SUFRZCxNQUFNLENBQWU7SUFpQnJCLGVBQWUsQ0FBbUI7Q0FDbkM7QUF6Q0M7SUFBQywyQkFBYSxFQUFDO1FBQ2IsSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsSUFBSTtRQUNWLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixPQUFPLEVBQUUsSUFBSTtLQUNkLENBQUM7O2lEQUNVO0FBQ1o7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsTUFBTTtRQUNaLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixRQUFRLEVBQUUsS0FBSztLQUNoQixDQUFDOzttREFDWTtBQUNkO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFFBQVE7UUFDZCxTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsUUFBUSxFQUFFLElBQUk7S0FDZixDQUFDOztxREFDbUI7QUFhckI7SUFBQyxzQkFBUSxFQUNQLEdBQUcsRUFBRSxDQUFFLHdDQUFlLEVBQ3RCLENBQUMsZUFBZ0MsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLHFCQUFxQixDQUM1RTtrREFDaUIsd0NBQWUsb0JBQWYsd0NBQWU7OERBQUM7QUF6Q3ZCLHFCQUFxQjtJQURqQyxvQkFBTSxFQUFDLHVCQUF1QixFQUFFLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBQyxDQUFDO0dBQ3hDLHFCQUFxQixDQTBDakM7QUExQ1ksc0RBQXFCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ05sQyx3Q0FBNEM7QUFDNUMsd0RBQStEO0FBQy9ELHNEQUEyRDtBQUdwRCxJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFvQjtJQUVaO0lBQ0E7SUFGbkIsWUFDbUIsbUJBQXVDLEVBQ3ZDLHFCQUEyQztRQUQzQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQW9CO1FBQ3ZDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBc0I7SUFDM0QsQ0FBQztJQUVKLEtBQUssQ0FBQyxlQUFlLENBQUMsU0FBaUIsRUFBRSxPQUFlLEVBQUUsU0FBaUIsRUFBRSxZQUFvQjtRQUcvRixNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFO1lBQ2pELE1BQU0sRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFO1lBQzFCLFNBQVMsRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFO1lBQy9CLFNBQVMsRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFO1lBQy9CLFlBQVksRUFBRSxZQUFZLENBQUMsUUFBUSxFQUFFO1NBQ3RDLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDO1lBQ2pELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3RELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO1NBQzlDLENBQUMsQ0FBQztRQUVILE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUU7WUFDckQsTUFBTSxFQUFFLFNBQVMsQ0FBQyxRQUFRLEVBQUU7WUFDNUIsU0FBUyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3BDLEtBQUssRUFBRSxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtZQUNuQyxNQUFNLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7U0FDdEMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBNUJZLG9CQUFvQjtJQURoQyx1QkFBVSxHQUFFO3lEQUc2Qix3Q0FBa0Isb0JBQWxCLHdDQUFrQixvREFDaEIsNENBQW9CLG9CQUFwQiw0Q0FBb0I7R0FIbkQsb0JBQW9CLENBNEJoQztBQTVCWSxvREFBb0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0xqQyx3Q0FBb0Q7QUFDcEQsMENBQW1EO0FBQ25ELDBDQUE0QztBQUM1QywrREFBdUU7QUFDdkUseURBQTJEO0FBQzNELDBDQUFpRDtBQUNqRCw0Q0FBNkQ7QUFDN0QsK0NBQXNEO0FBRXRELHlDQUErQztBQUMvQyxtREFBaUU7QUFDakUsc0RBQTJEO0FBSXBELElBQU0sb0JBQW9CLDRCQUExQixNQUFNLG9CQUFxQixTQUFRLDJCQUE2QjtJQUszRDtJQUVBO0lBQ0E7SUFDUztJQUNBO0lBVFgsTUFBTSxHQUFXLElBQUksZUFBTSxDQUFDLHNCQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZELGtCQUFrQixDQUFTO0lBQ25DLFlBRVUseUJBQXNELEVBRXRELDJCQUE4RCxFQUM5RCxVQUFzQixFQUNiLGdCQUFvQyxFQUNwQyxhQUE0QjtRQUU3QyxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDcEMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQVMsc0JBQXNCLENBQUMsRUFBRSxzQkFBVSxDQUFDLENBQUM7UUFScEUsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUE2QjtRQUV0RCxnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQW1DO1FBQzlELGVBQVUsR0FBVixVQUFVLENBQVk7UUFDYixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW9CO1FBQ3BDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBSTdDLE9BQU8sQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsYUFBYSxDQUFDLFVBQVUsQ0FBUyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ2pGLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFDRCxLQUFLLENBQUMscUJBQXFCO1FBQ3pCLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2pFLE9BQU8sV0FBVyxDQUFDO0lBQ3JCLENBQUM7SUFDRCx1QkFBdUI7UUFDckIsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbkUsQ0FBQztJQUNELGNBQWM7UUFDWixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBQ0Qsb0JBQW9CO1FBQ2xCLE9BQU8sNENBQXFCLEVBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFjLEVBQUUsS0FBMkI7UUFDMUQsT0FBTyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1FBRTVDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1lBQ2xELE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pELENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFDRCxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQXNCLEVBQUUsTUFBYyxFQUFFLEtBQTJCO1FBQ25GLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QyxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0MsTUFBTSxRQUFRLEdBQUc7WUFDZixNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU0sSUFBSSxXQUFXLENBQUMsTUFBTTtZQUMxQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssSUFBSSxXQUFXLENBQUMsS0FBSztZQUN2QyxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsSUFBSSxXQUFXLENBQUMsU0FBUztTQUNwRCxDQUFDO1FBQ0YsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLG9EQUFxQixFQUFFO1lBQzFDLEVBQUUsRUFBRSxFQUFFLENBQUMsUUFBUSxFQUFFO1lBQ2pCLE1BQU0sRUFBRSxNQUFNO1lBQ2QsSUFBSSxFQUFFLE1BQU0sQ0FBQywwQkFBVSxFQUFDO2dCQUN0QixNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFDdkIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7Z0JBQ3RCLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO2FBQzNCLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRTtTQUNmLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ1gsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLHdDQUFlLEVBQUU7WUFDcEMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUN6QixLQUFLLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1lBQ3ZCLFNBQVMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7WUFDL0IsTUFBTSxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUU7U0FDMUIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFFZixLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDM0MsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBQ3pDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7Z0JBQ2hFLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7YUFDdEUsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEQsTUFBTSxVQUFVLEdBQVcsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMxRyxNQUFNLFVBQVUsR0FBVyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ2hGLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDMUQsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ2hCLElBQUksTUFBTSxJQUFJLElBQUksRUFBRTtnQkFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLG9EQUFxQixFQUFFO29CQUM5QyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRTtvQkFDaEIsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDO2lCQUNuQixFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2I7WUFDRCxJQUFJLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxvREFBcUIsRUFBRTtvQkFDOUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUU7b0JBQ3JCLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQztpQkFDbkIsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNiO1lBQ0QsTUFBTSxVQUFVLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMzQixJQUFJLFVBQVUsSUFBSSxFQUFFLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxvREFBcUIsRUFBRTtvQkFDOUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUU7b0JBQ3pCLElBQUksRUFBRSxhQUFhO2lCQUNwQixFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2I7WUFDRCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEIsQ0FBQyxFQUFFLENBQUM7U0FDTDtJQUNILENBQUM7SUFFRCxLQUFLLENBQUMsZUFBZSxDQUFDLE1BQWMsRUFBRSxRQUE0QjtRQUNoRSxPQUFPLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1lBQ3pELE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUM5RixNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNwRCxNQUFNLEVBQUUsTUFBTTtnQkFDZCxTQUFTLEVBQUUsU0FBUyxDQUFDLElBQUk7YUFDMUIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBR0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFlO1FBQzNCLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUMsQ0FBQyxDQUFDO1FBQzVGLElBQUksTUFBTSxJQUFJLElBQUksRUFBRTtZQUNsQixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0QsWUFBWSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7WUFDMUIsWUFBWSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7WUFDekIsWUFBWSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMzRSxZQUFZLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN6QyxPQUFPLFlBQVksQ0FBQztTQUNyQjtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFDRCxLQUFLLENBQUMsT0FBTztRQUNYLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLDJCQUEyQixDQUFDLFNBQVMsQ0FBQztZQUM5RCxFQUFFLEVBQUUsRUFBRSxDQUFDLFFBQVEsRUFBRTtTQUNsQixDQUFDLENBQUM7UUFDSCxJQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUU7WUFDbEIsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3ZFLE1BQU0sSUFBSSxDQUFDLDJCQUEyQixDQUFDLE1BQU0sQ0FBQztnQkFDNUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ2pCLElBQUksRUFBRSxhQUFhO2FBQ3BCLENBQUMsQ0FBQztZQUNILE9BQU87Z0JBQ0wsRUFBRSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ2pCLElBQUksRUFBRSxhQUFhO2FBQ3BCLENBQUM7U0FDSDtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQTJCO1FBQ3ZDLE1BQU0sTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlCLElBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztTQUM5QztRQUNELE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFaEQsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRTNFLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1lBR2xELE1BQU0sT0FBTyxDQUFDLE1BQU0sQ0FBQyxvREFBcUIsRUFBRTtnQkFDMUMsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsRUFBRSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ2pCLElBQUksRUFBRSxhQUFhO2FBQ3BCLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ1gsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLHdDQUFlLEVBQUU7Z0JBQ3BDLE1BQU0sRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFO2dCQUN6QixNQUFNLEVBQUcsS0FBSyxDQUFDLE1BQWlCO2dCQUNoQyxLQUFLLEVBQUUsR0FBRztnQkFDVixTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQzthQUM1QyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsZUFBZSxDQUFDLE1BQWM7UUFDbEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN2QyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQztZQUNwRCxLQUFLLEVBQUU7Z0JBQ0wsRUFBRSxFQUFFLGdCQUFFLEVBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2FBQ3JDO1lBQ0QsS0FBSyxFQUFFO2dCQUNMLEVBQUUsRUFBRSxLQUFLO2FBQ1Y7U0FDRixDQUFDLENBQUM7UUFDSCxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDMUMsQ0FBQztDQUNGO0FBdkxZLG9CQUFvQjtJQURoQyx1QkFBVSxHQUFFO0lBS1IseUNBQWdCLEVBQUMsd0NBQWUsQ0FBQztJQUVqQyx5Q0FBZ0IsRUFBQyxvREFBcUIsQ0FBQzt5REFETCxvQkFBVSxvQkFBVixvQkFBVSxvREFFUixvQkFBVSxvQkFBVixvQkFBVSxvREFDM0Isb0JBQVUsb0JBQVYsb0JBQVUsb0RBQ0ssd0NBQWtCLG9CQUFsQix3Q0FBa0Isb0RBQ3JCLHNCQUFhLG9CQUFiLHNCQUFhO0dBVnBDLG9CQUFvQixDQXVMaEM7QUF2TFksb0RBQW9COzs7Ozs7Ozs7O0FDYmpDLE1BQXNCLFlBQVk7SUFFdEIsU0FBUyxDQUFVO0lBQ3JCLFNBQVMsQ0FBVTtJQUNuQixpQkFBaUIsQ0FBdUI7SUFDekMsUUFBUSxDQUF5QztJQUN4RCxZQUFZLFVBQWtCLEVBQUUsUUFBaUQ7UUFDL0UsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNWLFVBQVU7U0FDWCxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFMUMsQ0FBQztJQU1ELFdBQVcsQ0FBQyxRQUFnQjtRQUMxQixNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakMsTUFBTSxHQUFHLEdBQWEsRUFBRSxDQUFDO1FBQ3pCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDOUIsTUFBTSxTQUFTLEdBQUcsT0FBTyxHQUFHLENBQUMsRUFBRSxJQUFLLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3BELEtBQUssSUFBSSxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDM0MsSUFBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDakIsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7YUFDbEI7aUJBQU07Z0JBQ0wsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7YUFDbEI7U0FDRjtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUtELG1CQUFtQjtRQUNqQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7UUFDbkQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDM0YsS0FBSSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFDLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFHLEtBQUssRUFBRSxFQUFFO1lBQ3RELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFELElBQUksYUFBYSxJQUFJLFNBQVMsRUFBRTtnQkFDOUIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7YUFDckc7U0FDRjtJQUNILENBQUM7SUFDRCxlQUFlLENBQUMsT0FBZTtRQUM3QixPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUNELFlBQVk7UUFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDeEIsQ0FBQztJQUNELHFCQUFxQixDQUFDLEtBQWE7UUFDakMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqRCxJQUFHLENBQUMsTUFBTSxFQUFFO1lBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDVixLQUFLO2dCQUNMLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUzthQUN0QixDQUFDLENBQUM7WUFDSCxNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7U0FDL0M7UUFDRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0NBQ0Y7QUFqRUQsb0NBaUVDOzs7Ozs7Ozs7O0FDbkVELDRDQUFvRTtBQUlwRSxTQUFnQiw0QkFBNEIsQ0FBQyxTQUFpQjtJQUM1RCxPQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNyQyxDQUFDO0FBRkQsb0VBRUM7QUFDRCxTQUFnQiwwQkFBMEI7SUFDeEMsT0FBTyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNsQixDQUFDO0FBRkQsZ0VBRUM7QUFDRCxTQUFnQiw2QkFBNkI7SUFDM0MsT0FBTztRQUNMLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO1FBQ2xCLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO1FBQ2xCLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtLQUNYLENBQUM7QUFDSixDQUFDO0FBTkQsc0VBTUM7QUFHRCxTQUFnQixxQkFBcUIsQ0FBQyxTQUFpQjtJQUNyRCxPQUFPLDBCQUFVLEVBQUMsNEJBQTRCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUM3RCxDQUFDO0FBRkQsc0RBRUM7QUFDRCxTQUFnQixtQkFBbUI7SUFDakMsT0FBTywwQkFBVSxFQUFDLDBCQUEwQixFQUFFLENBQUMsQ0FBQztBQUNsRCxDQUFDO0FBRkQsa0RBRUM7QUFFRCxTQUFnQixzQkFBc0I7SUFDcEMsT0FBTywwQkFBVSxFQUFDLDZCQUE2QixFQUFFLENBQUMsQ0FBQztBQUNyRCxDQUFDO0FBRkQsd0RBRUM7Ozs7Ozs7Ozs7QUMzQkQseUNBQTZEO0FBQzdELG1EQUFxRDtBQUVyRCxNQUFNLE9BQU8sR0FBUSxFQUFFLENBQUM7QUFDWCxrQkFBVSxHQUFHLFlBQVksQ0FBQztBQUV2QyxTQUFnQixnQkFBZ0IsQ0FBQyxHQUFRLEVBQUUsV0FBZ0IsRUFBRTtJQUMzRCxNQUFNLE1BQU0sR0FBUSxRQUFRLENBQUM7SUFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUMvQixJQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNmLE9BQU87U0FDUjtRQUVELE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0QixJQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2YsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUNsQjtRQUVELE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsOEJBQWlCLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM1QyxDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFoQkQsNENBZ0JDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLE1BQWdCO0lBQ3pDLE9BQU8sMEJBQWEsRUFBQyxxQ0FBYyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUZELGdDQUVDO0FBRUQsU0FBUyxZQUFZLENBQUMsR0FBNkI7SUFDakQsSUFBSSxHQUFHLFlBQVksS0FBSyxFQUFFO1FBQ3hCLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFPLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9DLE9BQU8sMEJBQWEsRUFBQyxxQ0FBYyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7S0FDOUM7SUFFRCxPQUFRLDBCQUFhLEVBQUMscUNBQWMsRUFBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRSxDQUFDOzs7Ozs7Ozs7O0FDcENELHlDQUEwQztBQUMxQyx3Q0FBc0M7QUFHdEMsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDO0FBRWxCLE1BQU0sUUFBUSxHQUFHLENBQUMsR0FBVyxFQUFFLEVBQUU7SUFDdEMsT0FBTyxrQkFBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUN4QyxDQUFDLENBQUM7QUFGVyxnQkFBUSxZQUVuQjtBQUVLLE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxXQUFtQixFQUFFLEVBQUU7SUFDekQsTUFBTSxPQUFPLEdBQUcsY0FBSyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNsRCxPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDLENBQUM7QUFIVywyQkFBbUIsdUJBRzlCO0FBRUYsU0FBZ0IscUJBQXFCO0lBQ25DLE1BQU0sVUFBVSxHQUFHLHFCQUFxQixDQUFDLGNBQUssQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNoRSxPQUFPLFVBQVUsQ0FBQztBQUNwQixDQUFDO0FBSEQsc0RBR0M7QUFFRCxTQUFnQixrQkFBa0IsQ0FBQyxHQUFXO0lBQzVDLE1BQU0sR0FBRyxHQUFlLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNuRCxLQUFLLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUN6QyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNoQztJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQU5ELGdEQU1DO0FBRUQsU0FBZ0Isb0JBQW9CLENBQUMsQ0FBUztJQUM1QyxNQUFNLEdBQUcsR0FBZSxJQUFJLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMzQyxLQUFLLElBQUksR0FBRyxHQUFHLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQ2xDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzVCLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0tBQ2Q7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFQRCxvREFPQztBQUVELFNBQWdCLG9CQUFvQixDQUFDLENBQWE7SUFDaEQsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ2IsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDdkMsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDakIsR0FBRyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDNUI7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFQRCxvREFPQztBQUVELFNBQWdCLHFCQUFxQixDQUFDLFVBQWtCO0lBQ3RELE1BQU0sWUFBWSxHQUFHLGNBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDaEQsTUFBTSxVQUFVLEdBQUcsb0JBQW9CLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDdEQsT0FBTyxVQUFVLENBQUM7QUFDcEIsQ0FBQztBQUpELHNEQUlDO0FBRUQsU0FBZ0IsV0FBVyxDQUFDLE1BQWM7SUFDeEMsTUFBTSxHQUFHLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFFLE9BQU8sa0JBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDeEMsQ0FBQztBQUhELGtDQUdDO0FBRUQsU0FBZ0IsYUFBYSxDQUFDLE1BQWM7SUFDMUMsT0FBTyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBRkQsc0NBRUM7QUFFRCxTQUFnQixlQUFlLENBQUMsR0FBVztJQUN6QyxPQUFPLGNBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQUZELDBDQUVDO0FBRUQsU0FBZ0IsZUFBZSxDQUFDLENBQVM7SUFDdkMsTUFBTSxHQUFHLEdBQVcsRUFBRSxJQUFJLEdBQUcsQ0FBQztJQUM5QixNQUFNLEdBQUcsR0FBcUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUUvRCxJQUFJLE1BQU0sR0FBVyxDQUFDLENBQUM7SUFDdkIsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDekMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFDeEIsTUFBTSxHQUFHLE1BQU0sR0FBRyxHQUFHLENBQUM7S0FDdkI7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFWRCwwQ0FVQztBQUVELFNBQWdCLGFBQWEsQ0FBQyxDQUFTO0lBQ3JDLE9BQU8sSUFBSSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDL0IsQ0FBQztBQUZELHNDQUVDO0FBRUQsU0FBZ0IsaUJBQWlCLENBQUMsR0FBVztJQUMzQyxNQUFNLEdBQUcsR0FBRyxjQUFLLENBQUMsT0FBTyxDQUFDLGNBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEUsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBSEQsOENBR0M7QUFJRCxTQUFnQixrQkFBa0IsQ0FBQyxjQUEwQjtJQUMzRCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsQ0FBQztBQUZELGdEQUVDO0FBRUQsU0FBZ0IsV0FBVyxDQUFDLGlCQUF5QjtJQUNuRCxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3hELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBSEQsa0NBR0M7QUFFRCxTQUFnQixpQkFBaUIsQ0FBQyxJQUFTO0lBQ3pDLElBQUksSUFBSSxZQUFZLEtBQUssRUFBRTtRQUN6QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzVDO0lBRUQsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7UUFDNUIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBRTFCO0lBRUQsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7UUFFNUIsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNyRCxPQUFPLG9CQUFRLEVBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFFRCxPQUFPLElBQUksQ0FBQztLQUNiO0lBRUQsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDekIsQ0FBQztBQXBCRCw4Q0FvQkM7QUFFRCxTQUFnQixrQkFBa0IsQ0FBQyxVQUFzQixFQUFFLGVBQXVCLFlBQVk7SUFDNUYsT0FBTyxNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDaEUsQ0FBQztBQUZELGdEQUVDO0FBRUQsU0FBZ0Isa0JBQWtCLENBQUMsS0FBYSxFQUFFLGVBQXVCLFlBQVk7SUFDbkYsSUFBSSxZQUFZLEdBQUcsQ0FBQztRQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsb0VBQW9FLENBQUMsQ0FBQztJQUM1RyxNQUFNLGdCQUFnQixHQUFHLGlCQUFpQixDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztJQUNoRSxPQUFPLHFCQUFxQixDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDakQsQ0FBQztBQUpELGdEQUlDO0FBRUQsU0FBZ0IsaUJBQWlCLENBQUMsS0FBYSxFQUFFLGVBQXVCLFlBQVk7SUFDbEYsSUFBSSxZQUFZLEdBQUcsQ0FBQztRQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsb0VBQW9FLENBQUMsQ0FBQztJQUM1RyxNQUFNLGdCQUFnQixHQUFHLGNBQWMsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDN0QsT0FBTyx5QkFBeUIsQ0FBQyxnQkFBZ0IsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNuRSxDQUFDO0FBSkQsOENBSUM7QUFFRCxTQUFTLDZCQUE2QixDQUFDLEdBQVc7SUFDaEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMseUJBQXlCLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUQsSUFBSSxLQUFLLEtBQUssSUFBSTtRQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsc0ZBQXNGLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDakksSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUM7UUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDBFQUEwRSxDQUFDLENBQUM7SUFDbEgsT0FBTyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3pCLENBQUM7QUFFRCxTQUFnQixxQkFBcUIsQ0FBQyxLQUFpQjtJQUNyRCxNQUFNLGlCQUFpQixHQUFHLENBQUMsSUFBWSxFQUFVLEVBQUUsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekYsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLEtBQWEsRUFBRSxJQUFZLEVBQUUsRUFBRSxDQUFDLEtBQUssR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1RixPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDOUMsQ0FBQztBQUpELHNEQUlDO0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxHQUFXO0lBQ3hDLE1BQU0sS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLHlCQUF5QixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzlELElBQUksS0FBSyxLQUFLLElBQUk7UUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLHNGQUFzRixHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ2pJLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDO1FBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQywwRUFBMEUsQ0FBQyxDQUFDO0lBQ2xILE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1QixNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUN6QyxNQUFNLEtBQUssR0FBRyxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN6QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxFQUFFLEVBQUUsQ0FBQyxFQUFFO1FBQ25DLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUNsRjtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVELFNBQVMseUJBQXlCLENBQUMsS0FBYSxFQUFFLElBQVk7SUFDNUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQztJQUMxQixNQUFNLGVBQWUsR0FBRyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0lBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUNwRixDQUFDO0FBRUQsU0FBUyxjQUFjLENBQUMsS0FBYSxFQUFFLGVBQXVCLFlBQVk7SUFDeEUsTUFBTSxJQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNwRCxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUMsQ0FBQztBQUVNLE1BQU0scUJBQXFCLEdBQUcsQ0FDbkMsR0FBMEIsRUFDQyxFQUFFO0lBQzdCLE9BQU87UUFDTCxFQUFFLEVBQUUsQ0FBQyxtQkFBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsbUJBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzVGLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRTtLQUNwQixDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBUFcsNkJBQXFCLHlCQU9oQztBQUVLLE1BQU0scUJBQXFCLEdBQUcsQ0FBQyxRQUEwQixFQUFzQixFQUFFO0lBQ3RGLE9BQU8sQ0FBQyxtQkFBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxtQkFBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RFLENBQUMsQ0FBQztBQUZXLDZCQUFxQix5QkFFaEM7QUFFRixrQkFBZTtJQUNiLFFBQVEsRUFBUixnQkFBUTtJQUNSLHFCQUFxQjtJQUNyQixtQkFBbUIsRUFBbkIsMkJBQW1CO0lBQ25CLHFCQUFxQjtJQUNyQixrQkFBa0I7SUFDbEIsb0JBQW9CO0lBQ3BCLG9CQUFvQjtJQUNwQixxQkFBcUI7SUFDckIsV0FBVztJQUNYLGFBQWE7SUFDYixlQUFlO0lBQ2YsZUFBZTtJQUNmLGFBQWE7SUFDYixpQkFBaUI7SUFDakIsa0JBQWtCO0lBQ2xCLFdBQVc7SUFDWCxrQkFBa0I7SUFDbEIsaUJBQWlCO0lBQ2pCLHFCQUFxQixFQUFyQiw2QkFBcUI7Q0FDdEIsQ0FBQztBQUVGLFNBQWdCLGNBQWMsQ0FBQyxNQUFjO0lBQzNDLE9BQU8sTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUZELHdDQUVDOzs7Ozs7O0FDak5ELG9DOzs7Ozs7Ozs7QUNFQSxNQUFNLFdBQVcsR0FBRyxtQkFBTyxDQUFDLEVBQWEsQ0FBQyxDQUFDO0FBQzNDLE1BQU0sRUFBRSxHQUFHLG1CQUFPLENBQUMsRUFBYyxDQUFDLENBQUM7QUFHdEIsa0JBQVUsR0FBRyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDbkQsQ0FBQyxLQUFLO0lBQ0osYUFBSyxHQUFHLE1BQU0sa0JBQVUsQ0FBQztBQUMzQixDQUFDLENBQUMsRUFBRSxDQUFDO0FBRUwsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFTLEVBQVUsRUFBRTtJQUMxQyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzVCLE9BQU8sTUFBTSxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUU7UUFDekIsTUFBTSxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUM7S0FDdkI7SUFDRCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3BDLENBQUMsQ0FBQztBQUVGLE1BQWEsV0FBVztJQUNkLFVBQVUsQ0FBUztJQUNwQixTQUFTLENBQXFCO0lBRXJDLFlBQVksVUFBa0I7UUFDNUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFFO1lBQzVDLElBQUksVUFBVSxFQUFFLEVBQUUsSUFBSSxVQUFVLEVBQUU7U0FDbkMsQ0FBQyxDQUFDLENBQUMsYUFBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFhO1FBQzNCLE9BQU8sYUFBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQVM7UUFDbEIsT0FBTyxhQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVELFlBQVksQ0FBQyxPQUFlO1FBQzFCLE1BQU0sUUFBUSxHQUFHLGFBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxNQUFNLFNBQVMsR0FBRyxhQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDaEUsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQztJQUVELE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBbUIsRUFBRSxTQUFnQyxFQUFDLFNBQTZCO1FBQy9GLE9BQU8sYUFBSyxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7Q0FDRjtBQTVCRCxrQ0E0QkM7Ozs7Ozs7QUMvQ0QseUM7Ozs7OztBQ0FBLDBDOzs7Ozs7Ozs7QUNBQSwyQ0FBa0Q7QUFFbEQsTUFBTSxlQUFlO0lBQ25CLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUV6QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQThCO1FBQzVDLElBQUksQ0FBQyxZQUFZLEtBQUssRUFBRTtZQUN0QixNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDckIsT0FBTyxlQUFlLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3RDO1FBRUQsT0FBTyxlQUFlO2FBQ25CLEtBQUs7YUFDTCxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDWixDQUFDO0lBRUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUE4QixFQUFFLENBQVU7UUFDeEQsSUFBSSxDQUFDLFlBQVksS0FBSyxFQUFFO1lBQ3RCLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNyQixlQUFlLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqQyxPQUFPO1NBQ1I7UUFFRCxlQUFlO2FBQ1osS0FBSzthQUNMLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDZixDQUFDOztBQUdILFNBQWdCLGNBQWMsQ0FBQyxNQUFpQixFQUFFLFdBQVcsR0FBRyxJQUFJO0lBQ2xFLElBQUksV0FBVyxFQUFFO1FBQ2YsTUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvQyxJQUFJLEtBQUssRUFBRTtZQUNULE9BQU8sS0FBSyxDQUFDO1NBQ2Q7S0FDRjtJQUVELE1BQU0sR0FBRyxHQUFHLHVCQUFRLEVBQUMsTUFBTSxDQUFDLENBQUM7SUFDN0IsSUFBSSxXQUFXLEVBQUU7UUFDZixlQUFlLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztLQUN2QztJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQWJELHdDQWFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMxQ0Qsd0NBQW9EO0FBQ3BELHlDQUErQztBQUMvQywwQ0FBbUQ7QUFFbkQsMENBQWlGO0FBQ2pGLDRDQUE2RDtBQUM3RCwrQ0FBc0Q7QUFHdEQsbURBQWdFO0FBQ2hFLHVEQUF1RDtBQUN2RCw2REFBbUU7QUFHNUQsSUFBTSxrQkFBa0IsMEJBQXhCLE1BQU0sa0JBQW1CLFNBQVEsMkJBQTJCO0lBSTlDO0lBRUE7SUFDQTtJQUNUO0lBUEYsTUFBTSxHQUFXLElBQUksZUFBTSxDQUFDLG9CQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdELFlBRW1CLG1CQUE4QyxFQUU5Qyx5QkFBMEQsRUFDMUQsVUFBc0IsRUFDL0IsYUFBNEI7UUFFcEMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ2hDLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFTLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxFQUFFLHNCQUFVLENBQUMsQ0FBQztRQVByRCx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQTJCO1FBRTlDLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBaUM7UUFDMUQsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUMvQixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUlwQyxPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUNELEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxTQUFpQjtRQUMzQyxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQzVEO1lBQ0UsS0FBSyxFQUFFO2dCQUNMLFNBQVMsRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFO2dCQUMvQixNQUFNLEVBQUUsaUJBQUcsRUFBQyxvQkFBTSxHQUFFLENBQUM7YUFDdEI7U0FDRixDQUNGLENBQUM7UUFDRixPQUFPLFdBQVcsQ0FBQztJQUNyQixDQUFDO0lBQ0QsY0FBYztRQUNaLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxvQkFBb0I7UUFDbEIsT0FBTywwQ0FBbUIsR0FBRSxDQUFDO0lBQy9CLENBQUM7SUFDRCxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQWMsRUFBRSxLQUF5QjtRQUN4RCxPQUFPLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDMUMsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7WUFDbEQsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDakQsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLENBQUMsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUNELEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBc0IsRUFBRSxXQUFtQixFQUFFLEtBQXlCO1FBQ3RGLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM3QyxNQUFNLGlCQUFpQixHQUFHLE1BQU0sQ0FBQywwQkFBVSxFQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDckksTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUVsQyxNQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUMsZ0RBQW1CLEVBQUU7WUFDeEMsU0FBUyxFQUFFLFNBQVM7WUFDcEIsRUFBRSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUU7WUFDakIsTUFBTSxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUU7WUFDOUIsSUFBSSxFQUFFLGlCQUFpQjtTQUN4QixFQUFFLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDeEIsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLG9DQUFhLEVBQUU7WUFDbEMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUU7WUFDOUIsU0FBUyxFQUFFLFNBQVM7WUFDcEIsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTO1lBQzFCLFlBQVksRUFBRSxLQUFLLENBQUMsWUFBWTtTQUNqQyxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQzNDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUN6QyxJQUFJLENBQUMseUJBQXlCLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUM7Z0JBQ3BGLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQzthQUMxRixDQUFDLENBQUM7WUFDSCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRCxNQUFNLFVBQVUsR0FBVyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzFHLE1BQU0sVUFBVSxHQUFXLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDMUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDaEYsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMxRCxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUNWLEVBQUUsRUFBRSxLQUFLO2dCQUNULFdBQVc7Z0JBQ1gsQ0FBQztnQkFDRCxNQUFNO2dCQUNOLE1BQU07Z0JBQ04sVUFBVTtnQkFDVixVQUFVO2dCQUNWLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUztnQkFDdEIsYUFBYTthQUNkLENBQUMsQ0FBQztZQUNILE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNoQixJQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUU7Z0JBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxnREFBbUIsRUFBRTtvQkFDNUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQztpQkFDM0QsRUFBRSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDMUI7WUFDRCxJQUFJLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxnREFBbUIsRUFBRTtvQkFDNUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQztpQkFDaEUsRUFBRSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDMUI7WUFDRCxNQUFNLFVBQVUsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzNCLElBQUksVUFBVSxJQUFJLEVBQUUsRUFBRTtnQkFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQy9DLEVBQUUsRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsYUFBYTtxQkFDckUsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMzQjtZQUNELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4QixDQUFDLEVBQUUsQ0FBQztTQUNMO1FBQ0QsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzNDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZSxFQUFFLFNBQWlCO1FBQzlDLE1BQU0sTUFBTSxHQUFJLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFO1lBQ2hGLFNBQVMsRUFBRSxTQUFTLEVBQUMsQ0FBQyxDQUFDO1FBQzNCLElBQUksTUFBTSxJQUFJLElBQUksRUFBRTtZQUVsQixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUUzRSxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtnQkFFbEQsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLGdEQUFtQixFQUFFO29CQUN4QyxTQUFTLEVBQUUsU0FBUztvQkFDcEIsRUFBRSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUU7b0JBQ2pCLE1BQU0sRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFO29CQUMxQixJQUFJLEVBQUUsYUFBYTtpQkFDcEIsRUFBRTtvQkFDRCxJQUFJLEVBQUUsV0FBVztpQkFDbEIsQ0FBQyxDQUFDO2dCQUNILE1BQU0sT0FBTyxDQUFDLE1BQU0sQ0FBQyxvQ0FBYSxFQUFFO29CQUNsQyxNQUFNLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRTtvQkFDMUIsU0FBUyxFQUFFLFNBQVM7b0JBQ3BCLFNBQVMsRUFBRSxHQUFHO29CQUNkLFlBQVksRUFBRSxHQUFHO2lCQUNsQixFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDOUIsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxFQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBQyxDQUFDLENBQUM7U0FDM0c7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBQ0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFpQjtRQUM3QixNQUFNLE1BQU0sR0FBSSxNQUFNLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsRUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUMsQ0FBQyxDQUFDO1FBQzFHLElBQUksTUFBTSxJQUFJLElBQUksRUFBRTtZQUNsQixNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdkUsTUFBTSxJQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxDQUFDO2dCQUMxQyxTQUFTLEVBQUUsU0FBUztnQkFDcEIsRUFBRSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ2pCLElBQUksRUFBRSxhQUFhO2FBQ3BCLENBQUMsQ0FBQztZQUNILE9BQU87Z0JBQ0wsU0FBUyxFQUFFLFNBQVM7Z0JBQ3BCLEVBQUUsRUFBRSxDQUFDO2dCQUNMLE1BQU0sRUFBRSxJQUFJO2dCQUNaLElBQUksRUFBRSxhQUFhO2FBQ3BCLENBQUM7U0FDSDtRQUNELE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNyRSxPQUFPO1lBQ0wsU0FBUyxFQUFFLFNBQVM7WUFDcEIsRUFBRSxFQUFFLENBQUM7WUFDTCxNQUFNLEVBQUUsSUFBSTtZQUNaLElBQUksRUFBRSxVQUFVO1NBQ2pCLENBQUM7SUFDSixDQUFDO0lBQ0QsS0FBSyxDQUFDLGVBQWUsQ0FBQyxNQUFjO1FBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBQ0QsS0FBSyxDQUFDLDBCQUEwQixDQUFDLE1BQWMsRUFBRSxTQUFpQjtRQUNoRSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQztZQUNsRCxLQUFLLEVBQUU7Z0JBQ0wsU0FBUyxFQUFFLFNBQVM7Z0JBQ3BCLEVBQUUsRUFBRSxnQkFBRSxFQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzthQUNuQztZQUNELEtBQUssRUFBRTtnQkFDTCxFQUFFLEVBQUUsS0FBSzthQUNWO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7Q0FFRjtBQWhMWSxrQkFBa0I7SUFEOUIsdUJBQVUsR0FBRTtJQUlSLHlDQUFnQixFQUFDLG9DQUFhLENBQUM7SUFFL0IseUNBQWdCLEVBQUMsZ0RBQW1CLENBQUM7eURBREEsb0JBQVUsb0JBQVYsb0JBQVUsb0RBRUosb0JBQVUsb0JBQVYsb0JBQVUsb0RBQ3pCLG9CQUFVLG9CQUFWLG9CQUFVLG9EQUNoQixzQkFBYSxvQkFBYixzQkFBYTtHQVIzQixrQkFBa0IsQ0FnTDlCO0FBaExZLGdEQUFrQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNiL0IsMENBQThFO0FBQzlFLDRDQUFpRDtBQUNqRCw2REFBbUU7QUFHNUQsSUFBTSxhQUFhLEdBQW5CLE1BQU0sYUFBYTtJQVN4QixNQUFNLENBQVU7SUFTaEIsU0FBUyxDQUFVO0lBUW5CLFlBQVksQ0FBVTtJQVF0QixTQUFTLENBQVU7SUFVbkIsZUFBZSxDQUF1QjtJQUV0QyxNQUFNO1FBQ0osT0FBTztZQUNMLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7U0FDbEQsQ0FBQztJQUNKLENBQUM7SUFFRCxVQUFVO1FBQ1IsT0FBTywwQkFBVSxFQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ25DLENBQUM7Q0FDRjtBQXREQztJQUFDLDJCQUFhLEVBQUM7UUFDYixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxRQUFRO1FBQ2QsU0FBUyxFQUFFLEVBQUU7UUFDYixLQUFLLEVBQUUsQ0FBQztRQUNSLE9BQU8sRUFBRSxJQUFJO1FBQ2IsUUFBUSxFQUFFLEtBQUs7S0FDaEIsQ0FBQzs7NkNBQ2M7QUFDaEI7SUFBQywyQkFBYSxFQUFDO1FBQ2IsSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsV0FBVztRQUNqQixTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsT0FBTyxFQUFFLElBQUk7UUFDYixRQUFRLEVBQUUsS0FBSztLQUNoQixDQUFDOztnREFDaUI7QUFDbkI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsY0FBYztRQUNwQixTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsT0FBTyxFQUFFLEVBQUU7S0FDWixDQUFDOzttREFDb0I7QUFDdEI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsV0FBVztRQUNqQixTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsT0FBTyxFQUFFLEVBQUU7S0FDWixDQUFDOztnREFDaUI7QUFDbkI7SUFBQyxzQkFBUSxFQUNQLEdBQUcsRUFBRSxDQUFDLGdEQUFtQixFQUN6QixDQUFDLG1CQUF3QyxFQUFFLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQ3RFLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLENBQzlDO0lBQ0Esd0JBQVUsRUFBQztRQUNWLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUU7UUFDbEQsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLG9CQUFvQixFQUFFLFdBQVcsRUFBRTtLQUN6RCxDQUFDO2tEQUNnQixnREFBbUIsb0JBQW5CLGdEQUFtQjtzREFBQztBQTVDM0IsYUFBYTtJQUR6QixvQkFBTSxFQUFDLGVBQWUsRUFBRSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUMsQ0FBQztHQUNoQyxhQUFhLENBdUR6QjtBQXZEWSxzQ0FBYTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNOMUIsMENBQThFO0FBQzlFLHVEQUF1RDtBQUdoRCxJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFtQjtJQVU5QixTQUFTLENBQVU7SUFVbkIsRUFBRSxDQUFVO0lBUVosSUFBSSxDQUFVO0lBU2QsTUFBTSxDQUFlO0lBb0JyQixJQUFJLENBQWdCO0NBRXJCO0FBMURDO0lBQUMsMkJBQWEsRUFBQztRQUNiLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFdBQVc7UUFDakIsT0FBTyxFQUFFLElBQUk7UUFDYixTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsUUFBUSxFQUFFLEtBQUs7UUFDZixNQUFNLEVBQUUsS0FBSztLQUNkLENBQUM7O3NEQUNpQjtBQUNuQjtJQUFDLDJCQUFhLEVBQUM7UUFDYixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxJQUFJO1FBQ1YsT0FBTyxFQUFFLElBQUk7UUFDYixTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsUUFBUSxFQUFFLEtBQUs7UUFDZixNQUFNLEVBQUUsS0FBSztLQUNkLENBQUM7OytDQUNVO0FBQ1o7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsTUFBTTtRQUNaLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixRQUFRLEVBQUUsS0FBSztLQUNoQixDQUFDOztpREFDWTtBQUNkO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFFBQVE7UUFDZCxTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsS0FBSztLQUNkLENBQUM7O21EQUNtQjtBQVNyQjtJQUFDLHNCQUFRLEVBQ1AsR0FBRyxFQUFFLENBQUMsb0NBQWEsRUFDbkIsQ0FBQyxhQUE0QixFQUFFLEVBQUUsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUNoRTtJQUNBLHdCQUFVLEVBQUMsQ0FBQztZQUNYLElBQUksRUFBRSxRQUFRO1lBQ2Qsb0JBQW9CLEVBQUUsUUFBUTtTQUMvQixFQUFDO1lBQ0EsSUFBSSxFQUFFLFdBQVc7WUFDakIsb0JBQW9CLEVBQUUsV0FBVztTQUNsQyxDQUFDLENBQUM7a0RBQ0csb0NBQWEsb0JBQWIsb0NBQWE7aURBQUM7QUF6RFQsbUJBQW1CO0lBRC9CLG9CQUFNLEVBQUMscUJBQXFCLEVBQUUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLENBQUM7R0FDdkMsbUJBQW1CLENBMkQvQjtBQTNEWSxrREFBbUI7Ozs7Ozs7Ozs7Ozs7Ozs7QUNKaEMsd0NBQWdEO0FBQ2hELHlDQUE2RDtBQUM3RCwwQ0FBZ0Q7QUFFaEQsMERBQW1FO0FBRW5FLGtEQUFtRDtBQUNuRCxzREFBMkQ7QUFDM0QsdURBQTZEO0FBQzdELHFEQUF5RDtBQUN6RCxvRUFBaUY7QUFDakYsd0RBQStEO0FBQy9ELHlEQUFpRTtBQUNqRSx1REFBNkQ7QUFDN0QsdURBQTZEO0FBbUJ0RCxJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFrQjtDQUFHO0FBQXJCLGtCQUFrQjtJQWpCOUIsbUJBQU0sR0FBRTtJQUNSLG1CQUFNLEVBQUM7UUFDTixPQUFPLEVBQUUsQ0FBQyxxQkFBWSxFQUFFLHVCQUFhLENBQUMsVUFBVSxDQUFDO2dCQUcvQyxnQ0FBYztnQkFDZCx3Q0FBa0I7Z0JBQ2xCLDhEQUEwQjtnQkFDMUIsMENBQW1CO2dCQUNuQiw0Q0FBb0I7Z0JBQ3BCLHNDQUFpQjtnQkFDakIsZ0RBQXNCO2dCQUN0QiwwQ0FBbUI7YUFDcEIsQ0FBQyxDQUFDO1FBQ0gsU0FBUyxFQUFFLENBQUMsc0JBQWEsRUFBRSwwQ0FBbUIsRUFBRSw4Q0FBcUIsQ0FBQztRQUN0RSxPQUFPLEVBQUUsQ0FBQyw4Q0FBcUIsRUFBRSwwQ0FBbUIsRUFBRSx1QkFBYSxDQUFDO0tBQ3JFLENBQUM7R0FDVyxrQkFBa0IsQ0FBRztBQUFyQixnREFBa0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDakMvQiwyQ0FBc0U7QUFDdEUsMENBQXFHO0FBRXJHLElBQVksb0JBSVg7QUFKRCxXQUFZLG9CQUFvQjtJQUM5QiwrRUFBZ0I7SUFDaEIsNkVBQWU7SUFDZiw2RUFBZTtBQUNqQixDQUFDLEVBSlcsb0JBQW9CLEdBQXBCLDRCQUFvQixLQUFwQiw0QkFBb0IsUUFJL0I7QUFHTSxJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUFzQjtJQUtqQyxNQUFNLENBQVU7SUFRaEIsTUFBTSxDQUFVO0lBU2hCLE1BQU0sQ0FBa0I7SUFTeEIsZUFBZSxDQUFrQjtJQU9qQyxrQ0FBa0MsQ0FBVTtJQU01QyxZQUFZLENBQVE7SUFRcEIsTUFBTSxDQUFVO0lBQ2hCLFNBQVMsQ0FBQyxRQUE4QjtRQUN0QyxPQUFPLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO0lBQ2hDLENBQUM7SUFDRCxTQUFTLENBQUMsUUFBOEI7UUFDdEMsSUFBSSxDQUFDLE1BQU0sSUFBSSxRQUFRLENBQUM7SUFDMUIsQ0FBQztJQVFELFNBQVMsQ0FBUTtJQU9qQixTQUFTLENBQVE7SUFPakIsU0FBUyxDQUFpQjtJQU8xQixTQUFTLENBQWlCO0NBQzNCO0FBdkZDO0lBQUMsb0NBQXNCLEVBQUM7UUFDdEIsSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsUUFBUTtLQUNmLENBQUM7O3NEQUNjO0FBRWhCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFFBQVE7UUFDZCxRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxHQUFHO0tBQ1osQ0FBQzs7c0RBQ2M7QUFFaEI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsUUFBUTtRQUNkLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixRQUFRLEVBQUUsS0FBSztLQUNoQixDQUFDO2tEQUNPLHlCQUFjLG9CQUFkLHlCQUFjO3NEQUFDO0FBRXhCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLGlCQUFpQjtRQUN2QixTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsUUFBUSxFQUFFLEtBQUs7S0FDaEIsQ0FBQztrREFDZ0IseUJBQWMsb0JBQWQseUJBQWM7K0RBQUM7QUFDakM7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsb0NBQW9DO1FBQzFDLE9BQU8sRUFBRSxDQUFDO1FBQ1YsUUFBUSxFQUFFLEtBQUs7S0FDaEIsQ0FBQzs7a0ZBQzBDO0FBQzVDO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSw2QkFBNkI7UUFDbkMsSUFBSSxFQUFFLGNBQWM7UUFDcEIsUUFBUSxFQUFFLEtBQUs7S0FDaEIsQ0FBQztrREFDYSxJQUFJLG9CQUFKLElBQUk7NERBQUM7QUFFcEI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsUUFBUTtRQUNkLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7S0FDakIsQ0FBQzs7c0RBQ2M7QUFRaEI7SUFBQyw4QkFBZ0IsRUFBQztRQUNoQixJQUFJLEVBQUUsNkJBQTZCO1FBQ25DLElBQUksRUFBRSxXQUFXO1FBQ2pCLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLE9BQU87S0FDakIsQ0FBQztrREFDVSxJQUFJLG9CQUFKLElBQUk7eURBQUM7QUFDakI7SUFBQyw4QkFBZ0IsRUFBQztRQUNoQixJQUFJLEVBQUUsd0JBQXdCO1FBQzlCLElBQUksRUFBRSxXQUFXO1FBQ2pCLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLE9BQU87S0FDakIsQ0FBQztrREFDVSxJQUFJLG9CQUFKLElBQUk7eURBQUM7QUFDakI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsV0FBVztRQUNqQixRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxHQUFHO0tBQ1osQ0FBQzs7eURBQ3dCO0FBQzFCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFdBQVc7UUFDakIsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsR0FBRztLQUNaLENBQUM7O3lEQUN3QjtBQXZGZixzQkFBc0I7SUFEbEMsb0JBQU0sRUFBQyxrQkFBa0IsRUFBRSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUMsQ0FBQztHQUNuQyxzQkFBc0IsQ0F3RmxDO0FBeEZZLHdEQUFzQjs7Ozs7Ozs7OztBQ1ZuQyxnREFBd0U7QUFHM0Qsc0JBQWMsR0FBRyxFQUFFLENBQUM7QUFDcEIsd0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLHVCQUFlLEdBQUcsd0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZDLDBCQUFrQixHQUFHLENBQUMsQ0FBQztBQUN2QiwwQkFBa0IsR0FBRyxDQUFDLENBQUM7QUFDdkIsZ0NBQXdCLEdBQUcsMEJBQWtCLEdBQUcsd0JBQWdCLENBQUM7QUFDOUUsU0FBZ0IsY0FBYyxDQUFDLFNBQWlCO0lBQzlDLE9BQU8sMEJBQWtCLEdBQUcsU0FBUyxDQUFDO0FBQ3hDLENBQUM7QUFGRCx3Q0FFQztBQVdELElBQVksc0JBS1g7QUFMRCxXQUFZLHNCQUFzQjtJQUNoQyx5Q0FBZTtJQUNmLHlDQUFlO0lBQ2YsNkNBQW1CO0lBQ25CLDRDQUFrQjtBQUNwQixDQUFDLEVBTFcsc0JBQXNCLEdBQXRCLDhCQUFzQixLQUF0Qiw4QkFBc0IsUUFLakM7QUFFWSxzQkFBYyxHQUFHO0lBQzVCLFVBQVUsRUFBRSxHQUFHO0lBQ2Ysb0JBQW9CLEVBQUUsRUFBRTtJQUN4QixvQkFBb0IsRUFBRSxHQUFHO0lBQ3pCLHFCQUFxQixFQUFFLE1BQU07Q0FDOUIsQ0FBQztBQUVGLElBQVksUUFtQlg7QUFuQkQsV0FBWSxRQUFRO0lBQ2xCLDZDQUFXO0lBQ1gsdUNBQVE7SUFDUiwrQ0FBWTtJQUNaLDZDQUFXO0lBRVgsK0NBQVk7SUFDWiwrREFBb0I7SUFDcEIsK0RBQW9CO0lBQ3BCLHFFQUF1QjtJQUN2QiwyREFBa0I7SUFDbEIsaUVBQXFCO0lBQ3JCLHVFQUF3QjtJQUN4Qiw4REFBb0I7SUFDcEIsc0RBQWdCO0lBRWhCLHdEQUFpQjtJQUNqQiw2REFBb0I7SUFDcEIsNkRBQW9CO0FBQ3RCLENBQUMsRUFuQlcsUUFBUSxHQUFSLGdCQUFRLEtBQVIsZ0JBQVEsUUFtQm5CO0FBRVksaUJBQVMsR0FBRztJQUN2QixtQkFBbUIsRUFBRSxFQUFFO0lBQ3ZCLGVBQWUsRUFBRSxDQUFDO0NBQ25CLENBQUM7QUFFRixJQUFZLGNBSVg7QUFKRCxXQUFZLGNBQWM7SUFDeEIsK0JBQWE7SUFDYiw0QkFBVTtJQUNWLDRCQUFVO0FBQ1osQ0FBQyxFQUpXLGNBQWMsR0FBZCxzQkFBYyxLQUFkLHNCQUFjLFFBSXpCO0FBT1ksY0FBTSxHQUFvQjtJQUNyQyxPQUFPLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7SUFDakMsSUFBSSxFQUFFLENBQUM7SUFDUCxTQUFTLEVBQUUsR0FBRztJQUNkLE9BQU8sRUFBRSxHQUFHO0lBQ1osa0JBQWtCLEVBQUUsR0FBRztJQUN2QixpQkFBaUIsRUFBRSxHQUFHO0lBQ3RCLE1BQU0sRUFBRSxHQUFHO0lBQ1gsS0FBSyxFQUFFLEdBQUc7SUFDVixRQUFRLEVBQUU7UUFDUixFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO1FBQ2QsQ0FBQyxFQUFFLEdBQUc7S0FDUDtJQUNELFFBQVEsRUFBRSxHQUFHO0lBQ2IsSUFBSSxFQUFFLEdBQUc7SUFDVCxJQUFJLEVBQUUsR0FBRztJQUNULElBQUksRUFBRSxHQUFHO0lBQ1QsSUFBSSxFQUFFLEdBQUc7SUFDVCxJQUFJLEVBQUUsR0FBRztJQUNULEdBQUcsRUFBRSxHQUFHO0lBQ1IsUUFBUSxFQUFFLEdBQUc7SUFDYixTQUFTLEVBQUUsRUFBRTtJQUNiLFNBQVMsRUFBRSxFQUFFO0lBQ2IsV0FBVyxFQUFFLElBQUk7SUFDakIsUUFBUSxFQUFFLElBQUk7SUFDZCxRQUFRLEVBQUUseUJBQVMsQ0FBQyxPQUFPO0lBQzNCLGFBQWEsRUFBRSxFQUFTO0lBQ3hCLFNBQVMsRUFBRSxFQUFTO0lBQ3BCLFlBQVksRUFBRSxJQUFJO0lBRWxCLFNBQVMsRUFBRSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdEIsU0FBUyxFQUFFLElBQUk7SUFDZixTQUFTLEVBQUUsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3RCLFNBQVMsRUFBRSxJQUFJO0lBQ2YsU0FBUyxFQUFFLElBQUk7SUFDZixTQUFTLEVBQUUsSUFBSTtJQUNmLFNBQVMsRUFBRSxjQUFjLENBQUMsT0FBTztDQUNsQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzdHRiwwQ0FBc0c7QUFFdEcsb0VBQWlGO0FBQ2pGLDRDQUFtRjtBQUk1RSxJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFrQjtJQVM3QixXQUFXLENBQVU7SUFNckIsSUFBSSxDQUFpQjtJQU9yQixPQUFPLENBQVU7SUFTakIsTUFBTSxDQUFVO0lBU2hCLFdBQVcsQ0FBVTtJQVNyQixPQUFPLENBQVU7SUFTakIsS0FBSyxDQUFVO0lBU2YsVUFBVSxDQUFVO0lBU3BCLE1BQU0sQ0FBVTtJQVNoQixrQkFBa0IsQ0FBVTtJQVM1QixpQkFBaUIsQ0FBVTtJQXlCM0IsY0FBYyxDQUE4QjtJQUU1QyxNQUFNO1FBQ0osT0FBTztZQUNMLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ2xCLEVBQUU7WUFDRixFQUFFO1lBQ0YsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDbkIsRUFBRTtZQUNGLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztZQUN0QixNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1lBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7U0FDL0IsQ0FBQztJQUNKLENBQUM7SUFDRCxVQUFVO1FBQ1IsT0FBTywwQkFBVSxFQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxvQkFBb0I7UUFDbEIsT0FBTztZQUNMLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztZQUM3QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHO1lBQzlCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRTtZQUNoQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbkIsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO1lBQzdCLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztZQUNqQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDckIsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO1lBQzNCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNuQixrQkFBa0IsRUFBRSxJQUFJLENBQUMsa0JBQWtCO1lBQzNDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxpQkFBaUI7U0FFMUMsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQTdKQztJQUFDLDJCQUFhLEVBQUM7UUFDYixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxhQUFhO1FBQ25CLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxFQUFFO0tBQ1osQ0FBQzs7dURBQ21CO0FBQ3JCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxNQUFNO1FBQ1osSUFBSSxFQUFFLE1BQU07UUFDWixRQUFRLEVBQUUsSUFBSTtLQUNmLENBQUM7O2dEQUNtQjtBQUNyQjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxTQUFTO1FBQ2YsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLEVBQUUsQ0FBQztLQUNYLENBQUM7O21EQUNlO0FBQ2pCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFFBQVE7UUFDZCxTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUM7O2tEQUNjO0FBQ2hCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLGFBQWE7UUFDbkIsU0FBUyxFQUFFLEVBQUU7UUFDYixLQUFLLEVBQUUsQ0FBQztRQUNSLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLEVBQUU7S0FDWixDQUFDOzt1REFDbUI7QUFDckI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsU0FBUztRQUNmLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxFQUFFO0tBQ1osQ0FBQzs7bURBQ2U7QUFDakI7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsT0FBTztRQUNiLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxFQUFFO0tBQ1osQ0FBQzs7aURBQ2E7QUFDZjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxZQUFZO1FBQ2xCLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxFQUFFO0tBQ1osQ0FBQzs7c0RBQ2tCO0FBQ3BCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFFBQVE7UUFDZCxTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUM7O2tEQUNjO0FBQ2hCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLG9CQUFvQjtRQUMxQixTQUFTLEVBQUUsRUFBRTtRQUNiLEtBQUssRUFBRSxDQUFDO1FBQ1IsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUM7OzhEQUMwQjtBQUM1QjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxtQkFBbUI7UUFDekIsU0FBUyxFQUFFLEVBQUU7UUFDYixLQUFLLEVBQUUsQ0FBQztRQUNSLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLEVBQUU7S0FDWixDQUFDOzs2REFDeUI7QUFpQjNCO0lBQUMsc0JBQVEsRUFBQyxHQUFHLEVBQUUsQ0FBQyw4REFBMEIsRUFBRSxDQUFDLDBCQUFzRCxFQUFFLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLEVBQUU7UUFDdkksUUFBUSxFQUFFLFVBQVU7UUFDcEIsUUFBUSxFQUFFLFNBQVM7S0FDcEIsQ0FBQztJQUNELHdCQUFVLEVBQUM7UUFDVixJQUFJLEVBQUUsYUFBYTtRQUNuQixvQkFBb0IsRUFBRSxRQUFRO0tBQy9CLENBQUM7a0RBQ2UsOERBQTBCLG9CQUExQiw4REFBMEI7MERBQUM7QUF2SGpDLGtCQUFrQjtJQUQ5QixvQkFBTSxFQUFDLGNBQWMsRUFBRSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQztHQUNoQyxrQkFBa0IsQ0E4SjlCO0FBOUpZLGdEQUFrQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNSL0IsMENBQThFO0FBRTlFLHNEQUEyRDtBQUdwRCxJQUFNLDBCQUEwQixHQUFoQyxNQUFNLDBCQUEwQjtJQVFyQyxFQUFFLENBQVU7SUFTWixJQUFJLENBQVU7SUFRZCxNQUFNLENBQWlCO0lBU3ZCLElBQUksQ0FBNkI7Q0FDbEM7QUFsQ0M7SUFBQywyQkFBYSxFQUFDO1FBQ2IsSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsSUFBSTtRQUNWLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixPQUFPLEVBQUUsSUFBSTtLQUNkLENBQUM7O3NEQUNVO0FBQ1o7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsTUFBTTtRQUNaLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxFQUFFO0tBQ1osQ0FBQzs7d0RBQ1k7QUFDZDtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxRQUFRO1FBQ2QsU0FBUyxFQUFFLEVBQUU7UUFDYixLQUFLLEVBQUUsQ0FBQztRQUNSLFFBQVEsRUFBRSxJQUFJO0tBQ2YsQ0FBQzs7MERBQ3FCO0FBQ3ZCO0lBQUMsc0JBQVEsRUFDUCxHQUFHLEVBQUUsQ0FBQyx3Q0FBa0IsRUFDeEIsQ0FBQyxZQUFnQyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUNsRTtJQUNBLHdCQUFVLEVBQUM7UUFDVixJQUFJLEVBQUUsUUFBUTtRQUNkLG9CQUFvQixFQUFFLGFBQWE7S0FDcEMsQ0FBQzs7d0RBQytCO0FBbEN0QiwwQkFBMEI7SUFEdEMsb0JBQU0sRUFBQyw0QkFBNEIsRUFBRSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQztHQUM5QywwQkFBMEIsQ0FtQ3RDO0FBbkNZLGdFQUEwQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNMdkMsMENBQWlFO0FBRzFELElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWlCO0lBSzVCLEVBQUUsQ0FBVTtJQVFaLFNBQVMsQ0FBUTtJQVFqQixRQUFRLENBQVU7SUFRbEIsUUFBUSxDQUFVO0lBUWxCLFNBQVMsQ0FBVTtJQVFuQixVQUFVLENBQVU7SUFRcEIsTUFBTSxDQUFVO0lBUWhCLFVBQVUsQ0FBVTtDQUNyQjtBQTdEQztJQUFDLG9DQUFzQixFQUFDO1FBQ3RCLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLElBQUk7S0FDWCxDQUFDOzs2Q0FDVTtBQUNaO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSw2QkFBNkI7UUFDbkMsSUFBSSxFQUFFLFdBQVc7UUFDakIsU0FBUyxFQUFFLENBQUM7UUFDWixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxPQUFPO0tBQ2pCLENBQUM7a0RBQ1UsSUFBSSxvQkFBSixJQUFJO29EQUFDO0FBQ2pCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFVBQVU7UUFDaEIsTUFBTSxFQUFFLEtBQUs7UUFDYixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxHQUFHO0tBQ2IsQ0FBQzs7bURBQ2dCO0FBQ2xCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFVBQVU7UUFDaEIsTUFBTSxFQUFFLEtBQUs7UUFDYixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxHQUFHO0tBQ2IsQ0FBQzs7bURBQ2dCO0FBQ2xCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFdBQVc7UUFDakIsTUFBTSxFQUFFLEtBQUs7UUFDYixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxHQUFHO0tBQ2IsQ0FBQzs7b0RBQ2lCO0FBQ25CO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFlBQVk7UUFDbEIsTUFBTSxFQUFFLEtBQUs7UUFDYixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxHQUFHO0tBQ2IsQ0FBQzs7cURBQ2tCO0FBQ3BCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFFBQVE7UUFDZCxNQUFNLEVBQUUsS0FBSztRQUNiLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLEdBQUc7S0FDYixDQUFDOztpREFDYztBQUNoQjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxZQUFZO1FBQ2xCLE1BQU0sRUFBRSxLQUFLO1FBQ2IsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLEVBQUUsY0FBYztLQUN4QixDQUFDOztxREFDa0I7QUE3RFQsaUJBQWlCO0lBRDdCLG9CQUFNLEVBQUMsYUFBYSxFQUFFLEVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBQyxDQUFDO0dBQzdCLGlCQUFpQixDQThEN0I7QUE5RFksOENBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDSDlCLDBDQUFpRTtBQUcxRCxJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFvQjtJQUsvQixFQUFFLENBQVU7SUFTWixXQUFXLENBQVU7SUFTckIsV0FBVyxDQUFVO0lBUXJCLFVBQVUsQ0FBVTtDQUNyQjtBQS9CQztJQUFDLG9DQUFzQixFQUFDO1FBQ3RCLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLElBQUk7S0FDWCxDQUFDOztnREFDVTtBQUNaO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLGFBQWE7UUFDbkIsU0FBUyxFQUFFLEVBQUU7UUFDYixLQUFLLEVBQUUsQ0FBQztRQUNSLE9BQU8sRUFBRSxFQUFFO1FBQ1gsUUFBUSxFQUFFLEtBQUs7S0FDaEIsQ0FBQzs7eURBQ21CO0FBQ3JCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLGFBQWE7UUFDbkIsU0FBUyxFQUFFLEVBQUU7UUFDYixLQUFLLEVBQUUsQ0FBQztRQUNSLE9BQU8sRUFBRSxFQUFFO1FBQ1gsUUFBUSxFQUFFLEtBQUs7S0FDaEIsQ0FBQzs7eURBQ21CO0FBQ3JCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFlBQVk7UUFDbEIsTUFBTSxFQUFFLEtBQUs7UUFDYixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxVQUFVO0tBQzFCLENBQUM7O3dEQUNrQjtBQS9CVCxvQkFBb0I7SUFEaEMsb0JBQU0sRUFBQyxnQkFBZ0IsRUFBRSxFQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUMsQ0FBQztHQUNoQyxvQkFBb0IsQ0FnQ2hDO0FBaENZLG9EQUFvQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNIakMsd0NBQStEO0FBQy9ELDBDQUFtRDtBQUNuRCwwQ0FBcUM7QUFFckMsd0RBQStEO0FBR3hELElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXFCO0lBR2I7SUFGbkIsWUFFbUIsd0JBQTBEO1FBQTFELDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBa0M7SUFDMUUsQ0FBQztJQUNKLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxhQUF1QztRQUNqRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzNCLElBQUk7WUFDRixNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxhQUFhLENBQUM7Z0JBQ3ZFLE1BQU0sRUFBRSxDQUFDLGFBQWEsRUFBRSxhQUFhLEVBQUUsWUFBWSxDQUFDO2dCQUNwRCxLQUFLLEVBQUUsQ0FBQzt3QkFDTixXQUFXLEVBQUUsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXO3dCQUMvQyxXQUFXLEVBQUUsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXO3FCQUNoRCxFQUFFO3dCQUNELFdBQVcsRUFBRSxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVc7d0JBQy9DLFdBQVcsRUFBRSxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVc7cUJBQ2hELENBQUM7YUFDSCxDQUFDLENBQUM7WUFDSCxPQUFPLGNBQWMsQ0FBQztTQUN2QjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2QsTUFBTSxJQUFJLDBCQUFpQixDQUFDLDBCQUEwQixDQUFDLENBQUM7U0FDekQ7SUFDSCxDQUFDO0NBQ0Y7QUF2QlkscUJBQXFCO0lBRGpDLHVCQUFVLEdBQUU7SUFHUix5Q0FBZ0IsRUFBQyw0Q0FBb0IsQ0FBQzt5REFDSSxvQkFBVSxvQkFBVixvQkFBVTtHQUg1QyxxQkFBcUIsQ0F1QmpDO0FBdkJZLHNEQUFxQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ05sQywwQ0FBNEQ7QUFzQnJELElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW1CO0lBTzlCLFNBQVMsQ0FBVTtJQU9uQixPQUFPLENBQVU7SUFRakIsWUFBWSxDQUFVO0lBUXRCLFNBQVMsQ0FBVTtDQUNwQjtBQTlCQztJQUFDLDJCQUFhLEVBQUM7UUFDYixJQUFJLEVBQUUsV0FBVztRQUNqQixJQUFJLEVBQUUsU0FBUztRQUNmLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7S0FDVCxDQUFDOztzREFDaUI7QUFDbkI7SUFBQywyQkFBYSxFQUFDO1FBQ2IsSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsU0FBUztRQUNmLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7S0FDVCxDQUFDOztvREFDZTtBQUNqQjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsY0FBYztRQUNwQixJQUFJLEVBQUUsU0FBUztRQUNmLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUM7O3lEQUNvQjtBQUN0QjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsV0FBVztRQUNqQixJQUFJLEVBQUUsU0FBUztRQUNmLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLENBQUM7UUFDUixPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUM7O3NEQUNpQjtBQTlCUixtQkFBbUI7SUFwQi9CLHdCQUFVLEVBQUMsZUFBZSxFQUFFO1FBQzNCLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRTs7Ozs7Ozs7Ozs7Ozs7OztHQWdCWDtLQUNGLENBQUM7R0FDVyxtQkFBbUIsQ0ErQi9CO0FBL0JZLGtEQUFtQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdkJoQyx3Q0FBb0Q7QUFDcEQseUNBQStDO0FBQy9DLDBDQUFtRDtBQUNuRCwwQ0FBcUQ7QUFDckQsbURBQTRFO0FBQzVFLDRDQUE2RDtBQUM3RCwrQ0FBc0Q7QUFFdEQsc0RBQTJEO0FBQzNELG9FQUFpRjtBQUcxRSxJQUFNLG1CQUFtQiwyQkFBekIsTUFBTSxtQkFBb0IsU0FBUSwyQkFBZ0M7SUFNcEQ7SUFFQTtJQUNBO0lBQ1Q7SUFSRixNQUFNLEdBQVcsSUFBSSxlQUFNLENBQUMscUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkQsY0FBYyxHQUFHLEVBQUUsQ0FBQztJQUMzQixZQUVtQixzQkFBc0QsRUFFdEQsNEJBQW9FLEVBQ3BFLFVBQXNCLEVBQy9CLGFBQTRCO1FBRXBDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNoQyxLQUFLLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBUyxtQkFBbUIsQ0FBQyxFQUFFLHNCQUFVLENBQUMsQ0FBQztRQVB4RCwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQWdDO1FBRXRELGlDQUE0QixHQUE1Qiw0QkFBNEIsQ0FBd0M7UUFDcEUsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUMvQixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUlwQyxPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUNELEtBQUssQ0FBQyxpQkFBaUI7UUFDckIsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUN6QixXQUFXLEVBQUUsR0FBRztZQUNoQixJQUFJLEVBQUUsR0FBRztZQUNULE9BQU8sRUFBRSxHQUFHO1lBQ1osTUFBTSxFQUFFLEdBQUc7WUFDWCxXQUFXLEVBQUUsR0FBRztZQUNoQixPQUFPLEVBQUUsR0FBRztZQUNaLEtBQUssRUFBRSxHQUFHO1lBQ1YsVUFBVSxFQUFFLEdBQUc7WUFDZixNQUFNLEVBQUUsR0FBRztZQUNYLGtCQUFrQixFQUFFLEdBQUc7WUFDdkIsaUJBQWlCLEVBQUUsR0FBRztTQUN2QixDQUFDLENBQUM7UUFDSCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7WUFDbkQsS0FBSyxFQUFFO2dCQUNMLFdBQVcsRUFBRSxNQUFNO2FBQ3BCO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFDRCxLQUFLLENBQUMsaUJBQWlCO1FBQ3JCLElBQUksQ0FBQyxjQUFjLElBQUksRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFDRCxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQWMsRUFBRSxLQUE0QjtRQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUM7UUFDN0MsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXhDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1lBQ2xELE1BQU0sT0FBTyxDQUFDLE1BQU0sQ0FBQyw4REFBMEIsRUFBRTtnQkFDL0MsRUFBRSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ2pCLE1BQU0sRUFBRSxNQUFNO2dCQUNkLElBQUksRUFBRSxNQUFNLENBQUMsMEJBQVUsRUFBQztvQkFDdEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7b0JBQ3JCLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO29CQUNwQixNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQztvQkFDekIsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7b0JBQ3JCLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO29CQUNuQixFQUFFLEVBQUUsRUFBRTtvQkFDTixNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQztvQkFDeEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7b0JBQ3BCLEVBQUU7b0JBQ0YsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7b0JBQ2xCLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUM7b0JBQ2hDLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUM7aUJBQ2hDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRTthQUNmLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ1gsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLHdDQUFrQixFQUFFO2dCQUN2QyxXQUFXLEVBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO2dCQUMvQixJQUFJLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7Z0JBQ3hCLE9BQU8sRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztnQkFDOUIsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztnQkFDdEIsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQztnQkFDaEMsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztnQkFDeEIsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztnQkFDcEIsVUFBVSxFQUFFLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQztnQkFDOUIsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztnQkFDdEIsa0JBQWtCLEVBQUUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUM7Z0JBQzlDLGlCQUFpQixFQUFFLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDO2FBRTdDLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBRXBCLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDM0MsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7b0JBQ3pDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxTQUFTLENBQUMsRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFDLENBQUM7b0JBQy9ELElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxTQUFTLENBQUMsRUFBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFDLENBQUM7aUJBQ3JFLENBQUMsQ0FBQztnQkFDSCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hELE1BQU0sVUFBVSxHQUFXLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxFQUFDLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxFQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDeEcsTUFBTSxVQUFVLEdBQVcsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEVBQUMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLEVBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN4RyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ2pGLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQzFELE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDaEIsSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO29CQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsOERBQTBCLEVBQUU7d0JBQ25ELEVBQUUsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFO3dCQUNoQixJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUM7cUJBQ25CLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2I7Z0JBQ0QsSUFBSSxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFO29CQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsOERBQTBCLEVBQUU7d0JBQ25ELEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO3dCQUNyQixJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUM7cUJBQ25CLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2I7Z0JBQ0QsTUFBTSxVQUFVLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDM0IsSUFBSyxVQUFVLElBQUksRUFBRSxFQUFFO29CQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsOERBQTBCLEVBQUU7d0JBQ25ELEVBQUUsRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFO3dCQUN6QixJQUFJLEVBQUUsYUFBYTtxQkFDcEIsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDYjtnQkFDRCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3hCLENBQUMsRUFBRSxDQUFDO2FBQ0w7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBQ0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFlO1FBQzNCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLENBQUM7WUFDbkQsV0FBVyxFQUFFLE9BQU87U0FDckIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO1lBRWxCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEQsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRTNFLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUVsRCxNQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUMsOERBQTBCLEVBQUU7b0JBQy9DLE1BQU0sRUFBRSxPQUFPO29CQUNmLEVBQUUsRUFBRSxFQUFFLENBQUMsUUFBUSxFQUFFO29CQUNqQixJQUFJLEVBQUUsYUFBYTtpQkFDcEIsQ0FBQyxDQUFDO2dCQUNILE1BQU0sT0FBTyxDQUFDLE1BQU0sQ0FBQyx3Q0FBa0IsRUFBRTtvQkFDdkMsV0FBVyxFQUFFLE9BQU87aUJBQ3JCLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDO2dCQUMzQyxXQUFXLEVBQUUsT0FBTzthQUNyQixDQUFDLENBQUM7U0FDSjtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFDRCxLQUFLLENBQUMsT0FBTztRQUNYLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLE9BQU8sQ0FBQztZQUM3RCxLQUFLLEVBQUU7Z0JBQ0wsRUFBRSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUU7YUFDbEI7U0FDRixDQUFDLENBQUM7UUFDSCxJQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUU7WUFDbEIsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3ZFLE1BQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLE1BQU0sQ0FBQztnQkFDN0MsRUFBRSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ2pCLElBQUksRUFBRSxhQUFhO2FBQ3BCLENBQUMsQ0FBQztZQUNILE9BQU87Z0JBQ0wsRUFBRSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ2pCLElBQUksRUFBRSxhQUFhO2FBQ3BCLENBQUM7U0FDSDtRQUNELE9BQU87WUFDTCxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUU7WUFDYixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7U0FDN0IsQ0FBQztJQUNKLENBQUM7SUFDRCxjQUFjO1FBQ1osT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUNELG9CQUFvQjtRQUVsQixPQUFPLDZDQUFzQixHQUFFLENBQUM7SUFDbEMsQ0FBQztJQUdELEtBQUssQ0FBQyxlQUFlLENBQUMsTUFBYztRQUNsQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQztZQUNyRCxLQUFLLEVBQUU7Z0JBQ0wsRUFBRSxFQUFFLGdCQUFFLEVBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2FBQ3JDO1lBQ0QsS0FBSyxFQUFFO2dCQUNMLEVBQUUsRUFBRSxLQUFLO2FBQ1Y7U0FDRixDQUFDLENBQUM7UUFDSCxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDMUMsQ0FBQztDQUNGO0FBNUxZLG1CQUFtQjtJQUQvQix1QkFBVSxHQUFFO0lBTVIseUNBQWdCLEVBQUMsd0NBQWtCLENBQUM7SUFFcEMseUNBQWdCLEVBQUMsOERBQTBCLENBQUM7eURBREosb0JBQVUsb0JBQVYsb0JBQVUsb0RBRUosb0JBQVUsb0JBQVYsb0JBQVUsb0RBQzVCLG9CQUFVLG9CQUFWLG9CQUFVLG9EQUNoQixzQkFBYSxvQkFBYixzQkFBYTtHQVYzQixtQkFBbUIsQ0E0TC9CO0FBNUxZLGtEQUFtQjs7Ozs7Ozs7Ozs7Ozs7OztBQ1poQyx3Q0FBZ0Q7QUFDaEQsMENBQWdEO0FBQ2hELDJEQUErRDtBQU14RCxJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUFZO0NBQUc7QUFBZixZQUFZO0lBTHhCLG1CQUFNLEdBQUU7SUFDUixtQkFBTSxFQUFDO1FBQ04sT0FBTyxFQUFFLENBQUMsdUJBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyw0Q0FBaUIsQ0FBQyxDQUFDLENBQUM7UUFDeEQsT0FBTyxFQUFFLENBQUMsdUJBQWEsQ0FBQztLQUN6QixDQUFDO0dBQ1csWUFBWSxDQUFHO0FBQWYsb0NBQVk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDUnpCLHlDQUE2QjtBQUM3Qix3Q0FBK0Q7QUFDL0QsMENBVWlCO0FBR1YsSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBaUI7SUFRNUIsRUFBRSxDQUFVO0lBT1osbUNBQW1DLENBQVU7SUFPN0Msa0NBQWtDLENBQVU7SUFVNUMsY0FBYyxDQUFVO0lBUXhCLFNBQVMsQ0FBUTtJQU9qQixTQUFTLENBQVE7SUFNakIsU0FBUyxDQUFRO0lBT2pCLFNBQVMsQ0FBaUI7SUFPMUIsU0FBUyxDQUFpQjtJQUkxQixZQUFZO1FBQ1YsSUFBSSxDQUFDLFNBQVMsR0FBRywyQkFBYyxHQUFFLENBQUM7SUFDcEMsQ0FBQztJQUdELFlBQVk7UUFDVixJQUFJLENBQUMsU0FBUyxHQUFHLDJCQUFjLEdBQUUsQ0FBQztJQUNwQyxDQUFDO0NBQ0Y7QUE5RUM7SUFBQywyQkFBYSxFQUFDO1FBQ2IsSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsSUFBSTtRQUNWLE9BQU8sRUFBRSxJQUFJO1FBQ2IsUUFBUSxFQUFFLEtBQUs7UUFDZixTQUFTLEVBQUUsV0FBVztLQUN2QixDQUFDOzs2Q0FDVTtBQUVaO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLHFDQUFxQztRQUMzQyxRQUFRLEVBQUUsS0FBSztLQUNoQixDQUFDOzs4RUFDMkM7QUFFN0M7SUFBQyxvQkFBTSxFQUFDO1FBQ04sSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsb0NBQW9DO1FBQzFDLFFBQVEsRUFBRSxLQUFLO0tBQ2hCLENBQUM7OzZFQUMwQztBQUU1QztJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxnQkFBZ0I7UUFDdEIsU0FBUyxFQUFFLEVBQUU7UUFDYixLQUFLLEVBQUUsQ0FBQztRQUNSLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLEdBQUc7S0FDYixDQUFDOzt5REFDc0I7QUFFeEI7SUFBQyw4QkFBZ0IsRUFBQztRQUNoQixJQUFJLEVBQUUsNkJBQTZCO1FBQ25DLElBQUksRUFBRSxXQUFXO1FBQ2pCLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLE9BQU87S0FDakIsQ0FBQztrREFDVSxJQUFJLG9CQUFKLElBQUk7b0RBQUM7QUFDakI7SUFBQyw4QkFBZ0IsRUFBQztRQUNoQixJQUFJLEVBQUUsNkJBQTZCO1FBQ25DLElBQUksRUFBRSxXQUFXO1FBQ2pCLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLGdCQUFHLEdBQUU7S0FDZixDQUFDO2tEQUNVLElBQUksb0JBQUosSUFBSTtvREFBQztBQUNqQjtJQUFDLDhCQUFnQixFQUFDO1FBQ2hCLElBQUksRUFBRSw2QkFBNkI7UUFDbkMsSUFBSSxFQUFFLFdBQVc7UUFDakIsUUFBUSxFQUFFLElBQUk7S0FDZixDQUFDO2tEQUNVLElBQUksb0JBQUosSUFBSTtvREFBQztBQUNqQjtJQUFDLG9CQUFNLEVBQUM7UUFDTixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxXQUFXO1FBQ2pCLE1BQU0sRUFBRSxHQUFHO1FBQ1gsUUFBUSxFQUFFLEtBQUs7S0FDaEIsQ0FBQzs7b0RBQ3dCO0FBQzFCO0lBQUMsb0JBQU0sRUFBQztRQUNOLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFdBQVc7UUFDakIsTUFBTSxFQUFFLEdBQUc7UUFDWCxRQUFRLEVBQUUsSUFBSTtLQUNmLENBQUM7O29EQUN3QjtBQUUxQjtJQUFDLDBCQUFZLEdBQUU7SUFDZCwwQkFBWSxHQUFFOzs7O3FEQUdkO0FBRUQ7SUFBQywwQkFBWSxHQUFFOzs7O3FEQUdkO0FBOUVVLGlCQUFpQjtJQUQ3QixvQkFBTSxFQUFDLG1CQUFtQixFQUFFLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUFDO0dBQ3JDLGlCQUFpQixDQStFN0I7QUEvRVksOENBQWlCOzs7Ozs7O0FDZjlCLG9DOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDRUEsb0RBQW9GO0FBQ3BGLHdDQUFtRDtBQUNuRCx5Q0FBK0M7QUFDL0MsMENBQW1EO0FBQ25ELHlEQUF1RjtBQUV2RixnREFBZ0k7QUFDaEksMENBQWlEO0FBQ2pELG9DQUFtRDtBQUVuRCwyREFBMEY7QUFDMUYsaURBQStEO0FBQy9ELGlEQUE4RDtBQUM5RCw0REFBMEY7QUFDMUYsZ0RBQXNFO0FBRXRFLDBDQUFnRDtBQUNoRCw4Q0FBeUQ7QUFDekQseUNBQStCO0FBQy9CLDJDQUFnRTtBQUNoRSwyQ0FBa0Y7QUFJM0UsSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBZ0I7SUFJUjtJQUNBO0lBQ3dCO0lBQ0U7SUFDVTtJQUNWO0lBQ0U7SUFDQztJQUM3QjtJQUVBO0lBQ0E7SUFkWCxNQUFNLENBQVM7SUFDZixRQUFRLENBQVE7SUFDeEIsWUFDbUIsTUFBcUIsRUFDckIsTUFBeUIsRUFDRCxZQUEwQixFQUN4QixjQUE4QixFQUNwQixTQUFnQixFQUMxQixZQUF5QyxFQUN2QyxvQkFBbUQsRUFDbEQsaUJBQWlELEVBQzlFLG9CQUFtQyxFQUVuQyxVQUFzQixFQUN0QixhQUE0QjtRQVg1QixXQUFNLEdBQU4sTUFBTSxDQUFlO1FBQ3JCLFdBQU0sR0FBTixNQUFNLENBQW1CO1FBQ0QsaUJBQVksR0FBWixZQUFZLENBQWM7UUFDeEIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1FBQ3BCLGNBQVMsR0FBVCxTQUFTLENBQU87UUFDMUIsaUJBQVksR0FBWixZQUFZLENBQTZCO1FBQ3ZDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBK0I7UUFDbEQsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFnQztRQUM5RSx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQWU7UUFFbkMsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUN0QixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUU3QyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDNUYsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBcUIsQ0FBQztRQUV2SSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztZQUNkLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU87WUFDNUIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTztTQUNoQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBRUQsS0FBSyxDQUFDLG1CQUFtQjtRQUN2QixNQUFNLG1DQUFjLEVBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpREFBaUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzFGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2pELE1BQU0sT0FBTyxHQUFHLENBQUMsR0FBUSxFQUFFLEVBQUU7WUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDVixXQUFXLEVBQUUsR0FBRzthQUNqQixDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw0Q0FBNEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbkYsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3hILENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDNUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxLQUFLLENBQUMsbUJBQW1CLENBQUMsTUFBYyxFQUFFLFNBQWlCLEVBQUUsTUFBaUIsRUFBRSxNQUFpQixFQUFFLE1BQWMsRUFBRSxFQUF1QjtRQUN4SSxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZGLE1BQU0sRUFBRSxXQUFXLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBRS9CLElBQUksV0FBVyxHQUFHLFVBQVUsQ0FBQyxtQ0FBbUMsRUFBRTtZQUNoRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FDYix5REFBeUQsV0FBVyx3Q0FBd0MsVUFBVSxDQUFDLG1DQUFtQyxFQUFFLENBQzdKLENBQUM7WUFDRixPQUFPO1NBQ1I7UUFDRCxNQUFNLFVBQVUsR0FBRztZQUNqQixTQUFTLEVBQUUsTUFBTTtZQUNqQixTQUFTLEVBQUUsU0FBUyxDQUFDLFFBQVEsRUFBRTtZQUMvQixTQUFTLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUM1QixTQUFTLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRTtTQUM3QixDQUFDO1FBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbURBQW1ELElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNoQixJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO2dCQUN2QixPQUFPLEVBQUUsTUFBTSxDQUFDLG1CQUFRLENBQUMsUUFBUSxDQUFDO2dCQUNsQyxTQUFTLEVBQUUsR0FBRztnQkFDZCxPQUFPLEVBQUUsR0FBRztnQkFDWixNQUFNLEVBQUUsR0FBRztnQkFDWCxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQy9DLElBQUksRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFO2FBQ2hDLENBQUM7U0FFSCxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRTtZQUNwQyxJQUFJLEVBQUUsSUFBSTtTQUNYLENBQUMsQ0FBQztJQUVMLENBQUM7SUFHRCxLQUFLLENBQUMsa0JBQWtCO1FBQ3RCLE1BQU0sbUNBQWMsRUFBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGdEQUFnRCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDekYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFaEQsTUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFRLEVBQUUsRUFBRTtZQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywyQ0FBMkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbEYsT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDVixVQUFVLEVBQUUsR0FBRzthQUNoQixDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3ZILENBQUMsQ0FBQztRQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDNUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBYyxFQUFFLFNBQW9CLEVBQUUsT0FBa0IsRUFBRSxNQUFpQixFQUFFLEVBQXVCO1FBQzNILE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLGFBQWEsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdkYsTUFBTSxFQUFFLFdBQVcsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFFL0IsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDLGtDQUFrQyxFQUFFO1lBQy9ELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUNiLHdEQUF3RCxXQUFXLHVDQUF1QyxVQUFVLENBQUMsa0NBQWtDLEVBQUUsQ0FDMUosQ0FBQztZQUNGLE9BQU87U0FDUjtRQUNELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGlEQUFpRCxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVuSCxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1lBQzdCLE9BQU8sRUFBRSxNQUFNLENBQUMsbUJBQVEsQ0FBQyxPQUFPLENBQUM7WUFDakMsT0FBTyxFQUFFLHNCQUFzQixDQUFDLENBQUMseUJBQWMsQ0FBQyxJQUFJLEVBQUUseUJBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDM0IsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ2hELENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFO1lBQ3BDLElBQUksRUFBRSxJQUFJO1NBQ1gsQ0FBQyxDQUFDO0lBR0wsQ0FBQztDQUNGO0FBaElZLGdCQUFnQjtJQUg1Qix1QkFBVSxFQUFDO1FBQ1YsS0FBSyxFQUFFLGNBQUssQ0FBQyxPQUFPO0tBQ3JCLENBQUM7SUFPRyxtREFBb0IsR0FBRTtJQUN0QixxREFBc0IsR0FBRTtJQUN4Qiw0Q0FBZSxFQUFDLHVCQUFZLENBQUMsSUFBSSxDQUFDO0lBQ2xDLHlDQUFnQixFQUFDLHdDQUFlLENBQUM7SUFDakMseUNBQWdCLEVBQUMsNENBQWlCLENBQUM7SUFDbkMseUNBQWdCLEVBQUMsOENBQWtCLENBQUM7eURBUFosc0JBQWEsb0JBQWIsc0JBQWEsb0RBQ2Isc0NBQWlCLG9CQUFqQixzQ0FBaUIsb0RBQ2EsNEJBQVksb0JBQVosNEJBQVksb0RBQ1IsOEJBQWMsb0JBQWQsOEJBQWMsb0RBQ1QsY0FBSyxvQkFBTCxjQUFLLG9EQUNaLG9CQUFVLG9CQUFWLG9CQUFVLG9EQUNBLG9CQUFVLG9CQUFWLG9CQUFVLG9EQUNaLG9CQUFVLG9CQUFWLG9CQUFVLG9EQUNwQyw2QkFBYSxvQkFBYiw2QkFBYSxvREFFdkIsb0JBQVUsb0JBQVYsb0JBQVUsb0RBQ1AsOEJBQWEsb0JBQWIsOEJBQWE7R0FmcEMsZ0JBQWdCLENBZ0k1QjtBQWhJWSw0Q0FBZ0I7QUFrSTdCLFNBQVMsc0JBQXNCLENBQUMsS0FBZTtJQUM3QyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUN2RCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlKRCx3Q0FBb0M7QUFFcEMsdUNBQXFDO0FBQ3JDLG9EQUFvRjtBQUNwRiwwQ0FBK0Y7QUFDL0Ysd0NBQW1EO0FBQ25ELDBDQUFnRDtBQUNoRCx3Q0FBK0M7QUFDL0MsTUFBTSxPQUFPLEdBQUcsUUFBOEIsQ0FBQztBQUt4QyxJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFhO0lBT2I7SUFOWCxXQUFXLEdBQUcsS0FBSyxDQUFDO0lBQ2IsVUFBVSxDQUFlO0lBQ3hCLGtCQUFrQixHQUFHLElBQUksb0JBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO0lBRWhFLFlBQ1csTUFBeUI7UUFBekIsV0FBTSxHQUFOLE1BQU0sQ0FBbUI7UUFFbEMsSUFBSSxDQUFDLFVBQVUsR0FBRywwQkFBYSxHQUFFLENBQUM7UUFDbEMsSUFBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUM7WUFDcEIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQ3BCO0lBQ0gsQ0FBQztJQUVELGlCQUFpQixDQUFDLE9BQW1DO1FBQ25ELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO1lBQ2QsR0FBRyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxPQUFPO1NBQ3hELENBQUMsQ0FBQztRQUNILFFBQVEsT0FBTyxDQUFDLElBQUksRUFBRTtZQUNwQixLQUFLLDRCQUFrQixDQUFDLEtBQUs7Z0JBQzNCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDbkMsTUFBTTtTQUNUO0lBQ0gsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFHLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1NBQ3ZEO1FBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNoRCxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLE9BQW1DLEVBQUUsRUFBRTtZQUM1RCxJQUFHLE9BQU8sQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDakMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ2pDO2lCQUFNO2dCQUNMLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLE9BQU8sQ0FBQyxFQUFFLGFBQWEsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7YUFDOUY7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxXQUFXLENBQUMsT0FBaUQ7UUFDM0QsSUFBRyxPQUFPLEVBQUUsSUFBSSxFQUFFO1lBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUM7Z0JBQ1gsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVO2dCQUNyQixHQUFHLE9BQU87YUFDWCxDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1I7UUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELEtBQUs7UUFDSCxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ2YsRUFBRSxFQUFFLHVCQUFZLENBQUMsSUFBSTtZQUNyQixJQUFJLEVBQUUsNEJBQWtCLENBQUMsS0FBSztTQUMvQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsSUFBSTtRQUNGLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDZixFQUFFLEVBQUUsdUJBQVksQ0FBQyxJQUFJO1lBQ3JCLElBQUksRUFBRSw0QkFBa0IsQ0FBQyxJQUFJO1NBQzlCLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FFRjtBQWxFWSxhQUFhO0lBSHpCLHVCQUFVLEVBQUM7UUFDVixLQUFLLEVBQUUsY0FBSyxDQUFDLE9BQU87S0FDckIsQ0FBQzt5REFRbUIsc0NBQWlCLG9CQUFqQixzQ0FBaUI7R0FQekIsYUFBYSxDQWtFekI7QUFsRVksc0NBQWE7Ozs7Ozs7QUNiMUIsa0M7Ozs7Ozs7OztBQ0FBLDBDQUFnRDtBQUNoRCwyQ0FBMEM7QUFFMUMsTUFBTSxpQkFBaUIsR0FBRyxpQkFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyx1QkFBWSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQWlCLENBQUMsQ0FBQyxDQUFDO0FBRWhILElBQVksa0JBUVg7QUFSRCxXQUFZLGtCQUFrQjtJQUM1QixpRUFBTztJQUNQLDZEQUFLO0lBQ0wsNkRBQUs7SUFDTCxxRUFBUztJQUNULDJEQUFJO0lBQ0osaUVBQU87QUFFVCxDQUFDLEVBUlcsa0JBQWtCLEdBQWxCLDBCQUFrQixLQUFsQiwwQkFBa0IsUUFRN0I7QUFFWSxrQ0FBMEIsR0FBRyxxQkFBTSxFQUFDO0lBQy9DLElBQUksRUFBRSxpQkFBaUI7SUFDdkIsRUFBRSxFQUFFLGlCQUFpQjtDQUV0QixDQUFDLENBQUM7Ozs7Ozs7QUNuQkgsc0M7Ozs7OztBQ0FBLDBEOzs7Ozs7Ozs7Ozs7Ozs7QUNBQSx3Q0FBNEM7QUFHckMsSUFBZSxhQUFhLEdBQTVCLE1BQWUsYUFBYTtJQUNqQyxPQUFPLENBQXVCO0lBQzlCLFdBQVcsQ0FBNEM7SUFDdkQsYUFBYSxDQUF5QztJQUN0RCxPQUFPLENBQXFEO0lBQzVELFNBQVMsQ0FBaUY7SUFDMUYsS0FBSyxDQUF1QjtDQUM3QjtBQVBxQixhQUFhO0lBRGxDLHVCQUFVLEdBQUU7R0FDUyxhQUFhLENBT2xDO0FBUHFCLHNDQUFhOzs7Ozs7Ozs7Ozs7Ozs7O0FDSG5DLGdEQUE0RDtBQUM1RCx3Q0FBZ0Q7QUFDaEQseUNBQThDO0FBQzlDLHVEQUE0RDtBQUM1RCxpREFBaUQ7QUFZMUMsSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBaUI7Q0FBRztBQUFwQixpQkFBaUI7SUFYN0IsbUJBQU0sR0FBRTtJQUNSLG1CQUFNLEVBQUM7UUFDTixPQUFPLEVBQUU7WUFDUCxxQkFBWTtZQUNaLDRCQUFZO1NBQ2I7UUFDRCxTQUFTLEVBQUU7WUFDVCx5Q0FBa0I7U0FDbkI7UUFDRCxPQUFPLEVBQUUsQ0FBQyx5Q0FBa0IsQ0FBQztLQUM5QixDQUFDO0dBQ1csaUJBQWlCLENBQUc7QUFBcEIsOENBQWlCO0FBYXZCLElBQU0sWUFBWSxHQUFsQixNQUFNLFlBQVk7Q0FBRztBQUFmLFlBQVk7SUFYeEIsbUJBQU0sR0FBRTtJQUNSLG1CQUFNLEVBQUM7UUFDTixPQUFPLEVBQUU7WUFDUCxxQkFBWTtZQUNaLDRCQUFZO1NBQ2I7UUFDRCxTQUFTLEVBQUU7WUFDVCw4QkFBYTtTQUNkO1FBQ0QsT0FBTyxFQUFFLENBQUMsOEJBQWEsQ0FBQztLQUN6QixDQUFDO0dBQ1csWUFBWSxDQUFHO0FBQWYsb0NBQVk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDNUJ6Qix3Q0FBb0M7QUFDcEMsTUFBTSxPQUFPLEdBQUcsUUFBOEIsQ0FBQztBQUMvQywwQ0FBK0Y7QUFDL0Ysb0RBQW9GO0FBQ3BGLHdDQUFtRDtBQUNuRCwwQ0FBNEQ7QUFDNUQsd0NBQStDO0FBQy9DLHVDQUE0RTtBQUtyRSxJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFrQjtJQVNSO0lBUmQsU0FBUyxHQUVaLEVBQUUsQ0FBQztJQUNDLGNBQWMsQ0FBZTtJQUM3QixrQkFBa0IsR0FBRyxJQUFJLG9CQUFhLENBQVUsQ0FBQyxDQUFDLENBQUM7SUFDcEQsT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUd4RCxZQUFxQixNQUF5QjtRQUF6QixXQUFNLEdBQU4sTUFBTSxDQUFtQjtRQUM1QyxJQUFJLENBQUMsY0FBYyxHQUFHLDBCQUFhLEdBQUUsQ0FBQztRQUN0QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFFN0MsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVELG9CQUFvQjtRQUVsQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FDZixpQkFBTSxFQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFDNUIsZ0JBQUssR0FBRSxFQUNQLGdCQUFLLEVBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUNoQixDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDZixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDN0MsSUFBSSxDQUFDLFdBQVcsQ0FBQztvQkFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWM7b0JBQ3pCLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSTtvQkFDYixJQUFJLEVBQUUsNEJBQWtCLENBQUMsS0FBSztpQkFDL0IsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxpQkFBaUIsQ0FBQyxPQUFtQztRQUNuRCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUN6RSxRQUFRLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDcEIsS0FBSyw0QkFBa0IsQ0FBQyxLQUFLO2dCQUUzQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO2dCQUM1QyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDL0UsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDekMsTUFBTTtZQUNSO2dCQUNFLE1BQU07U0FDVDtJQUNILENBQUM7SUFFRCxTQUFTLENBQUMsSUFBa0IsRUFBRSxVQUFzQjtRQUNsRCxJQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTtZQUNyQixNQUFNLElBQUksS0FBSyxDQUFDLHNEQUFzRCxDQUFDLENBQUM7U0FDekU7UUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQztJQUNwQyxDQUFDO0lBQ0QsU0FBUyxDQUFDLElBQWtCO1FBQzFCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsSUFBRyxDQUFDLE1BQU0sRUFBRTtZQUNWLE1BQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxJQUFJLGVBQWUsQ0FBQyxDQUFDO1NBQ2hEO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVELFdBQVcsQ0FBQyxPQUFtQztRQUM3QyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNsRCxJQUFHLE9BQU8sQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNyQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDaEMsT0FBTztTQUNSO1FBQ0QsSUFBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsT0FBTyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7U0FFckQ7YUFBTTtZQUNMLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FFbEQ7SUFDSCxDQUFDO0lBRUQsVUFBVSxDQUFDLE9BQXFCO1FBQzlCLElBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFO1lBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsdURBQXVELENBQUMsQ0FBQztTQUMxRTtRQUNELEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ25ELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLHVCQUFZLENBQUMsSUFBSSxrQkFBa0IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDbkUsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztnQkFDMUIsY0FBYyxFQUFFLElBQUksQ0FBQyxJQUFJO2FBQzFCLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDeEIsR0FBRyxJQUFJO2dCQUNQLE1BQU07YUFDUCxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUM7WUFDdkUsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7WUFDdkUsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ25EO0lBQ0gsQ0FBQztDQUVGO0FBckdZLGtCQUFrQjtJQUg5Qix1QkFBVSxFQUFDO1FBQ1YsS0FBSyxFQUFFLGNBQUssQ0FBQyxPQUFPO0tBQ3JCLENBQUM7eURBVTZCLHNDQUFpQixvQkFBakIsc0NBQWlCO0dBVG5DLGtCQUFrQixDQXFHOUI7QUFyR1ksZ0RBQWtCOzs7Ozs7Ozs7Ozs7Ozs7O0FDYi9CLG9EQUFvRjtBQUNwRixnREFBNEQ7QUFDNUQsd0NBQWdEO0FBQ2hELHlDQUE2RDtBQUM3RCx3REFBd0U7QUFDeEUsZ0RBQXNEO0FBVy9DLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQW9CO0NBQUc7QUFBdkIsb0JBQW9CO0lBVGhDLG1CQUFNLEdBQUU7SUFDUixtQkFBTSxFQUFDO1FBQ04sT0FBTyxFQUFFLENBQUMscUJBQVksRUFBRSw0QkFBWSxDQUFDO1FBQ3JDLFNBQVMsRUFBRSxDQUFDLHNCQUFhLEVBQUUsc0NBQWlCLEVBQUU7Z0JBQzVDLE9BQU8sRUFBRSw2QkFBYTtnQkFDdEIsUUFBUSxFQUFFLDRDQUFvQjthQUMvQixDQUFDO1FBQ0YsT0FBTyxFQUFFLENBQUMsNkJBQWEsQ0FBQztLQUN6QixDQUFDO0dBQ1csb0JBQW9CLENBQUc7QUFBdkIsb0RBQW9COzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoQmpDLHdDQUE0QztBQUM1Qyx5Q0FBK0M7QUFFL0MsNENBQThDO0FBQzlDLG9EQUFvRjtBQUc3RSxJQUFNLG9CQUFvQiw0QkFBMUIsTUFBTSxvQkFBb0I7SUFHRjtJQUNWO0lBSFgsWUFBWSxDQUFTO0lBQ3JCLGNBQWMsQ0FBVztJQUNqQyxZQUE2QixhQUE0QixFQUN0QyxNQUF5QjtRQURmLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQ3RDLFdBQU0sR0FBTixNQUFNLENBQW1CO1FBRTFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLHNCQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQVMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxvQkFBUSxDQUFDO1lBQ2pDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxZQUFZO1lBQ25DLGNBQWMsRUFBRSxLQUFLO1NBQ3RCLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBQ0QsS0FBSyxDQUFDLE9BQU87UUFDWCxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRTthQUMxQixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FDSDtJQUNILENBQUM7SUFDRCxLQUFLLENBQUMsV0FBVyxDQUFDLFlBQXNCO1FBQ3RDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzlCLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ25HLENBQUM7SUFDRCxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQW1CLEVBQUUsYUFBdUM7UUFDMUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDdEMsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFDRCxLQUFLLENBQUMsYUFBYSxDQUFDLFdBQW1CO1FBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGtCQUFrQixXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUNELEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBbUIsRUFBRSxJQUFTO1FBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBQyxJQUFJLEVBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUMsSUFBSSxFQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUNyRCxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUNELEtBQUssQ0FBQyxLQUFLO1FBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekIsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3BDLENBQUM7Q0FFRjtBQTVDWSxvQkFBb0I7SUFEaEMsdUJBQVUsR0FBRTt5REFJaUMsc0JBQWEsb0JBQWIsc0JBQWEsb0RBQzlCLHNDQUFpQixvQkFBakIsc0NBQWlCO0dBSmpDLG9CQUFvQixDQTRDaEM7QUE1Q1ksb0RBQW9COzs7Ozs7O0FDUGpDLGdEOzs7Ozs7Ozs7QUNBQSxvREFBb0Y7QUFDcEYseUNBQStDO0FBQy9DLHVDQUEyQztBQUMzQyx3Q0FBeUQ7QUFHbEQsS0FBSyxVQUFVLFFBQVEsQ0FBQyxNQUFXO0lBQ3hDLE1BQU0sR0FBRyxHQUFHLE1BQU0sa0JBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMvRCxNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLHNCQUFhLENBQUMsQ0FBQztJQUM3QyxNQUFNLFVBQVUsR0FBRywwQkFBYSxHQUFFLENBQUM7SUFDbkMsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxzQ0FBaUIsQ0FBQyxDQUFDO0lBRTFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsMkJBQWMsR0FBRSxDQUFDLENBQUM7SUFDcEMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUV0QixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsMkJBQWMsR0FBRSxtQkFBbUIsQ0FBQyxDQUFDO0lBQ25ELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQVhELDRCQVdDOzs7Ozs7O0FDakJELDBDOzs7Ozs7Ozs7QUNBQSxzREFBMEQ7QUFDMUQsK0NBQWdEO0FBQ3pDLEtBQUssVUFBVSxTQUFTO0lBQzdCLE1BQU0sR0FBRyxHQUFHLE1BQU0sMkJBQVEsRUFBQyx1Q0FBaUIsQ0FBQyxDQUFDO0lBRTlDLE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUpELDhCQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ05ELG9EQUFvRjtBQUNwRix3Q0FBc0Q7QUFDdEQsZ0RBQTREO0FBQzVELHlDQUE4QztBQUM5QywwQ0FBZ0Q7QUFDaEQsbURBQStFO0FBQy9FLHNEQUF5RTtBQUN6RSw4Q0FBb0Q7QUFDcEQsMkNBQWtEO0FBQ2xELDBDQUFnRDtBQUNoRCwwREFBeUY7QUFDekYseURBQXVGO0FBQ3ZGLG1EQUF5RTtBQUN6RSxpREFBOEQ7QUFDOUQsaURBQStEO0FBQy9ELG1EQUEwRTtBQUMxRSxnREFBdUU7QUFDdkUsaURBQTBFO0FBQzFFLHNEQUF5RjtBQStCbEYsSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBaUI7SUFHVDtJQUNBO0lBRm5CLFlBQ21CLE1BQXlCLEVBQ3pCLGFBQTRCO1FBRDVCLFdBQU0sR0FBTixNQUFNLENBQW1CO1FBQ3pCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO0lBQzNDLENBQUM7SUFFTCxZQUFZO1FBQ1YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUM3QixDQUFDO0NBQ0Y7QUFWWSxpQkFBaUI7SUE3QjdCLG1CQUFNLEVBQUM7UUFDTixPQUFPLEVBQUU7WUFDUCxxQkFBWTtZQUNaLDRCQUFZO1lBQ1oseUJBQWMsQ0FBQyxPQUFPLEVBQUU7WUFDeEIsa0NBQWU7WUFDZix3QkFBVSxDQUFDLGFBQWEsQ0FBQztnQkFDdkIsU0FBUyxFQUFFLHVCQUFZLENBQUMsU0FBUzthQUNsQyxFQUFFO2dCQUNELFNBQVMsRUFBRSx1QkFBWSxDQUFDLElBQUk7YUFDN0IsQ0FBQztZQUNGLGtDQUFlO1lBQ2YsdUJBQWEsQ0FBQyxVQUFVLENBQ3RCO2dCQUNFLHdDQUFlO2dCQUNmLDBDQUFnQjthQUNqQixDQUFDO1lBQ0osNkJBQVk7WUFDWix1Q0FBb0I7WUFDcEIsOEJBQWE7WUFDYix3Q0FBa0I7WUFDbEIsNEJBQVk7U0FDYjtRQUNELFdBQVcsRUFBRSxFQUFFO1FBQ2YsU0FBUyxFQUFFO1lBQ1QsdUNBQWlCO1NBRWxCO0tBQ0YsQ0FBQzt5REFJMkIsc0NBQWlCLG9CQUFqQixzQ0FBaUIsb0RBQ1YsOEJBQWEsb0JBQWIsOEJBQWE7R0FKcEMsaUJBQWlCLENBVTdCO0FBVlksOENBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2pEOUIsMENBQWdEO0FBQ2hELG9EQUFvRjtBQUNwRiw4Q0FBdUU7QUFDdkUseUNBQTZCO0FBQzdCLDBDQUFtRDtBQUNuRCwwREFBeUY7QUFDekYseURBQXVGO0FBQ3ZGLDBDQUFpRDtBQUNqRCxnREFBd0U7QUFDeEUseUNBQThEO0FBQzlELDRDQUFxSztBQUNySyxtREFBNEY7QUFDNUYsK0NBQStIO0FBRS9ILDJDQUEySztBQUMzSyx5Q0FBNEI7QUFDNUIsbURBQXFFO0FBQ3JFLHdEQUF3RjtBQUN4RixzREFBb0Y7QUFDcEYsdURBQTJGO0FBQzNGLHlEQUFvRjtBQUVwRixtREFBNko7QUFDN0osNERBQTBGO0FBRTFGLG1EQUEyRTtBQUMzRSxrREFBaUY7QUFFakYsTUFBTSxtQkFBbUIsR0FBdUI7SUFDOUMsaUJBQWlCLEVBQUUsQ0FBQztJQUNwQixnQkFBZ0IsRUFBRSxDQUFDO0lBQ25CLGlCQUFpQixFQUFFLENBQUM7SUFDcEIscUJBQXFCLEVBQUUsQ0FBQztJQUN4QixTQUFTLEVBQUUsRUFBRTtJQUNiLFdBQVcsRUFBRSxFQUFFO0lBRWYsbUJBQW1CLEVBQUUsQ0FBQztJQUN0QixrQkFBa0IsRUFBRSxFQUFFO0lBQ3RCLG9CQUFvQixFQUFFLENBQUM7SUFDdkIsb0JBQW9CLEVBQUUsQ0FBQztJQUN2QixzQkFBc0IsRUFBRSxDQUFDO0NBQzFCLENBQUM7QUFRSyxJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFpQjtJQXFDVDtJQUVUO0lBRUE7SUFFQTtJQUVBO0lBRUE7SUFDUztJQUNBO0lBQ0E7SUFDVDtJQS9DSixLQUFELENBQUMsT0FBTyxDQUFDLEdBQXlCO1FBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHFCQUFxQixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDLENBQUM7UUFDNUQsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNWLEdBQUcsRUFBRSx5QkFBeUI7U0FDL0IsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQztZQUMxQyxLQUFLLEVBQUU7Z0JBQ0wsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSTthQUNwQjtTQUNGLENBQUMsQ0FBQztRQUNILElBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDUCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLFlBQVksQ0FBQyxDQUFDO1lBQ2hFLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFDRCxHQUFHLENBQUMsUUFBUSxHQUFHLHlCQUFTLENBQUMsVUFBVSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFDVixHQUFHLEVBQUUsK0JBQStCO1NBQ3JDLENBQUMsQ0FBQztRQUNILE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDO1FBQzNELE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQzVCO1lBQ0UsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO1NBQ2YsRUFDRDtZQUNFLFFBQVEsRUFBRSx5QkFBUyxDQUFDLFVBQVU7U0FDL0IsQ0FDRixDQUFDO1FBQ0YsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsWUFDbUIsTUFBeUIsRUFFbEMsWUFBeUMsRUFFekMsZUFBNkMsRUFFN0MseUJBQXNELEVBRXRELHFCQUFxRCxFQUVyRCxrQkFBOEMsRUFDckMsb0JBQTBDLEVBQzFDLGtCQUFzQyxFQUN0QyxtQkFBd0MsRUFDakQsVUFBc0I7UUFkYixXQUFNLEdBQU4sTUFBTSxDQUFtQjtRQUVsQyxpQkFBWSxHQUFaLFlBQVksQ0FBNkI7UUFFekMsb0JBQWUsR0FBZixlQUFlLENBQThCO1FBRTdDLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBNkI7UUFFdEQsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUFnQztRQUVyRCx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQTRCO1FBQ3JDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7UUFDMUMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUN0Qyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQ2pELGVBQVUsR0FBVixVQUFVLENBQVk7UUFFOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsTUFBTSxHQUFHLG1CQUFtQixDQUFDO0lBQ3BDLENBQUM7SUFJTSxNQUFNLEdBQXVCLG1CQUFtQixDQUFDO0lBQ3hELElBQUksZ0JBQWdCO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUNELElBQUksa0JBQWtCO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQztJQUN6QyxDQUFDO0lBRU0sS0FBSyxDQUFDLFNBQVM7UUFDcEIsTUFBTSxlQUFlLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUN6RSxNQUFNLGFBQWEsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3RFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDOUIsTUFBTSxTQUFTLEdBQ2IsSUFBSTtZQUNKLHFDQUFjLEVBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7aUJBQzlDLFFBQVEsQ0FBQyxFQUFFLENBQUM7aUJBQ1osUUFBUSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN2QixNQUFNLFlBQVksR0FDaEIsSUFBSTtZQUNKLHFDQUFjLEVBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7aUJBQ3pELFFBQVEsQ0FBQyxFQUFFLENBQUM7aUJBQ1osUUFBUSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN2QixPQUFPLFlBQVksQ0FBQztJQUN0QixDQUFDO0lBQ00sWUFBWSxHQUFpQix3QkFBWSxDQUFDLElBQUksQ0FBQztJQUcvQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0lBQ2pCLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDcEIsSUFBSSxVQUFVO1FBQ1osT0FBTyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFDTyxhQUFhLEdBQVUsRUFBRSxDQUFDO0lBQzFCLHNCQUFzQixHQUFhLEVBQUUsQ0FBQztJQUN0QyxvQkFBb0IsR0FBYSxFQUFFLENBQUM7SUFFcEMscUJBQXFCLEdBQTRCLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO0lBQ2hGLG1CQUFtQixHQUEwQixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztJQUUxRSxTQUFTLEdBT2IsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUdkLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBZTtRQUMvQixPQUFPLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBR0QsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFlO1FBQzlCLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU3RCxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBRTlCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFFRCxVQUFVLENBQUMsTUFBYyxFQUFFLE9BRzFCO1FBR0MsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQztZQUNoQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUN6QixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7U0FDbEMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVPLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxPQUFlLEVBQUUsU0FBeUIsRUFBRSxRQUFnQixFQUFFLFNBQWlCO1FBQzlHLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNSLE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLE9BQU8sWUFBWSxDQUFDLENBQUM7U0FDeEU7UUFDRCxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFO1lBQ3ZELFNBQVMsRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFO1lBQy9CLFlBQVksRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFO1lBQ2pDLE1BQU0sRUFBRSxTQUFTO1lBQ2pCLFNBQVMsRUFBRSxPQUFPO1NBQ25CLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDTyxLQUFLLENBQUMsa0JBQWtCLENBQUMsT0FBZSxFQUFFLEtBQWE7UUFDN0QsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDUixNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxPQUFPLFlBQVksQ0FBQyxDQUFDO1NBQ3hFO1FBQ0QsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRTtZQUNsRCxNQUFNLEVBQUUsT0FBTztZQUNmLEtBQUssRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFO1NBQ3hCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFHTyxnQkFBZ0I7UUFDdEIsSUFBSSxJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN0RixNQUFNLElBQUksS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7U0FDM0Q7UUFDRCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBRU8sVUFBVSxDQUFDLFdBQW1CO1FBQ3BDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUU7WUFDOUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxTQUFTLFdBQVcsZ0JBQWdCLENBQUMsQ0FBQztTQUN2RDtRQUNELE1BQU0sSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDdkMsTUFBTSxlQUFlLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3pELE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzVELElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUV4QixJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFDNUQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBR3hELE9BQU87WUFDTCxJQUFJO1lBQ0osZUFBZTtZQUNmLG9CQUFvQjtTQUNyQixDQUFDO0lBQ0osQ0FBQztJQUVPLEtBQUssQ0FBQyxrQkFBa0I7UUFDOUIsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdkQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVPLEtBQUssQ0FBQyxnQkFBZ0I7UUFDNUIsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdEQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVPLFNBQVMsQ0FBQyxNQUFXO1FBQzNCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFHTSxjQUFjLEdBQUcsRUFBRSxDQUFDO0lBQzNCLEtBQUssQ0FBQyxXQUFXO1FBR2YsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLHdCQUFZLENBQUMsT0FBTyxFQUFFO1lBQzlDLE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztTQUN0QztRQUNELElBQUksQ0FBQyxZQUFZLEdBQUcsd0JBQVksQ0FBQyxPQUFPLENBQUM7UUFDekMsTUFBTSxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQztZQUMxQyxTQUFTLEVBQUUsRUFBRTtZQUNiLGlCQUFpQixFQUFFLEVBQUU7WUFDckIsVUFBVSxFQUFFLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN2QixXQUFXLEVBQUUsK0JBQVksQ0FBQyxVQUFVO1lBQ3BDLGVBQWUsRUFBRSxFQUFFO1NBQ3BCLENBQUMsQ0FBQztRQUNILE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN4QixPQUFPO1lBQ0wsV0FBVyxFQUFFLElBQUksQ0FBQyxjQUFjO1NBQ2pDLENBQUM7SUFFSixDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVM7UUFHYixPQUFPLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1lBQ3pELElBQUksQ0FBQyxZQUFZLEdBQUcsd0JBQVksQ0FBQyxJQUFJLENBQUM7WUFDdEMsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBQy9DLE1BQU0sWUFBWSxHQUFHLE1BQU0sT0FBTyxDQUFDLGVBQWUsQ0FBQywwQ0FBZ0IsRUFBRTtnQkFDbkUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQzthQUN4QyxDQUFDLENBQUM7WUFFSCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7WUFDdkMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQUU7Z0JBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSx5QkFBeUIsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDOUYsTUFBTSxVQUFVLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDO2dCQUN4RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUNuQyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQU0sQ0FBQyxDQUFDO2lCQUNsQzthQUNGO1lBRUQsTUFBTSxhQUFhLEdBQUcsMENBQXVCLEVBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBUSxDQUFDO1lBR3pFLGFBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDN0QsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUNuRixhQUFhLENBQUMsaUJBQWlCLENBQUMsR0FBRyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMzRSxvQkFBTSxFQUNKLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE1BQU0sS0FBSyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxFQUM1RSxtQkFBbUIsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsTUFBTSw4QkFBOEIsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUM1SCxDQUFDO1lBQ0YsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLGVBQWUsRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDcEQsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDcEMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzVDO1lBQ0Qsb0JBQU0sRUFDSixhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUM1RCxZQUFZLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLGlDQUFpQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxDQUN4RyxDQUFDO1lBQ0Ysb0JBQU0sRUFDSixhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQ25FLG1CQUFtQixhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxNQUFNLGlDQUFpQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxDQUN0SCxDQUFDO1lBRUYsYUFBYSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkUsYUFBYSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsYUFBYSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekUsYUFBYSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsYUFBYSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekUsYUFBYSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsYUFBYSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0UsYUFBYSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckUsYUFBYSxDQUFDLGVBQWUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRSxhQUFhLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRSxhQUFhLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRSxhQUFhLENBQUMsaUJBQWlCLENBQUMsR0FBRyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2RSxhQUFhLENBQUMsY0FBYyxDQUFDLEdBQUcsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLGFBQWEsQ0FBQyxlQUFlLENBQUMsR0FBRyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkUsYUFBYSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckUsYUFBYSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckUsYUFBYSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkUsYUFBYSxDQUFDLGNBQWMsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVqRSxhQUFhLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNwRCxhQUFhLENBQUMsaUJBQWlCLENBQUMsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyw4QkFBaUIsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hHLGFBQWEsQ0FBQyxlQUFlLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyw4QkFBaUIsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVGLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUMvQixJQUFJLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFcEMsWUFBWSxDQUFDLFdBQVcsR0FBRywrQkFBWSxDQUFDLFVBQVUsQ0FBQztZQUNuRCxZQUFZLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDckQsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2pDLE9BQU87Z0JBQ0wsTUFBTSxFQUFFLGFBQWE7YUFDdEIsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBRUwsQ0FBQztJQUVPLHVCQUF1QjtRQUM3QixPQUFPO1lBQ0wsZUFBZSxFQUFFLEVBQUU7WUFDbkIsZ0JBQWdCLEVBQUUsRUFBRTtZQUNwQixnQkFBZ0IsRUFBRSxFQUFFO1lBQ3BCLGlCQUFpQixFQUFFLEVBQUU7WUFDckIsY0FBYyxFQUFFLEVBQUU7WUFDbEIsYUFBYSxFQUFFLEVBQUU7WUFDakIsY0FBYyxFQUFFLEVBQUU7WUFDbEIsY0FBYyxFQUFFLEVBQUU7WUFDbEIsZUFBZSxFQUFFLEVBQUU7WUFDbkIsWUFBWSxFQUFFLEVBQUU7U0FDVSxDQUFDO0lBQy9CLENBQUM7SUFFTyxxQkFBcUI7UUFDM0IsT0FBTztZQUNMLGFBQWEsRUFBRSxFQUFFO1lBQ2pCLGNBQWMsRUFBRSxFQUFFO1lBQ2xCLGNBQWMsRUFBRSxFQUFFO1lBQ2xCLGVBQWUsRUFBRSxFQUFFO1lBQ25CLFlBQVksRUFBRSxFQUFFO1NBQ1EsQ0FBQztJQUM3QixDQUFDO0lBRU8sS0FBSyxDQUFDLGlCQUFpQixDQUFDLGFBQXFCLEVBQUUsU0FBeUI7UUFDOUUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMvQyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUMvRyxJQUFJLENBQUMscUJBQXFCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUMvRzthQUFNO1lBQ0wsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1NBQzVEO1FBQ0QsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNaLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLDBCQUEwQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUMvRSxJQUFJLENBQUMscUJBQXFCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUYsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsaURBQTBCLEdBQUUsQ0FBQyxDQUFDO1lBQzdFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ25EO2FBQU07WUFDTCxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQzdGLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNsRixNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDNUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNsRSxJQUFJLENBQUMscUJBQXFCLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUNuRSxJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNyRDtJQUNILENBQUM7SUFDTyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsYUFBcUIsRUFBRSxTQUF5QjtRQUM3RSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDWixNQUFNLElBQUksS0FBSyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7U0FDMUQ7UUFDRCxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzdGLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUVsRixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDbkUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFDTyxLQUFLLENBQUMsbUJBQW1CLENBQUMsYUFBcUI7UUFDckQsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3JELElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ25ILElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQ3ZIO2FBQU07WUFDTCxJQUFJLENBQUMscUJBQXFCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7U0FDbEU7UUFDRCxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1osTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3ZELE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNsRixNQUFNLElBQUksR0FBRyxtREFBNEIsRUFBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMscUJBQXFCLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDckQ7YUFBTTtZQUNMLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUMzRSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDcEUsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdkQsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUNoRSxJQUFJLENBQUMscUJBQXFCLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMscUJBQXFCLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNyRDtJQUNILENBQUM7SUFDTyxLQUFLLENBQUMsa0JBQWtCLENBQUMsYUFBcUI7UUFDcEQsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDWixNQUFNLElBQUksS0FBSyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7U0FDMUQ7UUFDRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNwRSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN2RCxJQUFJLENBQUMscUJBQXFCLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ25FLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVPLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxhQUFxQixFQUFFLFNBQXlCO1FBQ3hGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDL0MsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDbkgsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDdkg7YUFBTTtZQUNMLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztTQUNsRTtRQUNELElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQy9HLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQy9HO2FBQU07WUFDTCxJQUFJLENBQUMscUJBQXFCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7U0FDNUQ7UUFDRCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN2RCxJQUFJLENBQUMscUJBQXFCLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1osTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ2xGLE1BQU0sSUFBSSxHQUFHLG1EQUE0QixFQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxRCxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEUsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsMEJBQTBCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRXBGLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVGLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGlEQUEwQixHQUFFLENBQUMsQ0FBQztZQUM3RSxJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUN4RDthQUFNO1lBQ0wsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2xGLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUMzRSxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUMvRixNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDbEYsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUVsSCxJQUFJLENBQUMscUJBQXFCLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbEUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDekQ7SUFDSCxDQUFDO0lBRU8sS0FBSyxDQUFDLDBCQUEwQixDQUFDLGFBQXFCLEVBQUUsU0FBeUI7UUFDdkYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1osTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1NBQzFEO1FBQ0QsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDL0YsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ2xGLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzlELE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMzRSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNwRSxJQUFJLENBQUMscUJBQXFCLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDcEUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFFbkUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFFTyxLQUFLLENBQUMsaUJBQWlCLENBQUMsV0FBbUI7UUFDakQsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV0RSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN0RCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDN0UsSUFBSSxLQUFLLEVBQUU7WUFDVCxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3REO2FBQU07WUFDTCxNQUFNLHVCQUF1QixHQUFHLG9EQUE2QixHQUFFLENBQUM7WUFDaEUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUN0RSxJQUFJLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3REO0lBQ0gsQ0FBQztJQUVPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFtQjtRQUNoRCxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbEQsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFdEQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlHLElBQUksS0FBSyxFQUFFO1lBQ1QsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7U0FFOUQ7YUFBTTtZQUNMLE1BQU0sdUJBQXVCLEdBQUcsb0RBQTZCLEdBQUUsQ0FBQztZQUNoRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1NBQ3ZFO0lBQ0gsQ0FBQztJQUVPLFdBQVcsQ0FBQyxLQUE0QjtRQUs5QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDO1lBQzdCLElBQUksRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztTQUN6QixFQUFFO1lBQ0QsV0FBVyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO1NBQ3ZDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM5RCxJQUFJLENBQUMsbUJBQW1CLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUMvQyxDQUFDO0lBQ08sS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFjO1FBQ3pDLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1NBQ3BEO1FBQ0QsSUFBSSxLQUFLLENBQUMsT0FBTyxLQUFLLG1CQUFRLENBQUMsT0FBTyxFQUFFO1lBQ3RDLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztTQUN4RDtRQUNELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRTtZQUNyRCxXQUFXLEVBQUUsS0FBSyxDQUFDLFdBQVc7WUFDOUIsSUFBSSxFQUFFLEdBQUc7WUFDVCxPQUFPLEVBQUUsR0FBRztZQUNaLE1BQU0sRUFBRSxHQUFHO1lBQ1gsV0FBVyxFQUFFLEdBQUc7WUFDaEIsS0FBSyxFQUFFLEdBQUc7WUFDVixPQUFPLEVBQUUsR0FBRztZQUNaLFVBQVUsRUFBRSxHQUFHO1lBQ2YsTUFBTSxFQUFFLEdBQUc7WUFDWCxrQkFBa0IsRUFBRSxHQUFHO1lBQ3ZCLGlCQUFpQixFQUFFLEdBQUc7U0FDdkIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNPLGNBQWMsQ0FBQyxLQUE0QjtRQUNqRCxvQkFBTSxFQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxFQUFFLDZDQUE2QyxDQUFDLENBQUM7UUFDdEYsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFTyxXQUFXLENBQ2pCLFFBQXlCLEVBQ3pCLFFBR0M7UUFFRCxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsR0FBRyxxQ0FBa0IsRUFBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFHbEYsTUFBTSxlQUFlLEdBQUcsd0NBQXFCLEVBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLDBCQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ2hILE1BQU0sZUFBZSxHQUFHLHdDQUFxQixFQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQywwQkFBZSxDQUFDLENBQUMsQ0FBQztRQUNoSCxNQUFNLGVBQWUsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4RCxJQUFJLFVBQVUsRUFBRTtZQUNkLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7U0FDMUI7UUFFRCxPQUFPLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsQ0FBQztJQUMvRCxDQUFDO0lBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFpQjtRQUNqQyxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLENBQUM7WUFDOUQsTUFBTSxFQUFFLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQztZQUNsQyxLQUFLLEVBQUU7Z0JBQ0wsU0FBUyxFQUFFLFNBQVM7YUFDckI7U0FDRixDQUFDLENBQUM7UUFDSCxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBb0I7UUFDdEMsSUFBSTtZQUNGLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEdBQUcsQ0FBQyxJQUFJLGFBQWEsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDdkUsT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDVixHQUFHO2dCQUNILFNBQVMsRUFBRSxHQUFHLENBQUMsU0FBUztnQkFDeEIsSUFBSSxFQUFFLE9BQU8sR0FBRyxDQUFDLFNBQVM7YUFDM0IsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLHdCQUFZLENBQUMsT0FBTyxFQUFFO2dCQUM5QyxNQUFNLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUMxQjtZQUNELElBQUksTUFBb0MsQ0FBQztZQUN6QyxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDO1lBQzVCLFFBQVEsT0FBTyxFQUFFO2dCQUNmLEtBQUssbUJBQVEsQ0FBQyxRQUFRO29CQUNwQixNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNwQyxNQUFNO2dCQUNSLEtBQUssbUJBQVEsQ0FBQyxPQUFPO29CQUNuQixNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNuQyxNQUFNO2dCQUNSLEtBQUssbUJBQVEsQ0FBQyxRQUFRO29CQUNwQixNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNwQyxNQUFNO2dCQUNSLEtBQUssbUJBQVEsQ0FBQyxnQkFBZ0I7b0JBQzVCLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDNUMsTUFBTTtnQkFDUixLQUFLLG1CQUFRLENBQUMsZ0JBQWdCO29CQUM1QixNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzVDLE1BQU07Z0JBQ1IsS0FBSyxtQkFBUSxDQUFDLG1CQUFtQjtvQkFDL0IsTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUMvQyxNQUFNO2dCQUNSLEtBQUssbUJBQVEsQ0FBQyxjQUFjO29CQUMxQixNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzFDLE1BQU07Z0JBQ1IsS0FBSyxtQkFBUSxDQUFDLElBQUk7b0JBQ2hCLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDN0IsTUFBTTtnQkFPUixLQUFLLG1CQUFRLENBQUMsT0FBTyxDQUFDO2dCQUN0QjtvQkFDRSxNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQzthQUNsRTtZQUVELElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQzFCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBRXhCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQztZQUNsRSxJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUU7Z0JBQ2YsTUFBTSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7YUFDeEI7WUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLHNCQUFzQixHQUFHLENBQUMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZFLE9BQU8sTUFBTSxDQUFDO1NBQ2Y7UUFBQyxPQUFNLEtBQVUsRUFBRTtZQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7WUFDekMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQixPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7WUFFekMsTUFBTSxLQUFLLENBQUM7U0FDYjtJQUNILENBQUM7SUFFTyxLQUFLLENBQUMsa0JBQWtCLENBQUMsR0FBb0I7UUFDbkQsTUFBTSxhQUFhLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEMsTUFBTSxPQUFPLEdBQXlCO1lBQ3BDLE1BQU0sQ0FBQyxtQkFBUSxDQUFDLGdCQUFnQixDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO1lBQ2xCLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO1lBQ2pCLEVBQUU7WUFDRixFQUFFO1lBQ0YsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDaEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDaEIsRUFBRTtTQUNILENBQUM7UUFDRixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNULE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLElBQUksRUFBRSxDQUFDLENBQUM7U0FDckQ7UUFDRCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN6QyxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDO1FBRWhDLE1BQU0sSUFBSSxDQUFDLDJCQUEyQixDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNqRSxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDakcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sSUFBSSxDQUFDLDBCQUEwQixDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUVoRSxNQUFNLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDakUsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRWhFLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdkUsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUU3QixNQUFNLEtBQUssR0FBMEI7WUFDbkMsV0FBVztZQUNYLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3JCLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRTtZQUMvQixNQUFNLEVBQUUsYUFBYTtZQUNyQixXQUFXLEVBQUUsR0FBRyxDQUFDLFNBQVM7WUFDMUIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxNQUFNO1lBQ25CLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSztZQUNoQixVQUFVLEVBQUUsR0FBRyxDQUFDLElBQUk7WUFDcEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJO1lBQ2hCLGtCQUFrQixFQUFFLEdBQUc7WUFDdkIsaUJBQWlCLEVBQUUsR0FBRztTQUN2QixDQUFDO1FBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNWLGtCQUFrQixFQUFFLEtBQUs7U0FDMUIsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUV6QyxNQUFNLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BGLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN2RCxNQUFNLEVBQUUsR0FBRztZQUNULE9BQU87WUFDUCxRQUFRO1lBQ1IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNyQixJQUFJLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBR3BCLFFBQVEsRUFBRSxlQUFlO1lBRXpCLFFBQVEsRUFBRSxlQUFlO1lBQ3pCLGVBQWU7WUFDZixHQUFHLElBQUksQ0FBQyxxQkFBcUI7WUFDN0IsR0FBRyxJQUFJLENBQUMsbUJBQW1CO1NBQzVCLENBQUM7UUFFRixJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25CLE9BQU8sRUFBNkMsQ0FBQztJQUN2RCxDQUFDO0lBRU8scUJBQXFCLEdBQThCLElBQUksQ0FBQztJQUNoRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsR0FBb0I7UUFDM0MsTUFBTSxPQUFPLEdBQXlCLENBQUMsTUFBTSxDQUFDLG1CQUFRLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM1SCxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQzdCLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsV0FBVyxFQUFFLENBQUMsQ0FBQztTQUM5RTtRQUNELElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7WUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsV0FBVyxtQkFBbUIsQ0FBQyxDQUFDO1NBQy9GO1FBQ0QsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQztRQUNuQyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQ3JEO1FBQ0QsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQW9CLENBQUM7UUFFbkUsTUFBTSxJQUFJLENBQUMsMkJBQTJCLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNsRSxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sSUFBSSxDQUFDLDJCQUEyQixDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDbEUsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztRQUVqRSxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXpDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDN0IsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksR0FBRyxDQUFDLENBQUM7UUFDeEQsTUFBTSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUU7WUFDbEYsUUFBUSxFQUFFLElBQUksR0FBRyxTQUFTO1lBQzFCLFdBQVcsRUFBRSxFQUFFO1NBQ2hCLENBQUMsQ0FBQztRQUVILE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkQsTUFBTSxFQUFFLEdBQUc7WUFDVCxPQUFPO1lBQ1AsUUFBUTtZQUNSLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7WUFDaEIsSUFBSSxFQUFFLEdBQUc7WUFFVCxRQUFRLEVBQUUsZUFBZTtZQUN6QixRQUFRLEVBQUUsZUFBZTtZQUN6QixlQUFlO1lBQ2YsR0FBRyxJQUFJLENBQUMscUJBQXFCO1lBQzdCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQjtTQUM1QixDQUFDO1FBRUYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNuQixPQUFPLEVBQTZDLENBQUM7SUFDdkQsQ0FBQztJQUNELEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxHQUFvQjtRQUM5QyxNQUFNLE9BQU8sR0FBeUIsQ0FBQyxNQUFNLENBQUMsbUJBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQy9ILE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDN0IsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsV0FBVyxFQUFFLENBQUMsQ0FBQztTQUM5RTtRQUNELElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7WUFDN0IsTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsV0FBVyxtQkFBbUIsQ0FBQyxDQUFDO1NBQy9GO1FBQ0QsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7U0FDbEU7UUFDRCxNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBb0IsQ0FBQztRQUN4RSxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBb0IsQ0FBQztRQUN0RSxNQUFNLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUN4RCxNQUFNLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUUxRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTVDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2xGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRXJELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDckYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFdEQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUUzQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFM0MsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUMsVUFBVSxDQUFDLGtCQUFrQixHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLGtCQUFrQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDeEcsVUFBVSxDQUFDLGlCQUFpQixHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLGlCQUFpQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDckcsTUFBTSxtQkFBbUIsR0FBRyxVQUFVLENBQUMsa0JBQWtCLEtBQUssVUFBVSxDQUFDLE9BQU8sQ0FBQztRQUNqRixJQUFJLG1CQUFtQixFQUFFO1lBQ3ZCLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDbEM7YUFBTTtZQUNMLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQztTQUN4RDtRQUNELE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXpDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDN0IsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksR0FBRyxDQUFDLENBQUM7UUFDN0QsTUFBTSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUU7WUFDbEYsUUFBUSxFQUFFLElBQUksR0FBRyxTQUFTO1lBQzFCLFdBQVcsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQztTQUN2QyxDQUFDLENBQUM7UUFDSCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pELE1BQU0sRUFBRSxHQUFHO1lBQ1QsT0FBTztZQUNQLFFBQVE7WUFDUixJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQ2hCLElBQUksRUFBRSxHQUFHO1lBRVQsUUFBUSxFQUFFLGVBQWU7WUFDekIsUUFBUSxFQUFFLGVBQWU7WUFDekIsZUFBZTtZQUNmLEdBQUcsSUFBSSxDQUFDLHFCQUFxQjtZQUM3QixHQUFHLElBQUksQ0FBQyxtQkFBbUI7U0FDNUIsQ0FBQztRQUVGLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkIsT0FBTyxFQUE2QyxDQUFDO0lBQ3ZELENBQUM7SUFDRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsR0FBb0I7UUFDekMsb0JBQU0sRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLGlEQUFpRCxDQUFDLENBQUM7UUFDeEYsTUFBTSxPQUFPLEdBQXlCLENBQUMsTUFBTSxDQUFDLG1CQUFRLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDMUgsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztRQUM3QixvQkFBTSxFQUFDLFdBQVcsS0FBSyxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxFQUFFLHlDQUF5QyxDQUFDLENBQUM7UUFDMUcsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDO1FBQzlDLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDZixNQUFNLElBQUksS0FBSyxDQUFDLGlEQUFpRCxXQUFXLEVBQUUsQ0FBQyxDQUFDO1NBQ2pGO1FBQ0QsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtZQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLGlEQUFpRCxXQUFXLG1CQUFtQixDQUFDLENBQUM7U0FDbEc7UUFDRCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDYixNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztTQUNsRTtRQUNELE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFvQixDQUFDO1FBQ3hFLE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFvQixDQUFDO1FBQ3RFLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBRTFELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFNUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDdEQsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbEYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFckQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDdkQsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNyRixJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztRQUV0RCxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTNDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUUzQyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxQyxVQUFVLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN4RyxVQUFVLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNyRyxNQUFNLG1CQUFtQixHQUFHLFVBQVUsQ0FBQyxrQkFBa0IsS0FBSyxVQUFVLENBQUMsT0FBTyxDQUFDO1FBQ2pGLElBQUksbUJBQW1CLEVBQUU7WUFDdkIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNsQzthQUFNO1lBQ0wsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO1NBQ3hEO1FBQ0QsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFekMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUM3QixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUM3RCxNQUFNLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRTtZQUNsRixRQUFRLEVBQUUsSUFBSSxHQUFHLFNBQVM7WUFDMUIsV0FBVyxFQUFFLEVBQUU7U0FDaEIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQztRQUNsQyxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXpELE1BQU0sRUFBRSxHQUFHO1lBQ1QsT0FBTztZQUNQLFFBQVE7WUFDUixJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQ2hCLElBQUksRUFBRSxHQUFHO1lBRVQsUUFBUSxFQUFFLGVBQWU7WUFDekIsUUFBUSxFQUFFLGVBQWU7WUFDekIsZUFBZTtZQUNmLEdBQUcsSUFBSSxDQUFDLHFCQUFxQjtZQUM3QixHQUFHLElBQUksQ0FBQyxtQkFBbUI7U0FDNUIsQ0FBQztRQUVGLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkIsT0FBTyxFQUE2QyxDQUFDO0lBQ3ZELENBQUM7SUFFRCxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQW9CO1FBQ3RDLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDN0IsTUFBTSxPQUFPLEdBQXlCLENBQUMsTUFBTSxDQUFDLG1CQUFRLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDeEksTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDVixNQUFNLElBQUksS0FBSyxDQUFDLDhDQUE4QyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1NBQzlFO1FBQ0QsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtZQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLDhDQUE4QyxXQUFXLG1CQUFtQixDQUFDLENBQUM7U0FDL0Y7UUFDRCxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDWixNQUFNLElBQUksS0FBSyxDQUFDLDJDQUEyQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztTQUM1RTtRQUNELElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsTUFBTSxFQUFFO1lBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLEtBQUssQ0FBQyxNQUFNLGFBQWEsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7U0FDakc7UUFDRCxNQUFNLGVBQWUsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBb0IsQ0FBQztRQUN2RSxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUU5RSxNQUFNLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsZUFBZSxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQzVHLE1BQU0sSUFBSSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDdkUsTUFBTSxJQUFJLENBQUMsMkJBQTJCLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQztRQUN4RSxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRXZFLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN2QyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFL0MsTUFBTSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwRixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hELE1BQU0sRUFBRSxHQUFHO1lBQ1QsT0FBTztZQUNQLFFBQVE7WUFDUixJQUFJLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3JCLElBQUksRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFHcEIsUUFBUSxFQUFFLGVBQWU7WUFFekIsUUFBUSxFQUFFLGVBQWU7WUFDekIsZUFBZTtZQUNmLEdBQUcsSUFBSSxDQUFDLHFCQUFxQjtZQUM3QixHQUFHLElBQUksQ0FBQyxtQkFBbUI7U0FDNUIsQ0FBQztRQUVGLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkIsT0FBTyxFQUE2QyxDQUFDO0lBQ3ZELENBQUM7SUFFTyxLQUFLLENBQUMsTUFBTTtRQUNsQixNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUM7UUFDeEIsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDWixNQUFNLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7U0FDOUM7UUFDRCxNQUFNLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLEVBQUUseUJBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwRSxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLEVBQUUseUJBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuRSxNQUFNLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLEVBQUUseUJBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwRSxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLEVBQUUseUJBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuRSxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxQyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN6QyxNQUFNLEVBQUUsR0FBRztZQUNULE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUNqRCxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQ3BCLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7WUFDZCxJQUFJLEVBQUUsRUFBRTtZQUVSLFFBQVEsRUFBRSxJQUFJLEtBQUssQ0FBQyw2QkFBa0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDaEQsUUFBUSxFQUFFLENBQUMsbUJBQVEsQ0FBQyxPQUFPLENBQUM7WUFDNUIsZUFBZSxFQUFFLENBQUMsbUJBQVEsQ0FBQyxPQUFPLENBQUM7WUFDbkMsR0FBRyxJQUFJLENBQUMscUJBQXFCO1lBQzdCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQjtTQUM1QixDQUFDO1FBQ0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNuQixPQUFPLEVBQTZDLENBQUM7SUFDdkQsQ0FBQztJQUVPLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBb0I7UUFDMUMsTUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztRQUMvQixNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sT0FBTyxHQUFHO1lBQ2QsTUFBTSxDQUFDLG1CQUFRLENBQUMsT0FBTyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxpQ0FBc0IsQ0FBQyxTQUFTLENBQUM7WUFDeEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7WUFDbkIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFDbEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFDakIsYUFBYTtZQUNiLEVBQUU7WUFDRixFQUFFO1lBQ0YsRUFBRTtZQUNGLEVBQUU7U0FDSCxDQUFDO1FBQ0YsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDO1FBQ3hCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsYUFBYSxFQUFFLENBQUMsQ0FBQztTQUN0RTtRQUNELE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFvQixDQUFDO1FBRXpELE1BQU0sSUFBSSxDQUFDLDJCQUEyQixDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMvRCxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUUxQyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFOUUsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzlELE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBR3pDLE1BQU0sSUFBSSxDQUFDLDJCQUEyQixDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMvRCxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFHOUQsTUFBTSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVwRixNQUFNLEVBQUUsR0FBRztZQUNULE9BQU87WUFFUCxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQ2hCLElBQUksRUFBRSxHQUFHO1lBR1QsUUFBUSxFQUFFLGVBQWU7WUFFekIsUUFBUSxFQUFFLGVBQWU7WUFDekIsZUFBZTtZQUNmLEdBQUcsSUFBSSxDQUFDLHFCQUFxQjtZQUM3QixHQUFHLElBQUksQ0FBQyxtQkFBbUI7U0FDNUIsQ0FBQztRQUVGLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkIsT0FBTyxFQUE2QyxDQUFDO0lBQ3ZELENBQUM7SUFFTyxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQW9CO1FBQzNDLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsTUFBTSxhQUFhLEdBQUcsY0FBYyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hELE1BQU0sZUFBZSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUM7UUFDdEMsTUFBTSxDQUFDLEdBQUc7WUFDUixDQUFDLEdBQUcsQ0FBQyxTQUEyQixDQUFDLEVBQUU7Z0JBQ2pDLE1BQU0sRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztnQkFDMUIsT0FBTyxFQUFFLEVBQUU7YUFDWjtTQUNGLENBQUM7UUFDRixNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsU0FBUyxLQUFLLHlCQUFjLENBQUMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUMvRixNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLENBQUM7WUFDakUsS0FBSyxFQUFFO2dCQUNMLFNBQVMsRUFBRSxjQUFjLENBQUMsUUFBUSxFQUFFO2FBQ3JDO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxjQUFjLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQztRQUNsRCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDaEUsZUFBZSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbkQsZUFBZSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFbkQsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDO1FBQ3hCLE1BQU0sT0FBTyxHQUFHO1lBQ2QsTUFBTSxDQUFDLG1CQUFRLENBQUMsUUFBUSxDQUFDO1lBQ3pCLE1BQU0sQ0FBQyxpQ0FBc0IsQ0FBQyxTQUFTLENBQUM7WUFDeEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7WUFDbkIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFDbEIsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNULGNBQWM7WUFDZCxjQUFjO1lBQ2QsRUFBRTtZQUNGLEVBQUU7WUFDRixFQUFFO1NBQ0gsQ0FBQztRQUNGLE1BQU0sSUFBSSxDQUFDLDJCQUEyQixDQUFDLGFBQWEsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUd2RSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRTtZQUM5QixNQUFNLEVBQUUsY0FBYztZQUN0QixNQUFNLEVBQUUsY0FBYztTQUN2QixDQUFDLENBQUM7UUFFSCxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxhQUFhLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFHdEUsTUFBTSxJQUFJLENBQUMsMkJBQTJCLENBQUMsYUFBYSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ3ZFLE1BQU0sSUFBSSxDQUFDLDBCQUEwQixDQUFDLGFBQWEsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUN0RSxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxQyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUV6QyxNQUFNLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXBGLE1BQU0sRUFBRSxHQUFHO1lBQ1QsT0FBTztZQUNQLFFBQVEsRUFBRSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQztZQUN4RCxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQ2hCLElBQUksRUFBRSxHQUFHO1lBR1QsUUFBUSxFQUFFLGVBQWU7WUFFekIsUUFBUSxFQUFFLGVBQWU7WUFDekIsZUFBZTtZQUNmLEdBQUcsSUFBSSxDQUFDLHFCQUFxQjtZQUM3QixHQUFHLElBQUksQ0FBQyxtQkFBbUI7U0FDNUIsQ0FBQztRQUVGLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkIsT0FBTyxFQUE2QyxDQUFDO0lBQ3ZELENBQUM7SUFFTyxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQW9CO1FBQzNDLE1BQU0sT0FBTyxHQUFHLGtEQUEyQixFQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQztRQUN4QixNQUFNLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakQsTUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUNwQyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1QsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUM3RDtRQUNELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRXpDLE1BQU0sSUFBSSxDQUFDLDJCQUEyQixDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDckUsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNuRixNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sSUFBSSxDQUFDLDBCQUEwQixDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFcEUsTUFBTSxJQUFJLENBQUMsMkJBQTJCLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNyRSxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3BFLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzFDLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXpDLE1BQU0sRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEYsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sRUFBRSxHQUFHO1lBQ1QsT0FBTztZQUNQLFFBQVE7WUFDUixJQUFJLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3JCLElBQUksRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFHcEIsUUFBUSxFQUFFLGVBQWU7WUFFekIsUUFBUSxFQUFFLGVBQWU7WUFDekIsZUFBZTtZQUNmLEdBQUcsSUFBSSxDQUFDLHFCQUFxQjtZQUM3QixHQUFHLElBQUksQ0FBQyxtQkFBbUI7U0FDNUIsQ0FBQztRQUVGLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkIsT0FBTyxFQUE2QyxDQUFDO0lBQ3ZELENBQUM7Q0FFRjtBQTltQ087SUFITCxtQ0FBaUIsRUFBQztRQUNqQixPQUFPLEVBQUUsSUFBSTtLQUNkLENBQUM7O3lEQUNpQixZQUFHLG9CQUFILFlBQUc7O2dEQThCckI7QUFsQ1UsaUJBQWlCO0lBTjdCLDRCQUFVLEVBQUM7UUFDVixTQUFTLEVBQUUsdUJBQVksQ0FBQyxTQUFTO1FBQ2pDLE9BQU8sRUFBRTtZQUNQLFdBQVcsRUFBRSxDQUFDO1NBQ2Y7S0FDRixDQUFDO0lBdUNHLHlDQUFnQixFQUFDLHdDQUFlLENBQUM7SUFFakMseUNBQWdCLEVBQUMsMENBQWdCLENBQUM7SUFFbEMseUNBQWdCLEVBQUMsd0NBQWUsQ0FBQztJQUVqQyx5Q0FBZ0IsRUFBQyw4Q0FBa0IsQ0FBQztJQUVwQyx5Q0FBZ0IsRUFBQyxnQ0FBYyxDQUFDO3lEQVRSLHNDQUFpQixvQkFBakIsc0NBQWlCLG9EQUVwQixvQkFBVSxvQkFBVixvQkFBVSxvREFFUCxvQkFBVSxvQkFBVixvQkFBVSxvREFFQSxvQkFBVSxvQkFBVixvQkFBVSxvREFFZCxvQkFBVSxvQkFBVixvQkFBVSxvREFFYixvQkFBVSxvQkFBVixvQkFBVSxvREFDQyw0Q0FBb0Isb0JBQXBCLDRDQUFvQixvREFDdEIsd0NBQWtCLG9CQUFsQix3Q0FBa0Isb0RBQ2pCLDBDQUFtQixvQkFBbkIsMENBQW1CLG9EQUNyQyxvQkFBVSxvQkFBVixvQkFBVTtHQW5EckIsaUJBQWlCLENBa25DN0I7QUFsbkNZLDhDQUFpQjs7Ozs7Ozs7OztBQ0o5QixJQUFZLFlBSVg7QUFKRCxXQUFZLFlBQVk7SUFDdEIscURBQVc7SUFDWCwrQ0FBSTtJQUNKLHFEQUFPO0FBQ1QsQ0FBQyxFQUpXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBSXZCO0FBRUQsSUFBWSxpQkFJWDtBQUpELFdBQVksaUJBQWlCO0lBQzNCLCtEQUFXO0lBQ1gsaUVBQVk7SUFDWixpRUFBWTtBQUNkLENBQUMsRUFKVyxpQkFBaUIsR0FBakIseUJBQWlCLEtBQWpCLHlCQUFpQixRQUk1Qjs7Ozs7Ozs7OztBQ3JERCwyQ0FBZ0U7QUFJaEUsU0FBZ0IsMkJBQTJCLENBQUMsR0FBb0I7SUFDOUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxtQkFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzVJLENBQUM7QUFGRCxrRUFFQzs7Ozs7Ozs7OztBQ1JELHlDQUEyQztBQUMzQyx5Q0FBOEM7QUFXOUMsMkNBQStJO0FBQy9JLDRDQUErQztBQUMvQyxnREFBNEQ7QUFJNUQsU0FBZ0IsMEJBQTBCLENBQ3hDLE1BQWEsRUFDYixRQUFnQixFQUNoQixlQUF5QixFQUN6QixhQUF1QjtJQUV2QixNQUFNLE1BQU0sR0FBRyx1QkFBdUIsQ0FBQyxNQUFNLENBQVEsQ0FBQztJQUd0RCxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3pDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLDhCQUFpQixFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0UsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLDhCQUFpQixFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekUsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQWJELGdFQWFDO0FBRUQsU0FBZ0IsdUJBQXVCLENBQU8sR0FBVSxFQUFFLFdBQWdCLEVBQUU7SUFDMUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1FBQ25CLGdDQUFnQixFQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNuQyxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sUUFBUSxDQUFDO0FBQ2xCLENBQUM7QUFMRCwwREFLQztBQUVELFNBQWdCLHNCQUFzQixDQUFDLFlBQTRDO0lBQ2pGLE9BQU8sQ0FBQyxNQUFNLENBQUMsbUJBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RKLENBQUM7QUFGRCx3REFFQztBQWNELFNBQWdCLHVCQUF1QixDQUFDLGFBQThDO0lBQ3BGLE9BQU87UUFDTCxNQUFNLENBQUMsbUJBQVEsQ0FBQyxRQUFRLENBQUM7UUFDekIsTUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7UUFDNUIsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7UUFDN0IsTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUM7UUFDOUIsTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7UUFDM0IsRUFBRTtRQUNGLEVBQUU7UUFDRixFQUFFO1FBQ0YsRUFBRTtRQUNGLEVBQUU7S0FDSCxDQUFDO0FBQ0osQ0FBQztBQWJELDBEQWFDO0FBRUQsU0FBZ0Isa0JBQWtCO0lBQ2hDLE1BQU0sR0FBRyxHQUF3QjtRQUMvQixNQUFNLEVBQUUsR0FBRztRQUNYLE9BQU8sRUFBRSxtQkFBUSxDQUFDLFFBQVE7UUFDMUIsT0FBTyxFQUFFLHlCQUFjLENBQUMsT0FBTztRQUMvQixNQUFNLEVBQUUsR0FBRztRQUNYLFFBQVEsRUFBRSxHQUFHO1FBQ2IsTUFBTSxFQUFFLE1BQU07UUFDZCxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0tBQ3JCLENBQUM7SUFDRixPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFYRCxnREFXQztBQUVELFNBQWdCLDJCQUEyQixDQUFDLGVBQWtEO0lBQzVGLE9BQU87UUFDTCxNQUFNLENBQUMsbUJBQVEsQ0FBQyxnQkFBZ0IsQ0FBQztRQUNqQyxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQztRQUM5QixNQUFNLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQztRQUNuQyxNQUFNLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQztRQUMvQixNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQztRQUM3QixFQUFFO1FBQ0YsRUFBRTtRQUNGLE1BQU0sQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDO1FBQzlCLEVBQUU7S0FDSCxDQUFDO0FBQ0osQ0FBQztBQWJELGtFQWFDO0FBRUQsU0FBZ0IsNEJBQTRCLENBQUMsZ0JBQW9EO0lBQy9GLE9BQU87UUFDTCxNQUFNLENBQUMsbUJBQVEsQ0FBQyxpQkFBaUIsQ0FBQztRQUNsQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO1FBQy9CLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUM7UUFDcEMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQztRQUNoQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDO1FBQzlCLEVBQUU7UUFDRixFQUFFO1FBQ0YsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQztRQUNuQyxFQUFFO1FBQ0YsRUFBRTtLQUNILENBQUM7QUFDSixDQUFDO0FBYkQsb0VBYUM7QUFFRCxTQUFnQiwwQkFBMEIsQ0FBQyxnQkFBb0Q7SUFDN0YsT0FBTztRQUNMLE1BQU0sQ0FBQyxtQkFBUSxDQUFDLFdBQVcsQ0FBQztRQUM1QixFQUFFO1FBQ0YsRUFBRTtRQUNGLEVBQUU7UUFDRixFQUFFO1FBQ0YsRUFBRTtRQUNGLEVBQUU7UUFDRixFQUFFO1FBQ0YsRUFBRTtRQUNGLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUM7S0FDckMsQ0FBQztBQUNKLENBQUM7QUFiRCxnRUFhQztBQUVELFNBQWdCLGVBQWUsQ0FBQyxLQUFrQjtJQUNoRCxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDdkQsQ0FBQztBQUZELDBDQUVDO0FBRUQsU0FBZ0Isa0JBQWtCLENBQ2hDLGFBQThCLEVBQzlCLFFBR0M7SUFFRCxNQUFNLE9BQU8sR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDO0lBQ3RDLFFBQVEsT0FBTyxFQUFFO1FBQ2YsS0FBSyxtQkFBUSxDQUFDLFFBQVE7WUFDcEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUU7Z0JBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQzthQUNyQztZQUNELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFO2dCQUN2QixNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7YUFDL0M7WUFDRCxNQUFNLEtBQUssR0FBRyxlQUFNLENBQUMsS0FBSztpQkFDdkIsWUFBWSxDQUNYLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUNuRDtnQkFDRSxrQkFBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO2dCQUNyQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDO2dCQUNsQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO2dCQUNyQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDO2dCQUNwQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDO2FBQ25DLENBQ0Y7aUJBQ0EsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN4QixPQUFPO2dCQUNMLFFBQVEsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxtQ0FBd0IsQ0FBQztnQkFDOUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRywyQkFBZ0IsQ0FBQztnQkFDMUUsVUFBVSxFQUFFLElBQUk7YUFDakIsQ0FBQztRQUNKLEtBQUssbUJBQVEsQ0FBQyxPQUFPO1lBQ25CLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFO2dCQUN2QixNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7YUFDckM7WUFDRCxNQUFNLEtBQUssR0FBRyxlQUFNLENBQUMsS0FBSztpQkFDdkIsWUFBWSxDQUNYLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLEVBQ3hDO2dCQUNFLGtCQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7Z0JBQ3JDLGtCQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7Z0JBQ2xDLGtCQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7Z0JBQ3JDLGtCQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7YUFDckMsQ0FDRjtpQkFDQSxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3hCLE9BQU87Z0JBQ0wsUUFBUSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLG1DQUF3QixDQUFDO2dCQUM5RSxRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLDJCQUFnQixDQUFDO2dCQUMxRSxVQUFVLEVBQUUsSUFBSTthQUNqQixDQUFDO1FBQ0osS0FBSyxtQkFBUSxDQUFDLFFBQVE7WUFDcEIsTUFBTSxLQUFLLEdBQUcsZUFBTSxDQUFDLEtBQUs7aUJBQ3ZCLFlBQVksQ0FDWCxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxFQUN4QztnQkFDRSxrQkFBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO2dCQUNyQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDO2dCQUN2QyxrQkFBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO2dCQUNyQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDO2FBQ3JDLENBQ0Y7aUJBQ0EsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN4QixPQUFPO2dCQUNMLFFBQVEsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxtQ0FBd0IsQ0FBQztnQkFDOUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRywyQkFBZ0IsQ0FBQztnQkFDMUUsVUFBVSxFQUFFLElBQUk7YUFDakIsQ0FBQztRQUNKLEtBQUssbUJBQVEsQ0FBQyxnQkFBZ0I7WUFDNUIsTUFBTSxPQUFPLEdBQUcsZUFBTSxDQUFDLEtBQUs7aUJBQ3pCLFlBQVksQ0FDWCxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxFQUN2QztnQkFDRSxrQkFBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO2dCQUNyQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDO2dCQUN2QyxrQkFBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO2dCQUNyQyxrQkFBUyxDQUFDLElBQUksQ0FBQyw0Q0FBd0IsRUFBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDdkUsQ0FDRjtpQkFDQSxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3hCLE9BQU87Z0JBQ0wsUUFBUSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLG1DQUF3QixDQUFDO2dCQUNoRixRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLDJCQUFnQixDQUFDO2dCQUM1RSxVQUFVLEVBQUUsS0FBSzthQUNsQixDQUFDO1FBQ0osS0FBSyxtQkFBUSxDQUFDLFdBQVc7WUFDdkIsTUFBTSxNQUFNLEdBQUcsZUFBTSxDQUFDLEtBQUs7aUJBQ3hCLFlBQVksQ0FDWCxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxFQUN2QztnQkFDRSxrQkFBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO2dCQUNyQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDO2dCQUNsQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO2dCQUNyQyxrQkFBUyxDQUFDLElBQUksQ0FBQyw0Q0FBd0IsRUFBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDdkUsQ0FDRjtpQkFDQSxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3hCLE9BQU87Z0JBQ0wsUUFBUSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLG1DQUF3QixDQUFDO2dCQUMvRSxRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLDJCQUFnQixDQUFDO2dCQUMzRSxVQUFVLEVBQUUsS0FBSzthQUNsQixDQUFDO1FBQ0osS0FBSyxtQkFBUSxDQUFDLGdCQUFnQjtZQUM1QixJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRTtnQkFDdkIsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2FBQ3pDO1lBQ0QsTUFBTSxPQUFPLEdBQUcsZUFBTSxDQUFDLEtBQUs7aUJBQ3pCLFlBQVksQ0FBQyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRSxrQkFBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztpQkFDOUcsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN4QixPQUFPO2dCQUNMLFFBQVEsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxtQ0FBd0IsQ0FBQztnQkFDaEYsUUFBUSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRywyQkFBZ0IsQ0FBQztnQkFDNUUsVUFBVSxFQUFFLEtBQUs7YUFDbEIsQ0FBQztRQUNKLEtBQUssbUJBQVEsQ0FBQyxtQkFBbUI7WUFDL0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUU7Z0JBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQzthQUN6QztZQUNELElBQUksQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFO2dCQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7YUFDdkM7WUFDRCxNQUFNLE9BQU8sR0FBRyxlQUFNLENBQUMsS0FBSztpQkFDekIsWUFBWSxDQUNYLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsRUFDN0I7Z0JBQ0Usa0JBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQztnQkFDckMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQztnQkFDbEMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsNENBQXdCLEVBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQ2hFLENBQ0Y7aUJBQ0EsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUNWLE9BQU8sRUFBRTtvQkFDUCxrQkFBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO29CQUNyQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDO29CQUNsQyxrQkFBUyxDQUFDLElBQUksQ0FBQyw0Q0FBd0IsRUFBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7aUJBQ2hFO2FBQ0YsQ0FBQyxDQUFDO1lBQ0gsT0FBTztnQkFDTCxRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsbUNBQXdCLENBQUM7Z0JBQ2hGLFFBQVEsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsMkJBQWdCLENBQUM7Z0JBQzVFLFVBQVUsRUFBRSxLQUFLO2FBQ2xCLENBQUM7UUFDSixLQUFLLG1CQUFRLENBQUMsY0FBYztZQUMxQixNQUFNLFNBQVMsR0FBRyxlQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3JILE9BQU87Z0JBQ0wsUUFBUSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLG1DQUF3QixDQUFDO2dCQUNsRixRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLDJCQUFnQixDQUFDO2dCQUM5RSxVQUFVLEVBQUUsS0FBSzthQUNsQixDQUFDO1FBQ0osS0FBSyxtQkFBUSxDQUFDLElBQUksQ0FBQztRQUNuQixLQUFLLG1CQUFRLENBQUMsT0FBTztZQUNuQixPQUFPO2dCQUNMLFFBQVEsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLG1DQUF3QixDQUFDO2dCQUNoRCxRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLDJCQUFnQixDQUFDO2dCQUN6RSxVQUFVLEVBQUUsS0FBSzthQUNsQixDQUFDO1FBQ0o7WUFDRSxNQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDdEM7QUFDSCxDQUFDO0FBbEtELGdEQWtLQztBQUVELFNBQVMsYUFBYSxDQUFDLEdBQVcsRUFBRSxLQUFhO0lBRS9DLElBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQztRQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUN2RSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLEtBQUs7UUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUM7SUFDN0UsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNuRCxPQUFPLE9BQU8sR0FBRyxHQUFHLENBQUM7QUFDdkIsQ0FBQztBQUVELFNBQWdCLFdBQVcsQ0FBQyxLQUFxRDtJQUMvRSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUM3QixJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDcEMsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ25DO0lBQ0QsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDN0IsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQzNCO0lBQ0QsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDN0IsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQzNCO0lBQ0QsSUFBSSxLQUFLLFlBQVksTUFBTSxFQUFFO1FBQzNCLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUM5QjtJQUNELElBQUksS0FBSyxZQUFZLFVBQVUsRUFBRTtRQUMvQixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzNDO0lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyw4REFBOEQsQ0FBQyxDQUFDO0FBQ2xGLENBQUM7QUFsQkQsa0NBa0JDO0FBRUQsU0FBZ0IsY0FBYyxDQUFDLEtBQWEsRUFBRSxLQUFhO0lBQ3pELE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNyQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMxRixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN4QyxDQUFDO0FBSkQsd0NBSUM7QUFFRCxTQUFnQixrQkFBa0IsQ0FBQyxJQUFZLEVBQUUsY0FBc0I7SUFDckUsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO0lBQzVCLE1BQU0sUUFBUSxHQUFHLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxjQUFjLEVBQUU7UUFDeEQsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDaEU7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBUkQsZ0RBUUM7QUFFRCxTQUFnQix1QkFBdUIsQ0FBQyxDQUFTLEVBQUUsVUFBa0I7SUFDbkUsTUFBTSxHQUFHLEdBQWEsRUFBRSxDQUFDO0lBQ3pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksVUFBVSxFQUFFO1FBQ2xELElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNiLEtBQUssSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxVQUFVLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDbEQsTUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztZQUM5QixHQUFHLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDOUM7UUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2Y7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFYRCwwREFXQztBQUNELFNBQWdCLHFCQUFxQixDQUFDLENBQVMsRUFBRSxTQUFpQjtJQUNoRSxNQUFNLEdBQUcsR0FBRyxFQUFFLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRXBDLE1BQU0sR0FBRyxHQUFhLEVBQUUsQ0FBQztJQUN6QixJQUFJLE1BQU0sR0FBVyxDQUFDLENBQUM7SUFDdkIsT0FBTyxNQUFNLEdBQUcsRUFBRSxFQUFFO1FBQ2xCLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sR0FBRyxNQUFNLElBQUksU0FBUyxDQUFDO0tBQzlCO0lBQ0QsT0FBTyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdkIsQ0FBQztBQVZELHNEQVVDOzs7Ozs7Ozs7O0FDM1dELDJDQUF1RDtBQUVoRCxNQUFNLFNBQVMsR0FBRyxDQUFDLEdBQWEsRUFBRSxFQUFFO0lBQ3pDLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUMzQixPQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQzNCLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNiLENBQUMsQ0FBQztBQUpXLGlCQUFTLGFBSXBCO0FBRUssTUFBTSxTQUFTLEdBQUcsQ0FBQyxHQUFhLEVBQUUsRUFBRTtJQUN6QyxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDM0IsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUMzQixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDYixDQUFDLENBQUM7QUFKVyxpQkFBUyxhQUlwQjtBQUVGLFNBQWdCLGtCQUFrQixDQUFDLE1BQWM7SUFFL0MsTUFBTSxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDO0lBQ3JDLE1BQU0sUUFBUSxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUM7SUFDL0IsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDM0QsTUFBTSxJQUFJLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzdCLE1BQU0sR0FBRyxHQUFHLGNBQWMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO0lBQ3hDLE1BQU0sU0FBUyxHQUFHLGNBQWMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBRXpFLE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxHQUFHLFNBQVMsQ0FBQztJQUM5QyxNQUFNLHNCQUFzQixHQUFHLGNBQWMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUM5RSxNQUFNLGFBQWEsR0FDakIsc0JBQXNCLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLEdBQUcsR0FBRyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLHNCQUFzQixHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ3pJLE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxhQUFhLENBQUM7SUFDbkQsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQWZELGdEQWVDO0FBRUQsU0FBZ0Isd0JBQXdCLENBQUMsTUFBYztJQUNyRCxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDakIsSUFBSSxNQUFNLEtBQUssRUFBRSxFQUFFO1FBQ2pCLE9BQU8sRUFBRSxDQUFDO0tBQ1g7SUFDRCxPQUFPLE1BQU0sR0FBRyxHQUFHLEtBQUssRUFBRSxFQUFFO1FBQzFCLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDZCxPQUFPLElBQUksRUFBRSxDQUFDO0tBQ2Y7SUFDRCxPQUFPLE1BQU0sR0FBRyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNuQyxDQUFDO0FBVkQsNERBVUM7QUFFRCxTQUFnQixxQkFBcUIsQ0FBQyxHQUFhLEVBQUUsWUFBb0IsMkJBQWdCO0lBQ3ZGLE1BQU0sR0FBRyxHQUFHLEdBQUc7U0FDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUNULE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQzthQUNiLFFBQVEsQ0FBQyxFQUFFLENBQUM7YUFDWixRQUFRLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNsQyxDQUFDLENBQUM7U0FDRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFWixPQUFPLElBQUksR0FBRyxHQUFHLENBQUM7QUFDcEIsQ0FBQztBQVZELHNEQVVDOzs7Ozs7O0FDckRELG9DOzs7Ozs7QUNBQSw4Qzs7Ozs7Ozs7O0FDQ0EsbURBQW9EO0FBQ3BELCtDQUFnRDtBQUNoRCxvREFBb0Y7QUFDcEYsMENBQWdEO0FBR3pDLEtBQUssVUFBVSxTQUFTO0lBQzdCLE1BQU0sR0FBRyxHQUFHLE1BQU0sMkJBQVEsRUFBQyxpQ0FBYyxDQUFDLENBQUM7SUFDM0MsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxzQ0FBaUIsQ0FBQyxDQUFDO0lBQzFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsdUJBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUV2QyxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFORCw4QkFNQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNiRCxvREFBb0Y7QUFDcEYsd0NBQXNEO0FBQ3RELGdEQUE0RDtBQUM1RCx5Q0FBOEM7QUFDOUMsMENBQWdEO0FBQ2hELG1EQUF5RTtBQUN6RSxtREFBbUU7QUFDbkUsOENBQW9EO0FBQ3BELDBDQUFnRDtBQUNoRCwwREFBeUY7QUFDekYseURBQXVGO0FBQ3ZGLG1EQUF5RTtBQUN6RSxpREFBK0Q7QUFDL0QsaURBQXVFO0FBcUJoRSxJQUFNLGNBQWMsR0FBcEIsTUFBTSxjQUFjO0lBRU47SUFDQTtJQUZuQixZQUNtQixNQUF5QixFQUN6QixhQUE0QjtRQUQ1QixXQUFNLEdBQU4sTUFBTSxDQUFtQjtRQUN6QixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtJQUMzQyxDQUFDO0lBRUwsWUFBWTtRQUNWLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDN0IsQ0FBQztDQUNGO0FBVFksY0FBYztJQW5CMUIsbUJBQU0sRUFBQztRQUNOLE9BQU8sRUFBRTtZQUNQLHFCQUFZO1lBQ1osNEJBQVk7WUFDWixrQ0FBZTtZQUNmLHdCQUFVLENBQUMsYUFBYSxDQUFDLHVCQUFZLENBQUMsTUFBTSxDQUFDO1lBQzdDLGtDQUFlO1lBQ2YsdUJBQWEsQ0FBQyxVQUFVLENBQ3RCO2dCQUNFLHdDQUFlO2dCQUNmLDBDQUFnQjthQUNqQixDQUFDO1lBQ0osNkJBQVk7U0FDYjtRQUNELFdBQVcsRUFBRSxFQUFFO1FBQ2YsU0FBUyxFQUFFO1lBQ1QsaUNBQWM7U0FDZjtLQUNGLENBQUM7eURBRzJCLHNDQUFpQixvQkFBakIsc0NBQWlCLG9EQUNWLDhCQUFhLG9CQUFiLDhCQUFhO0dBSHBDLGNBQWMsQ0FTMUI7QUFUWSx3Q0FBYzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNsQzNCLDBDQUFnRDtBQUNoRCxvREFBb0Y7QUFDcEYsOENBQXNEO0FBQ3RELHFDQUFvQjtBQUNwQix1Q0FBd0I7QUFDeEIseUNBQStDO0FBQy9DLDBDQUFtRDtBQUNuRCwwREFBeUY7QUFDekYsMENBQXFDO0FBRXJDLDhDQUF1RTtBQUN2RSx5Q0FBNkI7QUFDN0IsbURBQTJFO0FBRXBFLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWM7SUFFTjtJQUNBO0lBRVQ7SUFKVixZQUNtQixNQUFxQixFQUNyQixNQUF5QixFQUVsQyxlQUE2QztRQUhwQyxXQUFNLEdBQU4sTUFBTSxDQUFlO1FBQ3JCLFdBQU0sR0FBTixNQUFNLENBQW1CO1FBRWxDLG9CQUFlLEdBQWYsZUFBZSxDQUE4QjtJQUVuRCxDQUFDO0lBR0wsbUJBQW1CLENBQUMsSUFBWTtRQUM5QixPQUFPLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxJQUFJLGFBQWEsQ0FBQyxDQUFDO0lBQzlGLENBQUM7SUFHSyxLQUFELENBQUMsT0FBTyxDQUFDLEdBQTBCO1FBQ3RDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDBCQUEwQixHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFHbEUsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBR3RELE1BQU0sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEdBQUcsTUFBTSx1QkFBSyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDL0UsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFFLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzdELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUVwRSxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDO1lBQ2hDLFdBQVcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVc7U0FDbEMsRUFBQztZQUNBLFdBQVcsRUFBRSwrQkFBWSxDQUFDLFdBQVc7WUFDckMsS0FBSztTQUVOLENBQUMsQ0FBQztRQUNILE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUNGO0FBckJPO0lBREwsbUNBQWlCLEdBQUU7O3lEQUNELFlBQUcsb0JBQUgsWUFBRzs7NkNBb0JyQjtBQW5DVSxjQUFjO0lBRDFCLDRCQUFVLEVBQUMsRUFBQyxTQUFTLEVBQUUsdUJBQVksQ0FBQyxNQUFNLEVBQUMsQ0FBQztJQUt4Qyx5Q0FBZ0IsRUFBQywwQ0FBZ0IsQ0FBQzt5REFGVixzQkFBYSxvQkFBYixzQkFBYSxvREFDYixzQ0FBaUIsb0JBQWpCLHNDQUFpQixvREFFakIsb0JBQVUsb0JBQVYsb0JBQVU7R0FMMUIsY0FBYyxDQW9DMUI7QUFwQ1ksd0NBQWM7Ozs7Ozs7Ozs7QUNkM0IsTUFBTSxJQUFJLEdBQUcsbUJBQU8sQ0FBQyxFQUFNLENBQUMsQ0FBQztBQUM3Qix1Q0FBNkI7QUFFN0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyw0QkFBNkIsQ0FBQyxDQUFDO0FBQzVELE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQztBQUNwRCxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsa0JBQU8sRUFBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzNHLE1BQU0sa0JBQWtCLEdBQUcsa0JBQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3RELGtCQUFVLEdBQUcsa0JBQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ2xFLE1BQU0sT0FBTyxHQUFhLEVBQUUsQ0FBQztBQUM3QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUM7QUFFWixLQUFLLFVBQVUsS0FBSyxDQUFDLFNBQWlCLEVBQUUsU0FBaUIsRUFBRSxXQUFtQjtJQUNuRixPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsU0FBUyxFQUFFLENBQUMsQ0FBQztJQUNuQyxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsTUFBTSxlQUFlLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNqRixNQUFNLEVBQ0osU0FBUyxFQUNULFVBQVUsR0FDWCxHQUFHLE1BQU0sYUFBYSxDQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDN0QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLFNBQVMsRUFBRSxDQUFDLENBQUM7SUFDdEMsT0FBTztRQUNMLFdBQVc7UUFDWCxTQUFTO1FBQ1QsVUFBVTtLQUNYLENBQUM7QUFDSixDQUFDO0FBYkQsc0JBYUM7QUFFTSxLQUFLLFVBQVUsYUFBYSxDQUFDLFNBQWlCLEVBQUUsV0FBbUIsRUFBRSxXQUFtQjtJQUM3RixNQUFNLGNBQWMsR0FBRyxrQkFBTyxFQUFDLFNBQVMsRUFBRSxHQUFHLGtCQUFrQixJQUFJLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFFbEYsTUFBTSxTQUFTLEdBQUcsa0JBQU8sRUFBQyxTQUFTLEVBQUUsR0FBRyxrQkFBVSxJQUFJLFNBQVMsYUFBYSxDQUFDLENBQUM7SUFDOUUsTUFBTSxVQUFVLEdBQUcsa0JBQU8sRUFBQyxTQUFTLEVBQUUsR0FBRyxrQkFBVSxJQUFJLFNBQVMsY0FBYyxDQUFDLENBQUM7SUFDaEYsTUFBTSxRQUFRLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxHQUFHLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQywyQkFBMkIsQ0FBQztJQUN0RixNQUFNLEVBQUUsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxRQUFRLElBQUksY0FBYyxJQUFJLFdBQVcsU0FBUyxXQUFXLElBQUksU0FBUyxJQUFJLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFFOUgsT0FBTztRQUNMLE1BQU07UUFDTixTQUFTO1FBQ1QsVUFBVTtLQUNYLENBQUM7QUFDSixDQUFDO0FBYkQsc0NBYUM7QUFFTSxLQUFLLFVBQVUsZUFBZSxDQUFDLFNBQWlCLEVBQUUsU0FBaUIsRUFBRSxXQUFtQjtJQUM3RixNQUFNLFFBQVEsR0FBRyxrQkFBTyxFQUFDLFNBQVMsRUFBRSxHQUFHLGtCQUFrQixJQUFJLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDNUUsTUFBTSxXQUFXLEdBQUcsa0JBQU8sRUFBQyxTQUFTLEVBQUUsR0FBRyxrQkFBVSxJQUFJLFNBQVMsZUFBZSxDQUFDLENBQUM7SUFDbEYsTUFBTSxFQUFFLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsUUFBUSxJQUFJLFdBQVcsMkJBQTJCLFFBQVEsSUFBSSxXQUFXLE9BQU8sV0FBVyxTQUFTLFNBQVMsSUFBSSxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBRXZLLE9BQU87UUFDTCxNQUFNO1FBQ04sV0FBVztRQUNYLFdBQVc7S0FDWixDQUFDO0FBQ0osQ0FBQztBQVZELDBDQVVDO0FBR0QsU0FBUyxJQUFJLENBQUMsR0FBVztJQUN2QixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQzNDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDckMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBbUMsRUFBRSxFQUFFO1lBQ3JFLElBQUcsTUFBTTtnQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ25DLElBQUcsS0FBSztnQkFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlCLE9BQU8sT0FBTyxDQUFDLEVBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUNqRCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFXLEVBQUUsRUFBRTtZQUN2QixJQUFHLEtBQUs7Z0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoQyxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQzs7Ozs7OztBQ3BFRCxrQzs7Ozs7O0FDQUEsa0M7Ozs7OztBQ0FBLDJDOzs7Ozs7QUNBQSxnQzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0NBLG9EQUFvRjtBQUNwRixnREFBNEQ7QUFDNUQsd0NBQXNEO0FBQ3RELHVDQUEwQztBQUMxQyx5Q0FBOEM7QUFDOUMsMENBQXlEO0FBQ3pELDJDQUFrRDtBQUNsRCxtREFBcUQ7QUFDckQsbURBQXlFO0FBQ3pFLG1EQUF5RTtBQUN6RSwwQ0FBZ0Q7QUFDaEQsMERBQXlGO0FBQ3pGLDhDQUFvRDtBQUNwRCxtREFBMEU7QUFDMUUseURBQXVGO0FBQ3ZGLGlEQUFtRTtBQW9DNUQsSUFBTSxTQUFTLEdBQWYsTUFBTSxTQUFTO0lBRVM7SUFBN0IsWUFBNkIsTUFBeUI7UUFBekIsV0FBTSxHQUFOLE1BQU0sQ0FBbUI7SUFBSSxDQUFDO0lBRTNELFlBQVk7UUFDVixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyx1QkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVDLENBQUM7Q0FDRjtBQVBZLFNBQVM7SUFsQ3JCLG1CQUFNLEVBQUM7UUFDTixPQUFPLEVBQUU7WUFDUCxxQkFBWSxDQUFDLE9BQU8sRUFBRTtZQUN0QixpQkFBVTtZQUNWLDRCQUFZO1lBRVoseUJBQWMsQ0FBQyxPQUFPLEVBQUU7WUFDeEIsa0NBQWU7WUFDZixrQ0FBZTtZQUNmLHVCQUFhLENBQUMsVUFBVSxDQUN0QjtnQkFDRSx3Q0FBZTtnQkFDZiwwQ0FBZ0I7YUFDakIsQ0FBQztZQUNKLHdCQUFVLENBQUMsYUFBYSxDQUN0QjtnQkFDRSxTQUFTLEVBQUUsdUJBQVksQ0FBQyxJQUFJO2FBQzdCLEVBQ0Q7Z0JBQ0UsU0FBUyxFQUFFLHVCQUFZLENBQUMsU0FBUzthQUNsQyxFQUFFO2dCQUNELFNBQVMsRUFBRSx1QkFBWSxDQUFDLE1BQU07YUFDL0IsRUFBRTtnQkFDRCxTQUFTLEVBQUUsdUJBQVksQ0FBQyxRQUFRO2FBQ2pDLENBQ0Y7WUFDRCx1Q0FBb0I7WUFDcEIsa0NBQWlCO1NBQ2xCO1FBQ0QsV0FBVyxFQUFFLEVBQUU7UUFDZixTQUFTLEVBQUU7WUFDVCxrQ0FBZTtTQUNoQjtLQUNGLENBQUM7eURBR3FDLHNDQUFpQixvQkFBakIsc0NBQWlCO0dBRjNDLFNBQVMsQ0FPckI7QUFQWSw4QkFBUzs7Ozs7OztBQ3BEdEIsMEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNBQSw4Q0FBeUQ7QUFDekQsb0RBQW1GO0FBQ25GLGdEQUFzRTtBQUN0RSxvREFBb0Y7QUFDcEYsd0NBQW1EO0FBQ25ELDBDQUFtRDtBQUNuRCwwREFBeUY7QUFDekYseURBQXVGO0FBQ3ZGLGdEQUF3RTtBQUN4RSwwQ0FBK0M7QUFDL0MseUNBQStCO0FBQy9CLDBDQUF5RDtBQUN6RCxtREFBMkU7QUFFM0UsMkNBQXdEO0FBV2pELElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWU7SUFLZjtJQUNrQztJQUNDO0lBQ2M7SUFDRDtJQUNGO0lBQ3RDO0lBVlgsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZCLG1CQUFtQixHQUFHLENBQUMsQ0FBQztJQUN4QixrQkFBa0IsR0FBRyxDQUFDLENBQUM7SUFDL0IsWUFDVyxNQUF5QixFQUNTLFlBQXlDLEVBQ3hDLGVBQTZDLEVBQy9CLFFBQWUsRUFDaEIsYUFBb0IsRUFDdEIsV0FBa0IsRUFDeEQsb0JBQW1DO1FBTjNDLFdBQU0sR0FBTixNQUFNLENBQW1CO1FBQ1MsaUJBQVksR0FBWixZQUFZLENBQTZCO1FBQ3hDLG9CQUFlLEdBQWYsZUFBZSxDQUE4QjtRQUMvQixhQUFRLEdBQVIsUUFBUSxDQUFPO1FBQ2hCLGtCQUFhLEdBQWIsYUFBYSxDQUFPO1FBQ3RCLGdCQUFXLEdBQVgsV0FBVyxDQUFPO1FBQ3hELHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBZTtRQUVwRCxNQUFNLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFHaEMsQ0FBQztJQU1LLEtBQUQsQ0FBQyxPQUFPO1FBSVgsTUFBTSxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztJQUMxQyxDQUFDO0lBQ0QsS0FBSyxDQUFDLFNBQVM7UUFDYixNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQywwQkFBTyxDQUFDLGFBQWEsRUFBRSwwQkFBTyxDQUFDLGVBQWUsRUFBRSwwQkFBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFDdEgsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQywwQkFBTyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDdkcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQywwQkFBTyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbEcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQywwQkFBTyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbkcsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVPLFNBQVMsQ0FBVTtJQUMzQixLQUFLLENBQUMsMEJBQTBCO1FBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUM7UUFDakQsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQztZQUNoRCxNQUFNLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLElBQUk7YUFDWDtZQUNELEtBQUssRUFBRTtnQkFDTCxJQUFJLEVBQUUsc0JBQVEsRUFBQyxJQUFJLENBQUMsa0JBQWtCLENBQUM7Z0JBQ3ZDLFFBQVEsRUFBRSx5QkFBUyxDQUFDLE9BQU87YUFDNUI7WUFDRCxLQUFLLEVBQUU7Z0JBQ0wsSUFBSSxFQUFFLEtBQUs7YUFDWjtTQUNGLENBQUMsQ0FBQztRQUNILElBQUksWUFBWSxDQUFDLE1BQU0sRUFBRTtZQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsWUFBWSxDQUFDLE1BQU0sU0FBUyxDQUFDLENBQUM7WUFDaEYsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFlBQVksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNyRSxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDeEQsTUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMvQixNQUFNLEtBQUssR0FBRyxHQUFHLHVCQUFZLENBQUMsU0FBUyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFNckQsSUFBSTtvQkFDRixNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUU7d0JBQ3RELEtBQUs7d0JBQ0wsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJO3FCQUtkLENBQUMsQ0FBQztpQkFHSjtnQkFBQyxPQUFPLEtBQUssRUFBRTtvQkFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUN0QjthQUNGO1NBQ0Y7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLG1CQUFtQjtRQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUM7WUFDN0MsS0FBSyxFQUFFO2dCQUNMLFdBQVcsRUFBRSxzQkFBUSxFQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztnQkFDL0MsV0FBVyxFQUFFLCtCQUFZLENBQUMsVUFBVTthQUNyQztZQUNELEtBQUssRUFBRTtnQkFDTCxXQUFXLEVBQUUsS0FBSzthQUNuQjtTQUNGLENBQUMsQ0FBQztRQUNILElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsTUFBTSxDQUFDLE1BQU0sU0FBUyxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztZQUNqRSxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDbEQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUU1QixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQzNEO1NBQ0Y7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLG1CQUFtQjtRQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUM7WUFDN0MsS0FBSyxFQUFFO2dCQUNMLFdBQVcsRUFBRSxzQkFBUSxFQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztnQkFDOUMsV0FBVyxFQUFFLCtCQUFZLENBQUMsV0FBVzthQUN0QztZQUNELEtBQUssRUFBRTtnQkFDTCxXQUFXLEVBQUUsS0FBSzthQUNuQjtTQUNGLENBQUMsQ0FBQztRQUNILElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsTUFBTSxDQUFDLE1BQU0sU0FBUyxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztZQUNoRSxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDbEQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUU1QixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQzdEO1NBQ0Y7SUFDSCxDQUFDO0NBQ0Y7QUF4R087SUFETCxtQkFBSSxFQUFDLHlCQUFjLENBQUMsZUFBZSxDQUFDOzs7OzhDQU1wQztBQTNCVSxlQUFlO0lBVDNCLHVCQUFVLEVBQUM7UUFDVixLQUFLLEVBQUUsY0FBSyxDQUFDLE9BQU87S0FDckIsQ0FBQztJQWFHLHlDQUFnQixFQUFDLHdDQUFlLENBQUM7SUFDakMseUNBQWdCLEVBQUMsMENBQWdCLENBQUM7SUFDbEMsNENBQWUsRUFBQyx1QkFBWSxDQUFDLFNBQVMsQ0FBQztJQUN2Qyw0Q0FBZSxFQUFDLHVCQUFZLENBQUMsUUFBUSxDQUFDO0lBQ3RDLDRDQUFlLEVBQUMsdUJBQVksQ0FBQyxNQUFNLENBQUM7eURBTHBCLHNDQUFpQixvQkFBakIsc0NBQWlCLG9EQUN1QixvQkFBVSxvQkFBVixvQkFBVSxvREFDTixvQkFBVSxvQkFBVixvQkFBVSxvREFDSCxjQUFLLG9CQUFMLGNBQUssb0RBQ0QsY0FBSyxvQkFBTCxjQUFLLG9EQUNULGNBQUssb0JBQUwsY0FBSyxvREFDbEMsNkJBQWEsb0JBQWIsNkJBQWE7R0FYM0MsZUFBZSxDQThIM0I7QUE5SFksMENBQWU7Ozs7Ozs7Ozs7QUN6QjVCLElBQVksT0FJWDtBQUpELFdBQVksT0FBTztJQUNqQiwwQ0FBK0I7SUFDL0IsNENBQWlDO0lBQ2pDLDhDQUFtQztBQUNyQyxDQUFDLEVBSlcsT0FBTyxHQUFQLGVBQU8sS0FBUCxlQUFPLFFBSWxCO0FBQ1ksZ0JBQVEsR0FBYztJQUNqQyxPQUFPLENBQUMsYUFBYTtJQUNyQixPQUFPLENBQUMsY0FBYztJQUN0QixPQUFPLENBQUMsZUFBZTtDQUN4QixDQUFDOzs7Ozs7VUNURjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7Ozs7Ozs7QUN0QkEsd0NBQW9DO0FBRXBDLE1BQU0sT0FBTyxHQUFHLFFBQThCLENBQUM7QUFFL0Msc0NBQW1FO0FBQ25FLHVDQUFxRTtBQUNyRSx1Q0FBK0Q7QUFDL0QsMENBQTREO0FBQzVELDZDQUF5QztBQUN6Qyx1Q0FBMkM7QUFDM0Msb0RBQW9GO0FBQ3BGLHdDQUErRDtBQUMvRCx1REFBMEU7QUFFMUUsVUFBVSxDQUFDO0lBS1Q7UUFDRSxJQUFJLEVBQUUsdUJBQVksQ0FBQyxRQUFRO1FBQzNCLFNBQVMsRUFBRSxnQkFBaUI7S0FDN0I7SUFDRDtRQUNFLElBQUksRUFBRSx1QkFBWSxDQUFDLFNBQVM7UUFDNUIsU0FBUyxFQUFFLGdCQUFrQjtLQUM5QjtJQUNEO1FBQ0UsSUFBSSxFQUFFLHVCQUFZLENBQUMsTUFBTTtRQUN6QixTQUFTLEVBQUUsZ0JBQWU7S0FDM0I7Q0FDRixDQUFDLENBQUM7QUFDSCxLQUFLLFVBQVUsVUFBVSxDQUFDLE9BQXFCO0lBQzdDLElBQUcsT0FBTyxDQUFDLFNBQVMsRUFBQztRQUNuQixNQUFNLGNBQWMsQ0FBQyxzQkFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQzFDO1NBQU07UUFDTCxNQUFNLFVBQVUsR0FBRywwQkFBYSxHQUFFLENBQUM7UUFDbkMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxVQUFVLENBQUMsQ0FBQztRQUNoRSxJQUFHLE1BQU0sRUFBRTtZQUNULE1BQU0sTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO1NBQzFCO2FBQU07WUFDTCxNQUFNLElBQUksS0FBSyxDQUFDLFVBQVUsVUFBVSxZQUFZLENBQUMsQ0FBQztTQUNuRDtLQUNGO0FBQ0gsQ0FBQztBQUVELEtBQUssVUFBVSxjQUFjLENBQUMsTUFBZSxFQUFFLE9BQXFCO0lBQ2xFLE1BQU0sR0FBRyxHQUFHLE1BQU0sa0JBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMvRCxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLHNDQUFpQixDQUFDLENBQUM7SUFDMUMsTUFBTSxDQUFDLFVBQVUsQ0FBQywwQkFBYSxHQUFFLENBQUMsQ0FBQztJQUNuQyxNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLHlDQUFrQixDQUFDLENBQUM7SUFDbkQsY0FBYyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuQyxNQUFNLENBQUMsVUFBVSxDQUFDLDJCQUFjLEdBQUUsQ0FBQyxDQUFDO0lBRXBDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyx1QkFBWSxDQUFDLElBQUksbUJBQW1CLENBQUMsQ0FBQztJQUNwRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUMiLCJmaWxlIjoidHMtY29yZS9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY2x1c3RlclwiKTs7IiwiaW1wb3J0IHsgVHNPcGVyYXRvck1vZHVsZSB9IGZyb20gJy4vdHMtb3BlcmF0b3IubW9kdWxlJztcbmltcG9ydCB7IHNldHVwQXBwIH0gZnJvbSAnQHRzLXNkay9zZXR1cC5oZWxwZXInO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJvb3RzdHJhcCgpIHtcbiAgY29uc3QgYXBwID0gYXdhaXQgc2V0dXBBcHAoVHNPcGVyYXRvck1vZHVsZSk7XG5cbiAgcmV0dXJuIGFwcDtcbn0iLCJpbXBvcnQgeyBPcGVyYXRvckNvbnN1bWVyIH0gZnJvbSAnLi9pbmZyYXN0cnVjdHVyZS9vcGVyYXRvci5wcm9jZXNzb3InO1xuaW1wb3J0IHsgUGlub0xvZ2dlclNlcnZpY2UgfSBmcm9tICdAY29tbW9uL2xvZ2dlci9hZGFwdGVycy9yZWFsL3Bpbm9Mb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBNb2R1bGUsIE9uTW9kdWxlSW5pdCB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IExvZ2dlck1vZHVsZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2xvZ2dlci5tb2R1bGUnO1xuaW1wb3J0IHsgQ29uZmlnTW9kdWxlLCBDb25maWdTZXJ2aWNlIH0gZnJvbSAnQG5lc3Rqcy9jb25maWcnO1xuaW1wb3J0IHsgVHNXb3JrZXJOYW1lIH0gZnJvbSAnQHRzLXNkay9jb25zdGFudCc7XG5pbXBvcnQgeyBCdWxsUXVldWVNb2R1bGUgfSBmcm9tICdjb21tb24vYnVsbC1xdWV1ZS9zcmMvQnVsbFF1ZXVlLm1vZHVsZSc7XG5pbXBvcnQgeyBFdGhlcnNNb2R1bGUsIE1BSU5ORVRfTkVUV09SSywgR09FUkxJX05FVFdPUkssIE5ldHdvcmsgfSBmcm9tICduZXN0anMtZXRoZXJzJztcbmltcG9ydCB7IEJ1bGxNb2R1bGUgfSBmcm9tICdAYW5jaGFuODI4L25lc3QtYnVsbG1xJztcbmltcG9ydCB7IFRzVHlwZU9ybU1vZHVsZSB9IGZyb20gJ2NvbW1vbi90cy10eXBlb3JtL3NyYy90c3R5cGVvcm0ubW9kdWxlJztcbmltcG9ydCB7IE9wZXJhdG9yUHJvZHVjZXIgfSBmcm9tICcuL2luZnJhc3RydWN0dXJlL29wZXJhdG9yLnByb2R1Y2VyJztcbmltcG9ydCB7IFJvbGx1cEluZm9ybWF0aW9uIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL3JvbGx1cC9yb2xsdXBJbmZvcm1hdGlvbi5lbnRpdHknO1xuaW1wb3J0IHsgVHlwZU9ybU1vZHVsZSB9IGZyb20gJ0BuZXN0anMvdHlwZW9ybSc7XG5pbXBvcnQgeyBUcmFuc2FjdGlvbkluZm8gfSBmcm9tICdjb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC90cmFuc2FjdGlvbkluZm8uZW50aXR5JztcbmltcG9ydCB7IFdvcmtlck1vZHVsZSB9IGZyb20gJ0Bjb21tb24vY2x1c3Rlci9jbHVzdGVyLm1vZHVsZSc7XG5pbXBvcnQgeyBXb3JrZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9jbHVzdGVyL3dvcmtlci5zZXJ2aWNlJztcbmltcG9ydCB7IERhdGFiYXNlUHViU3ViTW9kdWxlIH0gZnJvbSAnQGNvbW1vbi9kYi1wdWJzdWIvZGItcHVic3ViLm1vZHVsZSc7XG5pbXBvcnQgeyBBY2NvdW50SW5mb3JtYXRpb24gfSBmcm9tICdAY29tbW9uL3RzLXR5cGVvcm0vYWNjb3VudC9hY2NvdW50SW5mb3JtYXRpb24uZW50aXR5JztcblxuY29uc3QgbG9jYWxOZXR3b3JrID0ge1xuICBuYW1lOiAnTE9DQUwnLFxuICBjaGFpbklkOiAzMTMzNyxcbiAgX2RlZmF1bHRQcm92aWRlcjogKHByb3ZpZGVyczogYW55KSA9PiB7XG4gICAgcmV0dXJuIG5ldyBwcm92aWRlcnMuSnNvblJwY1Byb3ZpZGVyKCdodHRwOi8vbG9jYWxob3N0Ojg1NDUnKTtcbiAgfSxcbn07XG5ATW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbmZpZ01vZHVsZSxcbiAgICBMb2dnZXJNb2R1bGUsXG4gICAgQnVsbFF1ZXVlTW9kdWxlLFxuICAgIEJ1bGxNb2R1bGUucmVnaXN0ZXJRdWV1ZSh7XG4gICAgICBxdWV1ZU5hbWU6IFRzV29ya2VyTmFtZS5DT1JFLFxuICAgIH0sXG4gICAge1xuICAgICAgcXVldWVOYW1lOiBUc1dvcmtlck5hbWUuT1BFUkFUT1IsXG4gICAgfSksXG4gICAgVHNUeXBlT3JtTW9kdWxlLFxuICAgIFR5cGVPcm1Nb2R1bGUuZm9yRmVhdHVyZShbUm9sbHVwSW5mb3JtYXRpb24sIFRyYW5zYWN0aW9uSW5mbywgQWNjb3VudEluZm9ybWF0aW9uXSksXG4gICAgRXRoZXJzTW9kdWxlLmZvclJvb3RBc3luYyh7XG4gICAgICBpbXBvcnRzOiBbQ29uZmlnTW9kdWxlXSxcbiAgICAgIGluamVjdDogW0NvbmZpZ1NlcnZpY2VdLFxuICAgICAgdXNlRmFjdG9yeTogKGNvbmZpZ1NlcnZpY2U6IENvbmZpZ1NlcnZpY2UpID0+ICh7XG4gICAgICAgIG5ldHdvcms6IGNvbmZpZ1NlcnZpY2UuZ2V0KCdFVEhFUkVVTV9ORVRXT1JLJywgJ1RFU1RORVQnKSA9PT0gJ01BSU5ORVQnID8gTUFJTk5FVF9ORVRXT1JLIDogR09FUkxJX05FVFdPUkssXG4gICAgICAgIGV0aGVyc2NhbjogY29uZmlnU2VydmljZS5nZXQoJ0VUSEVSU0NBTl9BUElfS0VZJyksXG4gICAgICAgIC8vIGN1c3RvbToge1xuICAgICAgICAvLyAgIHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODU0NScsXG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vIGluZnVyYTogY29uZmlnU2VydmljZS5nZXQoJ0lORlVSQV9BUElfS0VZJyksXG4gICAgICAgIHF1b3J1bTogMSxcbiAgICAgICAgdXNlRGVmYXVsdFByb3ZpZGVyOiB0cnVlLFxuICAgICAgfSksXG4gICAgfSksXG4gICAgV29ya2VyTW9kdWxlLFxuICAgIERhdGFiYXNlUHViU3ViTW9kdWxlLFxuICBdLFxuICBjb250cm9sbGVyczogW10sXG4gIHByb3ZpZGVyczogW09wZXJhdG9yQ29uc3VtZXIsIE9wZXJhdG9yUHJvZHVjZXIsXSxcbn0pXG5leHBvcnQgY2xhc3MgVHNPcGVyYXRvck1vZHVsZSBpbXBsZW1lbnRzIE9uTW9kdWxlSW5pdCB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1lbXB0eS1mdW5jdGlvblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGxvZ2dlcjogUGlub0xvZ2dlclNlcnZpY2UsIHByaXZhdGUgcmVhZG9ubHkgd29ya2VyU2VydmljZTogV29ya2VyU2VydmljZSkge31cblxuICBvbk1vZHVsZUluaXQoKTogdm9pZCB7XG4gICAgdGhpcy53b3JrZXJTZXJ2aWNlLnJlYWR5KCk7XG4gIH1cbn1cbiIsImltcG9ydCB7IFprT0JTIH0gZnJvbSAnLi4vLi4vLi4vdHMtY29udHJhY3QtdHlwZXMvY29udHJhY3RzL1prT0JTJztcbmltcG9ydCB7IFRzV29ya2VyTmFtZSB9IGZyb20gJ0B0cy1zZGsvY29uc3RhbnQnO1xuaW1wb3J0IHsgUGlub0xvZ2dlclNlcnZpY2UgfSBmcm9tICdAY29tbW9uL2xvZ2dlci9hZGFwdGVycy9yZWFsL3Bpbm9Mb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBFdGhlcnNDb250cmFjdCwgRXRoZXJzU2lnbmVyLCBJbmplY3RDb250cmFjdFByb3ZpZGVyLCBJbmplY3RTaWduZXJQcm92aWRlciwgV2FsbGV0IH0gZnJvbSAnbmVzdGpzLWV0aGVycyc7XG5pbXBvcnQgeyBDb25maWdTZXJ2aWNlIH0gZnJvbSAnQG5lc3Rqcy9jb25maWcnO1xuaW1wb3J0ICogYXMgQUJJIGZyb20gJy4uL2RvbWFpbi92ZXJpZmllZC1hYmkuanNvbic7XG5pbXBvcnQgeyBCdWxsV29ya2VyLCBCdWxsV29ya2VyUHJvY2VzcyB9IGZyb20gJ0BhbmNoYW44MjgvbmVzdC1idWxsbXEnO1xuaW1wb3J0IHsgSm9iIH0gZnJvbSAnYnVsbG1xJztcbmltcG9ydCB7IEJsb2NrSW5mb3JtYXRpb24gfSBmcm9tICdjb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC9ibG9ja0luZm9ybWF0aW9uLmVudGl0eSc7XG5cbkBCdWxsV29ya2VyKHtcbiAgcXVldWVOYW1lOiBUc1dvcmtlck5hbWUuT1BFUkFUT1IsXG4gIG9wdGlvbnM6IHtcbiAgICBjb25jdXJyZW5jeTogMSxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgT3BlcmF0b3JDb25zdW1lciB7XG4gIHByaXZhdGUgd2FsbGV0OiBXYWxsZXQ7XG4gIHByaXZhdGUgY29udHJhY3Q6IFprT0JTO1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvbmZpZzogQ29uZmlnU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlcjogUGlub0xvZ2dlclNlcnZpY2UsXG4gICAgQEluamVjdFNpZ25lclByb3ZpZGVyKCkgcHJpdmF0ZSByZWFkb25seSBldGhlcnNTaWduZXI6IEV0aGVyc1NpZ25lcixcbiAgICBASW5qZWN0Q29udHJhY3RQcm92aWRlcigpIHByaXZhdGUgcmVhZG9ubHkgZXRoZXJzQ29udHJhY3Q6IEV0aGVyc0NvbnRyYWN0LFxuICApIHtcbiAgICB0aGlzLndhbGxldCA9IHRoaXMuZXRoZXJzU2lnbmVyLmNyZWF0ZVdhbGxldCh0aGlzLmNvbmZpZy5nZXQoJ0VUSEVSRVVNX09QRVJBVE9SX1BSSVYnLCAnJykpO1xuICAgIHRoaXMuY29udHJhY3QgPSB0aGlzLmV0aGVyc0NvbnRyYWN0LmNyZWF0ZSh0aGlzLmNvbmZpZy5nZXQoJ0VUSEVSRVVNX1JPTExVUF9DT05UUkFDVF9BRERSJywgJycpLCBBQkksIHRoaXMud2FsbGV0KSBhcyB1bmtub3duIGFzIFprT0JTO1xuICB9XG5cbiAgQEJ1bGxXb3JrZXJQcm9jZXNzKClcbiAgYXN5bmMgcHJvY2Vzcyhqb2I6IEpvYjxCbG9ja0luZm9ybWF0aW9uPikge1xuICAgIHRoaXMubG9nZ2VyLmxvZyhgT3BlcmF0b3JDb25zdW1lci5wcm9jZXNzICR7am9iLmRhdGEuYmxvY2tOdW1iZXJ9YCk7XG4gICAgLy8gZXRoZXJzO1xuICAgIC8vIC8vIFRPRE86IHJlZmFjdG9yXG4gICAgLy8gY29uc3Qge2EsYixjfSA9IGpvYi5kYXRhLnByb29mIGFzIGFueTtcbiAgICAvLyBjb25zdCBpbnB1dCA9IGpvYi5kYXRhLnB1YmxpY0lucHV0IGFzIGFueTtcbiAgICAvLyBjb25zdCBnYXMgPSBhd2FpdCB0aGlzLmNvbnRyYWN0LmVzdGltYXRlR2FzLnZlcmlmeVByb29mKGEsIGIsIGMsIGlucHV0KTtcbiAgICAvLyB0aGlzLmxvZ2dlci5sb2coYE9wZXJhdG9yQ29uc3VtZXIucHJvY2VzcyAke2pvYi5kYXRhLmJsb2NrTnVtYmVyfSBnYXM9JHtnYXN9YCk7XG4gICAgLy8gY29uc3QgcmVjZWlwdCA9IGF3YWl0IHRoaXMuY29udHJhY3QudmVyaWZ5UHJvb2YoYSwgYiwgYywgaW5wdXQsIHtcbiAgICAvLyAgIGZyb206IHRoaXMud2FsbGV0LmFkZHJlc3MsXG4gICAgLy8gICBnYXM6IGdhcy50b051bWJlcigpLFxuICAgIC8vIH0pO1xuICAgIC8vIHRoaXMubG9nZ2VyLmxvZyhgT3BlcmF0b3JDb25zdW1lci5wcm9jZXNzIHR4SGFzaD0ke3JlY2VpcHQudHJhbnNhY3Rpb25IYXNofWApO1xuICAgIC8vIGF3YWl0IHRoaXMucHJpc21hU2VydmljZS5CbG9ja0luZm9ybWF0aW9uLnVwZGF0ZSh7XG4gICAgLy8gICB3aGVyZToge1xuICAgIC8vICAgICBibG9ja051bWJlcjogam9iLmRhdGEuYmxvY2tOdW1iZXIsXG4gICAgLy8gICB9LFxuICAgIC8vICAgZGF0YToge1xuICAgIC8vICAgICBzdGF0dXM6IEJsb2NrU3RhdHVzLkwxVkVSSUZJRURcbiAgICAvLyAgIH1cbiAgICAvLyB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuIiwiaW1wb3J0IHR5cGUgeyBXb3JrZXIgfSBmcm9tICdjbHVzdGVyJztcbmltcG9ydCB7IElOZXN0QXBwbGljYXRpb24sIElOZXN0QXBwbGljYXRpb25Db250ZXh0IH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuXG5leHBvcnQgZW51bSBUc1dvcmtlck5hbWUge1xuICBVTktOT1dOID0gJ3Vua25vd24nLFxuICBDT1JFID0gJ1RzQ29yZScsXG4gIE9QRVJBVE9SID0gJ1RzT3BlcmF0b3InLFxuICBQUk9WRVIgPSAnVHNQcm92ZXInLFxuICBTRVFVRU5DRVIgPSAnVHNTZXF1ZW5jZXInLFxuICBHQVRFV0FZID0gJ1RzR2F0ZXdheScsXG59XG5cbmV4cG9ydCB0eXBlIFdvcmtlckl0ZW0gPSB7XG4gIG5hbWU6IFRzV29ya2VyTmFtZTtcbiAgYm9vdHN0cmFwOiAoKSA9PiBQcm9taXNlPElOZXN0QXBwbGljYXRpb25Db250ZXh0IHwgSU5lc3RBcHBsaWNhdGlvbj47XG4gIHdvcmtlcj86IFdvcmtlcjtcbiAgaXNSZWFkeT86IGJvb2xlYW47XG59XG4iLCJpbXBvcnQgeyBDb25zb2xlTG9nZ2VyLCBJbmplY3RhYmxlIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgZ2V0UHJvY2Vzc05hbWUgfSBmcm9tICdAdHMtc2RrL2hlbHBlcic7XG5pbXBvcnQgeyBQaW5vTG9nZ2VyIH0gZnJvbSAnbmVzdGpzLXBpbm8nO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUGlub0xvZ2dlclNlcnZpY2UgZXh0ZW5kcyBDb25zb2xlTG9nZ2VyIHtcbiAgcmVhZG9ubHkgY29udGV4dE5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBsb2dnZXI6IFBpbm9Mb2dnZXIpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuY29udGV4dE5hbWUgPSAnY29udGV4dCc7XG4gIH1cblxuICBzZXRDb250ZXh0KG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMubG9nZ2VyLnNldENvbnRleHQobmFtZSk7XG4gIH1cblxuICB2ZXJib3NlKG1lc3NhZ2U6IGFueSwgY29udGV4dD86IHN0cmluZywgLi4uYXJnczogYW55W10pIHtcbiAgICBpZiAoY29udGV4dCkge1xuICAgICAgdGhpcy5sb2dnZXIudHJhY2UoeyBbdGhpcy5jb250ZXh0TmFtZV06IGNvbnRleHQsIHByb2Nlc3M6IGdldFByb2Nlc3NOYW1lKCkgfSwgbWVzc2FnZSwgLi4uYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9nZ2VyLnRyYWNlKG1lc3NhZ2UsIC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIGRlYnVnKG1lc3NhZ2U6IGFueSwgY29udGV4dD86IHN0cmluZywgLi4uYXJnczogYW55W10pIHtcbiAgICBpZiAoY29udGV4dCkge1xuICAgICAgdGhpcy5sb2dnZXIuZGVidWcoeyBbdGhpcy5jb250ZXh0TmFtZV06IGNvbnRleHQsIHByb2Nlc3M6IGdldFByb2Nlc3NOYW1lKCkgfSwgbWVzc2FnZSwgLi4uYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKG1lc3NhZ2UsIC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIGxvZyhtZXNzYWdlOiBhbnksIGNvbnRleHQ/OiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgaWYgKGNvbnRleHQpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmluZm8oeyBbdGhpcy5jb250ZXh0TmFtZV06IGNvbnRleHQsIHByb2Nlc3M6IGdldFByb2Nlc3NOYW1lKCkgfSwgbWVzc2FnZSwgLi4uYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9nZ2VyLmluZm8obWVzc2FnZSwgLi4uYXJncyk7XG4gICAgfVxuICB9XG5cbiAgd2FybihtZXNzYWdlOiBhbnksIGNvbnRleHQ/OiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgaWYgKGNvbnRleHQpIHtcbiAgICAgIHRoaXMubG9nZ2VyLndhcm4oeyBbdGhpcy5jb250ZXh0TmFtZV06IGNvbnRleHQsIHByb2Nlc3M6IGdldFByb2Nlc3NOYW1lKCkgfSwgbWVzc2FnZSwgLi4uYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9nZ2VyLndhcm4obWVzc2FnZSwgLi4uYXJncyk7XG4gICAgfVxuICB9XG5cbiAgZXJyb3IobWVzc2FnZTogYW55LCB0cmFjZT86IHN0cmluZywgY29udGV4dD86IHN0cmluZywgLi4uYXJnczogYW55W10pIHtcbiAgICBpZiAoY29udGV4dCkge1xuICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoeyBbdGhpcy5jb250ZXh0TmFtZV06IGNvbnRleHQsIHRyYWNlLCBwcm9jZXNzOiBnZXRQcm9jZXNzTmFtZSgpIH0sIG1lc3NhZ2UsIC4uLmFyZ3MpO1xuICAgIH0gZWxzZSBpZiAodHJhY2UpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKHsgdHJhY2UgfSwgbWVzc2FnZSwgLi4uYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKG1lc3NhZ2UsIC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQG5lc3Rqcy9jb21tb25cIik7OyIsImltcG9ydCB7IFRzV29ya2VyTmFtZSB9IGZyb20gJ0B0cy1zZGsvY29uc3RhbnQnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvY2Vzc05hbWUoKSB7XG4gIHJldHVybiBgJHtnZXRXb3JrZXJOYW1lKCl9LSR7cHJvY2Vzcy5waWR9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFdvcmtlck5hbWUoKTogVHNXb3JrZXJOYW1lIHtcbiAgcmV0dXJuIHByb2Nlc3MuZW52LlRTX1dPUktFUl9OQU1FIGFzIFRzV29ya2VyTmFtZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZGVsYXkodGltZTogbnVtYmVyKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCB0aW1lKSk7XG59IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibmVzdGpzLXBpbm9cIik7OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm5lc3Rqcy1ldGhlcnNcIik7OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIkBuZXN0anMvY29uZmlnXCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAYW5jaGFuODI4L25lc3QtYnVsbG1xXCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJidWxsbXFcIik7OyIsImltcG9ydCB7IEdsb2JhbCwgTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgTG9nZ2VyTW9kdWxlIGFzIFBpbm9Mb2dnZXJNb2R1bGUgfSBmcm9tICduZXN0anMtcGlubyc7XG5pbXBvcnQgeyBzdGRUaW1lRnVuY3Rpb25zIH0gZnJvbSAncGlubyc7XG5pbXBvcnQgKiBhcyB1dWlkIGZyb20gJ3V1aWQnO1xuaW1wb3J0IHsgRmFrZUxvZ2dlclNlcnZpY2UgfSBmcm9tICcuL2FkYXB0ZXJzL2Zha2UvRmFrZUxvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi9hZGFwdGVycy9yZWFsL3Bpbm9Mb2dnZXIuc2VydmljZSc7XG5cbmRlY2xhcmUgbW9kdWxlICdodHRwJyB7XG4gIGludGVyZmFjZSBJbmNvbWluZ01lc3NhZ2Uge1xuICAgIHJlcXVlc3RJZDogc3RyaW5nO1xuICB9XG59XG5cbkBHbG9iYWwoKVxuQE1vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBQaW5vTG9nZ2VyTW9kdWxlLmZvclJvb3Qoe1xuICAgICAgcGlub0h0dHA6IHtcbiAgICAgICAgbmFtZTogJ0FQSScsXG4gICAgICAgIGxldmVsOiBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nID8gJ2RlYnVnJyA6ICdpbmZvJyxcbiAgICAgICAgZ2VuUmVxSWQ6IChyZXEpID0+IHJlcS5yZXF1ZXN0SWQgfHwgdXVpZC52NCgpLFxuICAgICAgICBmb3JtYXR0ZXJzOiB7IGJpbmRpbmdzOiAoKSA9PiAoe30pIH0sXG4gICAgICAgIC8vIHJlZGFjdFxuICAgICAgICB0aW1lc3RhbXA6IHN0ZFRpbWVGdW5jdGlvbnMudW5peFRpbWUsXG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuICBwcm92aWRlcnM6IFtGYWtlTG9nZ2VyU2VydmljZSwgUGlub0xvZ2dlclNlcnZpY2VdLFxuICBleHBvcnRzOiBbRmFrZUxvZ2dlclNlcnZpY2UsIFBpbm9Mb2dnZXJTZXJ2aWNlXSxcbn0pXG5leHBvcnQgY2xhc3MgTG9nZ2VyTW9kdWxlIHt9XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJwaW5vXCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ1dWlkXCIpOzsiLCJpbXBvcnQgeyBDb25zb2xlTG9nZ2VyIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuXG5leHBvcnQgY2xhc3MgRmFrZUxvZ2dlclNlcnZpY2UgZXh0ZW5kcyBDb25zb2xlTG9nZ2VyIHtcbiAgcmVhZG9ubHkgY29udGV4dE5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBsb2dnZXI6IG51bGwpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuY29udGV4dE5hbWUgPSAnY29udGV4dCc7XG4gIH1cblxuICBwdWJsaWMgbG9nID0gKCkgPT4ge307XG4gIHB1YmxpYyBkZWJ1ZyA9ICgpID0+IHt9O1xuICBwdWJsaWMgdmVyYm9zZSA9ICgpID0+IHt9O1xuICBwdWJsaWMgaW5mbyA9ICgpID0+IHt9O1xuICBwdWJsaWMgd2FybiA9ICgpID0+IHt9O1xuICBwdWJsaWMgZXJyb3IgPSAoKSA9PiB7fTtcbiAgcHVibGljIHNldENvbnRleHQgPSAoKSA9PiB7fTtcbn1cbiIsImltcG9ydCB7IEJ1bGxNb2R1bGUgfSBmcm9tICdAYW5jaGFuODI4L25lc3QtYnVsbG1xJztcbmltcG9ydCB7IE1vZHVsZSB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IENvbmZpZ01vZHVsZSwgQ29uZmlnU2VydmljZSB9IGZyb20gJ0BuZXN0anMvY29uZmlnJztcblxuQE1vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBCdWxsTW9kdWxlLmZvclJvb3RBc3luYyh7XG4gICAgICBpbXBvcnRzOiBbQ29uZmlnTW9kdWxlXSxcbiAgICAgIGluamVjdDogW0NvbmZpZ1NlcnZpY2VdLFxuICAgICAgdXNlRmFjdG9yeTogYXN5bmMgKGNvbmZpZ1NlcnZpY2U6IENvbmZpZ1NlcnZpY2UpID0+ICh7XG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICBjb25uZWN0aW9uOiB7XG4gICAgICAgICAgICBob3N0OiBjb25maWdTZXJ2aWNlLmdldDxzdHJpbmc+KCdCVUxMX1FVRVVFX1JFRElTX0hPU1QnLCAnbG9jYWxob3N0JyksXG4gICAgICAgICAgICBwb3J0OiBjb25maWdTZXJ2aWNlLmdldDxudW1iZXI+KCdCVUxMX1FVRVVFX1JFRElTX1BPUlQnLCA2Mzc5KSxcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0pLFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBCdWxsUXVldWVNb2R1bGUge31cbiIsImltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgTG9nZ2VyTW9kdWxlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvbG9nZ2VyLm1vZHVsZSc7XG5pbXBvcnQgeyBHbG9iYWwsIE1vZHVsZSB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IENvbmZpZ01vZHVsZSwgQ29uZmlnU2VydmljZSB9IGZyb20gJ0BuZXN0anMvY29uZmlnJztcbmltcG9ydCB7IFR5cGVPcm1Nb2R1bGUgfSBmcm9tICdAbmVzdGpzL3R5cGVvcm0nO1xuaW1wb3J0IHsgQWNjb3VudE1vZHVsZSB9IGZyb20gJ0Bjb21tb24vdHMtdHlwZW9ybS9hY2NvdW50L2FjY291bnQubW9kdWxlJztcbmltcG9ydCB7IEF1Y3Rpb25PcmRlck1vdWRsZSB9IGZyb20gJ0Bjb21tb24vdHMtdHlwZW9ybS9hdWN0aW9uT3JkZXIvYXVjdGlvbk9yZGVyLm1vZHVsZSc7XG5pbXBvcnQgeyBSb2xsdXBNb2R1bGUgfSBmcm9tICdAY29tbW9uL3RzLXR5cGVvcm0vcm9sbHVwL3JvbGx1cC5tb2R1bGUnO1xuQEdsb2JhbCgpXG5ATW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbmZpZ01vZHVsZSxcbiAgICBMb2dnZXJNb2R1bGUsXG4gICAgVHlwZU9ybU1vZHVsZS5mb3JSb290QXN5bmMoe1xuICAgICAgaW1wb3J0czogW0NvbmZpZ01vZHVsZV0sXG4gICAgICBpbmplY3Q6IFtDb25maWdTZXJ2aWNlXSxcbiAgICAgIHVzZUZhY3Rvcnk6IChjb25maWdTZXJ2aWNlOiBDb25maWdTZXJ2aWNlKSA9PiB7XG4gICAgICAgIGNvbnN0IGlzUHJvZHVjdGlvbiA9IGNvbmZpZ1NlcnZpY2UuZ2V0KCdOT0RFX0VOVicpID09PSAncHJvZCc7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3NsOiBpc1Byb2R1Y3Rpb24sXG4gICAgICAgICAgZXh0cmE6IHtcbiAgICAgICAgICAgIHNzbDogaXNQcm9kdWN0aW9uPyB7IHJlamVjdFVuYXV0aG9yaXplZDogZmFsc2UgfSA6IG51bGwsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB0eXBlOiAncG9zdGdyZXMnLFxuICAgICAgICAgIGhvc3Q6IGNvbmZpZ1NlcnZpY2UuZ2V0PHN0cmluZz4oJ0RCX0hPU1QnLCAnJyksXG4gICAgICAgICAgcG9ydDogY29uZmlnU2VydmljZS5nZXQ8bnVtYmVyPignREJfUE9SVCcsIDU0MzIpLFxuICAgICAgICAgIHVzZXJuYW1lOiBjb25maWdTZXJ2aWNlLmdldDxzdHJpbmc+KCdEQl9VU0VSJywnJyksXG4gICAgICAgICAgcGFzc3dvcmQ6IGNvbmZpZ1NlcnZpY2UuZ2V0PHN0cmluZz4oJ0RCX1BBU1NXRCcsICcnKSxcbiAgICAgICAgICBkYXRhYmFzZTogY29uZmlnU2VydmljZS5nZXQ8c3RyaW5nPignREJfTkFNRScsICcnKSxcbiAgICAgICAgICBhdXRvTG9hZEVudGl0aWVzOiB0cnVlLFxuICAgICAgICAgIHN5bmNocm9uaXplOiBjb25maWdTZXJ2aWNlLmdldDxzdHJpbmc+KCdOT0RFX0VOVicsICdkZXYnKSA9PSAnZGV2JyxcbiAgICAgICAgICAvLyBzdWJzY3JpYmVyczogW1xuICAgICAgICAgIC8vICAgVHJhbnNhY3Rpb25TdWJzY3JpYmVyLFxuICAgICAgICAgIC8vIF1cbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfSksXG4gICAgLy8gQWNjb3VudE1vZHVsZSxcbiAgICBBY2NvdW50TW9kdWxlLCBBdWN0aW9uT3JkZXJNb3VkbGUsIFJvbGx1cE1vZHVsZVxuICBdLFxuICBwcm92aWRlcnM6IFtcbiAgICBUeXBlT3JtTW9kdWxlLFxuICAgIFBpbm9Mb2dnZXJTZXJ2aWNlXG4gIF0sXG4gIGV4cG9ydHM6IFtUeXBlT3JtTW9kdWxlXVxufSlcbmV4cG9ydCBjbGFzcyBUc1R5cGVPcm1Nb2R1bGUge31cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIkBuZXN0anMvdHlwZW9ybVwiKTs7IiwiaW1wb3J0IHsgR2xvYmFsLCBNb2R1bGUgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBDb25maWdNb2R1bGUgfSBmcm9tICdAbmVzdGpzL2NvbmZpZyc7XG5pbXBvcnQgeyBUeXBlT3JtTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy90eXBlb3JtJztcbmltcG9ydCB7IE9ic09yZGVyVHJlZVNlcnZpY2UgfSBmcm9tICcuLi9hdWN0aW9uT3JkZXIvb2JzT3JkZXJUcmVlLnNlcnZpY2UnO1xuaW1wb3J0IHsgQWNjb3VudEluZm9ybWF0aW9uIH0gZnJvbSAnLi9hY2NvdW50SW5mb3JtYXRpb24uZW50aXR5JztcbmltcG9ydCB7IEFjY291bnRMZWFmTm9kZSB9IGZyb20gJy4vYWNjb3VudExlYWZOb2RlLmVudGl0eSc7XG5pbXBvcnQgeyBBY2NvdW50TWVya2xlVHJlZU5vZGUgfSBmcm9tICcuL2FjY291bnRNZXJrbGVUcmVlTm9kZS5lbnRpdHknO1xuaW1wb3J0IHsgQmxvY2tJbmZvcm1hdGlvbiB9IGZyb20gJy4vYmxvY2tJbmZvcm1hdGlvbi5lbnRpdHknO1xuaW1wb3J0IHsgTWVya2xlVHJlZUNvbnRyb2xsZXIgfSBmcm9tICcuL21lcmtsZVRyZWUuY29udHJvbGxlcic7XG5pbXBvcnQgeyBPYnNNZXJrbGVUcmVlU2VydmljZSB9IGZyb20gJy4vb2JzTWVya2xlVHJlZVNlcnZpY2UnO1xuLy8gaW1wb3J0IHsgTWVya2xlVHJlZUNvbnRyb2xsZXIgfSBmcm9tICcuL21lcmtsZVRyZWUuY29udHJvbGxlcic7XG5pbXBvcnQgeyBUb2tlbkxlYWZOb2RlIH0gZnJvbSAnLi90b2tlbkxlYWZOb2RlLmVudGl0eSc7XG5pbXBvcnQgeyBUb2tlbk1lcmtsZVRyZWVOb2RlIH0gZnJvbSAnLi90b2tlbk1lcmtsZVRyZWVOb2RlLmVudGl0eSc7XG5pbXBvcnQgeyBUcmFuc2FjdGlvbkluZm8gfSBmcm9tICcuL3RyYW5zYWN0aW9uSW5mby5lbnRpdHknO1xuaW1wb3J0IHsgVHNBY2NvdW50VHJlZVNlcnZpY2UgfSBmcm9tICcuL3RzQWNjb3VudFRyZWUuc2VydmljZSc7XG5pbXBvcnQgeyBUc1Rva2VuVHJlZVNlcnZpY2UgfSBmcm9tICcuL3RzVG9rZW5UcmVlLnNlcnZpY2UnO1xuQEdsb2JhbCgpXG5ATW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbmZpZ01vZHVsZSxcbiAgICBUeXBlT3JtTW9kdWxlLmZvckZlYXR1cmUoW1xuICAgICAgQWNjb3VudEluZm9ybWF0aW9uLFxuICAgICAgQWNjb3VudExlYWZOb2RlLCBcbiAgICAgIEFjY291bnRNZXJrbGVUcmVlTm9kZSwgXG4gICAgICBUb2tlbk1lcmtsZVRyZWVOb2RlLCBcbiAgICAgIFRva2VuTGVhZk5vZGUsXG4gICAgICBUcmFuc2FjdGlvbkluZm8sXG4gICAgICBCbG9ja0luZm9ybWF0aW9uXG4gICAgXSlcbiAgXSxcbiAgcHJvdmlkZXJzOiBbVHNBY2NvdW50VHJlZVNlcnZpY2UsIFRzVG9rZW5UcmVlU2VydmljZSwgT2JzTWVya2xlVHJlZVNlcnZpY2VdLFxuICBjb250cm9sbGVyczogW10sXG4gIGV4cG9ydHM6IFtUc0FjY291bnRUcmVlU2VydmljZSwgVHNUb2tlblRyZWVTZXJ2aWNlLCBPYnNNZXJrbGVUcmVlU2VydmljZSwgVHlwZU9ybU1vZHVsZV1cbn0pXG5leHBvcnQgY2xhc3MgQWNjb3VudE1vZHVsZXt9IiwiaW1wb3J0IHsgQ29sdW1uLCBFbnRpdHksIEpvaW5Db2x1bW4sIE9uZVRvTWFueSwgT25lVG9PbmUsIFByaW1hcnlDb2x1bW4gfSBmcm9tICd0eXBlb3JtJztcbi8vIGltcG9ydCB7IEF1Y3Rpb25PcmRlckxlYWZOb2RlIH0gZnJvbSAnLi4vYXVjdGlvbk9yZGVyL2F1Y3Rpb25PcmRlckxlYWZOb2RlLmVudGl0eSc7XG5pbXBvcnQgeyBPYnNPcmRlckVudGl0eSB9IGZyb20gJy4uL2F1Y3Rpb25PcmRlci9vYnNPcmRlci5lbnRpdHknO1xuaW1wb3J0IHsgQmFzZVRpbWVFbnRpdHkgfSBmcm9tICcuLi9jb21tb24vYmFzZVRpbWVFbnRpdHknO1xuaW1wb3J0IHsgdHNIYXNoRnVuYyB9IGZyb20gJy4uL2NvbW1vbi90cy1oZWxwZXInO1xuaW1wb3J0IHsgQWNjb3VudE1lcmtsZVRyZWVOb2RlIH0gZnJvbSAnLi9hY2NvdW50TWVya2xlVHJlZU5vZGUuZW50aXR5JztcbmltcG9ydCB7IFJvbGUgfSBmcm9tICcuL3JvbGUuZW51bSc7XG5pbXBvcnQgeyBUcmFuc2FjdGlvbkluZm8gfSBmcm9tICcuL3RyYW5zYWN0aW9uSW5mby5lbnRpdHknO1xuXG5ARW50aXR5KCdBY2NvdW50SW5mb3JtYXRpb24nLCB7IHNjaGVtYTogJ3B1YmxpYycgfSlcbmV4cG9ydCBjbGFzcyBBY2NvdW50SW5mb3JtYXRpb24gZXh0ZW5kcyBCYXNlVGltZUVudGl0eSB7XG4gIEBQcmltYXJ5Q29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ0wxQWRkcmVzcycsXG4gICAgbGVuZ3RoOiAyNTYsXG4gICAgcHJpbWFyeTogdHJ1ZSxcbiAgfSlcbiAgTDFBZGRyZXNzITogc3RyaW5nO1xuXG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYWNjb3VudElkJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgfSlcbiAgYWNjb3VudElkITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ2VtYWlsJyxcbiAgICBsZW5ndGg6IDI1NixcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgICB1bmlxdWU6IGZhbHNlLFxuICB9KVxuICBlbWFpbCE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdsYXN0ZWRMb2dpbklwJyxcbiAgICBsZW5ndGg6IDI1NixcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgICBkZWZhdWx0OiBudWxsLFxuICB9KVxuICBsYXN0ZWRMb2dpbklwITogc3RyaW5nIHwgbnVsbDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3RpbWVzdGFtcCB3aXRob3V0IHRpbWUgem9uZScsXG4gICAgbmFtZTogJ2xhc3RMb2dpblRpbWUnLFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICB9KVxuICBsYXN0TG9naW5UaW1lITogRGF0ZSB8IG51bGw7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdlbnVtJyxcbiAgICBuYW1lOiAncm9sZScsXG4gICAgZW51bU5hbWU6ICdSb2xlJyxcbiAgICBlbnVtOiBbUm9sZS5BRE1JTiwgUm9sZS5NRU1CRVIsIFJvbGUuT1BFUkFUT1JdLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiBSb2xlLk1FTUJFUixcbiAgfSlcbiAgcm9sZSE6IFJvbGU7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAncGFzc3dvcmQnLFxuICAgIGxlbmd0aDogMzAwLFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICB9KVxuICBwYXNzd29yZCE6IHN0cmluZyB8IG51bGw7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAncmVmcmVzaFRva2VuJyxcbiAgICBsZW5ndGg6IDQwMCxcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgfSlcbiAgcmVmcmVzaFRva2VuITogc3RyaW5nIHwgbnVsbDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2pzb25iJyxcbiAgICBuYW1lOiAnbGFiZWwnLFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICAgIGRlZmF1bHQ6ICgpID0+ICdcXCd7fVxcJycsXG4gIH0pXG4gIGxhYmVsITogb2JqZWN0O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ2xhYmVsQnknLFxuICAgIGxlbmd0aDogMjU2LFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICB9KVxuICBsYWJlbEJ5ITogc3RyaW5nIHwgbnVsbDtcblxuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ3RzUHViS2V5WCcsXG4gICAgbGVuZ3RoOiAnMTAwJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogJ1xcJzBcXCcnLFxuICB9KVxuICB0c1B1YktleVghOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAndHNQdWJLZXlZJyxcbiAgICBsZW5ndGg6ICcxMDAnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAnXFwnMFxcJycsXG4gIH0pXG4gIHRzUHViS2V5WSE6IHN0cmluZztcbiAgLy8gcmVsYXRpb25zXG4gIC8vIEBPbmVUb09uZSgoKSA9PiBBY2NvdW50TWVya2xlVHJlZU5vZGUsIChhY2NvdW50TWVya2xlVHJlZU5vZGU6IEFjY291bnRNZXJrbGVUcmVlTm9kZSkgPT4gYWNjb3VudE1lcmtsZVRyZWVOb2RlLmxlYWYpXG4gIC8vIGFjY291bnRNZXJrbGVUcmVlTm9kZSE6IEFjY291bnRNZXJrbGVUcmVlTm9kZTtcbiAgLy8gQE9uZVRvTWFueShcbiAgLy8gICAoKSA9PiBBdWN0aW9uT3JkZXJMZWFmTm9kZSxcbiAgLy8gICAoYXVjdGlvbk9yZGVyTGVhZk5vZGU6QXVjdGlvbk9yZGVyTGVhZk5vZGUpID0+IGF1Y3Rpb25PcmRlckxlYWZOb2RlLkwyQWRkckZyb21BY2NvdW50XG4gIC8vIClcbiAgLy8gZnJvbUF1Y3Rpb25PcmRlckxlYWZOb2RlcyE6IEF1Y3Rpb25PcmRlckxlYWZOb2RlW107XG4gIC8vIEBPbmVUb01hbnkoXG4gIC8vICAgKCkgPT4gQXVjdGlvbk9yZGVyTGVhZk5vZGUsXG4gIC8vICAgKGF1Y3Rpb25PcmRlckxlYWZOb2RlOkF1Y3Rpb25PcmRlckxlYWZOb2RlKSA9PiBhdWN0aW9uT3JkZXJMZWFmTm9kZS5MMkFkZHJUb0FjY291bnRcbiAgLy8gKVxuICAvLyB0b0F1Y3Rpb25PcmRlckxlYWZOb2RlcyE6IEF1Y3Rpb25PcmRlckxlYWZOb2RlW107XG4gIEBPbmVUb01hbnkoKCkgPT4gVHJhbnNhY3Rpb25JbmZvLCAodHJhbnNhY3Rpb25JbmZvOiBUcmFuc2FjdGlvbkluZm8pID0+IHRyYW5zYWN0aW9uSW5mby5MMkFjY291bnRJbmZvKVxuICB0cmFuc2FjdGlvbkluZm9zITogVHJhbnNhY3Rpb25JbmZvW107XG4gIEBPbmVUb01hbnkoKCkgPT4gT2JzT3JkZXJFbnRpdHksIChvYnNPcmRlcjogT2JzT3JkZXJFbnRpdHkpID0+IG9ic09yZGVyLmFjY291bnRJbmZvKVxuICBASm9pbkNvbHVtbih7XG4gICAgbmFtZTogJ2FjY291bnRJZCcsXG4gICAgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICdhY2NvdW50SWQnLFxuICB9KVxuICBvYnNPcmRlcnMhOiBPYnNPcmRlckVudGl0eVtdIHwgbnVsbDtcblxuICBnZXQgaGFzaGVkVHNQdWJLZXkoKSB7XG4gICAgY29uc3QgcmF3ID0gQmlnSW50KHRzSGFzaEZ1bmMoW1xuICAgICAgdGhpcy50c1B1YktleVgsIHRoaXMudHNQdWJLZXlZXG4gICAgXSkpO1xuICAgIGNvbnN0IGhhc2ggPSByYXcgJSBCaWdJbnQoMiAqKiAxNjApO1xuICAgIHJldHVybiBoYXNoO1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ0eXBlb3JtXCIpOzsiLCJpbXBvcnQgeyBtYXRjaEUgfSBmcm9tICdmcC10cy9saWIvSU9FaXRoZXInO1xuaW1wb3J0IHsgQ29sdW1uLCBFbnRpdHksIEpvaW5Db2x1bW4sIE1hbnlUb09uZSwgT25lVG9NYW55LCBPbmVUb09uZSwgUHJpbWFyeUdlbmVyYXRlZENvbHVtbiB9IGZyb20gJ3R5cGVvcm0nO1xuaW1wb3J0IHsgQWNjb3VudEluZm9ybWF0aW9uIH0gZnJvbSAnLi4vYWNjb3VudC9hY2NvdW50SW5mb3JtYXRpb24uZW50aXR5JztcbmltcG9ydCB7IE1hdGNoT2JzT3JkZXJFbnRpdHkgfSBmcm9tICcuL21hdGNoT2JzT3JkZXIuZW50aXR5JztcbmltcG9ydCB7IE9ic09yZGVyTGVhZkVudGl0eSB9IGZyb20gJy4vb2JzT3JkZXJMZWFmLmVudGl0eSc7XG5pbXBvcnQgeyBUc1NpZGUgfSBmcm9tICcuL3RzU2lkZS5lbnVtJztcblxuQEVudGl0eSgnT2JzT3JkZXInLCB7IHNjaGVtYTogJ3B1YmxpYyd9KVxuZXhwb3J0IGNsYXNzIE9ic09yZGVyRW50aXR5IHtcbiAgQFByaW1hcnlHZW5lcmF0ZWRDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnQ4JyxcbiAgICBuYW1lOiAnaWQnLFxuICB9KVxuICBpZCE6IG51bWJlcjtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2VudW0nLFxuICAgIG5hbWU6ICdzaWRlJyxcbiAgICBlbnVtTmFtZTogJ1NJREUnLFxuICAgIGVudW06IFtcbiAgICAgIFRzU2lkZS5CVVksXG4gICAgICBUc1NpZGUuU0VMTCxcbiAgICBdLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAoKSA9PiBgXFwnJHtUc1NpZGUuQlVZfVxcJ2AsXG4gIH0pXG4gIHNpZGUhOiBUc1NpZGU7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnQ4JyxcbiAgICBuYW1lOiAndHhJZCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDAsXG4gIH0pXG4gIHR4SWQhOiBudW1iZXI7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBuYW1lOiAncmVxVHlwZScsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDAsXG4gIH0pXG4gIHJlcVR5cGUhOiBudW1iZXI7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYWNjb3VudElkJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgYWNjb3VudElkITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ21hcmtldFBhaXInLFxuICAgIGxlbmd0aDogMTAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAnXFwnRVRIL1VTRENcXCcnLFxuICB9KVxuICBtYXJrZXRQYWlyITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ3ByaWNlJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiA4LFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgcHJpY2UhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBuYW1lOiAnb3JkZXJTdGF0dXMnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAxLCAvLyBwZW5kaW5nPTEsIGNhbmNlbGVkPTIsIG1hdGNoZWQ9M1xuICB9KVxuICBvcmRlclN0YXR1cyE6IG51bWJlcjtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdtYWluUXR5JyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgbWFpblF0eSE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdiYXNlUXR5JyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgYmFzZVF0eSE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdyZW1haW5NYWluUXR5JyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgcmVtYWluTWFpblF0eSE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdyZW1haW5CYXNlUXR5JyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgcmVtYWluQmFzZVF0eSE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdhY2N1bXVsYXRlZE1haW5RdHknLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBhY2N1bXVsYXRlZE1haW5RdHkhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYWNjdW11bGF0ZWRCYXNlUXR5JyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgYWNjdW11bGF0ZWRCYXNlUXR5ITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ21haW5Ub2tlbklkJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwLFxuICB9KVxuICBtYWluVG9rZW5JZCE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdiYXNlVG9rZW5JZCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMCxcbiAgfSlcbiAgYmFzZVRva2VuSWQhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd0aW1lc3RhbXAgd2l0aG91dCB0aW1lIHpvbmUnLFxuICAgIG5hbWU6ICd0aW1lc3RhbXAnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBwcmVjaXNpb246IDMsXG4gICAgZGVmYXVsdDogKCkgPT4gJ25vdygpJyxcbiAgfSlcbiAgdGltZXN0YW1wITogRGF0ZTtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIG5hbWU6ICdpc01ha2VyJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogZmFsc2UsIFxuICB9KVxuICBpc01ha2VyITogYm9vbGVhbjtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2ludDgnLFxuICAgIG5hbWU6ICdvcmRlckxlYWZJZCcsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gICAgdW5pcXVlOiB0cnVlLFxuICB9KVxuICBvcmRlckxlYWZJZCE6IG51bWJlciB8IG51bGw7XG4gIC8vIEBPbmVUb09uZShcbiAgLy8gICAoKSA9PiBPYnNPcmRlckxlYWZFbnRpdHksXG4gIC8vICAgKG9ic09yZGVyOiBPYnNPcmRlckxlYWZFbnRpdHkgKSA9PiBvYnNPcmRlci5vYnNPcmRlcixcbiAgLy8gKVxuICAvLyBASm9pbkNvbHVtbih7XG4gIC8vICAgbmFtZTogJ2lkJyxcbiAgLy8gICByZWZlcmVuY2VkQ29sdW1uTmFtZTogJ29yZGVySWQnXG4gIC8vIH0pXG4gIC8vIG9ic09yZGVyTGVhZiE6IE9ic09yZGVyTGVhZkVudGl0eTtcbiAgQE9uZVRvTWFueShcbiAgICAoKSA9PiBNYXRjaE9ic09yZGVyRW50aXR5LFxuICAgIChtYXRjaE9yZGVyczogTWF0Y2hPYnNPcmRlckVudGl0eSkgPT4gbWF0Y2hPcmRlcnMubWFya2V0UGFpclxuICApXG4gIEBKb2luQ29sdW1uKHtcbiAgICBuYW1lOiAnaWQnLFxuICAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAncmVmZXJlbmNlT3JkZXInXG4gIH0pXG4gIG1hdGNoT3JkZXJzITogTWF0Y2hPYnNPcmRlckVudGl0eVtdO1xuICBATWFueVRvT25lKFxuICAgICgpID0+IEFjY291bnRJbmZvcm1hdGlvbixcbiAgICAoYWNjb3VudEluZm86IEFjY291bnRJbmZvcm1hdGlvbikgPT4gYWNjb3VudEluZm8ub2JzT3JkZXJzLFxuICAgIHtcbiAgICAgIG9uRGVsZXRlOiAnUkVTVFJJQ1QnLFxuICAgICAgb25VcGRhdGU6ICdDQVNDQURFJ1xuICAgIH1cbiAgKVxuICBASm9pbkNvbHVtbih7XG4gICAgbmFtZTogJ2FjY291bnRJZCcsXG4gICAgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICdhY2NvdW50SWQnXG4gIH0pXG4gIGFjY291bnRJbmZvITogQWNjb3VudEluZm9ybWF0aW9uOyBcbn0iLCJpbXBvcnQgeyBDb2x1bW4sIEVudGl0eSwgSm9pbkNvbHVtbiwgTWFueVRvT25lLCBPbmVUb09uZSwgUHJpbWFyeUdlbmVyYXRlZENvbHVtbiB9IGZyb20gJ3R5cGVvcm0nO1xuaW1wb3J0IHsgVHJhbnNhY3Rpb25JbmZvIH0gZnJvbSAnLi4vYWNjb3VudC90cmFuc2FjdGlvbkluZm8uZW50aXR5JztcbmltcG9ydCB7IFRzVHhUeXBlIH0gZnJvbSAnLi9kdG8vdHNUeFR5cGUuZW51bSc7XG5pbXBvcnQgeyBPYnNPcmRlckVudGl0eSB9IGZyb20gJy4vb2JzT3JkZXIuZW50aXR5JztcbmltcG9ydCB7IFRzU2lkZSB9IGZyb20gJy4vdHNTaWRlLmVudW0nO1xuXG5ARW50aXR5KCdNYXRjaE9ic09yZGVyJywgeyBzY2hlbWE6ICdwdWJsaWMnfSlcbmV4cG9ydCBjbGFzcyBNYXRjaE9ic09yZGVyRW50aXR5IHtcbiAgQFByaW1hcnlHZW5lcmF0ZWRDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnQ4JyxcbiAgICBuYW1lOiAnaWQnXG4gIH0pXG4gIGlkITogbnVtYmVyO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZW51bScsXG4gICAgbmFtZTogJ3NpZGUnLFxuICAgIGVudW1OYW1lOiAnU0lERScsXG4gICAgZW51bTogW1xuICAgICAgVHNTaWRlLkJVWSxcbiAgICAgIFRzU2lkZS5TRUxMXG4gICAgXSxcbiAgICBkZWZhdWx0OiAoKSA9PiBgJyR7VHNTaWRlLkJVWX0nYCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gIH0pXG4gIHNpZGUhOiBUc1NpZGU7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnQ4JyxcbiAgICBuYW1lOiAndHhJZCcsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gIH0pXG4gIHR4SWQhOiBudW1iZXIgfCBudWxsO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50OCcsXG4gICAgbmFtZTogJ3R4SWQyJyxcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgfSlcbiAgdHhJZDIhOiBudW1iZXIgfCBudWxsO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50OCcsXG4gICAgbmFtZTogJ3JlZmVyZW5jZU9yZGVyJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gIH0pXG4gIHJlZmVyZW5jZU9yZGVyITogbnVtYmVyO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgbmFtZTogJ3JlcVR5cGUnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwLFxuICB9KVxuICByZXFUeXBlITogbnVtYmVyOyBcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdtYXJrZXRQYWlyJyxcbiAgICBsZW5ndGg6IDEwMCxcbiAgICBkZWZhdWx0OiAnXFwnRVRIL1VTRENcXCcnLFxuICAgIG51bGxhYmxlOiBmYWxzZVxuICB9KVxuICBtYXJrZXRQYWlyITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ21hdGNoZWRNUScsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgbWF0Y2hlZE1RITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ21hdGNoZWRCUScsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBkZWZhdWx0OiAwblxuICB9KVxuICBtYXRjaGVkQlEhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd0aW1lc3RhbXAgd2l0aG91dCB0aW1lIHpvbmUnLFxuICAgIG5hbWU6ICd0aW1lc3RhbXAnLFxuICAgIHByZWNpc2lvbjogMyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogJ25vdygpJ1xuICB9KVxuICB0aW1lc3RhbXAhOiBEYXRlO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgbmFtZTogJ29yZGVyU3RhdHVzJyxcbiAgICBkZWZhdWx0OiAxLFxuICB9KSBcbiAgb3JkZXJTdGF0dXMhOiBudW1iZXI7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBuYW1lOiAnaXNWb2lkJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgfSkgXG4gIGlzVm9pZCE6IGJvb2xlYW47XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBuYW1lOiAnaXNDYW5jZWwnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICB9KSBcbiAgaXNDYW5jZWwhOiBib29sZWFuO1xuICBATWFueVRvT25lKFxuICAgICgpID0+IE9ic09yZGVyRW50aXR5LFxuICAgIChvYnNPcmRlcjogT2JzT3JkZXJFbnRpdHkpID0+IG9ic09yZGVyLm1hdGNoT3JkZXJzLFxuICAgIHtcbiAgICAgIG9uVXBkYXRlOiAnQ0FTQ0FERScsXG4gICAgICBvbkRlbGV0ZTogJ1JFU1RSSUNUJ1xuICAgIH0gXG4gIClcbiAgQEpvaW5Db2x1bW4oe1xuICAgIG5hbWU6ICdyZWZlcmVuY2VPcmRlcicsXG4gICAgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICdpZCcsXG4gIH0pXG4gIG1haW5PcmRlciE6IE9ic09yZGVyRW50aXR5O1xuICBAT25lVG9PbmUoXG4gICAgKCkgPT4gVHJhbnNhY3Rpb25JbmZvLFxuICAgICh0cmFuc2FjdGlvbjogVHJhbnNhY3Rpb25JbmZvKSA9PiB0cmFuc2FjdGlvbi5tYXRjaGVkT3JkZXIsXG4gICAge1xuICAgICAgb25EZWxldGU6ICdSRVNUUklDVCcsXG4gICAgICBvblVwZGF0ZTogJ0NBU0NBREUnXG4gICAgfVxuICApXG4gIEBKb2luQ29sdW1uKHtcbiAgICBuYW1lOiAndHhJZCcsXG4gICAgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICd0eElkJyAgIFxuICB9KVxuICBtYXRjaGVkVHghOiBUcmFuc2FjdGlvbkluZm8gfCBudWxsO1xuICAvLyBAT25lVG9PbmUoXG4gIC8vICAgKCkgPT4gVHJhbnNhY3Rpb25JbmZvLFxuICAvLyAgICh0cmFuc2FjdGlvbjogVHJhbnNhY3Rpb25JbmZvKSA9PiB0cmFuc2FjdGlvbi5tYXRjaGVkT3JkZXIyLFxuICAvLyApXG4gIC8vIEBKb2luQ29sdW1uKHtcbiAgLy8gICBuYW1lOiAndHhJZDInLFxuICAvLyAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAndHhJZCcgICBcbiAgLy8gfSlcbiAgLy8gbWF0Y2hlZFR4MiE6IFRyYW5zYWN0aW9uSW5mbyB8IG51bGw7XG59XG4iLCJpbXBvcnQge1xuICBDb2x1bW4sXG4gIEVudGl0eSxcbiAgSm9pbkNvbHVtbixcbiAgTWFueVRvT25lLFxuICBPbmVUb09uZSxcbiAgUHJpbWFyeUNvbHVtbixcbn0gZnJvbSAndHlwZW9ybSc7XG5pbXBvcnQgeyBNYXRjaE9ic09yZGVyRW50aXR5IH0gZnJvbSAnLi4vYXVjdGlvbk9yZGVyL21hdGNoT2JzT3JkZXIuZW50aXR5JztcbmltcG9ydCB7IEJhc2VUaW1lRW50aXR5IH0gZnJvbSAnLi4vY29tbW9uL2Jhc2VUaW1lRW50aXR5JztcbmltcG9ydCB7IEFjY291bnRJbmZvcm1hdGlvbiB9IGZyb20gJy4vYWNjb3VudEluZm9ybWF0aW9uLmVudGl0eSc7XG5pbXBvcnQgeyBCbG9ja0luZm9ybWF0aW9uIH0gZnJvbSAnLi9ibG9ja0luZm9ybWF0aW9uLmVudGl0eSc7XG5pbXBvcnQgeyBUU19TVEFUVVMgfSBmcm9tICcuL3RzU3RhdHVzLmVudW0nO1xuaW1wb3J0IHsgVHNUb2tlbkFkZHJlc3MgfSBmcm9tICcuLi8uLi8uLi8uLi90cy1zZGsvc3JjL2RvbWFpbi9saWIvdHMtdHlwZXMvdHMtdHlwZXMnO1xuXG5ARW50aXR5KCdUcmFuc2FjdGlvbkluZm8nLCB7IHNjaGVtYTogJ3B1YmxpYycgfSlcbmV4cG9ydCBjbGFzcyBUcmFuc2FjdGlvbkluZm8gZXh0ZW5kcyBCYXNlVGltZUVudGl0eSB7XG4gIEBQcmltYXJ5Q29sdW1uKHtcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgbmFtZTogJ3R4SWQnLFxuICAgIHByaW1hcnk6IHRydWUsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGdlbmVyYXRlZDogJ2luY3JlbWVudCcsXG4gIH0pXG4gIHR4SWQhOiBudW1iZXI7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBuYW1lOiAnYmxvY2tOdW1iZXInLFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICAgIGRlZmF1bHQ6IDAsXG4gIH0pXG4gIGJsb2NrTnVtYmVyITogbnVtYmVyIHwgbnVsbDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIG5hbWU6ICdyZXFUeXBlJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMCxcbiAgfSlcbiAgcmVxVHlwZSE6IG51bWJlcjtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdhY2NvdW50SWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBhY2NvdW50SWQhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAndG9rZW5JZCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIHRva2VuSWQhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYWNjdW11bGF0ZWRTZWxsQW10JyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgYWNjdW11bGF0ZWRTZWxsQW10ITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2FjY3VtdWxhdGVkQnV5QW10JyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgYWNjdW11bGF0ZWRCdXlBbXQhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYW1vdW50JyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgYW1vdW50ITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ25vbmNlJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgbm9uY2UhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdqc29uJyxcbiAgICBuYW1lOiAnZWRkc2FTaWcnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAoKSA9PiBKU09OLnN0cmluZ2lmeSh7IFI4OiBbJzAnLCAnMCddLCBTOiAnMCcgfSksXG4gIH0pXG4gIGVkZHNhU2lnIToge1xuICAgIFI4OiBbc3RyaW5nLCBzdHJpbmddO1xuICAgIFM6IHN0cmluZztcbiAgfTtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdlY2RzYVNpZycsXG4gICAgbGVuZ3RoOiAnNjYnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAnXFwnXFwnJyxcbiAgfSlcbiAgZWNkc2FTaWchOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYXJnMCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGFyZzAhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYXJnMScsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGFyZzEhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYXJnMicsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGFyZzIhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYXJnMycsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGFyZzMhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYXJnNCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGFyZzQhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAndHNQdWJLZXlYJyxcbiAgICBsZW5ndGg6ICcxMDAnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAnXFwnMFxcJycsXG4gIH0pXG4gIHRzUHViS2V5WCE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICd0c1B1YktleVknLFxuICAgIGxlbmd0aDogJzEwMCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6ICdcXCcwXFwnJyxcbiAgfSlcbiAgdHNQdWJLZXlZITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2ZlZScsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGZlZSE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdmZWVUb2tlbicsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGZlZVRva2VuITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnanNvbicsXG4gICAgbmFtZTogJ21ldGFkYXRhJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogKCkgPT4gJ1xcJ3t9XFwnJyxcbiAgfSlcbiAgbWV0YWRhdGEhOiBvYmplY3QgfCBudWxsO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZW51bScsXG4gICAgbmFtZTogJ3R4U3RhdHVzJyxcbiAgICBlbnVtOiBbXG4gICAgICBUU19TVEFUVVMuUEVORElORyxcbiAgICAgIFRTX1NUQVRVUy5QUk9DRVNTSU5HLFxuICAgICAgVFNfU1RBVFVTLkwyRVhFQ1VURUQsXG4gICAgICBUU19TVEFUVVMuTDJDT05GSVJNRUQsXG4gICAgICBUU19TVEFUVVMuTDFDT05GSVJNRUQsXG4gICAgICBUU19TVEFUVVMuRkFJTEVELFxuICAgICAgVFNfU1RBVFVTLlJFSkVDVEVELFxuICAgIF0sXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IGAnJHtUU19TVEFUVVMuUEVORElOR30nYCxcbiAgfSlcbiAgdHhTdGF0dXMhOiBUU19TVEFUVVM7XG4gIEBNYW55VG9PbmUoXG4gICAgKCkgPT4gQWNjb3VudEluZm9ybWF0aW9uLFxuICAgIChhY2NvdW50SW5mb3JtYXRpb246IEFjY291bnRJbmZvcm1hdGlvbikgPT5cbiAgICAgIGFjY291bnRJbmZvcm1hdGlvbi50cmFuc2FjdGlvbkluZm9zLFxuICAgIHtcbiAgICAgIG9uRGVsZXRlOiAnUkVTVFJJQ1QnLFxuICAgICAgb25VcGRhdGU6ICdDQVNDQURFJyxcbiAgICB9LFxuICApXG4gIEBKb2luQ29sdW1uKHtcbiAgICBuYW1lOiAnYWNjb3VudElkJyxcbiAgICByZWZlcmVuY2VkQ29sdW1uTmFtZTogJ2FjY291bnRJZCcsXG4gIH0pXG4gIEwyQWNjb3VudEluZm8hOiBBY2NvdW50SW5mb3JtYXRpb247XG4gIEBNYW55VG9PbmUoXG4gICAgKCkgPT4gQmxvY2tJbmZvcm1hdGlvbixcbiAgICAoYmxvY2tJbmZvcm1hdGlvbjogQmxvY2tJbmZvcm1hdGlvbikgPT4gYmxvY2tJbmZvcm1hdGlvbi50cmFuc2FjdGlvbkluZm9zLFxuICAgIHtcbiAgICAgIG9uRGVsZXRlOiAnUkVTVFJJQ1QnLFxuICAgICAgb25VcGRhdGU6ICdDQVNDQURFJyxcbiAgICB9LFxuICApXG4gIEBKb2luQ29sdW1uKHtcbiAgICBuYW1lOiAnYmxvY2tOdW1iZXInLFxuICAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAnYmxvY2tOdW1iZXInLFxuICB9KVxuICBibG9ja0luZm8hOiBCbG9ja0luZm9ybWF0aW9uO1xuICBAT25lVG9PbmUoXG4gICAgKCkgPT4gTWF0Y2hPYnNPcmRlckVudGl0eSxcbiAgICAobWF0Y2hlZE9ic09yZGVyOiBNYXRjaE9ic09yZGVyRW50aXR5KSA9PiBtYXRjaGVkT2JzT3JkZXIubWF0Y2hlZFR4LFxuICApXG4gIEBKb2luQ29sdW1uKHtcbiAgICBuYW1lOiAndHhJZCcsXG4gICAgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICd0eElkJyxcbiAgfSlcbiAgbWF0Y2hlZE9yZGVyITogTWF0Y2hPYnNPcmRlckVudGl0eSB8IG51bGw7XG4gIGdldCB0b2tlbkFkZHIoKTogVHNUb2tlbkFkZHJlc3Mge1xuICAgIHJldHVybiB0aGlzLnRva2VuSWQudG9TdHJpbmcoKSBhcyBUc1Rva2VuQWRkcmVzcztcbiAgfVxuICAvLyBAT25lVG9PbmUoKCkgPT4gTWF0Y2hPYnNPcmRlckVudGl0eSwgKG1hdGNoZWRPYnNPcmRlcjogTWF0Y2hPYnNPcmRlckVudGl0eSkgPT4gbWF0Y2hlZE9ic09yZGVyLm1hdGNoZWRUeDIpXG4gIC8vIEBKb2luQ29sdW1uKHtcbiAgLy8gICBuYW1lOiAndHhJZCcsXG4gIC8vICAgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICd0eElkMicsXG4gIC8vIH0pXG4gIC8vIG1hdGNoZWRPcmRlcjIhOiBNYXRjaE9ic09yZGVyRW50aXR5IHwgbnVsbDtcbn1cbiIsImltcG9ydCB7IENvbHVtbiwgQ3JlYXRlRGF0ZUNvbHVtbiwgRGVsZXRlRGF0ZUNvbHVtbiwgVXBkYXRlRGF0ZUNvbHVtbiB9IGZyb20gJ3R5cGVvcm0nO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQmFzZVRpbWVFbnRpdHkge1xuICBAQ3JlYXRlRGF0ZUNvbHVtbih7XG4gICAgdHlwZTogJ3RpbWVzdGFtcCB3aXRob3V0IHRpbWUgem9uZScsXG4gICAgbmFtZTogJ2NyZWF0ZWRBdCcsXG4gICAgZGVmYXVsdDogKCkgPT4gJ25vdygpJyxcbiAgfSlcbiAgY3JlYXRlZEF0ITogRGF0ZTtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdjcmVhdGVkQnknLFxuICAgIGxlbmd0aDogMzAwLFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICB9KVxuICBjcmVhdGVkQnkhOiBzdHJpbmcgfCBudWxsO1xuICBAVXBkYXRlRGF0ZUNvbHVtbih7XG4gICAgdHlwZTogJ3RpbWVzdGFtcCB3aXRob3V0IHRpbWUgem9uZScsXG4gICAgbmFtZTogJ3VwZGF0ZWRBdCcsXG4gICAgZGVmYXVsdDogKCkgPT4gJ25vdygpJyxcbiAgfSlcbiAgdXBkYXRlZEF0ITogRGF0ZTtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICd1cGRhdGVkQnknLCAgXG4gICAgbGVuZ3RoOiAzMDAsICBcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgfSlcbiAgdXBkYXRlZEJ5ITogc3RyaW5nIHwgbnVsbDsgXG4gIEBEZWxldGVEYXRlQ29sdW1uKHtcbiAgICB0eXBlOiAndGltZXN0YW1wIHdpdGhvdXQgdGltZSB6b25lJyxcbiAgICBuYW1lOiAnZGVsZXRlZEF0JyxcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgfSlcbiAgZGVsZXRlZEF0ITogRGF0ZSB8IG51bGw7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJywgXG4gICAgbmFtZTogJ2RlbGV0ZWRCeScsXG4gICAgbGVuZ3RoOiAzMDAsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gIH0pXG4gIGRlbGV0ZWRCeSE6IHN0cmluZyB8IG51bGw7XG59IiwiaW1wb3J0IHsgQ29sdW1uLCBFbnRpdHksIEpvaW5Db2x1bW4sIE9uZVRvTWFueSwgUHJpbWFyeUdlbmVyYXRlZENvbHVtbiB9IGZyb20gJ3R5cGVvcm0nO1xuaW1wb3J0IHsgQmFzZVRpbWVFbnRpdHkgfSBmcm9tICcuLi9jb21tb24vYmFzZVRpbWVFbnRpdHknO1xuaW1wb3J0IHsgQkxPQ0tfU1RBVFVTIH0gZnJvbSAnLi9ibG9ja1N0YXR1cy5lbnVtJztcbmltcG9ydCB7IFRyYW5zYWN0aW9uSW5mbyB9IGZyb20gJy4vdHJhbnNhY3Rpb25JbmZvLmVudGl0eSc7XG5cbkBFbnRpdHkoJ0Jsb2NrSW5mb3JtYXRpb24nLCB7IHNjaGVtYTogJ3B1YmxpYycgfSlcbmV4cG9ydCBjbGFzcyBCbG9ja0luZm9ybWF0aW9uIGV4dGVuZHMgQmFzZVRpbWVFbnRpdHkge1xuICBAUHJpbWFyeUdlbmVyYXRlZENvbHVtbih7XG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIG5hbWU6ICdibG9ja051bWJlcidcbiAgfSlcbiAgYmxvY2tOdW1iZXIhOiBudW1iZXI7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAnYmxvY2tIYXNoJyxcbiAgICBsZW5ndGg6IDI1NixcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgfSlcbiAgYmxvY2tIYXNoITogc3RyaW5nIHwgbnVsbDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdMMVRyYW5zYWN0aW9uSGFzaCcsXG4gICAgbGVuZ3RoOiA1MTIsXG4gIH0pXG4gIEwxVHJhbnNhY3Rpb25IYXNoITogc3RyaW5nO1xuICBAQ29sdW1uKHsgXG4gICAgdHlwZTogJ3RpbWVzdGFtcCB3aXRob3V0IHRpbWUgem9uZScsXG4gICAgbmFtZTogJ3ZlcmlmaWVkQXQnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgfSlcbiAgdmVyaWZpZWRBdCE6IERhdGU7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJywgIFxuICAgIG5hbWU6ICdvcGVyYXRvckFkZHJlc3MnLFxuICAgIGxlbmd0aDogMjU2LFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgfSlcbiAgb3BlcmF0b3JBZGRyZXNzITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndGV4dCcsXG4gICAgbmFtZTogJ3Jhd0RhdGEnLFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICB9KVxuICByYXdEYXRhITogc3RyaW5nIHwgbnVsbDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2pzb24nLFxuICAgIG5hbWU6ICdjYWxsRGF0YScsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gICAgZGVmYXVsdDogKCkgPT4gJ1xcJ3t9XFwnJyxcbiAgfSlcbiAgY2FsbERhdGEhOiBvYmplY3QgfCAne30nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnanNvbicsXG4gICAgbmFtZTogJ3Byb29mJyxcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgICBkZWZhdWx0OiAoKSA9PiAnXFwne31cXCcnLFxuICB9KVxuICBwcm9vZiE6IG9iamVjdCB8ICd7fSc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdlbnVtJyxcbiAgICBuYW1lOiAnYmxvY2tTdGF0dXMnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBlbnVtTmFtZTogJ0JMT0NLX1NUQVRVUycsXG4gICAgZW51bTogW1xuICAgICAgQkxPQ0tfU1RBVFVTLlBST0NFU1NJTkcsXG4gICAgICBCTE9DS19TVEFUVVMuTDJFWEVDVVRFRCxcbiAgICAgIEJMT0NLX1NUQVRVUy5MMkNPTkZJUk1FRCxcbiAgICAgIEJMT0NLX1NUQVRVUy5MMUNPTkZJUk1FRFxuICAgIF0sXG4gICAgZGVmYXVsdDogYCcke0JMT0NLX1NUQVRVUy5QUk9DRVNTSU5HfSdgLFxuICB9KVxuICBibG9ja1N0YXR1cyE6IEJMT0NLX1NUQVRVUztcbiAgQE9uZVRvTWFueShcbiAgICAoKSA9PiBUcmFuc2FjdGlvbkluZm8sXG4gICAgdHJhbnNhY3Rpb25JbmZvID0+IHRyYW5zYWN0aW9uSW5mby5ibG9ja0luZm8sXG4gIClcbiAgQEpvaW5Db2x1bW4oe1xuICAgIG5hbWU6ICdibG9ja051bWJlcicsXG4gICAgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICdibG9ja051bWJlcidcbiAgfSlcbiAgdHJhbnNhY3Rpb25JbmZvcyE6IFRyYW5zYWN0aW9uSW5mb1tdIHwgbnVsbDtcbn0iLCJleHBvcnQgZW51bSBCTE9DS19TVEFUVVMge1xuICBQUk9DRVNTSU5HPSdQUk9DRVNTSU5HJyxcbiAgTDJFWEVDVVRFRD0nTDJFWEVDVVRFRCcsXG4gIEwyQ09ORklSTUVEPSdMMkNPTkZJUk1FRCcsXG4gIEwxQ09ORklSTUVEPSdMMUNPTkZJUk1FRCcsXG59IiwiZXhwb3J0IGVudW0gVFNfU1RBVFVTIHtcbiAgUEVORElORz0nUEVORElORycsXG4gIFBST0NFU1NJTkc9J1BST0NFU1NJTkcnLFxuICBMMkVYRUNVVEVEPSdMMkVYRUNVVEVEJyxcbiAgTDJDT05GSVJNRUQ9J0wyQ09ORklSTUVEJyxcbiAgTDFDT05GSVJNRUQ9J0wxQ09ORklSTUVEJyxcbiAgRkFJTEVEPSdGQUlMRUQnLFxuICBSRUpFQ1RFRD0nUkVKRUNURUQnXG59XG4iLCJleHBvcnQgZW51bSBUc1NpZGUge1xuICBCVVkgPSAnMCcsXG4gIFNFTEwgPSAnMScsXG59IiwiaW1wb3J0IHsgQnl0ZXNMaWtlIH0gZnJvbSAnZXRoZXJzJztcbmltcG9ydCB7IGRwUG9zZWlkb25IYXNoIH0gZnJvbSAnLi9wb3NlaWRlbi1oYXNoLWRwJztcblxuZXhwb3J0IGZ1bmN0aW9uIGJpZ2ludF90b19oZXgoeDogYmlnaW50KSB7XG4gIHJldHVybiAnMHgnICsgeC50b1N0cmluZygxNik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b1RyZWVMZWFmKGlucHV0czogYmlnaW50W10pIHtcbiAgcmV0dXJuIGJpZ2ludF90b19oZXgoZHBQb3NlaWRvbkhhc2goaW5wdXRzKSk7XG59XG5cbmZ1bmN0aW9uIHBvc2VpZG9uSGFzaCh2YWwgOiBCeXRlc0xpa2UgfCBCeXRlc0xpa2VbXSk6IHN0cmluZyB7XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIGNvbnN0IGlucHV0cyA9IHZhbC5tYXAoKHYgOiBhbnkpID0+IEJpZ0ludCh2KSk7XG4gICAgcmV0dXJuIGJpZ2ludF90b19oZXgoZHBQb3NlaWRvbkhhc2goaW5wdXRzKSk7XG4gIH1cblxuICByZXR1cm4gIGJpZ2ludF90b19oZXgoZHBQb3NlaWRvbkhhc2goW0JpZ0ludCh2YWwudG9TdHJpbmcoKSldKSk7XG59XG5cbmV4cG9ydCBjb25zdCB0c0hhc2hGdW5jID0gcG9zZWlkb25IYXNoO1xuIiwiaW1wb3J0IHtwb3NlaWRvbn0gZnJvbSAnQGJpZy13aGFsZS1sYWJzL3Bvc2VpZG9uJztcblxuY2xhc3MgZHBQb3NlaWRvbkNhY2hlIHtcbiAgc3RhdGljIGNhY2hlID0gbmV3IE1hcCgpO1xuXG4gIHN0YXRpYyBnZXRDYWNoZSh4IDogYmlnaW50IHwgc3RyaW5nIHwgYmlnaW50W10pOiBudWxsIHwgYmlnaW50IHtcbiAgICBpZiAoeCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBjb25zdCBrZXkgPSB4LmpvaW4oKTtcbiAgICAgIHJldHVybiBkcFBvc2VpZG9uQ2FjaGUuZ2V0Q2FjaGUoa2V5KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZHBQb3NlaWRvbkNhY2hlXG4gICAgICAuY2FjaGVcbiAgICAgIC5nZXQoeCk7XG4gIH1cblxuICBzdGF0aWMgc2V0Q2FjaGUoeCA6IGJpZ2ludCB8IHN0cmluZyB8IGJpZ2ludFtdLCB2IDogYmlnaW50KSB7XG4gICAgaWYgKHggaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgY29uc3Qga2V5ID0geC5qb2luKCk7XG4gICAgICBkcFBvc2VpZG9uQ2FjaGUuc2V0Q2FjaGUoa2V5LCB2KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBkcFBvc2VpZG9uQ2FjaGVcbiAgICAgIC5jYWNoZVxuICAgICAgLnNldCh4LCB2KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZHBQb3NlaWRvbkhhc2goaW5wdXRzIDogYmlnaW50W10sIGlzRHBFbmFibGVkID0gdHJ1ZSk6IGJpZ2ludCB7XG4gIGlmIChpc0RwRW5hYmxlZCkge1xuICAgIGNvbnN0IGNhY2hlID0gZHBQb3NlaWRvbkNhY2hlLmdldENhY2hlKGlucHV0cyk7XG4gICAgaWYgKGNhY2hlKSB7XG4gICAgICByZXR1cm4gY2FjaGU7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgcmVzID0gcG9zZWlkb24oaW5wdXRzKTtcbiAgaWYgKGlzRHBFbmFibGVkKSB7XG4gICAgZHBQb3NlaWRvbkNhY2hlLnNldENhY2hlKGlucHV0cywgcmVzKTtcbiAgfVxuICByZXR1cm4gcmVzO1xufSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIkBiaWctd2hhbGUtbGFicy9wb3NlaWRvblwiKTs7IiwiZXhwb3J0IGVudW0gUm9sZSB7XG4gIEFETUlOID0gJ0FETUlOJyxcbiAgTUVNQkVSID0gJ01FTUJFUicsXG4gIE9QRVJBVE9SID0gJ09QRVJBVE9SJ1xufSIsImltcG9ydCB7IEFjY291bnRMZWFmRW5jb2RlVHlwZSB9IGZyb20gJ0B0cy1zZGsvZG9tYWluL2xpYi90cy10eXBlcy90cy10eXBlcyc7XG5pbXBvcnQgeyBDb2x1bW4sIENyZWF0ZURhdGVDb2x1bW4sIERlbGV0ZURhdGVDb2x1bW4sIEVudGl0eSwgSm9pbkNvbHVtbiwgT25lVG9PbmUsIFByaW1hcnlDb2x1bW4sIFVwZGF0ZURhdGVDb2x1bW4gfSBmcm9tICd0eXBlb3JtJztcbmltcG9ydCB7IHRvVHJlZUxlYWYgfSBmcm9tICcuLi9jb21tb24vdHMtaGVscGVyJztcbmltcG9ydCB7IEFjY291bnRNZXJrbGVUcmVlTm9kZSB9IGZyb20gJy4vYWNjb3VudE1lcmtsZVRyZWVOb2RlLmVudGl0eSc7XG5cbkBFbnRpdHkoJ0FjY291bnRMZWFmTm9kZScsIHsgc2NoZW1hOiAncHVibGljJ30pXG5leHBvcnQgY2xhc3MgQWNjb3VudExlYWZOb2RlIHtcbiAgQFByaW1hcnlDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnbGVhZklkJyxcbiAgICBwcmltYXJ5OiB0cnVlLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDBcbiAgfSlcbiAgbGVhZklkITogc3RyaW5nOyBcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICd0c0FkZHInLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICB0c0FkZHIhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnbm9uY2UnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuXG4gIH0pXG4gIG5vbmNlITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ3Rva2VuUm9vdCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG5cbiAgfSlcbiAgdG9rZW5Sb290ITogc3RyaW5nO1xuICAvLyByZWxhdGlvbnNcbiAgQE9uZVRvT25lKFxuICAgICgpID0+IEFjY291bnRNZXJrbGVUcmVlTm9kZSxcbiAgICAoYWNjb3VudE1lcmtsZVRyZWVOb2RlOkFjY291bnRNZXJrbGVUcmVlTm9kZSkgPT4gYWNjb3VudE1lcmtsZVRyZWVOb2RlLmFjY291bnRMZWFmTm9kZSwgXG4gICAgeyBvbkRlbGV0ZTogJ1JFU1RSSUNUJywgb25VcGRhdGU6ICdDQVNDQURFJyB9XG4gIClcbiAgQEpvaW5Db2x1bW4oe1xuICAgIG5hbWU6ICdsZWFmSWQnLFxuICAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAnbGVhZklkJ1xuICB9KVxuICBhY2NvdW50TWVya2xlVHJlZU5vZGUhOiBBY2NvdW50TWVya2xlVHJlZU5vZGU7XG5cblxuICBlbmNvZGUoKTogQWNjb3VudExlYWZFbmNvZGVUeXBlIHtcbiAgICByZXR1cm4gW1xuICAgICAgQmlnSW50KHRoaXMudHNBZGRyKSwgQmlnSW50KHRoaXMubm9uY2UpLCBCaWdJbnQodGhpcy50b2tlblJvb3QpXG4gICAgXTtcbiAgfVxuXG4gIGVuY29kZUhhc2goKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdG9UcmVlTGVhZih0aGlzLmVuY29kZSgpKTtcbiAgfVxufSIsImltcG9ydCB7IENvbHVtbiwgRW50aXR5LCBKb2luQ29sdW1uLCBPbmVUb01hbnksIE9uZVRvT25lLCBQcmltYXJ5Q29sdW1uIH0gZnJvbSAndHlwZW9ybSc7XG5pbXBvcnQgeyBBY2NvdW50SW5mb3JtYXRpb24gfSBmcm9tICcuL2FjY291bnRJbmZvcm1hdGlvbi5lbnRpdHknO1xuaW1wb3J0IHsgQWNjb3VudExlYWZOb2RlIH0gZnJvbSAnLi9hY2NvdW50TGVhZk5vZGUuZW50aXR5JztcbmltcG9ydCB7IFRva2VuTWVya2xlVHJlZU5vZGUgfSBmcm9tICcuL3Rva2VuTWVya2xlVHJlZU5vZGUuZW50aXR5JztcblxuQEVudGl0eSgnQWNjb3VudE1lcmtsZVRyZWVOb2RlJywgeyBzY2hlbWE6ICdwdWJsaWMnfSlcbmV4cG9ydCBjbGFzcyBBY2NvdW50TWVya2xlVHJlZU5vZGUge1xuICBAUHJpbWFyeUNvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdpZCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBwcmltYXJ5OiB0cnVlLFxuICB9KVxuICBpZCE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdoYXNoJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgfSlcbiAgaGFzaCE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdsZWFmSWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gIH0pXG4gIGxlYWZJZCE6IHN0cmluZ3xudWxsO1xuICAvLyBAT25lVG9PbmUoXG4gIC8vICAgKCkgPT4gQWNjb3VudEluZm9ybWF0aW9uLCAvLyBtYXBUeXBlXG4gIC8vICAgKGFjY291bnRJbmZvcm1hdGlvbjogQWNjb3VudEluZm9ybWF0aW9uKSA9PiBhY2NvdW50SW5mb3JtYXRpb24uYWNjb3VudE1lcmtsZVRyZWVOb2RlICwgLy8gbWFwIGF0dHJpYnV0ZVxuICAvLyAgIHsgb25EZWxldGU6ICdSRVNUUklDVCcsIG9uVXBkYXRlOiAnQ0FTQ0FERScgfSBcbiAgLy8gKVxuICAvLyBASm9pbkNvbHVtbihbeyBuYW1lOiAnbGVhZklkJywgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICdhY2NvdW50SWQnIH1dKVxuICAvLyBsZWFmITogQWNjb3VudEluZm9ybWF0aW9uO1xuICAvLyBAT25lVG9NYW55KFxuICAvLyAgICgpID0+IFRva2VuTWVya2xlVHJlZU5vZGUsXG4gIC8vICAgKHRva2VuTWVya2xlVHJlZU5vZGU6IFRva2VuTWVya2xlVHJlZU5vZGUpID0+IHRva2VuTWVya2xlVHJlZU5vZGUuYWNjb3VudFJvb3RcbiAgLy8gKVxuICAvLyB0b2tlbk1lcmtsZVRyZWVOb2RlcyE6IFRva2VuTWVya2xlVHJlZU5vZGVbXTtcbiAgQE9uZVRvT25lKFxuICAgICgpID0+ICBBY2NvdW50TGVhZk5vZGUsXG4gICAgKGFjY291bnRMZWFmTm9kZTogQWNjb3VudExlYWZOb2RlKSA9PiBhY2NvdW50TGVhZk5vZGUuYWNjb3VudE1lcmtsZVRyZWVOb2RlXG4gIClcbiAgYWNjb3VudExlYWZOb2RlITogQWNjb3VudExlYWZOb2RlO1xufSIsImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBUc0FjY291bnRUcmVlU2VydmljZSB9IGZyb20gJy4vdHNBY2NvdW50VHJlZS5zZXJ2aWNlJztcbmltcG9ydCB7IFRzVG9rZW5UcmVlU2VydmljZSB9IGZyb20gJy4vdHNUb2tlblRyZWUuc2VydmljZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBPYnNNZXJrbGVUcmVlU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgb2JzVG9rZW5UcmVlU2VydmljZTogVHNUb2tlblRyZWVTZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgb2JzQWNjb3VudFRyZWVTZXJ2aWNlOiBUc0FjY291bnRUcmVlU2VydmljZSxcbiAgKSB7fVxuICAvLyB1cGRhdGUgU3RhdGUgTWVya2xlIHRyZWVcbiAgYXN5bmMgdXBkYXRlU3RhdGVUcmVlKGFjY291bnRJZDogc3RyaW5nLCB0b2tlbklkOiBzdHJpbmcsIGxvY2tlZEFtdDogYmlnaW50LCBhdmFpbGFibGVBbXQ6IGJpZ2ludCkgXG4gIHtcbiAgICAvLyBmaXJzdCB1cGRhdGUgdG9rZW4gdHJlZVxuICAgIGF3YWl0IHRoaXMub2JzVG9rZW5UcmVlU2VydmljZS51cGRhdGVMZWFmKHRva2VuSWQsIHtcbiAgICAgIGxlYWZJZDogdG9rZW5JZC50b1N0cmluZygpLFxuICAgICAgYWNjb3VudElkOiBhY2NvdW50SWQudG9TdHJpbmcoKSxcbiAgICAgIGxvY2tlZEFtdDogbG9ja2VkQW10LnRvU3RyaW5nKCksXG4gICAgICBhdmFpbGFibGVBbXQ6IGF2YWlsYWJsZUFtdC50b1N0cmluZygpXG4gICAgfSk7XG4gICAgLy8gZ2V0IHRva2VuUm9vdCBoYXNoIGFzIEFjY291bnRMZWFmTm9kZS5oYXNoXG4gICAgY29uc3QgW3Rva2VuUm9vdCwgYWNjb3VudExlYWZdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy5vYnNUb2tlblRyZWVTZXJ2aWNlLmdldFJvb3QoYWNjb3VudElkLnRvU3RyaW5nKCkpLCBcbiAgICAgIHRoaXMub2JzQWNjb3VudFRyZWVTZXJ2aWNlLmdldExlYWYoYWNjb3VudElkKVxuICAgIF0pO1xuICAgIC8vIHVwZGF0ZSBhY2NvdW50IHRyZWVcbiAgICBhd2FpdCB0aGlzLm9ic0FjY291bnRUcmVlU2VydmljZS51cGRhdGVMZWFmKGFjY291bnRJZCwge1xuICAgICAgbGVhZklkOiBhY2NvdW50SWQudG9TdHJpbmcoKSxcbiAgICAgIHRva2VuUm9vdDogdG9rZW5Sb290Lmhhc2gudG9TdHJpbmcoKSxcbiAgICAgIG5vbmNlOiBhY2NvdW50TGVhZi5ub25jZS50b1N0cmluZygpLFxuICAgICAgdHNBZGRyOiBhY2NvdW50TGVhZi50c0FkZHIudG9TdHJpbmcoKVxuICAgIH0pO1xuICB9XG59IiwiaW1wb3J0IHsgSW5qZWN0YWJsZSwgTG9nZ2VyIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgSW5qZWN0UmVwb3NpdG9yeSB9IGZyb20gJ0BuZXN0anMvdHlwZW9ybSc7XG5pbXBvcnQgeyBFbnRpdHlNYW5hZ2VyLCBJbiB9IGZyb20gJ3R5cGVvcm0nO1xuaW1wb3J0IHsgQWNjb3VudE1lcmtsZVRyZWVOb2RlIH0gZnJvbSAnLi9hY2NvdW50TWVya2xlVHJlZU5vZGUuZW50aXR5JztcbmltcG9ydCB7IEFjY291bnRMZWFmTm9kZSB9IGZyb20gJy4vYWNjb3VudExlYWZOb2RlLmVudGl0eSc7XG5pbXBvcnQgeyBDb25uZWN0aW9uLCBSZXBvc2l0b3J5IH0gZnJvbSAndHlwZW9ybSc7XG5pbXBvcnQgeyB0b1RyZWVMZWFmLCB0c0hhc2hGdW5jIH0gZnJvbSAnLi4vY29tbW9uL3RzLWhlbHBlcic7XG5pbXBvcnQgeyBUc01lcmtsZVRyZWUgfSBmcm9tICcuLi9jb21tb24vdHNNZXJrbGVUcmVlJztcbmltcG9ydCB7IFVwZGF0ZUFjY291bnRUcmVlRHRvIH0gZnJvbSAnLi9kdG8vdXBkYXRlQWNjb3VudFRyZWUuZHRvJztcbmltcG9ydCB7IENvbmZpZ1NlcnZpY2UgfSBmcm9tICdAbmVzdGpzL2NvbmZpZyc7XG5pbXBvcnQgeyBnZXREZWZhdWx0QWNjb3VudExlYWZ9IGZyb20gJy4vaGVscGVyL21rQWNjb3VudC5oZWxwZXInO1xuaW1wb3J0IHsgVHNUb2tlblRyZWVTZXJ2aWNlIH0gZnJvbSAnLi90c1Rva2VuVHJlZS5zZXJ2aWNlJztcbmltcG9ydCB7IFVwZGF0ZVRva2VuVHJlZUR0byB9IGZyb20gJy4vZHRvL3VwZGF0ZVRva2VuVHJlZS5kdG8nO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVHNBY2NvdW50VHJlZVNlcnZpY2UgZXh0ZW5kcyBUc01lcmtsZVRyZWU8QWNjb3VudExlYWZOb2RlPntcbiAgcHJpdmF0ZSBsb2dnZXI6IExvZ2dlciA9IG5ldyBMb2dnZXIoVHNBY2NvdW50VHJlZVNlcnZpY2UubmFtZSk7XG4gIHByaXZhdGUgVE9LRU5TX1RSRUVfSEVJR0hUOiBudW1iZXI7XG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3RSZXBvc2l0b3J5KEFjY291bnRMZWFmTm9kZSlcbiAgICBwcml2YXRlIGFjY291bnRMZWFmTm9kZVJlcG9zaXRvcnk6IFJlcG9zaXRvcnk8QWNjb3VudExlYWZOb2RlPixcbiAgICBASW5qZWN0UmVwb3NpdG9yeShBY2NvdW50TWVya2xlVHJlZU5vZGUpXG4gICAgcHJpdmF0ZSBhY2NvdW50TWVya2xlVHJlZVJlcG9zaXRvcnk6IFJlcG9zaXRvcnk8QWNjb3VudE1lcmtsZVRyZWVOb2RlPixcbiAgICBwcml2YXRlIGNvbm5lY3Rpb246IENvbm5lY3Rpb24sXG4gICAgcHJpdmF0ZSByZWFkb25seSB0b2tlblRyZWVTZXJ2aWNlOiBUc1Rva2VuVHJlZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSBjb25maWdTZXJ2aWNlOiBDb25maWdTZXJ2aWNlLFxuICApIHtcbiAgICBjb25zb2xlLnRpbWUoJ2NyZWF0ZSBBY2NvdW50IFRyZWUnKTtcbiAgICBzdXBlcihjb25maWdTZXJ2aWNlLmdldE9yVGhyb3c8bnVtYmVyPignQUNDT1VOVFNfVFJFRV9IRUlHSFQnKSwgdHNIYXNoRnVuYyk7XG4gICAgY29uc29sZS50aW1lRW5kKCdjcmVhdGUgQWNjb3VudCBUcmVlJyk7XG4gICAgdGhpcy5UT0tFTlNfVFJFRV9IRUlHSFQgPSBjb25maWdTZXJ2aWNlLmdldE9yVGhyb3c8bnVtYmVyPignVE9LRU5TX1RSRUVfSEVJR0hUJyk7XG4gICAgdGhpcy5zZXRMZXZlbERlZmF1bHRIYXNoKCk7XG4gIH1cbiAgYXN5bmMgZ2V0Q3VycmVudExlYWZJZENvdW50KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgY29uc3QgbGVhZklkQ291bnQgPSBhd2FpdCB0aGlzLmFjY291bnRMZWFmTm9kZVJlcG9zaXRvcnkuY291bnQoKTtcbiAgICByZXR1cm4gbGVhZklkQ291bnQ7XG4gIH1cbiAgZ2V0RGVmYXVsdFRva2VuVHJlZVJvb3QoKSB7XG4gICAgcmV0dXJuIEJpZ0ludCh0aGlzLnRva2VuVHJlZVNlcnZpY2UuZ2V0RGVmYXVsdFJvb3QoKSkudG9TdHJpbmcoKTtcbiAgfVxuICBnZXREZWZhdWx0Um9vdCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmdldERlZmF1bHRIYXNoQnlMZXZlbCgxKTtcbiAgfVxuICBnZXRMZWFmRGVmYXVsdFZhdmx1ZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBnZXREZWZhdWx0QWNjb3VudExlYWYodGhpcy5nZXREZWZhdWx0VG9rZW5UcmVlUm9vdCgpKTtcbiAgfVxuICAvLyBhc3luYyBfdXBkYXRlTGVhZigpXG4gIGFzeW5jIHVwZGF0ZUxlYWYobGVhZklkOiBzdHJpbmcsIHZhbHVlOiBVcGRhdGVBY2NvdW50VHJlZUR0bykge1xuICAgIGNvbnNvbGUudGltZSgndXBkYXRlTGVhZiBmb3IgYWNjb3VudCB0cmVlJyk7XG4gICAgLy8gc2V0dXAgdHJhbnNhY3Rpb25cbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24udHJhbnNhY3Rpb24oYXN5bmMgKG1hbmFnZXIpID0+IHtcbiAgICAgIGF3YWl0IHRoaXMuX3VwZGF0ZUxlYWYobWFuYWdlciwgbGVhZklkLCB2YWx1ZSk7XG4gICAgfSk7XG4gICAgLy8gfVxuICAgIGNvbnNvbGUudGltZUVuZCgndXBkYXRlTGVhZiBmb3IgYWNjb3VudCB0cmVlJyk7XG4gIH1cbiAgYXN5bmMgX3VwZGF0ZUxlYWYobWFuYWdlcjogRW50aXR5TWFuYWdlciwgbGVhZklkOiBzdHJpbmcsIHZhbHVlOiBVcGRhdGVBY2NvdW50VHJlZUR0bykge1xuICAgIGNvbnN0IHByZiA9IHRoaXMuZ2V0UHJvb2ZJZHMobGVhZklkKTtcbiAgICBjb25zdCBpZCA9IHRoaXMuZ2V0TGVhZklkSW5UcmVlKGxlYWZJZCk7XG4gICAgY29uc3Qgb3JpZ2luVmFsdWUgPSBhd2FpdCB0aGlzLmdldExlYWYobGVhZklkKTtcbiAgICBjb25zdCBuZXdWYWx1ZSA9IHtcbiAgICAgIHRzQWRkcjogdmFsdWUudHNBZGRyIHx8IG9yaWdpblZhbHVlLnRzQWRkcixcbiAgICAgIG5vbmNlOiB2YWx1ZS5ub25jZSB8fCBvcmlnaW5WYWx1ZS5ub25jZSxcbiAgICAgIHRva2VuUm9vdDogdmFsdWUudG9rZW5Sb290IHx8IG9yaWdpblZhbHVlLnRva2VuUm9vdCxcbiAgICB9O1xuICAgIGF3YWl0IG1hbmFnZXIudXBzZXJ0KEFjY291bnRNZXJrbGVUcmVlTm9kZSwge1xuICAgICAgaWQ6IGlkLnRvU3RyaW5nKCksXG4gICAgICBsZWFmSWQ6IGxlYWZJZCxcbiAgICAgIGhhc2g6IEJpZ0ludCh0b1RyZWVMZWFmKFtcbiAgICAgICAgQmlnSW50KG5ld1ZhbHVlLnRzQWRkciksXG4gICAgICAgIEJpZ0ludChuZXdWYWx1ZS5ub25jZSksXG4gICAgICAgIEJpZ0ludChuZXdWYWx1ZS50b2tlblJvb3QpXG4gICAgICBdKSkudG9TdHJpbmcoKVxuICAgIH0sIFsnaWQnXSk7XG4gICAgYXdhaXQgbWFuYWdlci51cHNlcnQoQWNjb3VudExlYWZOb2RlLCB7XG4gICAgICB0c0FkZHI6IChuZXdWYWx1ZS50c0FkZHIpLFxuICAgICAgbm9uY2U6IChuZXdWYWx1ZS5ub25jZSksXG4gICAgICB0b2tlblJvb3Q6IChuZXdWYWx1ZS50b2tlblJvb3QpLFxuICAgICAgbGVhZklkOiBsZWFmSWQudG9TdHJpbmcoKSxcbiAgICB9LCBbJ2xlYWZJZCddKTtcbiAgICAvLyB1cGRhdGUgdHJlZVxuICAgIGZvciAobGV0IGkgPSBpZCwgaiA9IDA7IGkgPiAxbjsgaSA9IGkgPj4gMW4pIHtcbiAgICAgIGNvbnN0IFtpVmFsdWUsIGpWYWx1ZV0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIHRoaXMuYWNjb3VudE1lcmtsZVRyZWVSZXBvc2l0b3J5LmZpbmRPbmVCeSh7IGlkOiBpLnRvU3RyaW5nKCkgfSksXG4gICAgICAgIHRoaXMuYWNjb3VudE1lcmtsZVRyZWVSZXBvc2l0b3J5LmZpbmRPbmVCeSh7IGlkOiBwcmZbal0udG9TdHJpbmcoKSB9KVxuICAgICAgXSk7XG4gICAgICBjb25zdCBqTGV2ZWwgPSBNYXRoLmZsb29yKE1hdGgubG9nMihOdW1iZXIocHJmW2pdKSkpO1xuICAgICAgY29uc3QgaUxldmVsID0gTWF0aC5mbG9vcihNYXRoLmxvZzIoTnVtYmVyKGkpKSk7XG4gICAgICBjb25zdCBqSGFzaFZhbHVlOiBzdHJpbmcgPSAoalZhbHVlID09IG51bGwpID8gdGhpcy5nZXREZWZhdWx0SGFzaEJ5TGV2ZWwoakxldmVsKSA6IGpWYWx1ZS5oYXNoLnRvU3RyaW5nKCk7XG4gICAgICBjb25zdCBpSGFzaFZhbHVlOiBzdHJpbmcgPSAoaVZhbHVlID09IG51bGwpID8gdGhpcy5nZXREZWZhdWx0SGFzaEJ5TGV2ZWwoaUxldmVsKSA6IGlWYWx1ZS5oYXNoLnRvU3RyaW5nKCk7XG4gICAgICBjb25zdCByID0gKGlkICUgMm4gPT0gMG4pID8gW2pIYXNoVmFsdWUsIGlIYXNoVmFsdWVdIDogW2lIYXNoVmFsdWUsIGpIYXNoVmFsdWVdO1xuICAgICAgY29uc3QgaGFzaERlY1N0cmluZyA9IEJpZ0ludCh0aGlzLmhhc2hGdW5jKHIpKS50b1N0cmluZygpO1xuICAgICAgY29uc3Qgam9icyA9IFtdO1xuICAgICAgaWYgKGlWYWx1ZSA9PSBudWxsKSB7XG4gICAgICAgIGpvYnMucHVzaChtYW5hZ2VyLnVwc2VydChBY2NvdW50TWVya2xlVHJlZU5vZGUsIHtcbiAgICAgICAgICBpZDogaS50b1N0cmluZygpLFxuICAgICAgICAgIGhhc2g6IChpSGFzaFZhbHVlKVxuICAgICAgICB9LCBbJ2lkJ10pKTtcbiAgICAgIH1cbiAgICAgIGlmIChqVmFsdWUgPT0gbnVsbCAmJiBqIDwgcHJmLmxlbmd0aCkge1xuICAgICAgICBqb2JzLnB1c2gobWFuYWdlci51cHNlcnQoQWNjb3VudE1lcmtsZVRyZWVOb2RlLCB7XG4gICAgICAgICAgaWQ6IHByZltqXS50b1N0cmluZygpLFxuICAgICAgICAgIGhhc2g6IChqSGFzaFZhbHVlKVxuICAgICAgICB9LCBbJ2lkJ10pKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHVwZGF0ZVJvb3QgPSBpID4+IDFuO1xuICAgICAgaWYgKHVwZGF0ZVJvb3QgPj0gMW4pIHtcbiAgICAgICAgam9icy5wdXNoKG1hbmFnZXIudXBzZXJ0KEFjY291bnRNZXJrbGVUcmVlTm9kZSwge1xuICAgICAgICAgIGlkOiB1cGRhdGVSb290LnRvU3RyaW5nKCksXG4gICAgICAgICAgaGFzaDogaGFzaERlY1N0cmluZyxcbiAgICAgICAgfSwgWydpZCddKSk7XG4gICAgICB9XG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChqb2JzKTtcbiAgICAgIGorKztcbiAgICB9XG4gIH1cblxuICBhc3luYyB1cGRhdGVUb2tlbkxlYWYobGVhZklkOiBzdHJpbmcsIHRva2VuRHRvOiBVcGRhdGVUb2tlblRyZWVEdG8pIHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5jb25uZWN0aW9uLnRyYW5zYWN0aW9uKGFzeW5jIChtYW5hZ2VyKSA9PiB7XG4gICAgICBjb25zdCB0b2tlblJvb3QgPSBhd2FpdCB0aGlzLnRva2VuVHJlZVNlcnZpY2UuX3VwZGF0ZUxlYWYobWFuYWdlciwgdG9rZW5EdG8ubGVhZklkLCB0b2tlbkR0byk7XG4gICAgICBhd2FpdCB0aGlzLl91cGRhdGVMZWFmKG1hbmFnZXIsICh0b2tlbkR0by5hY2NvdW50SWQpLCB7XG4gICAgICAgIGxlYWZJZDogbGVhZklkLFxuICAgICAgICB0b2tlblJvb3Q6IHRva2VuUm9vdC5oYXNoLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIGFzeW5jIGdldExlYWYobGVhZl9pZDogc3RyaW5nKTogUHJvbWlzZTxBY2NvdW50TGVhZk5vZGU+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmFjY291bnRMZWFmTm9kZVJlcG9zaXRvcnkuZmluZE9uZUJ5KHtsZWFmSWQ6IGxlYWZfaWQudG9TdHJpbmcoKX0pO1xuICAgIGlmIChyZXN1bHQgPT0gbnVsbCkge1xuICAgICAgY29uc3QgZW1wdHlBY2NvdW50ID0gdGhpcy5hY2NvdW50TGVhZk5vZGVSZXBvc2l0b3J5LmNyZWF0ZSgpO1xuICAgICAgZW1wdHlBY2NvdW50LnRzQWRkciA9ICcwJztcbiAgICAgIGVtcHR5QWNjb3VudC5ub25jZSA9ICcwJztcbiAgICAgIGVtcHR5QWNjb3VudC50b2tlblJvb3QgPSBCaWdJbnQodGhpcy5nZXREZWZhdWx0VG9rZW5UcmVlUm9vdCgpKS50b1N0cmluZygpO1xuICAgICAgZW1wdHlBY2NvdW50LmxlYWZJZCA9IGxlYWZfaWQudG9TdHJpbmcoKTtcbiAgICAgIHJldHVybiBlbXB0eUFjY291bnQ7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7ICBcbiAgfVxuICBhc3luYyBnZXRSb290KCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuYWNjb3VudE1lcmtsZVRyZWVSZXBvc2l0b3J5LmZpbmRPbmVCeSh7XG4gICAgICBpZDogMW4udG9TdHJpbmcoKSxcbiAgICB9KTtcbiAgICBpZiAocmVzdWx0ID09IG51bGwpIHtcbiAgICAgIGNvbnN0IGhhc2hEZWNTdHJpbmcgPSBCaWdJbnQodGhpcy5nZXREZWZhdWx0SGFzaEJ5TGV2ZWwoMSkpLnRvU3RyaW5nKCk7XG4gICAgICBhd2FpdCB0aGlzLmFjY291bnRNZXJrbGVUcmVlUmVwb3NpdG9yeS5pbnNlcnQoe1xuICAgICAgICBpZDogMW4udG9TdHJpbmcoKSxcbiAgICAgICAgaGFzaDogaGFzaERlY1N0cmluZ1xuICAgICAgfSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpZDogMW4udG9TdHJpbmcoKSxcbiAgICAgICAgaGFzaDogaGFzaERlY1N0cmluZ1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDsgIFxuICB9XG5cbiAgYXN5bmMgYWRkTGVhZih2YWx1ZTogVXBkYXRlQWNjb3VudFRyZWVEdG8pIHtcbiAgICBjb25zdCBsZWFmSWQgPSAodmFsdWUubGVhZklkKTtcbiAgICBpZighdmFsdWUudHNBZGRyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3RzQWRkciBzaG91bGQgbm90IGJlIG51bGwnKTtcbiAgICB9XG4gICAgY29uc3QgaWQgPSB0aGlzLmdldExlYWZJZEluVHJlZShsZWFmSWQpO1xuICAgIGNvbnN0IGxldmVsID0gTWF0aC5mbG9vcihNYXRoLmxvZzIoTnVtYmVyKGlkKSkpO1xuICAgIC8vIFRPRE86IGNoZWNrIHJlZ2lzdGVyIGV2ZW10IGhhcyB0b2tlbkluZm9cbiAgICBjb25zdCBoYXNoRGVjU3RyaW5nID0gQmlnSW50KHRoaXMuZ2V0RGVmYXVsdEhhc2hCeUxldmVsKGxldmVsKSkudG9TdHJpbmcoKTtcbiAgICAvLyBzZXR1cCB0cmFuc2FjdGlvblxuICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi50cmFuc2FjdGlvbihhc3luYyAobWFuYWdlcikgPT4ge1xuICAgICAgLy8gaW5zZXJ0IHRoaXMgbnVsbCBoYXNoIG9uIHRoaXMgbm9kZVxuICAgICAgLy8gVE9ETzogZml4IEJ1Z1xuICAgICAgYXdhaXQgbWFuYWdlci51cHNlcnQoQWNjb3VudE1lcmtsZVRyZWVOb2RlLCB7XG4gICAgICAgIGxlYWZJZDogbGVhZklkLFxuICAgICAgICBpZDogaWQudG9TdHJpbmcoKSxcbiAgICAgICAgaGFzaDogaGFzaERlY1N0cmluZyxcbiAgICAgIH0sIFsnaWQnXSk7XG4gICAgICBhd2FpdCBtYW5hZ2VyLnVwc2VydChBY2NvdW50TGVhZk5vZGUsIHtcbiAgICAgICAgbGVhZklkOiBsZWFmSWQudG9TdHJpbmcoKSxcbiAgICAgICAgdHNBZGRyOiAodmFsdWUudHNBZGRyIGFzIHN0cmluZyksXG4gICAgICAgIG5vbmNlOiAnMCcsXG4gICAgICAgIHRva2VuUm9vdDogKHRoaXMuZ2V0RGVmYXVsdFRva2VuVHJlZVJvb3QoKSlcbiAgICAgIH0sIFsnbGVhZklkJ10pO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZ2V0TWVya2xlclByb29mKGxlYWZJZDogc3RyaW5nKTogUHJvbWlzZTxiaWdpbnRbXT4ge1xuICAgIGNvbnNvbGUubG9nKCdnZXRNZXJrbGVyUHJvb2YnLCBsZWFmSWQpO1xuICAgIGNvbnN0IGlkcyA9IHRoaXMuZ2V0UHJvb2ZJZHMobGVhZklkKTtcbiAgICBjb25zdCByID0gYXdhaXQgdGhpcy5hY2NvdW50TWVya2xlVHJlZVJlcG9zaXRvcnkuZmluZCh7XG4gICAgICB3aGVyZToge1xuICAgICAgICBpZDogSW4oaWRzLm1hcChpZCA9PiBpZC50b1N0cmluZygpKSlcbiAgICAgIH0sXG4gICAgICBvcmRlcjoge1xuICAgICAgICBpZDogJ0FTQydcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gci5tYXAoaXRlbSA9PiBCaWdJbnQoaXRlbS5oYXNoKSk7XG4gIH1cbn0iLCJpbXBvcnQgeyBCeXRlc0xpa2UgfSBmcm9tICdldGhlcnMnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVHNNZXJrbGVUcmVlPFQ+IHtcbiAgLy8gdHJlZUhlaWdodCBmb3IgZXh0ZW5kXG4gIHByb3RlY3RlZCB0cmVlSGVpZ3QhOiBudW1iZXI7XG4gIHByaXZhdGUgbGFzdExldmVsITogbnVtYmVyO1xuICBwcml2YXRlIGxldmVsc0RlZmF1bHRIYXNoITogTWFwPG51bWJlciwgc3RyaW5nPjtcbiAgcHVibGljIGhhc2hGdW5jITogKHg6IEJ5dGVzTGlrZXwgQnl0ZXNMaWtlW10pID0+IHN0cmluZztcbiAgY29uc3RydWN0b3IodHJlZUhlaWdodDogbnVtYmVyLCBoYXNoRnVuYzogKCh4OiBCeXRlc0xpa2V8IEJ5dGVzTGlrZVtdKSA9PiBzdHJpbmcpKSB7XG4gICAgY29uc29sZS5sb2coe1xuICAgICAgdHJlZUhlaWdodCxcbiAgICB9KTtcbiAgICB0aGlzLnRyZWVIZWlndCA9IE51bWJlcih0cmVlSGVpZ2h0KTtcbiAgICB0aGlzLmhhc2hGdW5jID0gaGFzaEZ1bmM7XG4gICAgdGhpcy5sYXN0TGV2ZWwgPSBOdW1iZXIodGhpcy50cmVlSGVpZ3QpO1xuICAgIC8vIHRoaXMuc2V0TGV2ZWxEZWZhdWx0SGFzaCgpO1xuICB9XG4gIGFic3RyYWN0IGdldERlZmF1bHRSb290KCk6IHN0cmluZztcbiAgYWJzdHJhY3QgZ2V0TGVhZkRlZmF1bHRWYXZsdWUoKTogc3RyaW5nO1xuICBhYnN0cmFjdCB1cGRhdGVMZWFmKGxlYWZJZDogc3RyaW5nLCB2YWx1ZTogYW55LCBvdGhlclBheWxvYWQ6IGFueSk6IHZvaWQ7XG4gIGFic3RyYWN0IGdldExlYWYobGVhZl9pZDogc3RyaW5nLCBvdGhlclBheWxvYWQ6IGFueSk6IFByb21pc2U8VHxudWxsPjtcbiAgYWJzdHJhY3QgZ2V0TWVya2xlclByb29mKGxlYWZfaWQ6IHN0cmluZyk6IFByb21pc2U8YmlnaW50W10+O1xuICBnZXRQcm9vZklkcyhfbGVhZl9pZDogc3RyaW5nKSB7XG4gICAgY29uc3QgbGVhZl9pZCA9IEJpZ0ludChfbGVhZl9pZCk7XG4gICAgY29uc3QgcHJmOiBiaWdpbnRbXSA9IFtdO1xuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMudHJlZUhlaWd0O1xuICAgIGNvbnN0IGxlYWZTdGFydCA9IGxlYWZfaWQgKyAoMW4gPDwgIEJpZ0ludChoZWlnaHQpKTtcbiAgICBmb3IgKGxldCBpID0gbGVhZlN0YXJ0OyBpID4gMW47IGkgPSBpID4+IDFuKSB7XG4gICAgICBpZiAoIGkgJSAybiA9PSAwbikge1xuICAgICAgICBwcmYucHVzaChpICsgMW4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJmLnB1c2goaSAtIDFuKTtcbiAgICAgIH0gXG4gICAgfVxuICAgIHJldHVybiBwcmY7XG4gIH1cbiAgYWJzdHJhY3QgZ2V0Um9vdChvdGhlclBheWxvYWQ6IGFueSk6IGFueTsgXG4gIC8qKlxuICAgKiBjYWxjdWxhdGUgbGV2ZWxzIGRlZmF1bHQgSGFzaFxuICAgKi9cbiAgc2V0TGV2ZWxEZWZhdWx0SGFzaCgpIHtcbiAgICB0aGlzLmxldmVsc0RlZmF1bHRIYXNoID0gbmV3IE1hcDxudW1iZXIsIHN0cmluZz4oKTtcbiAgICB0aGlzLmxldmVsc0RlZmF1bHRIYXNoLnNldCh0aGlzLmxhc3RMZXZlbCwgQmlnSW50KHRoaXMuZ2V0TGVhZkRlZmF1bHRWYXZsdWUoKSkudG9TdHJpbmcoKSk7XG4gICAgZm9yKGxldCBsZXZlbCA9IHRoaXMubGFzdExldmVsLTE7IGxldmVsID49IDAgOyBsZXZlbC0tKSB7XG4gICAgICBjb25zdCBwcmV2TGV2ZWxIYXNoID0gdGhpcy5sZXZlbHNEZWZhdWx0SGFzaC5nZXQobGV2ZWwrMSk7XG4gICAgICBpZiAocHJldkxldmVsSGFzaCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5sZXZlbHNEZWZhdWx0SGFzaC5zZXQobGV2ZWwsIEJpZ0ludCh0aGlzLmhhc2hGdW5jKFtwcmV2TGV2ZWxIYXNoLCBwcmV2TGV2ZWxIYXNoXSkpLnRvU3RyaW5nKCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXRMZWFmSWRJblRyZWUoX2xlYWZJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIEJpZ0ludChfbGVhZklkKSArICgxbiA8PCBCaWdJbnQodGhpcy50cmVlSGVpZ3QpKTtcbiAgfVxuICBnZXRMYXN0TGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMubGFzdExldmVsO1xuICB9XG4gIGdldERlZmF1bHRIYXNoQnlMZXZlbChsZXZlbDogbnVtYmVyKTpzdHJpbmcge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMubGV2ZWxzRGVmYXVsdEhhc2guZ2V0KGxldmVsKTtcbiAgICBpZighcmVzdWx0KSB7XG4gICAgICBjb25zb2xlLmxvZyh7XG4gICAgICAgIGxldmVsLFxuICAgICAgICBoZWlndDogdGhpcy50cmVlSGVpZ3QsXG4gICAgICB9KTtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZ2V0RGVmYXVsdEhhc2hCeUxldmVsIG51bGwnKTtcbiAgICB9XG4gICAgcmV0dXJuIEJpZ0ludChyZXN1bHQpLnRvU3RyaW5nKCk7XG4gIH1cbn0iLCJpbXBvcnQgeyB0b1RyZWVMZWFmIH0gZnJvbSAnQHRzLXNkay9kb21haW4vbGliL3RzLXJvbGx1cC90cy1oZWxwZXInO1xuaW1wb3J0IHsgQWNjb3VudExlYWZFbmNvZGVUeXBlLCBPYnNPcmRlckxlYWZFbmNvZGVUeXBlLCBUb2tlbkxlYWZFbmNvZGVUeXBlIH0gZnJvbSAnQHRzLXNkay9kb21haW4vbGliL3RzLXR5cGVzL3RzLXR5cGVzJztcbi8vIGNvbnN0IGNhY2hlOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdEFjY291bnRMZWFmTWVzc2FnZSh0b2tlblJvb3Q6IHN0cmluZyk6IEFjY291bnRMZWFmRW5jb2RlVHlwZSB7XG4gIHJldHVybiBbMG4sIDBuLCBCaWdJbnQodG9rZW5Sb290KV07XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdFRva2VuTGVhZk1lc3NhZ2UoKTogVG9rZW5MZWFmRW5jb2RlVHlwZSB7XG4gIHJldHVybiBbMG4sIDBuXTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0T2JzT3JkZXJMZWFmTWVzc2FnZSgpOiBPYnNPcmRlckxlYWZFbmNvZGVUeXBlIHtcbiAgcmV0dXJuIFtcbiAgICAwbiwgMG4sIDBuLCAwbiwgMG4sXG4gICAgMG4sIDBuLCAwbiwgMG4sIDBuLFxuICAgIDBuLCAwbiwgMG4sXG4gIF07XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRBY2NvdW50TGVhZih0b2tlblJvb3Q6IHN0cmluZykge1xuICByZXR1cm4gdG9UcmVlTGVhZihnZXREZWZhdWx0QWNjb3VudExlYWZNZXNzYWdlKHRva2VuUm9vdCkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRUb2tlbkxlYWYoKSB7XG4gIHJldHVybiB0b1RyZWVMZWFmKGdldERlZmF1bHRUb2tlbkxlYWZNZXNzYWdlKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdE9ic09yZGVyTGVhZigpIHtcbiAgcmV0dXJuIHRvVHJlZUxlYWYoZ2V0RGVmYXVsdE9ic09yZGVyTGVhZk1lc3NhZ2UoKSk7XG59XG5cbi8vIGV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0QWNjb3VudFRyZWVSb290KGhlaWdodDogbnVtYmVyLCB0b2tlblJvb3Q6IHN0cmluZyk6IHN0cmluZyB7XG4vLyAgIGlmKCFjYWNoZVtgRGVmYXVsdEFjY291bnRUcmVlUm9vdF8ke2hlaWdodH1gXSkge1xuLy8gICAgIGNvbnN0IG1rID0gbmV3IFRzTWVya2xlVHJlZShbXSwgaGVpZ2h0LCB0c0hhc2hGdW5jLCBnZXREZWZhdWx0QWNjb3VudExlYWYodG9rZW5Sb290KSk7XG4vLyAgICAgY2FjaGVbYERlZmF1bHRBY2NvdW50VHJlZVJvb3RfJHtoZWlnaHR9YF0gPSBtay5nZXRSb290KCk7XG4vLyAgIH1cbi8vICAgcmV0dXJuIGNhY2hlW2BEZWZhdWx0VG9rZW5UcmVlUm9vdF8ke2hlaWdodH1gXTtcbi8vIH1cbi8vIGV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0VG9rZW5UcmVlUm9vdChoZWlnaHQ6IG51bWJlcik6IHN0cmluZyB7XG4vLyAgIGlmKCFjYWNoZVtgRGVmYXVsdFRva2VuVHJlZVJvb3RfJHtoZWlnaHR9YF0pIHtcbi8vICAgICBjb25zdCBtayA9IG5ldyBUc01lcmtsZVRyZWUoW10sIGhlaWdodCwgdHNIYXNoRnVuYywgZ2V0RGVmYXVsdFRva2VuTGVhZigpKTtcbi8vICAgICBjYWNoZVtgRGVmYXVsdFRva2VuVHJlZVJvb3RfJHtoZWlnaHR9YF0gPSBtay5nZXRSb290KCk7XG4vLyAgIH1cbi8vICAgcmV0dXJuIGNhY2hlW2BEZWZhdWx0VG9rZW5UcmVlUm9vdF8ke2hlaWdodH1gXTtcbi8vIH1cbi8vIGV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0T2JzT3JkZXJUcmVlUm9vdChoZWlnaHQ6IG51bWJlcik6IHN0cmluZyB7XG4vLyAgIGlmKCFjYWNoZVtgRGVmYXVsdE9ic09yZGVyVHJlZVJvb3RfJHtoZWlnaHR9YF0pIHtcbi8vICAgICBjb25zdCBtayA9IG5ldyBUc01lcmtsZVRyZWUoW10sIGhlaWdodCwgdHNIYXNoRnVuYywgZ2V0RGVmYXVsdE9ic09yZGVyTGVhZigpKTtcbi8vICAgICBjYWNoZVtgRGVmYXVsdE9ic09yZGVyVHJlZVJvb3RfJHtoZWlnaHR9YF0gPSBtay5nZXRSb290KCk7XG4vLyAgIH1cbi8vICAgcmV0dXJuIGNhY2hlW2BEZWZhdWx0T2JzT3JkZXJUcmVlUm9vdF8ke2hlaWdodH1gXTtcbi8vIH0iLCJpbXBvcnQgeyBCeXRlc0xpa2UgfSBmcm9tICdldGhlcnMnO1xuaW1wb3J0IHsgcmVjdXJzaXZlVG9TdHJpbmcsIGJpZ2ludF90b19oZXggfSBmcm9tICcuLi9oZWxwZXInO1xuaW1wb3J0IHsgZHBQb3NlaWRvbkhhc2ggfSBmcm9tICcuLi9wb3NlaWRvbi1oYXNoLWRwJztcblxuY29uc3QgZXhjbHVkZTogYW55ID0ge307XG5leHBvcnQgY29uc3QgdHNIYXNoRnVuYyA9IHBvc2VpZG9uSGFzaDtcblxuZXhwb3J0IGZ1bmN0aW9uIHR4VG9DaXJjdWl0SW5wdXQob2JqOiBhbnksIGluaXREYXRhOiBhbnkgPSB7fSkge1xuICBjb25zdCByZXN1bHQ6IGFueSA9IGluaXREYXRhO1xuICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGlmKGV4Y2x1ZGVba2V5XSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGl0ZW0gPSBvYmpba2V5XTtcbiAgICBpZighcmVzdWx0W2tleV0pIHtcbiAgICAgIHJlc3VsdFtrZXldID0gW107XG4gICAgfVxuXG4gICAgcmVzdWx0W2tleV0ucHVzaChyZWN1cnNpdmVUb1N0cmluZyhpdGVtKSk7XG4gIH0pO1xuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b1RyZWVMZWFmKGlucHV0czogYmlnaW50W10pIHtcbiAgcmV0dXJuIGJpZ2ludF90b19oZXgoZHBQb3NlaWRvbkhhc2goaW5wdXRzKSk7XG59XG5cbmZ1bmN0aW9uIHBvc2VpZG9uSGFzaCh2YWwgOiBCeXRlc0xpa2UgfCBCeXRlc0xpa2VbXSk6IHN0cmluZyB7XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIGNvbnN0IGlucHV0cyA9IHZhbC5tYXAoKHYgOiBhbnkpID0+IEJpZ0ludCh2KSk7XG4gICAgcmV0dXJuIGJpZ2ludF90b19oZXgoZHBQb3NlaWRvbkhhc2goaW5wdXRzKSk7XG4gIH1cblxuICByZXR1cm4gIGJpZ2ludF90b19oZXgoZHBQb3NlaWRvbkhhc2goW0JpZ0ludCh2YWwudG9TdHJpbmcoKSldKSk7XG59XG4iLCJpbXBvcnQgeyB1dGlscywgQmlnTnVtYmVyIH0gZnJvbSAnZXRoZXJzJztcbmltcG9ydCB7IEVkZHNhU2lnbmVyIH0gZnJvbSAnLi9lZGRzYSc7XG5pbXBvcnQgeyBFZERTQVB1YmxpY0tleVR5cGUsIEVkRFNBU2lnbmF0dXJlUGF5bG9hZCB9IGZyb20gJy4vdHMtdHlwZXMvZWRkc2EtdHlwZXMnO1xuaW1wb3J0IHsgRWREU0FTaWduYXR1cmVSZXF1ZXN0VHlwZSB9IGZyb20gJy4vdHMtdHlwZXMvdHMtcmVxLXR5cGVzJztcbmNvbnN0IE51bWJlck9mQml0cyA9IDI1NjtcblxuZXhwb3J0IGNvbnN0IGhleFRvRGVjID0gKGhleDogc3RyaW5nKSA9PiB7XG4gIHJldHVybiBCaWdOdW1iZXIuZnJvbShoZXgpLnRvU3RyaW5nKCk7XG59O1xuXG5leHBvcnQgY29uc3QgcHJpdmF0ZUtleVRvQWRkcmVzcyA9IChfcHJpdmF0ZUtleTogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IGFkZHJlc3MgPSB1dGlscy5jb21wdXRlQWRkcmVzcyhfcHJpdmF0ZUtleSk7XG4gIHJldHVybiBhZGRyZXNzO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdlbkV0aGVyZXVtUHJpdmF0ZUtleSgpIHtcbiAgY29uc3QgcHJpdmF0ZUtleSA9IHVpbnQ4QXJyYXlUb0hleFN0cmluZyh1dGlscy5yYW5kb21CeXRlcygzMikpO1xuICByZXR1cm4gcHJpdmF0ZUtleTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ1RvVWludDhBcnJheShzdHI6IHN0cmluZykge1xuICBjb25zdCByZXQ6IFVpbnQ4QXJyYXkgPSBuZXcgVWludDhBcnJheShzdHIubGVuZ3RoKTtcbiAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgc3RyLmxlbmd0aDsgaWR4KyspIHtcbiAgICByZXRbaWR4XSA9IHN0ci5jaGFyQ29kZUF0KGlkeCk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpZ2ludF90b19VaW50OEFycmF5KHg6IGJpZ2ludCkge1xuICBjb25zdCByZXQ6IFVpbnQ4QXJyYXkgPSBuZXcgVWludDhBcnJheSgzMik7XG4gIGZvciAobGV0IGlkeCA9IDMxOyBpZHggPj0gMDsgaWR4LS0pIHtcbiAgICByZXRbaWR4XSA9IE51bWJlcih4ICUgMjU2bik7XG4gICAgeCA9IHggLyAyNTZuO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBVaW50OEFycmF5X3RvX2JpZ2ludCh4OiBVaW50OEFycmF5KSB7XG4gIGxldCByZXQgPSAwbjtcbiAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgeC5sZW5ndGg7IGlkeCsrKSB7XG4gICAgcmV0ID0gcmV0ICogMjU2bjtcbiAgICByZXQgPSByZXQgKyBCaWdJbnQoeFtpZHhdKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJpdktleVN0cmluZ1RvQmlnSW50KHByaXZLZXlIZXg6IHN0cmluZykge1xuICBjb25zdCBwcml2S2V5Qnl0ZXMgPSB1dGlscy5hcnJheWlmeShwcml2S2V5SGV4KTtcbiAgY29uc3QgcHJpdktleU51bSA9IFVpbnQ4QXJyYXlfdG9fYmlnaW50KHByaXZLZXlCeXRlcyk7XG4gIHJldHVybiBwcml2S2V5TnVtO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVmZmVyVG9EZWMoYnVmZmVyOiBCdWZmZXIpIHtcbiAgY29uc3QgaGV4ID0gYnVmZmVySXNFbXB0eShidWZmZXIpID8gJzB4MCcgOiAnMHgnICsgYnVmZmVyLnRvU3RyaW5nKCdoZXgnKTtcbiAgcmV0dXJuIEJpZ051bWJlci5mcm9tKGhleCkudG9TdHJpbmcoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1ZmZlcklzRW1wdHkoYnVmZmVyOiBCdWZmZXIpIHtcbiAgcmV0dXJuIGJ1ZmZlci5sZW5ndGggPT09IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoZXhUb1VpbnQ4QXJyYXkoaGV4OiBzdHJpbmcpIHtcbiAgcmV0dXJuIHV0aWxzLmFycmF5aWZ5KGhleCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaWdpbnRfdG9fdHVwbGUoeDogYmlnaW50KSB7XG4gIGNvbnN0IG1vZDogYmlnaW50ID0gMm4gKiogNjRuO1xuICBjb25zdCByZXQ6IFtiaWdpbnQsIGJpZ2ludCwgYmlnaW50LCBiaWdpbnRdID0gWzBuLCAwbiwgMG4sIDBuXTtcblxuICBsZXQgeF90ZW1wOiBiaWdpbnQgPSB4O1xuICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCByZXQubGVuZ3RoOyBpZHgrKykge1xuICAgIHJldFtpZHhdID0geF90ZW1wICUgbW9kO1xuICAgIHhfdGVtcCA9IHhfdGVtcCAvIG1vZDtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmlnaW50X3RvX2hleCh4OiBiaWdpbnQpIHtcbiAgcmV0dXJuICcweCcgKyB4LnRvU3RyaW5nKDE2KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9iamVjdFRvSGV4U3RyaW5nKG9iajogb2JqZWN0KSB7XG4gIGNvbnN0IGhleCA9IHV0aWxzLmhleGxpZnkodXRpbHMudG9VdGY4Qnl0ZXMoSlNPTi5zdHJpbmdpZnkob2JqKSkpO1xuICByZXR1cm4gaGV4O1xufVxuXG5cblxuZXhwb3J0IGZ1bmN0aW9uIHVpbnQ4QXJyYXlUb0J1ZmZlcihhY2MxUHJpdmF0ZUtleTogVWludDhBcnJheSk6IEJ1ZmZlciB7XG4gIHJldHVybiBCdWZmZXIuZnJvbShhY2MxUHJpdmF0ZUtleSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoZXhUb0J1ZmZlcihMMk1pbnRBY2NvdW50UHJpdjogc3RyaW5nKTogQnVmZmVyIHtcbiAgTDJNaW50QWNjb3VudFByaXYgPSBMMk1pbnRBY2NvdW50UHJpdi5yZXBsYWNlKCcweCcsICcnKTtcbiAgcmV0dXJuIEJ1ZmZlci5mcm9tKEwyTWludEFjY291bnRQcml2LCAnaGV4Jyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWN1cnNpdmVUb1N0cmluZyhkYXRhOiBhbnkpOiBhbnkge1xuICBpZiAoZGF0YSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgcmV0dXJuIGRhdGEubWFwKHQgPT4gcmVjdXJzaXZlVG9TdHJpbmcodCkpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnYmlnaW50Jykge1xuICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKDEwKTtcbiAgICAvLyByZXR1cm4gYmlnaW50VG9EZWNTdHJpbmcoZGF0YSk7XG4gIH1cblxuICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG5cbiAgICBpZiAoL1swLTlBLUZhLWZdezZ9L2cudGVzdChkYXRhKSB8fCAvXjB4L2cudGVzdChkYXRhKSkge1xuICAgICAgcmV0dXJuIGhleFRvRGVjKGRhdGEpO1xuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgcmV0dXJuIGRhdGEudG9TdHJpbmcoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVpbnQ4QXJyYXlUb0JpZ2ludCh1aW50OEFycmF5OiBVaW50OEFycmF5LCBudW1iZXJPZkJpdHM6IG51bWJlciA9IE51bWJlck9mQml0cyk6IGJpZ2ludCB7XG4gIHJldHVybiBCaWdJbnQoJzB4JyArIEJ1ZmZlci5mcm9tKHVpbnQ4QXJyYXkpLnRvU3RyaW5nKCdoZXgnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaWdpbnRUb1VpbnQ4QXJyYXkodmFsdWU6IGJpZ2ludCwgbnVtYmVyT2ZCaXRzOiBudW1iZXIgPSBOdW1iZXJPZkJpdHMpOiBVaW50OEFycmF5IHtcbiAgaWYgKG51bWJlck9mQml0cyAlIDgpIHRocm93IG5ldyBFcnJvcignT25seSA4LWJpdCBpbmNyZW1lbnRzIGFyZSBzdXBwb3J0ZWQgd2hlbiAoZGUpc2VyaWFsaXppbmcgYSBiaWdpbnQuJyk7XG4gIGNvbnN0IHZhbHVlQXNIZXhTdHJpbmcgPSBiaWdpbnRUb0hleFN0cmluZyh2YWx1ZSwgbnVtYmVyT2ZCaXRzKTtcbiAgcmV0dXJuIGhleFN0cmluZ1RvVWludDhBcnJheSh2YWx1ZUFzSGV4U3RyaW5nKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpZ2ludFRvSGV4U3RyaW5nKHZhbHVlOiBiaWdpbnQsIG51bWJlck9mQml0czogbnVtYmVyID0gTnVtYmVyT2ZCaXRzKTogc3RyaW5nIHtcbiAgaWYgKG51bWJlck9mQml0cyAlIDgpIHRocm93IG5ldyBFcnJvcignT25seSA4LWJpdCBpbmNyZW1lbnRzIGFyZSBzdXBwb3J0ZWQgd2hlbiAoZGUpc2VyaWFsaXppbmcgYSBiaWdpbnQuJyk7XG4gIGNvbnN0IHZhbHVlVG9TZXJpYWxpemUgPSB0d29zQ29tcGxlbWVudCh2YWx1ZSwgbnVtYmVyT2ZCaXRzKTtcbiAgcmV0dXJuIHVuc2lnbmVkQmlnaW50VG9IZXhTdHJpbmcodmFsdWVUb1NlcmlhbGl6ZSwgbnVtYmVyT2ZCaXRzKTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVBbmROb3JtYWxpemVIZXhTdHJpbmcoaGV4OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBtYXRjaCA9IG5ldyBSZWdFeHAoJ14oPzoweCk/KFthLWZBLUYwLTldKikkJykuZXhlYyhoZXgpO1xuICBpZiAobWF0Y2ggPT09IG51bGwpIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYSBoZXggc3RyaW5nIGVuY29kZWQgYnl0ZSBhcnJheSB3aXRoIGFuIG9wdGlvbmFsICcweCcgcHJlZml4IGJ1dCByZWNlaXZlZCAke2hleH1gKTtcbiAgaWYgKG1hdGNoLmxlbmd0aCAlIDIpIHRocm93IG5ldyBFcnJvcignSGV4IHN0cmluZyBlbmNvZGVkIGJ5dGUgYXJyYXkgbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBjaGFyY2F0ZXJzIGxvbmcuJyk7XG4gIHJldHVybiBgMHgke21hdGNoWzFdfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1aW50OEFycmF5VG9IZXhTdHJpbmcoYXJyYXk6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICBjb25zdCBoZXhTdHJpbmdGcm9tQnl0ZSA9IChieXRlOiBudW1iZXIpOiBzdHJpbmcgPT4gKCcwMCcgKyBieXRlLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTIpO1xuICBjb25zdCBhcHBlbmRCeXRlVG9TdHJpbmcgPSAodmFsdWU6IHN0cmluZywgYnl0ZTogbnVtYmVyKSA9PiB2YWx1ZSArIGhleFN0cmluZ0Zyb21CeXRlKGJ5dGUpO1xuICByZXR1cm4gYXJyYXkucmVkdWNlKGFwcGVuZEJ5dGVUb1N0cmluZywgJycpO1xufVxuXG5mdW5jdGlvbiBoZXhTdHJpbmdUb1VpbnQ4QXJyYXkoaGV4OiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgY29uc3QgbWF0Y2ggPSBuZXcgUmVnRXhwKCdeKD86MHgpPyhbYS1mQS1GMC05XSopJCcpLmV4ZWMoaGV4KTtcbiAgaWYgKG1hdGNoID09PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGEgaGV4IHN0cmluZyBlbmNvZGVkIGJ5dGUgYXJyYXkgd2l0aCBhbiBvcHRpb25hbCAnMHgnIHByZWZpeCBidXQgcmVjZWl2ZWQgJHtoZXh9YCk7XG4gIGlmIChtYXRjaC5sZW5ndGggJSAyKSB0aHJvdyBuZXcgRXJyb3IoJ0hleCBzdHJpbmcgZW5jb2RlZCBieXRlIGFycmF5IG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgY2hhcmNhdGVycyBsb25nLicpO1xuICBjb25zdCBub3JtYWxpemVkID0gbWF0Y2hbMV07XG4gIGNvbnN0IGJ5dGVMZW5ndGggPSBub3JtYWxpemVkLmxlbmd0aCAvIDI7XG4gIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnl0ZUxlbmd0aCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZUxlbmd0aDsgKytpKSB7XG4gICAgYnl0ZXNbaV0gPSAoTnVtYmVyLnBhcnNlSW50KGAke25vcm1hbGl6ZWRbaSAqIDJdfSR7bm9ybWFsaXplZFtpICogMiArIDFdfWAsIDE2KSk7XG4gIH1cbiAgcmV0dXJuIGJ5dGVzO1xufVxuXG5mdW5jdGlvbiB1bnNpZ25lZEJpZ2ludFRvSGV4U3RyaW5nKHZhbHVlOiBiaWdpbnQsIGJpdHM6IG51bWJlcik6IHN0cmluZyB7XG4gIGNvbnN0IGJ5dGVTaXplID0gYml0cyAvIDg7XG4gIGNvbnN0IGhleFN0cmluZ0xlbmd0aCA9IGJ5dGVTaXplICogMjtcbiAgcmV0dXJuICgnMCcucmVwZWF0KGhleFN0cmluZ0xlbmd0aCkgKyB2YWx1ZS50b1N0cmluZygxNikpLnNsaWNlKC1oZXhTdHJpbmdMZW5ndGgpO1xufVxuXG5mdW5jdGlvbiB0d29zQ29tcGxlbWVudCh2YWx1ZTogYmlnaW50LCBudW1iZXJPZkJpdHM6IG51bWJlciA9IE51bWJlck9mQml0cyk6IGJpZ2ludCB7XG4gIGNvbnN0IG1hc2sgPSAybiAqKiAoQmlnSW50KG51bWJlck9mQml0cykgLSAxbikgLSAxbjtcbiAgcmV0dXJuICh2YWx1ZSAmIG1hc2spIC0gKHZhbHVlICYgfm1hc2spO1xufVxuXG5leHBvcnQgY29uc3QgZWRkc2FTaWdUeXBlQ29udmVydGVyID0gKFxuICBzaWc6IEVkRFNBU2lnbmF0dXJlUGF5bG9hZFxuKTogRWREU0FTaWduYXR1cmVSZXF1ZXN0VHlwZSA9PiB7XG4gIHJldHVybiB7XG4gICAgUjg6IFtFZGRzYVNpZ25lci50b09iamVjdChzaWcuUjhbMF0pLnRvU3RyaW5nKCksIEVkZHNhU2lnbmVyLnRvT2JqZWN0KHNpZy5SOFsxXSkudG9TdHJpbmcoKV0sXG4gICAgUzogc2lnLlMudG9TdHJpbmcoKSxcbiAgfTtcbn07XG5cbmV4cG9ydCBjb25zdCB0c1B1YktleVR5cGVDb252ZXJ0ZXIgPSAodHNQdWJLZXk6IFtiaWdpbnQsIGJpZ2ludF0pOiBFZERTQVB1YmxpY0tleVR5cGUgPT4ge1xuICByZXR1cm4gW0VkZHNhU2lnbmVyLnRvRSh0c1B1YktleVswXSksIEVkZHNhU2lnbmVyLnRvRSh0c1B1YktleVsxXSldO1xufTtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBoZXhUb0RlYyxcbiAgZ2VuRXRoZXJldW1Qcml2YXRlS2V5LFxuICBwcml2YXRlS2V5VG9BZGRyZXNzLFxuICB1aW50OEFycmF5VG9IZXhTdHJpbmcsXG4gIHN0cmluZ1RvVWludDhBcnJheSxcbiAgYmlnaW50X3RvX1VpbnQ4QXJyYXksXG4gIFVpbnQ4QXJyYXlfdG9fYmlnaW50LFxuICBwcml2S2V5U3RyaW5nVG9CaWdJbnQsXG4gIGJ1ZmZlclRvRGVjLFxuICBidWZmZXJJc0VtcHR5LFxuICBoZXhUb1VpbnQ4QXJyYXksXG4gIGJpZ2ludF90b190dXBsZSxcbiAgYmlnaW50X3RvX2hleCxcbiAgb2JqZWN0VG9IZXhTdHJpbmcsXG4gIHVpbnQ4QXJyYXlUb0J1ZmZlcixcbiAgaGV4VG9CdWZmZXIsXG4gIHVpbnQ4QXJyYXlUb0JpZ2ludCxcbiAgcmVjdXJzaXZlVG9TdHJpbmcsXG4gIGVkZHNhU2lnVHlwZUNvbnZlcnRlcixcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBidWZmZXJUb0JpZ0ludChidWZmZXI6IEJ1ZmZlcikge1xuICByZXR1cm4gQmlnSW50KCcweCcgKyBidWZmZXIudG9TdHJpbmcoJ2hleCcpKTtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJldGhlcnNcIik7OyIsImltcG9ydCB7IGJ1ZmZlclRvQmlnSW50IH0gZnJvbSAnLi9oZWxwZXInO1xuaW1wb3J0IHsgRWREU0FQdWJsaWNLZXlUeXBlLCBFZERTQVNpZ25hdHVyZVBheWxvYWQgfSBmcm9tICcuL3RzLXR5cGVzL2VkZHNhLXR5cGVzJztcbmNvbnN0IGNpcmNvbWxpYmpzID0gcmVxdWlyZSgnY2lyY29tbGlianMnKTtcbmNvbnN0IGZmID0gcmVxdWlyZSgnZmZqYXZhc2NyaXB0Jyk7XG5cbmV4cG9ydCBsZXQgRWREU0E6IGFueTtcbmV4cG9ydCBjb25zdCBhc3luY0VkRFNBID0gY2lyY29tbGlianMuYnVpbGRFZGRzYSgpO1xuKGFzeW5jIGZ1bmN0aW9uKCkge1xuICBFZERTQSA9IGF3YWl0IGFzeW5jRWREU0E7XG59KSgpO1xuXG5jb25zdCBiaWdJbnQyQnVmZmVyID0gKGk6IGJpZ2ludCk6IEJ1ZmZlciA9PiB7XG4gIGxldCBoZXhTdHIgPSBpLnRvU3RyaW5nKDE2KTtcbiAgd2hpbGUgKGhleFN0ci5sZW5ndGggPCA2NCkge1xuICAgIGhleFN0ciA9ICcwJyArIGhleFN0cjtcbiAgfVxuICByZXR1cm4gQnVmZmVyLmZyb20oaGV4U3RyLCAnaGV4Jyk7XG59O1xuXG5leHBvcnQgY2xhc3MgRWRkc2FTaWduZXIge1xuICBwcml2YXRlIHByaXZhdGVLZXk6IEJ1ZmZlcjtcbiAgcHVibGljIHB1YmxpY0tleTogRWREU0FQdWJsaWNLZXlUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGVLZXk6IEJ1ZmZlcikge1xuICAgIHRoaXMucHJpdmF0ZUtleSA9IHByaXZhdGVLZXk7XG4gICAgdGhpcy5wdWJsaWNLZXkgPSAocHJpdmF0ZUtleS5sZW5ndGggPT09IDApID8gIFtcbiAgICAgIG5ldyBVaW50OEFycmF5KCksIG5ldyBVaW50OEFycmF5KClcbiAgICBdIDogRWREU0EucHJ2MnB1Yihwcml2YXRlS2V5KTtcbiAgfVxuXG4gIHN0YXRpYyB0b09iamVjdChpOiBVaW50OEFycmF5KTogYmlnaW50IHtcbiAgICByZXR1cm4gRWREU0EuYmFieUp1Yi5GLnRvT2JqZWN0KGkpO1xuICB9XG4gICAgXG4gIHN0YXRpYyB0b0UoaTogYmlnaW50KTogVWludDhBcnJheSB7XG4gICAgcmV0dXJuIEVkRFNBLmJhYnlKdWIuRi5lKGkpO1xuICB9XG5cbiAgc2lnblBvc2VpZG9uKG1zZ0hhc2g6IGJpZ2ludCk6IEVkRFNBU2lnbmF0dXJlUGF5bG9hZCB7XG4gICAgY29uc3QgbXNnRmllbGQgPSBFZERTQS5iYWJ5SnViLkYuZShtc2dIYXNoKTtcbiAgICBjb25zdCBzaWduYXR1cmUgPSBFZERTQS5zaWduUG9zZWlkb24odGhpcy5wcml2YXRlS2V5LCBtc2dGaWVsZCk7XG4gICAgcmV0dXJuIHNpZ25hdHVyZTtcbiAgfVxuXG4gIHN0YXRpYyB2ZXJpZnkobXNnSGFzaDogVWludDhBcnJheSwgc2lnbmF0dXJlOiBFZERTQVNpZ25hdHVyZVBheWxvYWQscHVibGljS2V5OiBFZERTQVB1YmxpY0tleVR5cGUpOiBib29sZWFuIHtcbiAgICByZXR1cm4gRWREU0EudmVyaWZ5UG9zZWlkb24oVWludDhBcnJheSwgc2lnbmF0dXJlLCBwdWJsaWNLZXkpO1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjaXJjb21saWJqc1wiKTs7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZmZqYXZhc2NyaXB0XCIpOzsiLCJpbXBvcnQge3Bvc2VpZG9ufSBmcm9tICdAYmlnLXdoYWxlLWxhYnMvcG9zZWlkb24nO1xuXG5jbGFzcyBkcFBvc2VpZG9uQ2FjaGUge1xuICBzdGF0aWMgY2FjaGUgPSBuZXcgTWFwKCk7XG5cbiAgc3RhdGljIGdldENhY2hlKHggOiBiaWdpbnQgfCBzdHJpbmcgfCBiaWdpbnRbXSk6IG51bGwgfCBiaWdpbnQge1xuICAgIGlmICh4IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIGNvbnN0IGtleSA9IHguam9pbigpO1xuICAgICAgcmV0dXJuIGRwUG9zZWlkb25DYWNoZS5nZXRDYWNoZShrZXkpO1xuICAgIH1cblxuICAgIHJldHVybiBkcFBvc2VpZG9uQ2FjaGVcbiAgICAgIC5jYWNoZVxuICAgICAgLmdldCh4KTtcbiAgfVxuXG4gIHN0YXRpYyBzZXRDYWNoZSh4IDogYmlnaW50IHwgc3RyaW5nIHwgYmlnaW50W10sIHYgOiBiaWdpbnQpIHtcbiAgICBpZiAoeCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBjb25zdCBrZXkgPSB4LmpvaW4oKTtcbiAgICAgIGRwUG9zZWlkb25DYWNoZS5zZXRDYWNoZShrZXksIHYpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGRwUG9zZWlkb25DYWNoZVxuICAgICAgLmNhY2hlXG4gICAgICAuc2V0KHgsIHYpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcFBvc2VpZG9uSGFzaChpbnB1dHMgOiBiaWdpbnRbXSwgaXNEcEVuYWJsZWQgPSB0cnVlKTogYmlnaW50IHtcbiAgaWYgKGlzRHBFbmFibGVkKSB7XG4gICAgY29uc3QgY2FjaGUgPSBkcFBvc2VpZG9uQ2FjaGUuZ2V0Q2FjaGUoaW5wdXRzKTtcbiAgICBpZiAoY2FjaGUpIHtcbiAgICAgIHJldHVybiBjYWNoZTtcbiAgICB9XG4gIH1cblxuICBjb25zdCByZXMgPSBwb3NlaWRvbihpbnB1dHMpO1xuICBpZiAoaXNEcEVuYWJsZWQpIHtcbiAgICBkcFBvc2VpZG9uQ2FjaGUuc2V0Q2FjaGUoaW5wdXRzLCByZXMpO1xuICB9XG4gIHJldHVybiByZXM7XG59IiwiaW1wb3J0IHsgSW5qZWN0YWJsZSwgTG9nZ2VyIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgQ29uZmlnU2VydmljZSB9IGZyb20gJ0BuZXN0anMvY29uZmlnJztcbmltcG9ydCB7IEluamVjdFJlcG9zaXRvcnkgfSBmcm9tICdAbmVzdGpzL3R5cGVvcm0nO1xuXG5pbXBvcnQgeyBDb25uZWN0aW9uLCBJc051bGwsIE5vdCwgUmVwb3NpdG9yeSwgSW4sIEVudGl0eU1hbmFnZXIgfSBmcm9tICd0eXBlb3JtJztcbmltcG9ydCB7IHRvVHJlZUxlYWYsIHRzSGFzaEZ1bmMgfSBmcm9tICcuLi9jb21tb24vdHMtaGVscGVyJztcbmltcG9ydCB7IFRzTWVya2xlVHJlZSB9IGZyb20gJy4uL2NvbW1vbi90c01lcmtsZVRyZWUnO1xuaW1wb3J0IHsgVG9rZW5UcmVlUmVzcG9uc2VEdG8gfSBmcm9tICcuL2R0by90b2tlblRyZWVSZXNwb25zZS5kdG8nO1xuaW1wb3J0IHsgVXBkYXRlVG9rZW5UcmVlRHRvIH0gZnJvbSAnLi9kdG8vdXBkYXRlVG9rZW5UcmVlLmR0byc7XG5pbXBvcnQgeyBnZXREZWZhdWx0VG9rZW5MZWFmIH0gZnJvbSAnLi9oZWxwZXIvbWtBY2NvdW50LmhlbHBlcic7XG5pbXBvcnQgeyBUb2tlbkxlYWZOb2RlIH0gZnJvbSAnLi90b2tlbkxlYWZOb2RlLmVudGl0eSc7XG5pbXBvcnQgeyBUb2tlbk1lcmtsZVRyZWVOb2RlIH0gZnJvbSAnLi90b2tlbk1lcmtsZVRyZWVOb2RlLmVudGl0eSc7XG5pbXBvcnQgeyBUc0FjY291bnRUcmVlU2VydmljZSB9IGZyb20gJy4vdHNBY2NvdW50VHJlZS5zZXJ2aWNlJztcbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUc1Rva2VuVHJlZVNlcnZpY2UgZXh0ZW5kcyBUc01lcmtsZVRyZWU8VG9rZW5MZWFmTm9kZT4ge1xuICBwcml2YXRlIGxvZ2dlcjogTG9nZ2VyID0gbmV3IExvZ2dlcihUc1Rva2VuVHJlZVNlcnZpY2UubmFtZSk7XG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3RSZXBvc2l0b3J5KFRva2VuTGVhZk5vZGUpXG4gICAgcHJpdmF0ZSByZWFkb25seSB0b2tlbkxlYWZSZXBvc2l0b3J5OiBSZXBvc2l0b3J5PFRva2VuTGVhZk5vZGU+LFxuICAgIEBJbmplY3RSZXBvc2l0b3J5KFRva2VuTWVya2xlVHJlZU5vZGUpXG4gICAgcHJpdmF0ZSByZWFkb25seSB0b2tlbk1lcmtsZVRyZWVSZXBvc2l0b3J5OiBSZXBvc2l0b3J5PFRva2VuTWVya2xlVHJlZU5vZGU+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgY29ubmVjdGlvbjogQ29ubmVjdGlvbixcbiAgICBwcml2YXRlIGNvbmZpZ1NlcnZpY2U6IENvbmZpZ1NlcnZpY2UsXG4gICkge1xuICAgIGNvbnNvbGUudGltZSgnaW5pdCB0b2tlbiB0cmVlJyk7XG4gICAgc3VwZXIoY29uZmlnU2VydmljZS5nZXQ8bnVtYmVyPignVE9LRU5TX1RSRUVfSEVJR0hUJywgMiksIHRzSGFzaEZ1bmMpO1xuICAgIGNvbnNvbGUudGltZUVuZCgnaW5pdCB0b2tlbiB0cmVlJyk7XG4gICAgdGhpcy5zZXRMZXZlbERlZmF1bHRIYXNoKCk7XG4gIH1cbiAgYXN5bmMgZ2V0Q3VycmVudExlYWZJZENvdW50KGFjY291bnRJZDogYmlnaW50KTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBjb25zdCBsZWFmSWRDb3VudCA9IGF3YWl0IHRoaXMudG9rZW5NZXJrbGVUcmVlUmVwb3NpdG9yeS5jb3VudChcbiAgICAgIHtcbiAgICAgICAgd2hlcmU6IHtcbiAgICAgICAgICBhY2NvdW50SWQ6IGFjY291bnRJZC50b1N0cmluZygpLFxuICAgICAgICAgIGxlYWZJZDogTm90KElzTnVsbCgpKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcbiAgICByZXR1cm4gbGVhZklkQ291bnQ7XG4gIH1cbiAgZ2V0RGVmYXVsdFJvb3QoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5nZXREZWZhdWx0SGFzaEJ5TGV2ZWwoMSk7XG4gIH1cblxuICBnZXRMZWFmRGVmYXVsdFZhdmx1ZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBnZXREZWZhdWx0VG9rZW5MZWFmKCk7XG4gIH1cbiAgYXN5bmMgdXBkYXRlTGVhZihsZWFmSWQ6IHN0cmluZywgdmFsdWU6IFVwZGF0ZVRva2VuVHJlZUR0bykge1xuICAgIGNvbnNvbGUudGltZSgndXBkYXRlTGVhZiBmb3IgdG9rZW4gdHJlZScpO1xuICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi50cmFuc2FjdGlvbihhc3luYyAobWFuYWdlcikgPT4ge1xuICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlTGVhZihtYW5hZ2VyLCBsZWFmSWQsIHZhbHVlKTtcbiAgICB9KTtcbiAgICBjb25zb2xlLnRpbWVFbmQoJ3VwZGF0ZUxlYWYgZm9yIHRva2VuIHRyZWUnKTtcbiAgfVxuICBhc3luYyBfdXBkYXRlTGVhZihtYW5hZ2VyOiBFbnRpdHlNYW5hZ2VyLCB0b2tlbkxlYWZJZDogc3RyaW5nLCB2YWx1ZTogVXBkYXRlVG9rZW5UcmVlRHRvKSB7XG4gICAgY29uc3QgcHJmID0gdGhpcy5nZXRQcm9vZklkcyh0b2tlbkxlYWZJZCk7XG4gICAgY29uc3QgaWQgPSB0aGlzLmdldExlYWZJZEluVHJlZSh0b2tlbkxlYWZJZCk7XG4gICAgY29uc3QgbGVhZkhhc2hEZWNTdHJpbmcgPSBCaWdJbnQodG9UcmVlTGVhZihbQmlnSW50KHZhbHVlLmxlYWZJZCksIEJpZ0ludCh2YWx1ZS5sb2NrZWRBbXQpLCBCaWdJbnQodmFsdWUuYXZhaWxhYmxlQW10KV0pKS50b1N0cmluZygpO1xuICAgIGNvbnN0IGFjY291bnRJZCA9IHZhbHVlLmFjY291bnRJZDtcbiAgICAvLyB1cGRhdGUgbGVhZlxuICAgIGF3YWl0IG1hbmFnZXIudXBzZXJ0KFRva2VuTWVya2xlVHJlZU5vZGUsIHtcbiAgICAgIGFjY291bnRJZDogYWNjb3VudElkLFxuICAgICAgaWQ6IGlkLnRvU3RyaW5nKCksXG4gICAgICBsZWFmSWQ6IHRva2VuTGVhZklkLnRvU3RyaW5nKCksXG4gICAgICBoYXNoOiBsZWFmSGFzaERlY1N0cmluZ1xuICAgIH0sIFsnaWQnLCAnYWNjb3VudElkJ10pO1xuICAgIGF3YWl0IG1hbmFnZXIudXBzZXJ0KFRva2VuTGVhZk5vZGUsIHtcbiAgICAgIGxlYWZJZDogdG9rZW5MZWFmSWQudG9TdHJpbmcoKSxcbiAgICAgIGFjY291bnRJZDogYWNjb3VudElkLFxuICAgICAgbG9ja2VkQW10OiB2YWx1ZS5sb2NrZWRBbXQsXG4gICAgICBhdmFpbGFibGVBbXQ6IHZhbHVlLmF2YWlsYWJsZUFtdFxuICAgIH0sIFsnbGVhZklkJywgJ2FjY291bnRJZCddKTtcbiAgICAvLyB1cGRhdGUgcHJvb2ZcbiAgICBmb3IgKGxldCBpID0gaWQsIGogPSAwOyBpID4gMW47IGkgPSBpID4+IDFuKSB7XG4gICAgICBjb25zdCBbaVZhbHVlLCBqVmFsdWVdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICB0aGlzLnRva2VuTWVya2xlVHJlZVJlcG9zaXRvcnkuZmluZE9uZUJ5KHsgaWQ6IGkudG9TdHJpbmcoKSwgYWNjb3VudElkOiBhY2NvdW50SWQgfSksXG4gICAgICAgIHRoaXMudG9rZW5NZXJrbGVUcmVlUmVwb3NpdG9yeS5maW5kT25lQnkoeyBpZDogcHJmW2pdLnRvU3RyaW5nKCksIGFjY291bnRJZDogYWNjb3VudElkIH0pXG4gICAgICBdKTtcbiAgICAgIGNvbnN0IGpMZXZlbCA9IE1hdGguZmxvb3IoTWF0aC5sb2cyKE51bWJlcihwcmZbal0pKSk7XG4gICAgICBjb25zdCBpTGV2ZWwgPSBNYXRoLmZsb29yKE1hdGgubG9nMihOdW1iZXIoaSkpKTtcbiAgICAgIGNvbnN0IGpIYXNoVmFsdWU6IHN0cmluZyA9IChqVmFsdWUgPT0gbnVsbCkgPyB0aGlzLmdldERlZmF1bHRIYXNoQnlMZXZlbChqTGV2ZWwpIDogalZhbHVlLmhhc2gudG9TdHJpbmcoKTtcbiAgICAgIGNvbnN0IGlIYXNoVmFsdWU6IHN0cmluZyA9IChpVmFsdWUgPT0gbnVsbCkgPyB0aGlzLmdldERlZmF1bHRIYXNoQnlMZXZlbChpTGV2ZWwpIDogaVZhbHVlLmhhc2gudG9TdHJpbmcoKTtcbiAgICAgIGNvbnN0IHIgPSAoaWQgJSAybiA9PSAwbikgPyBbakhhc2hWYWx1ZSwgaUhhc2hWYWx1ZV0gOiBbaUhhc2hWYWx1ZSwgakhhc2hWYWx1ZV07XG4gICAgICBjb25zdCBoYXNoRGVjU3RyaW5nID0gQmlnSW50KHRoaXMuaGFzaEZ1bmMocikpLnRvU3RyaW5nKCk7XG4gICAgICBjb25zb2xlLmxvZyh7XG4gICAgICAgIGlkLCB2YWx1ZSxcbiAgICAgICAgdG9rZW5MZWFmSWQsXG4gICAgICAgIGksXG4gICAgICAgIGpMZXZlbCxcbiAgICAgICAgaUxldmVsLFxuICAgICAgICBqSGFzaFZhbHVlLCBcbiAgICAgICAgaUhhc2hWYWx1ZSxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLnRyZWVIZWlndCxcbiAgICAgICAgaGFzaERlY1N0cmluZ1xuICAgICAgfSk7XG4gICAgICBjb25zdCBqb2JzID0gW107XG4gICAgICBpZiAoaVZhbHVlID09IG51bGwpIHtcbiAgICAgICAgam9icy5wdXNoKG1hbmFnZXIudXBzZXJ0KFRva2VuTWVya2xlVHJlZU5vZGUsIHtcbiAgICAgICAgICBpZDogaS50b1N0cmluZygpLCBhY2NvdW50SWQ6IGFjY291bnRJZCwgaGFzaDogKGlIYXNoVmFsdWUpXG4gICAgICAgIH0sIFsnaWQnLCAnYWNjb3VudElkJ10pKTtcbiAgICAgIH1cbiAgICAgIGlmIChqVmFsdWUgPT0gbnVsbCAmJiBqIDwgcHJmLmxlbmd0aCkge1xuICAgICAgICBqb2JzLnB1c2gobWFuYWdlci51cHNlcnQoVG9rZW5NZXJrbGVUcmVlTm9kZSwge1xuICAgICAgICAgIGlkOiBwcmZbal0udG9TdHJpbmcoKSwgYWNjb3VudElkOiBhY2NvdW50SWQsIGhhc2g6IChqSGFzaFZhbHVlKVxuICAgICAgICB9LCBbJ2lkJywgJ2FjY291bnRJZCddKSk7XG4gICAgICB9XG4gICAgICBjb25zdCB1cGRhdGVSb290ID0gaSA+PiAxbjtcbiAgICAgIGlmICh1cGRhdGVSb290ID49IDFuKSB7XG4gICAgICAgIGpvYnMucHVzaCh0aGlzLnRva2VuTWVya2xlVHJlZVJlcG9zaXRvcnkudXBzZXJ0KFt7XG4gICAgICAgICAgaWQ6IHVwZGF0ZVJvb3QudG9TdHJpbmcoKSwgYWNjb3VudElkOiBhY2NvdW50SWQsIGhhc2g6IGhhc2hEZWNTdHJpbmdcbiAgICAgICAgfV0sIFsnaWQnLCAnYWNjb3VudElkJ10pKTtcbiAgICAgIH1cbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKGpvYnMpO1xuICAgICAgaisrO1xuICAgIH1cbiAgICBjb25zdCByb290ID0gYXdhaXQgdGhpcy5nZXRSb290KGFjY291bnRJZCk7XG4gICAgcmV0dXJuIHJvb3Q7XG4gIH1cblxuICBhc3luYyBnZXRMZWFmKGxlYWZfaWQ6IHN0cmluZywgYWNjb3VudElkOiBzdHJpbmcpOiBQcm9taXNlPFRva2VuTGVhZk5vZGU+IHtcbiAgICBjb25zdCByZXN1bHQgPSAgYXdhaXQgdGhpcy50b2tlbkxlYWZSZXBvc2l0b3J5LmZpbmRPbmVCeSh7bGVhZklkOiBsZWFmX2lkLnRvU3RyaW5nKClcbiAgICAgICwgYWNjb3VudElkOiBhY2NvdW50SWR9KTtcbiAgICBpZiAocmVzdWx0ID09IG51bGwpIHtcbiAgICAgIC8vIGNoZWNrIGxldmVsXG4gICAgICBjb25zdCBpZCA9IHRoaXMuZ2V0TGVhZklkSW5UcmVlKGxlYWZfaWQpO1xuICAgICAgY29uc3QgbGV2ZWwgPSBNYXRoLmZsb29yKE1hdGgubG9nMihOdW1iZXIoaWQpKSk7XG4gICAgICBjb25zdCBoYXNoRGVjU3RyaW5nID0gQmlnSW50KHRoaXMuZ2V0RGVmYXVsdEhhc2hCeUxldmVsKGxldmVsKSkudG9TdHJpbmcoKTtcbiAgICAgIC8vIHN0YXJ0IHRyYW5zYWN0aW9uXG4gICAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24udHJhbnNhY3Rpb24oYXN5bmMgKG1hbmFnZXIpID0+IHtcbiAgICAgICAgLy8gaW5zZXJ0IHRoaXMgbnVsbCBoYXNoIG9uIHRoaXMgbm9kZVxuICAgICAgICBhd2FpdCBtYW5hZ2VyLnVwc2VydChUb2tlbk1lcmtsZVRyZWVOb2RlLCB7XG4gICAgICAgICAgYWNjb3VudElkOiBhY2NvdW50SWQsXG4gICAgICAgICAgaWQ6IGlkLnRvU3RyaW5nKCksXG4gICAgICAgICAgbGVhZklkOiBsZWFmX2lkLnRvU3RyaW5nKCksXG4gICAgICAgICAgaGFzaDogaGFzaERlY1N0cmluZyxcbiAgICAgICAgfSwgW1xuICAgICAgICAgICdpZCcsICdhY2NvdW50SWQnXG4gICAgICAgIF0pO1xuICAgICAgICBhd2FpdCBtYW5hZ2VyLnVwc2VydChUb2tlbkxlYWZOb2RlLCB7XG4gICAgICAgICAgbGVhZklkOiBsZWFmX2lkLnRvU3RyaW5nKCksXG4gICAgICAgICAgYWNjb3VudElkOiBhY2NvdW50SWQsXG4gICAgICAgICAgbG9ja2VkQW10OiAnMCcsXG4gICAgICAgICAgYXZhaWxhYmxlQW10OiAnMCcsXG4gICAgICAgIH0sIFsnbGVhZklkJywgJ2FjY291bnRJZCddKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMudG9rZW5MZWFmUmVwb3NpdG9yeS5maW5kT25lQnlPckZhaWwoe2xlYWZJZDogbGVhZl9pZC50b1N0cmluZygpLCBhY2NvdW50SWQ6IGFjY291bnRJZH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGFzeW5jIGdldFJvb3QoYWNjb3VudElkOiBzdHJpbmcpOiBQcm9taXNlPFRva2VuVHJlZVJlc3BvbnNlRHRvPiB7XG4gICAgY29uc3QgcmVzdWx0ID0gIGF3YWl0IHRoaXMudG9rZW5NZXJrbGVUcmVlUmVwb3NpdG9yeS5maW5kT25lQnkoe2FjY291bnRJZDogYWNjb3VudElkLCBpZDogMW4udG9TdHJpbmcoKX0pO1xuICAgIGlmIChyZXN1bHQgPT0gbnVsbCkge1xuICAgICAgY29uc3QgaGFzaERlY1N0cmluZyA9IEJpZ0ludCh0aGlzLmdldERlZmF1bHRIYXNoQnlMZXZlbCgxKSkudG9TdHJpbmcoKTtcbiAgICAgIGF3YWl0IHRoaXMudG9rZW5NZXJrbGVUcmVlUmVwb3NpdG9yeS5pbnNlcnQoe1xuICAgICAgICBhY2NvdW50SWQ6IGFjY291bnRJZCxcbiAgICAgICAgaWQ6IDFuLnRvU3RyaW5nKCksXG4gICAgICAgIGhhc2g6IGhhc2hEZWNTdHJpbmdcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYWNjb3VudElkOiBhY2NvdW50SWQsXG4gICAgICAgIGlkOiAxLFxuICAgICAgICBsZWFmSWQ6IG51bGwsXG4gICAgICAgIGhhc2g6IGhhc2hEZWNTdHJpbmdcbiAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdEhhc2ggPSByZXN1bHQuaGFzaCA/IEJpZ0ludChyZXN1bHQuaGFzaCkudG9TdHJpbmcoKSA6ICcnO1xuICAgIHJldHVybiB7XG4gICAgICBhY2NvdW50SWQ6IGFjY291bnRJZCxcbiAgICAgIGlkOiAxLFxuICAgICAgbGVhZklkOiBudWxsLFxuICAgICAgaGFzaDogcmVzdWx0SGFzaCxcbiAgICB9O1xuICB9XG4gIGFzeW5jIGdldE1lcmtsZXJQcm9vZihsZWFmSWQ6IHN0cmluZyk6IFByb21pc2U8YmlnaW50W10+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nhbm90IHVzZSBnZXRNZXJrbGVyUHJvb2YgaW4gVG9rZW5UcmVlJyk7XG4gIH1cbiAgYXN5bmMgZ2V0TWVya2xlclByb29mQnlBY2NvdW50SWQobGVhZklkOiBzdHJpbmcsIGFjY291bnRJZDogc3RyaW5nKTogUHJvbWlzZTxiaWdpbnRbXT4ge1xuICAgIGNvbnN0IGlkcyA9IHRoaXMuZ2V0UHJvb2ZJZHMobGVhZklkKTtcbiAgICBjb25zdCByID0gYXdhaXQgdGhpcy50b2tlbk1lcmtsZVRyZWVSZXBvc2l0b3J5LmZpbmQoe1xuICAgICAgd2hlcmU6IHtcbiAgICAgICAgYWNjb3VudElkOiBhY2NvdW50SWQsXG4gICAgICAgIGlkOiBJbihpZHMubWFwKHYgPT4gdi50b1N0cmluZygpKSlcbiAgICAgIH0sXG4gICAgICBvcmRlcjoge1xuICAgICAgICBpZDogJ0FTQydcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gci5tYXAoaXRlbSA9PiBCaWdJbnQoaXRlbS5oYXNoKSk7XG4gIH1cbiAgXG59IiwiaW1wb3J0IHsgVG9rZW5MZWFmRW5jb2RlVHlwZSB9IGZyb20gJ0B0cy1zZGsvZG9tYWluL2xpYi90cy10eXBlcy90cy10eXBlcyc7XG5pbXBvcnQgeyBDb2x1bW4sIEVudGl0eSwgSm9pbkNvbHVtbiwgT25lVG9PbmUsIFByaW1hcnlDb2x1bW4gfSBmcm9tICd0eXBlb3JtJztcbmltcG9ydCB7IHRvVHJlZUxlYWYgfSBmcm9tICcuLi9jb21tb24vdHMtaGVscGVyJztcbmltcG9ydCB7IFRva2VuTWVya2xlVHJlZU5vZGUgfSBmcm9tICcuL3Rva2VuTWVya2xlVHJlZU5vZGUuZW50aXR5JztcblxuQEVudGl0eSgnVG9rZW5MZWFmTm9kZScsIHsgc2NoZW1hOiAncHVibGljJ30pXG5leHBvcnQgY2xhc3MgVG9rZW5MZWFmTm9kZSB7XG4gIEBQcmltYXJ5Q29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2xlYWZJZCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBwcmltYXJ5OiB0cnVlLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgfSlcbiAgbGVhZklkITogc3RyaW5nO1xuICBAUHJpbWFyeUNvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdhY2NvdW50SWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgcHJpbWFyeTogdHJ1ZSxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gIH0pXG4gIGFjY291bnRJZCE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdhdmFpbGFibGVBbXQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgZGVmYXVsdDogMG5cbiAgfSlcbiAgYXZhaWxhYmxlQW10ITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2xvY2tlZEFtdCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBkZWZhdWx0OiAwblxuICB9KVxuICBsb2NrZWRBbXQhOiBzdHJpbmc7XG4gIEBPbmVUb09uZShcbiAgICAoKSA9PiBUb2tlbk1lcmtsZVRyZWVOb2RlLFxuICAgICh0b2tlbk1lcmtsZVRyZWVOb2RlOiBUb2tlbk1lcmtsZVRyZWVOb2RlKSA9PiB0b2tlbk1lcmtsZVRyZWVOb2RlLmxlYWYsXG4gICAgeyBvbkRlbGV0ZTogJ1JFU1RSSUNUJywgb25VcGRhdGU6ICdDQVNDQURFJyB9XG4gIClcbiAgQEpvaW5Db2x1bW4oW1xuICAgIHsgbmFtZTogJ2xlYWZJZCcsIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAnbGVhZklkJyB9LFxuICAgIHsgbmFtZTogJ2FjY291bnRJZCcsIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAnYWNjb3VudElkJyB9XG4gIF0pXG4gIHRva2VuTWVya2xlTm9kZSE6IFRva2VuTWVya2xlVHJlZU5vZGU7XG5cbiAgZW5jb2RlKCk6IFRva2VuTGVhZkVuY29kZVR5cGUge1xuICAgIHJldHVybiBbXG4gICAgICBCaWdJbnQodGhpcy5hdmFpbGFibGVBbXQpLCBCaWdJbnQodGhpcy5sb2NrZWRBbXQpXG4gICAgXTtcbiAgfVxuXG4gIGVuY29kZUhhc2goKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdG9UcmVlTGVhZih0aGlzLmVuY29kZSgpKTtcbiAgfVxufSIsImltcG9ydCB7IENvbHVtbiwgRW50aXR5LCBKb2luQ29sdW1uLCBPbmVUb09uZSwgUHJpbWFyeUNvbHVtbiB9IGZyb20gJ3R5cGVvcm0nO1xuaW1wb3J0IHsgVG9rZW5MZWFmTm9kZSB9IGZyb20gJy4vdG9rZW5MZWFmTm9kZS5lbnRpdHknO1xuXG5ARW50aXR5KCdUb2tlbk1lcmtsZVRyZWVOb2RlJywgeyBzY2hlbWE6ICdwdWJsaWMnIH0pXG5leHBvcnQgY2xhc3MgVG9rZW5NZXJrbGVUcmVlTm9kZSB7XG4gIEBQcmltYXJ5Q29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2FjY291bnRJZCcsXG4gICAgcHJpbWFyeTogdHJ1ZSxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICB1bmlxdWU6IGZhbHNlLFxuICB9KVxuICBhY2NvdW50SWQhOiBzdHJpbmc7IC8vIGNvbXBvc2UgcHJpbWFyeSBrZXlcbiAgQFByaW1hcnlDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnaWQnLFxuICAgIHByaW1hcnk6IHRydWUsXG4gICAgcHJlY2lzaW9uOiA4NiwgXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIHVuaXF1ZTogZmFsc2UsXG4gIH0pXG4gIGlkITogc3RyaW5nOyAvLyBjb21wb3NlIHByaW1hcnkga2V5XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnaGFzaCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2VcbiAgfSlcbiAgaGFzaCE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdsZWFmSWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gICAgdW5pcXVlOiBmYWxzZSxcbiAgfSlcbiAgbGVhZklkITogc3RyaW5nfG51bGw7XG4gIC8vIHJlbGF0aW9uc1xuICAvLyBATWFueVRvT25lKFxuICAvLyAgICgpID0+IEFjY291bnRNZXJrbGVUcmVlTm9kZSxcbiAgLy8gICAoYWNjb3VudE1lcmtsZVRyZWVOb2RlOiBBY2NvdW50TWVya2xlVHJlZU5vZGUpID0+IGFjY291bnRNZXJrbGVUcmVlTm9kZS50b2tlbk1lcmtsZVRyZWVOb2RlcyxcbiAgLy8gICB7IG9uRGVsZXRlOiAnUkVTVFJJQ1QnLCBvblVwZGF0ZTogJ0NBU0NBREUnIH1cbiAgLy8gKVxuICAvLyBASm9pbkNvbHVtbih7IG5hbWU6ICdhY2NvdW50SWQnLCByZWZlcmVuY2VkQ29sdW1uTmFtZTogJ2xlYWZJZCcgfSlcbiAgLy8gYWNjb3VudFJvb3QhOiBBY2NvdW50TWVya2xlVHJlZU5vZGU7XG4gIEBPbmVUb09uZShcbiAgICAoKSA9PiBUb2tlbkxlYWZOb2RlLFxuICAgICh0b2tlbkxlYWZOb2RlOiBUb2tlbkxlYWZOb2RlKSA9PiB0b2tlbkxlYWZOb2RlLnRva2VuTWVya2xlTm9kZVxuICApXG4gIEBKb2luQ29sdW1uKFt7XG4gICAgbmFtZTogJ2xlYWZJZCcsXG4gICAgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICdsZWFmSWQnXG4gIH0se1xuICAgIG5hbWU6ICdhY2NvdW50SWQnLFxuICAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAnYWNjb3VudElkJ1xuICB9XSlcbiAgbGVhZiE6VG9rZW5MZWFmTm9kZTtcblxufSIsImltcG9ydCB7IEdsb2JhbCwgTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgQ29uZmlnTW9kdWxlLCBDb25maWdTZXJ2aWNlIH0gZnJvbSAnQG5lc3Rqcy9jb25maWcnO1xuaW1wb3J0IHsgVHlwZU9ybU1vZHVsZSB9IGZyb20gJ0BuZXN0anMvdHlwZW9ybSc7XG5pbXBvcnQgeyBBdWN0aW9uT3JkZXJMZWFmTm9kZSB9IGZyb20gJy4vYXVjdGlvbk9yZGVyTGVhZk5vZGUuZW50aXR5JztcbmltcG9ydCB7IEF1Y3Rpb25Cb25kVG9rZW5FbnRpdHkgfSBmcm9tICcuL2F1Y3Rpb25Cb25kVG9rZW4uZW50aXR5JztcbmltcG9ydCB7IEF1Y3Rpb25PcmRlck1lcmtsZVRyZWVOb2RlIH0gZnJvbSAnLi9hdWN0aW9uT3JkZXJNZXJrbGVUcmVlTm9kZS5lbnRpdHknO1xuaW1wb3J0IHsgT2JzT3JkZXJFbnRpdHkgfSBmcm9tICcuL29ic09yZGVyLmVudGl0eSc7XG5pbXBvcnQgeyBPYnNPcmRlckxlYWZFbnRpdHkgfSBmcm9tICcuL29ic09yZGVyTGVhZi5lbnRpdHknO1xuaW1wb3J0IHsgTWF0Y2hPYnNPcmRlckVudGl0eSB9IGZyb20gJy4vbWF0Y2hPYnNPcmRlci5lbnRpdHknO1xuaW1wb3J0IHsgQ2FuZGxlU3RpY2tFbnRpdHkgfSBmcm9tICcuL2NhbmRsZVN0aWNrLmVudGl0eSc7XG5pbXBvcnQgeyBPYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZSB9IGZyb20gJy4vb2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUuZW50aXR5JztcbmltcG9ydCB7IE1hcmtldFBhaXJJbmZvRW50aXR5IH0gZnJvbSAnLi9tYXJrZXRQYWlySW5mby5lbnRpdHknO1xuaW1wb3J0IHsgTWFya2V0UGFpckluZm9TZXJ2aWNlIH0gZnJvbSAnLi9tYXJrZXRQYWlySW5mby5zZXJ2aWNlJztcbmltcG9ydCB7IEF2YWlsYWJsZVZpZXdFbnRpdHkgfSBmcm9tICcuL2F2YWlsYWJsZVZpZXcuZW50aXR5JztcbmltcG9ydCB7IE9ic09yZGVyVHJlZVNlcnZpY2UgfSBmcm9tICcuL29ic09yZGVyVHJlZS5zZXJ2aWNlJztcblxuQEdsb2JhbCgpXG5ATW9kdWxlKHtcbiAgaW1wb3J0czogW0NvbmZpZ01vZHVsZSwgVHlwZU9ybU1vZHVsZS5mb3JGZWF0dXJlKFtcbiAgICAvLyBBdWN0aW9uT3JkZXJNZXJrbGVUcmVlTm9kZSxcbiAgICAvLyBBdWN0aW9uT3JkZXJMZWFmTm9kZSxcbiAgICBPYnNPcmRlckVudGl0eSxcbiAgICBPYnNPcmRlckxlYWZFbnRpdHksXG4gICAgT2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUsXG4gICAgTWF0Y2hPYnNPcmRlckVudGl0eSxcbiAgICBNYXJrZXRQYWlySW5mb0VudGl0eSxcbiAgICBDYW5kbGVTdGlja0VudGl0eSwgXG4gICAgQXVjdGlvbkJvbmRUb2tlbkVudGl0eSxcbiAgICBBdmFpbGFibGVWaWV3RW50aXR5XG4gIF0pXSxcbiAgcHJvdmlkZXJzOiBbQ29uZmlnU2VydmljZSwgT2JzT3JkZXJUcmVlU2VydmljZSwgTWFya2V0UGFpckluZm9TZXJ2aWNlXSxcbiAgZXhwb3J0czogW01hcmtldFBhaXJJbmZvU2VydmljZSwgT2JzT3JkZXJUcmVlU2VydmljZSwgVHlwZU9ybU1vZHVsZV1cbn0pXG5leHBvcnQgY2xhc3MgQXVjdGlvbk9yZGVyTW91ZGxlIHt9IiwiaW1wb3J0IHsgVHNUb2tlbkFkZHJlc3MgfSBmcm9tICdAdHMtc2RrL2RvbWFpbi9saWIvdHMtdHlwZXMvdHMtdHlwZXMnO1xuaW1wb3J0IHsgQ29sdW1uLCBDcmVhdGVEYXRlQ29sdW1uLCBFbnRpdHksIFByaW1hcnlHZW5lcmF0ZWRDb2x1bW4sIFVwZGF0ZURhdGVDb2x1bW4gfSBmcm9tICd0eXBlb3JtJztcblxuZXhwb3J0IGVudW0gQm9uZFRva2VuU3RhdHVzSW5kZXgge1xuICBpc0wxRGVwbG95ZWQgPSAxLFxuICBpc0F2YWlsYWJsZSA9IDIsXG4gIGlzRXhjY2VlZGVkID0gNCxcbn1cblxuQEVudGl0eSgnQXVjdGlvbkJvbmRUb2tlbicsIHsgc2NoZW1hOiAncHVibGljJ30pIFxuZXhwb3J0IGNsYXNzIEF1Y3Rpb25Cb25kVG9rZW5FbnRpdHkge1xuICBAUHJpbWFyeUdlbmVyYXRlZENvbHVtbih7XG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIG5hbWU6ICdib25kSWQnLFxuICB9KVxuICBib25kSWQhOiBudW1iZXI7XG5cbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdMMUFkZHInLFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICAgIGxlbmd0aDogMjU2LFxuICB9KVxuICBMMUFkZHI/OiBzdHJpbmc7XG5cbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdMMkFkZHInLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICB9KVxuICBMMkFkZHIhOiBUc1Rva2VuQWRkcmVzcztcblxuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ3VuZGVybHlpbmdUb2tlbicsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gIH0pXG4gIHVuZGVybHlpbmdUb2tlbiE6IFRzVG9rZW5BZGRyZXNzO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgbmFtZTogJ2xhc3RTeW5jQmxvY2tudW1iZXJGb3JEZXBvc2l0RXZlbnQnLFxuICAgIGRlZmF1bHQ6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICB9KVxuICBsYXN0U3luY0Jsb2NrbnVtYmVyRm9yRGVwb3NpdEV2ZW50ITogbnVtYmVyO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndGltZXN0YW1wIHdpdGhvdXQgdGltZSB6b25lJyxcbiAgICBuYW1lOiAnbWF0dXJpdHlEYXRlJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gIH0pXG4gIG1hdHVyaXR5RGF0ZSE6IERhdGU7XG5cbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIG5hbWU6ICdzdGF0dXMnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAoKSA9PiAwLFxuICB9KVxuICBzdGF0dXMhOiBudW1iZXI7XG4gIGdldFN0YXR1cyhzdGF0dXNJZDogQm9uZFRva2VuU3RhdHVzSW5kZXgpOiBCb25kVG9rZW5TdGF0dXNJbmRleCB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdHVzICYgc3RhdHVzSWQ7XG4gIH1cbiAgc2V0U3RhdHVzKHN0YXR1c0lkOiBCb25kVG9rZW5TdGF0dXNJbmRleCk6IHZvaWQge1xuICAgIHRoaXMuc3RhdHVzIHw9IHN0YXR1c0lkO1xuICB9XG5cbiAgQENyZWF0ZURhdGVDb2x1bW4oe1xuICAgIHR5cGU6ICd0aW1lc3RhbXAgd2l0aG91dCB0aW1lIHpvbmUnLFxuICAgIG5hbWU6ICdjcmVhdGVkQXQnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAnbm93KCknLFxuICB9KVxuICBjcmVhdGVkQXQhOiBEYXRlO1xuICBAVXBkYXRlRGF0ZUNvbHVtbih7XG4gICAgdHlwZTogJ3RpbWUgd2l0aG91dCB0aW1lIHpvbmUnLFxuICAgIG5hbWU6ICd1cGRhdGVkQXQnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAnbm93KCknLFxuICB9KVxuICB1cGRhdGVkQXQhOiBEYXRlO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ3VwZGF0ZWRCeScsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gICAgbGVuZ3RoOiAyNTYsXG4gIH0pXG4gIHVwZGF0ZWRCeSE6IHN0cmluZyB8IG51bGw7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAnZGVsZXRlZEJ5JyxcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgICBsZW5ndGg6IDI1NixcbiAgfSlcbiAgZGVsZXRlZEJ5ITogc3RyaW5nIHwgbnVsbDtcbn0iLCJpbXBvcnQgeyBUU19TVEFUVVMgfSBmcm9tICdjb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC90c1N0YXR1cy5lbnVtJztcbmltcG9ydCB7IFRyYW5zYWN0aW9uSW5mbyB9IGZyb20gJ0Bjb21tb24vdHMtdHlwZW9ybS9hY2NvdW50L3RyYW5zYWN0aW9uSW5mby5lbnRpdHknO1xuXG5leHBvcnQgY29uc3QgTEVOX09GX1JFUVVFU1QgPSAxMDtcbmV4cG9ydCBjb25zdCBDSFVOS19CWVRFU19TSVpFID0gMTI7XG5leHBvcnQgY29uc3QgQ0hVTktfQklUU19TSVpFID0gQ0hVTktfQllURVNfU0laRSAqIDg7XG5leHBvcnQgY29uc3QgTUlOX0NIVU5LU19QRVJfUkVRID0gMztcbmV4cG9ydCBjb25zdCBNQVhfQ0hVTktTX1BFUl9SRVEgPSA5O1xuZXhwb3J0IGNvbnN0IE1BWF9DSFVOS1NfQllURVNfUEVSX1JFUSA9IE1BWF9DSFVOS1NfUEVSX1JFUSAqIENIVU5LX0JZVEVTX1NJWkU7XG5leHBvcnQgZnVuY3Rpb24gZ2V0T0NodW5rc1NpemUoYmF0Y2hTaXplOiBudW1iZXIpIHtcbiAgcmV0dXJuIE1BWF9DSFVOS1NfUEVSX1JFUSAqIGJhdGNoU2l6ZTtcbn1cblxuZXhwb3J0IHR5cGUgVHNUeFJlcXVlc3REYXRhc1R5cGUgPSBbYmlnaW50LCBiaWdpbnQsIGJpZ2ludCwgYmlnaW50LCBiaWdpbnQsIGJpZ2ludCwgYmlnaW50LCBiaWdpbnQsIGJpZ2ludCwgYmlnaW50XTtcbmV4cG9ydCB0eXBlIFRva2VuTGVhZkVuY29kZVR5cGUgPSBbYmlnaW50LCBiaWdpbnRdO1xuZXhwb3J0IHR5cGUgQWNjb3VudExlYWZFbmNvZGVUeXBlID0gW2JpZ2ludCwgYmlnaW50LCBiaWdpbnRdO1xuZXhwb3J0IHR5cGUgT2JzT3JkZXJMZWFmRW5jb2RlVHlwZSA9IFtcbiAgYmlnaW50LCBiaWdpbnQsIGJpZ2ludCwgYmlnaW50LCBiaWdpbnQsXG4gIGJpZ2ludCwgYmlnaW50LCBiaWdpbnQsIGJpZ2ludCwgYmlnaW50LFxuICBiaWdpbnQsIGJpZ2ludCwgYmlnaW50LFxuXTtcblxuZXhwb3J0IGVudW0gVHNTeXN0ZW1BY2NvdW50QWRkcmVzcyB7XG4gIEJVUk5fQUREUiA9ICcwJyxcbiAgTUlOVF9BRERSID0gJzAnLFxuICBXSVRIRFJBV19BRERSID0gJzAnLFxuICBBVUNUSU9OX0FERFIgPSAnMCcsXG59XG5cbmV4cG9ydCBjb25zdCBUc0RlZmF1bHRWYWx1ZSA9IHtcbiAgTk9OQ0VfWkVSTzogJzAnLFxuICBCSUdJTlRfREVGQVVMVF9WQUxVRTogMG4sXG4gIFNUUklOR19ERUZBVUxUX1ZBTFVFOiAnMCcsXG4gIEFERFJFU1NfREVGQVVMVF9WQUxVRTogJzB4MDAnLFxufTtcblxuZXhwb3J0IGVudW0gVHNUeFR5cGUge1xuICBVTktOT1dOID0gMCxcbiAgTk9PUCA9IDAsXG4gIFJFR0lTVEVSID0gMSxcbiAgREVQT1NJVCA9IDIsXG4gIC8vIFRSQU5TRkVSID0gJzMnLFxuICBXSVRIRFJBVyA9IDMsXG4gIFNlY29uZExpbWl0T3JkZXIgPSA0LFxuICBTZWNvbmRMaW1pdFN0YXJ0ID0gNSxcbiAgU2Vjb25kTGltaXRFeGNoYW5nZSA9IDYsXG4gIFNlY29uZExpbWl0RW5kID0gNyxcbiAgU2Vjb25kTWFya2V0T3JkZXIgPSA4LFxuICBTZWNvbmRNYXJrZXRFeGNoYW5nZSA9IDksXG4gIFNlY29uZE1hcmtldEVuZCA9IDEwLFxuICBDYW5jZWxPcmRlciA9IDExLFxuXG4gIEFVQ1RJT05fTEVORCA9IDk5LFxuICBBVUNUSU9OX0JPUlJPVyA9IDEwMCxcbiAgQVVDVElPTl9DQU5DRUwgPSAxMDEsXG59XG5cbmV4cG9ydCBjb25zdCBUc0RlY2lhbWwgPSB7XG4gIFRTX1RPS0VOX0FNT1VOVF9ERUM6IDE4LFxuICBUU19JTlRFUkVTVF9ERUM6IDYsXG59O1xuXG5leHBvcnQgZW51bSBUc1Rva2VuQWRkcmVzcyB7XG4gIFVua25vd24gPSAnMCcsXG4gIFdFVEggPSAnMScsXG4gIFVTRFQgPSAnMicsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHNUb2tlbkluZm8ge1xuICBhbW91bnQ6IGJpZ2ludDtcbiAgbG9ja0FtdDogYmlnaW50O1xufVxuXG5leHBvcnQgY29uc3QgVHhOb29wOiBUcmFuc2FjdGlvbkluZm8gPSB7XG4gIHJlcVR5cGU6IE51bWJlcihUc1R4VHlwZS5VTktOT1dOKSxcbiAgdHhJZDogMCxcbiAgYWNjb3VudElkOiAnMCcsXG4gIHRva2VuSWQ6ICcwJyxcbiAgYWNjdW11bGF0ZWRTZWxsQW10OiAnMCcsXG4gIGFjY3VtdWxhdGVkQnV5QW10OiAnMCcsXG4gIGFtb3VudDogJzAnLFxuICBub25jZTogJzAnLFxuICBlZGRzYVNpZzoge1xuICAgIFI4OiBbJzAnLCAnMCddLFxuICAgIFM6ICcwJyxcbiAgfSxcbiAgZWNkc2FTaWc6ICcwJyxcbiAgYXJnMDogJzAnLFxuICBhcmcxOiAnMCcsXG4gIGFyZzI6ICcwJyxcbiAgYXJnMzogJzAnLFxuICBhcmc0OiAnMCcsXG4gIGZlZTogJzAnLFxuICBmZWVUb2tlbjogJzAnLFxuICB0c1B1YktleVg6ICcnLFxuICB0c1B1YktleVk6ICcnLFxuICBibG9ja051bWJlcjogbnVsbCxcbiAgbWV0YWRhdGE6IG51bGwsXG4gIHR4U3RhdHVzOiBUU19TVEFUVVMuUEVORElORyxcbiAgTDJBY2NvdW50SW5mbzoge30gYXMgYW55LFxuICBibG9ja0luZm86IHt9IGFzIGFueSxcbiAgbWF0Y2hlZE9yZGVyOiBudWxsLFxuICAvLyBtYXRjaGVkT3JkZXIyOiBudWxsLFxuICBjcmVhdGVkQXQ6IG5ldyBEYXRlKDApLFxuICBjcmVhdGVkQnk6IG51bGwsXG4gIHVwZGF0ZWRBdDogbmV3IERhdGUoMCksXG4gIHVwZGF0ZWRCeTogbnVsbCxcbiAgZGVsZXRlZEF0OiBudWxsLFxuICBkZWxldGVkQnk6IG51bGwsXG4gIHRva2VuQWRkcjogVHNUb2tlbkFkZHJlc3MuVW5rbm93bixcbn07XG4iLCJpbXBvcnQgeyBPYnNPcmRlckxlYWZFbmNvZGVUeXBlIH0gZnJvbSAnQHRzLXNkay9kb21haW4vbGliL3RzLXR5cGVzL3RzLXR5cGVzJztcbmltcG9ydCB7IENvbHVtbiwgRW50aXR5LCBKb2luQ29sdW1uLCBPbmVUb09uZSwgUHJpbWFyeUNvbHVtbiwgUHJpbWFyeUdlbmVyYXRlZENvbHVtbiB9IGZyb20gJ3R5cGVvcm0nO1xuaW1wb3J0IHsgT2JzT3JkZXJFbnRpdHkgfSBmcm9tICcuL29ic09yZGVyLmVudGl0eSc7XG5pbXBvcnQgeyBPYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZSB9IGZyb20gJy4vb2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUuZW50aXR5JztcbmltcG9ydCB7IHRvVHJlZUxlYWYgfSBmcm9tICcuLi8uLi8uLi8uLi90cy1zZGsvc3JjL2RvbWFpbi9saWIvdHMtcm9sbHVwL3RzLWhlbHBlcic7XG5pbXBvcnQgeyBVcGRhdGVPYnNPcmRlclRyZWVEdG8gfSBmcm9tICcuL2R0by91cGRhdGVPYnNPcmRlclRyZWUuZHRvJztcblxuQEVudGl0eSgnT2JzT3JkZXJMZWFmJywgeyBzY2hlbWE6ICdwdWJsaWMnIH0pXG5leHBvcnQgY2xhc3MgT2JzT3JkZXJMZWFmRW50aXR5IHtcbiAgQFByaW1hcnlDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnb3JkZXJMZWFmSWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBvcmRlckxlYWZJZCE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2ludDgnLFxuICAgIG5hbWU6ICd0eElkJyxcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgfSlcbiAgdHhJZCE6IG51bWJlciB8IG51bGw7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBuYW1lOiAncmVxVHlwZScsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDAsXG4gIH0pXG4gIHJlcVR5cGUhOiBudW1iZXI7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnc2VuZGVyJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgc2VuZGVyITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ3NlbGxUb2tlbklkJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgc2VsbFRva2VuSWQhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnc2VsbEFtdCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIHNlbGxBbXQhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnbm9uY2UnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBub25jZSE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdidXlUb2tlbklkJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgYnV5VG9rZW5JZCE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdidXlBbXQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBidXlBbXQhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYWNjdW11bGF0ZWRTZWxsQW10JyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgYWNjdW11bGF0ZWRTZWxsQW10ITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2FjY3VtdWxhdGVkQnV5QW10JyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgYWNjdW11bGF0ZWRCdXlBbXQhOiBzdHJpbmc7XG4gIC8vIEBDb2x1bW4oe1xuICAvLyAgIHR5cGU6ICdpbnQ4JyxcbiAgLy8gICBuYW1lOiAnb3JkZXJJZCcsXG4gIC8vICAgbnVsbGFibGU6IGZhbHNlLFxuICAvLyAgIGRlZmF1bHQ6IDAsXG4gIC8vIH0pXG4gIC8vIG9yZGVySWQhOiBudW1iZXI7XG4gIC8vIEBPbmVUb09uZSgoKSA9PiBPYnNPcmRlckVudGl0eSwgKG9ic09yZGVyKSA9PiBvYnNPcmRlci5vYnNPcmRlckxlYWYsIHtcbiAgLy8gICBvbkRlbGV0ZTogJ1JFU1RSSUNUJyxcbiAgLy8gICBvblVwZGF0ZTogJ0NBU0NBREUnLFxuICAvLyB9KVxuICAvLyBASm9pbkNvbHVtbih7XG4gIC8vICAgbmFtZTogJ29yZGVySWQnLFxuICAvLyAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAnaWQnLFxuICAvLyB9KVxuICAvLyBvYnNPcmRlciE6IE9ic09yZGVyRW50aXR5O1xuICBAT25lVG9PbmUoKCkgPT4gT2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUsIChvYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZTogT2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUpID0+IG9ic09yZGVyTGVhZk1lcmtsZVRyZWVOb2RlLmxlYWYsIHtcbiAgICBvbkRlbGV0ZTogJ1JFU1RSSUNUJyxcbiAgICBvblVwZGF0ZTogJ0NBU0NBREUnLFxuICB9KVxuICBASm9pbkNvbHVtbih7XG4gICAgbmFtZTogJ29yZGVyTGVhZklkJyxcbiAgICByZWZlcmVuY2VkQ29sdW1uTmFtZTogJ2xlYWZJZCcsXG4gIH0pXG4gIG1lcmtsZVRyZWVOb2RlITogT2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGU7XG5cbiAgZW5jb2RlKCk6IE9ic09yZGVyTGVhZkVuY29kZVR5cGUge1xuICAgIHJldHVybiBbXG4gICAgICBCaWdJbnQodGhpcy5yZXFUeXBlKSxcbiAgICAgIEJpZ0ludCh0aGlzLnNlbmRlciksXG4gICAgICBCaWdJbnQodGhpcy5zZWxsVG9rZW5JZCksXG4gICAgICBCaWdJbnQodGhpcy5zZWxsQW10KSxcbiAgICAgIEJpZ0ludCh0aGlzLm5vbmNlKSxcbiAgICAgIDBuLFxuICAgICAgMG4sXG4gICAgICBCaWdJbnQodGhpcy5idXlUb2tlbklkKSxcbiAgICAgIEJpZ0ludCh0aGlzLmJ1eUFtdCksXG4gICAgICAwbixcbiAgICAgIEJpZ0ludCh0aGlzLnR4SWQgfHwgMCksXG4gICAgICBCaWdJbnQodGhpcy5hY2N1bXVsYXRlZFNlbGxBbXQpLFxuICAgICAgQmlnSW50KHRoaXMuYWNjdW11bGF0ZWRCdXlBbXQpLFxuICAgIF07XG4gIH1cbiAgZW5jb2RlTGVhZigpIHtcbiAgICByZXR1cm4gdG9UcmVlTGVhZih0aGlzLmVuY29kZSgpKTtcbiAgfVxuXG4gIGNvbnZlcnRUb09ic09yZGVyRHRvKCk6IFVwZGF0ZU9ic09yZGVyVHJlZUR0byB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9yZGVyTGVhZklkOiB0aGlzLm9yZGVyTGVhZklkLFxuICAgICAgdHhJZDogU3RyaW5nKHRoaXMudHhJZCkgfHwgJzAnLFxuICAgICAgcmVxVHlwZTogdGhpcy5yZXFUeXBlLnRvU3RyaW5nKCksXG4gICAgICBzZW5kZXI6IHRoaXMuc2VuZGVyLFxuICAgICAgc2VsbFRva2VuSWQ6IHRoaXMuc2VsbFRva2VuSWQsXG4gICAgICBub25jZTogdGhpcy5ub25jZSxcbiAgICAgIHNlbGxBbXQ6IHRoaXMuc2VsbEFtdCxcbiAgICAgIGJ1eVRva2VuSWQ6IHRoaXMuYnV5VG9rZW5JZCxcbiAgICAgIGJ1eUFtdDogdGhpcy5idXlBbXQsXG4gICAgICBhY2N1bXVsYXRlZFNlbGxBbXQ6IHRoaXMuYWNjdW11bGF0ZWRTZWxsQW10LFxuICAgICAgYWNjdW11bGF0ZWRCdXlBbXQ6IHRoaXMuYWNjdW11bGF0ZWRCdXlBbXQsXG4gICAgLy8gb3JkZXJJZCE6IHN0cmluZztcbiAgICB9O1xuICB9XG59XG4iLCJpbXBvcnQgeyBDb2x1bW4sIEVudGl0eSwgSm9pbkNvbHVtbiwgT25lVG9PbmUsIFByaW1hcnlDb2x1bW4gfSBmcm9tICd0eXBlb3JtJztcbmltcG9ydCB7IE9ic09yZGVyRW50aXR5IH0gZnJvbSAnLi9vYnNPcmRlci5lbnRpdHknO1xuaW1wb3J0IHsgT2JzT3JkZXJMZWFmRW50aXR5IH0gZnJvbSAnLi9vYnNPcmRlckxlYWYuZW50aXR5JztcblxuQEVudGl0eSgnT2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUnLCB7IHNjaGVtYTogJ3B1YmxpYycgfSkgXG5leHBvcnQgY2xhc3MgT2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUge1xuICBAUHJpbWFyeUNvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdpZCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBwcmltYXJ5OiB0cnVlLFxuICB9KVxuICBpZCE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdoYXNoJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgaGFzaCE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdsZWFmSWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IHRydWVcbiAgfSlcbiAgbGVhZklkITogc3RyaW5nIHwgbnVsbDtcbiAgQE9uZVRvT25lKFxuICAgICgpID0+IE9ic09yZGVyTGVhZkVudGl0eSxcbiAgICAob2JzT3JkZXJMZWFmOiBPYnNPcmRlckxlYWZFbnRpdHkpID0+IG9ic09yZGVyTGVhZi5tZXJrbGVUcmVlTm9kZSxcbiAgKVxuICBASm9pbkNvbHVtbih7XG4gICAgbmFtZTogJ2xlYWZJZCcsXG4gICAgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICdvcmRlckxlYWZJZCdcbiAgfSlcbiAgbGVhZiE6IE9ic09yZGVyTGVhZkVudGl0eSB8IG51bGw7XG59IiwiaW1wb3J0IHsgQ29sdW1uLCBFbnRpdHksIFByaW1hcnlHZW5lcmF0ZWRDb2x1bW4gfSBmcm9tICd0eXBlb3JtJztcblxuQEVudGl0eSgnQ2FuZGxlU3RpY2snLCB7c2NoZW1hOiAncHVibGljJ30pXG5leHBvcnQgY2xhc3MgQ2FuZGxlU3RpY2tFbnRpdHkge1xuICBAUHJpbWFyeUdlbmVyYXRlZENvbHVtbih7XG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIG5hbWU6ICdpZCdcbiAgfSlcbiAgaWQhOiBudW1iZXI7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd0aW1lc3RhbXAgd2l0aG91dCB0aW1lIHpvbmUnLFxuICAgIG5hbWU6ICd0aW1lc3RhbXAnLFxuICAgIHByZWNpc2lvbjogMyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogJ25vdygpJ1xuICB9KVxuICB0aW1lc3RhbXAhOiBEYXRlO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ21heFByaWNlJyxcbiAgICBsZW5ndGg6ICczMDAnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAnMCdcbiAgfSlcbiAgbWF4UHJpY2UhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAnbWluUHJpY2UnLFxuICAgIGxlbmd0aDogJzMwMCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6ICcwJ1xuICB9KVxuICBtaW5QcmljZSE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdvcGVuUHJpY2UnLFxuICAgIGxlbmd0aDogJzMwMCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6ICcwJ1xuICB9KVxuICBvcGVuUHJpY2UhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAnY2xvc2VQcmljZScsXG4gICAgbGVuZ3RoOiAnMzAwJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogJzAnXG4gIH0pXG4gIGNsb3NlUHJpY2UhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAndm9sdW1lJyxcbiAgICBsZW5ndGg6ICczMDAnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAnMCdcbiAgfSlcbiAgdm9sdW1lITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ21hcmtldFBhaXInLFxuICAgIGxlbmd0aDogJzMwMCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6ICdcXCdFVEgvVVNEQ1xcJydcbiAgfSlcbiAgbWFya2V0UGFpciE6IHN0cmluZztcbn0iLCJpbXBvcnQgeyBDb2x1bW4sIEVudGl0eSwgUHJpbWFyeUdlbmVyYXRlZENvbHVtbiB9IGZyb20gJ3R5cGVvcm0nO1xuXG5ARW50aXR5KCdNYXJrZXRQYWlySW5mbycsIHtzY2hlbWE6ICdwdWJsaWMnfSlcbmV4cG9ydCBjbGFzcyBNYXJrZXRQYWlySW5mb0VudGl0eSB7XG4gIEBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgbmFtZTogJ2lkJ1xuICB9KVxuICBpZCE6IG51bWJlcjtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdtYWluVG9rZW5JZCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBkZWZhdWx0OiAwbixcbiAgICBudWxsYWJsZTogZmFsc2VcbiAgfSlcbiAgbWFpblRva2VuSWQhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYmFzZVRva2VuSWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgZGVmYXVsdDogMG4sXG4gICAgbnVsbGFibGU6IGZhbHNlXG4gIH0pXG4gIGJhc2VUb2tlbklkITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ21hcmtldFBhaXInLFxuICAgIGxlbmd0aDogJzEwMCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6ICgpID0+ICdFVEgvVVNEQydcbiAgfSlcbiAgbWFya2V0UGFpciE6IHN0cmluZztcbn0iLCJpbXBvcnQgeyBJbmplY3RhYmxlLCBOb3RGb3VuZEV4Y2VwdGlvbiB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IEluamVjdFJlcG9zaXRvcnkgfSBmcm9tICdAbmVzdGpzL3R5cGVvcm0nO1xuaW1wb3J0IHsgUmVwb3NpdG9yeSB9IGZyb20gJ3R5cGVvcm0nO1xuaW1wb3J0IHsgTWFya2V0UGFpckluZm9SZXF1ZXN0RHRvLCBNYXJrZXRQYWlySW5mb1Jlc3BvbnNlRHRvIH0gZnJvbSAnLi9kdG8vTWFya2V0UGFpckluZm8uZHRvJztcbmltcG9ydCB7IE1hcmtldFBhaXJJbmZvRW50aXR5IH0gZnJvbSAnLi9tYXJrZXRQYWlySW5mby5lbnRpdHknO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWFya2V0UGFpckluZm9TZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdFJlcG9zaXRvcnkoTWFya2V0UGFpckluZm9FbnRpdHkpXG4gICAgcHJpdmF0ZSByZWFkb25seSBtYXJrZXRQYWlySW5mb1JlcG9zaXRvcnk6IFJlcG9zaXRvcnk8TWFya2V0UGFpckluZm9FbnRpdHk+LFxuICApIHt9XG4gIGFzeW5jIGZpbmRPbmVNYXJrZXRQYWlySW5mbyhtYXJrZXRQYWlyRHRvOiBNYXJrZXRQYWlySW5mb1JlcXVlc3REdG8pOiBQcm9taXNlPE1hcmtldFBhaXJJbmZvUmVzcG9uc2VEdG8+IHtcbiAgICBjb25zb2xlLmxvZyhtYXJrZXRQYWlyRHRvKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgbWFya2V0UGFpckluZm8gPSBhd2FpdCB0aGlzLm1hcmtldFBhaXJJbmZvUmVwb3NpdG9yeS5maW5kT25lT3JGYWlsKHtcbiAgICAgICAgc2VsZWN0OiBbJ21haW5Ub2tlbklkJywgJ2Jhc2VUb2tlbklkJywgJ21hcmtldFBhaXInXSxcbiAgICAgICAgd2hlcmU6IFt7XG4gICAgICAgICAgbWFpblRva2VuSWQ6IG1hcmtldFBhaXJEdG8ucGFpcnNbMF0ubWFpblRva2VuSWQsXG4gICAgICAgICAgYmFzZVRva2VuSWQ6IG1hcmtldFBhaXJEdG8ucGFpcnNbMF0uYmFzZVRva2VuSWQsXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBtYWluVG9rZW5JZDogbWFya2V0UGFpckR0by5wYWlyc1sxXS5tYWluVG9rZW5JZCxcbiAgICAgICAgICBiYXNlVG9rZW5JZDogbWFya2V0UGFpckR0by5wYWlyc1sxXS5iYXNlVG9rZW5JZCxcbiAgICAgICAgfV1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG1hcmtldFBhaXJJbmZvO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgTm90Rm91bmRFeGNlcHRpb24oJ01hcmtldFBhaXJJbmZvIG5vdCBmb3VuZCcpO1xuICAgIH1cbiAgfVxufSIsImltcG9ydCB7IHN0cmluZyB9IGZyb20gJ2lvLXRzJztcbmltcG9ydCB7IENvbHVtbiwgUHJpbWFyeUNvbHVtbiwgVmlld0VudGl0eSB9IGZyb20gJ3R5cGVvcm0nO1xuXG5AVmlld0VudGl0eSgnQXZhaWxhYmxlVmlldycsIHtcbiAgc2NoZW1hOiAncHVibGljJyxcbiAgZXhwcmVzc2lvbjogYFxuU0VMRUNUIFxuICBcInRva2VubGVhZlwiLlwiYWNjb3VudElkXCIsXG4gIFwicGVuZGluZ09yZGVyXCIuXCJ0b2tlbklkXCIsXG4gIChcInRva2VubGVhZlwiLlwibG9ja2VkQW10XCIgKyAgXCJwZW5kaW5nT3JkZXJcIi5cInNlbGxBbXRcIikgQVMgXCJsb2NrZWRBbXRcIixcbiAgKFwidG9rZW5sZWFmXCIuXCJhdmFpbGFibGVBbXRcIiAtIFwicGVuZGluZ09yZGVyXCIuXCJzZWxsQW10XCIpIEFTIFwiYXZhaWxhYmxlQW10XCJcbkZST00gKFNFTEVDVCBcbiAgXCJhY2NvdW50SWRcIixcbiAgU1VNKHRpLmFtb3VudCkgQVMgXCJzZWxsQW10XCIsXG4gIFwidG9rZW5JZFwiXG5GUk9NIFwiVHJhbnNhY3Rpb25JbmZvXCIgdGkgXG5XSEVSRSB0aS5cInR4U3RhdHVzXCIgPSAnUEVORElORydcbkdST1VQIEJZIHRpLlwiYWNjb3VudElkXCIsIHRpLlwidG9rZW5JZFwiXG4pIEFTIFwicGVuZGluZ09yZGVyXCJcbkpPSU4gXCJUb2tlbkxlYWZOb2RlXCIgXCJ0b2tlbmxlYWZcIlxuT04gXCJ0b2tlbmxlYWZcIi5cImFjY291bnRJZFwiID0gXCJwZW5kaW5nT3JkZXJcIi5cImFjY291bnRJZFwiIEFORCBcInRva2VubGVhZlwiLlwibGVhZklkXCIgPSBcInBlbmRpbmdPcmRlclwiLlwidG9rZW5JZFwiOyBcbiAgYFxufSlcbmV4cG9ydCBjbGFzcyBBdmFpbGFibGVWaWV3RW50aXR5IHtcbiAgQFByaW1hcnlDb2x1bW4oe1xuICAgIG5hbWU6ICdhY2NvdW50SWQnLFxuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwXG4gIH0pXG4gIGFjY291bnRJZCE6IHN0cmluZztcbiAgQFByaW1hcnlDb2x1bW4oe1xuICAgIG5hbWU6ICd0b2tlbklkJyxcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMFxuICB9KVxuICB0b2tlbklkITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICBuYW1lOiAnYXZhaWxhYmxlQW10JyxcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBkZWZhdWx0OiAwblxuICB9KVxuICBhdmFpbGFibGVBbXQhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIG5hbWU6ICdsb2NrZWRBbXQnLFxuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIGRlZmF1bHQ6IDBuXG4gIH0pXG4gIGxvY2tlZEFtdCE6IHN0cmluZztcbn1cbiIsImltcG9ydCB7IEluamVjdGFibGUsIExvZ2dlciB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IENvbmZpZ1NlcnZpY2UgfSBmcm9tICdAbmVzdGpzL2NvbmZpZyc7XG5pbXBvcnQgeyBJbmplY3RSZXBvc2l0b3J5IH0gZnJvbSAnQG5lc3Rqcy90eXBlb3JtJztcbmltcG9ydCB7IENvbm5lY3Rpb24sIFJlcG9zaXRvcnksIEluIH0gZnJvbSAndHlwZW9ybSc7XG5pbXBvcnQgeyBnZXREZWZhdWx0T2JzT3JkZXJMZWFmIH0gZnJvbSAnLi4vYWNjb3VudC9oZWxwZXIvbWtBY2NvdW50LmhlbHBlcic7XG5pbXBvcnQgeyB0b1RyZWVMZWFmLCB0c0hhc2hGdW5jIH0gZnJvbSAnLi4vY29tbW9uL3RzLWhlbHBlcic7XG5pbXBvcnQgeyBUc01lcmtsZVRyZWUgfSBmcm9tICcuLi9jb21tb24vdHNNZXJrbGVUcmVlJztcbmltcG9ydCB7IFVwZGF0ZU9ic09yZGVyVHJlZUR0byB9IGZyb20gJy4vZHRvL3VwZGF0ZU9ic09yZGVyVHJlZS5kdG8nO1xuaW1wb3J0IHsgT2JzT3JkZXJMZWFmRW50aXR5IH0gZnJvbSAnLi9vYnNPcmRlckxlYWYuZW50aXR5JztcbmltcG9ydCB7IE9ic09yZGVyTGVhZk1lcmtsZVRyZWVOb2RlIH0gZnJvbSAnLi9vYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZS5lbnRpdHknO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgT2JzT3JkZXJUcmVlU2VydmljZSBleHRlbmRzIFRzTWVya2xlVHJlZTxPYnNPcmRlckxlYWZFbnRpdHk+IHtcblxuICBwcml2YXRlIGxvZ2dlcjogTG9nZ2VyID0gbmV3IExvZ2dlcihPYnNPcmRlclRyZWVTZXJ2aWNlLm5hbWUpO1xuICBwdWJsaWMgY3VycmVudE9yZGVySWQgPSAxbjtcbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdFJlcG9zaXRvcnkoT2JzT3JkZXJMZWFmRW50aXR5KVxuICAgIHByaXZhdGUgcmVhZG9ubHkgb2JzT3JkZXJMZWFmUmVwb3NpdG9yeTogUmVwb3NpdG9yeTxPYnNPcmRlckxlYWZFbnRpdHk+LFxuICAgIEBJbmplY3RSZXBvc2l0b3J5KE9ic09yZGVyTGVhZk1lcmtsZVRyZWVOb2RlKVxuICAgIHByaXZhdGUgcmVhZG9ubHkgb2JzT3JkZXJNZXJrbGVUcmVlUmVwb3NpdG9yeTogUmVwb3NpdG9yeTxPYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZT4sXG4gICAgcHJpdmF0ZSByZWFkb25seSBjb25uZWN0aW9uOiBDb25uZWN0aW9uLFxuICAgIHByaXZhdGUgY29uZmlnU2VydmljZTogQ29uZmlnU2VydmljZSxcbiAgKSB7XG4gICAgY29uc29sZS50aW1lKCdpbml0IG9yZGVyIHRyZWUnKTtcbiAgICBzdXBlcihjb25maWdTZXJ2aWNlLmdldE9yVGhyb3c8bnVtYmVyPignT1JERVJfVFJFRV9IRUlHSFQnKSwgdHNIYXNoRnVuYyk7XG4gICAgY29uc29sZS50aW1lRW5kKCdpbml0IG9yZGVyIHRyZWUnKTtcbiAgICB0aGlzLnNldExldmVsRGVmYXVsdEhhc2goKTtcbiAgICB0aGlzLnNldEN1cnJlbnRPcmRlcklkKCk7XG4gIH1cbiAgYXN5bmMgc2V0Q3VycmVudE9yZGVySWQoKSB7XG4gICAgYXdhaXQgdGhpcy51cGRhdGVMZWFmKCcwJywge1xuICAgICAgb3JkZXJMZWFmSWQ6ICcwJyxcbiAgICAgIHR4SWQ6ICcwJyxcbiAgICAgIHJlcVR5cGU6ICcwJyxcbiAgICAgIHNlbmRlcjogJzAnLFxuICAgICAgc2VsbFRva2VuSWQ6ICcwJyxcbiAgICAgIHNlbGxBbXQ6ICcwJyxcbiAgICAgIG5vbmNlOiAnMCcsXG4gICAgICBidXlUb2tlbklkOiAnMCcsXG4gICAgICBidXlBbXQ6ICcwJyxcbiAgICAgIGFjY3VtdWxhdGVkU2VsbEFtdDogJzAnLFxuICAgICAgYWNjdW11bGF0ZWRCdXlBbXQ6ICcwJyxcbiAgICB9KTtcbiAgICBjb25zdCBsYXN0ID0gYXdhaXQgdGhpcy5vYnNPcmRlckxlYWZSZXBvc2l0b3J5LmNvdW50KHtcbiAgICAgIG9yZGVyOiB7XG4gICAgICAgIG9yZGVyTGVhZklkOiAnREVTQydcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgdGhpcy5jdXJyZW50T3JkZXJJZCA9IEJpZ0ludChsYXN0KSArIDFuO1xuICB9XG4gIGFzeW5jIGFkZEN1cnJlbnRPcmRlcklkKCkge1xuICAgIHRoaXMuY3VycmVudE9yZGVySWQgKz0gMW47XG4gIH1cbiAgYXN5bmMgdXBkYXRlTGVhZihsZWFmSWQ6IHN0cmluZywgdmFsdWU6IFVwZGF0ZU9ic09yZGVyVHJlZUR0bykge1xuICAgIGNvbnNvbGUudGltZSgndXBkYXRlTGVhZiBmb3Igb2JzT3JkZXIgdHJlZScpO1xuICAgIGNvbnN0IHByZiA9IHRoaXMuZ2V0UHJvb2ZJZHMobGVhZklkKTtcbiAgICBjb25zdCBpZCA9IHRoaXMuZ2V0TGVhZklkSW5UcmVlKGxlYWZJZCk7XG4gICAgLy8gc2V0dXAgdHJhbnNhY3Rpb25cbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24udHJhbnNhY3Rpb24oYXN5bmMgKG1hbmFnZXIpID0+IHtcbiAgICAgIGF3YWl0IG1hbmFnZXIudXBzZXJ0KE9ic09yZGVyTGVhZk1lcmtsZVRyZWVOb2RlLCB7XG4gICAgICAgIGlkOiBpZC50b1N0cmluZygpLFxuICAgICAgICBsZWFmSWQ6IGxlYWZJZCxcbiAgICAgICAgaGFzaDogQmlnSW50KHRvVHJlZUxlYWYoW1xuICAgICAgICAgIEJpZ0ludCh2YWx1ZS5yZXFUeXBlKSxcbiAgICAgICAgICBCaWdJbnQodmFsdWUuc2VuZGVyKSxcbiAgICAgICAgICBCaWdJbnQodmFsdWUuc2VsbFRva2VuSWQpLFxuICAgICAgICAgIEJpZ0ludCh2YWx1ZS5zZWxsQW10KSxcbiAgICAgICAgICBCaWdJbnQodmFsdWUubm9uY2UpLFxuICAgICAgICAgIDBuLCAwbixcbiAgICAgICAgICBCaWdJbnQodmFsdWUuYnV5VG9rZW5JZCksXG4gICAgICAgICAgQmlnSW50KHZhbHVlLmJ1eUFtdCksXG4gICAgICAgICAgMG4sXG4gICAgICAgICAgQmlnSW50KHZhbHVlLnR4SWQpLFxuICAgICAgICAgIEJpZ0ludCh2YWx1ZS5hY2N1bXVsYXRlZFNlbGxBbXQpLFxuICAgICAgICAgIEJpZ0ludCh2YWx1ZS5hY2N1bXVsYXRlZEJ1eUFtdCksXG4gICAgICAgIF0pKS50b1N0cmluZygpXG4gICAgICB9LCBbJ2lkJ10pO1xuICAgICAgYXdhaXQgbWFuYWdlci51cHNlcnQoT2JzT3JkZXJMZWFmRW50aXR5LCB7XG4gICAgICAgIG9yZGVyTGVhZklkOih2YWx1ZS5vcmRlckxlYWZJZCksXG4gICAgICAgIHR4SWQ6IE51bWJlcih2YWx1ZS50eElkKSxcbiAgICAgICAgcmVxVHlwZTogTnVtYmVyKHZhbHVlLnJlcVR5cGUpLFxuICAgICAgICBzZW5kZXI6ICh2YWx1ZS5zZW5kZXIpLFxuICAgICAgICBzZWxsVG9rZW5JZDogKHZhbHVlLnNlbGxUb2tlbklkKSxcbiAgICAgICAgc2VsbEFtdDogKHZhbHVlLnNlbGxBbXQpLFxuICAgICAgICBub25jZTogKHZhbHVlLm5vbmNlKSxcbiAgICAgICAgYnV5VG9rZW5JZDogKHZhbHVlLmJ1eVRva2VuSWQpLFxuICAgICAgICBidXlBbXQ6ICh2YWx1ZS5idXlBbXQpLFxuICAgICAgICBhY2N1bXVsYXRlZFNlbGxBbXQ6ICh2YWx1ZS5hY2N1bXVsYXRlZFNlbGxBbXQpLFxuICAgICAgICBhY2N1bXVsYXRlZEJ1eUFtdDogKHZhbHVlLmFjY3VtdWxhdGVkQnV5QW10KSxcbiAgICAgICAgLy8gb3JkZXJJZDogTnVtYmVyKHZhbHVlLm9yZGVySWQpXG4gICAgICB9LCBbJ29yZGVyTGVhZklkJ10pO1xuICAgICAgLy8gdXBkYXRlIHRyZWVcbiAgICAgIGZvciAobGV0IGkgPSBpZCwgaiA9IDA7IGkgPiAxbjsgaSA9IGkgPj4gMW4pIHtcbiAgICAgICAgY29uc3QgW2lWYWx1ZSwgalZhbHVlXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICB0aGlzLm9ic09yZGVyTWVya2xlVHJlZVJlcG9zaXRvcnkuZmluZE9uZUJ5KHtpZDogaS50b1N0cmluZygpfSksXG4gICAgICAgICAgdGhpcy5vYnNPcmRlck1lcmtsZVRyZWVSZXBvc2l0b3J5LmZpbmRPbmVCeSh7aWQ6IHByZltqXS50b1N0cmluZygpfSlcbiAgICAgICAgXSk7XG4gICAgICAgIGNvbnN0IGpMZXZlbCA9IE1hdGguZmxvb3IoTWF0aC5sb2cyKE51bWJlcihwcmZbal0pKSk7XG4gICAgICAgIGNvbnN0IGlMZXZlbCA9IE1hdGguZmxvb3IoTWF0aC5sb2cyKE51bWJlcihpKSkpO1xuICAgICAgICBjb25zdCBqSGFzaFZhbHVlOiBzdHJpbmcgPSAoalZhbHVlID09IG51bGwpPyB0aGlzLmdldERlZmF1bHRIYXNoQnlMZXZlbChqTGV2ZWwpOiBqVmFsdWUuaGFzaC50b1N0cmluZygpO1xuICAgICAgICBjb25zdCBpSGFzaFZhbHVlOiBzdHJpbmcgPSAoaVZhbHVlID09IG51bGwpPyB0aGlzLmdldERlZmF1bHRIYXNoQnlMZXZlbChpTGV2ZWwpOiBpVmFsdWUuaGFzaC50b1N0cmluZygpO1xuICAgICAgICBjb25zdCByID0gKGlkICUgMm4gPT0gMG4pID9bIGpIYXNoVmFsdWUsIGlIYXNoVmFsdWVdIDogWyBpSGFzaFZhbHVlLCBqSGFzaFZhbHVlXTtcbiAgICAgICAgY29uc3QgaGFzaERlY1N0cmluZyA9IEJpZ0ludCh0aGlzLmhhc2hGdW5jKHIpKS50b1N0cmluZygpO1xuICAgICAgICBjb25zdCBqb2JzID0gW107XG4gICAgICAgIGlmIChpVmFsdWUgPT0gbnVsbCkge1xuICAgICAgICAgIGpvYnMucHVzaChtYW5hZ2VyLnVwc2VydChPYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZSwge1xuICAgICAgICAgICAgaWQ6IGkudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIGhhc2g6IChpSGFzaFZhbHVlKVxuICAgICAgICAgIH0sIFsnaWQnXSkpO1xuICAgICAgICB9IFxuICAgICAgICBpZiAoalZhbHVlID09IG51bGwgJiYgaiA8IHByZi5sZW5ndGgpIHtcbiAgICAgICAgICBqb2JzLnB1c2gobWFuYWdlci51cHNlcnQoT2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUsIHtcbiAgICAgICAgICAgIGlkOiBwcmZbal0udG9TdHJpbmcoKSxcbiAgICAgICAgICAgIGhhc2g6IChqSGFzaFZhbHVlKVxuICAgICAgICAgIH0sIFsnaWQnXSkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVwZGF0ZVJvb3QgPSBpID4+IDFuO1xuICAgICAgICBpZiAoIHVwZGF0ZVJvb3QgPj0gMW4pIHtcbiAgICAgICAgICBqb2JzLnB1c2gobWFuYWdlci51cHNlcnQoT2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUsIHtcbiAgICAgICAgICAgIGlkOiB1cGRhdGVSb290LnRvU3RyaW5nKCksXG4gICAgICAgICAgICBoYXNoOiBoYXNoRGVjU3RyaW5nXG4gICAgICAgICAgfSwgWydpZCddKSk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoam9icyk7XG4gICAgICAgIGorKztcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zb2xlLnRpbWVFbmQoJ3VwZGF0ZUxlYWYgZm9yIG9ic09yZGVyIHRyZWUnKTtcbiAgfVxuICBhc3luYyBnZXRMZWFmKGxlYWZfaWQ6IHN0cmluZyk6IFByb21pc2U8T2JzT3JkZXJMZWFmRW50aXR5IHwgbnVsbD4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMub2JzT3JkZXJMZWFmUmVwb3NpdG9yeS5maW5kT25lQnkoe1xuICAgICAgb3JkZXJMZWFmSWQ6IGxlYWZfaWRcbiAgICB9KTtcbiAgICBpZiAocmVzdWx0ID09IG51bGwpIHtcbiAgICAgIC8vIGNoZWNrIGxldmVsXG4gICAgICBjb25zdCBpZCA9IHRoaXMuZ2V0TGVhZklkSW5UcmVlKGxlYWZfaWQpO1xuICAgICAgY29uc3QgbGV2ZWwgPSBNYXRoLmZsb29yKE1hdGgubG9nMihOdW1iZXIoaWQpKSk7XG4gICAgICBjb25zdCBoYXNoRGVjU3RyaW5nID0gQmlnSW50KHRoaXMuZ2V0RGVmYXVsdEhhc2hCeUxldmVsKGxldmVsKSkudG9TdHJpbmcoKTtcbiAgICAgIC8vIHNldHVwIHRyYW5zYWN0aW9uXG4gICAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24udHJhbnNhY3Rpb24oYXN5bmMgKG1hbmFnZXIpID0+IHtcbiAgICAgICAgLy8gaW5zZXJ0IHRoaXMgbnVsbCBoYXNoIG9uIHRoaXMgbm9kZVxuICAgICAgICBhd2FpdCBtYW5hZ2VyLmluc2VydChPYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZSwge1xuICAgICAgICAgIGxlYWZJZDogbGVhZl9pZCxcbiAgICAgICAgICBpZDogaWQudG9TdHJpbmcoKSxcbiAgICAgICAgICBoYXNoOiBoYXNoRGVjU3RyaW5nLFxuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgbWFuYWdlci5pbnNlcnQoT2JzT3JkZXJMZWFmRW50aXR5LCB7XG4gICAgICAgICAgb3JkZXJMZWFmSWQ6IGxlYWZfaWQsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcy5vYnNPcmRlckxlYWZSZXBvc2l0b3J5LmZpbmRPbmVCeSh7XG4gICAgICAgIG9yZGVyTGVhZklkOiBsZWFmX2lkXG4gICAgICB9KTsgXG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgYXN5bmMgZ2V0Um9vdCgpIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLm9ic09yZGVyTWVya2xlVHJlZVJlcG9zaXRvcnkuZmluZE9uZSh7XG4gICAgICB3aGVyZToge1xuICAgICAgICBpZDogMW4udG9TdHJpbmcoKSxcbiAgICAgIH0gICAgICAgXG4gICAgfSk7XG4gICAgaWYgKHJlc3VsdCA9PSBudWxsKSB7XG4gICAgICBjb25zdCBoYXNoRGVjU3RyaW5nID0gQmlnSW50KHRoaXMuZ2V0RGVmYXVsdEhhc2hCeUxldmVsKDEpKS50b1N0cmluZygpO1xuICAgICAgYXdhaXQgdGhpcy5vYnNPcmRlck1lcmtsZVRyZWVSZXBvc2l0b3J5Lmluc2VydCh7XG4gICAgICAgIGlkOiAxbi50b1N0cmluZygpLFxuICAgICAgICBoYXNoOiBoYXNoRGVjU3RyaW5nLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpZDogMW4udG9TdHJpbmcoKSxcbiAgICAgICAgaGFzaDogaGFzaERlY1N0cmluZ1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiByZXN1bHQuaWQsXG4gICAgICBoYXNoOiByZXN1bHQuaGFzaC50b1N0cmluZygpXG4gICAgfTtcbiAgfVxuICBnZXREZWZhdWx0Um9vdCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmdldERlZmF1bHRIYXNoQnlMZXZlbCgxKTtcbiAgfVxuICBnZXRMZWFmRGVmYXVsdFZhdmx1ZSgpOiBzdHJpbmcge1xuICAgIC8vIFRPRE86IEBhYm5lciBwbGVhc2UgaGVscCBtZSB0byBjaGVjayBpcyB0aGUgb3JkZXIgaXMgcmlnaHQ/XG4gICAgcmV0dXJuIGdldERlZmF1bHRPYnNPcmRlckxlYWYoKTtcbiAgfVxuXG5cbiAgYXN5bmMgZ2V0TWVya2xlclByb29mKGxlYWZJZDogc3RyaW5nKTogUHJvbWlzZTxiaWdpbnRbXT4ge1xuICAgIGNvbnN0IGlkcyA9IHRoaXMuZ2V0UHJvb2ZJZHMobGVhZklkKTtcbiAgICBjb25zdCByID0gYXdhaXQgdGhpcy5vYnNPcmRlck1lcmtsZVRyZWVSZXBvc2l0b3J5LmZpbmQoe1xuICAgICAgd2hlcmU6IHtcbiAgICAgICAgaWQ6IEluKGlkcy5tYXAoaWQgPT4gaWQudG9TdHJpbmcoKSkpXG4gICAgICB9LFxuICAgICAgb3JkZXI6IHtcbiAgICAgICAgaWQ6ICdBU0MnXG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHIubWFwKGl0ZW0gPT4gQmlnSW50KGl0ZW0uaGFzaCkpO1xuICB9XG59IiwiaW1wb3J0IHsgR2xvYmFsLCBNb2R1bGUgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBUeXBlT3JtTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy90eXBlb3JtJztcbmltcG9ydCB7IFJvbGx1cEluZm9ybWF0aW9uIH0gZnJvbSAnLi9yb2xsdXBJbmZvcm1hdGlvbi5lbnRpdHknO1xuQEdsb2JhbCgpXG5ATW9kdWxlKHtcbiAgaW1wb3J0czogW1R5cGVPcm1Nb2R1bGUuZm9yRmVhdHVyZShbUm9sbHVwSW5mb3JtYXRpb25dKV0sXG4gIGV4cG9ydHM6IFtUeXBlT3JtTW9kdWxlXVxufSlcbmV4cG9ydCBjbGFzcyBSb2xsdXBNb2R1bGUge30iLCJpbXBvcnQgeyBub3cgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgZ2V0UHJvY2Vzc05hbWUgfSBmcm9tICcuLi8uLi8uLi8uLi90cy1zZGsvc3JjL2hlbHBlcic7XG5pbXBvcnQge1xuICBCZWZvcmVJbnNlcnQsXG4gIEJlZm9yZVJlbW92ZSxcbiAgQmVmb3JlVXBkYXRlLFxuICBDb2x1bW4sXG4gIENyZWF0ZURhdGVDb2x1bW4sXG4gIERlbGV0ZURhdGVDb2x1bW4sXG4gIEVudGl0eSxcbiAgUHJpbWFyeUNvbHVtbixcbiAgVXBkYXRlRGF0ZUNvbHVtbixcbn0gZnJvbSAndHlwZW9ybSc7XG5cbkBFbnRpdHkoJ1JvbGx1cEluZm9ybWF0aW9uJywgeyBzY2hlbWE6ICdwdWJsaWMnIH0pXG5leHBvcnQgY2xhc3MgUm9sbHVwSW5mb3JtYXRpb24ge1xuICBAUHJpbWFyeUNvbHVtbih7XG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIG5hbWU6ICdpZCcsXG4gICAgcHJpbWFyeTogdHJ1ZSxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZ2VuZXJhdGVkOiAnaW5jcmVtZW50JyxcbiAgfSlcbiAgaWQhOiBudW1iZXI7XG5cbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIG5hbWU6ICdsYXN0U3luY0Jsb2NrbnVtYmVyRm9yUmVnaXN0ZXJFdmVudCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICB9KVxuICBsYXN0U3luY0Jsb2NrbnVtYmVyRm9yUmVnaXN0ZXJFdmVudCE6IG51bWJlcjtcblxuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgbmFtZTogJ2xhc3RTeW5jQmxvY2tudW1iZXJGb3JEZXBvc2l0RXZlbnQnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgfSlcbiAgbGFzdFN5bmNCbG9ja251bWJlckZvckRlcG9zaXRFdmVudCE6IG51bWJlcjtcblxuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2N1cnJlbnRPcmRlcklkJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAnMCcsXG4gIH0pXG4gIGN1cnJlbnRPcmRlcklkITogc3RyaW5nO1xuXG4gIEBDcmVhdGVEYXRlQ29sdW1uKHtcbiAgICB0eXBlOiAndGltZXN0YW1wIHdpdGhvdXQgdGltZSB6b25lJyxcbiAgICBuYW1lOiAnY3JlYXRlZEF0JyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogJ25vdygpJyxcbiAgfSlcbiAgY3JlYXRlZEF0ITogRGF0ZTtcbiAgQFVwZGF0ZURhdGVDb2x1bW4oe1xuICAgIHR5cGU6ICd0aW1lc3RhbXAgd2l0aG91dCB0aW1lIHpvbmUnLFxuICAgIG5hbWU6ICd1cGRhdGVkQXQnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiBub3coKSxcbiAgfSlcbiAgdXBkYXRlZEF0ITogRGF0ZTtcbiAgQERlbGV0ZURhdGVDb2x1bW4oe1xuICAgIHR5cGU6ICd0aW1lc3RhbXAgd2l0aG91dCB0aW1lIHpvbmUnLFxuICAgIG5hbWU6ICdkZWxldGVkQXQnLFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICB9KVxuICBkZWxldGVkQXQhOiBEYXRlO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ3VwZGF0ZWRCeScsXG4gICAgbGVuZ3RoOiAyNTYsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICB9KVxuICB1cGRhdGVkQnkhOiBzdHJpbmcgfCBudWxsO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ2RlbGV0ZWRCeScsXG4gICAgbGVuZ3RoOiAyNTYsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gIH0pXG4gIGRlbGV0ZWRCeSE6IHN0cmluZyB8IG51bGw7XG5cbiAgQEJlZm9yZUluc2VydCgpXG4gIEBCZWZvcmVVcGRhdGUoKVxuICBzZXRVcGRhdGVkQnkoKSB7XG4gICAgdGhpcy51cGRhdGVkQnkgPSBnZXRQcm9jZXNzTmFtZSgpO1xuICB9XG5cbiAgQEJlZm9yZVJlbW92ZSgpXG4gIHNldERlbGV0ZWRCeSgpIHtcbiAgICB0aGlzLmRlbGV0ZWRCeSA9IGdldFByb2Nlc3NOYW1lKCk7XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxvZGFzaFwiKTs7IiwiLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1hcmd1bWVudCAqL1xuaW1wb3J0IHsgWmtPQlMgfSBmcm9tICcuLi8uLi8uLi90cy1jb250cmFjdC10eXBlcy9jb250cmFjdHMvWmtPQlMnO1xuaW1wb3J0IHsgUGlub0xvZ2dlclNlcnZpY2UgfSBmcm9tICdAY29tbW9uL2xvZ2dlci9hZGFwdGVycy9yZWFsL3Bpbm9Mb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBJbmplY3RhYmxlLCBTY29wZSB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IENvbmZpZ1NlcnZpY2UgfSBmcm9tICdAbmVzdGpzL2NvbmZpZyc7XG5pbXBvcnQgeyBJbmplY3RSZXBvc2l0b3J5IH0gZnJvbSAnQG5lc3Rqcy90eXBlb3JtJztcbmltcG9ydCB7IFRyYW5zYWN0aW9uSW5mbyB9IGZyb20gJ2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L3RyYW5zYWN0aW9uSW5mby5lbnRpdHknO1xuaW1wb3J0IHsgQmlnTnVtYmVyLCBXYWxsZXQgfSBmcm9tICdldGhlcnMnO1xuaW1wb3J0IHsgSW5qZWN0U2lnbmVyUHJvdmlkZXIsIEV0aGVyc1NpZ25lciwgSW5qZWN0Q29udHJhY3RQcm92aWRlciwgRXRoZXJzQ29udHJhY3QsIFRyYW5zYWN0aW9uUmVzcG9uc2UgfSBmcm9tICduZXN0anMtZXRoZXJzJztcbmltcG9ydCB7IENvbm5lY3Rpb24sIFJlcG9zaXRvcnkgfSBmcm9tICd0eXBlb3JtJztcbmltcG9ydCAqIGFzIEFCSSBmcm9tICcuLi9kb21haW4vdmVyaWZpZWQtYWJpLmpzb24nO1xuXG5pbXBvcnQgeyBSb2xsdXBJbmZvcm1hdGlvbiB9IGZyb20gJ2NvbW1vbi90cy10eXBlb3JtL3NyYy9yb2xsdXAvcm9sbHVwSW5mb3JtYXRpb24uZW50aXR5JztcbmltcG9ydCB7IFdvcmtlclNlcnZpY2UgfSBmcm9tICdAY29tbW9uL2NsdXN0ZXIvd29ya2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgZmlyc3RWYWx1ZUZyb20gfSBmcm9tICdyeGpzL2ludGVybmFsL2ZpcnN0VmFsdWVGcm9tJztcbmltcG9ydCB7IEFjY291bnRJbmZvcm1hdGlvbiB9IGZyb20gJ0Bjb21tb24vdHMtdHlwZW9ybS9hY2NvdW50L2FjY291bnRJbmZvcm1hdGlvbi5lbnRpdHknO1xuaW1wb3J0IHsgTWVzc2FnZUJyb2tlciB9IGZyb20gJ0Bjb21tb24vZGItcHVic3ViL3BvcnRzL21lc3NhZ2VCcm9rZXInO1xuaW1wb3J0IHsgQ0hBTk5FTCB9IGZyb20gJ0Bjb21tb24vZGItcHVic3ViL2RvbWFpbnMvdmFsdWUtb2JqZWN0cy9wdWJTdWIuY29uc3RhbnRzJztcbmltcG9ydCB7IFRzV29ya2VyTmFtZSB9IGZyb20gJ0B0cy1zZGsvY29uc3RhbnQnO1xuaW1wb3J0IHsgQnVsbFF1ZXVlSW5qZWN0IH0gZnJvbSAnQGFuY2hhbjgyOC9uZXN0LWJ1bGxtcSc7XG5pbXBvcnQgeyBRdWV1ZSB9IGZyb20gJ2J1bGxtcSc7XG5pbXBvcnQgeyBUc1R4VHlwZSB9IGZyb20gJ0B0cy1zZGsvZG9tYWluL2xpYi90cy10eXBlcy90cy10eXBlcyc7XG5pbXBvcnQgeyBUc1Rva2VuQWRkcmVzcyB9IGZyb20gJy4uLy4uLy4uL3RzLXNkay9zcmMvZG9tYWluL2xpYi90cy10eXBlcy90cy10eXBlcyc7XG5ASW5qZWN0YWJsZSh7XG4gIHNjb3BlOiBTY29wZS5ERUZBVUxULFxufSlcbmV4cG9ydCBjbGFzcyBPcGVyYXRvclByb2R1Y2VyIHtcbiAgcHJpdmF0ZSB3YWxsZXQ6IFdhbGxldDtcbiAgcHJpdmF0ZSBjb250cmFjdDogWmtPQlM7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgY29uZmlnOiBDb25maWdTZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgbG9nZ2VyOiBQaW5vTG9nZ2VyU2VydmljZSxcbiAgICBASW5qZWN0U2lnbmVyUHJvdmlkZXIoKSBwcml2YXRlIHJlYWRvbmx5IGV0aGVyc1NpZ25lcjogRXRoZXJzU2lnbmVyLFxuICAgIEBJbmplY3RDb250cmFjdFByb3ZpZGVyKCkgcHJpdmF0ZSByZWFkb25seSBldGhlcnNDb250cmFjdDogRXRoZXJzQ29udHJhY3QsXG4gICAgQEJ1bGxRdWV1ZUluamVjdChUc1dvcmtlck5hbWUuQ09SRSkgcHJpdmF0ZSByZWFkb25seSBjb3JlUXVldWU6IFF1ZXVlLFxuICAgIEBJbmplY3RSZXBvc2l0b3J5KFRyYW5zYWN0aW9uSW5mbykgcHJpdmF0ZSB0eFJlcG9zaXRvcnk6IFJlcG9zaXRvcnk8VHJhbnNhY3Rpb25JbmZvPixcbiAgICBASW5qZWN0UmVwb3NpdG9yeShSb2xsdXBJbmZvcm1hdGlvbikgcHJpdmF0ZSByb2xsdXBJbmZvUmVwb3NpdG9yeTogUmVwb3NpdG9yeTxSb2xsdXBJbmZvcm1hdGlvbj4sXG4gICAgQEluamVjdFJlcG9zaXRvcnkoQWNjb3VudEluZm9ybWF0aW9uKSBwcml2YXRlIGFjY291bnRSZXBvc2l0b3J5OiBSZXBvc2l0b3J5PEFjY291bnRJbmZvcm1hdGlvbj4sXG4gICAgcHJpdmF0ZSByZWFkb25seSBtZXNzYWdlQnJva2VyU2VydmljZTogTWVzc2FnZUJyb2tlcixcbiAgICBcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvbm5lY3Rpb246IENvbm5lY3Rpb24sXG4gICAgcHJpdmF0ZSByZWFkb25seSB3b3JrZXJTZXJ2aWNlOiBXb3JrZXJTZXJ2aWNlLFxuICApIHtcbiAgICB0aGlzLndhbGxldCA9IHRoaXMuZXRoZXJzU2lnbmVyLmNyZWF0ZVdhbGxldCh0aGlzLmNvbmZpZy5nZXQoJ0VUSEVSRVVNX09QRVJBVE9SX1BSSVYnLCAnJykpO1xuICAgIHRoaXMuY29udHJhY3QgPSB0aGlzLmV0aGVyc0NvbnRyYWN0LmNyZWF0ZSh0aGlzLmNvbmZpZy5nZXQoJ0VUSEVSRVVNX1JPTExVUF9DT05UUkFDVF9BRERSJywgJycpLCBBQkksIHRoaXMud2FsbGV0KSBhcyB1bmtub3duIGFzIFprT0JTO1xuXG4gICAgdGhpcy5sb2dnZXIubG9nKHtcbiAgICAgIGFkZHJlc3M6IHRoaXMud2FsbGV0LmFkZHJlc3MsXG4gICAgICBjb250cmFjdDogdGhpcy5jb250cmFjdC5hZGRyZXNzLFxuICAgIH0pO1xuICAgIHRoaXMubGlzdGVuUmVnaXN0ZXJFdmVudCgpO1xuICAgIHRoaXMubGlzdGVuRGVwb3NpdEV2ZW50KCk7IC8vISBuZXdcbiAgfVxuXG4gIGFzeW5jIGxpc3RlblJlZ2lzdGVyRXZlbnQoKSB7XG4gICAgYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy53b3JrZXJTZXJ2aWNlLm9uUmVhZHlPYnNlcnZlcik7XG4gICAgdGhpcy5sb2dnZXIubG9nKGBPcGVyYXRvclByb2R1Y2VyLmxpc3RlblJlZ2lzdGVyRXZlbnQgY29udHJhY3Q9JHt0aGlzLmNvbnRyYWN0LmFkZHJlc3N9YCk7XG4gICAgY29uc3QgZmlsdGVycyA9IHRoaXMuY29udHJhY3QuZmlsdGVycy5SZWdpc3RlcigpO1xuICAgIGNvbnN0IGhhbmRsZXIgPSAobG9nOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKHtcbiAgICAgICAgcmVnaXN0ZXJMb2c6IGxvZyxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5sb2dnZXIubG9nKGBPcGVyYXRvclByb2R1Y2VyLmxpc3RlblJlZ2lzdGVyRXZlbnQgbG9nOiR7SlNPTi5zdHJpbmdpZnkobG9nKX1gKTtcbiAgICAgIHRoaXMuaGFuZGxlUmVnaXN0ZXJFdmVudChsb2cuYXJncy5zZW5kZXIsIGxvZy5hcmdzLmFjY291bnRJZCwgbG9nLmFyZ3MudHNQdWJYLCBsb2cuYXJncy50c1B1YlksIGxvZy5hcmdzLmwyQWRkciwgbG9nKTtcbiAgICB9O1xuICAgIC8vIGNvbnN0IHsgbGFzdFN5bmNCbG9ja251bWJlckZvclJlZ2lzdGVyRXZlbnQgfSA9IGF3YWl0IHRoaXMucm9sbHVwSW5mb1JlcG9zaXRvcnkuZmluZE9uZU9yRmFpbCh7IHdoZXJlOiB7IGlkOiAxIH0gfSk7XG4gICAgdGhpcy5jb250cmFjdC5xdWVyeUZpbHRlcihmaWx0ZXJzLCAwLCAnbGF0ZXN0JykudGhlbigobG9ncykgPT4ge1xuICAgICAgbG9ncy5mb3JFYWNoKChsb2cpID0+IHtcbiAgICAgICAgaGFuZGxlcihsb2cpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5jb250cmFjdC5vbihmaWx0ZXJzLCBoYW5kbGVyKTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZVJlZ2lzdGVyRXZlbnQoc2VuZGVyOiBzdHJpbmcsIGFjY291bnRJZDogbnVtYmVyLCB0c1B1Ylg6IEJpZ051bWJlciwgdHNQdWJZOiBCaWdOdW1iZXIsIGwyQWRkcjogc3RyaW5nLCB0eDogVHJhbnNhY3Rpb25SZXNwb25zZSkge1xuICAgIGNvbnN0IHJvbGx1cEluZm8gPSBhd2FpdCB0aGlzLnJvbGx1cEluZm9SZXBvc2l0b3J5LmZpbmRPbmVPckZhaWwoeyB3aGVyZTogeyBpZDogMSB9IH0pO1xuICAgIGNvbnN0IHsgYmxvY2tOdW1iZXIgPSAwIH0gPSB0eDtcblxuICAgIGlmIChibG9ja051bWJlciA8IHJvbGx1cEluZm8ubGFzdFN5bmNCbG9ja251bWJlckZvclJlZ2lzdGVyRXZlbnQpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmxvZyhcbiAgICAgICAgYE9wZXJhdG9yUHJvZHVjZXIubGlzdGVuUmVnaXN0ZXJFdmVudCBTS0lQIGJsb2NrTnVtYmVyPSR7YmxvY2tOdW1iZXJ9IGxhc3RTeW5jQmxvY2tudW1iZXJGb3JSZWdpc3RlckV2ZW50PSR7cm9sbHVwSW5mby5sYXN0U3luY0Jsb2NrbnVtYmVyRm9yUmVnaXN0ZXJFdmVudH1gLFxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdHhSZWdpc3RlciA9IHtcbiAgICAgIEwxQWRkcmVzczogc2VuZGVyLFxuICAgICAgYWNjb3VudElkOiBhY2NvdW50SWQudG9TdHJpbmcoKSxcbiAgICAgIHRzUHViS2V5WDogdHNQdWJYLnRvU3RyaW5nKCksXG4gICAgICB0c1B1YktleVk6IHRzUHViWS50b1N0cmluZygpLFxuICAgIH07XG4gICAgdGhpcy5sb2dnZXIubG9nKGBPcGVyYXRvclByb2R1Y2VyLmhhbmRsZVJlZ2lzdGVyRXZlbnQgdHhSZWdpc3Rlcjoke0pTT04uc3RyaW5naWZ5KHR4UmVnaXN0ZXIpfWApO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIHRoaXMuYWNjb3VudFJlcG9zaXRvcnkudXBzZXJ0KHR4UmVnaXN0ZXIsIFsnTDFBZGRyZXNzJ10pLFxuICAgICAgdGhpcy50eFJlcG9zaXRvcnkuaW5zZXJ0KHtcbiAgICAgICAgcmVxVHlwZTogTnVtYmVyKFRzVHhUeXBlLlJFR0lTVEVSKSxcbiAgICAgICAgYWNjb3VudElkOiAnMCcsXG4gICAgICAgIHRva2VuSWQ6ICcwJyxcbiAgICAgICAgYW1vdW50OiAnMCcsXG4gICAgICAgIGFyZzA6IChCaWdJbnQoYWNjb3VudElkLnRvU3RyaW5nKCkpLnRvU3RyaW5nKCkpLFxuICAgICAgICBhcmcxOiBCaWdJbnQobDJBZGRyKS50b1N0cmluZygpLFxuICAgICAgfSksXG4gICAgICAvLyB0aGlzLnJvbGx1cEluZm9SZXBvc2l0b3J5LnVwZGF0ZSh7IGlkOiAxIH0sIHsgbGFzdFN5bmNCbG9ja251bWJlckZvclJlZ2lzdGVyRXZlbnQ6IGJsb2NrTnVtYmVyIH0pLFxuICAgIF0pO1xuICAgIHRoaXMuY29yZVF1ZXVlLmFkZCgnVHJhbnNhY3Rpb25JbmZvJywge1xuICAgICAgdGVzdDogdHJ1ZVxuICAgIH0pO1xuICAgIC8vIHRoaXMubWVzc2FnZUJyb2tlclNlcnZpY2UucHVibGlzaChDSEFOTkVMLk9SREVSX0NSRUFURUQsIHt9KTtcbiAgfVxuXG4gIC8vISBEZXBvc2l0IEV2ZW50XG4gIGFzeW5jIGxpc3RlbkRlcG9zaXRFdmVudCgpIHtcbiAgICBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLndvcmtlclNlcnZpY2Uub25SZWFkeU9ic2VydmVyKTtcbiAgICB0aGlzLmxvZ2dlci5sb2coYE9wZXJhdG9yUHJvZHVjZXIubGlzdGVuRGVwb3NpdEV2ZW50IGNvbnRyYWN0PSR7dGhpcy5jb250cmFjdC5hZGRyZXNzfWApO1xuICAgIGNvbnN0IGZpbHRlcnMgPSB0aGlzLmNvbnRyYWN0LmZpbHRlcnMuRGVwb3NpdCgpO1xuICAgIC8vIGNvbnN0IHsgbGFzdFN5bmNCbG9ja251bWJlckZvckRlcG9zaXRFdmVudCB9ID0gYXdhaXQgdGhpcy5yb2xsdXBJbmZvUmVwb3NpdG9yeS5maW5kT25lT3JGYWlsKHsgd2hlcmU6IHsgaWQ6IDEgfSB9KTtcbiAgICBjb25zdCBoYW5kbGVyID0gKGxvZzogYW55KSA9PiB7XG4gICAgICB0aGlzLmxvZ2dlci5sb2coYE9wZXJhdG9yUHJvZHVjZXIubGlzdGVuRGVwb3NpdEV2ZW50IGxvZzoke0pTT04uc3RyaW5naWZ5KGxvZyl9YCk7XG4gICAgICBjb25zb2xlLmxvZyh7XG4gICAgICAgIGRlcG9zaXRMb2c6IGxvZyxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5oYW5kbGVEZXBvc2l0RXZlbnQobG9nLmFyZ3Muc2VuZGVyLCBsb2cuYXJncy5hY2NvdW50SWQsIGxvZy5hcmdzLnRva2VuSWQsIGxvZy5hcmdzLmFtb3VudCwgbG9nLnRyYW5zYWN0aW9uSGFzaCk7XG4gICAgfTtcbiAgICB0aGlzLmNvbnRyYWN0LnF1ZXJ5RmlsdGVyKGZpbHRlcnMsIDAsICdsYXRlc3QnKS50aGVuKChsb2dzKSA9PiB7XG4gICAgICBsb2dzLmZvckVhY2goKGxvZykgPT4ge1xuICAgICAgICBoYW5kbGVyKGxvZyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLmNvbnRyYWN0Lm9uKGZpbHRlcnMsIGhhbmRsZXIpO1xuICB9XG5cbiAgYXN5bmMgaGFuZGxlRGVwb3NpdEV2ZW50KHNlbmRlcjogc3RyaW5nLCBhY2NvdW50SWQ6IEJpZ051bWJlciwgdG9rZW5JZDogQmlnTnVtYmVyLCBhbW91bnQ6IEJpZ051bWJlciwgdHg6IFRyYW5zYWN0aW9uUmVzcG9uc2UpIHtcbiAgICBjb25zdCByb2xsdXBJbmZvID0gYXdhaXQgdGhpcy5yb2xsdXBJbmZvUmVwb3NpdG9yeS5maW5kT25lT3JGYWlsKHsgd2hlcmU6IHsgaWQ6IDEgfSB9KTtcbiAgICBjb25zdCB7IGJsb2NrTnVtYmVyID0gMCB9ID0gdHg7XG5cbiAgICBpZiAoYmxvY2tOdW1iZXIgPCByb2xsdXBJbmZvLmxhc3RTeW5jQmxvY2tudW1iZXJGb3JEZXBvc2l0RXZlbnQpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmxvZyhcbiAgICAgICAgYE9wZXJhdG9yUHJvZHVjZXIubGlzdGVuRGVwb3NpdEV2ZW50IFNLSVAgYmxvY2tOdW1iZXI9JHtibG9ja051bWJlcn0gbGFzdFN5bmNCbG9ja251bWJlckZvckRlcG9zaXRFdmVudD0ke3JvbGx1cEluZm8ubGFzdFN5bmNCbG9ja251bWJlckZvckRlcG9zaXRFdmVudH1gLFxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5sb2dnZXIubG9nKGBPcGVyYXRvclByb2R1Y2VyLmhhbmRsZURlcG9zaXRFdmVudCB0eERlcG9zaXQ6JHtKU09OLnN0cmluZ2lmeSh7IHRva2VuSWQsIGFtb3VudCwgYWNjb3VudElkIH0pfWApO1xuXG4gICAgYXdhaXQgdGhpcy50eFJlcG9zaXRvcnkuaW5zZXJ0KHtcbiAgICAgIHJlcVR5cGU6IE51bWJlcihUc1R4VHlwZS5ERVBPU0lUKSxcbiAgICAgIHRva2VuSWQ6IGdldFJhbmRvbUl0ZW1Gcm9tQXJyYXkoW1RzVG9rZW5BZGRyZXNzLldFVEgsIFRzVG9rZW5BZGRyZXNzLlVTRFRdKSwgLy8gKHRva2VuSWQudG9TdHJpbmcoKSksXG4gICAgICBhbW91bnQ6IChhbW91bnQudG9TdHJpbmcoKSksXG4gICAgICBhcmcwOiAoQmlnSW50KGFjY291bnRJZC50b1N0cmluZygpKS50b1N0cmluZygpKSxcbiAgICB9KTtcbiAgICB0aGlzLmNvcmVRdWV1ZS5hZGQoJ1RyYW5zYWN0aW9uSW5mbycsIHtcbiAgICAgIHRlc3Q6IHRydWVcbiAgICB9KTtcbiAgICAvLyB0aGlzLm1lc3NhZ2VCcm9rZXJTZXJ2aWNlLnB1Ymxpc2goQ0hBTk5FTC5PUkRFUl9DUkVBVEVELCB7fSk7XG4gICAgLy8gYXdhaXQgdGhpcy5yb2xsdXBJbmZvUmVwb3NpdG9yeS51cGRhdGUoeyBpZDogMSB9LCB7IGxhc3RTeW5jQmxvY2tudW1iZXJGb3JEZXBvc2l0RXZlbnQ6IGJsb2NrTnVtYmVyIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFJhbmRvbUl0ZW1Gcm9tQXJyYXkoaXRlbXM6IHN0cmluZ1tdKSB7XG4gIHJldHVybiBpdGVtc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqaXRlbXMubGVuZ3RoKV07XG59IiwiaW1wb3J0ICogYXMgX2NsdXN0ZXIgZnJvbSAnY2x1c3Rlcic7XG5pbXBvcnQgdHlwZSB7IENsdXN0ZXIgfSBmcm9tICdjbHVzdGVyJztcbmltcG9ydCB7IFJlcGxheVN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ2x1c3Rlck1lc3NhZ2VFdmVudFBheWxvYWQsIENsdXN0ZXJNZXNzYWdlVHlwZSB9IGZyb20gJ0B0cy1zZGsvZG9tYWluL2V2ZW50cy9jbHVzdGVyJztcbmltcG9ydCB7IEluamVjdGFibGUsIFNjb3BlIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgVHNXb3JrZXJOYW1lIH0gZnJvbSAnQHRzLXNkay9jb25zdGFudCc7XG5pbXBvcnQgeyBnZXRXb3JrZXJOYW1lIH0gZnJvbSAnQHRzLXNkay9oZWxwZXInO1xuY29uc3QgY2x1c3RlciA9IF9jbHVzdGVyIGFzIHVua25vd24gYXMgQ2x1c3RlcjtcblxuQEluamVjdGFibGUoe1xuICBzY29wZTogU2NvcGUuREVGQVVMVCxcbn0pXG5leHBvcnQgY2xhc3MgV29ya2VyU2VydmljZSB7XG4gIGlzTGlzdGVuaW5nID0gZmFsc2U7XG4gIHB1YmxpYyB3b3JrZXJOYW1lOiBUc1dvcmtlck5hbWU7XG4gIHByaXZhdGUgd29ya2VyUmVhZHlTdWJqZWN0ID0gbmV3IFJlcGxheVN1YmplY3QoMSk7XG4gIHB1YmxpYyBvblJlYWR5T2JzZXJ2ZXIgPSB0aGlzLndvcmtlclJlYWR5U3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgXG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IGxvZ2dlcjogUGlub0xvZ2dlclNlcnZpY2UsXG4gICkge1xuICAgIHRoaXMud29ya2VyTmFtZSA9IGdldFdvcmtlck5hbWUoKTtcbiAgICBpZighY2x1c3Rlci5pc1ByaW1hcnkpe1xuICAgICAgdGhpcy5zdGFydExpc3RlbigpO1xuICAgIH1cbiAgfVxuXG4gIG9uUmVjZWl2ZWRNZXNzYWdlKHBheWxvYWQ6IENsdXN0ZXJNZXNzYWdlRXZlbnRQYXlsb2FkKSB7XG4gICAgdGhpcy5sb2dnZXIubG9nKHtcbiAgICAgIG1zZzogJ09OIE1FU1NBR0UnLCB3b3JrZXJOYW1lOiB0aGlzLndvcmtlck5hbWUsIHBheWxvYWRcbiAgICB9KTtcbiAgICBzd2l0Y2ggKHBheWxvYWQudHlwZSkge1xuICAgICAgY2FzZSBDbHVzdGVyTWVzc2FnZVR5cGUuUkVBRFk6XG4gICAgICAgIHRoaXMud29ya2VyUmVhZHlTdWJqZWN0Lm5leHQodHJ1ZSk7XG4gICAgICAgIHRoaXMud29ya2VyUmVhZHlTdWJqZWN0LmNvbXBsZXRlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHN0YXJ0TGlzdGVuKCkge1xuICAgIGlmKHRoaXMuaXNMaXN0ZW5pbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignV29ya2VyU2VydmljZSBpcyBhbHJlYWR5IGxpc3RlbmluZycpO1xuICAgIH1cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnT04gTElTVEVOJywgdGhpcy53b3JrZXJOYW1lKTtcbiAgICBwcm9jZXNzLm9uKCdtZXNzYWdlJywgKHBheWxvYWQ6IENsdXN0ZXJNZXNzYWdlRXZlbnRQYXlsb2FkKSA9PiB7XG4gICAgICBpZihwYXlsb2FkLnRvID09PSB0aGlzLndvcmtlck5hbWUpIHtcbiAgICAgICAgdGhpcy5vblJlY2VpdmVkTWVzc2FnZShwYXlsb2FkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgbWVzc2FnZSBzZW5kIHRvIHdyb25nIFdvcmtlciB0bz0ke3BheWxvYWQudG99LCBjdXJyZW50PSR7dGhpcy53b3JrZXJOYW1lfWApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc2VuZE1lc3NhZ2UocGF5bG9hZDogT21pdDxDbHVzdGVyTWVzc2FnZUV2ZW50UGF5bG9hZCwgJ2Zyb20nPikge1xuICAgIGlmKHByb2Nlc3M/LnNlbmQpIHtcbiAgICAgIHByb2Nlc3Muc2VuZCh7XG4gICAgICAgIGZyb206IHRoaXMud29ya2VyTmFtZSxcbiAgICAgICAgLi4ucGF5bG9hZCxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3Muc2VuZCBpcyBub3QgZGVmaW5lZCcpO1xuICB9XG5cbiAgcmVhZHkoKSB7XG4gICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICB0bzogVHNXb3JrZXJOYW1lLkNPUkUsXG4gICAgICB0eXBlOiBDbHVzdGVyTWVzc2FnZVR5cGUuUkVBRFksXG4gICAgfSk7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgdG86IFRzV29ya2VyTmFtZS5DT1JFLFxuICAgICAgdHlwZTogQ2x1c3Rlck1lc3NhZ2VUeXBlLlNUT1AsXG4gICAgfSk7XG4gIH1cblxufSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInJ4anNcIik7OyIsImltcG9ydCB7IFRzV29ya2VyTmFtZSB9IGZyb20gJ0B0cy1zZGsvY29uc3RhbnQnO1xuaW1wb3J0IHsgUmVjb3JkLCBTdHJpbmcgfSBmcm9tICdydW50eXBlcyc7XG5cbmNvbnN0IFRzV29ya2VyTmFtZUJyYW5kID0gU3RyaW5nLndpdGhDb25zdHJhaW50KChzKSA9PiBPYmplY3QudmFsdWVzKFRzV29ya2VyTmFtZSkuaW5jbHVkZXMocyBhcyBUc1dvcmtlck5hbWUpKTtcblxuZXhwb3J0IGVudW0gQ2x1c3Rlck1lc3NhZ2VUeXBlIHtcbiAgVU5LTk9XTixcbiAgU1RBUlQsXG4gIFJFQURZLFxuICBBTExfUkVBRFksXG4gIFNUT1AsXG4gIE1FU1NBR0UsXG5cbn1cblxuZXhwb3J0IGNvbnN0IENsdXN0ZXJNZXNzYWdlRXZlbnRQYXlsb2FkID0gUmVjb3JkKHtcbiAgZnJvbTogVHNXb3JrZXJOYW1lQnJhbmQsXG4gIHRvOiBUc1dvcmtlck5hbWVCcmFuZCxcbiAgLy8gcGF5bG9hZDogYW55LFxufSk7XG5cbmV4cG9ydCB0eXBlIENsdXN0ZXJNZXNzYWdlRXZlbnRQYXlsb2FkID0ge1xuICBmcm9tOiBUc1dvcmtlck5hbWU7XG4gIHRvOiBUc1dvcmtlck5hbWU7XG4gIHR5cGU6IENsdXN0ZXJNZXNzYWdlVHlwZSxcbiAgbWVzc2FnZT86IHN0cmluZztcbiAgZGF0YT86IGFueTtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJydW50eXBlc1wiKTs7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicnhqcy9pbnRlcm5hbC9maXJzdFZhbHVlRnJvbVwiKTs7IiwiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE1lc3NhZ2VCcm9rZXIge1xuICBjb25uZWN0ITogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgYWRkQ2hhbm5lbHMhOiAoY2hhbm5lbE5hbWVzOnN0cmluZ1tdKSA9PiBQcm9taXNlPHZvaWQ+O1xuICByZW1vdmVDaGFubmVsITogKGNoYW5uZWxOYW1lOnN0cmluZykgPT4gUHJvbWlzZTx2b2lkPjtcbiAgcHVibGlzaCE6IChjaGFubmVsTmFtZTogc3RyaW5nLCBkYXRhOiBhbnkpID0+IFByb21pc2U8dm9pZD47XG4gIHN1YnNjcmliZSE6IChjaGFubmVsTmFtZTogc3RyaW5nLCAgZXZlbnRMaXN0ZW5lcjogKHBheWxvYWQ6IGFueSk9PnZvaWQgKSA9PiBQcm9taXNlPHZvaWQ+O1xuICBjbG9zZSE6ICgpID0+IFByb21pc2U8dm9pZD47XG59ICIsImltcG9ydCB7IExvZ2dlck1vZHVsZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2xvZ2dlci5tb2R1bGUnO1xuaW1wb3J0IHsgR2xvYmFsLCBNb2R1bGUgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBDb25maWdNb2R1bGUgfSBmcm9tICdAbmVzdGpzL2NvbmZpZyc7XG5pbXBvcnQgeyBNYWluUHJvY2Vzc1NlcnZpY2UgfSBmcm9tICcuL21haW4tcHJvY2Vzcy5zZXJ2aWNlJztcbmltcG9ydCB7IFdvcmtlclNlcnZpY2UgfSBmcm9tICcuL3dvcmtlci5zZXJ2aWNlJztcbkBHbG9iYWwoKVxuQE1vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBDb25maWdNb2R1bGUsXG4gICAgTG9nZ2VyTW9kdWxlLFxuICBdLFxuICBwcm92aWRlcnM6IFtcbiAgICBNYWluUHJvY2Vzc1NlcnZpY2UsXG4gIF0sXG4gIGV4cG9ydHM6IFtNYWluUHJvY2Vzc1NlcnZpY2VdXG59KVxuZXhwb3J0IGNsYXNzIE1haW5Qcm9jZXNzTW9kdWxlIHt9XG5cbkBHbG9iYWwoKVxuQE1vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBDb25maWdNb2R1bGUsXG4gICAgTG9nZ2VyTW9kdWxlLFxuICBdLFxuICBwcm92aWRlcnM6IFtcbiAgICBXb3JrZXJTZXJ2aWNlLFxuICBdLFxuICBleHBvcnRzOiBbV29ya2VyU2VydmljZV1cbn0pXG5leHBvcnQgY2xhc3MgV29ya2VyTW9kdWxlIHt9XG4iLCJpbXBvcnQgdHlwZSB7IENsdXN0ZXIgfSBmcm9tICdjbHVzdGVyJztcbmltcG9ydCAqIGFzIF9jbHVzdGVyIGZyb20gJ2NsdXN0ZXInO1xuY29uc3QgY2x1c3RlciA9IF9jbHVzdGVyIGFzIHVua25vd24gYXMgQ2x1c3RlcjtcbmltcG9ydCB7IENsdXN0ZXJNZXNzYWdlRXZlbnRQYXlsb2FkLCBDbHVzdGVyTWVzc2FnZVR5cGUgfSBmcm9tICdAdHMtc2RrL2RvbWFpbi9ldmVudHMvY2x1c3Rlcic7XG5pbXBvcnQgeyBQaW5vTG9nZ2VyU2VydmljZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2FkYXB0ZXJzL3JlYWwvcGlub0xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IEluamVjdGFibGUsIFNjb3BlIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgVHNXb3JrZXJOYW1lLCBXb3JrZXJJdGVtIH0gZnJvbSAnQHRzLXNkay9jb25zdGFudCc7XG5pbXBvcnQgeyBnZXRXb3JrZXJOYW1lIH0gZnJvbSAnQHRzLXNkay9oZWxwZXInO1xuaW1wb3J0IHsgZGVsYXksIGZpbHRlciwgZmlyc3QsIHBpcGUsIFJlcGxheVN1YmplY3QsIHNraXBVbnRpbCB9IGZyb20gJ3J4anMnO1xuXG5ASW5qZWN0YWJsZSh7XG4gIHNjb3BlOiBTY29wZS5ERUZBVUxULFxufSlcbmV4cG9ydCBjbGFzcyBNYWluUHJvY2Vzc1NlcnZpY2Uge1xuICBwdWJsaWMgd29ya2VyTWFwOiB7XG4gICAgW25hbWU6IHN0cmluZ106IFdvcmtlckl0ZW07XG4gIH0gPSB7fTtcbiAgcHJpdmF0ZSBzZWxmV29ya2VyTmFtZTogVHNXb3JrZXJOYW1lO1xuICBwcml2YXRlIHdvcmtlclJlYWR5U3ViamVjdCA9IG5ldyBSZXBsYXlTdWJqZWN0PGJvb2xlYW4+KDEpO1xuICBwdWJsaWMgaXNSZWFkeSA9IHRoaXMud29ya2VyUmVhZHlTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuXG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgbG9nZ2VyOiBQaW5vTG9nZ2VyU2VydmljZSkge1xuICAgIHRoaXMuc2VsZldvcmtlck5hbWUgPSBnZXRXb3JrZXJOYW1lKCk7XG4gICAgdGhpcy53b3JrZXJSZWFkeVN1YmplY3QubmV4dChmYWxzZSk7XG4gICAgdGhpcy5sb2dnZXIuc2V0Q29udGV4dCgnTWFpblByb2Nlc3NTZXJ2aWNlJyk7XG5cbiAgICB0aGlzLmhhbmRsZUFsbFdvcmtlclJlYWR5KCk7XG4gIH1cblxuICBoYW5kbGVBbGxXb3JrZXJSZWFkeSgpIHtcbiAgICAvLyBUT0RPOiBvbmx5IGhhbmRsZSBmaXJzdCA/XG4gICAgdGhpcy5pc1JlYWR5LnBpcGUoXG4gICAgICBmaWx0ZXIoKGlzUmVhZHkpID0+IGlzUmVhZHkpLFxuICAgICAgZmlyc3QoKSxcbiAgICAgIGRlbGF5KDEwMDAgKiAzKSxcbiAgICApLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBPYmplY3QudmFsdWVzKHRoaXMud29ya2VyTWFwKS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgIGZyb206IHRoaXMuc2VsZldvcmtlck5hbWUsXG4gICAgICAgICAgdG86IGl0ZW0ubmFtZSxcbiAgICAgICAgICB0eXBlOiBDbHVzdGVyTWVzc2FnZVR5cGUuUkVBRFksXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBvblJlY2VpdmVkTWVzc2FnZShwYXlsb2FkOiBDbHVzdGVyTWVzc2FnZUV2ZW50UGF5bG9hZCkge1xuICAgIHRoaXMubG9nZ2VyLmxvZyh7IG5hbWU6IHRoaXMuc2VsZldvcmtlck5hbWUsIHR5cGU6ICdtZXNzYWdlJywgcGF5bG9hZCB9KTtcbiAgICBzd2l0Y2ggKHBheWxvYWQudHlwZSkge1xuICAgICAgY2FzZSBDbHVzdGVyTWVzc2FnZVR5cGUuUkVBRFk6XG4gICAgICAgIC8vIFdvcmtlciBpbml0ZWQgLS0gc2VuZE1lc3NhZ2UoUkVBRFksIENvcmUpIC0+IE1haW5Qcm9jZXNzIC0tIGNoZWNrIEFsbCB3b3JrZXIgcmVhZHkgLT4gIGhhbmRsZUFsbFdvcmtlclJlYWR5IC0tIHNlbmRNZXNzYWdlKFJFQURZLCBXb3JrZXIpIC0+IFdvcmtlciBvblJlYWR5XG4gICAgICAgIHRoaXMuZ2V0V29ya2VyKHBheWxvYWQuZnJvbSkuaXNSZWFkeSA9IHRydWU7XG4gICAgICAgIGNvbnN0IGlzQWxsUmVhZHkgPSBPYmplY3QudmFsdWVzKHRoaXMud29ya2VyTWFwKS5ldmVyeSgoaXRlbSkgPT4gaXRlbS5pc1JlYWR5KTtcbiAgICAgICAgdGhpcy53b3JrZXJSZWFkeVN1YmplY3QubmV4dChpc0FsbFJlYWR5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBzZXRXb3JrZXIobmFtZTogVHNXb3JrZXJOYW1lLCB3b3JrZXJJdGVtOiBXb3JrZXJJdGVtKSB7XG4gICAgaWYoIWNsdXN0ZXIuaXNQcmltYXJ5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFdvcmtlcigpIHNob3VsZCBvbmx5IGJlIGNhbGxlZCBpbiBwcmltYXJ5IHByb2Nlc3MnKTtcbiAgICB9XG4gICAgdGhpcy53b3JrZXJNYXBbbmFtZV0gPSB3b3JrZXJJdGVtO1xuICB9XG4gIGdldFdvcmtlcihuYW1lOiBUc1dvcmtlck5hbWUpIHtcbiAgICBjb25zdCB3b3JrZXIgPSB0aGlzLndvcmtlck1hcFtuYW1lXTtcbiAgICBpZighd29ya2VyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHdvcmtlciAke25hbWV9IGlzIG5vdCBmb3VuZGApO1xuICAgIH1cbiAgICByZXR1cm4gd29ya2VyO1xuICB9XG5cbiAgc2VuZE1lc3NhZ2UocGF5bG9hZDogQ2x1c3Rlck1lc3NhZ2VFdmVudFBheWxvYWQpIHtcbiAgICB0aGlzLmxvZ2dlci5sb2coeyB0eXBlOiAnc2VuZE1lc3NhZ2UnLCBwYXlsb2FkIH0pO1xuICAgIGlmKHBheWxvYWQudG8gPT09IHRoaXMuc2VsZldvcmtlck5hbWUpIHtcbiAgICAgIHRoaXMub25SZWNlaXZlZE1lc3NhZ2UocGF5bG9hZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmKCF0aGlzLndvcmtlck1hcFtwYXlsb2FkLnRvXSkge1xuICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoYFdvcmtlciAke3BheWxvYWQudG99IG5vdCBmb3VuZGApO1xuICAgICAgLy8gdGhyb3cgbmV3IEVycm9yKGBXb3JrZXIgJHtwYXlsb2FkLnRvfSBub3QgZm91bmRgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy53b3JrZXJNYXBbcGF5bG9hZC50b10ud29ya2VyPy5zZW5kKHBheWxvYWQpO1xuXG4gICAgfVxuICB9XG5cbiAgY2x1c3Rlcml6ZSh3b3JrZXJzOiBXb3JrZXJJdGVtW10pIHtcbiAgICBpZighY2x1c3Rlci5pc1ByaW1hcnkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY2x1c3Rlcml6ZSgpIHNob3VsZCBvbmx5IGJlIGNhbGxlZCBpbiBwcmltYXJ5IHByb2Nlc3MnKTtcbiAgICB9XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHdvcmtlcnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBpdGVtID0gd29ya2Vyc1tpbmRleF07XG4gICAgICB0aGlzLmxvZ2dlci5sb2coYCR7VHNXb3JrZXJOYW1lLkNPUkV9OiBmb3JrIGNsdXN0ZXIgJHtpdGVtLm5hbWV9YCk7XG4gICAgICBjb25zdCB3b3JrZXIgPSBjbHVzdGVyLmZvcmsoe1xuICAgICAgICBUU19XT1JLRVJfTkFNRTogaXRlbS5uYW1lLFxuICAgICAgfSk7XG4gICAgICB0aGlzLnNldFdvcmtlcihpdGVtLm5hbWUsIHtcbiAgICAgICAgLi4uaXRlbSxcbiAgICAgICAgd29ya2VyLFxuICAgICAgfSk7XG4gICAgICB3b3JrZXIub25jZSgnb25saW5lJywgKCkgPT4ge1xuICAgICAgICB0aGlzLmxvZ2dlci5sb2coYFdvcmtlciAke2l0ZW0ubmFtZX0tJHt3b3JrZXIucHJvY2Vzcy5waWR9IG9ubGluZSFgKTtcbiAgICAgIH0pO1xuICAgICAgd29ya2VyLm9uY2UoJ2V4aXQnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKGBXb3JrZXIgJHtpdGVtLm5hbWV9LSR7d29ya2VyLnByb2Nlc3MucGlkfSBkaWVkLmApO1xuICAgICAgfSk7XG4gICAgICB3b3JrZXIub24oJ21lc3NhZ2UnLCB0aGlzLnNlbmRNZXNzYWdlLmJpbmQodGhpcykpO1xuICAgIH1cbiAgfVxuICBcbn0iLCJpbXBvcnQgeyBQaW5vTG9nZ2VyU2VydmljZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2FkYXB0ZXJzL3JlYWwvcGlub0xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IExvZ2dlck1vZHVsZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2xvZ2dlci5tb2R1bGUnO1xuaW1wb3J0IHsgR2xvYmFsLCBNb2R1bGUgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBDb25maWdNb2R1bGUsIENvbmZpZ1NlcnZpY2UgfSBmcm9tICdAbmVzdGpzL2NvbmZpZyc7XG5pbXBvcnQgeyBNZXNzYWdlQnJva2VyU2VydmljZSB9IGZyb20gJy4vYWRhcHRlcnMvbWVzc2FnZUJyb2tlci5zZXJ2aWNlJztcbmltcG9ydCB7IE1lc3NhZ2VCcm9rZXIgfSBmcm9tICcuL3BvcnRzL21lc3NhZ2VCcm9rZXInO1xuXG5AR2xvYmFsKClcbkBNb2R1bGUoe1xuICBpbXBvcnRzOiBbQ29uZmlnTW9kdWxlLCBMb2dnZXJNb2R1bGVdLFxuICBwcm92aWRlcnM6IFtDb25maWdTZXJ2aWNlLCBQaW5vTG9nZ2VyU2VydmljZSwge1xuICAgIHByb3ZpZGU6IE1lc3NhZ2VCcm9rZXIsXG4gICAgdXNlQ2xhc3M6IE1lc3NhZ2VCcm9rZXJTZXJ2aWNlXG4gIH1dLFxuICBleHBvcnRzOiBbTWVzc2FnZUJyb2tlcl1cbn0pXG5leHBvcnQgY2xhc3MgRGF0YWJhc2VQdWJTdWJNb2R1bGUge30iLCJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgQ29uZmlnU2VydmljZSB9IGZyb20gJ0BuZXN0anMvY29uZmlnJztcbmltcG9ydCB7IE1lc3NhZ2VCcm9rZXIgfSBmcm9tICcuLi9wb3J0cy9tZXNzYWdlQnJva2VyJztcbmltcG9ydCB7IFBnUHViU3ViIH0gZnJvbSAnQGltcXVldWUvcGctcHVic3ViJztcbmltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgdGhyZWFkSWQgfSBmcm9tICd3b3JrZXJfdGhyZWFkcyc7XG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWVzc2FnZUJyb2tlclNlcnZpY2UgaW1wbGVtZW50cyBNZXNzYWdlQnJva2VyIHtcbiAgcHJpdmF0ZSBEQVRBQkFTRV9VUkw6IHN0cmluZztcbiAgcHJpdmF0ZSBwdWJTdWJJbnN0YW5jZTogUGdQdWJTdWI7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgY29uZmlnU2VydmljZTogQ29uZmlnU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlcjogUGlub0xvZ2dlclNlcnZpY2VcbiAgKSB7XG4gICAgdGhpcy5sb2dnZXIuc2V0Q29udGV4dChNZXNzYWdlQnJva2VyU2VydmljZS5uYW1lKTtcbiAgICB0aGlzLkRBVEFCQVNFX1VSTCA9IHRoaXMuY29uZmlnU2VydmljZS5nZXQ8c3RyaW5nPignREFUQUJBU0VfVVJMJywgJycpO1xuICAgIHRoaXMucHViU3ViSW5zdGFuY2UgPSBuZXcgUGdQdWJTdWIoe1xuICAgICAgY29ubmVjdGlvblN0cmluZzogdGhpcy5EQVRBQkFTRV9VUkwsXG4gICAgICBzaW5nbGVMaXN0ZW5lcjogZmFsc2VcbiAgICB9KTtcbiAgICB0aGlzLmNvbm5lY3QoKTtcbiAgfVxuICBhc3luYyBjb25uZWN0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMucHViU3ViSW5zdGFuY2UuY29ubmVjdCgpXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoZXJyKTtcbiAgICAgIH0pXG4gICAgO1xuICB9XG4gIGFzeW5jIGFkZENoYW5uZWxzKGNoYW5uZWxOYW1lczogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmxvZ2dlci5sb2coY2hhbm5lbE5hbWVzKTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChjaGFubmVsTmFtZXMubWFwKGNoYW5uZWxOYW1lID0+ICgpPT4gdGhpcy5wdWJTdWJJbnN0YW5jZS5saXN0ZW4oY2hhbm5lbE5hbWUpKSk7XG4gIH1cbiAgYXN5bmMgc3Vic2NyaWJlKGNoYW5uZWxOYW1lOiBzdHJpbmcsIGV2ZW50TGlzdGVuZXI6ICgocGF5bG9hZDogYW55KSA9PiB2b2lkKSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMubG9nZ2VyLmxvZyhgYWRkQ2hhbm5lbExpc3RlbmVyOiAke2NoYW5uZWxOYW1lfWApO1xuICAgIGNvbnNvbGUubG9nKCdzdWJzY3JpYmUnLCBjaGFubmVsTmFtZSk7XG4gICAgYXdhaXQgdGhpcy5wdWJTdWJJbnN0YW5jZS5jaGFubmVscy5vbihjaGFubmVsTmFtZSwgZXZlbnRMaXN0ZW5lcik7XG4gIH1cbiAgYXN5bmMgcmVtb3ZlQ2hhbm5lbChjaGFubmVsTmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5sb2dnZXIubG9nKGByZW1vdmVDaGFubmVsOiAke2NoYW5uZWxOYW1lfWApO1xuICAgIGF3YWl0IHRoaXMucHViU3ViSW5zdGFuY2UudW5saXN0ZW4oY2hhbm5lbE5hbWUpO1xuICB9XG4gIGFzeW5jIHB1Ymxpc2goY2hhbm5lbE5hbWU6IHN0cmluZywgZGF0YTogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc29sZS5sb2coe25hbWU6J3B1Ymxpc2gnLCBjaGFubmVsTmFtZSwgZGF0YX0pO1xuICAgIHRoaXMubG9nZ2VyLmxvZyh7bmFtZToncHVibGlzaCcsIGNoYW5uZWxOYW1lLCBkYXRhfSk7XG4gICAgYXdhaXQgdGhpcy5wdWJTdWJJbnN0YW5jZS5jaGFubmVscy5lbWl0KGNoYW5uZWxOYW1lLCBkYXRhKTtcbiAgfVxuICBhc3luYyBjbG9zZSgpOlByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMubG9nZ2VyLmxvZygnY2xvc2UnKTtcbiAgICBhd2FpdCB0aGlzLnB1YlN1Ykluc3RhbmNlLmNsb3NlKCk7XG4gIH1cbiAgXG59IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQGltcXVldWUvcGctcHVic3ViXCIpOzsiLCJpbXBvcnQgeyBQaW5vTG9nZ2VyU2VydmljZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2FkYXB0ZXJzL3JlYWwvcGlub0xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IENvbmZpZ1NlcnZpY2UgfSBmcm9tICdAbmVzdGpzL2NvbmZpZyc7XG5pbXBvcnQgeyBOZXN0RmFjdG9yeSB9IGZyb20gJ0BuZXN0anMvY29yZSc7XG5pbXBvcnQgeyBnZXRXb3JrZXJOYW1lLCBnZXRQcm9jZXNzTmFtZSB9IGZyb20gJy4vaGVscGVyJztcblxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0dXBBcHAobW9kdWxlOiBhbnkpIHtcbiAgY29uc3QgYXBwID0gYXdhaXQgTmVzdEZhY3RvcnkuY3JlYXRlQXBwbGljYXRpb25Db250ZXh0KG1vZHVsZSk7XG4gIGNvbnN0IGNvbmZpZ1NlcnZpY2UgPSBhcHAuZ2V0KENvbmZpZ1NlcnZpY2UpO1xuICBjb25zdCB3b3JrZXJOYW1lID0gZ2V0V29ya2VyTmFtZSgpO1xuICBjb25zdCBsb2dnZXIgPSBhcHAuZ2V0KFBpbm9Mb2dnZXJTZXJ2aWNlKTtcblxuICBsb2dnZXIuc2V0Q29udGV4dChnZXRQcm9jZXNzTmFtZSgpKTtcbiAgYXBwLnVzZUxvZ2dlcihsb2dnZXIpO1xuXG4gIGxvZ2dlci5sb2coYCR7Z2V0UHJvY2Vzc05hbWUoKX06IHNlcnZlciBzdGFydGVkIWApO1xuICByZXR1cm4gYXBwO1xufVxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAbmVzdGpzL2NvcmVcIik7OyIsImltcG9ydCB7IFRzU2VxdWVuY2VyTW9kdWxlIH0gZnJvbSAnLi90cy1zZXF1ZW5jZXIubW9kdWxlJztcbmltcG9ydCB7IHNldHVwQXBwIH0gZnJvbSAnQHRzLXNkay9zZXR1cC5oZWxwZXInO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJvb3RzdHJhcCgpIHtcbiAgY29uc3QgYXBwID0gYXdhaXQgc2V0dXBBcHAoVHNTZXF1ZW5jZXJNb2R1bGUpO1xuXG4gIHJldHVybiBhcHA7XG59IiwiaW1wb3J0IHsgUGlub0xvZ2dlclNlcnZpY2UgfSBmcm9tICdAY29tbW9uL2xvZ2dlci9hZGFwdGVycy9yZWFsL3Bpbm9Mb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBNb2R1bGUsIE9uTW9kdWxlSW5pdCB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IExvZ2dlck1vZHVsZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2xvZ2dlci5tb2R1bGUnO1xuaW1wb3J0IHsgQ29uZmlnTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy9jb25maWcnO1xuaW1wb3J0IHsgVHNXb3JrZXJOYW1lIH0gZnJvbSAnQHRzLXNkay9jb25zdGFudCc7XG5pbXBvcnQgeyBCdWxsUXVldWVNb2R1bGUgfSBmcm9tICcuLi8uLi9jb21tb24vYnVsbC1xdWV1ZS9zcmMvQnVsbFF1ZXVlLm1vZHVsZSc7XG5pbXBvcnQgeyBTZXF1ZW5jZXJDb25zdW1lciB9IGZyb20gJy4vaW5mcmFzdHJ1Y3R1cmUvc2VxdWVuY2VyLnByb2Nlc3Nvcic7XG5pbXBvcnQgeyBCdWxsTW9kdWxlIH0gZnJvbSAnQGFuY2hhbjgyOC9uZXN0LWJ1bGxtcSc7XG5pbXBvcnQgeyBTY2hlZHVsZU1vZHVsZSB9IGZyb20gJ0BuZXN0anMvc2NoZWR1bGUnO1xuaW1wb3J0IHsgVHlwZU9ybU1vZHVsZSB9IGZyb20gJ0BuZXN0anMvdHlwZW9ybSc7XG5pbXBvcnQgeyBCbG9ja0luZm9ybWF0aW9uIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvYmxvY2tJbmZvcm1hdGlvbi5lbnRpdHknO1xuaW1wb3J0IHsgVHJhbnNhY3Rpb25JbmZvIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvdHJhbnNhY3Rpb25JbmZvLmVudGl0eSc7XG5pbXBvcnQgeyBUc1R5cGVPcm1Nb2R1bGUgfSBmcm9tICdjb21tb24vdHMtdHlwZW9ybS9zcmMvdHN0eXBlb3JtLm1vZHVsZSc7XG5pbXBvcnQgeyBXb3JrZXJNb2R1bGUgfSBmcm9tICdAY29tbW9uL2NsdXN0ZXIvY2x1c3Rlci5tb2R1bGUnO1xuaW1wb3J0IHsgV29ya2VyU2VydmljZSB9IGZyb20gJ0Bjb21tb24vY2x1c3Rlci93b3JrZXIuc2VydmljZSc7XG5pbXBvcnQgeyBEYXRhYmFzZVB1YlN1Yk1vZHVsZSB9IGZyb20gJ0Bjb21tb24vZGItcHVic3ViL2RiLXB1YnN1Yi5tb2R1bGUnO1xuaW1wb3J0IHsgUm9sbHVwTW9kdWxlIH0gZnJvbSAnQGNvbW1vbi90cy10eXBlb3JtL3JvbGx1cC9yb2xsdXAubW9kdWxlJztcbmltcG9ydCB7IEFjY291bnRNb2R1bGUgfSBmcm9tICdAY29tbW9uL3RzLXR5cGVvcm0vYWNjb3VudC9hY2NvdW50Lm1vZHVsZSc7XG5pbXBvcnQgeyBBdWN0aW9uT3JkZXJNb3VkbGUgfSBmcm9tICdAY29tbW9uL3RzLXR5cGVvcm0vYXVjdGlvbk9yZGVyL2F1Y3Rpb25PcmRlci5tb2R1bGUnO1xuXG5ATW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbmZpZ01vZHVsZSxcbiAgICBMb2dnZXJNb2R1bGUsXG4gICAgU2NoZWR1bGVNb2R1bGUuZm9yUm9vdCgpLFxuICAgIEJ1bGxRdWV1ZU1vZHVsZSxcbiAgICBCdWxsTW9kdWxlLnJlZ2lzdGVyUXVldWUoe1xuICAgICAgcXVldWVOYW1lOiBUc1dvcmtlck5hbWUuU0VRVUVOQ0VSXG4gICAgfSwge1xuICAgICAgcXVldWVOYW1lOiBUc1dvcmtlck5hbWUuQ09SRVxuICAgIH0pLFxuICAgIFRzVHlwZU9ybU1vZHVsZSxcbiAgICBUeXBlT3JtTW9kdWxlLmZvckZlYXR1cmUoXG4gICAgICBbXG4gICAgICAgIFRyYW5zYWN0aW9uSW5mbyxcbiAgICAgICAgQmxvY2tJbmZvcm1hdGlvbixcbiAgICAgIF0pLFxuICAgIFdvcmtlck1vZHVsZSxcbiAgICBEYXRhYmFzZVB1YlN1Yk1vZHVsZSxcbiAgICBBY2NvdW50TW9kdWxlLFxuICAgIEF1Y3Rpb25PcmRlck1vdWRsZSxcbiAgICBSb2xsdXBNb2R1bGUsXG4gIF0sXG4gIGNvbnRyb2xsZXJzOiBbXSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgU2VxdWVuY2VyQ29uc3VtZXIsXG4gICAgLy8gU2VxUHJvZHVjZXJTZXJ2aWNlLFxuICBdXG59KVxuZXhwb3J0IGNsYXNzIFRzU2VxdWVuY2VyTW9kdWxlIGltcGxlbWVudHMgT25Nb2R1bGVJbml0IHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWVtcHR5LWZ1bmN0aW9uXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgbG9nZ2VyOiBQaW5vTG9nZ2VyU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHdvcmtlclNlcnZpY2U6IFdvcmtlclNlcnZpY2UsXG4gICkgeyB9XG5cbiAgb25Nb2R1bGVJbml0KCk6IHZvaWQge1xuICAgIHRoaXMud29ya2VyU2VydmljZS5yZWFkeSgpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBUc1dvcmtlck5hbWUgfSBmcm9tICdAdHMtc2RrL2NvbnN0YW50JztcbmltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgQnVsbFdvcmtlciwgQnVsbFdvcmtlclByb2Nlc3MgfSBmcm9tICdAYW5jaGFuODI4L25lc3QtYnVsbG1xJztcbmltcG9ydCB7IEpvYiB9IGZyb20gJ2J1bGxtcSc7XG5pbXBvcnQgeyBJbmplY3RSZXBvc2l0b3J5IH0gZnJvbSAnQG5lc3Rqcy90eXBlb3JtJztcbmltcG9ydCB7IEJsb2NrSW5mb3JtYXRpb24gfSBmcm9tICdjb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC9ibG9ja0luZm9ybWF0aW9uLmVudGl0eSc7XG5pbXBvcnQgeyBUcmFuc2FjdGlvbkluZm8gfSBmcm9tICdjb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC90cmFuc2FjdGlvbkluZm8uZW50aXR5JztcbmltcG9ydCB7IFJlcG9zaXRvcnksIENvbm5lY3Rpb24gfSBmcm9tICd0eXBlb3JtJztcbmltcG9ydCB7IFRTX1NUQVRVUyB9IGZyb20gJ2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L3RzU3RhdHVzLmVudW0nO1xuaW1wb3J0IHsgcmVjdXJzaXZlVG9TdHJpbmcgfSBmcm9tICdAdHMtc2RrL2RvbWFpbi9saWIvaGVscGVyJztcbmltcG9ydCB7IFRzUm9sbHVwQ29uZmlnVHlwZSwgUm9sbHVwU3RhdHVzLCBDaXJjdWl0QWNjb3VudFR4UGF5bG9hZCwgQ2lyY3VpdE9yZGVyVHhQYXlsb2FkLCBDaXJjdWl0TnVsbGlmaWVyVHhQYXlsb2FkIH0gZnJvbSAnQHRzLXNkay9kb21haW4vbGliL3RzLXJvbGx1cC90cy1yb2xsdXAnO1xuaW1wb3J0IHsgZW5jb2RlUm9sbHVwV2l0aGRyYXdNZXNzYWdlIH0gZnJvbSAnQHRzLXNkay9kb21haW4vbGliL3RzLXJvbGx1cC90cy1yb2xsdXAtaGVscGVyJztcbmltcG9ydCB7IHR4c1RvUm9sbHVwQ2lyY3VpdElucHV0LCBlbmNvZGVSQ2h1bmtCdWZmZXIsIGJpZ2ludF90b19jaHVua19hcnJheSB9IGZyb20gJ0B0cy1zZGsvZG9tYWluL2xpYi90cy1yb2xsdXAvdHMtdHgtaGVscGVyJztcbmltcG9ydCB7IFRzUm9sbHVwQ2lyY3VpdElucHV0VHlwZSwgVHNSb2xsdXBDaXJjdWl0SW5wdXRJdGVtVHlwZSB9IGZyb20gJ0B0cy1zZGsvZG9tYWluL2xpYi90cy10eXBlcy90cy1jaXJjdWl0LXR5cGVzJztcbmltcG9ydCB7IFR4Tm9vcCwgQ0hVTktfQklUU19TSVpFLCBNQVhfQ0hVTktTX1BFUl9SRVEsIFRzVHhUeXBlLCBUc1N5c3RlbUFjY291bnRBZGRyZXNzLCBUc1Rva2VuQWRkcmVzcywgVHNUeFJlcXVlc3REYXRhc1R5cGUgfSBmcm9tICdAdHMtc2RrL2RvbWFpbi9saWIvdHMtdHlwZXMvdHMtdHlwZXMnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHsgZHBQb3NlaWRvbkhhc2ggfSBmcm9tICdAdHMtc2RrL2RvbWFpbi9saWIvcG9zZWlkb24taGFzaC1kcCc7XG5pbXBvcnQgeyBUc0FjY291bnRUcmVlU2VydmljZSB9IGZyb20gJ0Bjb21tb24vdHMtdHlwZW9ybS9hY2NvdW50L3RzQWNjb3VudFRyZWUuc2VydmljZSc7XG5pbXBvcnQgeyBUc1Rva2VuVHJlZVNlcnZpY2UgfSBmcm9tICdAY29tbW9uL3RzLXR5cGVvcm0vYWNjb3VudC90c1Rva2VuVHJlZS5zZXJ2aWNlJztcbmltcG9ydCB7IE9ic09yZGVyVHJlZVNlcnZpY2UgfSBmcm9tICdAY29tbW9uL3RzLXR5cGVvcm0vYXVjdGlvbk9yZGVyL29ic09yZGVyVHJlZS5zZXJ2aWNlJztcbmltcG9ydCB7IEFjY291bnRMZWFmTm9kZSB9IGZyb20gJ0Bjb21tb24vdHMtdHlwZW9ybS9hY2NvdW50L2FjY291bnRMZWFmTm9kZS5lbnRpdHknO1xuaW1wb3J0IHsgT2JzT3JkZXJMZWFmRW50aXR5IH0gZnJvbSAnQGNvbW1vbi90cy10eXBlb3JtL2F1Y3Rpb25PcmRlci9vYnNPcmRlckxlYWYuZW50aXR5JztcbmltcG9ydCB7IGdldERlZmF1bHRBY2NvdW50TGVhZk1lc3NhZ2UsIGdldERlZmF1bHRPYnNPcmRlckxlYWZNZXNzYWdlLCBnZXREZWZhdWx0VG9rZW5MZWFmTWVzc2FnZSB9IGZyb20gJ0Bjb21tb24vdHMtdHlwZW9ybS9hY2NvdW50L2hlbHBlci9ta0FjY291bnQuaGVscGVyJztcbmltcG9ydCB7IEFjY291bnRJbmZvcm1hdGlvbiB9IGZyb20gJ0Bjb21tb24vdHMtdHlwZW9ybS9hY2NvdW50L2FjY291bnRJbmZvcm1hdGlvbi5lbnRpdHknO1xuaW1wb3J0IHsgVXBkYXRlT2JzT3JkZXJUcmVlRHRvIH0gZnJvbSAnQGNvbW1vbi90cy10eXBlb3JtL2F1Y3Rpb25PcmRlci9kdG8vdXBkYXRlT2JzT3JkZXJUcmVlLmR0byc7XG5pbXBvcnQgeyBCTE9DS19TVEFUVVMgfSBmcm9tICdAY29tbW9uL3RzLXR5cGVvcm0vYWNjb3VudC9ibG9ja1N0YXR1cy5lbnVtJztcbmltcG9ydCB7IE9ic09yZGVyRW50aXR5IH0gZnJvbSAnQGNvbW1vbi90cy10eXBlb3JtL2F1Y3Rpb25PcmRlci9vYnNPcmRlci5lbnRpdHknO1xuXG5jb25zdCBEZWZhdWx0Um9sbHVwQ29uZmlnOiBUc1JvbGx1cENvbmZpZ1R5cGUgPSB7XG4gIG9yZGVyX3RyZWVfaGVpZ2h0OiA4LFxuICBsMl9hY2NfYWRkcl9zaXplOiA4LFxuICB0b2tlbl90cmVlX2hlaWdodDogNCxcbiAgbnVsbGlmaWVyX3RyZWVfaGVpZ2h0OiA4LFxuICBudW1PZlJlcXM6IDIwLFxuICBudW1PZkNodW5rczogNTAsXG5cbiAgcmVnaXN0ZXJfYmF0Y2hfc2l6ZTogMSxcbiAgbDJfdG9rZW5fYWRkcl9zaXplOiAzMixcbiAgYXVjdGlvbl9tYXJrZXRfY291bnQ6IDgsXG4gIGF1Y3Rpb25fbGVuZGVyX2NvdW50OiA4LFxuICBhdWN0aW9uX2JvcnJvd2VyX2NvdW50OiA4LFxufTtcblxuQEJ1bGxXb3JrZXIoe1xuICBxdWV1ZU5hbWU6IFRzV29ya2VyTmFtZS5TRVFVRU5DRVIsXG4gIG9wdGlvbnM6IHtcbiAgICBjb25jdXJyZW5jeTogMSxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgU2VxdWVuY2VyQ29uc3VtZXIge1xuICBAQnVsbFdvcmtlclByb2Nlc3Moe1xuICAgIGF1dG9ydW46IHRydWUsXG4gIH0pXG4gIGFzeW5jIHByb2Nlc3Moam9iOiBKb2I8VHJhbnNhY3Rpb25JbmZvPikge1xuICAgIHRoaXMubG9nZ2VyLmxvZyhgU0VRVUVOQ0VSLnByb2Nlc3MgJHtqb2IuZGF0YS50eElkfSBzdGFydGApO1xuICAgIGNvbnNvbGUubG9nKHtcbiAgICAgIGxvZzogJ1NFUVVFTkNFUi5wcm9jZXNzIHN0YXJ0J1xuICAgIH0pO1xuICAgIGNvbnN0IHJlcSA9IGF3YWl0IHRoaXMudHhSZXBvc2l0b3J5LmZpbmRPbmUoe1xuICAgICAgd2hlcmU6IHsgIFxuICAgICAgICB0eElkOiBqb2IuZGF0YS50eElkLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBpZighcmVxKSB7XG4gICAgICB0aGlzLmxvZ2dlci5sb2coYFNFUVVFTkNFUi5wcm9jZXNzICR7am9iLmRhdGEudHhJZH0gbm90IGZvdW5kYCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJlcS50eFN0YXR1cyA9IFRTX1NUQVRVUy5QUk9DRVNTSU5HO1xuICAgIHRoaXMudHhSZXBvc2l0b3J5LnNhdmUocmVxKTtcbiAgICBjb25zb2xlLmxvZyh7XG4gICAgICBsb2c6ICdTRVFVRU5DRVIuZG9UcmFuc2FjdGlvbiBzdGFydCdcbiAgICB9KTtcbiAgICBhd2FpdCB0aGlzLmRvVHJhbnNhY3Rpb24ocmVxKTtcbiAgICB0aGlzLmxvZ2dlci5sb2coYFNFUVVFTkNFUi5wcm9jZXNzICR7am9iLmRhdGEudHhJZH0gZG9uZWApO1xuICAgIGF3YWl0IHRoaXMudHhSZXBvc2l0b3J5LnVwZGF0ZShcbiAgICAgIHtcbiAgICAgICAgdHhJZDogcmVxLnR4SWQsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0eFN0YXR1czogVFNfU1RBVFVTLkwyRVhFQ1VURUQsXG4gICAgICB9LFxuICAgICk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlcjogUGlub0xvZ2dlclNlcnZpY2UsXG4gICAgQEluamVjdFJlcG9zaXRvcnkoVHJhbnNhY3Rpb25JbmZvKVxuICAgIHByaXZhdGUgdHhSZXBvc2l0b3J5OiBSZXBvc2l0b3J5PFRyYW5zYWN0aW9uSW5mbz4sXG4gICAgQEluamVjdFJlcG9zaXRvcnkoQmxvY2tJbmZvcm1hdGlvbilcbiAgICBwcml2YXRlIGJsb2NrUmVwb3NpdG9yeTogUmVwb3NpdG9yeTxCbG9ja0luZm9ybWF0aW9uPixcbiAgICBASW5qZWN0UmVwb3NpdG9yeShBY2NvdW50TGVhZk5vZGUpXG4gICAgcHJpdmF0ZSBhY2NvdW50TGVhZk5vZGVSZXBvc2l0b3J5OiBSZXBvc2l0b3J5PEFjY291bnRMZWFmTm9kZT4sXG4gICAgQEluamVjdFJlcG9zaXRvcnkoQWNjb3VudEluZm9ybWF0aW9uKVxuICAgIHByaXZhdGUgYWNjb3VudEluZm9SZXBvc2l0b3J5OiBSZXBvc2l0b3J5PEFjY291bnRJbmZvcm1hdGlvbj4sXG4gICAgQEluamVjdFJlcG9zaXRvcnkoT2JzT3JkZXJFbnRpdHkpXG4gICAgcHJpdmF0ZSBvYnNPcmRlclJlcG9zaXRvcnk6IFJlcG9zaXRvcnk8T2JzT3JkZXJFbnRpdHk+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgdHNBY2NvdW50VHJlZVNlcnZpY2U6IFRzQWNjb3VudFRyZWVTZXJ2aWNlLCAgXG4gICAgcHJpdmF0ZSByZWFkb25seSB0c1Rva2VuVHJlZVNlcnZpY2U6IFRzVG9rZW5UcmVlU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IG9ic09yZGVyVHJlZVNlcnZpY2U6IE9ic09yZGVyVHJlZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSBjb25uZWN0aW9uOiBDb25uZWN0aW9uLFxuICApIHtcbiAgICB0aGlzLmxvZ2dlci5sb2coJ1NFUVVFTkNFUi5wcm9jZXNzIFNUQVJUJyk7XG4gICAgdGhpcy5jb25maWcgPSBEZWZhdWx0Um9sbHVwQ29uZmlnO1xuICB9XG4gIFxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFRPRE86IGFtdF9zaXplLCBsMl90b2tlbl9hZGRyX3NpemVcbiAgcHVibGljIGNvbmZpZzogVHNSb2xsdXBDb25maWdUeXBlID0gRGVmYXVsdFJvbGx1cENvbmZpZztcbiAgZ2V0IHR4Tm9ybWFsUGVyQmF0Y2goKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLm51bU9mUmVxcztcbiAgfVxuICBnZXQgdHhSZWdpc3RlclBlckJhdGNoKCkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZy5yZWdpc3Rlcl9iYXRjaF9zaXplO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIHN0YXRlUm9vdCgpIHtcbiAgICBjb25zdCBhY2NvdW50VHJlZVJvb3QgPSAoYXdhaXQgdGhpcy50c0FjY291bnRUcmVlU2VydmljZS5nZXRSb290KCkpLmhhc2g7XG4gICAgY29uc3Qgb3JkZXJUcmVlUm9vdCA9IChhd2FpdCB0aGlzLm9ic09yZGVyVHJlZVNlcnZpY2UuZ2V0Um9vdCgpKS5oYXNoO1xuICAgIGNvbnN0IG9yaVR4TnVtID0gdGhpcy5vcmlUeElkO1xuICAgIGNvbnN0IG9yaVRzUm9vdCA9XG4gICAgICAnMHgnICtcbiAgICAgIGRwUG9zZWlkb25IYXNoKFtCaWdJbnQob3JkZXJUcmVlUm9vdCksIG9yaVR4TnVtXSlcbiAgICAgICAgLnRvU3RyaW5nKDE2KVxuICAgICAgICAucGFkU3RhcnQoNjQsICcwJyk7XG4gICAgY29uc3Qgb3JpU3RhdGVSb290ID1cbiAgICAgICcweCcgK1xuICAgICAgZHBQb3NlaWRvbkhhc2goW0JpZ0ludChvcmlUc1Jvb3QpLCBCaWdJbnQoYWNjb3VudFRyZWVSb290KV0pXG4gICAgICAgIC50b1N0cmluZygxNilcbiAgICAgICAgLnBhZFN0YXJ0KDY0LCAnMCcpO1xuICAgIHJldHVybiBvcmlTdGF0ZVJvb3Q7XG4gIH1cbiAgcHVibGljIHJvbGx1cFN0YXR1czogUm9sbHVwU3RhdHVzID0gUm9sbHVwU3RhdHVzLklkbGU7XG5cbiAgLyoqIEJsb2NrIGluZm9ybWF0aW9uICovXG4gIHB1YmxpYyBibG9ja051bWJlciA9IDBuO1xuICBwdWJsaWMgb3JpVHhJZCA9IDBuO1xuICBnZXQgbGF0ZXN0VHhJZCgpIHtcbiAgICByZXR1cm4gdGhpcy5vcmlUeElkICsgQmlnSW50KHRoaXMuY3VycmVudFR4TG9ncy5sZW5ndGgpO1xuICB9XG4gIHByaXZhdGUgY3VycmVudFR4TG9nczogYW55W10gPSBbXTtcbiAgcHJpdmF0ZSBjdXJyZW50QWNjb3VudFJvb3RGbG93OiBiaWdpbnRbXSA9IFtdO1xuICBwcml2YXRlIGN1cnJlbnRPcmRlclJvb3RGbG93OiBiaWdpbnRbXSA9IFtdO1xuICAvKiogVHJhbnNhY3Rpb24gSW5mb3JtYXRpb24gKi9cbiAgcHJpdmF0ZSBjdXJyZW50QWNjb3VudFBheWxvYWQ6IENpcmN1aXRBY2NvdW50VHhQYXlsb2FkID0gdGhpcy5wcmVwYXJlVHhBY2NvdW50UGF5bG9hZCgpO1xuICBwcml2YXRlIGN1cnJlbnRPcmRlclBheWxvYWQ6IENpcmN1aXRPcmRlclR4UGF5bG9hZCA9IHRoaXMucHJlcGFyZVR4T3JkZXJQYXlsb2FkKCk7XG5cbiAgcHJpdmF0ZSBibG9ja0xvZ3M6IE1hcDxcbiAgICBzdHJpbmcsXG4gICAge1xuICAgICAgbG9nczogYW55W107XG4gICAgICBhY2NvdW50Um9vdEZsb3c6IGJpZ2ludFtdO1xuICAgICAgYXVjdGlvbk9yZGVyUm9vdEZsb3c6IGJpZ2ludFtdO1xuICAgIH1cbiAgPiA9IG5ldyBNYXAoKTtcblxuICAvKiogT3JkZXIgKi9cbiAgYXN5bmMgZ2V0T2JzT3JkZXIob3JkZXJJZDogc3RyaW5nKTogUHJvbWlzZTxPYnNPcmRlckxlYWZFbnRpdHkgfCBudWxsPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMub2JzT3JkZXJUcmVlU2VydmljZS5nZXRMZWFmKG9yZGVySWQpO1xuICB9XG5cbiAgLyoqIEFjY291bnQgKi9cbiAgYXN5bmMgZ2V0QWNjb3VudChhY2NBZGRyOiBzdHJpbmcpOiBQcm9taXNlPEFjY291bnRMZWFmTm9kZSB8IG51bGw+IHtcbiAgICBjb25zdCBhY2MgPSBhd2FpdCB0aGlzLnRzQWNjb3VudFRyZWVTZXJ2aWNlLmdldExlYWYoYWNjQWRkcik7XG5cbiAgICBpZiAoYWNjLnRzQWRkciA9PT0gJzAnIHx8ICFhY2MpIHtcbiAgICAgIC8vIFRPRE86IGNoZWNrIGFjY291bnQgaXMgZXhpc3RcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gYWNjO1xuICB9XG5cbiAgYWRkQWNjb3VudChsMmFkZHI6IGJpZ2ludCwgYWNjb3VudDoge1xuICAgIGwyQWRkcjogYmlnaW50O1xuICAgIHRzQWRkcjogYmlnaW50O1xuICB9KTogYmlnaW50IHtcbiAgICAvLyBUT0RPOiBjaGVjayBhY2NvdW50IGlzIGV4aXN0XG4gICAgLy8gVE9ETzogY2hlY2sgcmVnaXN0ZXIgaGFzIHRva2VuSW5mb1xuICAgIHRoaXMudHNBY2NvdW50VHJlZVNlcnZpY2UuYWRkTGVhZih7XG4gICAgICBsZWFmSWQ6IGwyYWRkci50b1N0cmluZygpLFxuICAgICAgdHNBZGRyOiBhY2NvdW50LnRzQWRkci50b1N0cmluZygpLFxuICAgIH0pO1xuICAgIHJldHVybiBsMmFkZHI7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHVwZGF0ZUFjY291bnRUb2tlbihsZWFmX2lkOiBzdHJpbmcsIHRva2VuQWRkcjogVHNUb2tlbkFkZHJlc3MsIHRva2VuQW10OiBiaWdpbnQsIGxvY2tlZEFtdDogYmlnaW50KSB7XG4gICAgY29uc3QgYWNjID0gdGhpcy5nZXRBY2NvdW50KGxlYWZfaWQpO1xuICAgIGlmICghYWNjKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVwZGF0ZUFjY291bnRUb2tlbjogYWNjb3VudCBpZD0ke2xlYWZfaWR9IG5vdCBmb3VuZGApO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLnRzQWNjb3VudFRyZWVTZXJ2aWNlLnVwZGF0ZVRva2VuTGVhZihsZWFmX2lkLCB7XG4gICAgICBsb2NrZWRBbXQ6IGxvY2tlZEFtdC50b1N0cmluZygpLFxuICAgICAgYXZhaWxhYmxlQW10OiB0b2tlbkFtdC50b1N0cmluZygpLFxuICAgICAgbGVhZklkOiB0b2tlbkFkZHIsXG4gICAgICBhY2NvdW50SWQ6IGxlYWZfaWQsXG4gICAgfSk7XG4gIH1cbiAgcHJpdmF0ZSBhc3luYyB1cGRhdGVBY2NvdW50Tm9uY2UobGVhZl9pZDogc3RyaW5nLCBub25jZTogYmlnaW50KSB7XG4gICAgY29uc3QgYWNjID0gYXdhaXQgdGhpcy5nZXRBY2NvdW50KGxlYWZfaWQpO1xuICAgIGlmICghYWNjKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVwZGF0ZUFjY291bnROb25jZTogYWNjb3VudCBpZD0ke2xlYWZfaWR9IG5vdCBmb3VuZGApO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLnRzQWNjb3VudFRyZWVTZXJ2aWNlLnVwZGF0ZUxlYWYobGVhZl9pZCwge1xuICAgICAgbGVhZklkOiBsZWFmX2lkLFxuICAgICAgbm9uY2U6IG5vbmNlLnRvU3RyaW5nKCksXG4gICAgfSk7XG4gIH1cblxuICAvKiogUm9sbHVwIHRyYWNlICovXG4gIHByaXZhdGUgYWRkRmlyc3RSb290RmxvdygpIHtcbiAgICBpZiAodGhpcy5jdXJyZW50QWNjb3VudFJvb3RGbG93Lmxlbmd0aCAhPT0gMCB8fCB0aGlzLmN1cnJlbnRPcmRlclJvb3RGbG93Lmxlbmd0aCAhPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdhZGRGaXJzdFJvb3RGbG93IG11c3QgcnVuIG9uIG5ldyBibG9jaycpO1xuICAgIH1cbiAgICB0aGlzLmFkZEFjY291bnRSb290RmxvdygpO1xuICAgIHRoaXMuYWRkT3JkZXJSb290RmxvdygpO1xuICB9XG5cbiAgcHJpdmF0ZSBmbHVzaEJsb2NrKGJsb2NrbnVtYmVyOiBiaWdpbnQpIHtcbiAgICBpZiAodGhpcy5ibG9ja0xvZ3MuaGFzKGJsb2NrbnVtYmVyLnRvU3RyaW5nKCkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEJsb2NrICR7YmxvY2tudW1iZXJ9IGFscmVhZHkgZXhpc3RgKTtcbiAgICB9XG4gICAgY29uc3QgbG9ncyA9IHsgLi4udGhpcy5jdXJyZW50VHhMb2dzIH07XG4gICAgY29uc3QgYWNjb3VudFJvb3RGbG93ID0gWy4uLnRoaXMuY3VycmVudEFjY291bnRSb290Rmxvd107XG4gICAgY29uc3QgYXVjdGlvbk9yZGVyUm9vdEZsb3cgPSBbLi4udGhpcy5jdXJyZW50T3JkZXJSb290Rmxvd107XG4gICAgdGhpcy5ibG9ja051bWJlciA9IGJsb2NrbnVtYmVyO1xuICAgIHRoaXMuY3VycmVudEFjY291bnRSb290RmxvdyA9IFtdO1xuICAgIHRoaXMuY3VycmVudE9yZGVyUm9vdEZsb3cgPSBbXTtcbiAgICB0aGlzLmN1cnJlbnRUeExvZ3MgPSBbXTtcblxuICAgIHRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkID0gdGhpcy5wcmVwYXJlVHhBY2NvdW50UGF5bG9hZCgpO1xuICAgIHRoaXMuY3VycmVudE9yZGVyUGF5bG9hZCA9IHRoaXMucHJlcGFyZVR4T3JkZXJQYXlsb2FkKCk7XG5cbiAgICAvLyBUT0RPOiBibG9ja0xvZ3NcbiAgICByZXR1cm4ge1xuICAgICAgbG9ncyxcbiAgICAgIGFjY291bnRSb290RmxvdyxcbiAgICAgIGF1Y3Rpb25PcmRlclJvb3RGbG93LFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGFkZEFjY291bnRSb290RmxvdygpIHtcbiAgICBjb25zdCByb290ID0gYXdhaXQgdGhpcy50c0FjY291bnRUcmVlU2VydmljZS5nZXRSb290KCk7XG4gICAgdGhpcy5jdXJyZW50QWNjb3VudFJvb3RGbG93LnB1c2goQmlnSW50KHJvb3QuaGFzaCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBhZGRPcmRlclJvb3RGbG93KCkge1xuICAgIGNvbnN0IHJvb3QgPSBhd2FpdCB0aGlzLm9ic09yZGVyVHJlZVNlcnZpY2UuZ2V0Um9vdCgpO1xuICAgIHRoaXMuY3VycmVudE9yZGVyUm9vdEZsb3cucHVzaChCaWdJbnQocm9vdC5oYXNoKSk7XG4gIH1cblxuICBwcml2YXRlIGFkZFR4TG9ncyhkZXRhaWw6IGFueSkge1xuICAgIHRoaXMuY3VycmVudFR4TG9ncy5wdXNoKGRldGFpbCk7XG4gIH1cblxuICAvKiogUm9sbHVwIFRyYW5zYWN0aW9uICovXG4gIHB1YmxpYyBuZXdCbG9ja051bWJlciA9IDBuO1xuICBhc3luYyBzdGFydFJvbGx1cCgpOiBQcm9taXNlPHtcbiAgICBibG9ja051bWJlcjogYmlnaW50O1xuICB9PiB7XG4gICAgaWYgKHRoaXMucm9sbHVwU3RhdHVzID09PSBSb2xsdXBTdGF0dXMuUnVubmluZykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSb2xsdXAgaXMgcnVubmluZycpO1xuICAgIH1cbiAgICB0aGlzLnJvbGx1cFN0YXR1cyA9IFJvbGx1cFN0YXR1cy5SdW5uaW5nO1xuICAgIGNvbnN0IHIgPSBhd2FpdCB0aGlzLmJsb2NrUmVwb3NpdG9yeS5pbnNlcnQoe1xuICAgICAgYmxvY2tIYXNoOiAnJyxcbiAgICAgIEwxVHJhbnNhY3Rpb25IYXNoOiAnJyxcbiAgICAgIHZlcmlmaWVkQXQ6IG5ldyBEYXRlKDApLFxuICAgICAgYmxvY2tTdGF0dXM6IEJMT0NLX1NUQVRVUy5QUk9DRVNTSU5HLFxuICAgICAgb3BlcmF0b3JBZGRyZXNzOiAnJyxcbiAgICB9KTtcbiAgICBjb25zdCBuZXdCbG9jayA9IHIuaWRlbnRpZmllcnNbMF07XG4gICAgdGhpcy5uZXdCbG9ja051bWJlciA9IEJpZ0ludChuZXdCbG9jay5ibG9ja051bWJlciB8fCAwKTtcbiAgICB0aGlzLmFkZEZpcnN0Um9vdEZsb3coKTtcbiAgICByZXR1cm4ge1xuICAgICAgYmxvY2tOdW1iZXI6IHRoaXMubmV3QmxvY2tOdW1iZXIsXG4gICAgfTtcblxuICB9XG5cbiAgYXN5bmMgZW5kUm9sbHVwKCk6IFByb21pc2U8e1xuICAgIGlucHV0czogVHNSb2xsdXBDaXJjdWl0SW5wdXRUeXBlO1xuICB9PiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuY29ubmVjdGlvbi50cmFuc2FjdGlvbihhc3luYyAobWFuYWdlcikgPT4ge1xuICAgICAgdGhpcy5yb2xsdXBTdGF0dXMgPSBSb2xsdXBTdGF0dXMuSWRsZTtcbiAgICAgIGNvbnN0IGN1cnJlbnRCbG9ja051bWJlciA9IHRoaXMubmV3QmxvY2tOdW1iZXI7XG4gICAgICBjb25zdCBjdXJyZW50Qmxjb2sgPSBhd2FpdCBtYW5hZ2VyLmZpbmRPbmVCeU9yRmFpbChCbG9ja0luZm9ybWF0aW9uLCB7XG4gICAgICAgIGJsb2NrTnVtYmVyOiBOdW1iZXIoY3VycmVudEJsb2NrTnVtYmVyKSxcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBwZXJCYXRjaCA9IHRoaXMudHhOb3JtYWxQZXJCYXRjaDtcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRUeExvZ3MubGVuZ3RoICE9PSBwZXJCYXRjaCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgUm9sbHVwIHR4TnVtYmVycz0ke3RoaXMuY3VycmVudFR4TG9ncy5sZW5ndGh9IG5vdCBtYXRjaCB0eFBlckJhdGNoPSR7cGVyQmF0Y2h9YCk7XG4gICAgICAgIGNvbnN0IGVtcHR5VHhOdW0gPSBwZXJCYXRjaCAtIHRoaXMuY3VycmVudFR4TG9ncy5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZW1wdHlUeE51bTsgaSsrKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5kb1RyYW5zYWN0aW9uKFR4Tm9vcCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgXG4gICAgICBjb25zdCBjaXJjdWl0SW5wdXRzID0gdHhzVG9Sb2xsdXBDaXJjdWl0SW5wdXQodGhpcy5jdXJyZW50VHhMb2dzKSBhcyBhbnk7XG4gICAgICAvLyBUT0RPOiB0eXBlIGNoZWNrXG4gIFxuICAgICAgY2lyY3VpdElucHV0c1snb19jaHVua3MnXSA9IGNpcmN1aXRJbnB1dHNbJ29fY2h1bmtzJ10uZmxhdCgpO1xuICAgICAgY29uc3Qgb19jaHVua19yZW1haW5zID0gdGhpcy5jb25maWcubnVtT2ZDaHVua3MgLSBjaXJjdWl0SW5wdXRzWydvX2NodW5rcyddLmxlbmd0aDtcbiAgICAgIGNpcmN1aXRJbnB1dHNbJ2lzQ3JpdGljYWxDaHVuayddID0gY2lyY3VpdElucHV0c1snaXNDcml0aWNhbENodW5rJ10uZmxhdCgpO1xuICAgICAgYXNzZXJ0KFxuICAgICAgICBjaXJjdWl0SW5wdXRzWydpc0NyaXRpY2FsQ2h1bmsnXS5sZW5ndGggPT09IGNpcmN1aXRJbnB1dHNbJ29fY2h1bmtzJ10ubGVuZ3RoLFxuICAgICAgICBgaXNDcml0aWNhbENodW5rPSR7Y2lyY3VpdElucHV0c1snaXNDcml0aWNhbENodW5rJ10ubGVuZ3RofSBsZW5ndGggbm90IG1hdGNoIG9fY2h1bmtzPSR7Y2lyY3VpdElucHV0c1snb19jaHVua3MnXS5sZW5ndGh9IGAsXG4gICAgICApO1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG9fY2h1bmtfcmVtYWluczsgaW5kZXgrKykge1xuICAgICAgICBjaXJjdWl0SW5wdXRzWydvX2NodW5rcyddLnB1c2goJzAnKTtcbiAgICAgICAgY2lyY3VpdElucHV0c1snaXNDcml0aWNhbENodW5rJ10ucHVzaCgnMCcpO1xuICAgICAgfVxuICAgICAgYXNzZXJ0KFxuICAgICAgICBjaXJjdWl0SW5wdXRzWydvX2NodW5rcyddLmxlbmd0aCA9PT0gdGhpcy5jb25maWcubnVtT2ZDaHVua3MsXG4gICAgICAgIGBvX2NodW5rcz0ke2NpcmN1aXRJbnB1dHNbJ29fY2h1bmtzJ10ubGVuZ3RofSBsZW5ndGggbm90IG1hdGNoIG51bU9mQ2h1bmtzPSR7dGhpcy5jb25maWcubnVtT2ZDaHVua3N9IGAsXG4gICAgICApO1xuICAgICAgYXNzZXJ0KFxuICAgICAgICBjaXJjdWl0SW5wdXRzWydpc0NyaXRpY2FsQ2h1bmsnXS5sZW5ndGggPT09IHRoaXMuY29uZmlnLm51bU9mQ2h1bmtzLFxuICAgICAgICBgaXNDcml0aWNhbENodW5rPSR7Y2lyY3VpdElucHV0c1snaXNDcml0aWNhbENodW5rJ10ubGVuZ3RofSBsZW5ndGggbm90IG1hdGNoIG51bU9mQ2h1bmtzPSR7dGhpcy5jb25maWcubnVtT2ZDaHVua3N9IGAsXG4gICAgICApO1xuICAgICAgLy8gVE9ETzogaG90Zml4XG4gICAgICBjaXJjdWl0SW5wdXRzWydyX2FjY291bnRMZWFmSWQnXSA9IGNpcmN1aXRJbnB1dHNbJ3JfYWNjb3VudExlYWZJZCddWzBdO1xuICAgICAgY2lyY3VpdElucHV0c1sncl9vcmlBY2NvdW50TGVhZiddID0gY2lyY3VpdElucHV0c1sncl9vcmlBY2NvdW50TGVhZiddWzBdO1xuICAgICAgY2lyY3VpdElucHV0c1sncl9uZXdBY2NvdW50TGVhZiddID0gY2lyY3VpdElucHV0c1sncl9uZXdBY2NvdW50TGVhZiddWzBdO1xuICAgICAgY2lyY3VpdElucHV0c1sncl9hY2NvdW50Um9vdEZsb3cnXSA9IGNpcmN1aXRJbnB1dHNbJ3JfYWNjb3VudFJvb3RGbG93J11bMF07XG4gICAgICBjaXJjdWl0SW5wdXRzWydyX2FjY291bnRNa1ByZiddID0gY2lyY3VpdElucHV0c1sncl9hY2NvdW50TWtQcmYnXVswXTtcbiAgICAgIGNpcmN1aXRJbnB1dHNbJ3JfdG9rZW5MZWFmSWQnXSA9IGNpcmN1aXRJbnB1dHNbJ3JfdG9rZW5MZWFmSWQnXVswXTtcbiAgICAgIGNpcmN1aXRJbnB1dHNbJ3Jfb3JpVG9rZW5MZWFmJ10gPSBjaXJjdWl0SW5wdXRzWydyX29yaVRva2VuTGVhZiddWzBdO1xuICAgICAgY2lyY3VpdElucHV0c1sncl9uZXdUb2tlbkxlYWYnXSA9IGNpcmN1aXRJbnB1dHNbJ3JfbmV3VG9rZW5MZWFmJ11bMF07XG4gICAgICBjaXJjdWl0SW5wdXRzWydyX3Rva2VuUm9vdEZsb3cnXSA9IGNpcmN1aXRJbnB1dHNbJ3JfdG9rZW5Sb290RmxvdyddWzBdO1xuICAgICAgY2lyY3VpdElucHV0c1sncl90b2tlbk1rUHJmJ10gPSBjaXJjdWl0SW5wdXRzWydyX3Rva2VuTWtQcmYnXVswXTtcbiAgICAgIGNpcmN1aXRJbnB1dHNbJ3Jfb3JkZXJMZWFmSWQnXSA9IGNpcmN1aXRJbnB1dHNbJ3Jfb3JkZXJMZWFmSWQnXVswXTtcbiAgICAgIGNpcmN1aXRJbnB1dHNbJ3Jfb3JpT3JkZXJMZWFmJ10gPSBjaXJjdWl0SW5wdXRzWydyX29yaU9yZGVyTGVhZiddWzBdO1xuICAgICAgY2lyY3VpdElucHV0c1sncl9uZXdPcmRlckxlYWYnXSA9IGNpcmN1aXRJbnB1dHNbJ3JfbmV3T3JkZXJMZWFmJ11bMF07XG4gICAgICBjaXJjdWl0SW5wdXRzWydyX29yZGVyUm9vdEZsb3cnXSA9IGNpcmN1aXRJbnB1dHNbJ3Jfb3JkZXJSb290RmxvdyddWzBdO1xuICAgICAgY2lyY3VpdElucHV0c1sncl9vcmRlck1rUHJmJ10gPSBjaXJjdWl0SW5wdXRzWydyX29yZGVyTWtQcmYnXVswXTtcbiAgXG4gICAgICBjaXJjdWl0SW5wdXRzWydvcmlUeE51bSddID0gdGhpcy5vcmlUeElkLnRvU3RyaW5nKCk7XG4gICAgICBjaXJjdWl0SW5wdXRzWydhY2NvdW50Um9vdEZsb3cnXSA9IHRoaXMuY3VycmVudEFjY291bnRSb290Rmxvdy5tYXAoKHgpID0+IHJlY3Vyc2l2ZVRvU3RyaW5nKHgpKTtcbiAgICAgIGNpcmN1aXRJbnB1dHNbJ29yZGVyUm9vdEZsb3cnXSA9IHRoaXMuY3VycmVudE9yZGVyUm9vdEZsb3cubWFwKCh4KSA9PiByZWN1cnNpdmVUb1N0cmluZyh4KSk7XG4gICAgICB0aGlzLm9yaVR4SWQgPSB0aGlzLmxhdGVzdFR4SWQ7XG4gICAgICB0aGlzLmZsdXNoQmxvY2soY3VycmVudEJsb2NrTnVtYmVyKTtcblxuICAgICAgY3VycmVudEJsY29rLmJsb2NrU3RhdHVzID0gQkxPQ0tfU1RBVFVTLkwyRVhFQ1VURUQ7XG4gICAgICBjdXJyZW50Qmxjb2sucmF3RGF0YSA9IEpTT04uc3RyaW5naWZ5KGNpcmN1aXRJbnB1dHMpO1xuICAgICAgYXdhaXQgbWFuYWdlci5zYXZlKGN1cnJlbnRCbGNvayk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpbnB1dHM6IGNpcmN1aXRJbnB1dHMsXG4gICAgICB9O1xuICAgIH0pO1xuXG4gIH1cblxuICBwcml2YXRlIHByZXBhcmVUeEFjY291bnRQYXlsb2FkKCkge1xuICAgIHJldHVybiB7XG4gICAgICByX2FjY291bnRMZWFmSWQ6IFtdLFxuICAgICAgcl9vcmlBY2NvdW50TGVhZjogW10sXG4gICAgICByX25ld0FjY291bnRMZWFmOiBbXSxcbiAgICAgIHJfYWNjb3VudFJvb3RGbG93OiBbXSxcbiAgICAgIHJfYWNjb3VudE1rUHJmOiBbXSxcbiAgICAgIHJfdG9rZW5MZWFmSWQ6IFtdLFxuICAgICAgcl9vcmlUb2tlbkxlYWY6IFtdLFxuICAgICAgcl9uZXdUb2tlbkxlYWY6IFtdLFxuICAgICAgcl90b2tlblJvb3RGbG93OiBbXSxcbiAgICAgIHJfdG9rZW5Na1ByZjogW10sXG4gICAgfSBhcyBDaXJjdWl0QWNjb3VudFR4UGF5bG9hZDtcbiAgfVxuXG4gIHByaXZhdGUgcHJlcGFyZVR4T3JkZXJQYXlsb2FkKCkge1xuICAgIHJldHVybiB7XG4gICAgICByX29yZGVyTGVhZklkOiBbXSxcbiAgICAgIHJfb3JpT3JkZXJMZWFmOiBbXSxcbiAgICAgIHJfbmV3T3JkZXJMZWFmOiBbXSxcbiAgICAgIHJfb3JkZXJSb290RmxvdzogW10sXG4gICAgICByX29yZGVyTWtQcmY6IFtdLFxuICAgIH0gYXMgQ2lyY3VpdE9yZGVyVHhQYXlsb2FkO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyB0b2tlbkJlZm9yZVVwZGF0ZShhY2NvdW50TGVhZklkOiBzdHJpbmcsIHRva2VuQWRkcjogVHNUb2tlbkFkZHJlc3MpIHtcbiAgICBjb25zdCBhY2NvdW50ID0gdGhpcy5nZXRBY2NvdW50KGFjY291bnRMZWFmSWQpO1xuICAgIGlmICh0aGlzLmN1cnJlbnRBY2NvdW50UGF5bG9hZC5yX3Rva2VuTGVhZklkW3RoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLnJfdG9rZW5MZWFmSWQubGVuZ3RoIC0gMV0/Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgdGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQucl90b2tlbkxlYWZJZFt0aGlzLmN1cnJlbnRBY2NvdW50UGF5bG9hZC5yX3Rva2VuTGVhZklkLmxlbmd0aCAtIDFdLnB1c2godG9rZW5BZGRyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQucl90b2tlbkxlYWZJZC5wdXNoKFt0b2tlbkFkZHJdKTtcbiAgICB9XG4gICAgaWYgKCFhY2NvdW50KSB7XG4gICAgICBjb25zdCBta3AgPSBhd2FpdCB0aGlzLnRzVG9rZW5UcmVlU2VydmljZS5nZXRNZXJrbGVyUHJvb2ZCeUFjY291bnRJZCgnMCcsICcwJyk7XG4gICAgICB0aGlzLmN1cnJlbnRBY2NvdW50UGF5bG9hZC5yX3Rva2VuUm9vdEZsb3cucHVzaChbdGhpcy50c1Rva2VuVHJlZVNlcnZpY2UuZ2V0RGVmYXVsdFJvb3QoKV0pO1xuICAgICAgdGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQucl9vcmlUb2tlbkxlYWYucHVzaChnZXREZWZhdWx0VG9rZW5MZWFmTWVzc2FnZSgpKTtcbiAgICAgIHRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLnJfdG9rZW5Na1ByZi5wdXNoKG1rcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHRva2VuSW5mbyA9IGF3YWl0IHRoaXMudHNUb2tlblRyZWVTZXJ2aWNlLmdldExlYWYodG9rZW5BZGRyLCBhY2NvdW50TGVhZklkLnRvU3RyaW5nKCkpO1xuICAgICAgY29uc3QgdG9rZW5Sb290ID0gYXdhaXQgdGhpcy50c1Rva2VuVHJlZVNlcnZpY2UuZ2V0Um9vdChhY2NvdW50TGVhZklkLnRvU3RyaW5nKCkpO1xuICAgICAgY29uc3QgbWtQcmYgPSBhd2FpdCB0aGlzLnRzVG9rZW5UcmVlU2VydmljZS5nZXRNZXJrbGVyUHJvb2ZCeUFjY291bnRJZCh0b2tlbkFkZHIsIGFjY291bnRMZWFmSWQudG9TdHJpbmcoKSk7XG4gICAgICB0aGlzLmN1cnJlbnRBY2NvdW50UGF5bG9hZC5yX3Rva2VuUm9vdEZsb3cucHVzaChbdG9rZW5Sb290Lmhhc2hdKTtcbiAgICAgIHRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLnJfb3JpVG9rZW5MZWFmLnB1c2godG9rZW5JbmZvLmVuY29kZSgpKTtcbiAgICAgIHRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLnJfdG9rZW5Na1ByZi5wdXNoKG1rUHJmKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBhc3luYyB0b2tlbkFmdGVyVXBkYXRlKGFjY291bnRMZWFmSWQ6IHN0cmluZywgdG9rZW5BZGRyOiBUc1Rva2VuQWRkcmVzcykge1xuICAgIGNvbnN0IGFjY291bnQgPSB0aGlzLmdldEFjY291bnQoYWNjb3VudExlYWZJZCk7XG4gICAgaWYgKCFhY2NvdW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FjY291bnRBZnRlclVwZGF0ZTogYWNjb3VudCBub3QgZm91bmQnKTtcbiAgICB9XG4gICAgY29uc3QgdG9rZW5JbmZvID0gYXdhaXQgdGhpcy50c1Rva2VuVHJlZVNlcnZpY2UuZ2V0TGVhZih0b2tlbkFkZHIsIGFjY291bnRMZWFmSWQudG9TdHJpbmcoKSk7XG4gICAgY29uc3QgdG9rZW5Sb290ID0gYXdhaXQgdGhpcy50c1Rva2VuVHJlZVNlcnZpY2UuZ2V0Um9vdChhY2NvdW50TGVhZklkLnRvU3RyaW5nKCkpO1xuXG4gICAgY29uc3QgaWR4ID0gdGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQucl90b2tlblJvb3RGbG93Lmxlbmd0aCAtIDE7XG4gICAgdGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQucl9uZXdUb2tlbkxlYWYucHVzaCh0b2tlbkluZm8uZW5jb2RlKCkpO1xuICAgIHRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLnJfdG9rZW5Sb290Rmxvd1tpZHhdLnB1c2godG9rZW5Sb290Lmhhc2gpO1xuICB9XG4gIHByaXZhdGUgYXN5bmMgYWNjb3VudEJlZm9yZVVwZGF0ZShhY2NvdW50TGVhZklkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBhY2NvdW50ID0gYXdhaXQgdGhpcy5nZXRBY2NvdW50KGFjY291bnRMZWFmSWQpO1xuICAgIGlmICh0aGlzLmN1cnJlbnRBY2NvdW50UGF5bG9hZC5yX2FjY291bnRMZWFmSWRbdGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQucl9hY2NvdW50TGVhZklkLmxlbmd0aCAtIDFdPy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLnJfYWNjb3VudExlYWZJZFt0aGlzLmN1cnJlbnRBY2NvdW50UGF5bG9hZC5yX2FjY291bnRMZWFmSWQubGVuZ3RoIC0gMV0ucHVzaChhY2NvdW50TGVhZklkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQucl9hY2NvdW50TGVhZklkLnB1c2goW2FjY291bnRMZWFmSWRdKTtcbiAgICB9XG4gICAgaWYgKCFhY2NvdW50KSB7XG4gICAgICBjb25zdCBta3AgPSBhd2FpdCB0aGlzLnRzQWNjb3VudFRyZWVTZXJ2aWNlLmdldE1lcmtsZXJQcm9vZignMCcpO1xuICAgICAgY29uc3Qgcm9vdCA9IGF3YWl0IHRoaXMudHNBY2NvdW50VHJlZVNlcnZpY2UuZ2V0Um9vdCgpO1xuICAgICAgY29uc3QgdG9rZW5Sb290ID0gYXdhaXQgdGhpcy50c1Rva2VuVHJlZVNlcnZpY2UuZ2V0Um9vdChhY2NvdW50TGVhZklkLnRvU3RyaW5nKCkpO1xuICAgICAgY29uc3QgbGVhZiA9IGdldERlZmF1bHRBY2NvdW50TGVhZk1lc3NhZ2UodG9rZW5Sb290Lmhhc2gpO1xuICAgICAgdGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQucl9vcmlBY2NvdW50TGVhZi5wdXNoKGxlYWYpO1xuICAgICAgdGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQucl9hY2NvdW50Um9vdEZsb3cucHVzaChbcm9vdC5oYXNoXSk7XG4gICAgICB0aGlzLmN1cnJlbnRBY2NvdW50UGF5bG9hZC5yX2FjY291bnRNa1ByZi5wdXNoKG1rcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG1rcCA9IGF3YWl0IHRoaXMudHNBY2NvdW50VHJlZVNlcnZpY2UuZ2V0TWVya2xlclByb29mKGFjY291bnRMZWFmSWQpO1xuICAgICAgY29uc3QgbGVhZiA9IGF3YWl0IHRoaXMudHNBY2NvdW50VHJlZVNlcnZpY2UuZ2V0TGVhZihhY2NvdW50TGVhZklkKTtcbiAgICAgIGNvbnN0IHJvb3QgPSBhd2FpdCB0aGlzLnRzQWNjb3VudFRyZWVTZXJ2aWNlLmdldFJvb3QoKTtcbiAgICAgIHRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLnJfb3JpQWNjb3VudExlYWYucHVzaChsZWFmLmVuY29kZSgpKTtcbiAgICAgIHRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLnJfYWNjb3VudFJvb3RGbG93LnB1c2goW3Jvb3RdKTtcbiAgICAgIHRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLnJfYWNjb3VudE1rUHJmLnB1c2gobWtwKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBhc3luYyBhY2NvdW50QWZ0ZXJVcGRhdGUoYWNjb3VudExlYWZJZDogc3RyaW5nKSB7XG4gICAgY29uc3QgYWNjb3VudCA9IGF3YWl0IHRoaXMuZ2V0QWNjb3VudChhY2NvdW50TGVhZklkKTtcbiAgICBpZiAoIWFjY291bnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignYWNjb3VudEFmdGVyVXBkYXRlOiBhY2NvdW50IG5vdCBmb3VuZCcpO1xuICAgIH1cbiAgICBjb25zdCBpZHggPSB0aGlzLmN1cnJlbnRBY2NvdW50UGF5bG9hZC5yX2FjY291bnRSb290Rmxvdy5sZW5ndGggLSAxO1xuICAgIGNvbnN0IHJvb3QgPSBhd2FpdCB0aGlzLnRzQWNjb3VudFRyZWVTZXJ2aWNlLmdldFJvb3QoKTtcbiAgICB0aGlzLmN1cnJlbnRBY2NvdW50UGF5bG9hZC5yX25ld0FjY291bnRMZWFmLnB1c2goYWNjb3VudC5lbmNvZGUoKSk7XG4gICAgdGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQucl9hY2NvdW50Um9vdEZsb3dbaWR4XS5wdXNoKHJvb3QpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBhY2NvdW50QW5kVG9rZW5CZWZvcmVVcGRhdGUoYWNjb3VudExlYWZJZDogc3RyaW5nLCB0b2tlbkFkZHI6IFRzVG9rZW5BZGRyZXNzKSB7XG4gICAgY29uc3QgYWNjb3VudCA9IHRoaXMuZ2V0QWNjb3VudChhY2NvdW50TGVhZklkKTtcbiAgICBpZiAodGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQucl9hY2NvdW50TGVhZklkW3RoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLnJfYWNjb3VudExlYWZJZC5sZW5ndGggLSAxXT8ubGVuZ3RoID09PSAxKSB7XG4gICAgICB0aGlzLmN1cnJlbnRBY2NvdW50UGF5bG9hZC5yX2FjY291bnRMZWFmSWRbdGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQucl9hY2NvdW50TGVhZklkLmxlbmd0aCAtIDFdLnB1c2goYWNjb3VudExlYWZJZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLnJfYWNjb3VudExlYWZJZC5wdXNoKFthY2NvdW50TGVhZklkXSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmN1cnJlbnRBY2NvdW50UGF5bG9hZC5yX3Rva2VuTGVhZklkW3RoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLnJfdG9rZW5MZWFmSWQubGVuZ3RoIC0gMV0/Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgdGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQucl90b2tlbkxlYWZJZFt0aGlzLmN1cnJlbnRBY2NvdW50UGF5bG9hZC5yX3Rva2VuTGVhZklkLmxlbmd0aCAtIDFdLnB1c2godG9rZW5BZGRyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQucl90b2tlbkxlYWZJZC5wdXNoKFt0b2tlbkFkZHJdKTtcbiAgICB9XG4gICAgY29uc3Qgcm9vdCA9IGF3YWl0IHRoaXMudHNBY2NvdW50VHJlZVNlcnZpY2UuZ2V0Um9vdCgpO1xuICAgIHRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLnJfYWNjb3VudFJvb3RGbG93LnB1c2goW3Jvb3RdKTtcbiAgICBpZiAoIWFjY291bnQpIHtcbiAgICAgIGNvbnN0IHRva2VuUm9vdCA9IGF3YWl0IHRoaXMudHNUb2tlblRyZWVTZXJ2aWNlLmdldFJvb3QoYWNjb3VudExlYWZJZC50b1N0cmluZygpKTtcbiAgICAgIGNvbnN0IGxlYWYgPSBnZXREZWZhdWx0QWNjb3VudExlYWZNZXNzYWdlKHRva2VuUm9vdC5oYXNoKTtcbiAgICAgIGNvbnN0IEFjY291bnRNa3AgPSBhd2FpdCB0aGlzLnRzQWNjb3VudFRyZWVTZXJ2aWNlLmdldE1lcmtsZXJQcm9vZignMCcpO1xuICAgICAgY29uc3QgdG9rZW5Na3AgPSBhd2FpdCB0aGlzLnRzVG9rZW5UcmVlU2VydmljZS5nZXRNZXJrbGVyUHJvb2ZCeUFjY291bnRJZCgnMCcsICcwJyk7XG5cbiAgICAgIHRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLnJfb3JpQWNjb3VudExlYWYucHVzaChsZWFmKTtcbiAgICAgIHRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLnJfYWNjb3VudE1rUHJmLnB1c2goQWNjb3VudE1rcCk7XG4gICAgICB0aGlzLmN1cnJlbnRBY2NvdW50UGF5bG9hZC5yX3Rva2VuUm9vdEZsb3cucHVzaChbdGhpcy50c1Rva2VuVHJlZVNlcnZpY2UuZ2V0RGVmYXVsdFJvb3QoKV0pO1xuICAgICAgdGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQucl9vcmlUb2tlbkxlYWYucHVzaChnZXREZWZhdWx0VG9rZW5MZWFmTWVzc2FnZSgpKTtcbiAgICAgIHRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLnJfdG9rZW5Na1ByZi5wdXNoKHRva2VuTWtwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYWNjb3VudE1rcCA9IGF3YWl0IHRoaXMudHNBY2NvdW50VHJlZVNlcnZpY2UuZ2V0TWVya2xlclByb29mKGFjY291bnRMZWFmSWQpO1xuICAgICAgY29uc3QgYWNjb3VudExlYWYgPSBhd2FpdCB0aGlzLnRzQWNjb3VudFRyZWVTZXJ2aWNlLmdldExlYWYoYWNjb3VudExlYWZJZCk7XG4gICAgICBjb25zdCB0b2tlbkluZm8gPSBhd2FpdCB0aGlzLnRzVG9rZW5UcmVlU2VydmljZS5nZXRMZWFmKCh0b2tlbkFkZHIpLCBhY2NvdW50TGVhZklkLnRvU3RyaW5nKCkpO1xuICAgICAgY29uc3QgdG9rZW5Sb290ID0gYXdhaXQgdGhpcy50c1Rva2VuVHJlZVNlcnZpY2UuZ2V0Um9vdChhY2NvdW50TGVhZklkLnRvU3RyaW5nKCkpO1xuICAgICAgY29uc3QgdG9rZW5Na1ByID0gYXdhaXQgdGhpcy50c1Rva2VuVHJlZVNlcnZpY2UuZ2V0TWVya2xlclByb29mQnlBY2NvdW50SWQoKHRva2VuQWRkciksIGFjY291bnRMZWFmSWQudG9TdHJpbmcoKSk7XG5cbiAgICAgIHRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLnJfb3JpQWNjb3VudExlYWYucHVzaChhY2NvdW50TGVhZi5lbmNvZGUoKSk7XG4gICAgICB0aGlzLmN1cnJlbnRBY2NvdW50UGF5bG9hZC5yX2FjY291bnRNa1ByZi5wdXNoKGFjY291bnRNa3ApO1xuICAgICAgdGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQucl90b2tlblJvb3RGbG93LnB1c2goW3Rva2VuUm9vdC5oYXNoXSk7XG4gICAgICB0aGlzLmN1cnJlbnRBY2NvdW50UGF5bG9hZC5yX29yaVRva2VuTGVhZi5wdXNoKHRva2VuSW5mby5lbmNvZGUoKSk7XG4gICAgICB0aGlzLmN1cnJlbnRBY2NvdW50UGF5bG9hZC5yX3Rva2VuTWtQcmYucHVzaCh0b2tlbk1rUHIpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgYWNjb3VudEFuZFRva2VuQWZ0ZXJVcGRhdGUoYWNjb3VudExlYWZJZDogc3RyaW5nLCB0b2tlbkFkZHI6IFRzVG9rZW5BZGRyZXNzKSB7XG4gICAgY29uc3QgYWNjb3VudCA9IHRoaXMuZ2V0QWNjb3VudChhY2NvdW50TGVhZklkKTtcbiAgICBpZiAoIWFjY291bnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignYWNjb3VudEFmdGVyVXBkYXRlOiBhY2NvdW50IG5vdCBmb3VuZCcpO1xuICAgIH1cbiAgICBjb25zdCB0b2tlbkluZm8gPSBhd2FpdCB0aGlzLnRzVG9rZW5UcmVlU2VydmljZS5nZXRMZWFmKCh0b2tlbkFkZHIpLCBhY2NvdW50TGVhZklkLnRvU3RyaW5nKCkpO1xuICAgIGNvbnN0IHRva2VuUm9vdCA9IGF3YWl0IHRoaXMudHNUb2tlblRyZWVTZXJ2aWNlLmdldFJvb3QoYWNjb3VudExlYWZJZC50b1N0cmluZygpKTtcbiAgICBjb25zdCBhY2NvdW50Um9vdCA9IGF3YWl0IHRoaXMudHNBY2NvdW50VHJlZVNlcnZpY2UuZ2V0Um9vdCgpO1xuICAgIGNvbnN0IGFjY291bnRMZWFmID0gYXdhaXQgdGhpcy50c0FjY291bnRUcmVlU2VydmljZS5nZXRMZWFmKGFjY291bnRMZWFmSWQpO1xuICAgIGNvbnN0IGlkeCA9IHRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLnJfYWNjb3VudFJvb3RGbG93Lmxlbmd0aCAtIDE7XG4gICAgdGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQucl9uZXdBY2NvdW50TGVhZi5wdXNoKGFjY291bnRMZWFmLmVuY29kZSgpKTtcbiAgICB0aGlzLmN1cnJlbnRBY2NvdW50UGF5bG9hZC5yX2FjY291bnRSb290Rmxvd1tpZHhdLnB1c2goYWNjb3VudFJvb3QpO1xuICAgIHRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLnJfbmV3VG9rZW5MZWFmLnB1c2godG9rZW5JbmZvLmVuY29kZSgpKTtcblxuICAgIHRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLnJfdG9rZW5Sb290Rmxvd1tpZHhdLnB1c2godG9rZW5Sb290Lmhhc2gpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBvcmRlckJlZm9yZVVwZGF0ZShvcmRlckxlYWZJZDogc3RyaW5nKSB7XG4gICAgY29uc3Qgb3JkZXIgPSBhd2FpdCB0aGlzLmdldE9ic09yZGVyKG9yZGVyTGVhZklkKTtcbiAgICB0aGlzLmN1cnJlbnRPcmRlclBheWxvYWQucl9vcmRlckxlYWZJZC5wdXNoKFtvcmRlckxlYWZJZC50b1N0cmluZygpXSk7XG5cbiAgICBjb25zdCByb290ID0gYXdhaXQgdGhpcy5vYnNPcmRlclRyZWVTZXJ2aWNlLmdldFJvb3QoKTtcbiAgICBjb25zdCBvcmRlck1rcCA9IGF3YWl0IHRoaXMub2JzT3JkZXJUcmVlU2VydmljZS5nZXRNZXJrbGVyUHJvb2Yob3JkZXJMZWFmSWQpO1xuICAgIGlmIChvcmRlcikge1xuICAgICAgdGhpcy5jdXJyZW50T3JkZXJQYXlsb2FkLnJfb3JpT3JkZXJMZWFmLnB1c2gob3JkZXIuZW5jb2RlKCkpO1xuICAgICAgdGhpcy5jdXJyZW50T3JkZXJQYXlsb2FkLnJfb3JkZXJSb290Rmxvdy5wdXNoKFtyb290Lmhhc2hdKTtcbiAgICAgIHRoaXMuY3VycmVudE9yZGVyUGF5bG9hZC5yX29yZGVyTWtQcmYucHVzaChvcmRlck1rcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGRlZmF1bHRPcmRlckxlYWZNZXNzYWdlID0gZ2V0RGVmYXVsdE9ic09yZGVyTGVhZk1lc3NhZ2UoKTtcbiAgICAgIHRoaXMuY3VycmVudE9yZGVyUGF5bG9hZC5yX29yaU9yZGVyTGVhZi5wdXNoKGRlZmF1bHRPcmRlckxlYWZNZXNzYWdlKTtcbiAgICAgIHRoaXMuY3VycmVudE9yZGVyUGF5bG9hZC5yX29yZGVyUm9vdEZsb3cucHVzaChbcm9vdC5oYXNoXSk7XG4gICAgICB0aGlzLmN1cnJlbnRPcmRlclBheWxvYWQucl9vcmRlck1rUHJmLnB1c2gob3JkZXJNa3ApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgb3JkZXJBZnRlclVwZGF0ZShvcmRlckxlYWZJZDogc3RyaW5nKSB7XG4gICAgY29uc3Qgb3JkZXIgPSBhd2FpdCB0aGlzLmdldE9ic09yZGVyKG9yZGVyTGVhZklkKTtcbiAgICBjb25zdCByb290ID0gYXdhaXQgdGhpcy5vYnNPcmRlclRyZWVTZXJ2aWNlLmdldFJvb3QoKTtcblxuICAgIHRoaXMuY3VycmVudE9yZGVyUGF5bG9hZC5yX29yZGVyUm9vdEZsb3dbdGhpcy5jdXJyZW50T3JkZXJQYXlsb2FkLnJfb3JkZXJSb290Rmxvdy5sZW5ndGggLSAxXS5wdXNoKHJvb3QuaGFzaCk7XG4gICAgaWYgKG9yZGVyKSB7XG4gICAgICB0aGlzLmN1cnJlbnRPcmRlclBheWxvYWQucl9uZXdPcmRlckxlYWYucHVzaChvcmRlci5lbmNvZGUoKSk7XG4gICAgICAvLyB0aGlzLmN1cnJlbnRPcmRlclBheWxvYWQucl9vcmRlck1rUHJmLnB1c2godGhpcy5ta09yZGVyVHJlZS5nZXRQcm9vZihvcmRlckxlYWZJZCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBkZWZhdWx0T3JkZXJMZWFmTWVzc2FnZSA9IGdldERlZmF1bHRPYnNPcmRlckxlYWZNZXNzYWdlKCk7XG4gICAgICB0aGlzLmN1cnJlbnRPcmRlclBheWxvYWQucl9uZXdPcmRlckxlYWYucHVzaChkZWZhdWx0T3JkZXJMZWFmTWVzc2FnZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhZGRPYnNPcmRlcihvcmRlcjogVXBkYXRlT2JzT3JkZXJUcmVlRHRvKSB7XG4gICAgLy8gaWYgKEJpZ0ludChvcmRlci5vcmRlckxlYWZJZCkgPiAwbikge1xuICAgIC8vICAgdGhyb3cgbmV3IEVycm9yKCdhZGRPYnNPcmRlcjogb3JkZXJMZWFmSWQgc2hvdWxkIGJlIDAnKTtcbiAgICAvLyB9XG4gICAgLy8gb3JkZXIub3JkZXJMZWFmSWQgPSB0aGlzLm9ic09yZGVyVHJlZVNlcnZpY2UuY3VycmVudE9yZGVySWQudG9TdHJpbmcoKTtcbiAgICB0aGlzLm9ic09yZGVyUmVwb3NpdG9yeS51cGRhdGUoe1xuICAgICAgdHhJZDogTnVtYmVyKG9yZGVyLnR4SWQpLFxuICAgIH0sIHtcbiAgICAgIG9yZGVyTGVhZklkOiBOdW1iZXIob3JkZXIub3JkZXJMZWFmSWQpLFxuICAgIH0pO1xuICAgIHRoaXMub2JzT3JkZXJUcmVlU2VydmljZS51cGRhdGVMZWFmKG9yZGVyLm9yZGVyTGVhZklkLCBvcmRlcik7XG4gICAgdGhpcy5vYnNPcmRlclRyZWVTZXJ2aWNlLmFkZEN1cnJlbnRPcmRlcklkKCk7XG4gIH1cbiAgcHJpdmF0ZSBhc3luYyByZW1vdmVPYnNPcmRlcihsZWFmSWQ6IHN0cmluZykge1xuICAgIGNvbnN0IG9yZGVyID0gYXdhaXQgdGhpcy5nZXRPYnNPcmRlcihsZWFmSWQpO1xuICAgIGlmICghb3JkZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigncmVtb3ZlT2JzT3JkZXI6IG9yZGVyIG5vdCBmb3VuZCcpO1xuICAgIH1cbiAgICBpZiAob3JkZXIucmVxVHlwZSA9PT0gVHNUeFR5cGUuVU5LTk9XTikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdyZW1vdmVPYnNPcmRlcjogb3JkZXIgbm90IGZvdW5kICgwKScpO1xuICAgIH1cbiAgICB0aGlzLm9ic09yZGVyVHJlZVNlcnZpY2UudXBkYXRlTGVhZihvcmRlci5vcmRlckxlYWZJZCwge1xuICAgICAgb3JkZXJMZWFmSWQ6IG9yZGVyLm9yZGVyTGVhZklkLFxuICAgICAgdHhJZDogJzAnLFxuICAgICAgcmVxVHlwZTogJzAnLFxuICAgICAgc2VuZGVyOiAnMCcsXG4gICAgICBzZWxsVG9rZW5JZDogJzAnLFxuICAgICAgbm9uY2U6ICcwJyxcbiAgICAgIHNlbGxBbXQ6ICcwJyxcbiAgICAgIGJ1eVRva2VuSWQ6ICcwJyxcbiAgICAgIGJ1eUFtdDogJzAnLFxuICAgICAgYWNjdW11bGF0ZWRTZWxsQW10OiAnMCcsXG4gICAgICBhY2N1bXVsYXRlZEJ1eUFtdDogJzAnLFxuICAgIH0pO1xuICB9XG4gIHByaXZhdGUgdXBkYXRlT2JzT3JkZXIob3JkZXI6IFVwZGF0ZU9ic09yZGVyVHJlZUR0bykge1xuICAgIGFzc2VydChCaWdJbnQob3JkZXIub3JkZXJMZWFmSWQpID4gMG4sICd1cGRhdGVPYnNPcmRlcjogb3JkZXJMZWFmSWQgc2hvdWxkIGJlIGV4aXN0Jyk7XG4gICAgdGhpcy5vYnNPcmRlclRyZWVTZXJ2aWNlLnVwZGF0ZUxlYWYob3JkZXIub3JkZXJMZWFmSWQsIG9yZGVyKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0VHhDaHVua3MoXG4gICAgdHhFbnRpdHk6IFRyYW5zYWN0aW9uSW5mbyxcbiAgICBtZXRhZGF0YT86IHtcbiAgICAgIHR4T2Zmc2V0OiBiaWdpbnQ7XG4gICAgICBtYWtlckJ1eUFtdDogYmlnaW50O1xuICAgIH0sXG4gICkge1xuICAgIGNvbnN0IHsgcl9jaHVua3MsIG9fY2h1bmtzLCBpc0NyaXRpY2FsIH0gPSBlbmNvZGVSQ2h1bmtCdWZmZXIodHhFbnRpdHksIG1ldGFkYXRhKTtcblxuICAgIC8vIFRPRE8gbXVsdGlwbGUgdHhzIG5lZWQgaGFuZGxlIG9fY2h1bmtzIGluIGVuZCBvZiBibG9jaztcbiAgICBjb25zdCByX2NodW5rc19iaWdpbnQgPSBiaWdpbnRfdG9fY2h1bmtfYXJyYXkoQmlnSW50KCcweCcgKyByX2NodW5rcy50b1N0cmluZygnaGV4JykpLCBCaWdJbnQoQ0hVTktfQklUU19TSVpFKSk7XG4gICAgY29uc3Qgb19jaHVua3NfYmlnaW50ID0gYmlnaW50X3RvX2NodW5rX2FycmF5KEJpZ0ludCgnMHgnICsgb19jaHVua3MudG9TdHJpbmcoJ2hleCcpKSwgQmlnSW50KENIVU5LX0JJVFNfU0laRSkpO1xuICAgIGNvbnN0IGlzQ3JpdGljYWxDaHVuayA9IG9fY2h1bmtzX2JpZ2ludC5tYXAoKF8pID0+ICcwJyk7XG4gICAgaWYgKGlzQ3JpdGljYWwpIHtcbiAgICAgIGlzQ3JpdGljYWxDaHVua1swXSA9ICcxJztcbiAgICB9XG5cbiAgICByZXR1cm4geyByX2NodW5rc19iaWdpbnQsIG9fY2h1bmtzX2JpZ2ludCwgaXNDcml0aWNhbENodW5rIH07XG4gIH1cblxuICBhc3luYyBnZXRUc1B1YktleShhY2NvdW50SWQ6IHN0cmluZykge1xuICAgIGNvbnN0IHRzUHViS2V5ID0gYXdhaXQgdGhpcy5hY2NvdW50SW5mb1JlcG9zaXRvcnkuZmluZE9uZU9yRmFpbCh7XG4gICAgICBzZWxlY3Q6IFsndHNQdWJLZXlYJywgJ3RzUHViS2V5WSddLFxuICAgICAgd2hlcmU6IHtcbiAgICAgICAgYWNjb3VudElkOiBhY2NvdW50SWQsXG4gICAgICB9LFxuICAgIH0pO1xuICAgIHJldHVybiBbdHNQdWJLZXkudHNQdWJLZXlYLCB0c1B1YktleS50c1B1YktleVldO1xuICB9XG5cbiAgYXN5bmMgZG9UcmFuc2FjdGlvbihyZXE6IFRyYW5zYWN0aW9uSW5mbyk6IFByb21pc2U8VHNSb2xsdXBDaXJjdWl0SW5wdXRJdGVtVHlwZT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zb2xlLnRpbWUoYGRvVHJhbnNhY3Rpb24gdHhpZD0ke3JlcS50eElkfSwgcmVxVHlwZT0ke3JlcS5yZXFUeXBlfWApO1xuICAgICAgY29uc29sZS5sb2coe1xuICAgICAgICByZXEsXG4gICAgICAgIGFjY291bnRJZDogcmVxLmFjY291bnRJZCxcbiAgICAgICAgdHB5ZTogdHlwZW9mIHJlcS5hY2NvdW50SWQsXG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLnJvbGx1cFN0YXR1cyAhPT0gUm9sbHVwU3RhdHVzLlJ1bm5pbmcpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5zdGFydFJvbGx1cCgpO1xuICAgICAgfVxuICAgICAgbGV0IGlucHV0czogVHNSb2xsdXBDaXJjdWl0SW5wdXRJdGVtVHlwZTtcbiAgICAgIGNvbnN0IHJlcVR5cGUgPSByZXEucmVxVHlwZTtcbiAgICAgIHN3aXRjaCAocmVxVHlwZSkge1xuICAgICAgICBjYXNlIFRzVHhUeXBlLlJFR0lTVEVSOlxuICAgICAgICAgIGlucHV0cyA9IGF3YWl0IHRoaXMuZG9SZWdpc3RlcihyZXEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFRzVHhUeXBlLkRFUE9TSVQ6XG4gICAgICAgICAgaW5wdXRzID0gYXdhaXQgdGhpcy5kb0RlcG9zaXQocmVxKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBUc1R4VHlwZS5XSVRIRFJBVzpcbiAgICAgICAgICBpbnB1dHMgPSBhd2FpdCB0aGlzLmRvV2l0aGRyYXcocmVxKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBUc1R4VHlwZS5TZWNvbmRMaW1pdE9yZGVyOlxuICAgICAgICAgIGlucHV0cyA9IGF3YWl0IHRoaXMuZG9TZWNvbmRMaW1pdE9yZGVyKHJlcSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgVHNUeFR5cGUuU2Vjb25kTGltaXRTdGFydDpcbiAgICAgICAgICBpbnB1dHMgPSBhd2FpdCB0aGlzLmRvU2Vjb25kTGltaXRTdGFydChyZXEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFRzVHhUeXBlLlNlY29uZExpbWl0RXhjaGFuZ2U6XG4gICAgICAgICAgaW5wdXRzID0gYXdhaXQgdGhpcy5kb1NlY29uZExpbWl0RXhjaGFuZ2UocmVxKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBUc1R4VHlwZS5TZWNvbmRMaW1pdEVuZDpcbiAgICAgICAgICBpbnB1dHMgPSBhd2FpdCB0aGlzLmRvU2Vjb25kTGltaXRFbmQocmVxKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBUc1R4VHlwZS5OT09QOlxuICAgICAgICAgIGlucHV0cyA9IGF3YWl0IHRoaXMuZG9Ob29wKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIGNhc2UgVHNUeFR5cGUuU2Vjb25kTWFya2V0T3JkZXI6XG4gICAgICAgIC8vICAgcmV0dXJuIHRoaXMuZG9TZWNvbmRMaW1pdE9yZGVyKHJlcSk7XG4gICAgICAgIC8vIGNhc2UgVHNUeFR5cGUuU2Vjb25kTWFya2V0RXhjaGFuZ2U6XG4gICAgICAgIC8vICAgcmV0dXJuIHRoaXMuZG9TZWNvbmRMaW1pdEV4Y2hhbmdlKHJlcSk7XG4gICAgICAgIC8vIGNhc2UgVHNUeFR5cGUuU2Vjb25kTWFya2V0RW5kOlxuICAgICAgICAvLyAgIHJldHVybiB0aGlzLmRvU2Vjb25kTWFya2V0RW5kKHJlcSk7XG4gICAgICAgIGNhc2UgVHNUeFR5cGUuVU5LTk9XTjpcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcmVxdWVzdCB0eXBlIHJlcVR5cGU9JHtyZXEucmVxVHlwZX1gKTtcbiAgICAgIH1cbiAgXG4gICAgICB0aGlzLmFkZEFjY291bnRSb290RmxvdygpO1xuICAgICAgdGhpcy5hZGRPcmRlclJvb3RGbG93KCk7XG4gIFxuICAgICAgY29uc3QgcmVtYWlucyA9IHRoaXMudHhOb3JtYWxQZXJCYXRjaCAtIHRoaXMuY3VycmVudFR4TG9ncy5sZW5ndGg7XG4gICAgICBpZiAocmVtYWlucyA8IDMpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5lbmRSb2xsdXAoKTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUudGltZShgZG9UcmFuc2FjdGlvbiB0eGlkPSR7cmVxLnR4SWR9LCByZXFUeXBlPSR7cmVxLnJlcVR5cGV9YCk7XG4gICAgICByZXR1cm4gaW5wdXRzO1xuICAgIH0gY2F0Y2goZXJyb3I6IGFueSkge1xuICAgICAgY29uc29sZS5lcnJvcignLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgY29uc29sZS5lcnJvcignLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKTtcbiAgICAgIC8vIHJldHVybiB7ZXJyb3I6IHRydWV9IGFzIHVua25vd24gYXMgVHNSb2xsdXBDaXJjdWl0SW5wdXRJdGVtVHlwZTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZG9TZWNvbmRMaW1pdE9yZGVyKHJlcTogVHJhbnNhY3Rpb25JbmZvKTogUHJvbWlzZTxUc1JvbGx1cENpcmN1aXRJbnB1dEl0ZW1UeXBlPiB7XG4gICAgY29uc3QgYWNjb3VudExlYWZJZCA9IChyZXEuYWNjb3VudElkKTtcbiAgICBjb25zdCByZXFEYXRhOiBUc1R4UmVxdWVzdERhdGFzVHlwZSA9IFtcbiAgICAgIEJpZ0ludChUc1R4VHlwZS5TZWNvbmRMaW1pdE9yZGVyKSxcbiAgICAgIEJpZ0ludChyZXEuYWNjb3VudElkKSxcbiAgICAgIEJpZ0ludChyZXEudG9rZW5BZGRyKSxcbiAgICAgIEJpZ0ludChyZXEuYW1vdW50KSxcbiAgICAgIEJpZ0ludChyZXEubm9uY2UpLFxuICAgICAgMG4sXG4gICAgICAwbixcbiAgICAgIEJpZ0ludChyZXEuYXJnMiksXG4gICAgICBCaWdJbnQocmVxLmFyZzMpLFxuICAgICAgMG4sXG4gICAgXTtcbiAgICBjb25zdCBmcm9tID0gYXdhaXQgdGhpcy5nZXRBY2NvdW50KGFjY291bnRMZWFmSWQpO1xuICAgIGlmICghZnJvbSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBhY2NvdW50IG5vdCBmb3VuZCBMMkFkZHI9JHtmcm9tfWApO1xuICAgIH1cbiAgICBjb25zdCBuZXdOb25jZSA9IEJpZ0ludChmcm9tLm5vbmNlKSArIDFuO1xuICAgIGNvbnN0IHRva2VuQWRkciA9IHJlcS50b2tlbkFkZHI7XG5cbiAgICBhd2FpdCB0aGlzLmFjY291bnRBbmRUb2tlbkJlZm9yZVVwZGF0ZShhY2NvdW50TGVhZklkLCB0b2tlbkFkZHIpO1xuICAgIGF3YWl0IHRoaXMudXBkYXRlQWNjb3VudFRva2VuKGFjY291bnRMZWFmSWQsIHRva2VuQWRkciwgLUJpZ0ludChyZXEuYW1vdW50KSwgQmlnSW50KHJlcS5hbW91bnQpKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZUFjY291bnROb25jZShhY2NvdW50TGVhZklkLCBuZXdOb25jZSk7XG4gICAgYXdhaXQgdGhpcy5hY2NvdW50QW5kVG9rZW5BZnRlclVwZGF0ZShhY2NvdW50TGVhZklkLCB0b2tlbkFkZHIpO1xuXG4gICAgYXdhaXQgdGhpcy5hY2NvdW50QW5kVG9rZW5CZWZvcmVVcGRhdGUoYWNjb3VudExlYWZJZCwgdG9rZW5BZGRyKTtcbiAgICBhd2FpdCB0aGlzLmFjY291bnRBbmRUb2tlbkFmdGVyVXBkYXRlKGFjY291bnRMZWFmSWQsIHRva2VuQWRkcik7XG5cbiAgICBjb25zdCBvcmRlckxlYWZJZCA9IHRoaXMub2JzT3JkZXJUcmVlU2VydmljZS5jdXJyZW50T3JkZXJJZC50b1N0cmluZygpO1xuICAgIGNvbnN0IHR4SWQgPSB0aGlzLmxhdGVzdFR4SWQ7XG4gIFxuICAgIGNvbnN0IG9yZGVyOiBVcGRhdGVPYnNPcmRlclRyZWVEdG8gPSB7XG4gICAgICBvcmRlckxlYWZJZCxcbiAgICAgIHR4SWQ6IHR4SWQudG9TdHJpbmcoKSxcbiAgICAgIHJlcVR5cGU6IHJlcS5yZXFUeXBlLnRvU3RyaW5nKCksXG4gICAgICBzZW5kZXI6IGFjY291bnRMZWFmSWQsXG4gICAgICBzZWxsVG9rZW5JZDogcmVxLnRva2VuQWRkcixcbiAgICAgIHNlbGxBbXQ6IHJlcS5hbW91bnQsXG4gICAgICBub25jZTogcmVxLm5vbmNlLFxuICAgICAgYnV5VG9rZW5JZDogcmVxLmFyZzIsXG4gICAgICBidXlBbXQ6IHJlcS5hcmczLFxuICAgICAgYWNjdW11bGF0ZWRTZWxsQW10OiAnMCcsXG4gICAgICBhY2N1bXVsYXRlZEJ1eUFtdDogJzAnXG4gICAgfTtcbiAgICBjb25zb2xlLmxvZyh7XG4gICAgICBkb1NlY29uZExpbWl0T3JkZXI6IG9yZGVyLFxuICAgIH0pO1xuICAgIGF3YWl0IHRoaXMub3JkZXJCZWZvcmVVcGRhdGUob3JkZXJMZWFmSWQpO1xuICAgIHRoaXMuYWRkT2JzT3JkZXIob3JkZXIpO1xuICAgIC8vIGF3YWl0IHRoaXMuYWRkQXVjdGlvbk9yZGVyKHJlcS5yZXFUeXBlLCB0eElkLCByZXEgYXMgdW5rbm93biBhcyBUc1R4QXVjdGlvbkxlbmRSZXF1ZXN0IHwgVHNUeEF1Y3Rpb25Cb3Jyb3dSZXF1ZXN0KTtcbiAgICBhd2FpdCB0aGlzLm9yZGVyQWZ0ZXJVcGRhdGUob3JkZXJMZWFmSWQpO1xuXG4gICAgY29uc3QgeyByX2NodW5rc19iaWdpbnQsIG9fY2h1bmtzX2JpZ2ludCwgaXNDcml0aWNhbENodW5rIH0gPSB0aGlzLmdldFR4Q2h1bmtzKHJlcSk7XG4gICAgY29uc3QgdHNQdWJLZXkgPSBhd2FpdCB0aGlzLmdldFRzUHViS2V5KGFjY291bnRMZWFmSWQpO1xuICAgIGNvbnN0IHR4ID0ge1xuICAgICAgcmVxRGF0YSxcbiAgICAgIHRzUHViS2V5LCAvLyBEZXBvc2l0IHR4IG5vdCBuZWVkIHNpZ25hdHVyZVxuICAgICAgc2lnUjogcmVxLmVkZHNhU2lnLlI4LFxuICAgICAgc2lnUzogcmVxLmVkZHNhU2lnLlMsXG5cbiAgICAgIC8vIGNodW5rU2l6ZSAqIE1heFRva2VuVW5pdHNQZXJSZXFcbiAgICAgIHJfY2h1bmtzOiByX2NodW5rc19iaWdpbnQsXG4gICAgICAvLyBUT0RPOiBoYW5kbGUgcmVhY2ggb19jaHVua3MgbWF4IGxlbmd0aFxuICAgICAgb19jaHVua3M6IG9fY2h1bmtzX2JpZ2ludCxcbiAgICAgIGlzQ3JpdGljYWxDaHVuayxcbiAgICAgIC4uLnRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLFxuICAgICAgLi4udGhpcy5jdXJyZW50T3JkZXJQYXlsb2FkLFxuICAgIH07XG5cbiAgICB0aGlzLmFkZFR4TG9ncyh0eCk7XG4gICAgcmV0dXJuIHR4IGFzIHVua25vd24gYXMgVHNSb2xsdXBDaXJjdWl0SW5wdXRJdGVtVHlwZTtcbiAgfVxuXG4gIHByaXZhdGUgY3VycmVudEhvbGRUYWtlck9yZGVyOiBPYnNPcmRlckxlYWZFbnRpdHkgfCBudWxsID0gbnVsbDtcbiAgYXN5bmMgZG9TZWNvbmRMaW1pdFN0YXJ0KHJlcTogVHJhbnNhY3Rpb25JbmZvKSB7XG4gICAgY29uc3QgcmVxRGF0YTogVHNUeFJlcXVlc3REYXRhc1R5cGUgPSBbQmlnSW50KFRzVHhUeXBlLlNlY29uZExpbWl0U3RhcnQpLCAwbiwgMG4sIDBuLCAwbiwgMG4sIDBuLCAwbiwgMG4sIEJpZ0ludChyZXEuYXJnNCldO1xuICAgIGNvbnN0IG9yZGVyTGVhZklkID0gcmVxLmFyZzQ7XG4gICAgY29uc3Qgb3JkZXIgPSBhd2FpdCB0aGlzLmdldE9ic09yZGVyKG9yZGVyTGVhZklkKTtcbiAgICBpZiAoIW9yZGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGRvQ2FuY2VsT3JkZXI6IG9yZGVyIG5vdCBmb3VuZCBvcmRlckxlYWZJZD0ke29yZGVyTGVhZklkfWApO1xuICAgIH1cbiAgICBpZiAob3JkZXIuc2VuZGVyID09PSAnMCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZG9DYW5jZWxPcmRlcjogb3JkZXIgbm90IGZvdW5kIG9yZGVyTGVhZklkPSR7b3JkZXJMZWFmSWR9IChvcmRlci5zZW5kZXI9MClgKTtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50SG9sZFRha2VyT3JkZXIgPSBvcmRlcjtcbiAgICBjb25zdCBmcm9tID0gYXdhaXQgdGhpcy5nZXRBY2NvdW50KG9yZGVyLnNlbmRlcik7XG4gICAgaWYgKCFmcm9tKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGFjY291bnQgbm90IGZvdW5kIEwyQWRkcj0ke2Zyb219YCk7XG4gICAgfVxuICAgIGNvbnN0IHNlbGxUb2tlbklkID0gb3JkZXIuc2VsbFRva2VuSWQudG9TdHJpbmcoKSBhcyBUc1Rva2VuQWRkcmVzcztcblxuICAgIGF3YWl0IHRoaXMuYWNjb3VudEFuZFRva2VuQmVmb3JlVXBkYXRlKG9yZGVyLnNlbmRlciwgc2VsbFRva2VuSWQpO1xuICAgIGF3YWl0IHRoaXMuYWNjb3VudEFuZFRva2VuQWZ0ZXJVcGRhdGUob3JkZXIuc2VuZGVyLCBzZWxsVG9rZW5JZCk7XG4gICAgYXdhaXQgdGhpcy5hY2NvdW50QW5kVG9rZW5CZWZvcmVVcGRhdGUob3JkZXIuc2VuZGVyLCBzZWxsVG9rZW5JZCk7XG4gICAgYXdhaXQgdGhpcy5hY2NvdW50QW5kVG9rZW5BZnRlclVwZGF0ZShvcmRlci5zZW5kZXIsIHNlbGxUb2tlbklkKTtcblxuICAgIGF3YWl0IHRoaXMub3JkZXJCZWZvcmVVcGRhdGUob3JkZXJMZWFmSWQpO1xuICAgIHRoaXMucmVtb3ZlT2JzT3JkZXIob3JkZXJMZWFmSWQpO1xuICAgIGF3YWl0IHRoaXMub3JkZXJBZnRlclVwZGF0ZShvcmRlckxlYWZJZCk7XG5cbiAgICBjb25zdCB0eElkID0gdGhpcy5sYXRlc3RUeElkO1xuICAgIGNvbnN0IG9yZGVyVHhJZCA9IEJpZ0ludChvcmRlci50eElkPy50b1N0cmluZygpIHx8ICcwJyk7XG4gICAgY29uc3QgeyByX2NodW5rc19iaWdpbnQsIG9fY2h1bmtzX2JpZ2ludCwgaXNDcml0aWNhbENodW5rIH0gPSB0aGlzLmdldFR4Q2h1bmtzKHJlcSwge1xuICAgICAgdHhPZmZzZXQ6IHR4SWQgLSBvcmRlclR4SWQsXG4gICAgICBtYWtlckJ1eUFtdDogMG4sXG4gICAgfSk7XG5cbiAgICBjb25zdCB0c1B1YktleSA9IGF3YWl0IHRoaXMuZ2V0VHNQdWJLZXkocmVxLmFjY291bnRJZCk7XG4gICAgY29uc3QgdHggPSB7XG4gICAgICByZXFEYXRhLFxuICAgICAgdHNQdWJLZXksIC8vIERlcG9zaXQgdHggbm90IG5lZWQgc2lnbmF0dXJlXG4gICAgICBzaWdSOiBbJzAnLCAnMCddLFxuICAgICAgc2lnUzogJzAnLFxuXG4gICAgICByX2NodW5rczogcl9jaHVua3NfYmlnaW50LFxuICAgICAgb19jaHVua3M6IG9fY2h1bmtzX2JpZ2ludCxcbiAgICAgIGlzQ3JpdGljYWxDaHVuayxcbiAgICAgIC4uLnRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLFxuICAgICAgLi4udGhpcy5jdXJyZW50T3JkZXJQYXlsb2FkLFxuICAgIH07XG5cbiAgICB0aGlzLmFkZFR4TG9ncyh0eCk7XG4gICAgcmV0dXJuIHR4IGFzIHVua25vd24gYXMgVHNSb2xsdXBDaXJjdWl0SW5wdXRJdGVtVHlwZTtcbiAgfVxuICBhc3luYyBkb1NlY29uZExpbWl0RXhjaGFuZ2UocmVxOiBUcmFuc2FjdGlvbkluZm8pIHtcbiAgICBjb25zdCByZXFEYXRhOiBUc1R4UmVxdWVzdERhdGFzVHlwZSA9IFtCaWdJbnQoVHNUeFR5cGUuU2Vjb25kTGltaXRFeGNoYW5nZSksIDBuLCAwbiwgMG4sIDBuLCAwbiwgMG4sIDBuLCAwbiwgQmlnSW50KHJlcS5hcmc0KV07XG4gICAgY29uc3Qgb3JkZXJMZWFmSWQgPSByZXEuYXJnNDtcbiAgICBjb25zdCBtYWtlck9yZGVyID0gYXdhaXQgdGhpcy5nZXRPYnNPcmRlcihyZXEuYXJnNCk7XG4gICAgaWYgKCFtYWtlck9yZGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGRvQ2FuY2VsT3JkZXI6IG9yZGVyIG5vdCBmb3VuZCBvcmRlckxlYWZJZD0ke29yZGVyTGVhZklkfWApO1xuICAgIH1cbiAgICBpZiAobWFrZXJPcmRlci5zZW5kZXIgPT09ICcwJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBkb0NhbmNlbE9yZGVyOiBvcmRlciBub3QgZm91bmQgb3JkZXJMZWFmSWQ9JHtvcmRlckxlYWZJZH0gKG9yZGVyLnNlbmRlcj0wKWApO1xuICAgIH1cbiAgICBjb25zdCBtYWtlckFjYyA9IGF3YWl0IHRoaXMuZ2V0QWNjb3VudChtYWtlck9yZGVyLnNlbmRlcik7XG4gICAgaWYgKCFtYWtlckFjYykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBhY2NvdW50IG5vdCBmb3VuZCBMMkFkZHI9JHttYWtlck9yZGVyLnNlbmRlcn1gKTtcbiAgICB9XG4gICAgY29uc3Qgc2VsbFRva2VuSWQgPSBtYWtlck9yZGVyLnNlbGxUb2tlbklkLnRvU3RyaW5nKCkgYXMgVHNUb2tlbkFkZHJlc3M7XG4gICAgY29uc3QgYnV5VG9rZW5JZCA9IG1ha2VyT3JkZXIuYnV5VG9rZW5JZC50b1N0cmluZygpIGFzIFRzVG9rZW5BZGRyZXNzO1xuICAgIGNvbnN0IGFjY3VtdWxhdGVkQnV5QW10ID0gQmlnSW50KHJlcS5hY2N1bXVsYXRlZEJ1eUFtdCk7XG4gICAgY29uc3QgYWNjdW11bGF0ZWRTZWxsQW10ID0gQmlnSW50KHJlcS5hY2N1bXVsYXRlZFNlbGxBbXQpO1xuXG4gICAgdGhpcy5hY2NvdW50QmVmb3JlVXBkYXRlKG1ha2VyT3JkZXIuc2VuZGVyKTtcblxuICAgIHRoaXMudG9rZW5CZWZvcmVVcGRhdGUobWFrZXJPcmRlci5zZW5kZXIsIGJ1eVRva2VuSWQpO1xuICAgIGF3YWl0IHRoaXMudXBkYXRlQWNjb3VudFRva2VuKG1ha2VyQWNjLmxlYWZJZCwgYnV5VG9rZW5JZCwgYWNjdW11bGF0ZWRCdXlBbXQsIDBuKTtcbiAgICB0aGlzLnRva2VuQWZ0ZXJVcGRhdGUobWFrZXJPcmRlci5zZW5kZXIsIGJ1eVRva2VuSWQpO1xuXG4gICAgdGhpcy50b2tlbkJlZm9yZVVwZGF0ZShtYWtlck9yZGVyLnNlbmRlciwgc2VsbFRva2VuSWQpO1xuICAgIGF3YWl0IHRoaXMudXBkYXRlQWNjb3VudFRva2VuKG1ha2VyQWNjLmxlYWZJZCwgc2VsbFRva2VuSWQsIDBuLCAtYWNjdW11bGF0ZWRTZWxsQW10KTtcbiAgICB0aGlzLnRva2VuQWZ0ZXJVcGRhdGUobWFrZXJPcmRlci5zZW5kZXIsIHNlbGxUb2tlbklkKTtcblxuICAgIHRoaXMuYWNjb3VudEFmdGVyVXBkYXRlKG1ha2VyT3JkZXIuc2VuZGVyKTtcblxuICAgIHRoaXMuYWNjb3VudEJlZm9yZVVwZGF0ZShtYWtlck9yZGVyLnNlbmRlcik7XG4gICAgdGhpcy5hY2NvdW50QWZ0ZXJVcGRhdGUobWFrZXJPcmRlci5zZW5kZXIpO1xuXG4gICAgYXdhaXQgdGhpcy5vcmRlckJlZm9yZVVwZGF0ZShvcmRlckxlYWZJZCk7XG4gICAgbWFrZXJPcmRlci5hY2N1bXVsYXRlZFNlbGxBbXQgPSAoQmlnSW50KG1ha2VyT3JkZXIuYWNjdW11bGF0ZWRTZWxsQW10KSArIGFjY3VtdWxhdGVkU2VsbEFtdCkudG9TdHJpbmcoKTtcbiAgICBtYWtlck9yZGVyLmFjY3VtdWxhdGVkQnV5QW10ID0gKEJpZ0ludChtYWtlck9yZGVyLmFjY3VtdWxhdGVkQnV5QW10KSArIGFjY3VtdWxhdGVkQnV5QW10KS50b1N0cmluZygpO1xuICAgIGNvbnN0IGlzQWxsU2VsbEFtdE1hdGNoZWQgPSBtYWtlck9yZGVyLmFjY3VtdWxhdGVkU2VsbEFtdCA9PT0gbWFrZXJPcmRlci5zZWxsQW10O1xuICAgIGlmIChpc0FsbFNlbGxBbXRNYXRjaGVkKSB7XG4gICAgICB0aGlzLnJlbW92ZU9ic09yZGVyKG9yZGVyTGVhZklkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cGRhdGVPYnNPcmRlcihtYWtlck9yZGVyLmNvbnZlcnRUb09ic09yZGVyRHRvKCkpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLm9yZGVyQWZ0ZXJVcGRhdGUob3JkZXJMZWFmSWQpO1xuXG4gICAgY29uc3QgdHhJZCA9IHRoaXMubGF0ZXN0VHhJZDtcbiAgICBjb25zdCBvcmRlclR4SWQgPSBCaWdJbnQobWFrZXJPcmRlci50eElkPy50b1N0cmluZygpIHx8ICcwJyk7XG4gICAgY29uc3QgeyByX2NodW5rc19iaWdpbnQsIG9fY2h1bmtzX2JpZ2ludCwgaXNDcml0aWNhbENodW5rIH0gPSB0aGlzLmdldFR4Q2h1bmtzKHJlcSwge1xuICAgICAgdHhPZmZzZXQ6IHR4SWQgLSBvcmRlclR4SWQsXG4gICAgICBtYWtlckJ1eUFtdDogQmlnSW50KG1ha2VyT3JkZXIuYnV5QW10KSxcbiAgICB9KTtcbiAgICBjb25zdCB0c1B1YktleSA9IGF3YWl0IHRoaXMuZ2V0VHNQdWJLZXkobWFrZXJBY2MubGVhZklkKTtcbiAgICBjb25zdCB0eCA9IHtcbiAgICAgIHJlcURhdGEsXG4gICAgICB0c1B1YktleSwgLy8gRGVwb3NpdCB0eCBub3QgbmVlZCBzaWduYXR1cmVcbiAgICAgIHNpZ1I6IFsnMCcsICcwJ10sXG4gICAgICBzaWdTOiAnMCcsXG5cbiAgICAgIHJfY2h1bmtzOiByX2NodW5rc19iaWdpbnQsXG4gICAgICBvX2NodW5rczogb19jaHVua3NfYmlnaW50LFxuICAgICAgaXNDcml0aWNhbENodW5rLFxuICAgICAgLi4udGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQsXG4gICAgICAuLi50aGlzLmN1cnJlbnRPcmRlclBheWxvYWQsXG4gICAgfTtcblxuICAgIHRoaXMuYWRkVHhMb2dzKHR4KTtcbiAgICByZXR1cm4gdHggYXMgdW5rbm93biBhcyBUc1JvbGx1cENpcmN1aXRJbnB1dEl0ZW1UeXBlO1xuICB9XG4gIGFzeW5jIGRvU2Vjb25kTGltaXRFbmQocmVxOiBUcmFuc2FjdGlvbkluZm8pIHtcbiAgICBhc3NlcnQoISF0aGlzLmN1cnJlbnRIb2xkVGFrZXJPcmRlciwgJ2RvU2Vjb25kTGltaXRFbmQ6IGN1cnJlbnRIb2xkVGFrZXJPcmRlciBpcyBudWxsJyk7XG4gICAgY29uc3QgcmVxRGF0YTogVHNUeFJlcXVlc3REYXRhc1R5cGUgPSBbQmlnSW50KFRzVHhUeXBlLlNlY29uZExpbWl0RW5kKSwgMG4sIDBuLCAwbiwgMG4sIDBuLCAwbiwgMG4sIDBuLCBCaWdJbnQocmVxLmFyZzQpXTtcbiAgICBjb25zdCBvcmRlckxlYWZJZCA9IHJlcS5hcmc0O1xuICAgIGFzc2VydChvcmRlckxlYWZJZCA9PT0gdGhpcy5jdXJyZW50SG9sZFRha2VyT3JkZXIub3JkZXJMZWFmSWQsICdkb1NlY29uZExpbWl0RW5kOiBvcmRlckxlYWZJZCBub3QgbWF0Y2gnKTtcbiAgICBjb25zdCB0YWtlck9yZGVyID0gdGhpcy5jdXJyZW50SG9sZFRha2VyT3JkZXI7XG4gICAgaWYgKCF0YWtlck9yZGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGRvU2Vjb25kTGltaXRFbmQ6IG9yZGVyIG5vdCBmb3VuZCBvcmRlckxlYWZJZD0ke29yZGVyTGVhZklkfWApO1xuICAgIH1cbiAgICBpZiAodGFrZXJPcmRlci5zZW5kZXIgPT09ICcwJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBkb1NlY29uZExpbWl0RW5kOiBvcmRlciBub3QgZm91bmQgb3JkZXJMZWFmSWQ9JHtvcmRlckxlYWZJZH0gKG9yZGVyLnNlbmRlcj0wKWApO1xuICAgIH1cbiAgICBjb25zdCB0YWtlckFjYyA9IGF3YWl0IHRoaXMuZ2V0QWNjb3VudCh0YWtlck9yZGVyLnNlbmRlcik7XG4gICAgaWYgKCF0YWtlckFjYykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBhY2NvdW50IG5vdCBmb3VuZCBMMkFkZHI9JHt0YWtlck9yZGVyLnNlbmRlcn1gKTtcbiAgICB9XG4gICAgY29uc3Qgc2VsbFRva2VuSWQgPSB0YWtlck9yZGVyLnNlbGxUb2tlbklkLnRvU3RyaW5nKCkgYXMgVHNUb2tlbkFkZHJlc3M7XG4gICAgY29uc3QgYnV5VG9rZW5JZCA9IHRha2VyT3JkZXIuYnV5VG9rZW5JZC50b1N0cmluZygpIGFzIFRzVG9rZW5BZGRyZXNzO1xuICAgIGNvbnN0IGFjY3VtdWxhdGVkQnV5QW10ID0gQmlnSW50KHJlcS5hY2N1bXVsYXRlZEJ1eUFtdCk7XG4gICAgY29uc3QgYWNjdW11bGF0ZWRTZWxsQW10ID0gQmlnSW50KHJlcS5hY2N1bXVsYXRlZFNlbGxBbXQpO1xuXG4gICAgdGhpcy5hY2NvdW50QmVmb3JlVXBkYXRlKHRha2VyT3JkZXIuc2VuZGVyKTtcblxuICAgIHRoaXMudG9rZW5CZWZvcmVVcGRhdGUodGFrZXJPcmRlci5zZW5kZXIsIGJ1eVRva2VuSWQpO1xuICAgIGF3YWl0IHRoaXMudXBkYXRlQWNjb3VudFRva2VuKHRha2VyQWNjLmxlYWZJZCwgYnV5VG9rZW5JZCwgYWNjdW11bGF0ZWRCdXlBbXQsIDBuKTtcbiAgICB0aGlzLnRva2VuQWZ0ZXJVcGRhdGUodGFrZXJPcmRlci5zZW5kZXIsIGJ1eVRva2VuSWQpO1xuXG4gICAgdGhpcy50b2tlbkJlZm9yZVVwZGF0ZSh0YWtlck9yZGVyLnNlbmRlciwgc2VsbFRva2VuSWQpO1xuICAgIGF3YWl0IHRoaXMudXBkYXRlQWNjb3VudFRva2VuKHRha2VyQWNjLmxlYWZJZCwgc2VsbFRva2VuSWQsIDBuLCAtYWNjdW11bGF0ZWRTZWxsQW10KTtcbiAgICB0aGlzLnRva2VuQWZ0ZXJVcGRhdGUodGFrZXJPcmRlci5zZW5kZXIsIHNlbGxUb2tlbklkKTtcblxuICAgIHRoaXMuYWNjb3VudEFmdGVyVXBkYXRlKHRha2VyT3JkZXIuc2VuZGVyKTtcblxuICAgIHRoaXMuYWNjb3VudEJlZm9yZVVwZGF0ZSh0YWtlck9yZGVyLnNlbmRlcik7XG4gICAgdGhpcy5hY2NvdW50QWZ0ZXJVcGRhdGUodGFrZXJPcmRlci5zZW5kZXIpO1xuXG4gICAgYXdhaXQgdGhpcy5vcmRlckJlZm9yZVVwZGF0ZShvcmRlckxlYWZJZCk7XG4gICAgdGFrZXJPcmRlci5hY2N1bXVsYXRlZFNlbGxBbXQgPSAoQmlnSW50KHRha2VyT3JkZXIuYWNjdW11bGF0ZWRTZWxsQW10KSArIGFjY3VtdWxhdGVkU2VsbEFtdCkudG9TdHJpbmcoKTtcbiAgICB0YWtlck9yZGVyLmFjY3VtdWxhdGVkQnV5QW10ID0gKEJpZ0ludCh0YWtlck9yZGVyLmFjY3VtdWxhdGVkQnV5QW10KSArIGFjY3VtdWxhdGVkQnV5QW10KS50b1N0cmluZygpO1xuICAgIGNvbnN0IGlzQWxsU2VsbEFtdE1hdGNoZWQgPSB0YWtlck9yZGVyLmFjY3VtdWxhdGVkU2VsbEFtdCA9PT0gdGFrZXJPcmRlci5zZWxsQW10O1xuICAgIGlmIChpc0FsbFNlbGxBbXRNYXRjaGVkKSB7XG4gICAgICB0aGlzLnJlbW92ZU9ic09yZGVyKG9yZGVyTGVhZklkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cGRhdGVPYnNPcmRlcih0YWtlck9yZGVyLmNvbnZlcnRUb09ic09yZGVyRHRvKCkpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLm9yZGVyQWZ0ZXJVcGRhdGUob3JkZXJMZWFmSWQpO1xuXG4gICAgY29uc3QgdHhJZCA9IHRoaXMubGF0ZXN0VHhJZDtcbiAgICBjb25zdCBvcmRlclR4SWQgPSBCaWdJbnQodGFrZXJPcmRlci50eElkPy50b1N0cmluZygpIHx8ICcwJyk7XG4gICAgY29uc3QgeyByX2NodW5rc19iaWdpbnQsIG9fY2h1bmtzX2JpZ2ludCwgaXNDcml0aWNhbENodW5rIH0gPSB0aGlzLmdldFR4Q2h1bmtzKHJlcSwge1xuICAgICAgdHhPZmZzZXQ6IHR4SWQgLSBvcmRlclR4SWQsXG4gICAgICBtYWtlckJ1eUFtdDogMG4sXG4gICAgfSk7XG5cbiAgICB0aGlzLmN1cnJlbnRIb2xkVGFrZXJPcmRlciA9IG51bGw7XG4gICAgY29uc3QgdHNQdWJLZXkgPSBhd2FpdCB0aGlzLmdldFRzUHViS2V5KHRha2VyQWNjLmxlYWZJZCk7XG5cbiAgICBjb25zdCB0eCA9IHtcbiAgICAgIHJlcURhdGEsXG4gICAgICB0c1B1YktleSwgLy8gRGVwb3NpdCB0eCBub3QgbmVlZCBzaWduYXR1cmVcbiAgICAgIHNpZ1I6IFsnMCcsICcwJ10sXG4gICAgICBzaWdTOiAnMCcsXG5cbiAgICAgIHJfY2h1bmtzOiByX2NodW5rc19iaWdpbnQsXG4gICAgICBvX2NodW5rczogb19jaHVua3NfYmlnaW50LFxuICAgICAgaXNDcml0aWNhbENodW5rLFxuICAgICAgLi4udGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQsXG4gICAgICAuLi50aGlzLmN1cnJlbnRPcmRlclBheWxvYWQsXG4gICAgfTtcblxuICAgIHRoaXMuYWRkVHhMb2dzKHR4KTtcbiAgICByZXR1cm4gdHggYXMgdW5rbm93biBhcyBUc1JvbGx1cENpcmN1aXRJbnB1dEl0ZW1UeXBlO1xuICB9XG5cbiAgYXN5bmMgZG9DYW5jZWxPcmRlcihyZXE6IFRyYW5zYWN0aW9uSW5mbykge1xuICAgIGNvbnN0IG9yZGVyTGVhZklkID0gcmVxLmFyZzQ7XG4gICAgY29uc3QgcmVxRGF0YTogVHNUeFJlcXVlc3REYXRhc1R5cGUgPSBbQmlnSW50KFRzVHhUeXBlLkNhbmNlbE9yZGVyKSwgMG4sIDBuLCAwbiwgMG4sIEJpZ0ludChyZXEuYXJnMCksIEJpZ0ludChvcmRlckxlYWZJZCksIDBuLCAwbiwgMG5dO1xuICAgIGNvbnN0IG9yZGVyID0gYXdhaXQgdGhpcy5nZXRPYnNPcmRlcihvcmRlckxlYWZJZCk7XG4gICAgaWYgKCFvcmRlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBkb0NhbmNlbE9yZGVyOiBvcmRlciBub3QgZm91bmQgb3JkZXJMZWFmSWQ9JHtvcmRlckxlYWZJZH1gKTtcbiAgICB9XG4gICAgaWYgKG9yZGVyLnNlbmRlciA9PT0gJzAnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGRvQ2FuY2VsT3JkZXI6IG9yZGVyIG5vdCBmb3VuZCBvcmRlckxlYWZJZD0ke29yZGVyTGVhZklkfSAob3JkZXIuc2VuZGVyPTApYCk7XG4gICAgfVxuICAgIGNvbnN0IGFjY291bnQgPSBhd2FpdCB0aGlzLmdldEFjY291bnQob3JkZXIuc2VuZGVyKTtcbiAgICBpZiAoIWFjY291bnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZG9DYW5jZWxPcmRlcjogYWNjb3VudCBub3QgZm91bmQgTDJBZGRyPSR7b3JkZXIuc2VuZGVyfWApO1xuICAgIH1cbiAgICBpZiAocmVxLmFyZzAgIT09IGFjY291bnQubGVhZklkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGRvQ2FuY2VsT3JkZXI6IGFjY291bnQgbm90IG1hdGNoIEwyQWRkcj0ke29yZGVyLnNlbmRlcn0gcmVxLmFyZzA9JHtyZXEuYXJnMH1gKTtcbiAgICB9XG4gICAgY29uc3QgcmVmdW5kVG9rZW5BZGRyID0gb3JkZXIuc2VsbFRva2VuSWQudG9TdHJpbmcoKSBhcyBUc1Rva2VuQWRkcmVzcztcbiAgICBjb25zdCByZWZ1bmRBbW91bnQgPSBCaWdJbnQob3JkZXIuc2VsbEFtdCkgLSBCaWdJbnQob3JkZXIuYWNjdW11bGF0ZWRTZWxsQW10KTtcblxuICAgIGF3YWl0IHRoaXMuYWNjb3VudEFuZFRva2VuQmVmb3JlVXBkYXRlKGFjY291bnQubGVhZklkLCByZWZ1bmRUb2tlbkFkZHIpO1xuICAgIGF3YWl0IHRoaXMudXBkYXRlQWNjb3VudFRva2VuKGFjY291bnQubGVhZklkLCByZWZ1bmRUb2tlbkFkZHIsIEJpZ0ludChyZWZ1bmRBbW91bnQpLCAtQmlnSW50KHJlZnVuZEFtb3VudCkpO1xuICAgIGF3YWl0IHRoaXMuYWNjb3VudEFuZFRva2VuQWZ0ZXJVcGRhdGUoYWNjb3VudC5sZWFmSWQsIHJlZnVuZFRva2VuQWRkcik7XG4gICAgYXdhaXQgdGhpcy5hY2NvdW50QW5kVG9rZW5CZWZvcmVVcGRhdGUoYWNjb3VudC5sZWFmSWQsIHJlZnVuZFRva2VuQWRkcik7XG4gICAgYXdhaXQgdGhpcy5hY2NvdW50QW5kVG9rZW5BZnRlclVwZGF0ZShhY2NvdW50LmxlYWZJZCwgcmVmdW5kVG9rZW5BZGRyKTtcblxuICAgIGF3YWl0IHRoaXMub3JkZXJCZWZvcmVVcGRhdGUob3JkZXIub3JkZXJMZWFmSWQpO1xuICAgIHRoaXMucmVtb3ZlT2JzT3JkZXIob3JkZXIub3JkZXJMZWFmSWQpO1xuICAgIGF3YWl0IHRoaXMub3JkZXJBZnRlclVwZGF0ZShvcmRlci5vcmRlckxlYWZJZCk7XG5cbiAgICBjb25zdCB7IHJfY2h1bmtzX2JpZ2ludCwgb19jaHVua3NfYmlnaW50LCBpc0NyaXRpY2FsQ2h1bmsgfSA9IHRoaXMuZ2V0VHhDaHVua3MocmVxKTtcbiAgICBjb25zdCB0c1B1YktleSA9IGF3YWl0IHRoaXMuZ2V0VHNQdWJLZXkoYWNjb3VudC5sZWFmSWQpO1xuICAgIGNvbnN0IHR4ID0ge1xuICAgICAgcmVxRGF0YSxcbiAgICAgIHRzUHViS2V5LCAvLyBEZXBvc2l0IHR4IG5vdCBuZWVkIHNpZ25hdHVyZVxuICAgICAgc2lnUjogcmVxLmVkZHNhU2lnLlI4LFxuICAgICAgc2lnUzogcmVxLmVkZHNhU2lnLlMsXG5cbiAgICAgIC8vIGNodW5rU2l6ZSAqIE1heFRva2VuVW5pdHNQZXJSZXFcbiAgICAgIHJfY2h1bmtzOiByX2NodW5rc19iaWdpbnQsXG4gICAgICAvLyBUT0RPOiBoYW5kbGUgcmVhY2ggb19jaHVua3MgbWF4IGxlbmd0aFxuICAgICAgb19jaHVua3M6IG9fY2h1bmtzX2JpZ2ludCxcbiAgICAgIGlzQ3JpdGljYWxDaHVuayxcbiAgICAgIC4uLnRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLFxuICAgICAgLi4udGhpcy5jdXJyZW50T3JkZXJQYXlsb2FkLFxuICAgIH07XG5cbiAgICB0aGlzLmFkZFR4TG9ncyh0eCk7XG4gICAgcmV0dXJuIHR4IGFzIHVua25vd24gYXMgVHNSb2xsdXBDaXJjdWl0SW5wdXRJdGVtVHlwZTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZG9Ob29wKCkge1xuICAgIGNvbnN0IG9yZGVyTGVhZklkID0gJzAnO1xuICAgIGNvbnN0IGFjY291bnQgPSBhd2FpdCB0aGlzLmdldEFjY291bnQoJzAnKTtcbiAgICBpZiAoIWFjY291bnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZG9Ob29wOiBhY2NvdW50IG5vdCBmb3VuZCcpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLmFjY291bnRBbmRUb2tlbkJlZm9yZVVwZGF0ZSgnMCcsIFRzVG9rZW5BZGRyZXNzLlVua25vd24pO1xuICAgIGF3YWl0IHRoaXMuYWNjb3VudEFuZFRva2VuQWZ0ZXJVcGRhdGUoJzAnLCBUc1Rva2VuQWRkcmVzcy5Vbmtub3duKTtcbiAgICBhd2FpdCB0aGlzLmFjY291bnRBbmRUb2tlbkJlZm9yZVVwZGF0ZSgnMCcsIFRzVG9rZW5BZGRyZXNzLlVua25vd24pO1xuICAgIGF3YWl0IHRoaXMuYWNjb3VudEFuZFRva2VuQWZ0ZXJVcGRhdGUoJzAnLCBUc1Rva2VuQWRkcmVzcy5Vbmtub3duKTtcbiAgICBhd2FpdCB0aGlzLm9yZGVyQmVmb3JlVXBkYXRlKG9yZGVyTGVhZklkKTtcbiAgICBhd2FpdCB0aGlzLm9yZGVyQWZ0ZXJVcGRhdGUob3JkZXJMZWFmSWQpO1xuICAgIGNvbnN0IHR4ID0ge1xuICAgICAgcmVxRGF0YTogWzBuLCAwbiwgMG4sIDBuLCAwbiwgMG4sIDBuLCAwbiwgMG4sIDBuXSxcbiAgICAgIHRzUHViS2V5OiBbJzAnLCAnMCddLCAvLyBEZXBvc2l0IHR4IG5vdCBuZWVkIHNpZ25hdHVyZVxuICAgICAgc2lnUjogWzBuLCAwbl0sXG4gICAgICBzaWdTOiAwbixcblxuICAgICAgcl9jaHVua3M6IG5ldyBBcnJheShNQVhfQ0hVTktTX1BFUl9SRVEpLmZpbGwoMG4pLFxuICAgICAgb19jaHVua3M6IFtUc1R4VHlwZS5VTktOT1dOXSxcbiAgICAgIGlzQ3JpdGljYWxDaHVuazogW1RzVHhUeXBlLlVOS05PV05dLFxuICAgICAgLi4udGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQsXG4gICAgICAuLi50aGlzLmN1cnJlbnRPcmRlclBheWxvYWQsXG4gICAgfTtcbiAgICB0aGlzLmFkZFR4TG9ncyh0eCk7XG4gICAgcmV0dXJuIHR4IGFzIHVua25vd24gYXMgVHNSb2xsdXBDaXJjdWl0SW5wdXRJdGVtVHlwZTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZG9EZXBvc2l0KHJlcTogVHJhbnNhY3Rpb25JbmZvKSB7XG4gICAgY29uc3QgYWNjb3VudExlYWZJZCA9IHJlcS5hcmcwO1xuICAgIGNvbnN0IGRlcG9zaXRMMkFkZHIgPSBCaWdJbnQocmVxLmFyZzApO1xuICAgIGNvbnN0IHJlcURhdGEgPSBbXG4gICAgICBCaWdJbnQoVHNUeFR5cGUuREVQT1NJVCksXG4gICAgICBCaWdJbnQoVHNTeXN0ZW1BY2NvdW50QWRkcmVzcy5NSU5UX0FERFIpLFxuICAgICAgQmlnSW50KHJlcS50b2tlbklkKSxcbiAgICAgIEJpZ0ludChyZXEuYW1vdW50KSxcbiAgICAgIEJpZ0ludChyZXEubm9uY2UpLFxuICAgICAgZGVwb3NpdEwyQWRkcixcbiAgICAgIDBuLFxuICAgICAgMG4sXG4gICAgICAwbixcbiAgICAgIDBuLFxuICAgIF07XG4gICAgY29uc3Qgb3JkZXJMZWFmSWQgPSAnMCc7XG4gICAgY29uc3QgZGVwb3NpdEFjY291bnQgPSB0aGlzLmdldEFjY291bnQocmVxLmFyZzApO1xuICAgIGlmICghZGVwb3NpdEFjY291bnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRGVwb3NpdCBhY2NvdW50IG5vdCBmb3VuZCBMMkFkZHI9JHtkZXBvc2l0TDJBZGRyfWApO1xuICAgIH1cbiAgICBjb25zdCB0b2tlbklkID0gcmVxLnRva2VuSWQudG9TdHJpbmcoKSBhcyBUc1Rva2VuQWRkcmVzcztcblxuICAgIGF3YWl0IHRoaXMuYWNjb3VudEFuZFRva2VuQmVmb3JlVXBkYXRlKGFjY291bnRMZWFmSWQsIHRva2VuSWQpO1xuICAgIGF3YWl0IHRoaXMub3JkZXJCZWZvcmVVcGRhdGUob3JkZXJMZWFmSWQpO1xuXG4gICAgYXdhaXQgdGhpcy51cGRhdGVBY2NvdW50VG9rZW4oYWNjb3VudExlYWZJZCwgdG9rZW5JZCwgQmlnSW50KHJlcS5hbW91bnQpLCAwbik7XG5cbiAgICBhd2FpdCB0aGlzLmFjY291bnRBbmRUb2tlbkFmdGVyVXBkYXRlKGFjY291bnRMZWFmSWQsIHRva2VuSWQpO1xuICAgIGF3YWl0IHRoaXMub3JkZXJBZnRlclVwZGF0ZShvcmRlckxlYWZJZCk7XG5cbiAgICAvLyBUT0RPOiBmaWxsIGxlZnQgcmVxc1xuICAgIGF3YWl0IHRoaXMuYWNjb3VudEFuZFRva2VuQmVmb3JlVXBkYXRlKGFjY291bnRMZWFmSWQsIHRva2VuSWQpO1xuICAgIGF3YWl0IHRoaXMuYWNjb3VudEFuZFRva2VuQWZ0ZXJVcGRhdGUoYWNjb3VudExlYWZJZCwgdG9rZW5JZCk7XG4gICAgLy8gYXdhaXQgdGhpcy5vcmRlckJlZm9yZVVwZGF0ZShvcmRlckxlYWZJZCk7XG4gICAgLy8gYXdhaXQgdGhpcy5vcmRlckFmdGVyVXBkYXRlKG9yZGVyTGVhZklkKTtcbiAgICBjb25zdCB7IHJfY2h1bmtzX2JpZ2ludCwgb19jaHVua3NfYmlnaW50LCBpc0NyaXRpY2FsQ2h1bmsgfSA9IHRoaXMuZ2V0VHhDaHVua3MocmVxKTtcblxuICAgIGNvbnN0IHR4ID0ge1xuICAgICAgcmVxRGF0YSxcbiAgICAgIC8vIHRzUHViS2V5OiBkZXBvc2l0QWNjb3VudC50c1B1YktleSwgLy8gRGVwb3NpdCB0eCBub3QgbmVlZCBzaWduYXR1cmVcbiAgICAgIHNpZ1I6IFsnMCcsICcwJ10sXG4gICAgICBzaWdTOiAnMCcsXG5cbiAgICAgIC8vIGNodW5rU2l6ZSAqIE1heFRva2VuVW5pdHNQZXJSZXFcbiAgICAgIHJfY2h1bmtzOiByX2NodW5rc19iaWdpbnQsXG4gICAgICAvLyBUT0RPOiBoYW5kbGUgcmVhY2ggb19jaHVua3MgbWF4IGxlbmd0aFxuICAgICAgb19jaHVua3M6IG9fY2h1bmtzX2JpZ2ludCxcbiAgICAgIGlzQ3JpdGljYWxDaHVuayxcbiAgICAgIC4uLnRoaXMuY3VycmVudEFjY291bnRQYXlsb2FkLFxuICAgICAgLi4udGhpcy5jdXJyZW50T3JkZXJQYXlsb2FkLFxuICAgIH07XG5cbiAgICB0aGlzLmFkZFR4TG9ncyh0eCk7XG4gICAgcmV0dXJuIHR4IGFzIHVua25vd24gYXMgVHNSb2xsdXBDaXJjdWl0SW5wdXRJdGVtVHlwZTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZG9SZWdpc3RlcihyZXE6IFRyYW5zYWN0aW9uSW5mbyk6IFByb21pc2U8VHNSb2xsdXBDaXJjdWl0SW5wdXRJdGVtVHlwZT4ge1xuICAgIGNvbnN0IHJlZ2lzdGVyTDJBZGRyID0gQmlnSW50KHJlcS5hcmcwKTtcbiAgICBjb25zdCBhY2NvdW50TGVhZklkID0gcmVnaXN0ZXJMMkFkZHIudG9TdHJpbmcoKTtcbiAgICBjb25zdCByZWdpc3RlclRva2VuSWQgPSByZXEudG9rZW5BZGRyO1xuICAgIGNvbnN0IHQgPSB7XG4gICAgICBbcmVxLnRva2VuQWRkciBhcyBUc1Rva2VuQWRkcmVzc106IHtcbiAgICAgICAgYW1vdW50OiBCaWdJbnQocmVxLmFtb3VudCksXG4gICAgICAgIGxvY2tBbXQ6IDBuLFxuICAgICAgfSxcbiAgICB9O1xuICAgIGNvbnN0IHRva2VuSW5mb3MgPSByZXEudG9rZW5BZGRyICE9PSBUc1Rva2VuQWRkcmVzcy5Vbmtub3duICYmIE51bWJlcihyZXEuYW1vdW50KSA+IDAgPyB0IDoge307XG4gICAgY29uc3QgYWNjb3VudEluZm8gPSBhd2FpdCB0aGlzLmFjY291bnRJbmZvUmVwb3NpdG9yeS5maW5kT25lT3JGYWlsKHtcbiAgICAgIHdoZXJlOiB7XG4gICAgICAgIGFjY291bnRJZDogcmVnaXN0ZXJMMkFkZHIudG9TdHJpbmcoKSxcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zdCBoYXNoZWRUc1B1YktleSA9IGFjY291bnRJbmZvLmhhc2hlZFRzUHViS2V5O1xuICAgIGNvbnN0IHJlZ2lzdGVyQWNjb3VudCA9IHRoaXMuYWNjb3VudExlYWZOb2RlUmVwb3NpdG9yeS5jcmVhdGUoKTtcbiAgICByZWdpc3RlckFjY291bnQubGVhZklkID0gcmVnaXN0ZXJMMkFkZHIudG9TdHJpbmcoKTtcbiAgICByZWdpc3RlckFjY291bnQudHNBZGRyID0gaGFzaGVkVHNQdWJLZXkudG9TdHJpbmcoKTtcbiAgICAvLyBjb25zdCByZWdpc3RlckFjY291bnQgPSBuZXcgVHNSb2xsdXBBY2NvdW50KHRva2VuSW5mb3MsIHRoaXMuY29uZmlnLnRva2VuX3RyZWVfaGVpZ2h0LCBbQmlnSW50KHJlcS50c1B1YktleVgpLCBCaWdJbnQocmVxLnRzUHViS2V5WSldKTtcbiAgICBjb25zdCBvcmRlckxlYWZJZCA9ICcwJztcbiAgICBjb25zdCByZXFEYXRhID0gW1xuICAgICAgQmlnSW50KFRzVHhUeXBlLlJFR0lTVEVSKSxcbiAgICAgIEJpZ0ludChUc1N5c3RlbUFjY291bnRBZGRyZXNzLk1JTlRfQUREUiksXG4gICAgICBCaWdJbnQocmVxLnRva2VuSWQpLFxuICAgICAgQmlnSW50KHJlcS5hbW91bnQpLFxuICAgICAgQmlnSW50KDApLFxuICAgICAgcmVnaXN0ZXJMMkFkZHIsXG4gICAgICBoYXNoZWRUc1B1YktleSxcbiAgICAgIDBuLFxuICAgICAgMG4sXG4gICAgICAwbixcbiAgICBdO1xuICAgIGF3YWl0IHRoaXMuYWNjb3VudEFuZFRva2VuQmVmb3JlVXBkYXRlKGFjY291bnRMZWFmSWQsIHJlZ2lzdGVyVG9rZW5JZCk7XG5cbiAgICAvKiogdXBkYXRlIHN0YXRlICovXG4gICAgdGhpcy5hZGRBY2NvdW50KHJlZ2lzdGVyTDJBZGRyLCB7XG4gICAgICBsMkFkZHI6IHJlZ2lzdGVyTDJBZGRyLFxuICAgICAgdHNBZGRyOiBoYXNoZWRUc1B1YktleSxcbiAgICB9KTtcblxuICAgIGF3YWl0IHRoaXMuYWNjb3VudEFuZFRva2VuQWZ0ZXJVcGRhdGUoYWNjb3VudExlYWZJZCwgcmVnaXN0ZXJUb2tlbklkKTtcblxuICAgIC8vIFRPRE86IGZpbGwgbGVmdCByZXFzXG4gICAgYXdhaXQgdGhpcy5hY2NvdW50QW5kVG9rZW5CZWZvcmVVcGRhdGUoYWNjb3VudExlYWZJZCwgcmVnaXN0ZXJUb2tlbklkKTtcbiAgICBhd2FpdCB0aGlzLmFjY291bnRBbmRUb2tlbkFmdGVyVXBkYXRlKGFjY291bnRMZWFmSWQsIHJlZ2lzdGVyVG9rZW5JZCk7XG4gICAgYXdhaXQgdGhpcy5vcmRlckJlZm9yZVVwZGF0ZShvcmRlckxlYWZJZCk7XG4gICAgYXdhaXQgdGhpcy5vcmRlckFmdGVyVXBkYXRlKG9yZGVyTGVhZklkKTtcblxuICAgIGNvbnN0IHsgcl9jaHVua3NfYmlnaW50LCBvX2NodW5rc19iaWdpbnQsIGlzQ3JpdGljYWxDaHVuayB9ID0gdGhpcy5nZXRUeENodW5rcyhyZXEpO1xuXG4gICAgY29uc3QgdHggPSB7XG4gICAgICByZXFEYXRhLFxuICAgICAgdHNQdWJLZXk6IFthY2NvdW50SW5mby50c1B1YktleVgsIGFjY291bnRJbmZvLnRzUHViS2V5WV0sXG4gICAgICBzaWdSOiBbJzAnLCAnMCddLCAvLyByZWdpc3RlciBhY2NvdW50IG5vIG5lZWQgc2lnXG4gICAgICBzaWdTOiAnMCcsIC8vIHJlZ2lzdGVyIGFjY291bnQgbm8gbmVlZCBzaWdcblxuICAgICAgLy8gY2h1bmtTaXplICogTWF4VG9rZW5Vbml0c1BlclJlcVxuICAgICAgcl9jaHVua3M6IHJfY2h1bmtzX2JpZ2ludCxcbiAgICAgIC8vIFRPRE86IGhhbmRsZSByZWFjaCBvX2NodW5rcyBtYXggbGVuZ3RoXG4gICAgICBvX2NodW5rczogb19jaHVua3NfYmlnaW50LFxuICAgICAgaXNDcml0aWNhbENodW5rLFxuICAgICAgLi4udGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQsXG4gICAgICAuLi50aGlzLmN1cnJlbnRPcmRlclBheWxvYWQsXG4gICAgfTtcblxuICAgIHRoaXMuYWRkVHhMb2dzKHR4KTtcbiAgICByZXR1cm4gdHggYXMgdW5rbm93biBhcyBUc1JvbGx1cENpcmN1aXRJbnB1dEl0ZW1UeXBlO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBkb1dpdGhkcmF3KHJlcTogVHJhbnNhY3Rpb25JbmZvKTogUHJvbWlzZTxUc1JvbGx1cENpcmN1aXRJbnB1dEl0ZW1UeXBlPiB7XG4gICAgY29uc3QgcmVxRGF0YSA9IGVuY29kZVJvbGx1cFdpdGhkcmF3TWVzc2FnZShyZXEpO1xuICAgIGNvbnN0IG9yZGVyTGVhZklkID0gJzAnO1xuICAgIGNvbnN0IHRyYW5zZmVyTDJBZGRyRnJvbSA9IEJpZ0ludChyZXEuYWNjb3VudElkKTtcbiAgICBjb25zdCBhY2NvdW50TGVhZklkID0gcmVxLmFjY291bnRJZDtcbiAgICBjb25zdCBmcm9tID0gYXdhaXQgdGhpcy5nZXRBY2NvdW50KHRyYW5zZmVyTDJBZGRyRnJvbS50b1N0cmluZygpKTtcbiAgICBpZiAoIWZyb20pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRGVwb3NpdCBhY2NvdW50IG5vdCBmb3VuZCBMMkFkZHI9JHtmcm9tfWApO1xuICAgIH1cbiAgICBjb25zdCBuZXdOb25jZSA9IEJpZ0ludChmcm9tLm5vbmNlKSArIDFuO1xuXG4gICAgYXdhaXQgdGhpcy5hY2NvdW50QW5kVG9rZW5CZWZvcmVVcGRhdGUoYWNjb3VudExlYWZJZCwgcmVxLnRva2VuQWRkcik7XG4gICAgYXdhaXQgdGhpcy51cGRhdGVBY2NvdW50VG9rZW4oZnJvbS5sZWFmSWQsIHJlcS50b2tlbkFkZHIsIC1CaWdJbnQocmVxLmFtb3VudCksIDBuKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZUFjY291bnROb25jZShmcm9tLmxlYWZJZCwgbmV3Tm9uY2UpO1xuICAgIGF3YWl0IHRoaXMuYWNjb3VudEFuZFRva2VuQWZ0ZXJVcGRhdGUoYWNjb3VudExlYWZJZCwgcmVxLnRva2VuQWRkcik7XG5cbiAgICBhd2FpdCB0aGlzLmFjY291bnRBbmRUb2tlbkJlZm9yZVVwZGF0ZShhY2NvdW50TGVhZklkLCByZXEudG9rZW5BZGRyKTtcbiAgICBhd2FpdCB0aGlzLmFjY291bnRBbmRUb2tlbkFmdGVyVXBkYXRlKGFjY291bnRMZWFmSWQsIHJlcS50b2tlbkFkZHIpO1xuICAgIGF3YWl0IHRoaXMub3JkZXJCZWZvcmVVcGRhdGUob3JkZXJMZWFmSWQpO1xuICAgIGF3YWl0IHRoaXMub3JkZXJBZnRlclVwZGF0ZShvcmRlckxlYWZJZCk7XG5cbiAgICBjb25zdCB7IHJfY2h1bmtzX2JpZ2ludCwgb19jaHVua3NfYmlnaW50LCBpc0NyaXRpY2FsQ2h1bmsgfSA9IHRoaXMuZ2V0VHhDaHVua3MocmVxKTtcbiAgICBjb25zdCB0c1B1YktleSA9IGF3YWl0IHRoaXMuZ2V0VHNQdWJLZXkoYWNjb3VudExlYWZJZCk7XG4gICAgY29uc3QgdHggPSB7XG4gICAgICByZXFEYXRhLFxuICAgICAgdHNQdWJLZXksIC8vIERlcG9zaXQgdHggbm90IG5lZWQgc2lnbmF0dXJlXG4gICAgICBzaWdSOiByZXEuZWRkc2FTaWcuUjgsXG4gICAgICBzaWdTOiByZXEuZWRkc2FTaWcuUyxcblxuICAgICAgLy8gY2h1bmtTaXplICogTWF4VG9rZW5Vbml0c1BlclJlcVxuICAgICAgcl9jaHVua3M6IHJfY2h1bmtzX2JpZ2ludCxcbiAgICAgIC8vIFRPRE86IGhhbmRsZSByZWFjaCBvX2NodW5rcyBtYXggbGVuZ3RoXG4gICAgICBvX2NodW5rczogb19jaHVua3NfYmlnaW50LFxuICAgICAgaXNDcml0aWNhbENodW5rLFxuICAgICAgLi4udGhpcy5jdXJyZW50QWNjb3VudFBheWxvYWQsXG4gICAgICAuLi50aGlzLmN1cnJlbnRPcmRlclBheWxvYWQsXG4gICAgfTtcblxuICAgIHRoaXMuYWRkVHhMb2dzKHR4KTtcbiAgICByZXR1cm4gdHggYXMgdW5rbm93biBhcyBUc1JvbGx1cENpcmN1aXRJbnB1dEl0ZW1UeXBlO1xuICB9XG5cbn1cbiIsImltcG9ydCB7IFRzQWNjb3VudExlYWZUeXBlLCBUc1Rva2VuTGVhZlR5cGUgfSBmcm9tICcuLi90cy10eXBlcy90cy1tZXJrbGV0cmVlLnR5cGVzJztcblxuZXhwb3J0IHR5cGUgVHNSb2xsdXBDb25maWdUeXBlID0ge1xuICBvcmRlcl90cmVlX2hlaWdodDogbnVtYmVyO1xuICBsMl9hY2NfYWRkcl9zaXplOiBudW1iZXI7XG4gIGwyX3Rva2VuX2FkZHJfc2l6ZTogbnVtYmVyO1xuICBudWxsaWZpZXJfdHJlZV9oZWlnaHQ6IG51bWJlcjtcbiAgbnVtT2ZDaHVua3M6IG51bWJlcjtcblxuICBudW1PZlJlcXM6IG51bWJlcjtcbiAgcmVnaXN0ZXJfYmF0Y2hfc2l6ZTogbnVtYmVyO1xuICB0b2tlbl90cmVlX2hlaWdodDogbnVtYmVyO1xuICBhdWN0aW9uX21hcmtldF9jb3VudDogbnVtYmVyO1xuICBhdWN0aW9uX2xlbmRlcl9jb3VudDogbnVtYmVyO1xuICBhdWN0aW9uX2JvcnJvd2VyX2NvdW50OiBudW1iZXI7XG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIENpcmN1aXRBY2NvdW50VHhQYXlsb2FkIHtcbiAgcl9hY2NvdW50TGVhZklkOiBhbnlbXTtcbiAgcl9vcmlBY2NvdW50TGVhZjogQXJyYXk8VHNBY2NvdW50TGVhZlR5cGU+O1xuICByX25ld0FjY291bnRMZWFmOiBBcnJheTxUc0FjY291bnRMZWFmVHlwZT47XG4gIHJfYWNjb3VudFJvb3RGbG93OiBhbnlbXTtcbiAgcl9hY2NvdW50TWtQcmY6IEFycmF5PHN0cmluZ1tdfCBiaWdpbnRbXT47XG4gIHJfdG9rZW5MZWFmSWQ6IEFycmF5PHN0cmluZ1tdPjtcbiAgcl9vcmlUb2tlbkxlYWY6IFRzVG9rZW5MZWFmVHlwZVtdO1xuICByX25ld1Rva2VuTGVhZjogVHNUb2tlbkxlYWZUeXBlW107XG4gIHJfdG9rZW5Sb290RmxvdzogQXJyYXk8c3RyaW5nW10+O1xuICByX3Rva2VuTWtQcmY6IEFycmF5PHN0cmluZ1tdIHwgYmlnaW50W10+O1xufVxuZXhwb3J0IGludGVyZmFjZSBDaXJjdWl0T3JkZXJUeFBheWxvYWQge1xuICByX29yZGVyTGVhZklkOiBBcnJheTxbc3RyaW5nXT47XG4gIHJfb3JpT3JkZXJMZWFmOiBBcnJheTxzdHJpbmdbXSB8IGJpZ2ludFtdPjtcbiAgcl9uZXdPcmRlckxlYWY6IEFycmF5PHN0cmluZ1tdIHwgYmlnaW50W10+O1xuICByX29yZGVyUm9vdEZsb3c6IEFycmF5PHN0cmluZ1tdPjtcbiAgcl9vcmRlck1rUHJmOiBBcnJheTxzdHJpbmdbXSB8IGJpZ2ludFtdPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDaXJjdWl0TnVsbGlmaWVyVHhQYXlsb2FkIHtcbiAgcl9udWxsaWZpZXJMZWFmSWQ6IHN0cmluZ1tdO1xuICByX29yaU51bGxpZmllckxlYWY6IEFycmF5PHN0cmluZ1tdIHwgYmlnaW50W10+O1xuICByX25ld051bGxpZmllckxlYWY6IEFycmF5PHN0cmluZ1tdIHwgYmlnaW50W10+O1xuICByX251bGxpZmllclJvb3RGbG93OiBzdHJpbmdbXTtcbiAgcl9udWxsaWZpZXJNa1ByZjogQXJyYXk8c3RyaW5nW10+O1xufVxuXG5leHBvcnQgZW51bSBSb2xsdXBTdGF0dXMge1xuICBVbmtub3duID0gMCxcbiAgSWRsZSxcbiAgUnVubmluZyxcbn1cblxuZXhwb3J0IGVudW0gUm9sbHVwQ2lyY3VpdFR5cGUge1xuICBVbmtub3duID0gMCxcbiAgUmVnaXN0ZXIgPSAxLFxuICBUcmFuc2ZlciA9IDIsXG59XG4iLCJpbXBvcnQgeyBUcmFuc2FjdGlvbkluZm8gfSBmcm9tICdAY29tbW9uL3RzLXR5cGVvcm0vYWNjb3VudC90cmFuc2FjdGlvbkluZm8uZW50aXR5JztcbmltcG9ydCB7IFRzVHhEZXBvc2l0Tm9uU2lnbmF0dXJlUmVxdWVzdCwgVHNUeExpbWl0T3JkZXJSZXF1ZXN0LCBUc1R4UmVnaXN0ZXJSZXF1ZXN0LCBUc1R4V2l0aGRyYXdSZXF1ZXN0IH0gZnJvbSAnLi4vdHMtdHlwZXMvdHMtcmVxLXR5cGVzJztcbmltcG9ydCB7IFRzVHhUeXBlLCBUc1Rva2VuQWRkcmVzcyB9IGZyb20gJy4uL3RzLXR5cGVzL3RzLXR5cGVzJztcblxuZXhwb3J0IHR5cGUgQ2lyY3VpdFJlcURhdGFUeXBlID0gW2JpZ2ludCwgYmlnaW50LCBiaWdpbnQsIGJpZ2ludCwgYmlnaW50LCBiaWdpbnQsIGJpZ2ludCwgYmlnaW50LCBiaWdpbnQsIGJpZ2ludF07XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVSb2xsdXBXaXRoZHJhd01lc3NhZ2UocmVxOiBUcmFuc2FjdGlvbkluZm8pOiBDaXJjdWl0UmVxRGF0YVR5cGUge1xuICByZXR1cm4gW0JpZ0ludChUc1R4VHlwZS5XSVRIRFJBVyksIEJpZ0ludChyZXEuYWNjb3VudElkKSwgQmlnSW50KHJlcS50b2tlbklkKSwgQmlnSW50KHJlcS5hbW91bnQpLCBCaWdJbnQocmVxLm5vbmNlKSwgMG4sIDBuLCAwbiwgMG4sIDBuXTtcbn0iLCJpbXBvcnQgeyBCaWdOdW1iZXIsIGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XG5pbXBvcnQgeyByZWN1cnNpdmVUb1N0cmluZyB9IGZyb20gJy4uL2hlbHBlcic7XG5pbXBvcnQgeyBUc1JvbGx1cENpcmN1aXRJbnB1dFR5cGUgfSBmcm9tICcuLi90cy10eXBlcy90cy1jaXJjdWl0LXR5cGVzJztcbmltcG9ydCB7IFRzVG9rZW5MZWFmVHlwZSB9IGZyb20gJy4uL3RzLXR5cGVzL3RzLW1lcmtsZXRyZWUudHlwZXMnO1xuaW1wb3J0IHtcbiAgVHNUeENhbmNlbE9yZGVyTm9uU2lnbmF0dXJlUmVxdWVzdCxcbiAgVHNUeERlcG9zaXROb25TaWduYXR1cmVSZXF1ZXN0LFxuICBUc1R4TGltaXRPcmRlck5vblNpZ25hdHVyZVJlcXVlc3QsXG4gIFRzVHhNYXJrZXRPcmRlck5vblNpZ25hdHVyZVJlcXVlc3QsXG4gIFRzVHhSZWdpc3RlclJlcXVlc3QsXG4gIFRzVHhXaXRoZHJhd05vblNpZ25hdHVyZVJlcXVlc3QsXG59IGZyb20gJy4uL3RzLXR5cGVzL3RzLXJlcS10eXBlcyc7XG5pbXBvcnQgeyBDSFVOS19CWVRFU19TSVpFLCBNQVhfQ0hVTktTX0JZVEVTX1BFUl9SRVEsIFRzVG9rZW5BZGRyZXNzLCBUc1Rva2VuSW5mbywgVHNUeFJlcXVlc3REYXRhc1R5cGUsIFRzVHhUeXBlIH0gZnJvbSAnLi4vdHMtdHlwZXMvdHMtdHlwZXMnO1xuaW1wb3J0IHsgdHhUb0NpcmN1aXRJbnB1dCB9IGZyb20gJy4vdHMtaGVscGVyJztcbmltcG9ydCB7IGFtb3VudFRvVHhBbW91bnRWM180MGJpdCB9IGZyb20gJy4uL2JpZ2ludC1oZWxwZXInO1xuaW1wb3J0IHsgVHJhbnNhY3Rpb25JbmZvIH0gZnJvbSAnQGNvbW1vbi90cy10eXBlb3JtL2FjY291bnQvdHJhbnNhY3Rpb25JbmZvLmVudGl0eSc7XG5cbi8vIFtMMkFkZHJGcm9tLCBMMkFkZHJUbywgTDJUb2tlbkFkZHIsIHRva2VuQW10LCBub25jZSwgYXJnMCwgYXJnMSwgYXJnMiwgYXJnMywgYXJnNF1cbmV4cG9ydCBmdW5jdGlvbiBleHBvcnRUcmFuc2ZlckNpcmN1aXRJbnB1dChcbiAgdHhMb2dzOiBhbnlbXSxcbiAgb3JpVHhOdW06IGJpZ2ludCxcbiAgYWNjb3VudFJvb3RGbG93OiBiaWdpbnRbXSxcbiAgb3JkZXJSb290RmxvdzogYmlnaW50W10sXG4pOiBUc1JvbGx1cENpcmN1aXRJbnB1dFR5cGUge1xuICBjb25zdCBpbnB1dHMgPSB0eHNUb1JvbGx1cENpcmN1aXRJbnB1dCh0eExvZ3MpIGFzIGFueTtcblxuICAvLyBUT0RPOiB0eXBlIGNoZWNrXG4gIGlucHV0c1snb3JpVHhOdW0nXSA9IG9yaVR4TnVtLnRvU3RyaW5nKCk7XG4gIGlucHV0c1snYWNjb3VudFJvb3RGbG93J10gPSBhY2NvdW50Um9vdEZsb3cubWFwKCh4KSA9PiByZWN1cnNpdmVUb1N0cmluZyh4KSk7XG4gIGlucHV0c1snb3JkZXJSb290RmxvdyddID0gb3JkZXJSb290Rmxvdy5tYXAoKHgpID0+IHJlY3Vyc2l2ZVRvU3RyaW5nKHgpKTtcbiAgcmV0dXJuIGlucHV0cztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHR4c1RvUm9sbHVwQ2lyY3VpdElucHV0PFQsIEI+KG9iajogYW55W10sIGluaXREYXRhOiBhbnkgPSB7fSk6IFRzUm9sbHVwQ2lyY3VpdElucHV0VHlwZSB7XG4gIG9iai5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgdHhUb0NpcmN1aXRJbnB1dChpdGVtLCBpbml0RGF0YSk7XG4gIH0pO1xuICByZXR1cm4gaW5pdERhdGE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVUeERlcG9zaXRNZXNzYWdlKHR4RGVwb3NpdFJlcTogVHNUeERlcG9zaXROb25TaWduYXR1cmVSZXF1ZXN0KTogVHNUeFJlcXVlc3REYXRhc1R5cGUge1xuICByZXR1cm4gW0JpZ0ludChUc1R4VHlwZS5ERVBPU0lUKSwgQmlnSW50KHR4RGVwb3NpdFJlcS5zZW5kZXIpLCBCaWdJbnQodHhEZXBvc2l0UmVxLnRva2VuSWQpLCBCaWdJbnQodHhEZXBvc2l0UmVxLnN0YXRlQW10KSwgMG4sIDBuLCAwbiwgMG4sIDBuLCAwbl07XG59XG5cbi8vIGV4cG9ydCBmdW5jdGlvbiBlbmNvZGVUeFRyYW5zZmVyTWVzc2FnZSh0eFRyYW5zZmVyUmVxOiBUc1R4VHJhbnNmZXJOb25TaWduYXR1cmVSZXF1ZXN0KTogVHNUeFJlcXVlc3REYXRhc1R5cGUge1xuLy8gICByZXR1cm4gW1xuLy8gICAgIEJpZ0ludChUc1R4VHlwZS5UUkFOU0ZFUiksXG4vLyAgICAgQmlnSW50KHR4VHJhbnNmZXJSZXEuTDJBZGRyRnJvbSksXG4vLyAgICAgQmlnSW50KHR4VHJhbnNmZXJSZXEuTDJUb2tlbkFkZHIpLFxuLy8gICAgIEJpZ0ludCh0eFRyYW5zZmVyUmVxLnR4QW1vdW50IHx8IDApLFxuLy8gICAgIEJpZ0ludCh0eFRyYW5zZmVyUmVxLm5vbmNlKSxcbi8vICAgICBCaWdJbnQodHhUcmFuc2ZlclJlcS5MMkFkZHJUbyksXG4vLyAgICAgMG4sIDBuLCAwbiwgMG4sXG4vLyAgIF07XG4vLyB9XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVUeFdpdGhkcmF3TWVzc2FnZSh0eFRyYW5zZmVyUmVxOiBUc1R4V2l0aGRyYXdOb25TaWduYXR1cmVSZXF1ZXN0KTogVHNUeFJlcXVlc3REYXRhc1R5cGUge1xuICByZXR1cm4gW1xuICAgIEJpZ0ludChUc1R4VHlwZS5XSVRIRFJBVyksXG4gICAgQmlnSW50KHR4VHJhbnNmZXJSZXEuc2VuZGVyKSxcbiAgICBCaWdJbnQodHhUcmFuc2ZlclJlcS50b2tlbklkKSxcbiAgICBCaWdJbnQodHhUcmFuc2ZlclJlcS5zdGF0ZUFtdCksXG4gICAgQmlnSW50KHR4VHJhbnNmZXJSZXEubm9uY2UpLFxuICAgIDBuLFxuICAgIDBuLFxuICAgIDBuLFxuICAgIDBuLFxuICAgIDBuLFxuICBdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW1wdHlSZWdpc3RlclR4KCkge1xuICBjb25zdCByZXE6IFRzVHhSZWdpc3RlclJlcXVlc3QgPSB7XG4gICAgc2VuZGVyOiAnMCcsXG4gICAgcmVxVHlwZTogVHNUeFR5cGUuUkVHSVNURVIsXG4gICAgdG9rZW5JZDogVHNUb2tlbkFkZHJlc3MuVW5rbm93bixcbiAgICB0c0FkZHI6ICcwJyxcbiAgICBzdGF0ZUFtdDogJzAnLFxuICAgIEwxQWRkcjogJzB4MDAnLFxuICAgIHRzUHViS2V5OiBbJzAnLCAnMCddLFxuICB9O1xuICByZXR1cm4gcmVxO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlVHNUeExpbWl0T3JkZXJNZXNzYWdlKHR4TGltaXRPcmRlclJlcTogVHNUeExpbWl0T3JkZXJOb25TaWduYXR1cmVSZXF1ZXN0KTogVHNUeFJlcXVlc3REYXRhc1R5cGUge1xuICByZXR1cm4gW1xuICAgIEJpZ0ludChUc1R4VHlwZS5TZWNvbmRMaW1pdE9yZGVyKSxcbiAgICBCaWdJbnQodHhMaW1pdE9yZGVyUmVxLnNlbmRlciksXG4gICAgQmlnSW50KHR4TGltaXRPcmRlclJlcS5zZWxsVG9rZW5JZCksXG4gICAgQmlnSW50KHR4TGltaXRPcmRlclJlcS5zZWxsQW10KSxcbiAgICBCaWdJbnQodHhMaW1pdE9yZGVyUmVxLm5vbmNlKSxcbiAgICAwbixcbiAgICAwbiwgLy8gYXJnMCwgYXJnMSxcbiAgICBCaWdJbnQodHhMaW1pdE9yZGVyUmVxLmJ1eVRva2VuSWQpLCAvLyBhcmcyXG4gICAgQmlnSW50KHR4TGltaXRPcmRlclJlcS5idXlBbXQpLCAvLyBhcmczXG4gICAgMG4sIC8vIGFyZzRcbiAgXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZVRzVHhNYXJrZXRPcmRlck1lc3NhZ2UodHhNYXJrZXRPcmRlclJlcTogVHNUeE1hcmtldE9yZGVyTm9uU2lnbmF0dXJlUmVxdWVzdCk6IFRzVHhSZXF1ZXN0RGF0YXNUeXBlIHtcbiAgcmV0dXJuIFtcbiAgICBCaWdJbnQoVHNUeFR5cGUuU2Vjb25kTWFya2V0T3JkZXIpLFxuICAgIEJpZ0ludCh0eE1hcmtldE9yZGVyUmVxLnNlbmRlciksXG4gICAgQmlnSW50KHR4TWFya2V0T3JkZXJSZXEuc2VsbFRva2VuSWQpLFxuICAgIEJpZ0ludCh0eE1hcmtldE9yZGVyUmVxLnNlbGxBbXQpLFxuICAgIEJpZ0ludCh0eE1hcmtldE9yZGVyUmVxLm5vbmNlKSxcbiAgICAwbixcbiAgICAwbiwgLy8gYXJnMCwgYXJnMSxcbiAgICBCaWdJbnQodHhNYXJrZXRPcmRlclJlcS5idXlUb2tlbklkKSwgLy8gYXJnMlxuICAgIDBuLCAvLyBhcmczXG4gICAgMG4sIC8vIGFyZzRcbiAgXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZVR4Q2FuY2VsT3JkZXJNZXNzYWdlKHR4Q2FuY2VsT3JkZXJSZXE6IFRzVHhDYW5jZWxPcmRlck5vblNpZ25hdHVyZVJlcXVlc3QpOiBUc1R4UmVxdWVzdERhdGFzVHlwZSB7XG4gIHJldHVybiBbXG4gICAgQmlnSW50KFRzVHhUeXBlLkNhbmNlbE9yZGVyKSxcbiAgICAwbixcbiAgICAwbixcbiAgICAwbixcbiAgICAwbixcbiAgICAwbixcbiAgICAwbiwgLy8gYXJnMCwgYXJnMSxcbiAgICAwbiwgLy8gYXJnMlxuICAgIDBuLCAvLyBhcmczXG4gICAgQmlnSW50KHR4Q2FuY2VsT3JkZXJSZXEub3JkZXJMZWFmSWQpLCAvLyBhcmc0XG4gIF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVUb2tlbkxlYWYodG9rZW46IFRzVG9rZW5JbmZvKTogVHNUb2tlbkxlYWZUeXBlIHtcbiAgcmV0dXJuIFtCaWdJbnQodG9rZW4uYW1vdW50KSwgQmlnSW50KHRva2VuLmxvY2tBbXQpXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZVJDaHVua0J1ZmZlcihcbiAgdHhUcmFuc2ZlclJlcTogVHJhbnNhY3Rpb25JbmZvLFxuICBtZXRhZGF0YT86IHtcbiAgICB0eE9mZnNldDogYmlnaW50O1xuICAgIG1ha2VyQnV5QW10OiBiaWdpbnQ7XG4gIH0sXG4pIHtcbiAgY29uc3QgcmVxVHlwZSA9IHR4VHJhbnNmZXJSZXEucmVxVHlwZTtcbiAgc3dpdGNoIChyZXFUeXBlKSB7XG4gICAgY2FzZSBUc1R4VHlwZS5SRUdJU1RFUjpcbiAgICAgIGlmICghdHhUcmFuc2ZlclJlcS5hcmcwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYXJnMCBpcyByZXF1aXJlZCcpO1xuICAgICAgfVxuICAgICAgaWYgKCF0eFRyYW5zZmVyUmVxLmFyZzEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdoYXNoZWRUc1B1YktleSBpcyByZXF1aXJlZCcpO1xuICAgICAgfVxuICAgICAgY29uc3Qgb3V0X3IgPSBldGhlcnMudXRpbHNcbiAgICAgICAgLnNvbGlkaXR5UGFjayhcbiAgICAgICAgICBbJ3VpbnQ4JywgJ3VpbnQzMicsICd1aW50MTYnLCAndWludDEyOCcsICd1aW50MTYwJ10sXG4gICAgICAgICAgW1xuICAgICAgICAgICAgQmlnTnVtYmVyLmZyb20odHhUcmFuc2ZlclJlcS5yZXFUeXBlKSxcbiAgICAgICAgICAgIEJpZ051bWJlci5mcm9tKHR4VHJhbnNmZXJSZXEuYXJnMCksXG4gICAgICAgICAgICBCaWdOdW1iZXIuZnJvbSh0eFRyYW5zZmVyUmVxLnRva2VuSWQpLFxuICAgICAgICAgICAgQmlnTnVtYmVyLmZyb20odHhUcmFuc2ZlclJlcS5hbW91bnQpLFxuICAgICAgICAgICAgQmlnTnVtYmVyLmZyb20odHhUcmFuc2ZlclJlcS5hcmcxKSxcbiAgICAgICAgICBdLFxuICAgICAgICApXG4gICAgICAgIC5yZXBsYWNlQWxsKCcweCcsICcnKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJfY2h1bmtzOiBCdWZmZXIuY29uY2F0KFtCdWZmZXIuZnJvbShvdXRfciwgJ2hleCcpXSwgTUFYX0NIVU5LU19CWVRFU19QRVJfUkVRKSxcbiAgICAgICAgb19jaHVua3M6IEJ1ZmZlci5jb25jYXQoW0J1ZmZlci5mcm9tKG91dF9yLCAnaGV4JyldLCA0ICogQ0hVTktfQllURVNfU0laRSksXG4gICAgICAgIGlzQ3JpdGljYWw6IHRydWUsXG4gICAgICB9O1xuICAgIGNhc2UgVHNUeFR5cGUuREVQT1NJVDpcbiAgICAgIGlmICghdHhUcmFuc2ZlclJlcS5hcmcwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYXJnMCBpcyByZXF1aXJlZCcpO1xuICAgICAgfVxuICAgICAgY29uc3Qgb3V0X2QgPSBldGhlcnMudXRpbHNcbiAgICAgICAgLnNvbGlkaXR5UGFjayhcbiAgICAgICAgICBbJ3VpbnQ4JywgJ3VpbnQzMicsICd1aW50MTYnLCAndWludDEyOCddLFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIEJpZ051bWJlci5mcm9tKHR4VHJhbnNmZXJSZXEucmVxVHlwZSksXG4gICAgICAgICAgICBCaWdOdW1iZXIuZnJvbSh0eFRyYW5zZmVyUmVxLmFyZzApLFxuICAgICAgICAgICAgQmlnTnVtYmVyLmZyb20odHhUcmFuc2ZlclJlcS50b2tlbklkKSxcbiAgICAgICAgICAgIEJpZ051bWJlci5mcm9tKHR4VHJhbnNmZXJSZXEuYW1vdW50KSxcbiAgICAgICAgICBdLFxuICAgICAgICApXG4gICAgICAgIC5yZXBsYWNlQWxsKCcweCcsICcnKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJfY2h1bmtzOiBCdWZmZXIuY29uY2F0KFtCdWZmZXIuZnJvbShvdXRfZCwgJ2hleCcpXSwgTUFYX0NIVU5LU19CWVRFU19QRVJfUkVRKSxcbiAgICAgICAgb19jaHVua3M6IEJ1ZmZlci5jb25jYXQoW0J1ZmZlci5mcm9tKG91dF9kLCAnaGV4JyldLCAyICogQ0hVTktfQllURVNfU0laRSksXG4gICAgICAgIGlzQ3JpdGljYWw6IHRydWUsXG4gICAgICB9O1xuICAgIGNhc2UgVHNUeFR5cGUuV0lUSERSQVc6XG4gICAgICBjb25zdCBvdXRfdyA9IGV0aGVycy51dGlsc1xuICAgICAgICAuc29saWRpdHlQYWNrKFxuICAgICAgICAgIFsndWludDgnLCAndWludDMyJywgJ3VpbnQxNicsICd1aW50MTI4J10sXG4gICAgICAgICAgW1xuICAgICAgICAgICAgQmlnTnVtYmVyLmZyb20odHhUcmFuc2ZlclJlcS5yZXFUeXBlKSxcbiAgICAgICAgICAgIEJpZ051bWJlci5mcm9tKHR4VHJhbnNmZXJSZXEuYWNjb3VudElkKSxcbiAgICAgICAgICAgIEJpZ051bWJlci5mcm9tKHR4VHJhbnNmZXJSZXEudG9rZW5JZCksXG4gICAgICAgICAgICBCaWdOdW1iZXIuZnJvbSh0eFRyYW5zZmVyUmVxLmFtb3VudCksXG4gICAgICAgICAgXSxcbiAgICAgICAgKVxuICAgICAgICAucmVwbGFjZUFsbCgnMHgnLCAnJyk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByX2NodW5rczogQnVmZmVyLmNvbmNhdChbQnVmZmVyLmZyb20ob3V0X3csICdoZXgnKV0sIE1BWF9DSFVOS1NfQllURVNfUEVSX1JFUSksXG4gICAgICAgIG9fY2h1bmtzOiBCdWZmZXIuY29uY2F0KFtCdWZmZXIuZnJvbShvdXRfdywgJ2hleCcpXSwgMiAqIENIVU5LX0JZVEVTX1NJWkUpLFxuICAgICAgICBpc0NyaXRpY2FsOiB0cnVlLFxuICAgICAgfTtcbiAgICBjYXNlIFRzVHhUeXBlLlNlY29uZExpbWl0T3JkZXI6XG4gICAgICBjb25zdCBvdXRfc2xvID0gZXRoZXJzLnV0aWxzXG4gICAgICAgIC5zb2xpZGl0eVBhY2soXG4gICAgICAgICAgWyd1aW50OCcsICd1aW50MzInLCAndWludDE2JywgJ3VpbnQ0MCddLFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIEJpZ051bWJlci5mcm9tKHR4VHJhbnNmZXJSZXEucmVxVHlwZSksXG4gICAgICAgICAgICBCaWdOdW1iZXIuZnJvbSh0eFRyYW5zZmVyUmVxLmFjY291bnRJZCksXG4gICAgICAgICAgICBCaWdOdW1iZXIuZnJvbSh0eFRyYW5zZmVyUmVxLnRva2VuSWQpLFxuICAgICAgICAgICAgQmlnTnVtYmVyLmZyb20oYW1vdW50VG9UeEFtb3VudFYzXzQwYml0KEJpZ0ludCh0eFRyYW5zZmVyUmVxLmFtb3VudCkpKSxcbiAgICAgICAgICBdLFxuICAgICAgICApXG4gICAgICAgIC5yZXBsYWNlQWxsKCcweCcsICcnKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJfY2h1bmtzOiBCdWZmZXIuY29uY2F0KFtCdWZmZXIuZnJvbShvdXRfc2xvLCAnaGV4JyldLCBNQVhfQ0hVTktTX0JZVEVTX1BFUl9SRVEpLFxuICAgICAgICBvX2NodW5rczogQnVmZmVyLmNvbmNhdChbQnVmZmVyLmZyb20ob3V0X3NsbywgJ2hleCcpXSwgMSAqIENIVU5LX0JZVEVTX1NJWkUpLFxuICAgICAgICBpc0NyaXRpY2FsOiBmYWxzZSxcbiAgICAgIH07XG4gICAgY2FzZSBUc1R4VHlwZS5DYW5jZWxPcmRlcjpcbiAgICAgIGNvbnN0IG91dF9jbyA9IGV0aGVycy51dGlsc1xuICAgICAgICAuc29saWRpdHlQYWNrKFxuICAgICAgICAgIFsndWludDgnLCAndWludDMyJywgJ3VpbnQxNicsICd1aW50NDAnXSxcbiAgICAgICAgICBbXG4gICAgICAgICAgICBCaWdOdW1iZXIuZnJvbSh0eFRyYW5zZmVyUmVxLnJlcVR5cGUpLFxuICAgICAgICAgICAgQmlnTnVtYmVyLmZyb20odHhUcmFuc2ZlclJlcS5hcmcwKSxcbiAgICAgICAgICAgIEJpZ051bWJlci5mcm9tKHR4VHJhbnNmZXJSZXEudG9rZW5JZCksXG4gICAgICAgICAgICBCaWdOdW1iZXIuZnJvbShhbW91bnRUb1R4QW1vdW50VjNfNDBiaXQoQmlnSW50KHR4VHJhbnNmZXJSZXEuYW1vdW50KSkpLFxuICAgICAgICAgIF0sXG4gICAgICAgIClcbiAgICAgICAgLnJlcGxhY2VBbGwoJzB4JywgJycpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcl9jaHVua3M6IEJ1ZmZlci5jb25jYXQoW0J1ZmZlci5mcm9tKG91dF9jbywgJ2hleCcpXSwgTUFYX0NIVU5LU19CWVRFU19QRVJfUkVRKSxcbiAgICAgICAgb19jaHVua3M6IEJ1ZmZlci5jb25jYXQoW0J1ZmZlci5mcm9tKG91dF9jbywgJ2hleCcpXSwgMSAqIENIVU5LX0JZVEVTX1NJWkUpLFxuICAgICAgICBpc0NyaXRpY2FsOiBmYWxzZSxcbiAgICAgIH07XG4gICAgY2FzZSBUc1R4VHlwZS5TZWNvbmRMaW1pdFN0YXJ0OlxuICAgICAgaWYgKCFtZXRhZGF0YT8udHhPZmZzZXQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd0eE9mZnNldCBpcyByZXF1aXJlZCcpO1xuICAgICAgfVxuICAgICAgY29uc3Qgb3V0X3NscyA9IGV0aGVycy51dGlsc1xuICAgICAgICAuc29saWRpdHlQYWNrKFsndWludDgnLCAndWludDMyJ10sIFtCaWdOdW1iZXIuZnJvbSh0eFRyYW5zZmVyUmVxLnJlcVR5cGUpLCBCaWdOdW1iZXIuZnJvbShtZXRhZGF0YT8udHhPZmZzZXQpXSlcbiAgICAgICAgLnJlcGxhY2VBbGwoJzB4JywgJycpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcl9jaHVua3M6IEJ1ZmZlci5jb25jYXQoW0J1ZmZlci5mcm9tKG91dF9zbHMsICdoZXgnKV0sIE1BWF9DSFVOS1NfQllURVNfUEVSX1JFUSksXG4gICAgICAgIG9fY2h1bmtzOiBCdWZmZXIuY29uY2F0KFtCdWZmZXIuZnJvbShvdXRfc2xzLCAnaGV4JyldLCAxICogQ0hVTktfQllURVNfU0laRSksXG4gICAgICAgIGlzQ3JpdGljYWw6IGZhbHNlLFxuICAgICAgfTtcbiAgICBjYXNlIFRzVHhUeXBlLlNlY29uZExpbWl0RXhjaGFuZ2U6XG4gICAgICBpZiAoIW1ldGFkYXRhPy50eE9mZnNldCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3R4T2Zmc2V0IGlzIHJlcXVpcmVkJyk7XG4gICAgICB9XG4gICAgICBpZiAoIW1ldGFkYXRhPy5tYWtlckJ1eUFtdCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2J1eUFtdCBpcyByZXF1aXJlZCcpO1xuICAgICAgfVxuICAgICAgY29uc3Qgb3V0X3NsZSA9IGV0aGVycy51dGlsc1xuICAgICAgICAuc29saWRpdHlQYWNrKFxuICAgICAgICAgIFsndWludDgnLCAndWludDMyJywgJ3VpbnQ0MCddLFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIEJpZ051bWJlci5mcm9tKHR4VHJhbnNmZXJSZXEucmVxVHlwZSksXG4gICAgICAgICAgICBCaWdOdW1iZXIuZnJvbShtZXRhZGF0YT8udHhPZmZzZXQpLFxuICAgICAgICAgICAgQmlnTnVtYmVyLmZyb20oYW1vdW50VG9UeEFtb3VudFYzXzQwYml0KG1ldGFkYXRhPy5tYWtlckJ1eUFtdCkpLFxuICAgICAgICAgIF0sXG4gICAgICAgIClcbiAgICAgICAgLnJlcGxhY2VBbGwoJzB4JywgJycpO1xuICAgICAgY29uc29sZS5sb2coe1xuICAgICAgICBvdXRfc2xlOiBbXG4gICAgICAgICAgQmlnTnVtYmVyLmZyb20odHhUcmFuc2ZlclJlcS5yZXFUeXBlKSxcbiAgICAgICAgICBCaWdOdW1iZXIuZnJvbShtZXRhZGF0YT8udHhPZmZzZXQpLFxuICAgICAgICAgIEJpZ051bWJlci5mcm9tKGFtb3VudFRvVHhBbW91bnRWM180MGJpdChtZXRhZGF0YT8ubWFrZXJCdXlBbXQpKSxcbiAgICAgICAgXSxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcl9jaHVua3M6IEJ1ZmZlci5jb25jYXQoW0J1ZmZlci5mcm9tKG91dF9zbGUsICdoZXgnKV0sIE1BWF9DSFVOS1NfQllURVNfUEVSX1JFUSksXG4gICAgICAgIG9fY2h1bmtzOiBCdWZmZXIuY29uY2F0KFtCdWZmZXIuZnJvbShvdXRfc2xlLCAnaGV4JyldLCAxICogQ0hVTktfQllURVNfU0laRSksXG4gICAgICAgIGlzQ3JpdGljYWw6IGZhbHNlLFxuICAgICAgfTtcbiAgICBjYXNlIFRzVHhUeXBlLlNlY29uZExpbWl0RW5kOlxuICAgICAgY29uc3Qgb3V0X3NsZW5kID0gZXRoZXJzLnV0aWxzLnNvbGlkaXR5UGFjayhbJ3VpbnQ4J10sIFtCaWdOdW1iZXIuZnJvbSh0eFRyYW5zZmVyUmVxLnJlcVR5cGUpXSkucmVwbGFjZUFsbCgnMHgnLCAnJyk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByX2NodW5rczogQnVmZmVyLmNvbmNhdChbQnVmZmVyLmZyb20ob3V0X3NsZW5kLCAnaGV4JyldLCBNQVhfQ0hVTktTX0JZVEVTX1BFUl9SRVEpLFxuICAgICAgICBvX2NodW5rczogQnVmZmVyLmNvbmNhdChbQnVmZmVyLmZyb20ob3V0X3NsZW5kLCAnaGV4JyldLCAxICogQ0hVTktfQllURVNfU0laRSksXG4gICAgICAgIGlzQ3JpdGljYWw6IGZhbHNlLFxuICAgICAgfTtcbiAgICBjYXNlIFRzVHhUeXBlLk5PT1A6XG4gICAgY2FzZSBUc1R4VHlwZS5VTktOT1dOOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcl9jaHVua3M6IEJ1ZmZlci5hbGxvYyhNQVhfQ0hVTktTX0JZVEVTX1BFUl9SRVEpLFxuICAgICAgICBvX2NodW5rczogQnVmZmVyLmNvbmNhdChbQnVmZmVyLmZyb20oJzAwJywgJ2hleCcpXSwgMSAqIENIVU5LX0JZVEVTX1NJWkUpLFxuICAgICAgICBpc0NyaXRpY2FsOiBmYWxzZSxcbiAgICAgIH07XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcigndW5rbm93biByZXFUeXBlJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcGFkSGV4QnlCeXRlcyhoZXg6IHN0cmluZywgYnl0ZXM6IG51bWJlcik6IHN0cmluZyB7XG4gIC8vIGhleCA9IGhleC5zbGljZSgyKTtcbiAgaWYgKGhleC5sZW5ndGggJSAyICE9PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ2hleCBzaG91bGQgYmUgZXZlbiBsZW5ndGgnKTtcbiAgaWYgKGhleC5sZW5ndGggLyAyID4gYnl0ZXMpIHRocm93IG5ldyBFcnJvcignaGV4IHNob3VsZCBiZSBsZXNzIHRoYW4gYnl0ZXMnKTtcbiAgY29uc3QgcGFkZGluZyA9ICcwJy5yZXBlYXQoYnl0ZXMgKiAyIC0gaGV4Lmxlbmd0aCk7XG4gIHJldHVybiBwYWRkaW5nICsgaGV4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9IZXhTdHJpbmcodmFsdWU6IHN0cmluZyB8IGJpZ2ludCB8IG51bWJlciB8IEJ1ZmZlciB8IFVpbnQ4QXJyYXkpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAoL14weC8udGVzdCh2YWx1ZSkpIHJldHVybiB2YWx1ZTtcbiAgICByZXR1cm4gQmlnSW50KHZhbHVlKS50b1N0cmluZygxNik7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoMTYpO1xuICB9XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnKSB7XG4gICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKDE2KTtcbiAgfVxuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoJ2hleCcpO1xuICB9XG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICByZXR1cm4gQnVmZmVyLmZyb20odmFsdWUpLnRvU3RyaW5nKCdoZXgnKTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ3ZhbHVlIHNob3VsZCBiZSBzdHJpbmcsIG51bWJlciwgYmlnaW50LCBCdWZmZXIgb3IgVWludDhBcnJheScpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFkQW5kVG9CdWZmZXIodmFsdWU6IHN0cmluZywgYnl0ZXM6IG51bWJlcik6IEJ1ZmZlciB7XG4gIGNvbnN0IGhleFN0cmluZyA9IHRvSGV4U3RyaW5nKHZhbHVlKTtcbiAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmZyb20oL14weC8udGVzdChoZXhTdHJpbmcpID8gaGV4U3RyaW5nLnNsaWNlKDIpIDogaGV4U3RyaW5nLCAnaGV4Jyk7XG4gIHJldHVybiBCdWZmZXIuY29uY2F0KFtidWZmZXJdLCBieXRlcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b0JpZ0ludENodW5rQXJyYXkoZGF0YTogQnVmZmVyLCBjaHVua0J5dGVzU2l6ZTogbnVtYmVyKTogYmlnaW50W10ge1xuICBjb25zdCByZXN1bHQ6IGJpZ2ludFtdID0gW107XG4gIGNvbnN0IHVpbnQ4YXJyID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdWludDhhcnIubGVuZ3RoOyBpICs9IGNodW5rQnl0ZXNTaXplKSB7XG4gICAgY29uc3QgY2h1bmsgPSB1aW50OGFyci5zbGljZShpLCBpICsgY2h1bmtCeXRlc1NpemUpO1xuICAgIHJlc3VsdC5wdXNoKEJpZ0ludCgnMHgnICsgQnVmZmVyLmZyb20oY2h1bmspLnRvU3RyaW5nKCdoZXgnKSkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaWdpbnRfdG9fY2h1bmtfYXJyYXlWMih4OiBCdWZmZXIsIGNodW5rQnl0ZXM6IG51bWJlcik6IGJpZ2ludFtdIHtcbiAgY29uc3QgcmV0OiBiaWdpbnRbXSA9IFtdO1xuICBmb3IgKGxldCBpID0geC5sZW5ndGggLSAxOyBpID49IDA7IGkgLT0gY2h1bmtCeXRlcykge1xuICAgIGxldCB2YWwgPSAwbjtcbiAgICBmb3IgKGxldCBvZmZzZXQgPSAwOyBvZmZzZXQgPCBjaHVua0J5dGVzOyBvZmZzZXQrKykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHhbaSAtIG9mZnNldF07XG4gICAgICB2YWwgKz0gQmlnSW50KGVsZW1lbnQpIDw8IEJpZ0ludChvZmZzZXQgKiA4KTtcbiAgICB9XG4gICAgcmV0LnB1c2godmFsKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGJpZ2ludF90b19jaHVua19hcnJheSh4OiBiaWdpbnQsIGNodW5rQml0czogYmlnaW50KTogYmlnaW50W10ge1xuICBjb25zdCBtb2QgPSAybiAqKiBCaWdJbnQoY2h1bmtCaXRzKTtcblxuICBjb25zdCByZXQ6IGJpZ2ludFtdID0gW107XG4gIGxldCB4X3RlbXA6IGJpZ2ludCA9IHg7XG4gIHdoaWxlICh4X3RlbXAgPiAwbikge1xuICAgIHJldC5wdXNoKHhfdGVtcCAlIG1vZCk7XG4gICAgeF90ZW1wID0geF90ZW1wID4+IGNodW5rQml0cztcbiAgfVxuICByZXR1cm4gcmV0LnJldmVyc2UoKTtcbn1cbi8vIDEyMzQ1IDY3ODlhYmNkZWZcbi8vID0+IFs2Nzg5YWJjZGVmLCAxMjM0NV1cbiIsImltcG9ydCB7IENIVU5LX0JZVEVTX1NJWkUgfSBmcm9tICcuL3RzLXR5cGVzL3RzLXR5cGVzJztcblxuZXhwb3J0IGNvbnN0IGJpZ0ludE1heCA9IChhcnI6IGJpZ2ludFtdKSA9PiB7XG4gIHJldHVybiBhcnIucmVkdWNlKChtYXgsIGUpID0+IHtcbiAgICByZXR1cm4gZSA+IG1heCA/IGUgOiBtYXg7XG4gIH0sIGFyclswXSk7XG59O1xuXG5leHBvcnQgY29uc3QgYmlnSW50TWluID0gKGFycjogYmlnaW50W10pID0+IHtcbiAgcmV0dXJuIGFyci5yZWR1Y2UoKG1pbiwgZSkgPT4ge1xuICAgIHJldHVybiBlID4gbWluID8gZSA6IG1pbjtcbiAgfSwgYXJyWzBdKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBhbW91bnRUb1R4QW1vdW50VjIobnVtYmVyOiBiaWdpbnQpOiBiaWdpbnQge1xuICAvLyA0OGJpdFxuICBjb25zdCBzaWduID0gKG51bWJlciA+PiAxMjduKSA8PCA0N247XG4gIGNvbnN0IGZyYWN0aW9uID0gbnVtYmVyIC0gc2lnbjtcbiAgY29uc3QgZnJhY3Rpb25MZW5ndGggPSBCaWdJbnQoZnJhY3Rpb24udG9TdHJpbmcoMikubGVuZ3RoKTtcbiAgY29uc3QgYmlhcyA9ICgxbiA8PCA1bikgLSAxbjtcbiAgY29uc3QgZXhwID0gZnJhY3Rpb25MZW5ndGggLSAyOG4gKyBiaWFzO1xuICBjb25zdCBtb2ROdW1iZXIgPSBmcmFjdGlvbkxlbmd0aCA+IDBuID8gMW4gPDwgKGZyYWN0aW9uTGVuZ3RoIC0gMW4pIDogMW47XG5cbiAgY29uc3QgbW9kaWZpZWRGcmFjdGlvbiA9IGZyYWN0aW9uICUgbW9kTnVtYmVyO1xuICBjb25zdCBtb2RpZmllZEZyYWN0aW9uTGVuZ3RoID0gZnJhY3Rpb25MZW5ndGggPiAwbiA/IGZyYWN0aW9uTGVuZ3RoIC0gMW4gOiAwbjtcbiAgY29uc3QgZmluYWxGcmFjdGlvbiA9XG4gICAgbW9kaWZpZWRGcmFjdGlvbkxlbmd0aCA8IDQxbiA/IG1vZGlmaWVkRnJhY3Rpb24gPDwgKDQxbiAtIG1vZGlmaWVkRnJhY3Rpb25MZW5ndGgpIDogbW9kaWZpZWRGcmFjdGlvbiA+PiAobW9kaWZpZWRGcmFjdGlvbkxlbmd0aCAtIDQxbik7XG4gIGNvbnN0IHJldFZhbCA9IHNpZ24gKyAoZXhwIDw8IDQxbikgKyBmaW5hbEZyYWN0aW9uO1xuICByZXR1cm4gcmV0VmFsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW1vdW50VG9UeEFtb3VudFYzXzQwYml0KG51bWJlcjogYmlnaW50KTogYmlnaW50IHtcbiAgbGV0IHZhbF9leHAgPSAwbjtcbiAgaWYgKG51bWJlciA9PT0gMG4pIHtcbiAgICByZXR1cm4gMG47XG4gIH1cbiAgd2hpbGUgKG51bWJlciAlIDEwbiA9PT0gMG4pIHtcbiAgICBudW1iZXIgLz0gMTBuO1xuICAgIHZhbF9leHAgKz0gMW47XG4gIH1cbiAgcmV0dXJuIG51bWJlciArICh2YWxfZXhwIDw8IDM1bik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcnJheUNodW5rVG9IZXhTdHJpbmcoYXJyOiBzdHJpbmdbXSwgY2h1bmtTaXplOiBudW1iZXIgPSBDSFVOS19CWVRFU19TSVpFKSB7XG4gIGNvbnN0IGhleCA9IGFyclxuICAgIC5tYXAoKGUpID0+IHtcbiAgICAgIHJldHVybiBCaWdJbnQoZSlcbiAgICAgICAgLnRvU3RyaW5nKDE2KVxuICAgICAgICAucGFkU3RhcnQoY2h1bmtTaXplICogMiwgJzAnKTtcbiAgICB9KVxuICAgIC5qb2luKCcnKTtcblxuICByZXR1cm4gJzB4JyArIGhleDtcbn1cblxuLy8gZnVuY3Rpb24gdG9IZXgobjogc3RyaW5nKSB7XG4vLyAgIGNvbnN0IG51bSA9IEJpZ0ludChuKTtcbi8vICAgY29uc3QgcmF3SGV4ID0gbnVtLnRvU3RyaW5nKDE2KTtcbi8vICAgcmV0dXJuICcweCcgKyAocmF3SGV4Lmxlbmd0aCAlIDIgPT09IDAgPyByYXdIZXggOiAnMCcgKyByYXdIZXgpO1xuLy8gfVxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYXNzZXJ0XCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAbmVzdGpzL3NjaGVkdWxlXCIpOzsiLCJpbXBvcnQgeyBDbHVzdGVyTWVzc2FnZUV2ZW50UGF5bG9hZCB9IGZyb20gJ0B0cy1zZGsvZG9tYWluL2V2ZW50cy9jbHVzdGVyJztcbmltcG9ydCB7IFRzUHJvdmVyTW9kdWxlIH0gZnJvbSAnLi90cy1wcm92ZXIubW9kdWxlJztcbmltcG9ydCB7IHNldHVwQXBwIH0gZnJvbSAnQHRzLXNkay9zZXR1cC5oZWxwZXInO1xuaW1wb3J0IHsgUGlub0xvZ2dlclNlcnZpY2UgfSBmcm9tICdAY29tbW9uL2xvZ2dlci9hZGFwdGVycy9yZWFsL3Bpbm9Mb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBUc1dvcmtlck5hbWUgfSBmcm9tICdAdHMtc2RrL2NvbnN0YW50JztcblxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYm9vdHN0cmFwKCkge1xuICBjb25zdCBhcHAgPSBhd2FpdCBzZXR1cEFwcChUc1Byb3Zlck1vZHVsZSk7XG4gIGNvbnN0IGxvZ2dlciA9IGFwcC5nZXQoUGlub0xvZ2dlclNlcnZpY2UpO1xuICBsb2dnZXIuc2V0Q29udGV4dChUc1dvcmtlck5hbWUuUFJPVkVSKTtcblxuICByZXR1cm4gYXBwO1xufSIsImltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgTW9kdWxlLCBPbk1vZHVsZUluaXQgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBMb2dnZXJNb2R1bGUgfSBmcm9tICdAY29tbW9uL2xvZ2dlci9sb2dnZXIubW9kdWxlJztcbmltcG9ydCB7IENvbmZpZ01vZHVsZSB9IGZyb20gJ0BuZXN0anMvY29uZmlnJztcbmltcG9ydCB7IFRzV29ya2VyTmFtZSB9IGZyb20gJ0B0cy1zZGsvY29uc3RhbnQnO1xuaW1wb3J0IHsgQnVsbFF1ZXVlTW9kdWxlIH0gZnJvbSAnY29tbW9uL2J1bGwtcXVldWUvc3JjL0J1bGxRdWV1ZS5tb2R1bGUnO1xuaW1wb3J0IHsgUHJvdmVyQ29uc3VtZXIgfSBmcm9tICcuL2luZnJhc3RydWN0dXJlL3Byb3Zlci5wcm9jZXNzb3InO1xuaW1wb3J0IHsgQnVsbE1vZHVsZSB9IGZyb20gJ0BhbmNoYW44MjgvbmVzdC1idWxsbXEnO1xuaW1wb3J0IHsgVHlwZU9ybU1vZHVsZSB9IGZyb20gJ0BuZXN0anMvdHlwZW9ybSc7XG5pbXBvcnQgeyBCbG9ja0luZm9ybWF0aW9uIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvYmxvY2tJbmZvcm1hdGlvbi5lbnRpdHknO1xuaW1wb3J0IHsgVHJhbnNhY3Rpb25JbmZvIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvdHJhbnNhY3Rpb25JbmZvLmVudGl0eSc7XG5pbXBvcnQgeyBUc1R5cGVPcm1Nb2R1bGUgfSBmcm9tICdjb21tb24vdHMtdHlwZW9ybS9zcmMvdHN0eXBlb3JtLm1vZHVsZSc7XG5pbXBvcnQgeyBXb3JrZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9jbHVzdGVyL3dvcmtlci5zZXJ2aWNlJztcbmltcG9ydCB7IFdvcmtlck1vZHVsZSB9IGZyb20gJy4uLy4uL2NvbW1vbi9jbHVzdGVyL3NyYy9jbHVzdGVyLm1vZHVsZSc7XG5cbkBNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgQ29uZmlnTW9kdWxlLFxuICAgIExvZ2dlck1vZHVsZSxcbiAgICBCdWxsUXVldWVNb2R1bGUsXG4gICAgQnVsbE1vZHVsZS5yZWdpc3RlclF1ZXVlKFRzV29ya2VyTmFtZS5QUk9WRVIpLFxuICAgIFRzVHlwZU9ybU1vZHVsZSxcbiAgICBUeXBlT3JtTW9kdWxlLmZvckZlYXR1cmUoXG4gICAgICBbXG4gICAgICAgIFRyYW5zYWN0aW9uSW5mbyxcbiAgICAgICAgQmxvY2tJbmZvcm1hdGlvbixcbiAgICAgIF0pLFxuICAgIFdvcmtlck1vZHVsZSxcbiAgXSxcbiAgY29udHJvbGxlcnM6IFtdLFxuICBwcm92aWRlcnM6IFtcbiAgICBQcm92ZXJDb25zdW1lcixcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgVHNQcm92ZXJNb2R1bGUgaW1wbGVtZW50cyBPbk1vZHVsZUluaXQge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlcjogUGlub0xvZ2dlclNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSB3b3JrZXJTZXJ2aWNlOiBXb3JrZXJTZXJ2aWNlLFxuICApIHsgfVxuXG4gIG9uTW9kdWxlSW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLndvcmtlclNlcnZpY2UucmVhZHkoKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgVHNXb3JrZXJOYW1lIH0gZnJvbSAnQHRzLXNkay9jb25zdGFudCc7XG5pbXBvcnQgeyBQaW5vTG9nZ2VyU2VydmljZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2FkYXB0ZXJzL3JlYWwvcGlub0xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IHByb3ZlIH0gZnJvbSAnQHRzLXByb3Zlci9kb21haW4vcHJvdmVyLWNvcmUnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgQ29uZmlnU2VydmljZSB9IGZyb20gJ0BuZXN0anMvY29uZmlnJztcbmltcG9ydCB7IEluamVjdFJlcG9zaXRvcnkgfSBmcm9tICdAbmVzdGpzL3R5cGVvcm0nO1xuaW1wb3J0IHsgQmxvY2tJbmZvcm1hdGlvbiB9IGZyb20gJ2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L2Jsb2NrSW5mb3JtYXRpb24uZW50aXR5JztcbmltcG9ydCB7IFJlcG9zaXRvcnkgfSBmcm9tICd0eXBlb3JtJztcbi8vIGltcG9ydCB7IFRTX1NUQVRVUyB9IGZyb20gJy4uLy4uLy4uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L3RzU3RhdHVzLmVudW0nO1xuaW1wb3J0IHsgQnVsbFdvcmtlciwgQnVsbFdvcmtlclByb2Nlc3MgfSBmcm9tICdAYW5jaGFuODI4L25lc3QtYnVsbG1xJztcbmltcG9ydCB7IEpvYiB9IGZyb20gJ2J1bGxtcSc7XG5pbXBvcnQgeyBCTE9DS19TVEFUVVMgfSBmcm9tICdAY29tbW9uL3RzLXR5cGVvcm0vYWNjb3VudC9ibG9ja1N0YXR1cy5lbnVtJztcbkBCdWxsV29ya2VyKHtxdWV1ZU5hbWU6IFRzV29ya2VyTmFtZS5QUk9WRVJ9KVxuZXhwb3J0IGNsYXNzIFByb3ZlckNvbnN1bWVyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBjb25maWc6IENvbmZpZ1NlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSBsb2dnZXI6IFBpbm9Mb2dnZXJTZXJ2aWNlLFxuICAgIEBJbmplY3RSZXBvc2l0b3J5KEJsb2NrSW5mb3JtYXRpb24pXG4gICAgcHJpdmF0ZSBibG9ja1JlcG9zaXRvcnk6IFJlcG9zaXRvcnk8QmxvY2tJbmZvcm1hdGlvbj4sXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1lbXB0eS1mdW5jdGlvblxuICApIHsgfVxuXG4gIFxuICBnZXRDaXJjdWl0SW5wdXRQYXRoKG5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBwYXRoLnJlc29sdmUodGhpcy5jb25maWcuZ2V0KCdDSVJDVUlUX0lOUFVUX1BBVEhfQkFTRScsICcnKSwgYC4vJHtuYW1lfS1pbnB1dC5qc29uYCk7XG4gIH1cblxuICBAQnVsbFdvcmtlclByb2Nlc3MoKVxuICBhc3luYyBwcm9jZXNzKGpvYjogSm9iPEJsb2NrSW5mb3JtYXRpb24+KSB7XG4gICAgdGhpcy5sb2dnZXIubG9nKGBQcm92ZXJDb25zdW1lci5wcm9jZXNzICR7am9iLmRhdGEuYmxvY2tOdW1iZXJ9YCk7XG5cbiAgICAvLyBjb25zdCB7IGNpcmN1aXRJbnB1dCB9ID0gam9iLmRhdGE7XG4gICAgY29uc3QgaW5wdXROYW1lID0gam9iLmRhdGEuYmxvY2tOdW1iZXIudG9TdHJpbmcoKTtcbiAgICBjb25zdCBpbnB1dFBhdGggPSB0aGlzLmdldENpcmN1aXRJbnB1dFBhdGgoaW5wdXROYW1lKTtcbiAgICAvLyBmcy53cml0ZUZpbGVTeW5jKGlucHV0UGF0aCwgSlNPTi5zdHJpbmdpZnkoY2lyY3VpdElucHV0KSk7XG5cbiAgICBjb25zdCB7IHByb29mUGF0aCwgcHVibGljUGF0aCB9ID0gYXdhaXQgcHJvdmUoaW5wdXROYW1lLCBpbnB1dFBhdGgsICdjaXJjdWl0Jyk7XG4gICAgY29uc3QgcHJvb2YgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwcm9vZlBhdGgsICd1dGY4JykpO1xuICAgIGNvbnN0IHB1YmxpY0lucHV0ID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocHVibGljUGF0aCwgJ3V0ZjgnKSk7XG4gICAgXG4gICAgYXdhaXQgdGhpcy5ibG9ja1JlcG9zaXRvcnkudXBkYXRlKHtcbiAgICAgIGJsb2NrTnVtYmVyOiBqb2IuZGF0YS5ibG9ja051bWJlcixcbiAgICB9LHtcbiAgICAgIGJsb2NrU3RhdHVzOiBCTE9DS19TVEFUVVMuTDJDT05GSVJNRUQsXG4gICAgICBwcm9vZixcbiAgICAgIC8vIHB1YmxpY0lucHV0LFxuICAgIH0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG4iLCJjb25zdCB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuaW1wb3J0IHtyZXNvbHZlfSBmcm9tICdwYXRoJztcblxuY29uc3QgX2V4ZWMgPSB1dGlsLnByb21pc2lmeShyZXF1aXJlKCdjaGlsZF9wcm9jZXNzJykuZXhlYyk7XG5jb25zdCBDSVJDVUlUX0JBU0UgPSBwcm9jZXNzLmVudi5DSVJDVUlUX0JBU0UgfHwgJyc7XG5jb25zdCBSQVBJRFNOQVJLX1BBVEggPSBwcm9jZXNzLmVudi5SQVBJRFNOQVJLX1BBVEggPyByZXNvbHZlKF9fZGlybmFtZSwgcHJvY2Vzcy5lbnYuUkFQSURTTkFSS19QQVRIKSA6ICcnO1xuY29uc3QgQ2lyY29tQnVpbGRCYXNlRGlyID0gcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8nLCBDSVJDVUlUX0JBU0UpO1xuZXhwb3J0IGNvbnN0IEJhdGNoZXNEaXIgPSByZXNvbHZlKF9fZGlybmFtZSwgJy4uLycsIENJUkNVSVRfQkFTRSk7XG5jb25zdCBjbWRMb2dzOiBzdHJpbmdbXSA9IFtdO1xuY29uc3QgREVCVUcgPSB0cnVlO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvdmUoaW5wdXROYW1lOiBzdHJpbmcsIGlucHV0UGF0aDogc3RyaW5nLCBjaXJjdWl0TmFtZTogc3RyaW5nKSB7XG4gIGNvbnNvbGUudGltZShgcHJvdmUgJHtpbnB1dFBhdGh9YCk7XG4gIGNvbnN0IHsgd2l0bmVzc1BhdGggfSA9IGF3YWl0IGdlbmVyYXRlV2l0bmVzcyhpbnB1dE5hbWUsIGlucHV0UGF0aCwgY2lyY3VpdE5hbWUpO1xuICBjb25zdCB7XG4gICAgcHJvb2ZQYXRoLFxuICAgIHB1YmxpY1BhdGgsXG4gIH0gPSBhd2FpdCBnZW5lcmF0ZVByb29mKGlucHV0TmFtZSwgd2l0bmVzc1BhdGgsIGNpcmN1aXROYW1lKTtcbiAgY29uc29sZS50aW1lRW5kKGBwcm92ZSAke2lucHV0UGF0aH1gKTtcbiAgcmV0dXJuIHtcbiAgICB3aXRuZXNzUGF0aCxcbiAgICBwcm9vZlBhdGgsXG4gICAgcHVibGljUGF0aCxcbiAgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlUHJvb2YoaW5wdXROYW1lOiBzdHJpbmcsIHdpdG5lc3NQYXRoOiBzdHJpbmcsIGNpcmN1aXROYW1lOiBzdHJpbmcpIHtcbiAgY29uc3QgYmFzZUZvbGRlclBhdGggPSByZXNvbHZlKF9fZGlybmFtZSwgYCR7Q2lyY29tQnVpbGRCYXNlRGlyfS8ke2NpcmN1aXROYW1lfWApO1xuXG4gIGNvbnN0IHByb29mUGF0aCA9IHJlc29sdmUoX19kaXJuYW1lLCBgJHtCYXRjaGVzRGlyfS8ke2lucHV0TmFtZX0tcHJvb2YuanNvbmApO1xuICBjb25zdCBwdWJsaWNQYXRoID0gcmVzb2x2ZShfX2Rpcm5hbWUsIGAke0JhdGNoZXNEaXJ9LyR7aW5wdXROYW1lfS1wdWJsaWMuanNvbmApO1xuICBjb25zdCBwcm92ZUNtZCA9IFJBUElEU05BUktfUEFUSCA/IGAke1JBUElEU05BUktfUEFUSH1gIDogJ25weCBzbmFya2pzIGdyb3RoMTYgcHJvdmUnO1xuICBjb25zdCB7IHN0ZG91dCwgfSA9IGF3YWl0IGV4ZWMoYCR7cHJvdmVDbWR9ICR7YmFzZUZvbGRlclBhdGh9LyR7Y2lyY3VpdE5hbWV9LnprZXkgJHt3aXRuZXNzUGF0aH0gJHtwcm9vZlBhdGh9ICR7cHVibGljUGF0aH1gKTtcblxuICByZXR1cm4ge1xuICAgIHN0ZG91dCxcbiAgICBwcm9vZlBhdGgsXG4gICAgcHVibGljUGF0aCxcbiAgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlV2l0bmVzcyhpbnB1dE5hbWU6IHN0cmluZywgaW5wdXRQYXRoOiBzdHJpbmcsIGNpcmN1aXROYW1lOiBzdHJpbmcpIHtcbiAgY29uc3QgYnVpbGREaXIgPSByZXNvbHZlKF9fZGlybmFtZSwgYCR7Q2lyY29tQnVpbGRCYXNlRGlyfS8ke2NpcmN1aXROYW1lfWApO1xuICBjb25zdCB3aXRuZXNzUGF0aCA9IHJlc29sdmUoX19kaXJuYW1lLCBgJHtCYXRjaGVzRGlyfS8ke2lucHV0TmFtZX0td2l0bmVzcy53dG5zYCk7XG4gIGNvbnN0IHsgc3Rkb3V0LCB9ID0gYXdhaXQgZXhlYyhgbm9kZSAke2J1aWxkRGlyfS8ke2NpcmN1aXROYW1lfV9qcy9nZW5lcmF0ZV93aXRuZXNzLmpzICR7YnVpbGREaXJ9LyR7Y2lyY3VpdE5hbWV9X2pzLyR7Y2lyY3VpdE5hbWV9Lndhc20gJHtpbnB1dFBhdGh9ICR7d2l0bmVzc1BhdGh9YCk7XG5cbiAgcmV0dXJuIHtcbiAgICBzdGRvdXQsXG4gICAgY2lyY3VpdE5hbWUsXG4gICAgd2l0bmVzc1BhdGgsXG4gIH07XG59XG5cblxuZnVuY3Rpb24gZXhlYyhjbWQ6IHN0cmluZyk6IFByb21pc2U8e2lkOiBudW1iZXIsIGNtZDogc3RyaW5nLCBzdGRvdXQ6IHN0cmluZ30+IHtcbiAgY21kTG9ncy5wdXNoKGNtZCk7XG4gIGNvbnN0IGlkID0gY21kTG9ncy5sZW5ndGggLSAxO1xuICBjb25zb2xlLmxvZyhgZXhlYyBjb21tYW5kKCR7aWR9KTogJHtjbWR9YCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgX2V4ZWMoY21kKS50aGVuKCh7c3Rkb3V0LCBzdGRlcnJ9OiB7c3Rkb3V0OiBzdHJpbmcsIHN0ZGVycjogc3RyaW5nfSkgPT4ge1xuICAgICAgaWYoc3RkZXJyKSB0aHJvdyBuZXcgRXJyb3Ioc3RkZXJyKTtcbiAgICAgIGlmKERFQlVHKSBjb25zb2xlLmxvZyhzdGRvdXQpO1xuICAgICAgcmV0dXJuIHJlc29sdmUoe2lkLCBjbWQ6IGNtZExvZ3NbaWRdLCBzdGRvdXR9KTtcbiAgICB9KS5jYXRjaCgoc3RkZXJyOiBhbnkpID0+IHtcbiAgICAgIGlmKERFQlVHKSBjb25zb2xlLmVycm9yKHN0ZGVycik7XG4gICAgICByZXR1cm4gcmVqZWN0KHN0ZGVycik7XG4gICAgfSk7XG4gIH0pO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidXRpbFwiKTs7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicGF0aFwiKTs7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY2hpbGRfcHJvY2Vzc1wiKTs7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZnNcIik7OyIsIi8vIE5lc3QgaW1wb3J0c1xuaW1wb3J0IHsgUGlub0xvZ2dlclNlcnZpY2UgfSBmcm9tICdAY29tbW9uL2xvZ2dlci9hZGFwdGVycy9yZWFsL3Bpbm9Mb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBMb2dnZXJNb2R1bGUgfSBmcm9tICdAY29tbW9uL2xvZ2dlci9sb2dnZXIubW9kdWxlJztcbmltcG9ydCB7IE1vZHVsZSwgT25Nb2R1bGVJbml0IH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgQ3Fyc01vZHVsZSB9IGZyb20gJ0BuZXN0anMvY3Fycyc7XG5pbXBvcnQgeyBDb25maWdNb2R1bGUgfSBmcm9tICdAbmVzdGpzL2NvbmZpZyc7XG5pbXBvcnQgeyBUc1dvcmtlck5hbWUgfSBmcm9tICcuLi8uLi90cy1zZGsvc3JjL2NvbnN0YW50JztcbmltcG9ydCB7IFNjaGVkdWxlTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy9zY2hlZHVsZSc7XG5pbXBvcnQgeyBQcm9kdWNlclNlcnZpY2UgfSBmcm9tICcuL3Byb2R1Y2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgQnVsbFF1ZXVlTW9kdWxlIH0gZnJvbSAnY29tbW9uL2J1bGwtcXVldWUvc3JjL0J1bGxRdWV1ZS5tb2R1bGUnO1xuaW1wb3J0IHsgVHNUeXBlT3JtTW9kdWxlIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL3RzdHlwZW9ybS5tb2R1bGUnO1xuaW1wb3J0IHsgVHlwZU9ybU1vZHVsZSB9IGZyb20gJ0BuZXN0anMvdHlwZW9ybSc7XG5pbXBvcnQgeyBCbG9ja0luZm9ybWF0aW9uIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvYmxvY2tJbmZvcm1hdGlvbi5lbnRpdHknO1xuaW1wb3J0IHsgQnVsbE1vZHVsZSB9IGZyb20gJ0BhbmNoYW44MjgvbmVzdC1idWxsbXEnO1xuaW1wb3J0IHsgRGF0YWJhc2VQdWJTdWJNb2R1bGUgfSBmcm9tICdAY29tbW9uL2RiLXB1YnN1Yi9kYi1wdWJzdWIubW9kdWxlJztcbmltcG9ydCB7IFRyYW5zYWN0aW9uSW5mbyB9IGZyb20gJ2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L3RyYW5zYWN0aW9uSW5mby5lbnRpdHknO1xuaW1wb3J0IHsgTWFpblByb2Nlc3NNb2R1bGUgfSBmcm9tICdAY29tbW9uL2NsdXN0ZXIvY2x1c3Rlci5tb2R1bGUnO1xuXG5ATW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbmZpZ01vZHVsZS5mb3JSb290KCksXG4gICAgQ3Fyc01vZHVsZSxcbiAgICBMb2dnZXJNb2R1bGUsXG4gICAgLy8gTm90aWZpY2F0aW9uc01vZHVsZSxcbiAgICBTY2hlZHVsZU1vZHVsZS5mb3JSb290KCksXG4gICAgQnVsbFF1ZXVlTW9kdWxlLFxuICAgIFRzVHlwZU9ybU1vZHVsZSxcbiAgICBUeXBlT3JtTW9kdWxlLmZvckZlYXR1cmUoXG4gICAgICBbXG4gICAgICAgIFRyYW5zYWN0aW9uSW5mbyxcbiAgICAgICAgQmxvY2tJbmZvcm1hdGlvbixcbiAgICAgIF0pLFxuICAgIEJ1bGxNb2R1bGUucmVnaXN0ZXJRdWV1ZShcbiAgICAgIHtcbiAgICAgICAgcXVldWVOYW1lOiBUc1dvcmtlck5hbWUuQ09SRSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHF1ZXVlTmFtZTogVHNXb3JrZXJOYW1lLlNFUVVFTkNFUixcbiAgICAgIH0sIHtcbiAgICAgICAgcXVldWVOYW1lOiBUc1dvcmtlck5hbWUuUFJPVkVSLFxuICAgICAgfSwge1xuICAgICAgICBxdWV1ZU5hbWU6IFRzV29ya2VyTmFtZS5PUEVSQVRPUixcbiAgICAgIH1cbiAgICApLFxuICAgIERhdGFiYXNlUHViU3ViTW9kdWxlLFxuICAgIE1haW5Qcm9jZXNzTW9kdWxlLFxuICBdLFxuICBjb250cm9sbGVyczogW10sXG4gIHByb3ZpZGVyczogW1xuICAgIFByb2R1Y2VyU2VydmljZSxcbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBBcHBNb2R1bGUgaW1wbGVtZW50cyBPbk1vZHVsZUluaXQge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZW1wdHktZnVuY3Rpb25cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBsb2dnZXI6IFBpbm9Mb2dnZXJTZXJ2aWNlKSB7IH1cblxuICBvbk1vZHVsZUluaXQoKTogdm9pZCB7XG4gICAgdGhpcy5sb2dnZXIuc2V0Q29udGV4dChUc1dvcmtlck5hbWUuQ09SRSk7XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIkBuZXN0anMvY3Fyc1wiKTs7IiwiaW1wb3J0IHsgQnVsbFF1ZXVlSW5qZWN0IH0gZnJvbSAnQGFuY2hhbjgyOC9uZXN0LWJ1bGxtcSc7XG5pbXBvcnQgeyBDSEFOTkVMIH0gZnJvbSAnQGNvbW1vbi9kYi1wdWJzdWIvZG9tYWlucy92YWx1ZS1vYmplY3RzL3B1YlN1Yi5jb25zdGFudHMnO1xuaW1wb3J0IHsgTWVzc2FnZUJyb2tlciB9IGZyb20gJ0Bjb21tb24vZGItcHVic3ViL3BvcnRzL21lc3NhZ2VCcm9rZXInO1xuaW1wb3J0IHsgUGlub0xvZ2dlclNlcnZpY2UgfSBmcm9tICdAY29tbW9uL2xvZ2dlci9hZGFwdGVycy9yZWFsL3Bpbm9Mb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBJbmplY3RhYmxlLCBTY29wZSB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IEluamVjdFJlcG9zaXRvcnkgfSBmcm9tICdAbmVzdGpzL3R5cGVvcm0nO1xuaW1wb3J0IHsgQmxvY2tJbmZvcm1hdGlvbiB9IGZyb20gJ2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L2Jsb2NrSW5mb3JtYXRpb24uZW50aXR5JztcbmltcG9ydCB7IFRyYW5zYWN0aW9uSW5mbyB9IGZyb20gJ2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L3RyYW5zYWN0aW9uSW5mby5lbnRpdHknO1xuaW1wb3J0IHsgVFNfU1RBVFVTIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvdHNTdGF0dXMuZW51bSc7XG5pbXBvcnQgeyBNb3JlVGhhbiwgUmVwb3NpdG9yeSB9IGZyb20gJ3R5cGVvcm0nO1xuaW1wb3J0IHsgUXVldWUgfSBmcm9tICdidWxsbXEnO1xuaW1wb3J0IHsgVHNXb3JrZXJOYW1lIH0gZnJvbSAnLi4vLi4vdHMtc2RrL3NyYy9jb25zdGFudCc7XG5pbXBvcnQgeyBCTE9DS19TVEFUVVMgfSBmcm9tICdAY29tbW9uL3RzLXR5cGVvcm0vYWNjb3VudC9ibG9ja1N0YXR1cy5lbnVtJztcbi8vIGltcG9ydCB7IEJ1bGxXb3JrZXIsIEJ1bGxXb3JrZXJQcm9jZXNzIH0gZnJvbSAnQGFuY2hhbjgyOC9uZXN0LWJ1bGxtcSc7XG5pbXBvcnQgeyBDcm9uLCBDcm9uRXhwcmVzc2lvbiB9IGZyb20gJ0BuZXN0anMvc2NoZWR1bGUnO1xuXG5ASW5qZWN0YWJsZSh7XG4gIHNjb3BlOiBTY29wZS5ERUZBVUxULFxufSlcbi8vIEBCdWxsV29ya2VyKHtcbi8vICAgcXVldWVOYW1lOiBUc1dvcmtlck5hbWUuQ09SRSxcbi8vICAgb3B0aW9uczoge1xuLy8gICAgIGNvbmN1cnJlbmN5OiAxLFxuLy8gICB9LFxuLy8gfSlcbmV4cG9ydCBjbGFzcyBQcm9kdWNlclNlcnZpY2Uge1xuICBwcml2YXRlIGN1cnJlbnRQZW5kaW5nVHhJZCA9IDA7XG4gIHByaXZhdGUgY3VycmVudFBlbmRpbmdCbG9jayA9IDA7XG4gIHByaXZhdGUgY3VycmVudFByb3ZlZEJsb2NrID0gMDtcbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgbG9nZ2VyOiBQaW5vTG9nZ2VyU2VydmljZSxcbiAgICBASW5qZWN0UmVwb3NpdG9yeShUcmFuc2FjdGlvbkluZm8pIHByaXZhdGUgdHhSZXBvc2l0b3J5OiBSZXBvc2l0b3J5PFRyYW5zYWN0aW9uSW5mbz4sXG4gICAgQEluamVjdFJlcG9zaXRvcnkoQmxvY2tJbmZvcm1hdGlvbikgcHJpdmF0ZSBibG9ja1JlcG9zaXRvcnk6IFJlcG9zaXRvcnk8QmxvY2tJbmZvcm1hdGlvbj4sXG4gICAgQEJ1bGxRdWV1ZUluamVjdChUc1dvcmtlck5hbWUuU0VRVUVOQ0VSKSBwcml2YXRlIHJlYWRvbmx5IHNlcVF1ZXVlOiBRdWV1ZSxcbiAgICBAQnVsbFF1ZXVlSW5qZWN0KFRzV29ya2VyTmFtZS5PUEVSQVRPUikgcHJpdmF0ZSByZWFkb25seSBvcGVyYXRvclF1ZXVlOiBRdWV1ZSxcbiAgICBAQnVsbFF1ZXVlSW5qZWN0KFRzV29ya2VyTmFtZS5QUk9WRVIpIHByaXZhdGUgcmVhZG9ubHkgcHJvdmVyUXVldWU6IFF1ZXVlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgbWVzc2FnZUJyb2tlclNlcnZpY2U6IE1lc3NhZ2VCcm9rZXIsXG4gICkge1xuICAgIGxvZ2dlci5sb2coJ0Rpc3BhdGNoU2VydmljZScpO1xuICAgIC8vIHRoaXMuc3Vic2NyaWJlKCk7XG5cbiAgfVxuXG4gIC8vIEBCdWxsV29ya2VyUHJvY2Vzcyh7XG4gIC8vICAgYXV0b3J1bjogdHJ1ZSxcbiAgLy8gfSlcbiAgQENyb24oQ3JvbkV4cHJlc3Npb24uRVZFUllfNV9TRUNPTkRTKVxuICBhc3luYyBwcm9jZXNzKCkge1xuICAgIC8vIGNvbnN0IG5hbWUgPSBqb2IubmFtZTtcbiAgICAvLyBpZihuYW1lID09PSAnVHJhbnNhY3Rpb25JbmZvJykge1xuICAgIC8vIH1cbiAgICBhd2FpdCB0aGlzLmRpc3BhdGNoUGVuZGluZ1RyYW5zYWN0aW9uKCk7XG4gIH1cbiAgYXN5bmMgc3Vic2NyaWJlKCkge1xuICAgIGF3YWl0IHRoaXMubWVzc2FnZUJyb2tlclNlcnZpY2UuYWRkQ2hhbm5lbHMoW0NIQU5ORUwuT1JERVJfQ1JFQVRFRCwgQ0hBTk5FTC5PUkRFUl9QUk9DQ0VTU0QsIENIQU5ORUwuT1JERVJfVkVSSUZJRURdKTtcbiAgICB0aGlzLm1lc3NhZ2VCcm9rZXJTZXJ2aWNlLnN1YnNjcmliZShDSEFOTkVMLk9SREVSX0NSRUFURUQsIHRoaXMuZGlzcGF0Y2hQZW5kaW5nVHJhbnNhY3Rpb24uYmluZCh0aGlzKSk7XG4gICAgdGhpcy5tZXNzYWdlQnJva2VyU2VydmljZS5zdWJzY3JpYmUoQ0hBTk5FTC5PUkRFUl9QUk9DQ0VTU0QsIHRoaXMuZGlzcGF0Y2hQZW5pbmdCbG9jay5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLm1lc3NhZ2VCcm9rZXJTZXJ2aWNlLnN1YnNjcmliZShDSEFOTkVMLk9SREVSX1ZFUklGSUVELCB0aGlzLmRpc3BhdGNoUHJvdmVkQmxvY2suYmluZCh0aGlzKSk7XG4gIH1cblxuICB1bnN1YnNjcmliZSgpIHtcbiAgICB0aGlzLm1lc3NhZ2VCcm9rZXJTZXJ2aWNlLmNsb3NlKCk7XG4gIH1cblxuICBwcml2YXRlIHByZXZKb2JJZD86IHN0cmluZztcbiAgYXN5bmMgZGlzcGF0Y2hQZW5kaW5nVHJhbnNhY3Rpb24oKSB7XG4gICAgdGhpcy5sb2dnZXIubG9nKCdkaXNwYXRjaFBlbmRpbmdUcmFuc2FjdGlvbi4uLicpO1xuICAgIGNvbnN0IHRyYW5zYWN0aW9ucyA9IGF3YWl0IHRoaXMudHhSZXBvc2l0b3J5LmZpbmQoe1xuICAgICAgc2VsZWN0OiB7XG4gICAgICAgIHR4SWQ6IHRydWUsXG4gICAgICB9LFxuICAgICAgd2hlcmU6IHtcbiAgICAgICAgdHhJZDogTW9yZVRoYW4odGhpcy5jdXJyZW50UGVuZGluZ1R4SWQpLFxuICAgICAgICB0eFN0YXR1czogVFNfU1RBVFVTLlBFTkRJTkcsXG4gICAgICB9LFxuICAgICAgb3JkZXI6IHtcbiAgICAgICAgdHhJZDogJ2FzYycsXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGlmICh0cmFuc2FjdGlvbnMubGVuZ3RoKSB7XG4gICAgICB0aGlzLmxvZ2dlci5sb2coYGRpc3BhdGNoUGVuZGluZ1RyYW5zYWN0aW9uIGFkZCAke3RyYW5zYWN0aW9ucy5sZW5ndGh9IGJsb2Nrc2ApO1xuICAgICAgdGhpcy5jdXJyZW50UGVuZGluZ1R4SWQgPSB0cmFuc2FjdGlvbnNbdHJhbnNhY3Rpb25zLmxlbmd0aCAtIDFdLnR4SWQ7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdHJhbnNhY3Rpb25zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCB0eCA9IHRyYW5zYWN0aW9uc1tpbmRleF07XG4gICAgICAgIGNvbnN0IGpvYklkID0gYCR7VHNXb3JrZXJOYW1lLlNFUVVFTkNFUn0tJHt0eC50eElkfWA7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHtcbiAgICAgICAgLy8gICBqb2JJZCxcbiAgICAgICAgLy8gICBwcmV2Sm9iSWQ6IHRoaXMucHJldkpvYklkLFxuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gY29uc3Qgam9iYSA9IGF3YWl0IHRoaXMuc2VxUXVldWUuZ2V0Sm9iKGpvYklkKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBqb2IgPSBhd2FpdCB0aGlzLnNlcVF1ZXVlLmFkZCh0eC50eElkLnRvU3RyaW5nKCksIHtcbiAgICAgICAgICAgIGpvYklkLFxuICAgICAgICAgICAgdHhJZDogdHgudHhJZCxcbiAgICAgICAgICAgIC8vIHBhcmVudDogdGhpcy5wcmV2Sm9iSWQgPyB7XG4gICAgICAgICAgICAvLyAgIGlkOiB0aGlzLnByZXZKb2JJZCxcbiAgICAgICAgICAgIC8vICAgcXVldWU6IFRzV29ya2VyTmFtZS5TRVFVRU5DRVIsXG4gICAgICAgICAgICAvLyB9IDogdW5kZWZpbmVkLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIHRoaXMucHJldkpvYklkID0gdGhpcy5zZXFRdWV1ZS50b0tleShqb2IuaWQ/LnRvU3RyaW5nKCkgfHwgJycpO1xuICAgICAgICAgIC8vIHRoaXMubG9nZ2VyLmxvZyhgSk9COiAke2pvYi5pZH1gKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGRpc3BhdGNoUGVuaW5nQmxvY2soKSB7XG4gICAgdGhpcy5sb2dnZXIubG9nKCdkaXNwYXRjaFBlbmluZ0Jsb2NrJyk7XG4gICAgY29uc3QgYmxvY2tzID0gYXdhaXQgdGhpcy5ibG9ja1JlcG9zaXRvcnkuZmluZCh7XG4gICAgICB3aGVyZToge1xuICAgICAgICBibG9ja051bWJlcjogTW9yZVRoYW4odGhpcy5jdXJyZW50UGVuZGluZ0Jsb2NrKSxcbiAgICAgICAgYmxvY2tTdGF0dXM6IEJMT0NLX1NUQVRVUy5QUk9DRVNTSU5HLFxuICAgICAgfSxcbiAgICAgIG9yZGVyOiB7XG4gICAgICAgIGJsb2NrTnVtYmVyOiAnYXNjJyxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgaWYgKGJsb2Nrcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmxvZyhgZGlzcGF0Y2hQZW5pbmdCbG9jayBhZGQgJHtibG9ja3MubGVuZ3RofSBibG9ja3NgKTtcbiAgICAgIHRoaXMuY3VycmVudFBlbmRpbmdCbG9jayA9IGJsb2Nrc1tibG9ja3MubGVuZ3RoIC0gMV0uYmxvY2tOdW1iZXI7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYmxvY2tzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBibG9jayA9IGJsb2Nrc1tpbmRleF07XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWFyZ3VtZW50XG4gICAgICAgIHRoaXMucHJvdmVyUXVldWUuYWRkKGJsb2NrLmJsb2NrTnVtYmVyLnRvU3RyaW5nKCksIGJsb2NrKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyBkaXNwYXRjaFByb3ZlZEJsb2NrKCkge1xuICAgIHRoaXMubG9nZ2VyLmxvZygnZGlzcGF0Y2hQcm92ZWRCbG9jaycpO1xuICAgIGNvbnN0IGJsb2NrcyA9IGF3YWl0IHRoaXMuYmxvY2tSZXBvc2l0b3J5LmZpbmQoe1xuICAgICAgd2hlcmU6IHtcbiAgICAgICAgYmxvY2tOdW1iZXI6IE1vcmVUaGFuKHRoaXMuY3VycmVudFByb3ZlZEJsb2NrKSxcbiAgICAgICAgYmxvY2tTdGF0dXM6IEJMT0NLX1NUQVRVUy5MMkNPTkZJUk1FRCxcbiAgICAgIH0sXG4gICAgICBvcmRlcjoge1xuICAgICAgICBibG9ja051bWJlcjogJ2FzYycsXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGlmIChibG9ja3MubGVuZ3RoKSB7XG4gICAgICB0aGlzLmxvZ2dlci5sb2coYGRpc3BhdGNoUHJvdmVkQmxvY2sgYWRkICR7YmxvY2tzLmxlbmd0aH0gYmxvY2tzYCk7XG4gICAgICB0aGlzLmN1cnJlbnRQcm92ZWRCbG9jayA9IGJsb2Nrc1tibG9ja3MubGVuZ3RoIC0gMV0uYmxvY2tOdW1iZXI7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYmxvY2tzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBibG9jayA9IGJsb2Nrc1tpbmRleF07XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWFyZ3VtZW50XG4gICAgICAgIHRoaXMub3BlcmF0b3JRdWV1ZS5hZGQoYmxvY2suYmxvY2tOdW1iZXIudG9TdHJpbmcoKSwgYmxvY2spO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiZXhwb3J0IGVudW0gQ0hBTk5FTCB7XG4gIE9SREVSX0NSRUFURUQgPSAnT1JERVJfQ1JFQVRFRCcsXG4gIE9SREVSX1ZFUklGSUVEID0gJ09SREVSX1ZFUklGSUVEJyxcbiAgT1JERVJfUFJPQ0NFU1NEID0gJ09SREVSX1BST0NDRVNTRCdcbn1cbmV4cG9ydCBjb25zdCBDSEFOTkVMUzogQ0hBTk5FTFtdID0gW1xuICBDSEFOTkVMLk9SREVSX0NSRUFURUQsIFxuICBDSEFOTkVMLk9SREVSX1ZFUklGSUVELCBcbiAgQ0hBTk5FTC5PUkRFUl9QUk9DQ0VTU0Rcbl07IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCAqIGFzIF9jbHVzdGVyIGZyb20gJ2NsdXN0ZXInO1xuaW1wb3J0IHR5cGUgeyBDbHVzdGVyIH0gZnJvbSAnY2x1c3Rlcic7XG5jb25zdCBjbHVzdGVyID0gX2NsdXN0ZXIgYXMgdW5rbm93biBhcyBDbHVzdGVyO1xuLy8gaW1wb3J0IHsgYm9vdHN0cmFwIGFzIEdhdGV3YXlCb290c3RyYXAgfSBmcm9tICdAdHMtcm9sbHVwLWFwaS9tYWluJztcbmltcG9ydCB7IGJvb3RzdHJhcCBhcyBPcGVyYXRvckJvb3RzdHJhcCB9IGZyb20gJ0B0cy1vcGVyYXRvci9tYWluJztcbmltcG9ydCB7IGJvb3RzdHJhcCBhcyBTZXF1ZW5jZXJCb290c3RyYXAgfSBmcm9tICdAdHMtc2VxdWVuY2VyL21haW4nO1xuaW1wb3J0IHsgYm9vdHN0cmFwIGFzIFByb3ZlckJvb3RzdHJhcCB9IGZyb20gJ0B0cy1wcm92ZXIvbWFpbic7XG5pbXBvcnQgeyBUc1dvcmtlck5hbWUsIFdvcmtlckl0ZW0gfSBmcm9tICdAdHMtc2RrL2NvbnN0YW50JztcbmltcG9ydCB7IEFwcE1vZHVsZSB9IGZyb20gJy4vYXBwLm1vZHVsZSc7XG5pbXBvcnQgeyBOZXN0RmFjdG9yeSB9IGZyb20gJ0BuZXN0anMvY29yZSc7XG5pbXBvcnQgeyBQaW5vTG9nZ2VyU2VydmljZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2FkYXB0ZXJzL3JlYWwvcGlub0xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IGdldFByb2Nlc3NOYW1lLCBnZXRXb3JrZXJOYW1lIH0gZnJvbSAnQHRzLXNkay9oZWxwZXInO1xuaW1wb3J0IHsgTWFpblByb2Nlc3NTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9jbHVzdGVyL21haW4tcHJvY2Vzcy5zZXJ2aWNlJztcblxuY2x1c3Rlcml6ZShbXG4gIC8vIHtcbiAgLy8gICBuYW1lOiBUc1dvcmtlck5hbWUuR0FURVdBWSxcbiAgLy8gICBib290c3RyYXA6IEdhdGV3YXlCb290c3RyYXAsXG4gIC8vIH0sXG4gIHsgXG4gICAgbmFtZTogVHNXb3JrZXJOYW1lLk9QRVJBVE9SLFxuICAgIGJvb3RzdHJhcDogT3BlcmF0b3JCb290c3RyYXAsXG4gIH0sXG4gIHsgXG4gICAgbmFtZTogVHNXb3JrZXJOYW1lLlNFUVVFTkNFUixcbiAgICBib290c3RyYXA6IFNlcXVlbmNlckJvb3RzdHJhcCxcbiAgfSxcbiAgeyBcbiAgICBuYW1lOiBUc1dvcmtlck5hbWUuUFJPVkVSLFxuICAgIGJvb3RzdHJhcDogUHJvdmVyQm9vdHN0cmFwLFxuICB9LFxuXSk7XG5hc3luYyBmdW5jdGlvbiBjbHVzdGVyaXplKHdvcmtlcnM6IFdvcmtlckl0ZW1bXSkge1xuICBpZihjbHVzdGVyLmlzUHJpbWFyeSl7XG4gICAgYXdhaXQgc2V0dXBNYXN0ZXJBcHAoQXBwTW9kdWxlLCB3b3JrZXJzKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCB3b3JrZXJOYW1lID0gZ2V0V29ya2VyTmFtZSgpO1xuICAgIGNvbnN0IHdvcmtlciA9IHdvcmtlcnMuZmluZCgoaXRlbSkgPT4gaXRlbS5uYW1lID09PSB3b3JrZXJOYW1lKTtcbiAgICBpZih3b3JrZXIpIHtcbiAgICAgIGF3YWl0IHdvcmtlci5ib290c3RyYXAoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBXb3JrZXIgJHt3b3JrZXJOYW1lfSBub3QgZm91bmRgKTtcbiAgICB9XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gc2V0dXBNYXN0ZXJBcHAobW9kdWxlOiB1bmtub3duLCB3b3JrZXJzOiBXb3JrZXJJdGVtW10pIHtcbiAgY29uc3QgYXBwID0gYXdhaXQgTmVzdEZhY3RvcnkuY3JlYXRlQXBwbGljYXRpb25Db250ZXh0KG1vZHVsZSk7XG4gIGNvbnN0IGxvZ2dlciA9IGFwcC5nZXQoUGlub0xvZ2dlclNlcnZpY2UpO1xuICBsb2dnZXIuc2V0Q29udGV4dChnZXRXb3JrZXJOYW1lKCkpO1xuICBjb25zdCBjbHVzdGVyU2VydmljZSA9IGFwcC5nZXQoTWFpblByb2Nlc3NTZXJ2aWNlKTtcbiAgY2x1c3RlclNlcnZpY2UuY2x1c3Rlcml6ZSh3b3JrZXJzKTtcbiAgbG9nZ2VyLnNldENvbnRleHQoZ2V0UHJvY2Vzc05hbWUoKSk7XG5cbiAgbG9nZ2VyLmxvZyhgJHtUc1dvcmtlck5hbWUuQ09SRX06IHNlcnZlciBzdGFydGVkIWApO1xuICByZXR1cm4gYXBwO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==