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
const setup_helper_1 = __webpack_require__(71);
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
const operator_producer_1 = __webpack_require__(63);
const rollupInformation_entity_1 = __webpack_require__(61);
const typeorm_1 = __webpack_require__(21);
const transactionInfo_entity_1 = __webpack_require__(38);
const cluster_module_1 = __webpack_require__(69);
const worker_service_1 = __webpack_require__(64);
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
            nest_bullmq_1.BullModule.registerQueue(constant_1.TsWorkerName.OPERATOR),
            tstypeorm_module_1.TsTypeOrmModule,
            typeorm_1.TypeOrmModule.forFeature([rollupInformation_entity_1.RollupInformation, transactionInfo_entity_1.TransactionInfo]),
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
        ],
        controllers: [],
        providers: [operator_processor_1.OperatorConsumer, operator_producer_1.OperatorProducer],
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
                            host: configService.get('BULL_QUEUE_REDIS_HOST'),
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
const auctionOrder_module_1 = __webpack_require__(55);
const rollup_module_1 = __webpack_require__(60);
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
const obsOrderTree_service_1 = __webpack_require__(23);
const accountInformation_entity_1 = __webpack_require__(31);
const accountLeafNode_entity_1 = __webpack_require__(34);
const accountMerkleTreeNode_entity_1 = __webpack_require__(33);
const blockInformation_entity_1 = __webpack_require__(41);
const merkleTree_controller_1 = __webpack_require__(45);
const tokenLeafNode_entity_1 = __webpack_require__(36);
const tokenMerkleTreeNode_entity_1 = __webpack_require__(35);
const transactionInfo_entity_1 = __webpack_require__(38);
const tsAccountTree_service_1 = __webpack_require__(51);
const tsTokenTree_service_1 = __webpack_require__(52);
let AccountModule = class AccountModule {
};
AccountModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
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
        providers: [tsAccountTree_service_1.TsAccountTreeService, tsTokenTree_service_1.TsTokenTreeService, obsOrderTree_service_1.ObsOrderTreeService],
        controllers: [merkleTree_controller_1.MerkleTreeController],
        exports: [typeorm_1.TypeOrmModule]
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
const ts_helper_1 = __webpack_require__(25);
const tsMerkleTree_1 = __webpack_require__(28);
const obsOrderLeaf_entity_1 = __webpack_require__(29);
const obsOrderLeafMerkleTreeNode_entity_1 = __webpack_require__(44);
let ObsOrderTreeService = ObsOrderTreeService_1 = class ObsOrderTreeService extends tsMerkleTree_1.TsMerkleTree {
    obsOrderLeafRepository;
    obsOrderMerkleTreeRepository;
    connection;
    configService;
    logger = new common_1.Logger(ObsOrderTreeService_1.name);
    constructor(obsOrderLeafRepository, obsOrderMerkleTreeRepository, connection, configService) {
        console.time('init order tree');
        super(configService.get('ORDER_TREE_HEIGHT', 32), ts_helper_1.tsHashFunc);
        this.obsOrderLeafRepository = obsOrderLeafRepository;
        this.obsOrderMerkleTreeRepository = obsOrderMerkleTreeRepository;
        this.connection = connection;
        this.configService = configService;
        console.timeEnd('init order tree');
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
                    BigInt(value.txId),
                    BigInt(value.reqType),
                    BigInt(value.sender),
                    BigInt(value.sellTokenId),
                    BigInt(value.sellAmt),
                    BigInt(value.nonce),
                    BigInt(value.buyTokenId),
                    BigInt(value.buyAmt),
                    BigInt(value.accumulatedSellAmt),
                    BigInt(value.accumulatedBuyAmt),
                    BigInt(value.orderId)
                ]))
            }, ['id']);
            await manager.upsert(obsOrderLeaf_entity_1.ObsOrderLeafEntity, {
                orderLeafId: BigInt(value.orderLeafId),
                txId: Number(value.txId),
                reqType: Number(value.reqType),
                sender: BigInt(value.sender),
                sellTokenId: BigInt(value.sellTokenId),
                sellAmt: BigInt(value.sellAmt),
                nonce: BigInt(value.nonce),
                buyTokenId: BigInt(value.buyTokenId),
                buyAmt: BigInt(value.buyAmt),
                accumulatedSellAmt: BigInt(value.accumulatedSellAmt),
                accumulatedBuyAmt: BigInt(value.accumulatedBuyAmt),
                orderId: Number(value.orderId)
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
                let r = (id % 2n == 0n) ? [jHashValue, iHashValue] : [iHashValue, jHashValue];
                const hash = this.hashFunc(r);
                const jobs = [];
                if (iValue == null) {
                    jobs.push(manager.upsert(obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode, {
                        id: i.toString(),
                        hash: BigInt(iHashValue)
                    }, ['id']));
                }
                if (jValue == null && j < prf.length) {
                    jobs.push(manager.upsert(obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode, {
                        id: prf[j].toString(),
                        hash: BigInt(jHashValue)
                    }, ['id']));
                }
                const updateRoot = i >> 1n;
                if (updateRoot >= 1n) {
                    jobs.push(manager.upsert(obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode, {
                        id: updateRoot.toString(),
                        hash: BigInt(hash)
                    }, ['id']));
                }
                await Promise.all(jobs);
                j++;
            }
        });
        console.timeEnd('updateLeaf for obsOrder tree');
    }
    async getLeaf(leaf_id, otherPayload) {
        const result = this.obsOrderLeafRepository.findOneBy({
            orderLeafId: leaf_id
        });
        if (result == null) {
            const id = this.getLeafIdInTree(leaf_id);
            const level = Math.floor(Math.log2(Number(id)));
            const hash = this.getDefaultHashByLevel(level);
            await this.connection.transaction(async (manager) => {
                await manager.insert(obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode, {
                    leafId: leaf_id,
                    id: id.toString(),
                    hash: BigInt(hash),
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
            const hash = await this.getDefaultHashByLevel(1);
            await this.obsOrderMerkleTreeRepository.insert({
                id: 1n.toString(),
                hash: BigInt(hash),
            });
            return {
                id: 1n.toString(),
                hash: hash
            };
        }
        return {
            id: result.id,
            hash: result.hash.toString()
        };
    }
    getLeafDefaultVavlue() {
        return (0, ts_helper_1.toTreeLeaf)([
            0n,
            0n,
            0n,
            0n,
            0n,
            0n,
            0n,
            0n,
            0n,
            0n,
            0n,
        ]);
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
/* 24 */
/***/ ((module) => {

module.exports = require("typeorm");;

/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.tsHashFunc = exports.toTreeLeaf = exports.bigint_to_hex = void 0;
const poseiden_hash_dp_1 = __webpack_require__(26);
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
/* 26 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dpPoseidonHash = void 0;
const poseidon_1 = __webpack_require__(27);
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
/* 27 */
/***/ ((module) => {

module.exports = require("@big-whale-labs/poseidon");;

/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsMerkleTree = void 0;
class TsMerkleTree {
    treeHeigt;
    lastLevel;
    levelsDefaultHash;
    hashFunc;
    constructor(treeHeight, hashFunc) {
        this.treeHeigt = Number(treeHeight);
        this.hashFunc = hashFunc;
        this.lastLevel = Number(this.treeHeigt);
        this.setLevelDefaultHash();
    }
    getProofIds(leaf_id) {
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
        this.levelsDefaultHash.set(this.lastLevel, this.getLeafDefaultVavlue());
        for (let level = this.lastLevel - 1; level >= 0; level--) {
            const prevLevelHash = this.levelsDefaultHash.get(level + 1);
            if (prevLevelHash != undefined) {
                this.levelsDefaultHash.set(level, this.hashFunc([prevLevelHash, prevLevelHash]));
            }
        }
    }
    getLeafIdInTree(leafId) {
        return leafId + (1n << BigInt(this.treeHeigt));
    }
    getLastLevel() {
        return this.lastLevel;
    }
    getDefaultHashByLevel(level) {
        const result = this.levelsDefaultHash.get(level);
        return result ? result : '';
    }
}
exports.TsMerkleTree = TsMerkleTree;


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
exports.ObsOrderLeafEntity = void 0;
const typeorm_1 = __webpack_require__(24);
const obsOrder_entity_1 = __webpack_require__(30);
const obsOrderLeafMerkleTreeNode_entity_1 = __webpack_require__(44);
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
    orderId;
    obsOrder;
    merkleTreeNode;
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
], ObsOrderLeafEntity.prototype, "accumulatedBuyAmt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int8',
        name: 'orderId',
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], ObsOrderLeafEntity.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => obsOrder_entity_1.ObsOrderEntity, (obsOrder) => obsOrder.obsOrderLeaf, {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'orderId',
        referencedColumnName: 'id',
    }),
    __metadata("design:type", typeof (_a = typeof obsOrder_entity_1.ObsOrderEntity !== "undefined" && obsOrder_entity_1.ObsOrderEntity) === "function" ? _a : Object)
], ObsOrderLeafEntity.prototype, "obsOrder", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode, (obsOrderLeafMerkleTreeNode) => obsOrderLeafMerkleTreeNode.leaf, {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'orderLeafId',
        referencedColumnName: 'leafId',
    }),
    __metadata("design:type", typeof (_b = typeof obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode !== "undefined" && obsOrderLeafMerkleTreeNode_entity_1.ObsOrderLeafMerkleTreeNode) === "function" ? _b : Object)
], ObsOrderLeafEntity.prototype, "merkleTreeNode", void 0);
ObsOrderLeafEntity = __decorate([
    (0, typeorm_1.Entity)('ObsOrderLeaf', { schema: 'public' })
], ObsOrderLeafEntity);
exports.ObsOrderLeafEntity = ObsOrderLeafEntity;


/***/ }),
/* 30 */
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
exports.ObsOrderEntity = void 0;
const typeorm_1 = __webpack_require__(24);
const accountInformation_entity_1 = __webpack_require__(31);
const matchObsOrder_entity_1 = __webpack_require__(39);
const obsOrderLeaf_entity_1 = __webpack_require__(29);
const tsSide_enum_1 = __webpack_require__(40);
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
    obsOrderLeaf;
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
    __metadata("design:type", BigInt)
], ObsOrderEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'marketPair',
        length: 100,
        nullable: false,
        default: `'ETH/USDC'`,
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
], ObsOrderEntity.prototype, "baseTokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp without time zone',
        name: 'timestamp',
        nullable: false,
        precision: 3,
        default: () => `now()`,
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
    (0, typeorm_1.OneToOne)(() => obsOrderLeaf_entity_1.ObsOrderLeafEntity, (obsOrder) => obsOrder.obsOrder),
    (0, typeorm_1.JoinColumn)({
        name: 'id',
        referencedColumnName: 'orderId'
    }),
    __metadata("design:type", typeof (_c = typeof obsOrderLeaf_entity_1.ObsOrderLeafEntity !== "undefined" && obsOrderLeaf_entity_1.ObsOrderLeafEntity) === "function" ? _c : Object)
], ObsOrderEntity.prototype, "obsOrderLeaf", void 0);
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
    __metadata("design:type", typeof (_d = typeof accountInformation_entity_1.AccountInformation !== "undefined" && accountInformation_entity_1.AccountInformation) === "function" ? _d : Object)
], ObsOrderEntity.prototype, "accountInfo", void 0);
ObsOrderEntity = __decorate([
    (0, typeorm_1.Entity)('ObsOrder', { schema: 'public' })
], ObsOrderEntity);
exports.ObsOrderEntity = ObsOrderEntity;


/***/ }),
/* 31 */
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
exports.AccountInformation = void 0;
const typeorm_1 = __webpack_require__(24);
const obsOrder_entity_1 = __webpack_require__(30);
const baseTimeEntity_1 = __webpack_require__(32);
const accountMerkleTreeNode_entity_1 = __webpack_require__(33);
const role_enum_1 = __webpack_require__(37);
const transactionInfo_entity_1 = __webpack_require__(38);
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
    accountMerkleTreeNode;
    transactionInfos;
    obsOrders;
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
        default: () => "'{}'",
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
        default: "'0'",
    }),
    __metadata("design:type", String)
], AccountInformation.prototype, "tsPubKeyX", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'tsPubKeyY',
        length: '100',
        nullable: false,
        default: "'0'",
    }),
    __metadata("design:type", String)
], AccountInformation.prototype, "tsPubKeyY", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, (accountMerkleTreeNode) => accountMerkleTreeNode.leaf),
    __metadata("design:type", typeof (_c = typeof accountMerkleTreeNode_entity_1.AccountMerkleTreeNode !== "undefined" && accountMerkleTreeNode_entity_1.AccountMerkleTreeNode) === "function" ? _c : Object)
], AccountInformation.prototype, "accountMerkleTreeNode", void 0);
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
/* 32 */
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
/* 33 */
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
exports.AccountMerkleTreeNode = void 0;
const typeorm_1 = __webpack_require__(24);
const accountInformation_entity_1 = __webpack_require__(31);
const accountLeafNode_entity_1 = __webpack_require__(34);
const tokenMerkleTreeNode_entity_1 = __webpack_require__(35);
let AccountMerkleTreeNode = class AccountMerkleTreeNode {
    id;
    hash;
    leafId;
    leaf;
    tokenMerkleTreeNodes;
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
    __metadata("design:type", BigInt)
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
    (0, typeorm_1.OneToOne)(() => accountInformation_entity_1.AccountInformation, (accountInformation) => accountInformation.accountMerkleTreeNode, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)([{ name: 'leafId', referencedColumnName: 'accountId' }]),
    __metadata("design:type", typeof (_a = typeof accountInformation_entity_1.AccountInformation !== "undefined" && accountInformation_entity_1.AccountInformation) === "function" ? _a : Object)
], AccountMerkleTreeNode.prototype, "leaf", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode, (tokenMerkleTreeNode) => tokenMerkleTreeNode.accountRoot),
    __metadata("design:type", Array)
], AccountMerkleTreeNode.prototype, "tokenMerkleTreeNodes", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => accountLeafNode_entity_1.AccountLeafNode, (accountLeafNode) => accountLeafNode.accountMerkleTreeNode),
    __metadata("design:type", typeof (_b = typeof accountLeafNode_entity_1.AccountLeafNode !== "undefined" && accountLeafNode_entity_1.AccountLeafNode) === "function" ? _b : Object)
], AccountMerkleTreeNode.prototype, "accountLeafNode", void 0);
AccountMerkleTreeNode = __decorate([
    (0, typeorm_1.Entity)('AccountMerkleTreeNode', { schema: 'public' })
], AccountMerkleTreeNode);
exports.AccountMerkleTreeNode = AccountMerkleTreeNode;


/***/ }),
/* 34 */
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
const accountMerkleTreeNode_entity_1 = __webpack_require__(33);
let AccountLeafNode = class AccountLeafNode {
    leafId;
    tsAddr;
    nonce;
    tokenRoot;
    accountMerkleTreeNode;
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
/* 35 */
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
exports.TokenMerkleTreeNode = void 0;
const typeorm_1 = __webpack_require__(24);
const accountMerkleTreeNode_entity_1 = __webpack_require__(33);
const tokenLeafNode_entity_1 = __webpack_require__(36);
let TokenMerkleTreeNode = class TokenMerkleTreeNode {
    accountId;
    id;
    hash;
    leafId;
    accountRoot;
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
    __metadata("design:type", BigInt)
], TokenMerkleTreeNode.prototype, "hash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'leafId',
        precision: 86,
        scale: 0,
        nullable: true,
        unique: true,
    }),
    __metadata("design:type", Object)
], TokenMerkleTreeNode.prototype, "leafId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, (accountMerkleTreeNode) => accountMerkleTreeNode.tokenMerkleTreeNodes, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'accountId', referencedColumnName: 'leafId' }),
    __metadata("design:type", typeof (_a = typeof accountMerkleTreeNode_entity_1.AccountMerkleTreeNode !== "undefined" && accountMerkleTreeNode_entity_1.AccountMerkleTreeNode) === "function" ? _a : Object)
], TokenMerkleTreeNode.prototype, "accountRoot", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => tokenLeafNode_entity_1.TokenLeafNode, (tokenLeafNode) => tokenLeafNode.tokenMerkleNode),
    (0, typeorm_1.JoinColumn)([{
            name: 'leafId',
            referencedColumnName: 'leafId'
        }, {
            name: 'accountId',
            referencedColumnName: 'accountId'
        }]),
    __metadata("design:type", typeof (_b = typeof tokenLeafNode_entity_1.TokenLeafNode !== "undefined" && tokenLeafNode_entity_1.TokenLeafNode) === "function" ? _b : Object)
], TokenMerkleTreeNode.prototype, "leaf", void 0);
TokenMerkleTreeNode = __decorate([
    (0, typeorm_1.Entity)('TokenMerkleTreeNode', { schema: 'public' })
], TokenMerkleTreeNode);
exports.TokenMerkleTreeNode = TokenMerkleTreeNode;


/***/ }),
/* 36 */
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
const tokenMerkleTreeNode_entity_1 = __webpack_require__(35);
let TokenLeafNode = class TokenLeafNode {
    leafId;
    accountId;
    availableAmt;
    lockedAmt;
    tokenMerkleNode;
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
    __metadata("design:type", BigInt)
], TokenLeafNode.prototype, "availableAmt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'lockedAmt',
        precision: 86,
        scale: 0,
        default: 0n
    }),
    __metadata("design:type", BigInt)
], TokenLeafNode.prototype, "lockedAmt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode, (tokenMerkleTreeNode) => tokenMerkleTreeNode.leaf, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)([{ name: 'leafId', referencedColumnName: 'leafId' },
        { name: 'accountId', referencedColumnName: 'accountId' }]),
    __metadata("design:type", typeof (_a = typeof tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode !== "undefined" && tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode) === "function" ? _a : Object)
], TokenLeafNode.prototype, "tokenMerkleNode", void 0);
TokenLeafNode = __decorate([
    (0, typeorm_1.Entity)('TokenLeafNode', { schema: 'public' })
], TokenLeafNode);
exports.TokenLeafNode = TokenLeafNode;


/***/ }),
/* 37 */
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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransactionInfo = void 0;
const typeorm_1 = __webpack_require__(24);
const matchObsOrder_entity_1 = __webpack_require__(39);
const baseTimeEntity_1 = __webpack_require__(32);
const accountInformation_entity_1 = __webpack_require__(31);
const blockInformation_entity_1 = __webpack_require__(41);
const tsStatus_enum_1 = __webpack_require__(43);
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
    matchedOrder2;
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
        default: 0
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
        default: `''`,
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
], TransactionInfo.prototype, "arg4", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'tsPubKeyX',
        length: '100',
        nullable: false,
        default: "'0'",
    }),
    __metadata("design:type", String)
], TransactionInfo.prototype, "tsPubKeyX", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        name: 'tsPubKeyY',
        length: '100',
        nullable: false,
        default: "'0'",
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
    __metadata("design:type", BigInt)
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
    __metadata("design:type", BigInt)
], TransactionInfo.prototype, "feeToken", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'json',
        name: 'metadata',
        nullable: false,
        default: () => "'{}'",
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
__decorate([
    (0, typeorm_1.OneToOne)(() => matchObsOrder_entity_1.MatchObsOrderEntity, (matchedObsOrder) => matchedObsOrder.matchedTx2),
    (0, typeorm_1.JoinColumn)({
        name: 'txId',
        referencedColumnName: 'txId2',
    }),
    __metadata("design:type", Object)
], TransactionInfo.prototype, "matchedOrder2", void 0);
TransactionInfo = __decorate([
    (0, typeorm_1.Entity)('TransactionInfo', { schema: 'public' })
], TransactionInfo);
exports.TransactionInfo = TransactionInfo;


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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MatchObsOrderEntity = void 0;
const typeorm_1 = __webpack_require__(24);
const transactionInfo_entity_1 = __webpack_require__(38);
const obsOrder_entity_1 = __webpack_require__(30);
const tsSide_enum_1 = __webpack_require__(40);
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
    matchedTx2;
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
        default: `'ETH/USDC'`,
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
    __metadata("design:type", BigInt)
], MatchObsOrderEntity.prototype, "matchedMQ", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        name: 'matchedBQ',
        precision: 86,
        scale: 0,
        default: 0n
    }),
    __metadata("design:type", BigInt)
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
__decorate([
    (0, typeorm_1.OneToOne)(() => transactionInfo_entity_1.TransactionInfo, (transaction) => transaction.matchedOrder2, {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'txId2',
        referencedColumnName: 'txId'
    }),
    __metadata("design:type", Object)
], MatchObsOrderEntity.prototype, "matchedTx2", void 0);
MatchObsOrderEntity = __decorate([
    (0, typeorm_1.Entity)('MatchObsOrder', { schema: 'public' })
], MatchObsOrderEntity);
exports.MatchObsOrderEntity = MatchObsOrderEntity;


/***/ }),
/* 40 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsSide = void 0;
var TsSide;
(function (TsSide) {
    TsSide["BUY"] = "0";
    TsSide["SELL"] = "1";
})(TsSide = exports.TsSide || (exports.TsSide = {}));


/***/ }),
/* 41 */
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
const baseTimeEntity_1 = __webpack_require__(32);
const blockStatus_enum_1 = __webpack_require__(42);
const transactionInfo_entity_1 = __webpack_require__(38);
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
/* 42 */
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
;


/***/ }),
/* 43 */
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
/* 44 */
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
const obsOrderLeaf_entity_1 = __webpack_require__(29);
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
    __metadata("design:type", BigInt)
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
/* 45 */
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
var MerkleTreeController_1;
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MerkleTreeController = void 0;
const common_1 = __webpack_require__(7);
const marketPairInfo_service_1 = __webpack_require__(46);
const updateAccountTree_dto_1 = __webpack_require__(48);
const updateTokenTree_dto_1 = __webpack_require__(50);
const tsAccountTree_service_1 = __webpack_require__(51);
const tsTokenTree_service_1 = __webpack_require__(52);
const MarketPairInfo_dto_1 = __webpack_require__(53);
const tsSide_enum_1 = __webpack_require__(40);
const obsOrderTree_service_1 = __webpack_require__(23);
const updateObsOrderTree_dto_1 = __webpack_require__(54);
let MerkleTreeController = MerkleTreeController_1 = class MerkleTreeController {
    tsAccountTreeService;
    tsTokenTreeService;
    marketPairInfoService;
    obsOrderTreeService;
    logger = new common_1.Logger(MerkleTreeController_1.name);
    accountLeafId = 100n;
    constructor(tsAccountTreeService, tsTokenTreeService, marketPairInfoService, obsOrderTreeService) {
        this.tsAccountTreeService = tsAccountTreeService;
        this.tsTokenTreeService = tsTokenTreeService;
        this.marketPairInfoService = marketPairInfoService;
        this.obsOrderTreeService = obsOrderTreeService;
        this.tsAccountTreeService.getCurrentLeafIdCount().then((id) => {
            this.accountLeafId = BigInt(id) + 100n;
            console.log(`accountLeafId: ${this.accountLeafId}`);
        });
    }
    async updateAccountTree(updateAccountTreeDto) {
        console.time('controller updateAccountTree');
        await this.tsAccountTreeService.updateLeaf(BigInt(updateAccountTreeDto.leafId), updateAccountTreeDto);
        console.timeEnd('controller updateAccountTree');
    }
    async updateTokenTree(updateTokenTreeDto) {
        console.time('controller updateTokenTree');
        await this.tsTokenTreeService.updateLeaf(BigInt(updateTokenTreeDto.leafId), updateTokenTreeDto);
        console.timeEnd('controller updateTokenTree');
    }
    async updateObsOrderTree(updateObsOrderTreeDto) {
        console.time('controller updateObsOrderTree');
        await this.obsOrderTreeService.updateLeaf(BigInt(updateObsOrderTreeDto.orderLeafId), updateObsOrderTreeDto);
        console.timeEnd('controller updateObsOrderTree');
    }
    async getMarketPairInfo(dto) {
        console.log(dto);
        const pair = [{
                mainTokenId: dto.sellTokenId,
                baseTokenId: dto.buyTokenId,
            }, {
                mainTokenId: dto.buyTokenId,
                baseTokenId: dto.sellTokenId,
            }];
        const marketPairInfo = await this.marketPairInfoService.findOneMarketPairInfo({ pairs: pair });
        const side = marketPairInfo.mainTokenId === dto.buyTokenId ? tsSide_enum_1.TsSide.BUY : tsSide_enum_1.TsSide.SELL;
        return {
            ...marketPairInfo,
            side,
        };
    }
};
__decorate([
    (0, common_1.Post)('updateAccountTree'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof updateAccountTree_dto_1.UpdateAccountTreeDto !== "undefined" && updateAccountTree_dto_1.UpdateAccountTreeDto) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], MerkleTreeController.prototype, "updateAccountTree", null);
__decorate([
    (0, common_1.Post)('updateTokenTree'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof updateTokenTree_dto_1.UpdateTokenTreeDto !== "undefined" && updateTokenTree_dto_1.UpdateTokenTreeDto) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], MerkleTreeController.prototype, "updateTokenTree", null);
__decorate([
    (0, common_1.Post)('updateObsOrderTree'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof updateObsOrderTree_dto_1.UpdateObsOrderTreeDto !== "undefined" && updateObsOrderTree_dto_1.UpdateObsOrderTreeDto) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], MerkleTreeController.prototype, "updateObsOrderTree", null);
__decorate([
    (0, common_1.Get)('marketPairInfo'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof MarketPairInfo_dto_1.MarketSellBuyPair !== "undefined" && MarketPairInfo_dto_1.MarketSellBuyPair) === "function" ? _h : Object]),
    __metadata("design:returntype", Promise)
], MerkleTreeController.prototype, "getMarketPairInfo", null);
MerkleTreeController = MerkleTreeController_1 = __decorate([
    (0, common_1.Controller)('merkleTree'),
    __metadata("design:paramtypes", [typeof (_a = typeof tsAccountTree_service_1.TsAccountTreeService !== "undefined" && tsAccountTree_service_1.TsAccountTreeService) === "function" ? _a : Object, typeof (_b = typeof tsTokenTree_service_1.TsTokenTreeService !== "undefined" && tsTokenTree_service_1.TsTokenTreeService) === "function" ? _b : Object, typeof (_c = typeof marketPairInfo_service_1.MarketPairInfoService !== "undefined" && marketPairInfo_service_1.MarketPairInfoService) === "function" ? _c : Object, typeof (_d = typeof obsOrderTree_service_1.ObsOrderTreeService !== "undefined" && obsOrderTree_service_1.ObsOrderTreeService) === "function" ? _d : Object])
], MerkleTreeController);
exports.MerkleTreeController = MerkleTreeController;


/***/ }),
/* 46 */
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
const marketPairInfo_entity_1 = __webpack_require__(47);
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
/* 47 */
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
/* 48 */
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
exports.UpdateAccountTreeDto = void 0;
const swagger_1 = __webpack_require__(49);
class UpdateAccountTreeDto {
    leafId;
    tsAddr;
    nonce;
    tokenRoot;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UpdateAccountTreeDto.prototype, "leafId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UpdateAccountTreeDto.prototype, "tsAddr", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UpdateAccountTreeDto.prototype, "nonce", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UpdateAccountTreeDto.prototype, "tokenRoot", void 0);
exports.UpdateAccountTreeDto = UpdateAccountTreeDto;


/***/ }),
/* 49 */
/***/ ((module) => {

module.exports = require("@nestjs/swagger");;

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateTokenTreeDto = void 0;
const swagger_1 = __webpack_require__(49);
class UpdateTokenTreeDto {
    lockedAmt;
    availableAmt;
    leafId;
    accountId;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UpdateTokenTreeDto.prototype, "lockedAmt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UpdateTokenTreeDto.prototype, "availableAmt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UpdateTokenTreeDto.prototype, "leafId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UpdateTokenTreeDto.prototype, "accountId", void 0);
exports.UpdateTokenTreeDto = UpdateTokenTreeDto;


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TsAccountTreeService_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsAccountTreeService = void 0;
const common_1 = __webpack_require__(7);
const typeorm_1 = __webpack_require__(21);
const accountMerkleTreeNode_entity_1 = __webpack_require__(33);
const accountLeafNode_entity_1 = __webpack_require__(34);
const typeorm_2 = __webpack_require__(24);
const ts_helper_1 = __webpack_require__(25);
const tsMerkleTree_1 = __webpack_require__(28);
const config_1 = __webpack_require__(11);
let TsAccountTreeService = TsAccountTreeService_1 = class TsAccountTreeService extends tsMerkleTree_1.TsMerkleTree {
    accountLeafNodeRepository;
    accountMerkleTreeRepository;
    connection;
    configService;
    logger = new common_1.Logger(TsAccountTreeService_1.name);
    constructor(accountLeafNodeRepository, accountMerkleTreeRepository, connection, configService) {
        console.time('create Account Tree');
        super(configService.get('ACCOUNTS_TREE_HEIGHT', 32), ts_helper_1.tsHashFunc);
        this.accountLeafNodeRepository = accountLeafNodeRepository;
        this.accountMerkleTreeRepository = accountMerkleTreeRepository;
        this.connection = connection;
        this.configService = configService;
        console.timeEnd('create Account Tree');
    }
    async getCurrentLeafIdCount() {
        const leafIdCount = await this.accountLeafNodeRepository.count();
        return leafIdCount;
    }
    getLeafDefaultVavlue() {
        return (0, ts_helper_1.toTreeLeaf)([0n, 0n, 0n]);
    }
    async updateLeaf(leafId, value) {
        console.time('updateLeaf for account tree');
        const prf = this.getProofIds(leafId);
        const id = this.getLeafIdInTree(leafId);
        await this.connection.transaction(async (manager) => {
            await manager.upsert(accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, {
                id: id.toString(),
                leafId: leafId,
                hash: BigInt((0, ts_helper_1.toTreeLeaf)([
                    BigInt(value.tsAddr),
                    BigInt(value.nonce),
                    BigInt(value.tokenRoot)
                ]))
            }, ['id']);
            await manager.upsert(accountLeafNode_entity_1.AccountLeafNode, {
                tsAddr: BigInt(value.tsAddr),
                nonce: BigInt(value.nonce),
                tokenRoot: BigInt(value.tokenRoot),
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
                let r = (id % 2n == 0n) ? [jHashValue, iHashValue] : [iHashValue, jHashValue];
                const hash = this.hashFunc(r);
                const jobs = [];
                if (iValue == null) {
                    jobs.push(manager.upsert(accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, {
                        id: i.toString(),
                        hash: BigInt(iHashValue)
                    }, ['id']));
                }
                if (jValue == null && j < prf.length) {
                    jobs.push(manager.upsert(accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, {
                        id: prf[j].toString(),
                        hash: BigInt(jHashValue)
                    }, ['id']));
                }
                const updateRoot = i >> 1n;
                if (updateRoot >= 1n) {
                    jobs.push(manager.upsert(accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, {
                        id: updateRoot.toString(),
                        hash: BigInt(hash)
                    }, ['id']));
                }
                await Promise.all(jobs);
                j++;
            }
        });
        console.timeEnd('updateLeaf for account tree');
    }
    async getLeaf(leaf_id, otherPayload) {
        const result = await this.accountLeafNodeRepository.findOneBy({ leafId: leaf_id.toString() });
        if (result == null) {
            const id = this.getLeafIdInTree(leaf_id);
            const level = Math.floor(Math.log2(Number(id)));
            const hash = this.getDefaultHashByLevel(level);
            await this.connection.transaction(async (manager) => {
                await manager.insert(accountMerkleTreeNode_entity_1.AccountMerkleTreeNode, {
                    leafId: leaf_id,
                    id: id.toString(),
                    hash: BigInt(hash)
                });
                await manager.insert(accountLeafNode_entity_1.AccountLeafNode, {
                    leafId: leaf_id.toString(),
                    tsAddr: 0n,
                    nonce: 0n,
                });
            });
            return await this.accountLeafNodeRepository.findOneBy({ leafId: leaf_id.toString() });
        }
        return result;
    }
    async getRoot() {
        const result = await this.accountMerkleTreeRepository.findOneBy({
            id: 1n.toString(),
        });
        if (result == null) {
            const hash = await this.getDefaultHashByLevel(1);
            await this.accountMerkleTreeRepository.insert({
                id: 1n.toString(),
                hash: BigInt(hash)
            });
            return {
                id: 1n.toString(),
                hash: hash
            };
        }
        return result;
    }
};
TsAccountTreeService = TsAccountTreeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(accountLeafNode_entity_1.AccountLeafNode)),
    __param(1, (0, typeorm_1.InjectRepository)(accountMerkleTreeNode_entity_1.AccountMerkleTreeNode)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Connection !== "undefined" && typeorm_2.Connection) === "function" ? _c : Object, typeof (_d = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _d : Object])
], TsAccountTreeService);
exports.TsAccountTreeService = TsAccountTreeService;


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
const ts_helper_1 = __webpack_require__(25);
const tsMerkleTree_1 = __webpack_require__(28);
const tokenLeafNode_entity_1 = __webpack_require__(36);
const tokenMerkleTreeNode_entity_1 = __webpack_require__(35);
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
    getLeafDefaultVavlue() {
        return (0, ts_helper_1.toTreeLeaf)([0n, 0n, 0n]);
    }
    async updateLeaf(leafId, value) {
        console.time('updateLeaf for token tree');
        const prf = this.getProofIds(leafId);
        const id = this.getLeafIdInTree(leafId);
        const leafHash = (0, ts_helper_1.toTreeLeaf)([BigInt(value.leafId), BigInt(value.lockedAmt), BigInt(value.availableAmt)]);
        await this.connection.transaction(async (manager) => {
            const accountId = value.accountId;
            await manager.upsert(tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode, {
                accountId: accountId,
                id: id.toString(),
                leafId: leafId.toString(),
                hash: BigInt(leafHash)
            }, ['id', 'accountId']);
            await manager.upsert(tokenLeafNode_entity_1.TokenLeafNode, {
                leafId: leafId.toString(),
                accountId: accountId,
                lockedAmt: BigInt(value.lockedAmt),
                availableAmt: BigInt(value.availableAmt)
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
                let r = (id % 2n == 0n) ? [jHashValue, iHashValue] : [iHashValue, jHashValue];
                const hash = this.hashFunc(r);
                const jobs = [];
                if (iValue == null) {
                    jobs.push(manager.upsert(tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode, {
                        id: i.toString(), accountId: accountId, hash: BigInt(iHashValue)
                    }, ['id', 'accountId']));
                }
                if (jValue == null && j < prf.length) {
                    jobs.push(manager.upsert(tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode, {
                        id: prf[j].toString(), accountId: accountId, hash: BigInt(jHashValue)
                    }, ['id', 'accountId']));
                }
                const updateRoot = i >> 1n;
                if (updateRoot >= 1n) {
                    jobs.push(this.tokenMerkleTreeRepository.upsert([{
                            id: updateRoot.toString(), accountId: accountId, hash: BigInt(hash)
                        }], ['id', 'accountId']));
                }
                await Promise.all(jobs);
                j++;
            }
        });
        console.timeEnd('updateLeaf for token tree');
    }
    async getLeaf(leaf_id, accountId) {
        const result = await this.tokenLeafRepository.findOneBy({ leafId: leaf_id.toString(),
            accountId: accountId });
        if (result == null) {
            const id = this.getLeafIdInTree(leaf_id);
            const level = Math.floor(Math.log2(Number(id)));
            const hash = this.getDefaultHashByLevel(level);
            await this.connection.transaction(async (manager) => {
                await manager.insert(tokenMerkleTreeNode_entity_1.TokenMerkleTreeNode, {
                    accountId: accountId,
                    id: id.toString(),
                    leafId: leaf_id.toString(),
                    hash: BigInt(hash)
                });
                await manager.insert(tokenLeafNode_entity_1.TokenLeafNode, {
                    leafId: leaf_id.toString(),
                    accountId: accountId,
                });
            });
            return await this.tokenLeafRepository.findOneBy({ leafId: leaf_id.toString(), accountId: accountId });
        }
        return result;
    }
    async getRoot(accountId) {
        const result = await this.tokenMerkleTreeRepository.findOneBy({ accountId: accountId, id: 1n.toString() });
        if (result == null) {
            const hash = this.getDefaultHashByLevel(1);
            await this.tokenMerkleTreeRepository.insert({
                accountId: accountId,
                id: 1n.toString(),
                hash: BigInt(hash)
            });
            return {
                accountId: accountId,
                id: 1,
                leafId: null,
                hash: hash
            };
        }
        const resultHash = result.hash ? result.hash.toString() : '';
        return {
            accountId: accountId,
            id: 1,
            leafId: null,
            hash: resultHash,
        };
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
/* 53 */
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
exports.MarketSellBuyPair = exports.MarketPairInfoRequestDto = exports.MarketPair = exports.MarketPairInfoResponseDto = void 0;
const swagger_1 = __webpack_require__(49);
class MarketPairInfoResponseDto {
    mainTokenId;
    baseTokenId;
    marketPair;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MarketPairInfoResponseDto.prototype, "mainTokenId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MarketPairInfoResponseDto.prototype, "baseTokenId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MarketPairInfoResponseDto.prototype, "marketPair", void 0);
exports.MarketPairInfoResponseDto = MarketPairInfoResponseDto;
class MarketPair {
    mainTokenId;
    baseTokenId;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MarketPair.prototype, "mainTokenId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MarketPair.prototype, "baseTokenId", void 0);
exports.MarketPair = MarketPair;
class MarketPairInfoRequestDto {
    pairs;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], MarketPairInfoRequestDto.prototype, "pairs", void 0);
exports.MarketPairInfoRequestDto = MarketPairInfoRequestDto;
class MarketSellBuyPair {
    sellTokenId;
    buyTokenId;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MarketSellBuyPair.prototype, "sellTokenId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MarketSellBuyPair.prototype, "buyTokenId", void 0);
exports.MarketSellBuyPair = MarketSellBuyPair;


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateObsOrderTreeDto = void 0;
const swagger_1 = __webpack_require__(49);
class UpdateObsOrderTreeDto {
    orderLeafId;
    txId;
    reqType;
    sender;
    sellTokenId;
    nonce;
    sellAmt;
    buyTokenId;
    buyAmt;
    accumulatedSellAmt;
    accumulatedBuyAmt;
    orderId;
}
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "orderLeafId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "txId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "reqType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "sender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "sellTokenId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "nonce", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "sellAmt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "buyTokenId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "buyAmt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "accumulatedSellAmt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "accumulatedBuyAmt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String
    }),
    __metadata("design:type", String)
], UpdateObsOrderTreeDto.prototype, "orderId", void 0);
exports.UpdateObsOrderTreeDto = UpdateObsOrderTreeDto;


/***/ }),
/* 55 */
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
const auctionBondToken_entity_1 = __webpack_require__(56);
const obsOrder_entity_1 = __webpack_require__(30);
const obsOrderLeaf_entity_1 = __webpack_require__(29);
const matchObsOrder_entity_1 = __webpack_require__(39);
const candleStick_entity_1 = __webpack_require__(58);
const obsOrderLeafMerkleTreeNode_entity_1 = __webpack_require__(44);
const marketPairInfo_entity_1 = __webpack_require__(47);
const marketPairInfo_service_1 = __webpack_require__(46);
const availableView_entity_1 = __webpack_require__(59);
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
        providers: [config_1.ConfigService, marketPairInfo_service_1.MarketPairInfoService],
        exports: [typeorm_1.TypeOrmModule, marketPairInfo_service_1.MarketPairInfoService]
    })
], AuctionOrderMoudle);
exports.AuctionOrderMoudle = AuctionOrderMoudle;


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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuctionBondTokenEntity = exports.BondTokenStatusIndex = void 0;
const ts_types_1 = __webpack_require__(57);
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
/* 57 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsTokenAddress = exports.TsDeciaml = exports.TsTxType = exports.TsDefaultValue = exports.TsSystemAccountAddress = exports.getOChunksSize = exports.MAX_CHUNKS_BYTES_PER_REQ = exports.MAX_CHUNKS_PER_REQ = exports.MIN_CHUNKS_PER_REQ = exports.CHUNK_BITS_SIZE = exports.CHUNK_BYTES_SIZE = exports.LEN_OF_REQUEST = void 0;
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
    TsTxType["UNKNOWN"] = "0";
    TsTxType["NOOP"] = "0";
    TsTxType["REGISTER"] = "1";
    TsTxType["DEPOSIT"] = "2";
    TsTxType["WITHDRAW"] = "3";
    TsTxType["SecondLimitOrder"] = "4";
    TsTxType["SecondLimitStart"] = "5";
    TsTxType["SecondLimitExchange"] = "6";
    TsTxType["SecondLimitEnd"] = "7";
    TsTxType["SecondMarketOrder"] = "8";
    TsTxType["SecondMarketExchange"] = "9";
    TsTxType["SecondMarketEnd"] = "10";
    TsTxType["CancelOrder"] = "11";
    TsTxType["AUCTION_LEND"] = "99";
    TsTxType["AUCTION_BORROW"] = "100";
    TsTxType["AUCTION_CANCEL"] = "101";
})(TsTxType = exports.TsTxType || (exports.TsTxType = {}));
exports.TsDeciaml = {
    TS_TOKEN_AMOUNT_DEC: 18,
    TS_INTEREST_DEC: 6,
};
var TsTokenAddress;
(function (TsTokenAddress) {
    TsTokenAddress["Unknown"] = "0";
    TsTokenAddress["WETH"] = "6";
    TsTokenAddress["WBTC"] = "7";
    TsTokenAddress["USDT"] = "8";
    TsTokenAddress["USDC"] = "9";
    TsTokenAddress["DAI"] = "10";
    TsTokenAddress["TslETH20221231"] = "46";
    TsTokenAddress["TslBTC20221231"] = "47";
    TsTokenAddress["TslUSDT20221231"] = "48";
    TsTokenAddress["TslUSDC20221231"] = "49";
    TsTokenAddress["TslDAI20221231"] = "50";
})(TsTokenAddress = exports.TsTokenAddress || (exports.TsTokenAddress = {}));


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
        default: `'ETH/USDC'`
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
    __metadata("design:type", BigInt)
], AvailableViewEntity.prototype, "availableAmt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'lockedAmt',
        type: 'decimal',
        precision: 86,
        scale: 0,
        default: 0n
    }),
    __metadata("design:type", BigInt)
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
/* 60 */
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
const rollupInformation_entity_1 = __webpack_require__(61);
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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RollupInformation = void 0;
const lodash_1 = __webpack_require__(62);
const helper_1 = __webpack_require__(8);
const typeorm_1 = __webpack_require__(24);
let RollupInformation = class RollupInformation {
    id;
    lastSyncBlocknumberForRegisterEvent;
    lastSyncBlocknumberForDepositEvent;
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
        generated: 'increment'
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
        default: (0, lodash_1.now)()
    }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], RollupInformation.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({
        type: 'timestamp without time zone',
        name: 'deletedAt',
        nullable: true
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
/* 62 */
/***/ ((module) => {

module.exports = require("lodash");;

/***/ }),
/* 63 */
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
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OperatorProducer = void 0;
const pinoLogger_service_1 = __webpack_require__(6);
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
const typeorm_1 = __webpack_require__(21);
const transactionInfo_entity_1 = __webpack_require__(38);
const nestjs_ethers_1 = __webpack_require__(10);
const typeorm_2 = __webpack_require__(24);
const ABI = __webpack_require__(12);
const rollupInformation_entity_1 = __webpack_require__(61);
const worker_service_1 = __webpack_require__(64);
const firstValueFrom_1 = __webpack_require__(68);
const accountInformation_entity_1 = __webpack_require__(31);
let OperatorProducer = class OperatorProducer {
    config;
    logger;
    ethersSigner;
    ethersContract;
    txRepository;
    rollupInfoRepository;
    accountRepository;
    connection;
    workerService;
    wallet;
    contract;
    constructor(config, logger, ethersSigner, ethersContract, txRepository, rollupInfoRepository, accountRepository, connection, workerService) {
        this.config = config;
        this.logger = logger;
        this.ethersSigner = ethersSigner;
        this.ethersContract = ethersContract;
        this.txRepository = txRepository;
        this.rollupInfoRepository = rollupInfoRepository;
        this.accountRepository = accountRepository;
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
        const { lastSyncBlocknumberForRegisterEvent } = await this.rollupInfoRepository.findOneOrFail({ where: { id: 1 } });
        this.contract.queryFilter(filters, lastSyncBlocknumberForRegisterEvent, 'latest').then((logs) => {
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
        return await Promise.all([
            this.accountRepository.upsert(txRegister, ['L1Address']),
            this.txRepository.insert({
                accountId: 0n,
                tokenId: 0n,
                amount: 0n,
                arg0: BigInt(accountId.toString()),
                arg1: BigInt(l2Addr),
            }),
        ]);
    }
    async listenDepositEvent() {
        await (0, firstValueFrom_1.firstValueFrom)(this.workerService.onReadyObserver);
        this.logger.log(`OperatorProducer.listenDepositEvent contract=${this.contract.address}`);
        const filters = this.contract.filters.Deposit();
        const { lastSyncBlocknumberForDepositEvent } = await this.rollupInfoRepository.findOneOrFail({ where: { id: 1 } });
        const handler = (log) => {
            this.logger.log(`OperatorProducer.listenDepositEvent log:${JSON.stringify(log)}`);
            console.log({
                depositLog: log,
            });
            this.handleDepositEvent(log.args.sender, log.args.accountId, log.args.tokenId, log.args.amount, log.transactionHash);
        };
        this.contract.queryFilter(filters, lastSyncBlocknumberForDepositEvent, 'latest').then((logs) => {
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
            tokenId: BigInt(tokenId.toString()),
            amount: BigInt(amount.toString()),
            arg0: BigInt(accountId.toString()),
        });
    }
};
OperatorProducer = __decorate([
    (0, common_1.Injectable)({
        scope: common_1.Scope.DEFAULT,
    }),
    __param(2, (0, nestjs_ethers_1.InjectSignerProvider)()),
    __param(3, (0, nestjs_ethers_1.InjectContractProvider)()),
    __param(4, (0, typeorm_1.InjectRepository)(transactionInfo_entity_1.TransactionInfo)),
    __param(5, (0, typeorm_1.InjectRepository)(rollupInformation_entity_1.RollupInformation)),
    __param(6, (0, typeorm_1.InjectRepository)(accountInformation_entity_1.AccountInformation)),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _b : Object, typeof (_c = typeof nestjs_ethers_1.EthersSigner !== "undefined" && nestjs_ethers_1.EthersSigner) === "function" ? _c : Object, typeof (_d = typeof nestjs_ethers_1.EthersContract !== "undefined" && nestjs_ethers_1.EthersContract) === "function" ? _d : Object, typeof (_e = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _e : Object, typeof (_f = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _f : Object, typeof (_g = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _g : Object, typeof (_h = typeof typeorm_2.Connection !== "undefined" && typeorm_2.Connection) === "function" ? _h : Object, typeof (_j = typeof worker_service_1.WorkerService !== "undefined" && worker_service_1.WorkerService) === "function" ? _j : Object])
], OperatorProducer);
exports.OperatorProducer = OperatorProducer;


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkerService = void 0;
const _cluster = __webpack_require__(1);
const rxjs_1 = __webpack_require__(65);
const pinoLogger_service_1 = __webpack_require__(6);
const cluster_1 = __webpack_require__(66);
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
/* 65 */
/***/ ((module) => {

module.exports = require("rxjs");;

/***/ }),
/* 66 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClusterMessageEventPayload = exports.ClusterMessageType = void 0;
const constant_1 = __webpack_require__(5);
const runtypes_1 = __webpack_require__(67);
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
/* 67 */
/***/ ((module) => {

module.exports = require("runtypes");;

/***/ }),
/* 68 */
/***/ ((module) => {

module.exports = require("rxjs/internal/firstValueFrom");;

/***/ }),
/* 69 */
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
const main_process_service_1 = __webpack_require__(70);
const worker_service_1 = __webpack_require__(64);
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
/* 70 */
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
const cluster_1 = __webpack_require__(66);
const pinoLogger_service_1 = __webpack_require__(6);
const common_1 = __webpack_require__(7);
const constant_1 = __webpack_require__(5);
const helper_1 = __webpack_require__(8);
const rxjs_1 = __webpack_require__(65);
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
            throw new Error(`Worker ${payload.to} not found`);
        }
        this.workerMap[payload.to].worker?.send(payload);
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
/* 71 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setupApp = void 0;
const pinoLogger_service_1 = __webpack_require__(6);
const config_1 = __webpack_require__(11);
const core_1 = __webpack_require__(72);
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
/* 72 */
/***/ ((module) => {

module.exports = require("@nestjs/core");;

/***/ }),
/* 73 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.bootstrap = void 0;
const ts_sequencer_module_1 = __webpack_require__(74);
const setup_helper_1 = __webpack_require__(71);
async function bootstrap() {
    const app = await (0, setup_helper_1.setupApp)(ts_sequencer_module_1.TsSequencerModule);
    return app;
}
exports.bootstrap = bootstrap;


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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TsSequencerModule = void 0;
const pinoLogger_service_1 = __webpack_require__(6);
const common_1 = __webpack_require__(7);
const logger_module_1 = __webpack_require__(15);
const config_1 = __webpack_require__(11);
const constant_1 = __webpack_require__(5);
const BullQueue_module_1 = __webpack_require__(19);
const sequencer_processor_1 = __webpack_require__(75);
const nest_bullmq_1 = __webpack_require__(13);
const schedule_1 = __webpack_require__(76);
const typeorm_1 = __webpack_require__(21);
const blockInformation_entity_1 = __webpack_require__(41);
const transactionInfo_entity_1 = __webpack_require__(38);
const tstypeorm_module_1 = __webpack_require__(20);
const cluster_module_1 = __webpack_require__(69);
const worker_service_1 = __webpack_require__(64);
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
            nest_bullmq_1.BullModule.registerQueue(constant_1.TsWorkerName.SEQUENCER),
            tstypeorm_module_1.TsTypeOrmModule,
            typeorm_1.TypeOrmModule.forFeature([
                transactionInfo_entity_1.TransactionInfo,
                blockInformation_entity_1.BlockInformation,
            ]),
            cluster_module_1.WorkerModule,
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
/* 75 */
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
exports.SequencerConsumer = void 0;
const constant_1 = __webpack_require__(5);
const pinoLogger_service_1 = __webpack_require__(6);
const nest_bullmq_1 = __webpack_require__(13);
const bullmq_1 = __webpack_require__(14);
const typeorm_1 = __webpack_require__(21);
const blockInformation_entity_1 = __webpack_require__(41);
const transactionInfo_entity_1 = __webpack_require__(38);
const typeorm_2 = __webpack_require__(24);
const tsStatus_enum_1 = __webpack_require__(43);
let SequencerConsumer = class SequencerConsumer {
    logger;
    txRepository;
    blockRepository;
    constructor(logger, txRepository, blockRepository) {
        this.logger = logger;
        this.txRepository = txRepository;
        this.blockRepository = blockRepository;
        this.logger.log('SEQUENCER.process START');
    }
    async process(job) {
        this.logger.log(`SEQUENCER.process ${job.data.txId}`);
        await this.txRepository.update({
            txId: job.data.txId,
        }, {
            txStatus: tsStatus_enum_1.TS_STATUS.PROCESSING
        });
        await delay(1000 * 1.5);
        await this.txRepository.update({
            txId: job.data.txId,
        }, {
            txStatus: tsStatus_enum_1.TS_STATUS.L2EXECUTED
        });
        return true;
    }
};
__decorate([
    (0, nest_bullmq_1.BullWorkerProcess)({
        autorun: true,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof bullmq_1.Job !== "undefined" && bullmq_1.Job) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], SequencerConsumer.prototype, "process", null);
SequencerConsumer = __decorate([
    (0, nest_bullmq_1.BullWorker)({
        queueName: constant_1.TsWorkerName.SEQUENCER,
        options: {
            concurrency: 1
        }
    }),
    __param(1, (0, typeorm_1.InjectRepository)(transactionInfo_entity_1.TransactionInfo)),
    __param(2, (0, typeorm_1.InjectRepository)(blockInformation_entity_1.BlockInformation)),
    __metadata("design:paramtypes", [typeof (_a = typeof pinoLogger_service_1.PinoLoggerService !== "undefined" && pinoLogger_service_1.PinoLoggerService) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object])
], SequencerConsumer);
exports.SequencerConsumer = SequencerConsumer;
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/***/ }),
/* 76 */
/***/ ((module) => {

module.exports = require("@nestjs/schedule");;

/***/ }),
/* 77 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.bootstrap = void 0;
const ts_prover_module_1 = __webpack_require__(78);
const setup_helper_1 = __webpack_require__(71);
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
/* 78 */
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
const prover_processor_1 = __webpack_require__(79);
const nest_bullmq_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(21);
const blockInformation_entity_1 = __webpack_require__(41);
const transactionInfo_entity_1 = __webpack_require__(38);
const tstypeorm_module_1 = __webpack_require__(20);
const worker_service_1 = __webpack_require__(64);
const cluster_module_1 = __webpack_require__(69);
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
/* 79 */
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
const prover_core_1 = __webpack_require__(80);
const fs_1 = __webpack_require__(84);
const path_1 = __webpack_require__(82);
const config_1 = __webpack_require__(11);
const typeorm_1 = __webpack_require__(21);
const blockInformation_entity_1 = __webpack_require__(41);
const typeorm_2 = __webpack_require__(24);
const nest_bullmq_1 = __webpack_require__(13);
const bullmq_1 = __webpack_require__(14);
const blockStatus_enum_1 = __webpack_require__(42);
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
/* 80 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateWitness = exports.generateProof = exports.prove = exports.BatchesDir = void 0;
const util = __webpack_require__(81);
const path_1 = __webpack_require__(82);
const _exec = util.promisify(__webpack_require__(83).exec);
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
/* 81 */
/***/ ((module) => {

module.exports = require("util");;

/***/ }),
/* 82 */
/***/ ((module) => {

module.exports = require("path");;

/***/ }),
/* 83 */
/***/ ((module) => {

module.exports = require("child_process");;

/***/ }),
/* 84 */
/***/ ((module) => {

module.exports = require("fs");;

/***/ }),
/* 85 */
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
const cqrs_1 = __webpack_require__(86);
const config_1 = __webpack_require__(11);
const constant_1 = __webpack_require__(5);
const schedule_1 = __webpack_require__(76);
const producer_service_1 = __webpack_require__(87);
const BullQueue_module_1 = __webpack_require__(19);
const tstypeorm_module_1 = __webpack_require__(20);
const typeorm_1 = __webpack_require__(21);
const blockInformation_entity_1 = __webpack_require__(41);
const nest_bullmq_1 = __webpack_require__(13);
const db_pubsub_module_1 = __webpack_require__(90);
const transactionInfo_entity_1 = __webpack_require__(38);
const cluster_module_1 = __webpack_require__(69);
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
/* 86 */
/***/ ((module) => {

module.exports = require("@nestjs/cqrs");;

/***/ }),
/* 87 */
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
const pubSub_constants_1 = __webpack_require__(88);
const messageBroker_1 = __webpack_require__(89);
const pinoLogger_service_1 = __webpack_require__(6);
const common_1 = __webpack_require__(7);
const typeorm_1 = __webpack_require__(21);
const blockInformation_entity_1 = __webpack_require__(41);
const transactionInfo_entity_1 = __webpack_require__(38);
const tsStatus_enum_1 = __webpack_require__(43);
const typeorm_2 = __webpack_require__(24);
const bullmq_1 = __webpack_require__(14);
const constant_1 = __webpack_require__(5);
const blockStatus_enum_1 = __webpack_require__(42);
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
        this.subscribe();
    }
    subscribe() {
        this.messageBrokerService.subscribe(pubSub_constants_1.CHANNEL.ORDER_CREATED, this.dispatchPendingTransaction.bind(this));
        this.messageBrokerService.subscribe(pubSub_constants_1.CHANNEL.ORDER_PROCCESSD, this.dispatchPeningBlock.bind(this));
        this.messageBrokerService.subscribe(pubSub_constants_1.CHANNEL.ORDER_VERIFIED, this.dispatchProvedBlock.bind(this));
    }
    unsubscribe() {
        this.messageBrokerService.close();
    }
    prevJobId;
    async dispatchPendingTransaction() {
        this.logger.log('dispatchPendingTransaction');
        const transactions = await this.txRepository.find({
            where: {
                txId: (0, typeorm_2.MoreThan)(this.currentPendingTxId),
                txStatus: tsStatus_enum_1.TS_STATUS.PENDING,
            },
            order: {
                txId: 'asc',
            }
        });
        if (transactions.length) {
            this.logger.log(`dispatchPendingTransaction add ${transactions.length} blocks`);
            this.currentPendingTxId = transactions[transactions.length - 1].txId;
            for (let index = 0; index < transactions.length; index++) {
                const tx = transactions[index];
                const jobId = `${constant_1.TsWorkerName.SEQUENCER}-${tx.txId}`;
                console.log({
                    jobId,
                    prevJobId: this.prevJobId,
                });
                try {
                    const job = await this.seqQueue.add(tx.txId.toString(), tx, {
                        jobId,
                    });
                    this.prevJobId = this.seqQueue.toKey(job.id?.toString() || '');
                    this.logger.log(`JOB: ${job.id}`);
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
            }
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
            }
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
/* 88 */
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


/***/ }),
/* 89 */
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
/* 90 */
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
const messageBroker_service_1 = __webpack_require__(91);
const messageBroker_1 = __webpack_require__(89);
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
var MessageBrokerService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MessageBrokerService = void 0;
const common_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
const pg_pubsub_1 = __webpack_require__(92);
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
/* 92 */
/***/ ((module) => {

module.exports = require("@imqueue/pg-pubsub");;

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
const main_2 = __webpack_require__(73);
const main_3 = __webpack_require__(77);
const constant_1 = __webpack_require__(5);
const app_module_1 = __webpack_require__(85);
const core_1 = __webpack_require__(72);
const pinoLogger_service_1 = __webpack_require__(6);
const helper_1 = __webpack_require__(8);
const main_process_service_1 = __webpack_require__(70);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwiY2x1c3RlclwiIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi90cy1vcGVyYXRvci9zcmMvbWFpbi50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtb3BlcmF0b3Ivc3JjL3RzLW9wZXJhdG9yLm1vZHVsZS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtb3BlcmF0b3Ivc3JjL2luZnJhc3RydWN0dXJlL29wZXJhdG9yLnByb2Nlc3Nvci50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtc2RrL3NyYy9jb25zdGFudC50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL2xvZ2dlci9zcmMvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcIkBuZXN0anMvY29tbW9uXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLXNkay9zcmMvaGVscGVyLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJuZXN0anMtcGlub1wiIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJuZXN0anMtZXRoZXJzXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcIkBuZXN0anMvY29uZmlnXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcIkBhbmNoYW44MjgvbmVzdC1idWxsbXFcIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwiYnVsbG1xXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi9sb2dnZXIvc3JjL2xvZ2dlci5tb2R1bGUudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcInBpbm9cIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwidXVpZFwiIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vbG9nZ2VyL3NyYy9hZGFwdGVycy9mYWtlL0Zha2VMb2dnZXIuc2VydmljZS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL2J1bGwtcXVldWUvc3JjL0J1bGxRdWV1ZS5tb2R1bGUudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy90c3R5cGVvcm0ubW9kdWxlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJAbmVzdGpzL3R5cGVvcm1cIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvYWNjb3VudC5tb2R1bGUudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hdWN0aW9uT3JkZXIvb2JzT3JkZXJUcmVlLnNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcInR5cGVvcm1cIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2NvbW1vbi90cy1oZWxwZXIudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9jb21tb24vcG9zZWlkZW4taGFzaC1kcC50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwiQGJpZy13aGFsZS1sYWJzL3Bvc2VpZG9uXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9jb21tb24vdHNNZXJrbGVUcmVlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYXVjdGlvbk9yZGVyL29ic09yZGVyTGVhZi5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hdWN0aW9uT3JkZXIvb2JzT3JkZXIuZW50aXR5LnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC9hY2NvdW50SW5mb3JtYXRpb24uZW50aXR5LnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvY29tbW9uL2Jhc2VUaW1lRW50aXR5LnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC9hY2NvdW50TWVya2xlVHJlZU5vZGUuZW50aXR5LnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC9hY2NvdW50TGVhZk5vZGUuZW50aXR5LnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC90b2tlbk1lcmtsZVRyZWVOb2RlLmVudGl0eS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvdG9rZW5MZWFmTm9kZS5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L3JvbGUuZW51bS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvdHJhbnNhY3Rpb25JbmZvLmVudGl0eS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2F1Y3Rpb25PcmRlci9tYXRjaE9ic09yZGVyLmVudGl0eS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2F1Y3Rpb25PcmRlci90c1NpZGUuZW51bS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvYmxvY2tJbmZvcm1hdGlvbi5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L2Jsb2NrU3RhdHVzLmVudW0udHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L3RzU3RhdHVzLmVudW0udHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hdWN0aW9uT3JkZXIvb2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUuZW50aXR5LnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC9tZXJrbGVUcmVlLmNvbnRyb2xsZXIudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hdWN0aW9uT3JkZXIvbWFya2V0UGFpckluZm8uc2VydmljZS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2F1Y3Rpb25PcmRlci9tYXJrZXRQYWlySW5mby5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L2R0by91cGRhdGVBY2NvdW50VHJlZS5kdG8udHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcIkBuZXN0anMvc3dhZ2dlclwiIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC9kdG8vdXBkYXRlVG9rZW5UcmVlLmR0by50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvdHNBY2NvdW50VHJlZS5zZXJ2aWNlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC90c1Rva2VuVHJlZS5zZXJ2aWNlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYXVjdGlvbk9yZGVyL2R0by9NYXJrZXRQYWlySW5mby5kdG8udHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hdWN0aW9uT3JkZXIvZHRvL3VwZGF0ZU9ic09yZGVyVHJlZS5kdG8udHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi90cy10eXBlb3JtL3NyYy9hdWN0aW9uT3JkZXIvYXVjdGlvbk9yZGVyLm1vZHVsZS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2F1Y3Rpb25PcmRlci9hdWN0aW9uQm9uZFRva2VuLmVudGl0eS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtc2RrL3NyYy9kb21haW4vbGliL3RzLXR5cGVzL3RzLXR5cGVzLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvYXVjdGlvbk9yZGVyL2NhbmRsZVN0aWNrLmVudGl0eS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2F1Y3Rpb25PcmRlci9hdmFpbGFibGVWaWV3LmVudGl0eS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL3JvbGx1cC9yb2xsdXAubW9kdWxlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vdHMtdHlwZW9ybS9zcmMvcm9sbHVwL3JvbGx1cEluZm9ybWF0aW9uLmVudGl0eS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwibG9kYXNoXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLW9wZXJhdG9yL3NyYy9pbmZyYXN0cnVjdHVyZS9vcGVyYXRvci5wcm9kdWNlci50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL2NsdXN0ZXIvc3JjL3dvcmtlci5zZXJ2aWNlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJyeGpzXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLXNkay9zcmMvZG9tYWluL2V2ZW50cy9jbHVzdGVyLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJydW50eXBlc1wiIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJyeGpzL2ludGVybmFsL2ZpcnN0VmFsdWVGcm9tXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL2NvbW1vbi9jbHVzdGVyL3NyYy9jbHVzdGVyLm1vZHVsZS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL2NsdXN0ZXIvc3JjL21haW4tcHJvY2Vzcy5zZXJ2aWNlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi90cy1zZGsvc3JjL3NldHVwLmhlbHBlci50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwiQG5lc3Rqcy9jb3JlXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLXNlcXVlbmNlci9zcmMvbWFpbi50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtc2VxdWVuY2VyL3NyYy90cy1zZXF1ZW5jZXIubW9kdWxlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi90cy1zZXF1ZW5jZXIvc3JjL2luZnJhc3RydWN0dXJlL3NlcXVlbmNlci5wcm9jZXNzb3IudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcIkBuZXN0anMvc2NoZWR1bGVcIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtcHJvdmVyL3NyYy9tYWluLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi90cy1wcm92ZXIvc3JjL3RzLXByb3Zlci5tb2R1bGUudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLXByb3Zlci9zcmMvaW5mcmFzdHJ1Y3R1cmUvcHJvdmVyLnByb2Nlc3Nvci50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vdHMtcHJvdmVyL3NyYy9kb21haW4vcHJvdmVyLWNvcmUudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcInV0aWxcIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL2V4dGVybmFsIFwicGF0aFwiIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJjaGlsZF9wcm9jZXNzXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcImZzXCIiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS8uL3RzLWNvcmUvc3JjL2FwcC5tb2R1bGUudHMiLCJ3ZWJwYWNrOi8vdGVybS1zdHJ1Y3R1cmUtY29yZS9leHRlcm5hbCBcIkBuZXN0anMvY3Fyc1wiIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi90cy1jb3JlL3NyYy9wcm9kdWNlci5zZXJ2aWNlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi9jb21tb24vZGItcHVic3ViL3NyYy9kb21haW5zL3ZhbHVlLW9iamVjdHMvcHViU3ViLmNvbnN0YW50cy50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL2RiLXB1YnN1Yi9zcmMvcG9ydHMvbWVzc2FnZUJyb2tlci50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL2RiLXB1YnN1Yi9zcmMvZGItcHVic3ViLm1vZHVsZS50cyIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlLy4vY29tbW9uL2RiLXB1YnN1Yi9zcmMvYWRhcHRlcnMvbWVzc2FnZUJyb2tlci5zZXJ2aWNlLnRzIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvZXh0ZXJuYWwgXCJAaW1xdWV1ZS9wZy1wdWJzdWJcIiIsIndlYnBhY2s6Ly90ZXJtLXN0cnVjdHVyZS1jb3JlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3Rlcm0tc3RydWN0dXJlLWNvcmUvLi90cy1jb3JlL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQSxxQzs7Ozs7Ozs7O0FDQUEsb0RBQXdEO0FBQ3hELCtDQUFnRDtBQUN6QyxLQUFLLFVBQVUsU0FBUztJQUM3QixNQUFNLEdBQUcsR0FBRyxNQUFNLDJCQUFRLEVBQUMscUNBQWdCLENBQUMsQ0FBQztJQUU3QyxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFKRCw4QkFJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNORCxvREFBdUU7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QUNGO0FBQ0gsQ0FBQztBQUVELEtBQUssVUFBVSxjQUFjLENBQUMsTUFBZSxFQUFFLE9BQXFCO0lBQ2xFLE1BQU0sR0FBRyxHQUFHLE1BQU0sa0JBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMvRCxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLHNDQUFpQixDQUFDLENBQUM7SUFDMUMsTUFBTSxDQUFDLFVBQVUsQ0FBQywwQkFBYSxHQUFFLENBQUMsQ0FBQztJQUNuQyxNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLHlDQUFrQixDQUFDLENBQUM7SUFDbkQsY0FBYyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuQyxNQUFNLENBQUMsVUFBVSxDQUFDLDJCQUFjLEdBQUUsQ0FBQyxDQUFDO0lBRXBDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyx1QkFBWSxDQUFDLElBQUksbUJBQW1CLENBQUMsQ0FBQztJQUNwRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUMiLCJmaWxlIjoidHMtY29yZS9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY2x1c3RlclwiKTs7IiwiaW1wb3J0IHsgVHNPcGVyYXRvck1vZHVsZSB9IGZyb20gJy4vdHMtb3BlcmF0b3IubW9kdWxlJztcbmltcG9ydCB7IHNldHVwQXBwIH0gZnJvbSAnQHRzLXNkay9zZXR1cC5oZWxwZXInO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJvb3RzdHJhcCgpIHtcbiAgY29uc3QgYXBwID0gYXdhaXQgc2V0dXBBcHAoVHNPcGVyYXRvck1vZHVsZSk7XG5cbiAgcmV0dXJuIGFwcDtcbn0iLCJpbXBvcnQgeyBPcGVyYXRvckNvbnN1bWVyIH0gZnJvbSAnLi9pbmZyYXN0cnVjdHVyZS9vcGVyYXRvci5wcm9jZXNzb3InO1xuaW1wb3J0IHsgUGlub0xvZ2dlclNlcnZpY2UgfSBmcm9tICdAY29tbW9uL2xvZ2dlci9hZGFwdGVycy9yZWFsL3Bpbm9Mb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBNb2R1bGUsIE9uTW9kdWxlSW5pdCB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IExvZ2dlck1vZHVsZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2xvZ2dlci5tb2R1bGUnO1xuaW1wb3J0IHsgQ29uZmlnTW9kdWxlLCBDb25maWdTZXJ2aWNlIH0gZnJvbSAnQG5lc3Rqcy9jb25maWcnO1xuaW1wb3J0IHsgVHNXb3JrZXJOYW1lIH0gZnJvbSAnQHRzLXNkay9jb25zdGFudCc7XG5pbXBvcnQgeyBCdWxsUXVldWVNb2R1bGUgfSBmcm9tICdjb21tb24vYnVsbC1xdWV1ZS9zcmMvQnVsbFF1ZXVlLm1vZHVsZSc7XG5pbXBvcnQgeyBFdGhlcnNNb2R1bGUsIE1BSU5ORVRfTkVUV09SSywgR09FUkxJX05FVFdPUkssIE5ldHdvcmsgfSBmcm9tICduZXN0anMtZXRoZXJzJztcbmltcG9ydCB7IEJ1bGxNb2R1bGUgfSBmcm9tICdAYW5jaGFuODI4L25lc3QtYnVsbG1xJztcbmltcG9ydCB7IFRzVHlwZU9ybU1vZHVsZSB9IGZyb20gJ2NvbW1vbi90cy10eXBlb3JtL3NyYy90c3R5cGVvcm0ubW9kdWxlJztcbmltcG9ydCB7IE9wZXJhdG9yUHJvZHVjZXIgfSBmcm9tICcuL2luZnJhc3RydWN0dXJlL29wZXJhdG9yLnByb2R1Y2VyJztcbmltcG9ydCB7IFJvbGx1cEluZm9ybWF0aW9uIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL3JvbGx1cC9yb2xsdXBJbmZvcm1hdGlvbi5lbnRpdHknO1xuaW1wb3J0IHsgVHlwZU9ybU1vZHVsZSB9IGZyb20gJ0BuZXN0anMvdHlwZW9ybSc7XG5pbXBvcnQgeyBUcmFuc2FjdGlvbkluZm8gfSBmcm9tICdjb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC90cmFuc2FjdGlvbkluZm8uZW50aXR5JztcbmltcG9ydCB7IFdvcmtlck1vZHVsZSB9IGZyb20gJ0Bjb21tb24vY2x1c3Rlci9jbHVzdGVyLm1vZHVsZSc7XG5pbXBvcnQgeyBXb3JrZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9jbHVzdGVyL3dvcmtlci5zZXJ2aWNlJztcblxuY29uc3QgbG9jYWxOZXR3b3JrID0ge1xuICBuYW1lOiAnTE9DQUwnLFxuICBjaGFpbklkOiAzMTMzNyxcbiAgX2RlZmF1bHRQcm92aWRlcjogKHByb3ZpZGVyczogYW55KSA9PiB7XG4gICAgcmV0dXJuIG5ldyBwcm92aWRlcnMuSnNvblJwY1Byb3ZpZGVyKCdodHRwOi8vbG9jYWxob3N0Ojg1NDUnKTtcbiAgfSxcbn07XG5ATW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbmZpZ01vZHVsZSxcbiAgICBMb2dnZXJNb2R1bGUsXG4gICAgQnVsbFF1ZXVlTW9kdWxlLFxuICAgIEJ1bGxNb2R1bGUucmVnaXN0ZXJRdWV1ZShUc1dvcmtlck5hbWUuT1BFUkFUT1IpLFxuICAgIFRzVHlwZU9ybU1vZHVsZSxcbiAgICBUeXBlT3JtTW9kdWxlLmZvckZlYXR1cmUoW1JvbGx1cEluZm9ybWF0aW9uLCBUcmFuc2FjdGlvbkluZm9dKSxcbiAgICBFdGhlcnNNb2R1bGUuZm9yUm9vdEFzeW5jKHtcbiAgICAgIGltcG9ydHM6IFtDb25maWdNb2R1bGVdLFxuICAgICAgaW5qZWN0OiBbQ29uZmlnU2VydmljZV0sXG4gICAgICB1c2VGYWN0b3J5OiAoY29uZmlnU2VydmljZTogQ29uZmlnU2VydmljZSkgPT4gKHtcbiAgICAgICAgbmV0d29yazogY29uZmlnU2VydmljZS5nZXQoJ0VUSEVSRVVNX05FVFdPUksnLCAnVEVTVE5FVCcpID09PSAnTUFJTk5FVCcgPyBNQUlOTkVUX05FVFdPUksgOiBHT0VSTElfTkVUV09SSyxcbiAgICAgICAgZXRoZXJzY2FuOiBjb25maWdTZXJ2aWNlLmdldCgnRVRIRVJTQ0FOX0FQSV9LRVknKSxcbiAgICAgICAgLy8gY3VzdG9tOiB7XG4gICAgICAgIC8vICAgdXJsOiAnaHR0cDovL2xvY2FsaG9zdDo4NTQ1JyxcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8gaW5mdXJhOiBjb25maWdTZXJ2aWNlLmdldCgnSU5GVVJBX0FQSV9LRVknKSxcbiAgICAgICAgcXVvcnVtOiAxLFxuICAgICAgICB1c2VEZWZhdWx0UHJvdmlkZXI6IHRydWUsXG4gICAgICB9KSxcbiAgICB9KSxcbiAgICBXb3JrZXJNb2R1bGUsXG4gIF0sXG4gIGNvbnRyb2xsZXJzOiBbXSxcbiAgcHJvdmlkZXJzOiBbT3BlcmF0b3JDb25zdW1lciwgT3BlcmF0b3JQcm9kdWNlcl0sXG59KVxuZXhwb3J0IGNsYXNzIFRzT3BlcmF0b3JNb2R1bGUgaW1wbGVtZW50cyBPbk1vZHVsZUluaXQge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZW1wdHktZnVuY3Rpb25cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBsb2dnZXI6IFBpbm9Mb2dnZXJTZXJ2aWNlLCBwcml2YXRlIHJlYWRvbmx5IHdvcmtlclNlcnZpY2U6IFdvcmtlclNlcnZpY2UpIHt9XG5cbiAgb25Nb2R1bGVJbml0KCk6IHZvaWQge1xuICAgIHRoaXMud29ya2VyU2VydmljZS5yZWFkeSgpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBaa09CUyB9IGZyb20gJy4vLi4vLi4vLi4vLi4vdHlwZWNoYWluLXR5cGVzL2NvbnRyYWN0cy9aa09CUyc7XG5pbXBvcnQgeyBUc1dvcmtlck5hbWUgfSBmcm9tICdAdHMtc2RrL2NvbnN0YW50JztcbmltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgRXRoZXJzQ29udHJhY3QsIEV0aGVyc1NpZ25lciwgSW5qZWN0Q29udHJhY3RQcm92aWRlciwgSW5qZWN0U2lnbmVyUHJvdmlkZXIsIFdhbGxldCB9IGZyb20gJ25lc3Rqcy1ldGhlcnMnO1xuaW1wb3J0IHsgQ29uZmlnU2VydmljZSB9IGZyb20gJ0BuZXN0anMvY29uZmlnJztcbmltcG9ydCAqIGFzIEFCSSBmcm9tICcuLi9kb21haW4vdmVyaWZpZWQtYWJpLmpzb24nO1xuaW1wb3J0IHsgQnVsbFdvcmtlciwgQnVsbFdvcmtlclByb2Nlc3MgfSBmcm9tICdAYW5jaGFuODI4L25lc3QtYnVsbG1xJztcbmltcG9ydCB7IEpvYiB9IGZyb20gJ2J1bGxtcSc7XG5pbXBvcnQgeyBCbG9ja0luZm9ybWF0aW9uIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvYmxvY2tJbmZvcm1hdGlvbi5lbnRpdHknO1xuXG5AQnVsbFdvcmtlcih7XG4gIHF1ZXVlTmFtZTogVHNXb3JrZXJOYW1lLk9QRVJBVE9SLFxuICBvcHRpb25zOiB7XG4gICAgY29uY3VycmVuY3k6IDEsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIE9wZXJhdG9yQ29uc3VtZXIge1xuICBwcml2YXRlIHdhbGxldDogV2FsbGV0O1xuICBwcml2YXRlIGNvbnRyYWN0OiBaa09CUztcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBjb25maWc6IENvbmZpZ1NlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSBsb2dnZXI6IFBpbm9Mb2dnZXJTZXJ2aWNlLFxuICAgIEBJbmplY3RTaWduZXJQcm92aWRlcigpIHByaXZhdGUgcmVhZG9ubHkgZXRoZXJzU2lnbmVyOiBFdGhlcnNTaWduZXIsXG4gICAgQEluamVjdENvbnRyYWN0UHJvdmlkZXIoKSBwcml2YXRlIHJlYWRvbmx5IGV0aGVyc0NvbnRyYWN0OiBFdGhlcnNDb250cmFjdCxcbiAgKSB7XG4gICAgdGhpcy53YWxsZXQgPSB0aGlzLmV0aGVyc1NpZ25lci5jcmVhdGVXYWxsZXQodGhpcy5jb25maWcuZ2V0KCdFVEhFUkVVTV9PUEVSQVRPUl9QUklWJywgJycpKTtcbiAgICB0aGlzLmNvbnRyYWN0ID0gdGhpcy5ldGhlcnNDb250cmFjdC5jcmVhdGUodGhpcy5jb25maWcuZ2V0KCdFVEhFUkVVTV9ST0xMVVBfQ09OVFJBQ1RfQUREUicsICcnKSwgQUJJLCB0aGlzLndhbGxldCkgYXMgdW5rbm93biBhcyBaa09CUztcbiAgfVxuXG4gIEBCdWxsV29ya2VyUHJvY2VzcygpXG4gIGFzeW5jIHByb2Nlc3Moam9iOiBKb2I8QmxvY2tJbmZvcm1hdGlvbj4pIHtcbiAgICB0aGlzLmxvZ2dlci5sb2coYE9wZXJhdG9yQ29uc3VtZXIucHJvY2VzcyAke2pvYi5kYXRhLmJsb2NrTnVtYmVyfWApO1xuICAgIC8vIGV0aGVycztcbiAgICAvLyAvLyBUT0RPOiByZWZhY3RvclxuICAgIC8vIGNvbnN0IHthLGIsY30gPSBqb2IuZGF0YS5wcm9vZiBhcyBhbnk7XG4gICAgLy8gY29uc3QgaW5wdXQgPSBqb2IuZGF0YS5wdWJsaWNJbnB1dCBhcyBhbnk7XG4gICAgLy8gY29uc3QgZ2FzID0gYXdhaXQgdGhpcy5jb250cmFjdC5lc3RpbWF0ZUdhcy52ZXJpZnlQcm9vZihhLCBiLCBjLCBpbnB1dCk7XG4gICAgLy8gdGhpcy5sb2dnZXIubG9nKGBPcGVyYXRvckNvbnN1bWVyLnByb2Nlc3MgJHtqb2IuZGF0YS5ibG9ja051bWJlcn0gZ2FzPSR7Z2FzfWApO1xuICAgIC8vIGNvbnN0IHJlY2VpcHQgPSBhd2FpdCB0aGlzLmNvbnRyYWN0LnZlcmlmeVByb29mKGEsIGIsIGMsIGlucHV0LCB7XG4gICAgLy8gICBmcm9tOiB0aGlzLndhbGxldC5hZGRyZXNzLFxuICAgIC8vICAgZ2FzOiBnYXMudG9OdW1iZXIoKSxcbiAgICAvLyB9KTtcbiAgICAvLyB0aGlzLmxvZ2dlci5sb2coYE9wZXJhdG9yQ29uc3VtZXIucHJvY2VzcyB0eEhhc2g9JHtyZWNlaXB0LnRyYW5zYWN0aW9uSGFzaH1gKTtcbiAgICAvLyBhd2FpdCB0aGlzLnByaXNtYVNlcnZpY2UuQmxvY2tJbmZvcm1hdGlvbi51cGRhdGUoe1xuICAgIC8vICAgd2hlcmU6IHtcbiAgICAvLyAgICAgYmxvY2tOdW1iZXI6IGpvYi5kYXRhLmJsb2NrTnVtYmVyLFxuICAgIC8vICAgfSxcbiAgICAvLyAgIGRhdGE6IHtcbiAgICAvLyAgICAgc3RhdHVzOiBCbG9ja1N0YXR1cy5MMVZFUklGSUVEXG4gICAgLy8gICB9XG4gICAgLy8gfSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiIsImltcG9ydCB0eXBlIHsgV29ya2VyIH0gZnJvbSAnY2x1c3Rlcic7XG5pbXBvcnQgeyBJTmVzdEFwcGxpY2F0aW9uLCBJTmVzdEFwcGxpY2F0aW9uQ29udGV4dCB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcblxuZXhwb3J0IGVudW0gVHNXb3JrZXJOYW1lIHtcbiAgVU5LTk9XTiA9ICd1bmtub3duJyxcbiAgQ09SRSA9ICdUc0NvcmUnLFxuICBPUEVSQVRPUiA9ICdUc09wZXJhdG9yJyxcbiAgUFJPVkVSID0gJ1RzUHJvdmVyJyxcbiAgU0VRVUVOQ0VSID0gJ1RzU2VxdWVuY2VyJyxcbiAgR0FURVdBWSA9ICdUc0dhdGV3YXknLFxufVxuXG5leHBvcnQgdHlwZSBXb3JrZXJJdGVtID0ge1xuICBuYW1lOiBUc1dvcmtlck5hbWU7XG4gIGJvb3RzdHJhcDogKCkgPT4gUHJvbWlzZTxJTmVzdEFwcGxpY2F0aW9uQ29udGV4dCB8IElOZXN0QXBwbGljYXRpb24+O1xuICB3b3JrZXI/OiBXb3JrZXI7XG4gIGlzUmVhZHk/OiBib29sZWFuO1xufVxuIiwiaW1wb3J0IHsgQ29uc29sZUxvZ2dlciwgSW5qZWN0YWJsZSB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IGdldFByb2Nlc3NOYW1lIH0gZnJvbSAnQHRzLXNkay9oZWxwZXInO1xuaW1wb3J0IHsgUGlub0xvZ2dlciB9IGZyb20gJ25lc3Rqcy1waW5vJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFBpbm9Mb2dnZXJTZXJ2aWNlIGV4dGVuZHMgQ29uc29sZUxvZ2dlciB7XG4gIHJlYWRvbmx5IGNvbnRleHROYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgbG9nZ2VyOiBQaW5vTG9nZ2VyKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmNvbnRleHROYW1lID0gJ2NvbnRleHQnO1xuICB9XG5cbiAgc2V0Q29udGV4dChuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmxvZ2dlci5zZXRDb250ZXh0KG5hbWUpO1xuICB9XG5cbiAgdmVyYm9zZShtZXNzYWdlOiBhbnksIGNvbnRleHQ/OiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgaWYgKGNvbnRleHQpIHtcbiAgICAgIHRoaXMubG9nZ2VyLnRyYWNlKHsgW3RoaXMuY29udGV4dE5hbWVdOiBjb250ZXh0LCBwcm9jZXNzOiBnZXRQcm9jZXNzTmFtZSgpIH0sIG1lc3NhZ2UsIC4uLmFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxvZ2dlci50cmFjZShtZXNzYWdlLCAuLi5hcmdzKTtcbiAgICB9XG4gIH1cblxuICBkZWJ1ZyhtZXNzYWdlOiBhbnksIGNvbnRleHQ/OiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgaWYgKGNvbnRleHQpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKHsgW3RoaXMuY29udGV4dE5hbWVdOiBjb250ZXh0LCBwcm9jZXNzOiBnZXRQcm9jZXNzTmFtZSgpIH0sIG1lc3NhZ2UsIC4uLmFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxvZ2dlci5kZWJ1ZyhtZXNzYWdlLCAuLi5hcmdzKTtcbiAgICB9XG4gIH1cblxuICBsb2cobWVzc2FnZTogYW55LCBjb250ZXh0Pzogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkge1xuICAgIGlmIChjb250ZXh0KSB7XG4gICAgICB0aGlzLmxvZ2dlci5pbmZvKHsgW3RoaXMuY29udGV4dE5hbWVdOiBjb250ZXh0LCBwcm9jZXNzOiBnZXRQcm9jZXNzTmFtZSgpIH0sIG1lc3NhZ2UsIC4uLmFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxvZ2dlci5pbmZvKG1lc3NhZ2UsIC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHdhcm4obWVzc2FnZTogYW55LCBjb250ZXh0Pzogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkge1xuICAgIGlmIChjb250ZXh0KSB7XG4gICAgICB0aGlzLmxvZ2dlci53YXJuKHsgW3RoaXMuY29udGV4dE5hbWVdOiBjb250ZXh0LCBwcm9jZXNzOiBnZXRQcm9jZXNzTmFtZSgpIH0sIG1lc3NhZ2UsIC4uLmFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxvZ2dlci53YXJuKG1lc3NhZ2UsIC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIGVycm9yKG1lc3NhZ2U6IGFueSwgdHJhY2U/OiBzdHJpbmcsIGNvbnRleHQ/OiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgaWYgKGNvbnRleHQpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKHsgW3RoaXMuY29udGV4dE5hbWVdOiBjb250ZXh0LCB0cmFjZSwgcHJvY2VzczogZ2V0UHJvY2Vzc05hbWUoKSB9LCBtZXNzYWdlLCAuLi5hcmdzKTtcbiAgICB9IGVsc2UgaWYgKHRyYWNlKSB7XG4gICAgICB0aGlzLmxvZ2dlci5lcnJvcih7IHRyYWNlIH0sIG1lc3NhZ2UsIC4uLmFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxvZ2dlci5lcnJvcihtZXNzYWdlLCAuLi5hcmdzKTtcbiAgICB9XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIkBuZXN0anMvY29tbW9uXCIpOzsiLCJpbXBvcnQgeyBUc1dvcmtlck5hbWUgfSBmcm9tICdAdHMtc2RrL2NvbnN0YW50JztcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFByb2Nlc3NOYW1lKCkge1xuICByZXR1cm4gYCR7Z2V0V29ya2VyTmFtZSgpfS0ke3Byb2Nlc3MucGlkfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRXb3JrZXJOYW1lKCk6IFRzV29ya2VyTmFtZSB7XG4gIHJldHVybiBwcm9jZXNzLmVudi5UU19XT1JLRVJfTkFNRSBhcyBUc1dvcmtlck5hbWU7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGRlbGF5KHRpbWU6IG51bWJlcikge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgdGltZSkpO1xufSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm5lc3Rqcy1waW5vXCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJuZXN0anMtZXRoZXJzXCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAbmVzdGpzL2NvbmZpZ1wiKTs7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQGFuY2hhbjgyOC9uZXN0LWJ1bGxtcVwiKTs7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYnVsbG1xXCIpOzsiLCJpbXBvcnQgeyBHbG9iYWwsIE1vZHVsZSB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IExvZ2dlck1vZHVsZSBhcyBQaW5vTG9nZ2VyTW9kdWxlIH0gZnJvbSAnbmVzdGpzLXBpbm8nO1xuaW1wb3J0IHsgc3RkVGltZUZ1bmN0aW9ucyB9IGZyb20gJ3Bpbm8nO1xuaW1wb3J0ICogYXMgdXVpZCBmcm9tICd1dWlkJztcbmltcG9ydCB7IEZha2VMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi9hZGFwdGVycy9mYWtlL0Zha2VMb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBQaW5vTG9nZ2VyU2VydmljZSB9IGZyb20gJy4vYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UnO1xuXG5kZWNsYXJlIG1vZHVsZSAnaHR0cCcge1xuICBpbnRlcmZhY2UgSW5jb21pbmdNZXNzYWdlIHtcbiAgICByZXF1ZXN0SWQ6IHN0cmluZztcbiAgfVxufVxuXG5AR2xvYmFsKClcbkBNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgUGlub0xvZ2dlck1vZHVsZS5mb3JSb290KHtcbiAgICAgIHBpbm9IdHRwOiB7XG4gICAgICAgIG5hbWU6ICdBUEknLFxuICAgICAgICBsZXZlbDogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyA/ICdkZWJ1ZycgOiAnaW5mbycsXG4gICAgICAgIGdlblJlcUlkOiAocmVxKSA9PiByZXEucmVxdWVzdElkIHx8IHV1aWQudjQoKSxcbiAgICAgICAgZm9ybWF0dGVyczogeyBiaW5kaW5nczogKCkgPT4gKHt9KSB9LFxuICAgICAgICAvLyByZWRhY3RcbiAgICAgICAgdGltZXN0YW1wOiBzdGRUaW1lRnVuY3Rpb25zLnVuaXhUaW1lLFxuICAgICAgfSxcbiAgICB9KSxcbiAgXSxcbiAgcHJvdmlkZXJzOiBbRmFrZUxvZ2dlclNlcnZpY2UsIFBpbm9Mb2dnZXJTZXJ2aWNlXSxcbiAgZXhwb3J0czogW0Zha2VMb2dnZXJTZXJ2aWNlLCBQaW5vTG9nZ2VyU2VydmljZV0sXG59KVxuZXhwb3J0IGNsYXNzIExvZ2dlck1vZHVsZSB7fVxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicGlub1wiKTs7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidXVpZFwiKTs7IiwiaW1wb3J0IHsgQ29uc29sZUxvZ2dlciB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcblxuZXhwb3J0IGNsYXNzIEZha2VMb2dnZXJTZXJ2aWNlIGV4dGVuZHMgQ29uc29sZUxvZ2dlciB7XG4gIHJlYWRvbmx5IGNvbnRleHROYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgbG9nZ2VyOiBudWxsKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmNvbnRleHROYW1lID0gJ2NvbnRleHQnO1xuICB9XG5cbiAgcHVibGljIGxvZyA9ICgpID0+IHt9O1xuICBwdWJsaWMgZGVidWcgPSAoKSA9PiB7fTtcbiAgcHVibGljIHZlcmJvc2UgPSAoKSA9PiB7fTtcbiAgcHVibGljIGluZm8gPSAoKSA9PiB7fTtcbiAgcHVibGljIHdhcm4gPSAoKSA9PiB7fTtcbiAgcHVibGljIGVycm9yID0gKCkgPT4ge307XG4gIHB1YmxpYyBzZXRDb250ZXh0ID0gKCkgPT4ge307XG59XG4iLCJpbXBvcnQgeyBCdWxsTW9kdWxlIH0gZnJvbSAnQGFuY2hhbjgyOC9uZXN0LWJ1bGxtcSc7XG5pbXBvcnQgeyBNb2R1bGUgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBDb25maWdNb2R1bGUsIENvbmZpZ1NlcnZpY2UgfSBmcm9tICdAbmVzdGpzL2NvbmZpZyc7XG5cbkBNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgQnVsbE1vZHVsZS5mb3JSb290QXN5bmMoe1xuICAgICAgaW1wb3J0czogW0NvbmZpZ01vZHVsZV0sXG4gICAgICBpbmplY3Q6IFtDb25maWdTZXJ2aWNlXSxcbiAgICAgIHVzZUZhY3Rvcnk6IGFzeW5jIChjb25maWdTZXJ2aWNlOiBDb25maWdTZXJ2aWNlKSA9PiAoe1xuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgY29ubmVjdGlvbjoge1xuICAgICAgICAgICAgaG9zdDogY29uZmlnU2VydmljZS5nZXQoJ0JVTExfUVVFVUVfUkVESVNfSE9TVCcpLFxuICAgICAgICAgICAgcG9ydDogY29uZmlnU2VydmljZS5nZXQ8bnVtYmVyPignQlVMTF9RVUVVRV9SRURJU19QT1JUJywgNjM3OSksXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICB9KSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQnVsbFF1ZXVlTW9kdWxlIHt9XG4iLCJpbXBvcnQgeyBQaW5vTG9nZ2VyU2VydmljZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2FkYXB0ZXJzL3JlYWwvcGlub0xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IExvZ2dlck1vZHVsZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2xvZ2dlci5tb2R1bGUnO1xuaW1wb3J0IHsgR2xvYmFsLCBNb2R1bGUgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBDb25maWdNb2R1bGUsIENvbmZpZ1NlcnZpY2UgfSBmcm9tICdAbmVzdGpzL2NvbmZpZyc7XG5pbXBvcnQgeyBUeXBlT3JtTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy90eXBlb3JtJztcbmltcG9ydCB7IEFjY291bnRNb2R1bGUgfSBmcm9tICdAY29tbW9uL3RzLXR5cGVvcm0vYWNjb3VudC9hY2NvdW50Lm1vZHVsZSc7XG5pbXBvcnQgeyBBdWN0aW9uT3JkZXJNb3VkbGUgfSBmcm9tICdAY29tbW9uL3RzLXR5cGVvcm0vYXVjdGlvbk9yZGVyL2F1Y3Rpb25PcmRlci5tb2R1bGUnO1xuaW1wb3J0IHsgUm9sbHVwTW9kdWxlIH0gZnJvbSAnQGNvbW1vbi90cy10eXBlb3JtL3JvbGx1cC9yb2xsdXAubW9kdWxlJztcbkBHbG9iYWwoKVxuQE1vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBDb25maWdNb2R1bGUsXG4gICAgTG9nZ2VyTW9kdWxlLFxuICAgIFR5cGVPcm1Nb2R1bGUuZm9yUm9vdEFzeW5jKHtcbiAgICAgIGltcG9ydHM6IFtDb25maWdNb2R1bGVdLFxuICAgICAgaW5qZWN0OiBbQ29uZmlnU2VydmljZV0sXG4gICAgICB1c2VGYWN0b3J5OiAoY29uZmlnU2VydmljZTogQ29uZmlnU2VydmljZSkgPT4ge1xuICAgICAgICBjb25zdCBpc1Byb2R1Y3Rpb24gPSBjb25maWdTZXJ2aWNlLmdldCgnTk9ERV9FTlYnKSA9PT0gJ3Byb2QnO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHNzbDogaXNQcm9kdWN0aW9uLFxuICAgICAgICAgIGV4dHJhOiB7XG4gICAgICAgICAgICBzc2w6IGlzUHJvZHVjdGlvbj8geyByZWplY3RVbmF1dGhvcml6ZWQ6IGZhbHNlIH0gOiBudWxsLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgdHlwZTogJ3Bvc3RncmVzJyxcbiAgICAgICAgICBob3N0OiBjb25maWdTZXJ2aWNlLmdldDxzdHJpbmc+KCdEQl9IT1NUJywgJycpLFxuICAgICAgICAgIHBvcnQ6IGNvbmZpZ1NlcnZpY2UuZ2V0PG51bWJlcj4oJ0RCX1BPUlQnLCA1NDMyKSxcbiAgICAgICAgICB1c2VybmFtZTogY29uZmlnU2VydmljZS5nZXQ8c3RyaW5nPignREJfVVNFUicsICcnKSxcbiAgICAgICAgICBwYXNzd29yZDogY29uZmlnU2VydmljZS5nZXQ8c3RyaW5nPignREJfUEFTU1dEJywgJycpLFxuICAgICAgICAgIGRhdGFiYXNlOiBjb25maWdTZXJ2aWNlLmdldDxzdHJpbmc+KCdEQl9OQU1FJywgJycpLFxuICAgICAgICAgIGF1dG9Mb2FkRW50aXRpZXM6IHRydWUsXG4gICAgICAgICAgc3luY2hyb25pemU6IGNvbmZpZ1NlcnZpY2UuZ2V0PHN0cmluZz4oJ05PREVfRU5WJywgJ2RldicpID09ICdkZXYnLFxuICAgICAgICAgIC8vIHN1YnNjcmliZXJzOiBbXG4gICAgICAgICAgLy8gICBUcmFuc2FjdGlvblN1YnNjcmliZXIsXG4gICAgICAgICAgLy8gXVxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICB9KSxcbiAgICAvLyBBY2NvdW50TW9kdWxlLFxuICAgIEFjY291bnRNb2R1bGUsIEF1Y3Rpb25PcmRlck1vdWRsZSwgUm9sbHVwTW9kdWxlXG4gIF0sXG4gIHByb3ZpZGVyczogW1xuICAgIFR5cGVPcm1Nb2R1bGUsXG4gICAgUGlub0xvZ2dlclNlcnZpY2VcbiAgXSxcbiAgZXhwb3J0czogW1R5cGVPcm1Nb2R1bGVdXG59KVxuZXhwb3J0IGNsYXNzIFRzVHlwZU9ybU1vZHVsZSB7fVxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQG5lc3Rqcy90eXBlb3JtXCIpOzsiLCJpbXBvcnQgeyBHbG9iYWwsIE1vZHVsZSB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IENvbmZpZ01vZHVsZSB9IGZyb20gJ0BuZXN0anMvY29uZmlnJztcbmltcG9ydCB7IFR5cGVPcm1Nb2R1bGUgfSBmcm9tICdAbmVzdGpzL3R5cGVvcm0nO1xuaW1wb3J0IHsgT2JzT3JkZXJUcmVlU2VydmljZSB9IGZyb20gJy4uL2F1Y3Rpb25PcmRlci9vYnNPcmRlclRyZWUuc2VydmljZSc7XG5pbXBvcnQgeyBBY2NvdW50SW5mb3JtYXRpb24gfSBmcm9tICcuL2FjY291bnRJbmZvcm1hdGlvbi5lbnRpdHknO1xuaW1wb3J0IHsgQWNjb3VudExlYWZOb2RlIH0gZnJvbSAnLi9hY2NvdW50TGVhZk5vZGUuZW50aXR5JztcbmltcG9ydCB7IEFjY291bnRNZXJrbGVUcmVlTm9kZSB9IGZyb20gJy4vYWNjb3VudE1lcmtsZVRyZWVOb2RlLmVudGl0eSc7XG5pbXBvcnQgeyBCbG9ja0luZm9ybWF0aW9uIH0gZnJvbSAnLi9ibG9ja0luZm9ybWF0aW9uLmVudGl0eSc7XG5pbXBvcnQgeyBNZXJrbGVUcmVlQ29udHJvbGxlciB9IGZyb20gJy4vbWVya2xlVHJlZS5jb250cm9sbGVyJztcbi8vIGltcG9ydCB7IE1lcmtsZVRyZWVDb250cm9sbGVyIH0gZnJvbSAnLi9tZXJrbGVUcmVlLmNvbnRyb2xsZXInO1xuaW1wb3J0IHsgVG9rZW5MZWFmTm9kZSB9IGZyb20gJy4vdG9rZW5MZWFmTm9kZS5lbnRpdHknO1xuaW1wb3J0IHsgVG9rZW5NZXJrbGVUcmVlTm9kZSB9IGZyb20gJy4vdG9rZW5NZXJrbGVUcmVlTm9kZS5lbnRpdHknO1xuaW1wb3J0IHsgVHJhbnNhY3Rpb25JbmZvIH0gZnJvbSAnLi90cmFuc2FjdGlvbkluZm8uZW50aXR5JztcbmltcG9ydCB7IFRzQWNjb3VudFRyZWVTZXJ2aWNlIH0gZnJvbSAnLi90c0FjY291bnRUcmVlLnNlcnZpY2UnO1xuaW1wb3J0IHsgVHNUb2tlblRyZWVTZXJ2aWNlIH0gZnJvbSAnLi90c1Rva2VuVHJlZS5zZXJ2aWNlJztcbkBHbG9iYWwoKVxuQE1vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBDb25maWdNb2R1bGUuZm9yUm9vdCgpLFxuICAgIFR5cGVPcm1Nb2R1bGUuZm9yRmVhdHVyZShbXG4gICAgICBBY2NvdW50SW5mb3JtYXRpb24sXG4gICAgICBBY2NvdW50TGVhZk5vZGUsIFxuICAgICAgQWNjb3VudE1lcmtsZVRyZWVOb2RlLCBcbiAgICAgIFRva2VuTWVya2xlVHJlZU5vZGUsIFxuICAgICAgVG9rZW5MZWFmTm9kZSxcbiAgICAgIFRyYW5zYWN0aW9uSW5mbyxcbiAgICAgIEJsb2NrSW5mb3JtYXRpb25cbiAgICBdKVxuICBdLFxuICBwcm92aWRlcnM6IFtUc0FjY291bnRUcmVlU2VydmljZSwgVHNUb2tlblRyZWVTZXJ2aWNlLCBPYnNPcmRlclRyZWVTZXJ2aWNlXSxcbiAgY29udHJvbGxlcnM6IFtNZXJrbGVUcmVlQ29udHJvbGxlcl0sXG4gIGV4cG9ydHM6IFtUeXBlT3JtTW9kdWxlXVxufSlcbmV4cG9ydCBjbGFzcyBBY2NvdW50TW9kdWxle30iLCJpbXBvcnQgeyBJbmplY3RhYmxlLCBMb2dnZXIgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBDb25maWdTZXJ2aWNlIH0gZnJvbSAnQG5lc3Rqcy9jb25maWcnO1xuaW1wb3J0IHsgSW5qZWN0UmVwb3NpdG9yeSB9IGZyb20gJ0BuZXN0anMvdHlwZW9ybSc7XG5pbXBvcnQgeyBDb25uZWN0aW9uLCBSZXBvc2l0b3J5IH0gZnJvbSAndHlwZW9ybSc7XG5pbXBvcnQgeyB0b1RyZWVMZWFmLCB0c0hhc2hGdW5jIH0gZnJvbSAnLi4vY29tbW9uL3RzLWhlbHBlcic7XG5pbXBvcnQgeyBUc01lcmtsZVRyZWUgfSBmcm9tICcuLi9jb21tb24vdHNNZXJrbGVUcmVlJztcbmltcG9ydCB7IFVwZGF0ZU9ic09yZGVyVHJlZUR0byB9IGZyb20gJy4vZHRvL3VwZGF0ZU9ic09yZGVyVHJlZS5kdG8nO1xuaW1wb3J0IHsgT2JzT3JkZXJMZWFmRW50aXR5IH0gZnJvbSAnLi9vYnNPcmRlckxlYWYuZW50aXR5JztcbmltcG9ydCB7IE9ic09yZGVyTGVhZk1lcmtsZVRyZWVOb2RlIH0gZnJvbSAnLi9vYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZS5lbnRpdHknO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgT2JzT3JkZXJUcmVlU2VydmljZSBleHRlbmRzIFRzTWVya2xlVHJlZTxPYnNPcmRlckxlYWZFbnRpdHk+IHtcbiAgcHJpdmF0ZSBsb2dnZXI6IExvZ2dlciA9IG5ldyBMb2dnZXIoT2JzT3JkZXJUcmVlU2VydmljZS5uYW1lKTtcbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdFJlcG9zaXRvcnkoT2JzT3JkZXJMZWFmRW50aXR5KVxuICAgIHByaXZhdGUgcmVhZG9ubHkgb2JzT3JkZXJMZWFmUmVwb3NpdG9yeTogUmVwb3NpdG9yeTxPYnNPcmRlckxlYWZFbnRpdHk+LFxuICAgIEBJbmplY3RSZXBvc2l0b3J5KE9ic09yZGVyTGVhZk1lcmtsZVRyZWVOb2RlKVxuICAgIHByaXZhdGUgcmVhZG9ubHkgb2JzT3JkZXJNZXJrbGVUcmVlUmVwb3NpdG9yeTogUmVwb3NpdG9yeTxPYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZT4sXG4gICAgcHJpdmF0ZSByZWFkb25seSBjb25uZWN0aW9uOiBDb25uZWN0aW9uLFxuICAgIHByaXZhdGUgY29uZmlnU2VydmljZTogQ29uZmlnU2VydmljZSxcbiAgKSB7XG4gICAgY29uc29sZS50aW1lKCdpbml0IG9yZGVyIHRyZWUnKTtcbiAgICBzdXBlcihjb25maWdTZXJ2aWNlLmdldDxudW1iZXI+KCdPUkRFUl9UUkVFX0hFSUdIVCcsIDMyKSwgdHNIYXNoRnVuYyk7XG4gICAgY29uc29sZS50aW1lRW5kKCdpbml0IG9yZGVyIHRyZWUnKTtcbiAgfVxuICBhc3luYyB1cGRhdGVMZWFmKGxlYWZJZDogYmlnaW50LCB2YWx1ZTogVXBkYXRlT2JzT3JkZXJUcmVlRHRvKSB7XG4gICAgY29uc29sZS50aW1lKCd1cGRhdGVMZWFmIGZvciBvYnNPcmRlciB0cmVlJyk7XG4gICAgY29uc3QgcHJmID0gdGhpcy5nZXRQcm9vZklkcyhsZWFmSWQpO1xuICAgIGNvbnN0IGlkID0gdGhpcy5nZXRMZWFmSWRJblRyZWUobGVhZklkKTtcbiAgICAvLyBzZXR1cCB0cmFuc2FjdGlvblxuICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi50cmFuc2FjdGlvbihhc3luYyAobWFuYWdlcikgPT4ge1xuICAgICAgYXdhaXQgbWFuYWdlci51cHNlcnQoT2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUsIHtcbiAgICAgICAgaWQ6IGlkLnRvU3RyaW5nKCksXG4gICAgICAgIGxlYWZJZDogbGVhZklkLFxuICAgICAgICBoYXNoOiBCaWdJbnQodG9UcmVlTGVhZihbXG4gICAgICAgICAgQmlnSW50KHZhbHVlLnR4SWQpLFxuICAgICAgICAgIEJpZ0ludCh2YWx1ZS5yZXFUeXBlKSxcbiAgICAgICAgICBCaWdJbnQodmFsdWUuc2VuZGVyKSxcbiAgICAgICAgICBCaWdJbnQodmFsdWUuc2VsbFRva2VuSWQpLFxuICAgICAgICAgIEJpZ0ludCh2YWx1ZS5zZWxsQW10KSxcbiAgICAgICAgICBCaWdJbnQodmFsdWUubm9uY2UpLFxuICAgICAgICAgIEJpZ0ludCh2YWx1ZS5idXlUb2tlbklkKSxcbiAgICAgICAgICBCaWdJbnQodmFsdWUuYnV5QW10KSxcbiAgICAgICAgICBCaWdJbnQodmFsdWUuYWNjdW11bGF0ZWRTZWxsQW10KSxcbiAgICAgICAgICBCaWdJbnQodmFsdWUuYWNjdW11bGF0ZWRCdXlBbXQpLFxuICAgICAgICAgIEJpZ0ludCh2YWx1ZS5vcmRlcklkKVxuICAgICAgICBdKSlcbiAgICAgIH0sIFsnaWQnXSk7XG4gICAgICBhd2FpdCBtYW5hZ2VyLnVwc2VydChPYnNPcmRlckxlYWZFbnRpdHksIHtcbiAgICAgICAgb3JkZXJMZWFmSWQ6QmlnSW50KHZhbHVlLm9yZGVyTGVhZklkKSxcbiAgICAgICAgdHhJZDogTnVtYmVyKHZhbHVlLnR4SWQpLFxuICAgICAgICByZXFUeXBlOiBOdW1iZXIodmFsdWUucmVxVHlwZSksXG4gICAgICAgIHNlbmRlcjogQmlnSW50KHZhbHVlLnNlbmRlciksXG4gICAgICAgIHNlbGxUb2tlbklkOiBCaWdJbnQodmFsdWUuc2VsbFRva2VuSWQpLFxuICAgICAgICBzZWxsQW10OiBCaWdJbnQodmFsdWUuc2VsbEFtdCksXG4gICAgICAgIG5vbmNlOiBCaWdJbnQodmFsdWUubm9uY2UpLFxuICAgICAgICBidXlUb2tlbklkOiBCaWdJbnQodmFsdWUuYnV5VG9rZW5JZCksXG4gICAgICAgIGJ1eUFtdDogQmlnSW50KHZhbHVlLmJ1eUFtdCksXG4gICAgICAgIGFjY3VtdWxhdGVkU2VsbEFtdDogQmlnSW50KHZhbHVlLmFjY3VtdWxhdGVkU2VsbEFtdCksXG4gICAgICAgIGFjY3VtdWxhdGVkQnV5QW10OiBCaWdJbnQodmFsdWUuYWNjdW11bGF0ZWRCdXlBbXQpLFxuICAgICAgICBvcmRlcklkOiBOdW1iZXIodmFsdWUub3JkZXJJZClcbiAgICAgIH0sIFsnb3JkZXJMZWFmSWQnXSk7XG4gICAgICAvLyB1cGRhdGUgdHJlZVxuICAgICAgZm9yIChsZXQgaSA9IGlkLCBqID0gMDsgaSA+IDFuOyBpID0gaSA+PiAxbikge1xuICAgICAgICBjb25zdCBbaVZhbHVlLCBqVmFsdWVdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgIHRoaXMub2JzT3JkZXJNZXJrbGVUcmVlUmVwb3NpdG9yeS5maW5kT25lQnkoe2lkOiBpLnRvU3RyaW5nKCl9KSxcbiAgICAgICAgICB0aGlzLm9ic09yZGVyTWVya2xlVHJlZVJlcG9zaXRvcnkuZmluZE9uZUJ5KHtpZDogcHJmW2pdLnRvU3RyaW5nKCl9KVxuICAgICAgICBdKTtcbiAgICAgICAgY29uc3QgakxldmVsID0gTWF0aC5mbG9vcihNYXRoLmxvZzIoTnVtYmVyKHByZltqXSkpKTtcbiAgICAgICAgY29uc3QgaUxldmVsID0gTWF0aC5mbG9vcihNYXRoLmxvZzIoTnVtYmVyKGkpKSk7XG4gICAgICAgIGNvbnN0IGpIYXNoVmFsdWU6IHN0cmluZyA9IChqVmFsdWUgPT0gbnVsbCk/IHRoaXMuZ2V0RGVmYXVsdEhhc2hCeUxldmVsKGpMZXZlbCk6IGpWYWx1ZS5oYXNoLnRvU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IGlIYXNoVmFsdWU6IHN0cmluZyA9IChpVmFsdWUgPT0gbnVsbCk/IHRoaXMuZ2V0RGVmYXVsdEhhc2hCeUxldmVsKGlMZXZlbCk6IGlWYWx1ZS5oYXNoLnRvU3RyaW5nKCk7XG4gICAgICAgIGxldCByID0gKGlkICUgMm4gPT0gMG4pID9bIGpIYXNoVmFsdWUsIGlIYXNoVmFsdWVdIDogWyBpSGFzaFZhbHVlLCBqSGFzaFZhbHVlXTtcbiAgICAgICAgY29uc3QgaGFzaCA9IHRoaXMuaGFzaEZ1bmMocik7XG4gICAgICAgIGNvbnN0IGpvYnMgPSBbXTtcbiAgICAgICAgaWYgKGlWYWx1ZSA9PSBudWxsKSB7XG4gICAgICAgICAgam9icy5wdXNoKG1hbmFnZXIudXBzZXJ0KE9ic09yZGVyTGVhZk1lcmtsZVRyZWVOb2RlLCB7XG4gICAgICAgICAgICBpZDogaS50b1N0cmluZygpLFxuICAgICAgICAgICAgaGFzaDogQmlnSW50KGlIYXNoVmFsdWUpXG4gICAgICAgICAgfSwgWydpZCddKSk7XG4gICAgICAgIH0gXG4gICAgICAgIGlmIChqVmFsdWUgPT0gbnVsbCAmJiBqIDwgcHJmLmxlbmd0aCkge1xuICAgICAgICAgIGpvYnMucHVzaChtYW5hZ2VyLnVwc2VydChPYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZSwge1xuICAgICAgICAgICAgaWQ6IHByZltqXS50b1N0cmluZygpLFxuICAgICAgICAgICAgaGFzaDogQmlnSW50KGpIYXNoVmFsdWUpXG4gICAgICAgICAgfSwgWydpZCddKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXBkYXRlUm9vdCA9IGkgPj4gMW47XG4gICAgICAgIGlmICggdXBkYXRlUm9vdCA+PSAxbikge1xuICAgICAgICAgIGpvYnMucHVzaChtYW5hZ2VyLnVwc2VydChPYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZSwge1xuICAgICAgICAgICAgaWQ6IHVwZGF0ZVJvb3QudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIGhhc2g6IEJpZ0ludChoYXNoKVxuICAgICAgICAgIH0sIFsnaWQnXSkpO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKGpvYnMpO1xuICAgICAgICBqKys7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY29uc29sZS50aW1lRW5kKCd1cGRhdGVMZWFmIGZvciBvYnNPcmRlciB0cmVlJyk7XG4gIH1cbiAgYXN5bmMgZ2V0TGVhZihsZWFmX2lkOiBiaWdpbnQsIG90aGVyUGF5bG9hZDogYW55KTogUHJvbWlzZTxPYnNPcmRlckxlYWZFbnRpdHkgfCBudWxsPiB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5vYnNPcmRlckxlYWZSZXBvc2l0b3J5LmZpbmRPbmVCeSh7XG4gICAgICBvcmRlckxlYWZJZDogbGVhZl9pZFxuICAgIH0pO1xuICAgIGlmIChyZXN1bHQgPT0gbnVsbCkge1xuICAgICAgLy8gY2hlY2sgbGV2ZWxcbiAgICAgIGNvbnN0IGlkID0gdGhpcy5nZXRMZWFmSWRJblRyZWUobGVhZl9pZCk7XG4gICAgICBjb25zdCBsZXZlbCA9IE1hdGguZmxvb3IoTWF0aC5sb2cyKE51bWJlcihpZCkpKTtcbiAgICAgIGNvbnN0IGhhc2ggPSB0aGlzLmdldERlZmF1bHRIYXNoQnlMZXZlbChsZXZlbCk7XG4gICAgICAvLyBzZXR1cCB0cmFuc2FjdGlvblxuICAgICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLnRyYW5zYWN0aW9uKGFzeW5jIChtYW5hZ2VyKSA9PiB7XG4gICAgICAgIC8vIGluc2VydCB0aGlzIG51bGwgaGFzaCBvbiB0aGlzIG5vZGVcbiAgICAgICAgYXdhaXQgbWFuYWdlci5pbnNlcnQoT2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUsIHtcbiAgICAgICAgICBsZWFmSWQ6IGxlYWZfaWQsXG4gICAgICAgICAgaWQ6IGlkLnRvU3RyaW5nKCksXG4gICAgICAgICAgaGFzaDogQmlnSW50KGhhc2gpLFxuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgbWFuYWdlci5pbnNlcnQoT2JzT3JkZXJMZWFmRW50aXR5LCB7XG4gICAgICAgICAgb3JkZXJMZWFmSWQ6IGxlYWZfaWQsXG4gICAgICAgIH0pXG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzLm9ic09yZGVyTGVhZlJlcG9zaXRvcnkuZmluZE9uZUJ5KHtcbiAgICAgICAgb3JkZXJMZWFmSWQ6IGxlYWZfaWRcbiAgICAgIH0pOyBcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBhc3luYyBnZXRSb290KCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMub2JzT3JkZXJNZXJrbGVUcmVlUmVwb3NpdG9yeS5maW5kT25lKHtcbiAgICAgIHdoZXJlOiB7XG4gICAgICAgIGlkOiAxbi50b1N0cmluZygpLFxuICAgICAgfSAgICAgICBcbiAgICB9KTtcbiAgICBpZiAocmVzdWx0ID09IG51bGwpIHtcbiAgICAgIGNvbnN0IGhhc2ggPSBhd2FpdCB0aGlzLmdldERlZmF1bHRIYXNoQnlMZXZlbCgxKTtcbiAgICAgIGF3YWl0IHRoaXMub2JzT3JkZXJNZXJrbGVUcmVlUmVwb3NpdG9yeS5pbnNlcnQoe1xuICAgICAgICBpZDogMW4udG9TdHJpbmcoKSxcbiAgICAgICAgaGFzaDogQmlnSW50KGhhc2gpLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpZDogMW4udG9TdHJpbmcoKSxcbiAgICAgICAgaGFzaDogaGFzaFxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHJlc3VsdC5pZCxcbiAgICAgIGhhc2g6IHJlc3VsdC5oYXNoLnRvU3RyaW5nKClcbiAgICB9O1xuICB9XG4gIGdldExlYWZEZWZhdWx0VmF2bHVlKCk6IHN0cmluZyB7XG4gICAgLy8gVE9ETzogQGFibmVyIHBsZWFzZSBoZWxwIG1lIHRvIGNoZWNrIGlzIHRoZSBvcmRlciBpcyByaWdodD9cbiAgICByZXR1cm4gdG9UcmVlTGVhZihbXG4gICAgICAwbiwgLy8gdHhJZFxuICAgICAgMG4sIC8vIHJlcVR5cGVcbiAgICAgIDBuLCAvLyBzZW5kZXJcbiAgICAgIDBuLCAvLyBzZWxsVG9rZW5JZFxuICAgICAgMG4sIC8vIHNlbGxBbXRcbiAgICAgIDBuLCAvLyBub25jZVxuICAgICAgMG4sIC8vIGJ1eVRva2VuSWRcbiAgICAgIDBuLCAvLyBidXlBbXRcbiAgICAgIDBuLCAvLyBhY2N1bXVsYXRlZFNlbGxBbXRcbiAgICAgIDBuLCAvLyBhY2N1bXVsYXRlZEJ1eUFtdFxuICAgICAgMG4sIC8vIG9yZGVySWRcbiAgICBdKTtcbiAgfVxufSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInR5cGVvcm1cIik7OyIsImltcG9ydCB7IEJ5dGVzTGlrZSB9IGZyb20gJ2V0aGVycyc7XG5pbXBvcnQgeyBkcFBvc2VpZG9uSGFzaCB9IGZyb20gJy4vcG9zZWlkZW4taGFzaC1kcCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBiaWdpbnRfdG9faGV4KHg6IGJpZ2ludCkge1xuICByZXR1cm4gJzB4JyArIHgudG9TdHJpbmcoMTYpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9UcmVlTGVhZihpbnB1dHM6IGJpZ2ludFtdKSB7XG4gIHJldHVybiBiaWdpbnRfdG9faGV4KGRwUG9zZWlkb25IYXNoKGlucHV0cykpO1xufVxuXG5mdW5jdGlvbiBwb3NlaWRvbkhhc2godmFsIDogQnl0ZXNMaWtlIHwgQnl0ZXNMaWtlW10pOiBzdHJpbmcge1xuICBpZiAodmFsIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICBjb25zdCBpbnB1dHMgPSB2YWwubWFwKCh2IDogYW55KSA9PiBCaWdJbnQodikpO1xuICAgIHJldHVybiBiaWdpbnRfdG9faGV4KGRwUG9zZWlkb25IYXNoKGlucHV0cykpO1xuICB9XG5cbiAgcmV0dXJuICBiaWdpbnRfdG9faGV4KGRwUG9zZWlkb25IYXNoKFtCaWdJbnQodmFsLnRvU3RyaW5nKCkpXSkpO1xufVxuXG5leHBvcnQgY29uc3QgdHNIYXNoRnVuYyA9IHBvc2VpZG9uSGFzaDtcbiIsImltcG9ydCB7cG9zZWlkb259IGZyb20gJ0BiaWctd2hhbGUtbGFicy9wb3NlaWRvbic7XG5cbmNsYXNzIGRwUG9zZWlkb25DYWNoZSB7XG4gIHN0YXRpYyBjYWNoZSA9IG5ldyBNYXAoKTtcblxuICBzdGF0aWMgZ2V0Q2FjaGUoeCA6IGJpZ2ludCB8IHN0cmluZyB8IGJpZ2ludFtdKTogbnVsbCB8IGJpZ2ludCB7XG4gICAgaWYgKHggaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgY29uc3Qga2V5ID0geC5qb2luKCk7XG4gICAgICByZXR1cm4gZHBQb3NlaWRvbkNhY2hlLmdldENhY2hlKGtleSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRwUG9zZWlkb25DYWNoZVxuICAgICAgLmNhY2hlXG4gICAgICAuZ2V0KHgpO1xuICB9XG5cbiAgc3RhdGljIHNldENhY2hlKHggOiBiaWdpbnQgfCBzdHJpbmcgfCBiaWdpbnRbXSwgdiA6IGJpZ2ludCkge1xuICAgIGlmICh4IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIGNvbnN0IGtleSA9IHguam9pbigpO1xuICAgICAgZHBQb3NlaWRvbkNhY2hlLnNldENhY2hlKGtleSwgdik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZHBQb3NlaWRvbkNhY2hlXG4gICAgICAuY2FjaGVcbiAgICAgIC5zZXQoeCwgdik7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRwUG9zZWlkb25IYXNoKGlucHV0cyA6IGJpZ2ludFtdLCBpc0RwRW5hYmxlZCA9IHRydWUpOiBiaWdpbnQge1xuICBpZiAoaXNEcEVuYWJsZWQpIHtcbiAgICBjb25zdCBjYWNoZSA9IGRwUG9zZWlkb25DYWNoZS5nZXRDYWNoZShpbnB1dHMpO1xuICAgIGlmIChjYWNoZSkge1xuICAgICAgcmV0dXJuIGNhY2hlO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlcyA9IHBvc2VpZG9uKGlucHV0cyk7XG4gIGlmIChpc0RwRW5hYmxlZCkge1xuICAgIGRwUG9zZWlkb25DYWNoZS5zZXRDYWNoZShpbnB1dHMsIHJlcyk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAYmlnLXdoYWxlLWxhYnMvcG9zZWlkb25cIik7OyIsImltcG9ydCB7IEJ5dGVzTGlrZSB9IGZyb20gJ2V0aGVycyc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBUc01lcmtsZVRyZWU8VD4ge1xuICAvLyB0cmVlSGVpZ2h0IGZvciBleHRlbmRcbiAgcHJpdmF0ZSB0cmVlSGVpZ3QhOiBudW1iZXI7XG4gIHByaXZhdGUgbGFzdExldmVsITogbnVtYmVyO1xuICBwcml2YXRlIGxldmVsc0RlZmF1bHRIYXNoITogTWFwPG51bWJlciwgc3RyaW5nPjtcbiAgcHVibGljIGhhc2hGdW5jITogKHg6IEJ5dGVzTGlrZXwgQnl0ZXNMaWtlW10pID0+IHN0cmluZztcbiAgY29uc3RydWN0b3IodHJlZUhlaWdodDogbnVtYmVyLCBoYXNoRnVuYzogKCh4OiBCeXRlc0xpa2V8IEJ5dGVzTGlrZVtdKSA9PiBzdHJpbmcpKSB7XG4gICAgdGhpcy50cmVlSGVpZ3QgPSBOdW1iZXIodHJlZUhlaWdodCk7XG4gICAgdGhpcy5oYXNoRnVuYyA9IGhhc2hGdW5jO1xuICAgIHRoaXMubGFzdExldmVsID0gTnVtYmVyKHRoaXMudHJlZUhlaWd0KTtcbiAgICB0aGlzLnNldExldmVsRGVmYXVsdEhhc2goKTtcbiAgfVxuICBhYnN0cmFjdCBnZXRMZWFmRGVmYXVsdFZhdmx1ZSgpOiBzdHJpbmc7XG4gIGFic3RyYWN0IHVwZGF0ZUxlYWYobGVhZklkOiBiaWdpbnQsIHZhbHVlOiBhbnksIG90aGVyUGF5bG9hZDogYW55KTogdm9pZDtcbiAgYWJzdHJhY3QgZ2V0TGVhZihsZWFmX2lkOiBiaWdpbnQsIG90aGVyUGF5bG9hZDogYW55KTogUHJvbWlzZTxUfG51bGw+O1xuICBnZXRQcm9vZklkcyhsZWFmX2lkOiBiaWdpbnQpIHtcbiAgICBjb25zdCBwcmY6IGJpZ2ludFtdID0gW107XG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy50cmVlSGVpZ3Q7XG4gICAgY29uc3QgbGVhZlN0YXJ0ID0gbGVhZl9pZCArICgxbiA8PCAgQmlnSW50KGhlaWdodCkpO1xuICAgIGZvciAobGV0IGkgPSBsZWFmU3RhcnQ7IGkgPiAxbjsgaSA9IGkgPj4gMW4pIHtcbiAgICAgIGlmICggaSAlIDJuID09IDBuKSB7XG4gICAgICAgIHByZi5wdXNoKGkgKyAxbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcmYucHVzaChpIC0gMW4pO1xuICAgICAgfSBcbiAgICB9XG4gICAgcmV0dXJuIHByZjtcbiAgfVxuICBhYnN0cmFjdCBnZXRSb290KG90aGVyUGF5bG9hZDogYW55KTogYW55OyBcbiAgLyoqXG4gICAqIGNhbGN1bGF0ZSBsZXZlbHMgZGVmYXVsdCBIYXNoXG4gICAqL1xuICBzZXRMZXZlbERlZmF1bHRIYXNoKCkge1xuICAgIHRoaXMubGV2ZWxzRGVmYXVsdEhhc2ggPSBuZXcgTWFwPG51bWJlciwgc3RyaW5nPigpO1xuICAgIHRoaXMubGV2ZWxzRGVmYXVsdEhhc2guc2V0KHRoaXMubGFzdExldmVsLCB0aGlzLmdldExlYWZEZWZhdWx0VmF2bHVlKCkpO1xuICAgIGZvcihsZXQgbGV2ZWwgPSB0aGlzLmxhc3RMZXZlbC0xOyBsZXZlbCA+PSAwIDsgbGV2ZWwtLSkge1xuICAgICAgY29uc3QgcHJldkxldmVsSGFzaCA9IHRoaXMubGV2ZWxzRGVmYXVsdEhhc2guZ2V0KGxldmVsKzEpO1xuICAgICAgaWYgKHByZXZMZXZlbEhhc2ggIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMubGV2ZWxzRGVmYXVsdEhhc2guc2V0KGxldmVsLCB0aGlzLmhhc2hGdW5jKFtwcmV2TGV2ZWxIYXNoLCBwcmV2TGV2ZWxIYXNoXSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXRMZWFmSWRJblRyZWUobGVhZklkOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbGVhZklkICsgKDFuIDw8IEJpZ0ludCh0aGlzLnRyZWVIZWlndCkpO1xuICB9XG4gIGdldExhc3RMZXZlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5sYXN0TGV2ZWw7XG4gIH1cbiAgZ2V0RGVmYXVsdEhhc2hCeUxldmVsKGxldmVsOiBudW1iZXIpOnN0cmluZyB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5sZXZlbHNEZWZhdWx0SGFzaC5nZXQobGV2ZWwpO1xuICAgIHJldHVybiByZXN1bHQ/IHJlc3VsdCA6ICcnO1xuICB9XG59IiwiaW1wb3J0IHsgQ29sdW1uLCBFbnRpdHksIEpvaW5Db2x1bW4sIE9uZVRvT25lLCBQcmltYXJ5Q29sdW1uLCBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uIH0gZnJvbSAndHlwZW9ybSc7XG5pbXBvcnQgeyBUc1R4VHlwZSB9IGZyb20gJy4uL2FjY291bnQvZHRvL3RzLXR5cGUnO1xuaW1wb3J0IHsgT2JzT3JkZXJFbnRpdHkgfSBmcm9tICcuL29ic09yZGVyLmVudGl0eSc7XG5pbXBvcnQgeyBPYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZSB9IGZyb20gJy4vb2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUuZW50aXR5JztcblxuQEVudGl0eSgnT2JzT3JkZXJMZWFmJywgeyBzY2hlbWE6ICdwdWJsaWMnIH0pXG5leHBvcnQgY2xhc3MgT2JzT3JkZXJMZWFmRW50aXR5IHtcbiAgQFByaW1hcnlDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnb3JkZXJMZWFmSWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBvcmRlckxlYWZJZCE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2ludDgnLFxuICAgIG5hbWU6ICd0eElkJyxcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgfSlcbiAgdHhJZCE6IG51bWJlciB8IG51bGw7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBuYW1lOiAncmVxVHlwZScsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDAsXG4gIH0pXG4gIHJlcVR5cGUhOiBudW1iZXI7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnc2VuZGVyJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgc2VuZGVyITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ3NlbGxUb2tlbklkJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgc2VsbFRva2VuSWQhOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnc2VsbEFtdCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIHNlbGxBbXQhOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnbm9uY2UnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBub25jZSE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdidXlUb2tlbklkJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgYnV5VG9rZW5JZCE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdidXlBbXQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBidXlBbXQhOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYWNjdW11bGF0ZWRTZWxsQW10JyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgYWNjdW11bGF0ZWRTZWxsQW10ITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2FjY3VtdWxhdGVkQnV5QW10JyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgYWNjdW11bGF0ZWRCdXlBbXQhOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnQ4JyxcbiAgICBuYW1lOiAnb3JkZXJJZCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDAsXG4gIH0pXG4gIG9yZGVySWQhOiBudW1iZXI7XG4gIEBPbmVUb09uZSgoKSA9PiBPYnNPcmRlckVudGl0eSwgKG9ic09yZGVyKSA9PiBvYnNPcmRlci5vYnNPcmRlckxlYWYsIHtcbiAgICBvbkRlbGV0ZTogJ1JFU1RSSUNUJyxcbiAgICBvblVwZGF0ZTogJ0NBU0NBREUnLFxuICB9KVxuICBASm9pbkNvbHVtbih7XG4gICAgbmFtZTogJ29yZGVySWQnLFxuICAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAnaWQnLFxuICB9KVxuICBvYnNPcmRlciE6IE9ic09yZGVyRW50aXR5O1xuICBAT25lVG9PbmUoKCkgPT4gT2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUsIChvYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZTogT2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUpID0+IG9ic09yZGVyTGVhZk1lcmtsZVRyZWVOb2RlLmxlYWYsIHtcbiAgICBvbkRlbGV0ZTogJ1JFU1RSSUNUJyxcbiAgICBvblVwZGF0ZTogJ0NBU0NBREUnLFxuICB9KVxuICBASm9pbkNvbHVtbih7XG4gICAgbmFtZTogJ29yZGVyTGVhZklkJyxcbiAgICByZWZlcmVuY2VkQ29sdW1uTmFtZTogJ2xlYWZJZCcsXG4gIH0pXG4gIG1lcmtsZVRyZWVOb2RlITogT2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGU7XG59XG4iLCJpbXBvcnQgeyBtYXRjaEUgfSBmcm9tICdmcC10cy9saWIvSU9FaXRoZXInO1xuaW1wb3J0IHsgQ29sdW1uLCBFbnRpdHksIEpvaW5Db2x1bW4sIE1hbnlUb09uZSwgT25lVG9NYW55LCBPbmVUb09uZSwgUHJpbWFyeUdlbmVyYXRlZENvbHVtbiB9IGZyb20gJ3R5cGVvcm0nO1xuaW1wb3J0IHsgQWNjb3VudEluZm9ybWF0aW9uIH0gZnJvbSAnLi4vYWNjb3VudC9hY2NvdW50SW5mb3JtYXRpb24uZW50aXR5JztcbmltcG9ydCB7IFRzVHhUeXBlIH0gZnJvbSAnLi4vYWNjb3VudC9kdG8vdHMtdHlwZSc7XG5pbXBvcnQgeyBNYXRjaE9ic09yZGVyRW50aXR5IH0gZnJvbSAnLi9tYXRjaE9ic09yZGVyLmVudGl0eSc7XG5pbXBvcnQgeyBPYnNPcmRlckxlYWZFbnRpdHkgfSBmcm9tICcuL29ic09yZGVyTGVhZi5lbnRpdHknO1xuaW1wb3J0IHsgVHNTaWRlIH0gZnJvbSAnLi90c1NpZGUuZW51bSc7XG5cbkBFbnRpdHkoJ09ic09yZGVyJywgeyBzY2hlbWE6ICdwdWJsaWMnfSlcbmV4cG9ydCBjbGFzcyBPYnNPcmRlckVudGl0eSB7XG4gIEBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50OCcsXG4gICAgbmFtZTogJ2lkJyxcbiAgfSlcbiAgaWQhOiBudW1iZXI7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdlbnVtJyxcbiAgICBuYW1lOiAnc2lkZScsXG4gICAgZW51bU5hbWU6ICdTSURFJyxcbiAgICBlbnVtOiBbXG4gICAgICBUc1NpZGUuQlVZLFxuICAgICAgVHNTaWRlLlNFTEwsXG4gICAgXSxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogKCkgPT4gYFxcJyR7VHNTaWRlLkJVWX1cXCdgLFxuICB9KVxuICBzaWRlITogVHNTaWRlO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50OCcsXG4gICAgbmFtZTogJ3R4SWQnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwLFxuICB9KVxuICB0eElkITogbnVtYmVyO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgbmFtZTogJ3JlcVR5cGUnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwLFxuICB9KVxuICByZXFUeXBlITogbnVtYmVyO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2FjY291bnRJZCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGFjY291bnRJZCE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdtYXJrZXRQYWlyJyxcbiAgICBsZW5ndGg6IDEwMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogYCdFVEgvVVNEQydgLFxuICB9KVxuICBtYXJrZXRQYWlyITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ3ByaWNlJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiA4LFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgcHJpY2UhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBuYW1lOiAnb3JkZXJTdGF0dXMnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAxLCAvLyBwZW5kaW5nPTEsIGNhbmNlbGVkPTIsIG1hdGNoZWQ9M1xuICB9KVxuICBvcmRlclN0YXR1cyE6IG51bWJlcjtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdtYWluUXR5JyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgbWFpblF0eSE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdiYXNlUXR5JyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgYmFzZVF0eSE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdyZW1haW5NYWluUXR5JyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgcmVtYWluTWFpblF0eSE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdyZW1haW5CYXNlUXR5JyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgcmVtYWluQmFzZVF0eSE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdhY2N1bXVsYXRlZE1haW5RdHknLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBhY2N1bXVsYXRlZE1haW5RdHkhOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYWNjdW11bGF0ZWRCYXNlUXR5JyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgYWNjdW11bGF0ZWRCYXNlUXR5ITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ21haW5Ub2tlbklkJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwLFxuICB9KVxuICBtYWluVG9rZW5JZCE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdiYXNlVG9rZW5JZCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMCxcbiAgfSlcbiAgYmFzZVRva2VuSWQhOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd0aW1lc3RhbXAgd2l0aG91dCB0aW1lIHpvbmUnLFxuICAgIG5hbWU6ICd0aW1lc3RhbXAnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBwcmVjaXNpb246IDMsXG4gICAgZGVmYXVsdDogKCkgPT4gYG5vdygpYCxcbiAgfSlcbiAgdGltZXN0YW1wITogRGF0ZTtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIG5hbWU6ICdpc01ha2VyJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogZmFsc2UsIFxuICB9KVxuICBpc01ha2VyITogYm9vbGVhbjtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2ludDgnLFxuICAgIG5hbWU6ICdvcmRlckxlYWZJZCcsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gICAgdW5pcXVlOiB0cnVlLFxuICB9KVxuICBvcmRlckxlYWZJZCE6IG51bWJlciB8IG51bGw7XG4gIEBPbmVUb09uZShcbiAgICAoKSA9PiBPYnNPcmRlckxlYWZFbnRpdHksXG4gICAgKG9ic09yZGVyOiBPYnNPcmRlckxlYWZFbnRpdHkgKSA9PiBvYnNPcmRlci5vYnNPcmRlcixcbiAgKVxuICBASm9pbkNvbHVtbih7XG4gICAgbmFtZTogJ2lkJyxcbiAgICByZWZlcmVuY2VkQ29sdW1uTmFtZTogJ29yZGVySWQnXG4gIH0pXG4gIG9ic09yZGVyTGVhZiE6IE9ic09yZGVyTGVhZkVudGl0eTtcbiAgQE9uZVRvTWFueShcbiAgICAoKSA9PiBNYXRjaE9ic09yZGVyRW50aXR5LFxuICAgIChtYXRjaE9yZGVyczogTWF0Y2hPYnNPcmRlckVudGl0eSkgPT4gbWF0Y2hPcmRlcnMubWFya2V0UGFpclxuICApXG4gIEBKb2luQ29sdW1uKHtcbiAgICBuYW1lOiAnaWQnLFxuICAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAncmVmZXJlbmNlT3JkZXInXG4gIH0pXG4gIG1hdGNoT3JkZXJzITogTWF0Y2hPYnNPcmRlckVudGl0eVtdO1xuICBATWFueVRvT25lKFxuICAgICgpID0+IEFjY291bnRJbmZvcm1hdGlvbixcbiAgICAoYWNjb3VudEluZm86IEFjY291bnRJbmZvcm1hdGlvbikgPT4gYWNjb3VudEluZm8ub2JzT3JkZXJzLFxuICAgIHtcbiAgICAgIG9uRGVsZXRlOiAnUkVTVFJJQ1QnLFxuICAgICAgb25VcGRhdGU6ICdDQVNDQURFJ1xuICAgIH1cbiAgKVxuICBASm9pbkNvbHVtbih7XG4gICAgbmFtZTogJ2FjY291bnRJZCcsXG4gICAgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICdhY2NvdW50SWQnXG4gIH0pXG4gIGFjY291bnRJbmZvITogQWNjb3VudEluZm9ybWF0aW9uOyBcbn0iLCJpbXBvcnQgeyBDb2x1bW4sIEVudGl0eSwgSm9pbkNvbHVtbiwgT25lVG9NYW55LCBPbmVUb09uZSwgUHJpbWFyeUNvbHVtbiB9IGZyb20gJ3R5cGVvcm0nO1xuLy8gaW1wb3J0IHsgQXVjdGlvbk9yZGVyTGVhZk5vZGUgfSBmcm9tICcuLi9hdWN0aW9uT3JkZXIvYXVjdGlvbk9yZGVyTGVhZk5vZGUuZW50aXR5JztcbmltcG9ydCB7IE9ic09yZGVyRW50aXR5IH0gZnJvbSAnLi4vYXVjdGlvbk9yZGVyL29ic09yZGVyLmVudGl0eSc7XG5pbXBvcnQgeyBCYXNlVGltZUVudGl0eSB9IGZyb20gJy4uL2NvbW1vbi9iYXNlVGltZUVudGl0eSc7XG5pbXBvcnQgeyBBY2NvdW50TWVya2xlVHJlZU5vZGUgfSBmcm9tICcuL2FjY291bnRNZXJrbGVUcmVlTm9kZS5lbnRpdHknO1xuaW1wb3J0IHsgUm9sZSB9IGZyb20gJy4vcm9sZS5lbnVtJztcbmltcG9ydCB7IFRyYW5zYWN0aW9uSW5mbyB9IGZyb20gJy4vdHJhbnNhY3Rpb25JbmZvLmVudGl0eSc7XG5cbkBFbnRpdHkoJ0FjY291bnRJbmZvcm1hdGlvbicsIHsgc2NoZW1hOiAncHVibGljJyB9KVxuZXhwb3J0IGNsYXNzIEFjY291bnRJbmZvcm1hdGlvbiBleHRlbmRzIEJhc2VUaW1lRW50aXR5IHtcbiAgQFByaW1hcnlDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAnTDFBZGRyZXNzJyxcbiAgICBsZW5ndGg6IDI1NixcbiAgICBwcmltYXJ5OiB0cnVlLFxuICB9KVxuICBMMUFkZHJlc3MhOiBzdHJpbmc7XG5cbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdhY2NvdW50SWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICB9KVxuICBhY2NvdW50SWQhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAnZW1haWwnLFxuICAgIGxlbmd0aDogMjU2LFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICAgIHVuaXF1ZTogZmFsc2UsXG4gIH0pXG4gIGVtYWlsPzogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ2xhc3RlZExvZ2luSXAnLFxuICAgIGxlbmd0aDogMjU2LFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICAgIGRlZmF1bHQ6IG51bGwsXG4gIH0pXG4gIGxhc3RlZExvZ2luSXAhOiBzdHJpbmcgfCBudWxsO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndGltZXN0YW1wIHdpdGhvdXQgdGltZSB6b25lJyxcbiAgICBuYW1lOiAnbGFzdExvZ2luVGltZScsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gIH0pXG4gIGxhc3RMb2dpblRpbWUhOiBEYXRlIHwgbnVsbDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2VudW0nLFxuICAgIG5hbWU6ICdyb2xlJyxcbiAgICBlbnVtTmFtZTogJ1JvbGUnLFxuICAgIGVudW06IFtSb2xlLkFETUlOLCBSb2xlLk1FTUJFUiwgUm9sZS5PUEVSQVRPUl0sXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IFJvbGUuTUVNQkVSLFxuICB9KVxuICByb2xlITogUm9sZTtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdwYXNzd29yZCcsXG4gICAgbGVuZ3RoOiAzMDAsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gIH0pXG4gIHBhc3N3b3JkITogc3RyaW5nIHwgbnVsbDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdyZWZyZXNoVG9rZW4nLFxuICAgIGxlbmd0aDogNDAwLFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICB9KVxuICByZWZyZXNoVG9rZW4hOiBzdHJpbmcgfCBudWxsO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnanNvbmInLFxuICAgIG5hbWU6ICdsYWJlbCcsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gICAgZGVmYXVsdDogKCkgPT4gXCIne30nXCIsXG4gIH0pXG4gIGxhYmVsITogb2JqZWN0O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ2xhYmVsQnknLFxuICAgIGxlbmd0aDogMjU2LFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICB9KVxuICBsYWJlbEJ5ITogc3RyaW5nIHwgbnVsbDtcblxuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ3RzUHViS2V5WCcsXG4gICAgbGVuZ3RoOiAnMTAwJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogXCInMCdcIixcbiAgfSlcbiAgdHNQdWJLZXlYITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ3RzUHViS2V5WScsXG4gICAgbGVuZ3RoOiAnMTAwJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogXCInMCdcIixcbiAgfSlcbiAgdHNQdWJLZXlZITogc3RyaW5nO1xuICAvLyByZWxhdGlvbnNcbiAgQE9uZVRvT25lKCgpID0+IEFjY291bnRNZXJrbGVUcmVlTm9kZSwgKGFjY291bnRNZXJrbGVUcmVlTm9kZTogQWNjb3VudE1lcmtsZVRyZWVOb2RlKSA9PiBhY2NvdW50TWVya2xlVHJlZU5vZGUubGVhZilcbiAgYWNjb3VudE1lcmtsZVRyZWVOb2RlITogQWNjb3VudE1lcmtsZVRyZWVOb2RlO1xuICAvLyBAT25lVG9NYW55KFxuICAvLyAgICgpID0+IEF1Y3Rpb25PcmRlckxlYWZOb2RlLFxuICAvLyAgIChhdWN0aW9uT3JkZXJMZWFmTm9kZTpBdWN0aW9uT3JkZXJMZWFmTm9kZSkgPT4gYXVjdGlvbk9yZGVyTGVhZk5vZGUuTDJBZGRyRnJvbUFjY291bnRcbiAgLy8gKVxuICAvLyBmcm9tQXVjdGlvbk9yZGVyTGVhZk5vZGVzITogQXVjdGlvbk9yZGVyTGVhZk5vZGVbXTtcbiAgLy8gQE9uZVRvTWFueShcbiAgLy8gICAoKSA9PiBBdWN0aW9uT3JkZXJMZWFmTm9kZSxcbiAgLy8gICAoYXVjdGlvbk9yZGVyTGVhZk5vZGU6QXVjdGlvbk9yZGVyTGVhZk5vZGUpID0+IGF1Y3Rpb25PcmRlckxlYWZOb2RlLkwyQWRkclRvQWNjb3VudFxuICAvLyApXG4gIC8vIHRvQXVjdGlvbk9yZGVyTGVhZk5vZGVzITogQXVjdGlvbk9yZGVyTGVhZk5vZGVbXTtcbiAgQE9uZVRvTWFueSgoKSA9PiBUcmFuc2FjdGlvbkluZm8sICh0cmFuc2FjdGlvbkluZm86IFRyYW5zYWN0aW9uSW5mbykgPT4gdHJhbnNhY3Rpb25JbmZvLkwyQWNjb3VudEluZm8pXG4gIHRyYW5zYWN0aW9uSW5mb3MhOiBUcmFuc2FjdGlvbkluZm9bXTtcbiAgQE9uZVRvTWFueSgoKSA9PiBPYnNPcmRlckVudGl0eSwgKG9ic09yZGVyOiBPYnNPcmRlckVudGl0eSkgPT4gb2JzT3JkZXIuYWNjb3VudEluZm8pXG4gIEBKb2luQ29sdW1uKHtcbiAgICBuYW1lOiAnYWNjb3VudElkJyxcbiAgICByZWZlcmVuY2VkQ29sdW1uTmFtZTogJ2FjY291bnRJZCcsXG4gIH0pXG4gIG9ic09yZGVycyE6IE9ic09yZGVyRW50aXR5W10gfCBudWxsO1xufVxuIiwiaW1wb3J0IHsgQ29sdW1uLCBDcmVhdGVEYXRlQ29sdW1uLCBEZWxldGVEYXRlQ29sdW1uLCBVcGRhdGVEYXRlQ29sdW1uIH0gZnJvbSAndHlwZW9ybSc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlVGltZUVudGl0eSB7XG4gIEBDcmVhdGVEYXRlQ29sdW1uKHtcbiAgICB0eXBlOiAndGltZXN0YW1wIHdpdGhvdXQgdGltZSB6b25lJyxcbiAgICBuYW1lOiAnY3JlYXRlZEF0JyxcbiAgICBkZWZhdWx0OiAoKSA9PiAnbm93KCknLFxuICB9KVxuICBjcmVhdGVkQXQhOiBEYXRlO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ2NyZWF0ZWRCeScsXG4gICAgbGVuZ3RoOiAzMDAsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gIH0pXG4gIGNyZWF0ZWRCeSE6IHN0cmluZyB8IG51bGw7XG4gIEBVcGRhdGVEYXRlQ29sdW1uKHtcbiAgICB0eXBlOiAndGltZXN0YW1wIHdpdGhvdXQgdGltZSB6b25lJyxcbiAgICBuYW1lOiAndXBkYXRlZEF0JyxcbiAgICBkZWZhdWx0OiAoKSA9PiAnbm93KCknLFxuICB9KVxuICB1cGRhdGVkQXQhOiBEYXRlO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ3VwZGF0ZWRCeScsICBcbiAgICBsZW5ndGg6IDMwMCwgIFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICB9KVxuICB1cGRhdGVkQnkhOiBzdHJpbmcgfCBudWxsOyBcbiAgQERlbGV0ZURhdGVDb2x1bW4oe1xuICAgIHR5cGU6ICd0aW1lc3RhbXAgd2l0aG91dCB0aW1lIHpvbmUnLFxuICAgIG5hbWU6ICdkZWxldGVkQXQnLFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICB9KVxuICBkZWxldGVkQXQhOiBEYXRlIHwgbnVsbDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLCBcbiAgICBuYW1lOiAnZGVsZXRlZEJ5JyxcbiAgICBsZW5ndGg6IDMwMCxcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgfSlcbiAgZGVsZXRlZEJ5ITogc3RyaW5nIHwgbnVsbDtcbn0iLCJpbXBvcnQgeyBDb2x1bW4sIEVudGl0eSwgSm9pbkNvbHVtbiwgT25lVG9NYW55LCBPbmVUb09uZSwgUHJpbWFyeUNvbHVtbiB9IGZyb20gJ3R5cGVvcm0nO1xuaW1wb3J0IHsgQWNjb3VudEluZm9ybWF0aW9uIH0gZnJvbSAnLi9hY2NvdW50SW5mb3JtYXRpb24uZW50aXR5JztcbmltcG9ydCB7IEFjY291bnRMZWFmTm9kZSB9IGZyb20gJy4vYWNjb3VudExlYWZOb2RlLmVudGl0eSc7XG5pbXBvcnQgeyBUb2tlbk1lcmtsZVRyZWVOb2RlIH0gZnJvbSAnLi90b2tlbk1lcmtsZVRyZWVOb2RlLmVudGl0eSc7XG5cbkBFbnRpdHkoJ0FjY291bnRNZXJrbGVUcmVlTm9kZScsIHsgc2NoZW1hOiAncHVibGljJ30pXG5leHBvcnQgY2xhc3MgQWNjb3VudE1lcmtsZVRyZWVOb2RlIHtcbiAgQFByaW1hcnlDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnaWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgcHJpbWFyeTogdHJ1ZSxcbiAgfSlcbiAgaWQhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnaGFzaCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gIH0pXG4gIGhhc2ghOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnbGVhZklkJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICB9KVxuICBsZWFmSWQhOiBiaWdpbnR8bnVsbDtcbiAgQE9uZVRvT25lKFxuICAgICgpID0+IEFjY291bnRJbmZvcm1hdGlvbiwgLy8gbWFwVHlwZVxuICAgIChhY2NvdW50SW5mb3JtYXRpb246IEFjY291bnRJbmZvcm1hdGlvbikgPT4gYWNjb3VudEluZm9ybWF0aW9uLmFjY291bnRNZXJrbGVUcmVlTm9kZSAsIC8vIG1hcCBhdHRyaWJ1dGVcbiAgICB7IG9uRGVsZXRlOiAnUkVTVFJJQ1QnLCBvblVwZGF0ZTogJ0NBU0NBREUnIH0gXG4gIClcbiAgQEpvaW5Db2x1bW4oW3sgbmFtZTogJ2xlYWZJZCcsIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAnYWNjb3VudElkJyB9XSlcbiAgbGVhZiE6IEFjY291bnRJbmZvcm1hdGlvbjtcbiAgQE9uZVRvTWFueShcbiAgICAoKSA9PiBUb2tlbk1lcmtsZVRyZWVOb2RlLFxuICAgICh0b2tlbk1lcmtsZVRyZWVOb2RlOiBUb2tlbk1lcmtsZVRyZWVOb2RlKSA9PiB0b2tlbk1lcmtsZVRyZWVOb2RlLmFjY291bnRSb290XG4gIClcbiAgdG9rZW5NZXJrbGVUcmVlTm9kZXMhOiBUb2tlbk1lcmtsZVRyZWVOb2RlW107XG4gIEBPbmVUb09uZShcbiAgICAoKSA9PiAgQWNjb3VudExlYWZOb2RlLFxuICAgIChhY2NvdW50TGVhZk5vZGU6IEFjY291bnRMZWFmTm9kZSkgPT4gYWNjb3VudExlYWZOb2RlLmFjY291bnRNZXJrbGVUcmVlTm9kZVxuICApXG4gIGFjY291bnRMZWFmTm9kZSE6IEFjY291bnRMZWFmTm9kZTtcbn0iLCJpbXBvcnQgeyBDb2x1bW4sIENyZWF0ZURhdGVDb2x1bW4sIERlbGV0ZURhdGVDb2x1bW4sIEVudGl0eSwgSm9pbkNvbHVtbiwgT25lVG9PbmUsIFByaW1hcnlDb2x1bW4sIFVwZGF0ZURhdGVDb2x1bW4gfSBmcm9tICd0eXBlb3JtJztcbmltcG9ydCB7IEFjY291bnRNZXJrbGVUcmVlTm9kZSB9IGZyb20gJy4vYWNjb3VudE1lcmtsZVRyZWVOb2RlLmVudGl0eSc7XG5cbkBFbnRpdHkoJ0FjY291bnRMZWFmTm9kZScsIHsgc2NoZW1hOiAncHVibGljJ30pXG5leHBvcnQgY2xhc3MgQWNjb3VudExlYWZOb2RlIHtcbiAgQFByaW1hcnlDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnbGVhZklkJyxcbiAgICBwcmltYXJ5OiB0cnVlLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDBcbiAgfSlcbiAgbGVhZklkITogc3RyaW5nOyBcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICd0c0FkZHInLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICB0c0FkZHIhOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnbm9uY2UnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuXG4gIH0pXG4gIG5vbmNlITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ3Rva2VuUm9vdCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG5cbiAgfSlcbiAgdG9rZW5Sb290ITogYmlnaW50O1xuICAvLyByZWxhdGlvbnNcbiAgQE9uZVRvT25lKFxuICAgICgpID0+IEFjY291bnRNZXJrbGVUcmVlTm9kZSxcbiAgICAoYWNjb3VudE1lcmtsZVRyZWVOb2RlOkFjY291bnRNZXJrbGVUcmVlTm9kZSkgPT4gYWNjb3VudE1lcmtsZVRyZWVOb2RlLmFjY291bnRMZWFmTm9kZSwgXG4gICAgeyBvbkRlbGV0ZTogJ1JFU1RSSUNUJywgb25VcGRhdGU6ICdDQVNDQURFJyB9XG4gIClcbiAgQEpvaW5Db2x1bW4oe1xuICAgIG5hbWU6ICdsZWFmSWQnLFxuICAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAnbGVhZklkJ1xuICB9KVxuICBhY2NvdW50TWVya2xlVHJlZU5vZGUhOiBBY2NvdW50TWVya2xlVHJlZU5vZGU7XG59IiwiaW1wb3J0IHsgQ29sdW1uLCBFbnRpdHksIEpvaW5Db2x1bW4sIE1hbnlUb09uZSwgT25lVG9PbmUsIFByaW1hcnlDb2x1bW4sIFVuaXF1ZSB9IGZyb20gJ3R5cGVvcm0nO1xuaW1wb3J0IHsgQWNjb3VudE1lcmtsZVRyZWVOb2RlIH0gZnJvbSAnLi9hY2NvdW50TWVya2xlVHJlZU5vZGUuZW50aXR5JztcbmltcG9ydCB7IFRva2VuTGVhZk5vZGUgfSBmcm9tICcuL3Rva2VuTGVhZk5vZGUuZW50aXR5JztcblxuQEVudGl0eSgnVG9rZW5NZXJrbGVUcmVlTm9kZScsIHsgc2NoZW1hOiAncHVibGljJyB9KVxuZXhwb3J0IGNsYXNzIFRva2VuTWVya2xlVHJlZU5vZGUge1xuICBAUHJpbWFyeUNvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdhY2NvdW50SWQnLFxuICAgIHByaW1hcnk6IHRydWUsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgdW5pcXVlOiBmYWxzZSxcbiAgfSlcbiAgYWNjb3VudElkITogc3RyaW5nOyAvLyBjb21wb3NlIHByaW1hcnkga2V5XG4gIEBQcmltYXJ5Q29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2lkJyxcbiAgICBwcmltYXJ5OiB0cnVlLFxuICAgIHByZWNpc2lvbjogODYsIFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICB1bmlxdWU6IGZhbHNlLFxuICB9KVxuICBpZCE6IHN0cmluZzsgLy8gY29tcG9zZSBwcmltYXJ5IGtleVxuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2hhc2gnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlXG4gIH0pXG4gIGhhc2ghOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnbGVhZklkJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICAgIHVuaXF1ZTogdHJ1ZSxcbiAgfSlcbiAgbGVhZklkITogc3RyaW5nfG51bGw7XG4gIC8vIHJlbGF0aW9uc1xuICBATWFueVRvT25lKFxuICAgICgpID0+IEFjY291bnRNZXJrbGVUcmVlTm9kZSxcbiAgICAoYWNjb3VudE1lcmtsZVRyZWVOb2RlOiBBY2NvdW50TWVya2xlVHJlZU5vZGUpID0+IGFjY291bnRNZXJrbGVUcmVlTm9kZS50b2tlbk1lcmtsZVRyZWVOb2RlcyxcbiAgICB7IG9uRGVsZXRlOiAnUkVTVFJJQ1QnLCBvblVwZGF0ZTogJ0NBU0NBREUnIH1cbiAgKVxuICBASm9pbkNvbHVtbih7IG5hbWU6ICdhY2NvdW50SWQnLCByZWZlcmVuY2VkQ29sdW1uTmFtZTogJ2xlYWZJZCcgfSlcbiAgYWNjb3VudFJvb3QhOiBBY2NvdW50TWVya2xlVHJlZU5vZGU7XG4gIEBPbmVUb09uZShcbiAgICAoKSA9PiBUb2tlbkxlYWZOb2RlLFxuICAgICh0b2tlbkxlYWZOb2RlOiBUb2tlbkxlYWZOb2RlKSA9PiB0b2tlbkxlYWZOb2RlLnRva2VuTWVya2xlTm9kZVxuICApXG4gIEBKb2luQ29sdW1uKFt7XG4gICAgbmFtZTogJ2xlYWZJZCcsXG4gICAgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICdsZWFmSWQnXG4gIH0se1xuICAgIG5hbWU6ICdhY2NvdW50SWQnLFxuICAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAnYWNjb3VudElkJ1xuICB9XSlcbiAgbGVhZiE6VG9rZW5MZWFmTm9kZTtcblxufSIsImltcG9ydCB7IENvbHVtbiwgQ3JlYXRlRGF0ZUNvbHVtbiwgRGVsZXRlRGF0ZUNvbHVtbiwgRW50aXR5LCBKb2luQ29sdW1uLCBKb2luVGFibGUsIE9uZVRvT25lLCBQcmltYXJ5Q29sdW1uLCBVcGRhdGVEYXRlQ29sdW1uIH0gZnJvbSAndHlwZW9ybSc7XG5pbXBvcnQgeyBUb2tlbk1lcmtsZVRyZWVOb2RlIH0gZnJvbSAnLi90b2tlbk1lcmtsZVRyZWVOb2RlLmVudGl0eSc7XG5cbkBFbnRpdHkoJ1Rva2VuTGVhZk5vZGUnLCB7IHNjaGVtYTogJ3B1YmxpYyd9KVxuZXhwb3J0IGNsYXNzIFRva2VuTGVhZk5vZGUge1xuICBAUHJpbWFyeUNvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdsZWFmSWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgcHJpbWFyeTogdHJ1ZSxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gIH0pXG4gIGxlYWZJZCE6IHN0cmluZztcbiAgQFByaW1hcnlDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYWNjb3VudElkJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIHByaW1hcnk6IHRydWUsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICB9KVxuICBhY2NvdW50SWQhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYXZhaWxhYmxlQW10JyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIGRlZmF1bHQ6IDBuXG4gIH0pXG4gIGF2YWlsYWJsZUFtdCE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdsb2NrZWRBbXQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgZGVmYXVsdDogMG5cbiAgfSlcbiAgbG9ja2VkQW10ITogYmlnaW50O1xuICBAT25lVG9PbmUoXG4gICAgKCkgPT4gVG9rZW5NZXJrbGVUcmVlTm9kZSxcbiAgICAodG9rZW5NZXJrbGVUcmVlTm9kZTogVG9rZW5NZXJrbGVUcmVlTm9kZSkgPT4gdG9rZW5NZXJrbGVUcmVlTm9kZS5sZWFmLFxuICAgIHsgb25EZWxldGU6ICdSRVNUUklDVCcsIG9uVXBkYXRlOiAnQ0FTQ0FERScgfVxuICApXG4gIEBKb2luQ29sdW1uKFt7IG5hbWU6ICdsZWFmSWQnLCByZWZlcmVuY2VkQ29sdW1uTmFtZTogJ2xlYWZJZCcgfSxcbiAgeyBuYW1lOiAnYWNjb3VudElkJywgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICdhY2NvdW50SWQnIH1dKVxuICB0b2tlbk1lcmtsZU5vZGUhOiBUb2tlbk1lcmtsZVRyZWVOb2RlO1xufSIsImV4cG9ydCBlbnVtIFJvbGUge1xuICBBRE1JTiA9ICdBRE1JTicsXG4gIE1FTUJFUiA9ICdNRU1CRVInLFxuICBPUEVSQVRPUiA9ICdPUEVSQVRPUidcbn0iLCJpbXBvcnQgeyBDb2x1bW4sIEVudGl0eSwgSm9pbkNvbHVtbiwgTWFueVRvT25lLCBPbmVUb09uZSwgUHJpbWFyeUNvbHVtbiB9IGZyb20gJ3R5cGVvcm0nO1xuaW1wb3J0IHsgTWF0Y2hPYnNPcmRlckVudGl0eSB9IGZyb20gJy4uL2F1Y3Rpb25PcmRlci9tYXRjaE9ic09yZGVyLmVudGl0eSc7XG5pbXBvcnQgeyBCYXNlVGltZUVudGl0eSB9IGZyb20gJy4uL2NvbW1vbi9iYXNlVGltZUVudGl0eSc7XG5pbXBvcnQgeyBBY2NvdW50SW5mb3JtYXRpb24gfSBmcm9tICcuL2FjY291bnRJbmZvcm1hdGlvbi5lbnRpdHknO1xuaW1wb3J0IHsgQmxvY2tJbmZvcm1hdGlvbiB9IGZyb20gJy4vYmxvY2tJbmZvcm1hdGlvbi5lbnRpdHknO1xuaW1wb3J0IHsgVFNfU1RBVFVTIH0gZnJvbSAnLi90c1N0YXR1cy5lbnVtJztcblxuQEVudGl0eSgnVHJhbnNhY3Rpb25JbmZvJywgeyBzY2hlbWE6ICdwdWJsaWMnIH0pXG5leHBvcnQgY2xhc3MgVHJhbnNhY3Rpb25JbmZvIGV4dGVuZHMgQmFzZVRpbWVFbnRpdHkge1xuICBAUHJpbWFyeUNvbHVtbih7XG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIG5hbWU6ICd0eElkJyxcbiAgICBwcmltYXJ5OiB0cnVlLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBnZW5lcmF0ZWQ6ICdpbmNyZW1lbnQnLFxuICB9KVxuICB0eElkITogbnVtYmVyO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgbmFtZTogJ2Jsb2NrTnVtYmVyJyxcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgICBkZWZhdWx0OiAwXG4gIH0pXG4gIGJsb2NrTnVtYmVyITogbnVtYmVyfCBudWxsO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgbmFtZTogJ3JlcVR5cGUnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwLFxuICB9KVxuICByZXFUeXBlITogbnVtYmVyO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2FjY291bnRJZCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGFjY291bnRJZCE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICd0b2tlbklkJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwbixcbiAgfSlcbiAgdG9rZW5JZCE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdhY2N1bXVsYXRlZFNlbGxBbXQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBhY2N1bXVsYXRlZFNlbGxBbXQhOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYWNjdW11bGF0ZWRCdXlBbXQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBhY2N1bXVsYXRlZEJ1eUFtdCE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdhbW91bnQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBhbW91bnQhOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnbm9uY2UnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBub25jZSE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2pzb24nLFxuICAgIG5hbWU6ICdlZGRzYVNpZycsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6ICgpID0+IEpTT04uc3RyaW5naWZ5KHsgUjg6IFsnMCcsICcwJ10sIFM6ICcwJyB9KSxcbiAgfSlcbiAgZWRkc2FTaWchOiB7XG4gICAgUjg6IFtzdHJpbmcsIHN0cmluZ107XG4gICAgUzogc3RyaW5nO1xuICB9O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ2VjZHNhU2lnJyxcbiAgICBsZW5ndGg6ICc2NicsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IGAnJ2AsXG4gIH0pXG4gIGVjZHNhU2lnITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2FyZzAnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBhcmcwITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2FyZzEnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBhcmcxITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2FyZzInLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBhcmcyITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2FyZzMnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBhcmczITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2FyZzQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBhcmc0ITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ3RzUHViS2V5WCcsXG4gICAgbGVuZ3RoOiAnMTAwJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogXCInMCdcIixcbiAgfSlcbiAgdHNQdWJLZXlYITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ3RzUHViS2V5WScsXG4gICAgbGVuZ3RoOiAnMTAwJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogXCInMCdcIixcbiAgfSlcbiAgdHNQdWJLZXlZITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ2ZlZScsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGZlZSE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdmZWVUb2tlbicsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGZlZVRva2VuITogYmlnaW50O1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnanNvbicsXG4gICAgbmFtZTogJ21ldGFkYXRhJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogKCkgPT4gXCIne30nXCIsXG4gIH0pXG4gIG1ldGFkYXRhITogb2JqZWN0IHwgbnVsbDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2VudW0nLFxuICAgIG5hbWU6ICd0eFN0YXR1cycsXG4gICAgZW51bTogW1xuICAgICAgVFNfU1RBVFVTLlBFTkRJTkcsXG4gICAgICBUU19TVEFUVVMuUFJPQ0VTU0lORyxcbiAgICAgIFRTX1NUQVRVUy5MMkVYRUNVVEVELFxuICAgICAgVFNfU1RBVFVTLkwyQ09ORklSTUVELFxuICAgICAgVFNfU1RBVFVTLkwxQ09ORklSTUVELFxuICAgICAgVFNfU1RBVFVTLkZBSUxFRCxcbiAgICAgIFRTX1NUQVRVUy5SRUpFQ1RFRCxcbiAgICBdLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiBgJyR7VFNfU1RBVFVTLlBFTkRJTkd9J2AsXG4gIH0pXG4gIHR4U3RhdHVzITogVFNfU1RBVFVTO1xuICBATWFueVRvT25lKCgpID0+IEFjY291bnRJbmZvcm1hdGlvbiwgKGFjY291bnRJbmZvcm1hdGlvbjogQWNjb3VudEluZm9ybWF0aW9uKSA9PiBhY2NvdW50SW5mb3JtYXRpb24udHJhbnNhY3Rpb25JbmZvcywge1xuICAgIG9uRGVsZXRlOiAnUkVTVFJJQ1QnLFxuICAgIG9uVXBkYXRlOiAnQ0FTQ0FERScsXG4gIH0pXG4gIEBKb2luQ29sdW1uKHtcbiAgICBuYW1lOiAnYWNjb3VudElkJyxcbiAgICByZWZlcmVuY2VkQ29sdW1uTmFtZTogJ2FjY291bnRJZCcsXG4gIH0pXG4gIEwyQWNjb3VudEluZm8hOiBBY2NvdW50SW5mb3JtYXRpb247XG4gIEBNYW55VG9PbmUoKCkgPT4gQmxvY2tJbmZvcm1hdGlvbiwgKGJsb2NrSW5mb3JtYXRpb246IEJsb2NrSW5mb3JtYXRpb24pID0+IGJsb2NrSW5mb3JtYXRpb24udHJhbnNhY3Rpb25JbmZvcywge1xuICAgIG9uRGVsZXRlOiAnUkVTVFJJQ1QnLFxuICAgIG9uVXBkYXRlOiAnQ0FTQ0FERScsXG4gIH0pXG4gIEBKb2luQ29sdW1uKHtcbiAgICBuYW1lOiAnYmxvY2tOdW1iZXInLFxuICAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAnYmxvY2tOdW1iZXInLFxuICB9KVxuICBibG9ja0luZm8hOiBCbG9ja0luZm9ybWF0aW9uO1xuICBAT25lVG9PbmUoKCkgPT4gTWF0Y2hPYnNPcmRlckVudGl0eSwgKG1hdGNoZWRPYnNPcmRlcjogTWF0Y2hPYnNPcmRlckVudGl0eSkgPT4gbWF0Y2hlZE9ic09yZGVyLm1hdGNoZWRUeClcbiAgQEpvaW5Db2x1bW4oe1xuICAgIG5hbWU6ICd0eElkJyxcbiAgICByZWZlcmVuY2VkQ29sdW1uTmFtZTogJ3R4SWQnLFxuICB9KVxuICBtYXRjaGVkT3JkZXIhOiBNYXRjaE9ic09yZGVyRW50aXR5IHwgbnVsbDtcbiAgQE9uZVRvT25lKCgpID0+IE1hdGNoT2JzT3JkZXJFbnRpdHksIChtYXRjaGVkT2JzT3JkZXI6IE1hdGNoT2JzT3JkZXJFbnRpdHkpID0+IG1hdGNoZWRPYnNPcmRlci5tYXRjaGVkVHgyKVxuICBASm9pbkNvbHVtbih7XG4gICAgbmFtZTogJ3R4SWQnLFxuICAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAndHhJZDInLFxuICB9KVxuICBtYXRjaGVkT3JkZXIyITogTWF0Y2hPYnNPcmRlckVudGl0eSB8IG51bGw7XG59XG4iLCJpbXBvcnQgeyBDb2x1bW4sIEVudGl0eSwgSm9pbkNvbHVtbiwgTWFueVRvT25lLCBPbmVUb09uZSwgUHJpbWFyeUdlbmVyYXRlZENvbHVtbiB9IGZyb20gJ3R5cGVvcm0nO1xuaW1wb3J0IHsgVHJhbnNhY3Rpb25JbmZvIH0gZnJvbSAnLi4vYWNjb3VudC90cmFuc2FjdGlvbkluZm8uZW50aXR5JztcbmltcG9ydCB7IFRzVHhUeXBlIH0gZnJvbSAnLi9kdG8vdHNUeFR5cGUuZW51bSc7XG5pbXBvcnQgeyBPYnNPcmRlckVudGl0eSB9IGZyb20gJy4vb2JzT3JkZXIuZW50aXR5JztcbmltcG9ydCB7IFRzU2lkZSB9IGZyb20gJy4vdHNTaWRlLmVudW0nO1xuXG5ARW50aXR5KCdNYXRjaE9ic09yZGVyJywgeyBzY2hlbWE6ICdwdWJsaWMnfSlcbmV4cG9ydCBjbGFzcyBNYXRjaE9ic09yZGVyRW50aXR5IHtcbiAgQFByaW1hcnlHZW5lcmF0ZWRDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnQ4JyxcbiAgICBuYW1lOiAnaWQnXG4gIH0pXG4gIGlkITogbnVtYmVyO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZW51bScsXG4gICAgbmFtZTogJ3NpZGUnLFxuICAgIGVudW1OYW1lOiAnU0lERScsXG4gICAgZW51bTogW1xuICAgICAgVHNTaWRlLkJVWSxcbiAgICAgIFRzU2lkZS5TRUxMXG4gICAgXSxcbiAgICBkZWZhdWx0OiAoKSA9PiBgJyR7VHNTaWRlLkJVWX0nYCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gIH0pXG4gIHNpZGUhOiBUc1NpZGU7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnQ4JyxcbiAgICBuYW1lOiAndHhJZCcsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gIH0pXG4gIHR4SWQhOiBudW1iZXIgfCBudWxsO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50OCcsXG4gICAgbmFtZTogJ3R4SWQyJyxcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgfSlcbiAgdHhJZDIhOiBudW1iZXIgfCBudWxsO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50OCcsXG4gICAgbmFtZTogJ3JlZmVyZW5jZU9yZGVyJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gIH0pXG4gIHJlZmVyZW5jZU9yZGVyITogbnVtYmVyO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgbmFtZTogJ3JlcVR5cGUnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAwLFxuICB9KVxuICByZXFUeXBlITogbnVtYmVyOyBcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdtYXJrZXRQYWlyJyxcbiAgICBsZW5ndGg6IDEwMCxcbiAgICBkZWZhdWx0OiBgJ0VUSC9VU0RDJ2AsXG4gICAgbnVsbGFibGU6IGZhbHNlXG4gIH0pXG4gIG1hcmtldFBhaXIhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnbWF0Y2hlZE1RJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIGRlZmF1bHQ6IDBuLFxuICB9KVxuICBtYXRjaGVkTVEhOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnbWF0Y2hlZEJRJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIGRlZmF1bHQ6IDBuXG4gIH0pXG4gIG1hdGNoZWRCUSE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3RpbWVzdGFtcCB3aXRob3V0IHRpbWUgem9uZScsXG4gICAgbmFtZTogJ3RpbWVzdGFtcCcsXG4gICAgcHJlY2lzaW9uOiAzLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAnbm93KCknXG4gIH0pXG4gIHRpbWVzdGFtcCE6IERhdGU7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBuYW1lOiAnb3JkZXJTdGF0dXMnLFxuICAgIGRlZmF1bHQ6IDEsXG4gIH0pIFxuICBvcmRlclN0YXR1cyE6IG51bWJlcjtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIG5hbWU6ICdpc1ZvaWQnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICB9KSBcbiAgaXNWb2lkITogYm9vbGVhbjtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIG5hbWU6ICdpc0NhbmNlbCcsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gIH0pIFxuICBpc0NhbmNlbCE6IGJvb2xlYW47XG4gIEBNYW55VG9PbmUoXG4gICAgKCkgPT4gT2JzT3JkZXJFbnRpdHksXG4gICAgKG9ic09yZGVyOiBPYnNPcmRlckVudGl0eSkgPT4gb2JzT3JkZXIubWF0Y2hPcmRlcnMsXG4gICAge1xuICAgICAgb25VcGRhdGU6ICdDQVNDQURFJyxcbiAgICAgIG9uRGVsZXRlOiAnUkVTVFJJQ1QnXG4gICAgfSBcbiAgKVxuICBASm9pbkNvbHVtbih7XG4gICAgbmFtZTogJ3JlZmVyZW5jZU9yZGVyJyxcbiAgICByZWZlcmVuY2VkQ29sdW1uTmFtZTogJ2lkJyxcbiAgfSlcbiAgbWFpbk9yZGVyITogT2JzT3JkZXJFbnRpdHk7XG4gIEBPbmVUb09uZShcbiAgICAoKSA9PiBUcmFuc2FjdGlvbkluZm8sXG4gICAgKHRyYW5zYWN0aW9uOiBUcmFuc2FjdGlvbkluZm8pID0+IHRyYW5zYWN0aW9uLm1hdGNoZWRPcmRlcixcbiAgICB7XG4gICAgICBvbkRlbGV0ZTogJ1JFU1RSSUNUJyxcbiAgICAgIG9uVXBkYXRlOiAnQ0FTQ0FERSdcbiAgICB9XG4gIClcbiAgQEpvaW5Db2x1bW4oe1xuICAgIG5hbWU6ICd0eElkJyxcbiAgICByZWZlcmVuY2VkQ29sdW1uTmFtZTogJ3R4SWQnICAgXG4gIH0pXG4gIG1hdGNoZWRUeCE6IFRyYW5zYWN0aW9uSW5mbyB8IG51bGw7XG4gIEBPbmVUb09uZShcbiAgICAoKSA9PiBUcmFuc2FjdGlvbkluZm8sXG4gICAgKHRyYW5zYWN0aW9uOiBUcmFuc2FjdGlvbkluZm8pID0+IHRyYW5zYWN0aW9uLm1hdGNoZWRPcmRlcjIsXG4gICAge1xuICAgICAgb25EZWxldGU6ICdSRVNUUklDVCcsXG4gICAgICBvblVwZGF0ZTogJ0NBU0NBREUnXG4gICAgfVxuICApXG4gIEBKb2luQ29sdW1uKHtcbiAgICBuYW1lOiAndHhJZDInLFxuICAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAndHhJZCcgICBcbiAgfSlcbiAgbWF0Y2hlZFR4MiE6IFRyYW5zYWN0aW9uSW5mbyB8IG51bGw7XG59XG4iLCJleHBvcnQgZW51bSBUc1NpZGUge1xuICBCVVkgPSAnMCcsXG4gIFNFTEwgPSAnMScsXG59IiwiaW1wb3J0IHsgQ29sdW1uLCBFbnRpdHksIEpvaW5Db2x1bW4sIE9uZVRvTWFueSwgUHJpbWFyeUdlbmVyYXRlZENvbHVtbiB9IGZyb20gJ3R5cGVvcm0nO1xuaW1wb3J0IHsgQmFzZVRpbWVFbnRpdHkgfSBmcm9tICcuLi9jb21tb24vYmFzZVRpbWVFbnRpdHknO1xuaW1wb3J0IHsgQkxPQ0tfU1RBVFVTIH0gZnJvbSAnLi9ibG9ja1N0YXR1cy5lbnVtJztcbmltcG9ydCB7IFRyYW5zYWN0aW9uSW5mbyB9IGZyb20gJy4vdHJhbnNhY3Rpb25JbmZvLmVudGl0eSc7XG5cbkBFbnRpdHkoJ0Jsb2NrSW5mb3JtYXRpb24nLCB7IHNjaGVtYTogJ3B1YmxpYycgfSlcbmV4cG9ydCBjbGFzcyBCbG9ja0luZm9ybWF0aW9uIGV4dGVuZHMgQmFzZVRpbWVFbnRpdHkge1xuICBAUHJpbWFyeUdlbmVyYXRlZENvbHVtbih7XG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIG5hbWU6ICdibG9ja051bWJlcidcbiAgfSlcbiAgYmxvY2tOdW1iZXIhOiBudW1iZXI7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAnYmxvY2tIYXNoJyxcbiAgICBsZW5ndGg6IDI1NixcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgfSlcbiAgYmxvY2tIYXNoITogc3RyaW5nIHwgbnVsbDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdMMVRyYW5zYWN0aW9uSGFzaCcsXG4gICAgbGVuZ3RoOiA1MTIsXG4gIH0pXG4gIEwxVHJhbnNhY3Rpb25IYXNoITogc3RyaW5nO1xuICBAQ29sdW1uKHsgXG4gICAgdHlwZTogJ3RpbWVzdGFtcCB3aXRob3V0IHRpbWUgem9uZScsXG4gICAgbmFtZTogJ3ZlcmlmaWVkQXQnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgfSlcbiAgdmVyaWZpZWRBdCE6IERhdGU7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJywgIFxuICAgIG5hbWU6ICdvcGVyYXRvckFkZHJlc3MnLFxuICAgIGxlbmd0aDogMjU2LFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgfSlcbiAgb3BlcmF0b3JBZGRyZXNzITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndGV4dCcsXG4gICAgbmFtZTogJ3Jhd0RhdGEnLFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICB9KVxuICByYXdEYXRhITogc3RyaW5nIHwgbnVsbDtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2pzb24nLFxuICAgIG5hbWU6ICdjYWxsRGF0YScsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gICAgZGVmYXVsdDogKCkgPT4gJ1xcJ3t9XFwnJyxcbiAgfSlcbiAgY2FsbERhdGEhOiBvYmplY3QgfCAne30nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnanNvbicsXG4gICAgbmFtZTogJ3Byb29mJyxcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgICBkZWZhdWx0OiAoKSA9PiAnXFwne31cXCcnLFxuICB9KVxuICBwcm9vZiE6IG9iamVjdCB8ICd7fSc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdlbnVtJyxcbiAgICBuYW1lOiAnYmxvY2tTdGF0dXMnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBlbnVtTmFtZTogJ0JMT0NLX1NUQVRVUycsXG4gICAgZW51bTogW1xuICAgICAgQkxPQ0tfU1RBVFVTLlBST0NFU1NJTkcsXG4gICAgICBCTE9DS19TVEFUVVMuTDJFWEVDVVRFRCxcbiAgICAgIEJMT0NLX1NUQVRVUy5MMkNPTkZJUk1FRCxcbiAgICAgIEJMT0NLX1NUQVRVUy5MMUNPTkZJUk1FRFxuICAgIF0sXG4gICAgZGVmYXVsdDogYCcke0JMT0NLX1NUQVRVUy5QUk9DRVNTSU5HfSdgLFxuICB9KVxuICBibG9ja1N0YXR1cyE6IEJMT0NLX1NUQVRVUztcbiAgQE9uZVRvTWFueShcbiAgICAoKSA9PiBUcmFuc2FjdGlvbkluZm8sXG4gICAgdHJhbnNhY3Rpb25JbmZvID0+IHRyYW5zYWN0aW9uSW5mby5ibG9ja0luZm8sXG4gIClcbiAgQEpvaW5Db2x1bW4oe1xuICAgIG5hbWU6ICdibG9ja051bWJlcicsXG4gICAgcmVmZXJlbmNlZENvbHVtbk5hbWU6ICdibG9ja051bWJlcidcbiAgfSlcbiAgdHJhbnNhY3Rpb25JbmZvcyE6IFRyYW5zYWN0aW9uSW5mb1tdIHwgbnVsbDtcbn0iLCJleHBvcnQgZW51bSBCTE9DS19TVEFUVVMge1xuICBQUk9DRVNTSU5HPSdQUk9DRVNTSU5HJyxcbiAgTDJFWEVDVVRFRD0nTDJFWEVDVVRFRCcsXG4gIEwyQ09ORklSTUVEPSdMMkNPTkZJUk1FRCcsXG4gIEwxQ09ORklSTUVEPSdMMUNPTkZJUk1FRCcsXG59OyIsImV4cG9ydCBlbnVtIFRTX1NUQVRVUyB7XG4gIFBFTkRJTkc9J1BFTkRJTkcnLFxuICBQUk9DRVNTSU5HPSdQUk9DRVNTSU5HJyxcbiAgTDJFWEVDVVRFRD0nTDJFWEVDVVRFRCcsXG4gIEwyQ09ORklSTUVEPSdMMkNPTkZJUk1FRCcsXG4gIEwxQ09ORklSTUVEPSdMMUNPTkZJUk1FRCcsXG4gIEZBSUxFRD0nRkFJTEVEJyxcbiAgUkVKRUNURUQ9J1JFSkVDVEVEJ1xufVxuIiwiaW1wb3J0IHsgQ29sdW1uLCBFbnRpdHksIEpvaW5Db2x1bW4sIE9uZVRvT25lLCBQcmltYXJ5Q29sdW1uIH0gZnJvbSAndHlwZW9ybSc7XG5pbXBvcnQgeyBPYnNPcmRlckVudGl0eSB9IGZyb20gJy4vb2JzT3JkZXIuZW50aXR5JztcbmltcG9ydCB7IE9ic09yZGVyTGVhZkVudGl0eSB9IGZyb20gJy4vb2JzT3JkZXJMZWFmLmVudGl0eSc7XG5cbkBFbnRpdHkoJ09ic09yZGVyTGVhZk1lcmtsZVRyZWVOb2RlJywgeyBzY2hlbWE6ICdwdWJsaWMnIH0pIFxuZXhwb3J0IGNsYXNzIE9ic09yZGVyTGVhZk1lcmtsZVRyZWVOb2RlIHtcbiAgQFByaW1hcnlDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnaWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgcHJpbWFyeTogdHJ1ZSxcbiAgfSlcbiAgaWQhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnaGFzaCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogMG4sXG4gIH0pXG4gIGhhc2ghOiBiaWdpbnQ7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnbGVhZklkJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIG51bGxhYmxlOiB0cnVlXG4gIH0pXG4gIGxlYWZJZCE6IGJpZ2ludCB8IG51bGw7XG4gIEBPbmVUb09uZShcbiAgICAoKSA9PiBPYnNPcmRlckxlYWZFbnRpdHksXG4gICAgKG9ic09yZGVyTGVhZjogT2JzT3JkZXJMZWFmRW50aXR5KSA9PiBvYnNPcmRlckxlYWYubWVya2xlVHJlZU5vZGUsXG4gIClcbiAgQEpvaW5Db2x1bW4oe1xuICAgIG5hbWU6ICdsZWFmSWQnLFxuICAgIHJlZmVyZW5jZWRDb2x1bW5OYW1lOiAnb3JkZXJMZWFmSWQnXG4gIH0pXG4gIGxlYWYhOiBPYnNPcmRlckxlYWZFbnRpdHkgfCBudWxsO1xufSIsImltcG9ydCB7IEJvZHksIENvbnRyb2xsZXIsIEdldCwgTG9nZ2VyLCBQb3N0LCBRdWVyeSB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IE1hcmtldFBhaXJJbmZvU2VydmljZSB9IGZyb20gJy4uL2F1Y3Rpb25PcmRlci9tYXJrZXRQYWlySW5mby5zZXJ2aWNlJztcbmltcG9ydCB7IFVwZGF0ZUFjY291bnRUcmVlRHRvIH0gZnJvbSAnLi9kdG8vdXBkYXRlQWNjb3VudFRyZWUuZHRvJztcbmltcG9ydCB7IFVwZGF0ZVRva2VuVHJlZUR0byB9IGZyb20gJy4vZHRvL3VwZGF0ZVRva2VuVHJlZS5kdG8nO1xuaW1wb3J0IHsgVHNBY2NvdW50VHJlZVNlcnZpY2UgfSBmcm9tICcuL3RzQWNjb3VudFRyZWUuc2VydmljZSc7XG5pbXBvcnQgeyBUc1Rva2VuVHJlZVNlcnZpY2UgfSBmcm9tICcuL3RzVG9rZW5UcmVlLnNlcnZpY2UnO1xuaW1wb3J0IHsgTWFya2V0U2VsbEJ1eVBhaXIgfSBmcm9tICcuLi9hdWN0aW9uT3JkZXIvZHRvL01hcmtldFBhaXJJbmZvLmR0byc7XG5pbXBvcnQgeyBUc1NpZGUgfSBmcm9tICcuLi9hdWN0aW9uT3JkZXIvdHNTaWRlLmVudW0nO1xuaW1wb3J0IHsgT2JzT3JkZXJUcmVlU2VydmljZSB9IGZyb20gJy4uL2F1Y3Rpb25PcmRlci9vYnNPcmRlclRyZWUuc2VydmljZSc7XG5pbXBvcnQgeyBVcGRhdGVPYnNPcmRlclRyZWVEdG8gfSBmcm9tICcuLi9hdWN0aW9uT3JkZXIvZHRvL3VwZGF0ZU9ic09yZGVyVHJlZS5kdG8nO1xuXG5AQ29udHJvbGxlcignbWVya2xlVHJlZScpXG5leHBvcnQgY2xhc3MgTWVya2xlVHJlZUNvbnRyb2xsZXIge1xuICBwcml2YXRlIGxvZ2dlcjogTG9nZ2VyID0gbmV3IExvZ2dlcihNZXJrbGVUcmVlQ29udHJvbGxlci5uYW1lKTtcbiAgcHJpdmF0ZSBhY2NvdW50TGVhZklkOiBiaWdpbnQgPSAxMDBuO1xuICAvLyBwcml2YXRlIHRva2VuZUxlYWZJZDogYmlnaW50ID0gMG47XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgdHNBY2NvdW50VHJlZVNlcnZpY2U6IFRzQWNjb3VudFRyZWVTZXJ2aWNlLCAgXG4gICAgcHJpdmF0ZSByZWFkb25seSB0c1Rva2VuVHJlZVNlcnZpY2U6IFRzVG9rZW5UcmVlU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IG1hcmtldFBhaXJJbmZvU2VydmljZTogTWFya2V0UGFpckluZm9TZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgb2JzT3JkZXJUcmVlU2VydmljZTogT2JzT3JkZXJUcmVlU2VydmljZSxcbiAgKSB7XG4gICAgdGhpcy50c0FjY291bnRUcmVlU2VydmljZS5nZXRDdXJyZW50TGVhZklkQ291bnQoKS50aGVuKChpZCkgPT4ge1xuICAgICAgdGhpcy5hY2NvdW50TGVhZklkID0gQmlnSW50KGlkKSsgMTAwbjtcbiAgICAgIGNvbnNvbGUubG9nKGBhY2NvdW50TGVhZklkOiAke3RoaXMuYWNjb3VudExlYWZJZH1gKTtcbiAgICB9KTtcbiAgfVxuXG4gIEBQb3N0KCd1cGRhdGVBY2NvdW50VHJlZScpXG4gIGFzeW5jIHVwZGF0ZUFjY291bnRUcmVlKEBCb2R5KCkgdXBkYXRlQWNjb3VudFRyZWVEdG86IFVwZGF0ZUFjY291bnRUcmVlRHRvKSB7XG4gICAgY29uc29sZS50aW1lKCdjb250cm9sbGVyIHVwZGF0ZUFjY291bnRUcmVlJyk7XG4gICAgYXdhaXQgdGhpcy50c0FjY291bnRUcmVlU2VydmljZS51cGRhdGVMZWFmKFxuICAgICAgQmlnSW50KHVwZGF0ZUFjY291bnRUcmVlRHRvLmxlYWZJZCksXG4gICAgICB1cGRhdGVBY2NvdW50VHJlZUR0b1xuICAgICAgKTtcbiAgICBjb25zb2xlLnRpbWVFbmQoJ2NvbnRyb2xsZXIgdXBkYXRlQWNjb3VudFRyZWUnKTtcbiAgfVxuICBAUG9zdCgndXBkYXRlVG9rZW5UcmVlJylcbiAgYXN5bmMgdXBkYXRlVG9rZW5UcmVlKEBCb2R5KCkgdXBkYXRlVG9rZW5UcmVlRHRvOiBVcGRhdGVUb2tlblRyZWVEdG8pIHtcbiAgICBjb25zb2xlLnRpbWUoJ2NvbnRyb2xsZXIgdXBkYXRlVG9rZW5UcmVlJyk7XG4gICAgLy8gY29uc3QgdG9rZW5lTGVhZklkID0gYXdhaXQgdGhpcy50c1Rva2VuVHJlZVNlcnZpY2UuZ2V0Q3VycmVudExlYWZJZENvdW50KEJpZ0ludCh1cGRhdGVUb2tlblRyZWVEdG8uYWNjb3VudElkKSk7XG4gICAgYXdhaXQgdGhpcy50c1Rva2VuVHJlZVNlcnZpY2UudXBkYXRlTGVhZihcbiAgICAgIEJpZ0ludCh1cGRhdGVUb2tlblRyZWVEdG8ubGVhZklkKSxcbiAgICAgIHVwZGF0ZVRva2VuVHJlZUR0byxcbiAgICAgICk7XG4gICAgY29uc29sZS50aW1lRW5kKCdjb250cm9sbGVyIHVwZGF0ZVRva2VuVHJlZScpO1xuICB9XG4gIEBQb3N0KCd1cGRhdGVPYnNPcmRlclRyZWUnKVxuICBhc3luYyB1cGRhdGVPYnNPcmRlclRyZWUoQEJvZHkoKSB1cGRhdGVPYnNPcmRlclRyZWVEdG86IFVwZGF0ZU9ic09yZGVyVHJlZUR0bykge1xuICAgIGNvbnNvbGUudGltZSgnY29udHJvbGxlciB1cGRhdGVPYnNPcmRlclRyZWUnKTtcbiAgICBhd2FpdCB0aGlzLm9ic09yZGVyVHJlZVNlcnZpY2UudXBkYXRlTGVhZihcbiAgICAgIEJpZ0ludCh1cGRhdGVPYnNPcmRlclRyZWVEdG8ub3JkZXJMZWFmSWQpLFxuICAgICAgdXBkYXRlT2JzT3JkZXJUcmVlRHRvXG4gICAgKTtcbiAgICBjb25zb2xlLnRpbWVFbmQoJ2NvbnRyb2xsZXIgdXBkYXRlT2JzT3JkZXJUcmVlJyk7XG4gIH1cbiAgQEdldCgnbWFya2V0UGFpckluZm8nKVxuICBhc3luYyBnZXRNYXJrZXRQYWlySW5mbyhAUXVlcnkoKSBkdG86IE1hcmtldFNlbGxCdXlQYWlyKSB7XG4gICAgY29uc29sZS5sb2coZHRvKTtcbiAgICBjb25zdCBwYWlyID0gW3tcbiAgICAgIG1haW5Ub2tlbklkOiBkdG8uc2VsbFRva2VuSWQsXG4gICAgICBiYXNlVG9rZW5JZDogZHRvLmJ1eVRva2VuSWQsXG4gICAgfSwge1xuICAgICAgbWFpblRva2VuSWQ6IGR0by5idXlUb2tlbklkLFxuICAgICAgYmFzZVRva2VuSWQ6IGR0by5zZWxsVG9rZW5JZCxcbiAgICB9XVxuICAgIGNvbnN0IG1hcmtldFBhaXJJbmZvID0gYXdhaXQgdGhpcy5tYXJrZXRQYWlySW5mb1NlcnZpY2UuZmluZE9uZU1hcmtldFBhaXJJbmZvKHtwYWlyczogcGFpcn0pO1xuICAgIGNvbnN0IHNpZGUgPSBtYXJrZXRQYWlySW5mby5tYWluVG9rZW5JZCA9PT0gZHRvLmJ1eVRva2VuSWQgPyAgVHNTaWRlLkJVWTogVHNTaWRlLlNFTEw7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLm1hcmtldFBhaXJJbmZvLFxuICAgICAgc2lkZSxcbiAgICB9O1xuICB9XG59IiwiaW1wb3J0IHsgSW5qZWN0YWJsZSwgTm90Rm91bmRFeGNlcHRpb24gfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBJbmplY3RSZXBvc2l0b3J5IH0gZnJvbSAnQG5lc3Rqcy90eXBlb3JtJztcbmltcG9ydCB7IFJlcG9zaXRvcnkgfSBmcm9tICd0eXBlb3JtJztcbmltcG9ydCB7IE1hcmtldFBhaXJJbmZvUmVxdWVzdER0bywgTWFya2V0UGFpckluZm9SZXNwb25zZUR0byB9IGZyb20gJy4vZHRvL01hcmtldFBhaXJJbmZvLmR0byc7XG5pbXBvcnQgeyBNYXJrZXRQYWlySW5mb0VudGl0eSB9IGZyb20gJy4vbWFya2V0UGFpckluZm8uZW50aXR5JztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1hcmtldFBhaXJJbmZvU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3RSZXBvc2l0b3J5KE1hcmtldFBhaXJJbmZvRW50aXR5KVxuICAgIHByaXZhdGUgcmVhZG9ubHkgbWFya2V0UGFpckluZm9SZXBvc2l0b3J5OiBSZXBvc2l0b3J5PE1hcmtldFBhaXJJbmZvRW50aXR5PixcbiAgKSB7fVxuICBhc3luYyBmaW5kT25lTWFya2V0UGFpckluZm8obWFya2V0UGFpckR0bzogTWFya2V0UGFpckluZm9SZXF1ZXN0RHRvKTogUHJvbWlzZTxNYXJrZXRQYWlySW5mb1Jlc3BvbnNlRHRvPiB7XG4gICAgY29uc29sZS5sb2cobWFya2V0UGFpckR0byk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1hcmtldFBhaXJJbmZvID0gYXdhaXQgdGhpcy5tYXJrZXRQYWlySW5mb1JlcG9zaXRvcnkuZmluZE9uZU9yRmFpbCh7XG4gICAgICAgIHNlbGVjdDogWydtYWluVG9rZW5JZCcsICdiYXNlVG9rZW5JZCcsICdtYXJrZXRQYWlyJ10sXG4gICAgICAgIHdoZXJlOiBbe1xuICAgICAgICAgIG1haW5Ub2tlbklkOiBtYXJrZXRQYWlyRHRvLnBhaXJzWzBdLm1haW5Ub2tlbklkLFxuICAgICAgICAgIGJhc2VUb2tlbklkOiBtYXJrZXRQYWlyRHRvLnBhaXJzWzBdLmJhc2VUb2tlbklkLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgbWFpblRva2VuSWQ6IG1hcmtldFBhaXJEdG8ucGFpcnNbMV0ubWFpblRva2VuSWQsXG4gICAgICAgICAgYmFzZVRva2VuSWQ6IG1hcmtldFBhaXJEdG8ucGFpcnNbMV0uYmFzZVRva2VuSWQsXG4gICAgICAgIH1dXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBtYXJrZXRQYWlySW5mbztcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IE5vdEZvdW5kRXhjZXB0aW9uKCdNYXJrZXRQYWlySW5mbyBub3QgZm91bmQnKTtcbiAgICB9XG4gIH1cbn0iLCJpbXBvcnQgeyBDb2x1bW4sIEVudGl0eSwgUHJpbWFyeUdlbmVyYXRlZENvbHVtbiB9IGZyb20gJ3R5cGVvcm0nO1xuXG5ARW50aXR5KCdNYXJrZXRQYWlySW5mbycsIHtzY2hlbWE6ICdwdWJsaWMnfSlcbmV4cG9ydCBjbGFzcyBNYXJrZXRQYWlySW5mb0VudGl0eSB7XG4gIEBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgbmFtZTogJ2lkJ1xuICB9KVxuICBpZCE6IG51bWJlcjtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdtYWluVG9rZW5JZCcsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBkZWZhdWx0OiAwbixcbiAgICBudWxsYWJsZTogZmFsc2VcbiAgfSlcbiAgbWFpblRva2VuSWQhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBuYW1lOiAnYmFzZVRva2VuSWQnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgZGVmYXVsdDogMG4sXG4gICAgbnVsbGFibGU6IGZhbHNlXG4gIH0pXG4gIGJhc2VUb2tlbklkITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ21hcmtldFBhaXInLFxuICAgIGxlbmd0aDogJzEwMCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6ICgpID0+ICdFVEgvVVNEQydcbiAgfSlcbiAgbWFya2V0UGFpciE6IHN0cmluZztcbn0iLCJpbXBvcnQgeyBBcGlQcm9wZXJ0eSB9IGZyb20gXCJAbmVzdGpzL3N3YWdnZXJcIjtcblxuZXhwb3J0IGNsYXNzIFVwZGF0ZUFjY291bnRUcmVlRHRvIHtcbiAgQEFwaVByb3BlcnR5KClcbiAgbGVhZklkITogc3RyaW5nO1xuICBAQXBpUHJvcGVydHkoKVxuICB0c0FkZHIhOiBzdHJpbmc7XG4gIEBBcGlQcm9wZXJ0eSgpXG4gIG5vbmNlITogc3RyaW5nO1xuICBAQXBpUHJvcGVydHkoKVxuICB0b2tlblJvb3QhOiBzdHJpbmc7XG59IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQG5lc3Rqcy9zd2FnZ2VyXCIpOzsiLCJpbXBvcnQgeyBBcGlQcm9wZXJ0eSB9IGZyb20gXCJAbmVzdGpzL3N3YWdnZXJcIjtcblxuZXhwb3J0IGNsYXNzIFVwZGF0ZVRva2VuVHJlZUR0byB7XG4gIEBBcGlQcm9wZXJ0eSgpXG4gIGxvY2tlZEFtdCE6IHN0cmluZztcbiAgQEFwaVByb3BlcnR5KClcbiAgYXZhaWxhYmxlQW10ITogc3RyaW5nO1xuICBAQXBpUHJvcGVydHkoKVxuICBsZWFmSWQhOiBzdHJpbmc7XG4gIEBBcGlQcm9wZXJ0eSgpXG4gIGFjY291bnRJZCE6IHN0cmluZztcbn0iLCJpbXBvcnQgeyBJbmplY3RhYmxlLCBMb2dnZXIgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBJbmplY3RSZXBvc2l0b3J5IH0gZnJvbSAnQG5lc3Rqcy90eXBlb3JtJztcbmltcG9ydCB7IEFjY291bnRNZXJrbGVUcmVlTm9kZSB9IGZyb20gJy4vYWNjb3VudE1lcmtsZVRyZWVOb2RlLmVudGl0eSc7XG5pbXBvcnQgeyBBY2NvdW50TGVhZk5vZGUgfSBmcm9tICcuL2FjY291bnRMZWFmTm9kZS5lbnRpdHknO1xuaW1wb3J0IHsgQ29ubmVjdGlvbiwgUmVwb3NpdG9yeSB9IGZyb20gJ3R5cGVvcm0nO1xuaW1wb3J0IHsgdG9UcmVlTGVhZiwgdHNIYXNoRnVuYyB9IGZyb20gJy4uL2NvbW1vbi90cy1oZWxwZXInO1xuaW1wb3J0IHsgVHNNZXJrbGVUcmVlIH0gZnJvbSAnLi4vY29tbW9uL3RzTWVya2xlVHJlZSc7XG5pbXBvcnQgeyBVcGRhdGVBY2NvdW50VHJlZUR0byB9IGZyb20gJy4vZHRvL3VwZGF0ZUFjY291bnRUcmVlLmR0byc7XG5pbXBvcnQgeyBDb25maWdTZXJ2aWNlIH0gZnJvbSAnQG5lc3Rqcy9jb25maWcnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVHNBY2NvdW50VHJlZVNlcnZpY2UgZXh0ZW5kcyBUc01lcmtsZVRyZWU8QWNjb3VudExlYWZOb2RlPntcbiAgcHJpdmF0ZSBsb2dnZXI6IExvZ2dlciA9IG5ldyBMb2dnZXIoVHNBY2NvdW50VHJlZVNlcnZpY2UubmFtZSk7XG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3RSZXBvc2l0b3J5KEFjY291bnRMZWFmTm9kZSlcbiAgICBwcml2YXRlIGFjY291bnRMZWFmTm9kZVJlcG9zaXRvcnk6IFJlcG9zaXRvcnk8QWNjb3VudExlYWZOb2RlPixcbiAgICBASW5qZWN0UmVwb3NpdG9yeShBY2NvdW50TWVya2xlVHJlZU5vZGUpXG4gICAgcHJpdmF0ZSBhY2NvdW50TWVya2xlVHJlZVJlcG9zaXRvcnk6IFJlcG9zaXRvcnk8QWNjb3VudE1lcmtsZVRyZWVOb2RlPixcbiAgICBwcml2YXRlIGNvbm5lY3Rpb246IENvbm5lY3Rpb24sXG4gICAgcHJpdmF0ZSByZWFkb25seSBjb25maWdTZXJ2aWNlOiBDb25maWdTZXJ2aWNlLFxuICApIHtcbiAgICBjb25zb2xlLnRpbWUoJ2NyZWF0ZSBBY2NvdW50IFRyZWUnKTtcbiAgICBzdXBlcihjb25maWdTZXJ2aWNlLmdldDxudW1iZXI+KCdBQ0NPVU5UU19UUkVFX0hFSUdIVCcsIDMyKSwgdHNIYXNoRnVuYyk7XG4gICAgY29uc29sZS50aW1lRW5kKCdjcmVhdGUgQWNjb3VudCBUcmVlJyk7XG4gIH1cbiAgYXN5bmMgZ2V0Q3VycmVudExlYWZJZENvdW50KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgY29uc3QgbGVhZklkQ291bnQgPSBhd2FpdCB0aGlzLmFjY291bnRMZWFmTm9kZVJlcG9zaXRvcnkuY291bnQoKTtcbiAgICByZXR1cm4gbGVhZklkQ291bnQ7XG4gIH1cbiAgZ2V0TGVhZkRlZmF1bHRWYXZsdWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdG9UcmVlTGVhZihbMG4sIDBuLCAwbl0pO1xuICB9XG4gIGFzeW5jIHVwZGF0ZUxlYWYobGVhZklkOiBiaWdpbnQsIHZhbHVlOiBVcGRhdGVBY2NvdW50VHJlZUR0bykge1xuICAgIGNvbnNvbGUudGltZSgndXBkYXRlTGVhZiBmb3IgYWNjb3VudCB0cmVlJyk7XG4gICAgY29uc3QgcHJmID0gdGhpcy5nZXRQcm9vZklkcyhsZWFmSWQpO1xuICAgIGNvbnN0IGlkID0gdGhpcy5nZXRMZWFmSWRJblRyZWUobGVhZklkKTtcbiAgICAvLyBzZXR1cCB0cmFuc2FjdGlvblxuICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi50cmFuc2FjdGlvbihhc3luYyAobWFuYWdlcikgPT4ge1xuICAgICAgYXdhaXQgbWFuYWdlci51cHNlcnQoQWNjb3VudE1lcmtsZVRyZWVOb2RlLCB7XG4gICAgICAgIGlkOiBpZC50b1N0cmluZygpLFxuICAgICAgICBsZWFmSWQ6IGxlYWZJZCxcbiAgICAgICAgaGFzaDogQmlnSW50KHRvVHJlZUxlYWYoW1xuICAgICAgICAgIEJpZ0ludCh2YWx1ZS50c0FkZHIpLCBcbiAgICAgICAgICBCaWdJbnQodmFsdWUubm9uY2UpLCBcbiAgICAgICAgICBCaWdJbnQodmFsdWUudG9rZW5Sb290KV0pKSBcbiAgICAgICAgfSwgWydpZCddKTtcbiAgICAgIGF3YWl0IG1hbmFnZXIudXBzZXJ0KEFjY291bnRMZWFmTm9kZSwge1xuICAgICAgICB0c0FkZHI6IEJpZ0ludCh2YWx1ZS50c0FkZHIpLFxuICAgICAgICBub25jZTogQmlnSW50KHZhbHVlLm5vbmNlKSxcbiAgICAgICAgdG9rZW5Sb290OiBCaWdJbnQodmFsdWUudG9rZW5Sb290KSxcbiAgICAgICAgbGVhZklkOiBsZWFmSWQudG9TdHJpbmcoKSxcbiAgICAgIH0sIFsnbGVhZklkJ10pO1xuICAgICAgLy8gdXBkYXRlIHRyZWVcbiAgICAgIGZvciAobGV0IGkgPSBpZCwgaiA9IDA7IGkgPiAxbjsgaSA9IGkgPj4gMW4pIHtcbiAgICAgICAgY29uc3QgW2lWYWx1ZSwgalZhbHVlXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICB0aGlzLmFjY291bnRNZXJrbGVUcmVlUmVwb3NpdG9yeS5maW5kT25lQnkoe2lkOiBpLnRvU3RyaW5nKCl9KSxcbiAgICAgICAgICB0aGlzLmFjY291bnRNZXJrbGVUcmVlUmVwb3NpdG9yeS5maW5kT25lQnkoe2lkOiBwcmZbal0udG9TdHJpbmcoKX0pXG4gICAgICAgIF0pO1xuICAgICAgICBjb25zdCBqTGV2ZWwgPSBNYXRoLmZsb29yKE1hdGgubG9nMihOdW1iZXIocHJmW2pdKSkpO1xuICAgICAgICBjb25zdCBpTGV2ZWwgPSBNYXRoLmZsb29yKE1hdGgubG9nMihOdW1iZXIoaSkpKTtcbiAgICAgICAgY29uc3Qgakhhc2hWYWx1ZTogc3RyaW5nID0gKGpWYWx1ZSA9PSBudWxsKT8gdGhpcy5nZXREZWZhdWx0SGFzaEJ5TGV2ZWwoakxldmVsKTogalZhbHVlLmhhc2gudG9TdHJpbmcoKTtcbiAgICAgICAgY29uc3QgaUhhc2hWYWx1ZTogc3RyaW5nID0gKGlWYWx1ZSA9PSBudWxsKT8gdGhpcy5nZXREZWZhdWx0SGFzaEJ5TGV2ZWwoaUxldmVsKTogaVZhbHVlLmhhc2gudG9TdHJpbmcoKTtcbiAgICAgICAgbGV0IHIgPSAoaWQgJSAybiA9PSAwbikgP1sgakhhc2hWYWx1ZSwgaUhhc2hWYWx1ZV0gOiBbIGlIYXNoVmFsdWUsIGpIYXNoVmFsdWVdO1xuICAgICAgICBjb25zdCBoYXNoID0gdGhpcy5oYXNoRnVuYyhyKTtcbiAgICAgICAgY29uc3Qgam9icyA9IFtdO1xuICAgICAgICBpZiAoaVZhbHVlID09IG51bGwpIHtcbiAgICAgICAgICBqb2JzLnB1c2gobWFuYWdlci51cHNlcnQoQWNjb3VudE1lcmtsZVRyZWVOb2RlLCB7XG4gICAgICAgICAgICBpZDogaS50b1N0cmluZygpLFxuICAgICAgICAgICAgaGFzaDogQmlnSW50KGlIYXNoVmFsdWUpXG4gICAgICAgICAgfSwgWydpZCddKSk7XG4gICAgICAgIH0gXG4gICAgICAgIGlmIChqVmFsdWUgPT0gbnVsbCAmJiBqIDwgcHJmLmxlbmd0aCkge1xuICAgICAgICAgIGpvYnMucHVzaChtYW5hZ2VyLnVwc2VydChBY2NvdW50TWVya2xlVHJlZU5vZGUsIHtcbiAgICAgICAgICAgIGlkOiBwcmZbal0udG9TdHJpbmcoKSxcbiAgICAgICAgICAgIGhhc2g6IEJpZ0ludChqSGFzaFZhbHVlKVxuICAgICAgICAgIH0sIFsnaWQnXSkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVwZGF0ZVJvb3QgPSBpID4+IDFuO1xuICAgICAgICBpZiAoIHVwZGF0ZVJvb3QgPj0gMW4pIHtcbiAgICAgICAgICBqb2JzLnB1c2gobWFuYWdlci51cHNlcnQoQWNjb3VudE1lcmtsZVRyZWVOb2RlLCB7XG4gICAgICAgICAgICBpZDogdXBkYXRlUm9vdC50b1N0cmluZygpLFxuICAgICAgICAgICAgaGFzaDogQmlnSW50KGhhc2gpXG4gICAgICAgICAgfSwgWydpZCddKSk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoam9icyk7XG4gICAgICAgIGorKztcbiAgICAgIH1cbiAgICB9KTtcbiAgICAvLyB9XG4gICAgY29uc29sZS50aW1lRW5kKCd1cGRhdGVMZWFmIGZvciBhY2NvdW50IHRyZWUnKTtcbiAgfVxuICBhc3luYyBnZXRMZWFmKGxlYWZfaWQ6IGJpZ2ludCwgb3RoZXJQYXlsb2FkOiBhbnkpOiBQcm9taXNlPEFjY291bnRMZWFmTm9kZSB8IG51bGw+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmFjY291bnRMZWFmTm9kZVJlcG9zaXRvcnkuZmluZE9uZUJ5KHtsZWFmSWQ6IGxlYWZfaWQudG9TdHJpbmcoKX0pO1xuICAgIGlmIChyZXN1bHQgPT0gbnVsbCkge1xuICAgICAgLy8gY2hlY2sgbGV2ZWxcbiAgICAgIGNvbnN0IGlkID0gdGhpcy5nZXRMZWFmSWRJblRyZWUobGVhZl9pZCk7XG4gICAgICBjb25zdCBsZXZlbCA9IE1hdGguZmxvb3IoTWF0aC5sb2cyKE51bWJlcihpZCkpKTtcbiAgICAgIGNvbnN0IGhhc2ggPSB0aGlzLmdldERlZmF1bHRIYXNoQnlMZXZlbChsZXZlbCk7XG4gICAgICAvLyBzZXR1cCB0cmFuc2FjdGlvblxuICAgICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLnRyYW5zYWN0aW9uKGFzeW5jIChtYW5hZ2VyKSA9PiB7XG4gICAgICAgIC8vIGluc2VydCB0aGlzIG51bGwgaGFzaCBvbiB0aGlzIG5vZGVcbiAgICAgICAgYXdhaXQgbWFuYWdlci5pbnNlcnQoQWNjb3VudE1lcmtsZVRyZWVOb2RlLCB7XG4gICAgICAgICAgbGVhZklkOiBsZWFmX2lkLFxuICAgICAgICAgIGlkOiBpZC50b1N0cmluZygpLFxuICAgICAgICAgIGhhc2g6IEJpZ0ludChoYXNoKVxuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgbWFuYWdlci5pbnNlcnQoQWNjb3VudExlYWZOb2RlLCB7XG4gICAgICAgICAgbGVhZklkOiBsZWFmX2lkLnRvU3RyaW5nKCksXG4gICAgICAgICAgdHNBZGRyOiAwbixcbiAgICAgICAgICBub25jZTogMG4sXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5hY2NvdW50TGVhZk5vZGVSZXBvc2l0b3J5LmZpbmRPbmVCeSh7bGVhZklkOiBsZWFmX2lkLnRvU3RyaW5nKCl9KTsgICBcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDsgIFxuICB9XG4gIGFzeW5jIGdldFJvb3QoKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5hY2NvdW50TWVya2xlVHJlZVJlcG9zaXRvcnkuZmluZE9uZUJ5KHtcbiAgICAgIGlkOiAxbi50b1N0cmluZygpLFxuICAgIH0pO1xuICAgIGlmIChyZXN1bHQgPT0gbnVsbCkge1xuICAgICAgY29uc3QgaGFzaCA9IGF3YWl0IHRoaXMuZ2V0RGVmYXVsdEhhc2hCeUxldmVsKDEpO1xuICAgICAgYXdhaXQgdGhpcy5hY2NvdW50TWVya2xlVHJlZVJlcG9zaXRvcnkuaW5zZXJ0KHtcbiAgICAgICAgaWQ6IDFuLnRvU3RyaW5nKCksXG4gICAgICAgIGhhc2g6IEJpZ0ludChoYXNoKVxuICAgICAgfSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpZDogMW4udG9TdHJpbmcoKSxcbiAgICAgICAgaGFzaDogaGFzaFxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0OyAgXG4gIH1cbn0iLCJpbXBvcnQgeyBJbmplY3RhYmxlLCBMb2dnZXIgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBDb25maWdTZXJ2aWNlIH0gZnJvbSAnQG5lc3Rqcy9jb25maWcnO1xuaW1wb3J0IHsgSW5qZWN0UmVwb3NpdG9yeSB9IGZyb20gJ0BuZXN0anMvdHlwZW9ybSc7XG5cbmltcG9ydCB7IENvbm5lY3Rpb24sIElzTnVsbCwgTm90LCBSZXBvc2l0b3J5IH0gZnJvbSAndHlwZW9ybSc7XG5pbXBvcnQgeyB0b1RyZWVMZWFmLCB0c0hhc2hGdW5jIH0gZnJvbSAnLi4vY29tbW9uL3RzLWhlbHBlcic7XG5pbXBvcnQgeyBUc01lcmtsZVRyZWUgfSBmcm9tICcuLi9jb21tb24vdHNNZXJrbGVUcmVlJztcbmltcG9ydCB7IFRva2VuVHJlZVJlc3BvbnNlRHRvIH0gZnJvbSAnLi9kdG8vdG9rZW5UcmVlUmVzcG9uc2UuZHRvJztcbmltcG9ydCB7IFVwZGF0ZVRva2VuVHJlZUR0byB9IGZyb20gJy4vZHRvL3VwZGF0ZVRva2VuVHJlZS5kdG8nO1xuaW1wb3J0IHsgVG9rZW5MZWFmTm9kZSB9IGZyb20gJy4vdG9rZW5MZWFmTm9kZS5lbnRpdHknO1xuaW1wb3J0IHsgVG9rZW5NZXJrbGVUcmVlTm9kZSB9IGZyb20gJy4vdG9rZW5NZXJrbGVUcmVlTm9kZS5lbnRpdHknO1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRzVG9rZW5UcmVlU2VydmljZSBleHRlbmRzIFRzTWVya2xlVHJlZTxUb2tlbkxlYWZOb2RlPiB7XG4gIHByaXZhdGUgbG9nZ2VyOiBMb2dnZXIgPSBuZXcgTG9nZ2VyKFRzVG9rZW5UcmVlU2VydmljZS5uYW1lKTtcbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdFJlcG9zaXRvcnkoVG9rZW5MZWFmTm9kZSlcbiAgICBwcml2YXRlIHJlYWRvbmx5IHRva2VuTGVhZlJlcG9zaXRvcnk6IFJlcG9zaXRvcnk8VG9rZW5MZWFmTm9kZT4sXG4gICAgQEluamVjdFJlcG9zaXRvcnkoVG9rZW5NZXJrbGVUcmVlTm9kZSlcbiAgICBwcml2YXRlIHJlYWRvbmx5IHRva2VuTWVya2xlVHJlZVJlcG9zaXRvcnk6IFJlcG9zaXRvcnk8VG9rZW5NZXJrbGVUcmVlTm9kZT4sXG4gICAgcHJpdmF0ZSByZWFkb25seSBjb25uZWN0aW9uOiBDb25uZWN0aW9uLFxuICAgIHByaXZhdGUgY29uZmlnU2VydmljZTogQ29uZmlnU2VydmljZSxcbiAgKSB7XG4gICAgY29uc29sZS50aW1lKCdpbml0IHRva2VuIHRyZWUnKTtcbiAgICBzdXBlcihjb25maWdTZXJ2aWNlLmdldDxudW1iZXI+KCdUT0tFTlNfVFJFRV9IRUlHSFQnLCAyKSwgdHNIYXNoRnVuYyk7XG4gICAgY29uc29sZS50aW1lRW5kKCdpbml0IHRva2VuIHRyZWUnKTtcbiAgfVxuICBhc3luYyBnZXRDdXJyZW50TGVhZklkQ291bnQoYWNjb3VudElkOiBiaWdpbnQpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGNvbnN0IGxlYWZJZENvdW50ID0gYXdhaXQgdGhpcy50b2tlbk1lcmtsZVRyZWVSZXBvc2l0b3J5LmNvdW50KFxuICAgICAge1xuICAgICAgICB3aGVyZToge1xuICAgICAgICAgIGFjY291bnRJZDogYWNjb3VudElkLnRvU3RyaW5nKCksXG4gICAgICAgICAgbGVhZklkOiBOb3QoSXNOdWxsKCkpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuICAgIHJldHVybiBsZWFmSWRDb3VudDtcbiAgfVxuICBnZXRMZWFmRGVmYXVsdFZhdmx1ZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0b1RyZWVMZWFmKFswbiwgMG4sIDBuXSk7XG4gIH1cbiAgYXN5bmMgdXBkYXRlTGVhZihsZWFmSWQ6IGJpZ2ludCwgdmFsdWU6IFVwZGF0ZVRva2VuVHJlZUR0bykge1xuICAgIGNvbnNvbGUudGltZSgndXBkYXRlTGVhZiBmb3IgdG9rZW4gdHJlZScpO1xuICAgIGNvbnN0IHByZiA9IHRoaXMuZ2V0UHJvb2ZJZHMobGVhZklkKTtcbiAgICBjb25zdCBpZCA9IHRoaXMuZ2V0TGVhZklkSW5UcmVlKGxlYWZJZCk7XG4gICAgY29uc3QgbGVhZkhhc2ggPSB0b1RyZWVMZWFmKFtCaWdJbnQodmFsdWUubGVhZklkKSwgQmlnSW50KHZhbHVlLmxvY2tlZEFtdCksIEJpZ0ludCh2YWx1ZS5hdmFpbGFibGVBbXQpXSk7XG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLnRyYW5zYWN0aW9uKGFzeW5jIChtYW5hZ2VyKSA9PiB7XG4gICAgICBjb25zdCBhY2NvdW50SWQgPSB2YWx1ZS5hY2NvdW50SWQ7XG4gICAgICAvLyB1cGRhdGUgbGVhZlxuICAgICAgYXdhaXQgbWFuYWdlci51cHNlcnQoVG9rZW5NZXJrbGVUcmVlTm9kZSwge1xuICAgICAgICBhY2NvdW50SWQ6IGFjY291bnRJZCxcbiAgICAgICAgaWQ6IGlkLnRvU3RyaW5nKCksXG4gICAgICAgIGxlYWZJZDogbGVhZklkLnRvU3RyaW5nKCksXG4gICAgICAgIGhhc2g6IEJpZ0ludChsZWFmSGFzaClcbiAgICAgIH0sIFsnaWQnLCAnYWNjb3VudElkJ10pO1xuICAgICAgYXdhaXQgbWFuYWdlci51cHNlcnQoVG9rZW5MZWFmTm9kZSwge1xuICAgICAgICBsZWFmSWQ6ICBsZWFmSWQudG9TdHJpbmcoKSxcbiAgICAgICAgYWNjb3VudElkOiBhY2NvdW50SWQsXG4gICAgICAgIGxvY2tlZEFtdDogQmlnSW50KHZhbHVlLmxvY2tlZEFtdCksXG4gICAgICAgIGF2YWlsYWJsZUFtdDogQmlnSW50KHZhbHVlLmF2YWlsYWJsZUFtdCkgICAgICAgXG4gICAgICB9LCBbJ2xlYWZJZCcsICdhY2NvdW50SWQnXSk7XG4gICAgICAvLyB1cGRhdGUgcHJvb2ZcbiAgICAgIGZvciAobGV0IGkgPSBpZCwgaiA9IDA7IGkgPiAxbjsgaSA9IGkgPj4gMW4pIHtcbiAgICAgICAgY29uc3QgW2lWYWx1ZSwgalZhbHVlIF09IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICB0aGlzLnRva2VuTWVya2xlVHJlZVJlcG9zaXRvcnkuZmluZE9uZUJ5KHtpZDogaS50b1N0cmluZygpLCBhY2NvdW50SWQ6IGFjY291bnRJZH0pLFxuICAgICAgICAgIHRoaXMudG9rZW5NZXJrbGVUcmVlUmVwb3NpdG9yeS5maW5kT25lQnkoe2lkOiBwcmZbal0udG9TdHJpbmcoKSwgYWNjb3VudElkOiBhY2NvdW50SWR9KVxuICAgICAgICBdKTtcbiAgICAgICAgY29uc3QgakxldmVsID0gTWF0aC5mbG9vcihNYXRoLmxvZzIoTnVtYmVyKHByZltqXSkpKTtcbiAgICAgICAgY29uc3QgaUxldmVsID0gTWF0aC5mbG9vcihNYXRoLmxvZzIoTnVtYmVyKGkpKSk7XG4gICAgICAgIGNvbnN0IGpIYXNoVmFsdWU6IHN0cmluZyA9IChqVmFsdWUgPT0gbnVsbCk/IHRoaXMuZ2V0RGVmYXVsdEhhc2hCeUxldmVsKGpMZXZlbCk6IGpWYWx1ZS5oYXNoLnRvU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IGlIYXNoVmFsdWU6IHN0cmluZyA9IChpVmFsdWUgPT0gbnVsbCk/IHRoaXMuZ2V0RGVmYXVsdEhhc2hCeUxldmVsKGlMZXZlbCk6IGlWYWx1ZS5oYXNoLnRvU3RyaW5nKCk7XG4gICAgICAgIGxldCByID0gKGlkICUgMm4gPT0gMG4pID9bIGpIYXNoVmFsdWUsIGlIYXNoVmFsdWVdIDogWyBpSGFzaFZhbHVlLCBqSGFzaFZhbHVlXTtcbiAgICAgICAgY29uc3QgaGFzaCA9IHRoaXMuaGFzaEZ1bmMocik7XG4gICAgICAgIGNvbnN0IGpvYnMgPSBbXTtcbiAgICAgICAgaWYgKGlWYWx1ZSA9PSBudWxsKSB7XG4gICAgICAgICAgam9icy5wdXNoKG1hbmFnZXIudXBzZXJ0KFRva2VuTWVya2xlVHJlZU5vZGUsIHtcbiAgICAgICAgICAgIGlkOiBpLnRvU3RyaW5nKCksIGFjY291bnRJZDogYWNjb3VudElkLCBoYXNoOiBCaWdJbnQoaUhhc2hWYWx1ZSlcbiAgICAgICAgICB9LCBbJ2lkJywgJ2FjY291bnRJZCddKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGpWYWx1ZSA9PSBudWxsICYmIGogPCBwcmYubGVuZ3RoKSB7XG4gICAgICAgICAgam9icy5wdXNoKG1hbmFnZXIudXBzZXJ0KFRva2VuTWVya2xlVHJlZU5vZGUsIHtcbiAgICAgICAgICAgIGlkOiBwcmZbal0udG9TdHJpbmcoKSwgYWNjb3VudElkOiBhY2NvdW50SWQsIGhhc2g6IEJpZ0ludChqSGFzaFZhbHVlKVxuICAgICAgICAgIH0sIFsnaWQnLCAnYWNjb3VudElkJ10pKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB1cGRhdGVSb290ID0gaSA+PiAxbjtcbiAgICAgICAgaWYgKCB1cGRhdGVSb290ID49IDFuKSB7XG4gICAgICAgICAgam9icy5wdXNoKHRoaXMudG9rZW5NZXJrbGVUcmVlUmVwb3NpdG9yeS51cHNlcnQoW3tcbiAgICAgICAgICAgIGlkOiB1cGRhdGVSb290LnRvU3RyaW5nKCksIGFjY291bnRJZDogYWNjb3VudElkLCBoYXNoOiBCaWdJbnQoaGFzaClcbiAgICAgICAgICB9XSwgWydpZCcsICdhY2NvdW50SWQnXSkpO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKGpvYnMpO1xuICAgICAgICBqKys7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY29uc29sZS50aW1lRW5kKCd1cGRhdGVMZWFmIGZvciB0b2tlbiB0cmVlJyk7XG4gIH1cbiAgYXN5bmMgZ2V0TGVhZihsZWFmX2lkOiBiaWdpbnQsIGFjY291bnRJZDogc3RyaW5nKTogUHJvbWlzZTxUb2tlbkxlYWZOb2RlIHwgbnVsbD4ge1xuICAgIGNvbnN0IHJlc3VsdCA9ICBhd2FpdCB0aGlzLnRva2VuTGVhZlJlcG9zaXRvcnkuZmluZE9uZUJ5KHtsZWFmSWQ6IGxlYWZfaWQudG9TdHJpbmcoKVxuICAgICAgLCBhY2NvdW50SWQ6IGFjY291bnRJZH0pO1xuICAgIGlmIChyZXN1bHQgPT0gbnVsbCkge1xuICAgICAgLy8gY2hlY2sgbGV2ZWxcbiAgICAgIGNvbnN0IGlkID0gdGhpcy5nZXRMZWFmSWRJblRyZWUobGVhZl9pZCk7XG4gICAgICBjb25zdCBsZXZlbCA9IE1hdGguZmxvb3IoTWF0aC5sb2cyKE51bWJlcihpZCkpKTtcbiAgICAgIGNvbnN0IGhhc2ggPSB0aGlzLmdldERlZmF1bHRIYXNoQnlMZXZlbChsZXZlbCk7XG4gICAgICAvLyBzdGFydCB0cmFuc2FjdGlvblxuICAgICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLnRyYW5zYWN0aW9uKGFzeW5jIChtYW5hZ2VyKSA9PiB7XG4gICAgICAgIC8vIGluc2VydCB0aGlzIG51bGwgaGFzaCBvbiB0aGlzIG5vZGVcbiAgICAgICAgYXdhaXQgbWFuYWdlci5pbnNlcnQoVG9rZW5NZXJrbGVUcmVlTm9kZSwge1xuICAgICAgICAgIGFjY291bnRJZDogYWNjb3VudElkLFxuICAgICAgICAgIGlkOiBpZC50b1N0cmluZygpLFxuICAgICAgICAgIGxlYWZJZDogbGVhZl9pZC50b1N0cmluZygpLFxuICAgICAgICAgIGhhc2g6IEJpZ0ludChoYXNoKVxuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgbWFuYWdlci5pbnNlcnQoVG9rZW5MZWFmTm9kZSwge1xuICAgICAgICAgIGxlYWZJZDogbGVhZl9pZC50b1N0cmluZygpLFxuICAgICAgICAgIGFjY291bnRJZDogYWNjb3VudElkLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuICBhd2FpdCB0aGlzLnRva2VuTGVhZlJlcG9zaXRvcnkuZmluZE9uZUJ5KHtsZWFmSWQ6IGxlYWZfaWQudG9TdHJpbmcoKSwgYWNjb3VudElkOiBhY2NvdW50SWR9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBhc3luYyBnZXRSb290KGFjY291bnRJZDogc3RyaW5nKTogUHJvbWlzZTxUb2tlblRyZWVSZXNwb25zZUR0bz4ge1xuICAgIGNvbnN0IHJlc3VsdCA9ICBhd2FpdCB0aGlzLnRva2VuTWVya2xlVHJlZVJlcG9zaXRvcnkuZmluZE9uZUJ5KHthY2NvdW50SWQ6IGFjY291bnRJZCwgaWQ6IDFuLnRvU3RyaW5nKCl9KTtcbiAgICBpZiAocmVzdWx0ID09IG51bGwpIHtcbiAgICAgIGNvbnN0IGhhc2ggPSB0aGlzLmdldERlZmF1bHRIYXNoQnlMZXZlbCgxKTtcbiAgICAgIGF3YWl0IHRoaXMudG9rZW5NZXJrbGVUcmVlUmVwb3NpdG9yeS5pbnNlcnQoe1xuICAgICAgICBhY2NvdW50SWQ6IGFjY291bnRJZCxcbiAgICAgICAgaWQ6IDFuLnRvU3RyaW5nKCksXG4gICAgICAgIGhhc2g6IEJpZ0ludChoYXNoKVxuICAgICAgfSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBhY2NvdW50SWQ6IGFjY291bnRJZCxcbiAgICAgICAgaWQ6IDEsXG4gICAgICAgIGxlYWZJZDogbnVsbCxcbiAgICAgICAgaGFzaDogaGFzaFxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXN1bHRIYXNoID0gcmVzdWx0Lmhhc2ggPyByZXN1bHQuaGFzaC50b1N0cmluZygpIDogJyc7XG4gICAgcmV0dXJuIHtcbiAgICAgIGFjY291bnRJZDogYWNjb3VudElkLFxuICAgICAgaWQ6IDEsXG4gICAgICBsZWFmSWQ6IG51bGwsXG4gICAgICBoYXNoOiByZXN1bHRIYXNoLFxuICAgIH07XG4gIH1cbiAgXG59IiwiaW1wb3J0IHsgQXBpUHJvcGVydHkgfSBmcm9tIFwiQG5lc3Rqcy9zd2FnZ2VyXCI7XG5cbmV4cG9ydCBjbGFzcyBNYXJrZXRQYWlySW5mb1Jlc3BvbnNlRHRvIHtcbiAgQEFwaVByb3BlcnR5KClcbiAgbWFpblRva2VuSWQhOiBzdHJpbmc7XG4gIEBBcGlQcm9wZXJ0eSgpXG4gIGJhc2VUb2tlbklkITogc3RyaW5nO1xuICBAQXBpUHJvcGVydHkoKVxuICBtYXJrZXRQYWlyITogc3RyaW5nO1xufVxuZXhwb3J0IGNsYXNzIE1hcmtldFBhaXIge1xuICBAQXBpUHJvcGVydHkoKVxuICBtYWluVG9rZW5JZCE6IHN0cmluZztcbiAgQEFwaVByb3BlcnR5KClcbiAgYmFzZVRva2VuSWQhOiBzdHJpbmc7XG59XG5leHBvcnQgY2xhc3MgTWFya2V0UGFpckluZm9SZXF1ZXN0RHRvIHtcbiAgQEFwaVByb3BlcnR5KClcbiAgcGFpcnMhOiBNYXJrZXRQYWlyW107XG59XG5cbmV4cG9ydCBjbGFzcyBNYXJrZXRTZWxsQnV5UGFpciB7XG4gIEBBcGlQcm9wZXJ0eSgpXG4gIHNlbGxUb2tlbklkITogc3RyaW5nO1xuICBAQXBpUHJvcGVydHkoKVxuICBidXlUb2tlbklkITogc3RyaW5nO1xufSIsImltcG9ydCB7IEFwaVByb3BlcnR5IH0gZnJvbSAnQG5lc3Rqcy9zd2FnZ2VyJztcblxuZXhwb3J0IGNsYXNzIFVwZGF0ZU9ic09yZGVyVHJlZUR0byB7XG4gIEBBcGlQcm9wZXJ0eSh7XG4gICAgdHlwZTogU3RyaW5nXG4gIH0pXG4gIG9yZGVyTGVhZklkITogc3RyaW5nO1xuICBAQXBpUHJvcGVydHkoe1xuICAgIHR5cGU6IFN0cmluZ1xuICB9KVxuICB0eElkITogc3RyaW5nO1xuICBAQXBpUHJvcGVydHkoe1xuICAgIHR5cGU6IFN0cmluZ1xuICB9KVxuICByZXFUeXBlITogc3RyaW5nO1xuICBAQXBpUHJvcGVydHkoe1xuICAgIHR5cGU6IFN0cmluZ1xuICB9KVxuICBzZW5kZXIhOiBzdHJpbmc7XG4gIEBBcGlQcm9wZXJ0eSh7XG4gICAgdHlwZTogU3RyaW5nXG4gIH0pXG4gIHNlbGxUb2tlbklkITogc3RyaW5nO1xuICBAQXBpUHJvcGVydHkoe1xuICAgIHR5cGU6IFN0cmluZ1xuICB9KVxuICBub25jZSE6IHN0cmluZztcbiAgQEFwaVByb3BlcnR5KHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfSlcbiAgc2VsbEFtdCE6IHN0cmluZztcbiAgQEFwaVByb3BlcnR5KHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfSlcbiAgYnV5VG9rZW5JZCE6IHN0cmluZztcbiAgQEFwaVByb3BlcnR5KHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfSlcbiAgYnV5QW10ITogc3RyaW5nO1xuICBAQXBpUHJvcGVydHkoe1xuICAgIHR5cGU6IFN0cmluZ1xuICB9KVxuICBhY2N1bXVsYXRlZFNlbGxBbXQhOiBzdHJpbmc7XG4gIEBBcGlQcm9wZXJ0eSh7XG4gICAgdHlwZTogU3RyaW5nXG4gIH0pXG4gIGFjY3VtdWxhdGVkQnV5QW10ITogc3RyaW5nO1xuICBAQXBpUHJvcGVydHkoe1xuICAgIHR5cGU6IFN0cmluZ1xuICB9KVxuICBvcmRlcklkITogc3RyaW5nO1xufSIsImltcG9ydCB7IEdsb2JhbCwgTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgQ29uZmlnTW9kdWxlLCBDb25maWdTZXJ2aWNlIH0gZnJvbSAnQG5lc3Rqcy9jb25maWcnO1xuaW1wb3J0IHsgVHlwZU9ybU1vZHVsZSB9IGZyb20gJ0BuZXN0anMvdHlwZW9ybSc7XG5pbXBvcnQgeyBBdWN0aW9uT3JkZXJMZWFmTm9kZSB9IGZyb20gJy4vYXVjdGlvbk9yZGVyTGVhZk5vZGUuZW50aXR5JztcbmltcG9ydCB7IEF1Y3Rpb25Cb25kVG9rZW5FbnRpdHkgfSBmcm9tICcuL2F1Y3Rpb25Cb25kVG9rZW4uZW50aXR5JztcbmltcG9ydCB7IEF1Y3Rpb25PcmRlck1lcmtsZVRyZWVOb2RlIH0gZnJvbSAnLi9hdWN0aW9uT3JkZXJNZXJrbGVUcmVlTm9kZS5lbnRpdHknO1xuaW1wb3J0IHsgT2JzT3JkZXJFbnRpdHkgfSBmcm9tICcuL29ic09yZGVyLmVudGl0eSc7XG5pbXBvcnQgeyBPYnNPcmRlckxlYWZFbnRpdHkgfSBmcm9tICcuL29ic09yZGVyTGVhZi5lbnRpdHknO1xuaW1wb3J0IHsgTWF0Y2hPYnNPcmRlckVudGl0eSB9IGZyb20gJy4vbWF0Y2hPYnNPcmRlci5lbnRpdHknO1xuaW1wb3J0IHsgQ2FuZGxlU3RpY2tFbnRpdHkgfSBmcm9tICcuL2NhbmRsZVN0aWNrLmVudGl0eSc7XG5pbXBvcnQgeyBPYnNPcmRlckxlYWZNZXJrbGVUcmVlTm9kZSB9IGZyb20gJy4vb2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUuZW50aXR5JztcbmltcG9ydCB7IE1hcmtldFBhaXJJbmZvRW50aXR5IH0gZnJvbSAnLi9tYXJrZXRQYWlySW5mby5lbnRpdHknO1xuaW1wb3J0IHsgTWFya2V0UGFpckluZm9TZXJ2aWNlIH0gZnJvbSAnLi9tYXJrZXRQYWlySW5mby5zZXJ2aWNlJztcbmltcG9ydCB7IEF2YWlsYWJsZVZpZXdFbnRpdHkgfSBmcm9tICcuL2F2YWlsYWJsZVZpZXcuZW50aXR5JztcblxuQEdsb2JhbCgpXG5ATW9kdWxlKHtcbiAgaW1wb3J0czogW0NvbmZpZ01vZHVsZSwgVHlwZU9ybU1vZHVsZS5mb3JGZWF0dXJlKFtcbiAgICAvLyBBdWN0aW9uT3JkZXJNZXJrbGVUcmVlTm9kZSxcbiAgICAvLyBBdWN0aW9uT3JkZXJMZWFmTm9kZSxcbiAgICBPYnNPcmRlckVudGl0eSxcbiAgICBPYnNPcmRlckxlYWZFbnRpdHksXG4gICAgT2JzT3JkZXJMZWFmTWVya2xlVHJlZU5vZGUsXG4gICAgTWF0Y2hPYnNPcmRlckVudGl0eSxcbiAgICBNYXJrZXRQYWlySW5mb0VudGl0eSxcbiAgICBDYW5kbGVTdGlja0VudGl0eSwgXG4gICAgQXVjdGlvbkJvbmRUb2tlbkVudGl0eSxcbiAgICBBdmFpbGFibGVWaWV3RW50aXR5XG4gIF0pXSxcbiAgcHJvdmlkZXJzOiBbQ29uZmlnU2VydmljZSwgTWFya2V0UGFpckluZm9TZXJ2aWNlXSxcbiAgZXhwb3J0czogW1R5cGVPcm1Nb2R1bGUsIE1hcmtldFBhaXJJbmZvU2VydmljZV1cbn0pXG5leHBvcnQgY2xhc3MgQXVjdGlvbk9yZGVyTW91ZGxlIHt9IiwiaW1wb3J0IHsgVHNUb2tlbkFkZHJlc3MgfSBmcm9tICdAdHMtc2RrL2RvbWFpbi9saWIvdHMtdHlwZXMvdHMtdHlwZXMnO1xuaW1wb3J0IHsgQ29sdW1uLCBDcmVhdGVEYXRlQ29sdW1uLCBFbnRpdHksIFByaW1hcnlHZW5lcmF0ZWRDb2x1bW4sIFVwZGF0ZURhdGVDb2x1bW4gfSBmcm9tICd0eXBlb3JtJztcblxuZXhwb3J0IGVudW0gQm9uZFRva2VuU3RhdHVzSW5kZXgge1xuICBpc0wxRGVwbG95ZWQgPSAxLFxuICBpc0F2YWlsYWJsZSA9IDIsXG4gIGlzRXhjY2VlZGVkID0gNCxcbn1cblxuQEVudGl0eSgnQXVjdGlvbkJvbmRUb2tlbicsIHsgc2NoZW1hOiAncHVibGljJ30pIFxuZXhwb3J0IGNsYXNzIEF1Y3Rpb25Cb25kVG9rZW5FbnRpdHkge1xuICBAUHJpbWFyeUdlbmVyYXRlZENvbHVtbih7XG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIG5hbWU6ICdib25kSWQnLFxuICB9KVxuICBib25kSWQhOiBudW1iZXI7XG5cbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdMMUFkZHInLFxuICAgIG51bGxhYmxlOiB0cnVlLFxuICAgIGxlbmd0aDogMjU2LFxuICB9KVxuICBMMUFkZHI/OiBzdHJpbmc7XG5cbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIG5hbWU6ICdMMkFkZHInLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICB9KVxuICBMMkFkZHIhOiBUc1Rva2VuQWRkcmVzcztcblxuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnZGVjaW1hbCcsXG4gICAgbmFtZTogJ3VuZGVybHlpbmdUb2tlbicsXG4gICAgcHJlY2lzaW9uOiA4NixcbiAgICBzY2FsZTogMCxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gIH0pXG4gIHVuZGVybHlpbmdUb2tlbiE6IFRzVG9rZW5BZGRyZXNzO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgbmFtZTogJ2xhc3RTeW5jQmxvY2tudW1iZXJGb3JEZXBvc2l0RXZlbnQnLFxuICAgIGRlZmF1bHQ6IDAsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICB9KVxuICBsYXN0U3luY0Jsb2NrbnVtYmVyRm9yRGVwb3NpdEV2ZW50ITogbnVtYmVyO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndGltZXN0YW1wIHdpdGhvdXQgdGltZSB6b25lJyxcbiAgICBuYW1lOiAnbWF0dXJpdHlEYXRlJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gIH0pXG4gIG1hdHVyaXR5RGF0ZSE6IERhdGU7XG5cbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIG5hbWU6ICdzdGF0dXMnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAoKSA9PiAwLFxuICB9KVxuICBzdGF0dXMhOiBudW1iZXI7XG4gIGdldFN0YXR1cyhzdGF0dXNJZDogQm9uZFRva2VuU3RhdHVzSW5kZXgpOiBCb25kVG9rZW5TdGF0dXNJbmRleCB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdHVzICYgc3RhdHVzSWQ7XG4gIH1cbiAgc2V0U3RhdHVzKHN0YXR1c0lkOiBCb25kVG9rZW5TdGF0dXNJbmRleCk6IHZvaWQge1xuICAgIHRoaXMuc3RhdHVzIHw9IHN0YXR1c0lkO1xuICB9XG5cbiAgQENyZWF0ZURhdGVDb2x1bW4oe1xuICAgIHR5cGU6ICd0aW1lc3RhbXAgd2l0aG91dCB0aW1lIHpvbmUnLFxuICAgIG5hbWU6ICdjcmVhdGVkQXQnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAnbm93KCknLFxuICB9KVxuICBjcmVhdGVkQXQhOiBEYXRlO1xuICBAVXBkYXRlRGF0ZUNvbHVtbih7XG4gICAgdHlwZTogJ3RpbWUgd2l0aG91dCB0aW1lIHpvbmUnLFxuICAgIG5hbWU6ICd1cGRhdGVkQXQnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAnbm93KCknLFxuICB9KVxuICB1cGRhdGVkQXQhOiBEYXRlO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ3VwZGF0ZWRCeScsXG4gICAgbnVsbGFibGU6IHRydWUsXG4gICAgbGVuZ3RoOiAyNTYsXG4gIH0pXG4gIHVwZGF0ZWRCeSE6IHN0cmluZyB8IG51bGw7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAnZGVsZXRlZEJ5JyxcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgICBsZW5ndGg6IDI1NixcbiAgfSlcbiAgZGVsZXRlZEJ5ITogc3RyaW5nIHwgbnVsbDtcbn0iLCJleHBvcnQgY29uc3QgTEVOX09GX1JFUVVFU1QgPSAxMDtcbmV4cG9ydCBjb25zdCBDSFVOS19CWVRFU19TSVpFID0gMTI7XG5leHBvcnQgY29uc3QgQ0hVTktfQklUU19TSVpFID0gQ0hVTktfQllURVNfU0laRSAqIDg7XG5leHBvcnQgY29uc3QgTUlOX0NIVU5LU19QRVJfUkVRID0gMztcbmV4cG9ydCBjb25zdCBNQVhfQ0hVTktTX1BFUl9SRVEgPSA5O1xuZXhwb3J0IGNvbnN0IE1BWF9DSFVOS1NfQllURVNfUEVSX1JFUSA9IE1BWF9DSFVOS1NfUEVSX1JFUSAqIENIVU5LX0JZVEVTX1NJWkU7XG5leHBvcnQgZnVuY3Rpb24gZ2V0T0NodW5rc1NpemUoYmF0Y2hTaXplOiBudW1iZXIpIHtcbiAgcmV0dXJuIE1BWF9DSFVOS1NfUEVSX1JFUSAqIGJhdGNoU2l6ZTtcbn1cblxuZXhwb3J0IGVudW0gVHNTeXN0ZW1BY2NvdW50QWRkcmVzcyB7XG4gIEJVUk5fQUREUiA9ICcwJyxcbiAgTUlOVF9BRERSID0gJzAnLFxuICBXSVRIRFJBV19BRERSID0gJzAnLFxuICBBVUNUSU9OX0FERFIgPSAnMCcsXG59XG5cbmV4cG9ydCBjb25zdCBUc0RlZmF1bHRWYWx1ZSA9IHtcbiAgTk9OQ0VfWkVSTzogJzAnLFxuICBCSUdJTlRfREVGQVVMVF9WQUxVRTogMG4sXG4gIFNUUklOR19ERUZBVUxUX1ZBTFVFOiAnMCcsXG4gIEFERFJFU1NfREVGQVVMVF9WQUxVRTogJzB4MDAnLFxufTtcblxuXG5leHBvcnQgZW51bSBUc1R4VHlwZSB7XG4gIFVOS05PV04gPSAnMCcsXG4gIE5PT1AgPSAnMCcsXG4gIFJFR0lTVEVSID0gJzEnLFxuICBERVBPU0lUID0gJzInLFxuICAvLyBUUkFOU0ZFUiA9ICczJyxcbiAgV0lUSERSQVcgPSAnMycsXG4gIFNlY29uZExpbWl0T3JkZXIgPSAnNCcsXG4gIFNlY29uZExpbWl0U3RhcnQgPSAnNScsXG4gIFNlY29uZExpbWl0RXhjaGFuZ2UgPSAnNicsXG4gIFNlY29uZExpbWl0RW5kID0gJzcnLFxuICBTZWNvbmRNYXJrZXRPcmRlciA9ICc4JyxcbiAgU2Vjb25kTWFya2V0RXhjaGFuZ2UgPSAnOScsXG4gIFNlY29uZE1hcmtldEVuZCA9ICcxMCcsXG4gIENhbmNlbE9yZGVyID0gJzExJyxcblxuICBBVUNUSU9OX0xFTkQgPSAnOTknLFxuICBBVUNUSU9OX0JPUlJPVyA9ICcxMDAnLFxuICBBVUNUSU9OX0NBTkNFTCA9ICcxMDEnXG59XG5cbmV4cG9ydCBjb25zdCBUc0RlY2lhbWwgPSB7XG4gIFRTX1RPS0VOX0FNT1VOVF9ERUM6IDE4LFxuICBUU19JTlRFUkVTVF9ERUM6IDYsXG59O1xuXG5leHBvcnQgZW51bSBUc1Rva2VuQWRkcmVzcyB7XG4gICAgVW5rbm93biA9ICcwJyxcbiAgICBXRVRIID0gJzYnLFxuICAgIFdCVEMgPSAnNycsXG4gICAgVVNEVCA9ICc4JyxcbiAgICBVU0RDID0gJzknLFxuICAgIERBSSA9ICcxMCcsXG5cbiAgICAvLyBUT0RPOiBUU0wgVG9rZW4gbWFwcGluZ1xuICAgIFRzbEVUSDIwMjIxMjMxID0gJzQ2JyxcbiAgICBUc2xCVEMyMDIyMTIzMSA9ICc0NycsXG4gICAgVHNsVVNEVDIwMjIxMjMxID0gJzQ4JyxcbiAgICBUc2xVU0RDMjAyMjEyMzEgPSAnNDknLFxuICAgIFRzbERBSTIwMjIxMjMxID0gJzUwJyxcbiAgfVxuXG5leHBvcnQgaW50ZXJmYWNlIFRzVG9rZW5JbmZvIHtcbiAgICBhbW91bnQ6IGJpZ2ludDtcbiAgICBsb2NrQW10OiBiaWdpbnQ7XG59XG4iLCJpbXBvcnQgeyBDb2x1bW4sIEVudGl0eSwgUHJpbWFyeUdlbmVyYXRlZENvbHVtbiB9IGZyb20gJ3R5cGVvcm0nO1xuXG5ARW50aXR5KCdDYW5kbGVTdGljaycsIHtzY2hlbWE6ICdwdWJsaWMnfSlcbmV4cG9ydCBjbGFzcyBDYW5kbGVTdGlja0VudGl0eSB7XG4gIEBQcmltYXJ5R2VuZXJhdGVkQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgbmFtZTogJ2lkJ1xuICB9KVxuICBpZCE6IG51bWJlcjtcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3RpbWVzdGFtcCB3aXRob3V0IHRpbWUgem9uZScsXG4gICAgbmFtZTogJ3RpbWVzdGFtcCcsXG4gICAgcHJlY2lzaW9uOiAzLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAnbm93KCknXG4gIH0pXG4gIHRpbWVzdGFtcCE6IERhdGU7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAnbWF4UHJpY2UnLFxuICAgIGxlbmd0aDogJzMwMCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6ICcwJ1xuICB9KVxuICBtYXhQcmljZSE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdtaW5QcmljZScsXG4gICAgbGVuZ3RoOiAnMzAwJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogJzAnXG4gIH0pXG4gIG1pblByaWNlITogc3RyaW5nO1xuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAndmFyY2hhcicsXG4gICAgbmFtZTogJ29wZW5QcmljZScsXG4gICAgbGVuZ3RoOiAnMzAwJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogJzAnXG4gIH0pXG4gIG9wZW5QcmljZSE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICdjbG9zZVByaWNlJyxcbiAgICBsZW5ndGg6ICczMDAnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0OiAnMCdcbiAgfSlcbiAgY2xvc2VQcmljZSE6IHN0cmluZztcbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ3ZhcmNoYXInLFxuICAgIG5hbWU6ICd2b2x1bWUnLFxuICAgIGxlbmd0aDogJzMwMCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6ICcwJ1xuICB9KVxuICB2b2x1bWUhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAnbWFya2V0UGFpcicsXG4gICAgbGVuZ3RoOiAnMzAwJyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogYCdFVEgvVVNEQydgXG4gIH0pXG4gIG1hcmtldFBhaXIhOiBzdHJpbmc7XG59IiwiaW1wb3J0IHsgc3RyaW5nIH0gZnJvbSAnaW8tdHMnO1xuaW1wb3J0IHsgQ29sdW1uLCBQcmltYXJ5Q29sdW1uLCBWaWV3RW50aXR5IH0gZnJvbSAndHlwZW9ybSc7XG5cbkBWaWV3RW50aXR5KCdBdmFpbGFibGVWaWV3Jywge1xuICBzY2hlbWE6ICdwdWJsaWMnLFxuICBleHByZXNzaW9uOiBgXG5TRUxFQ1QgXG4gIFwidG9rZW5sZWFmXCIuXCJhY2NvdW50SWRcIixcbiAgXCJwZW5kaW5nT3JkZXJcIi5cInRva2VuSWRcIixcbiAgKFwidG9rZW5sZWFmXCIuXCJsb2NrZWRBbXRcIiArICBcInBlbmRpbmdPcmRlclwiLlwic2VsbEFtdFwiKSBBUyBcImxvY2tlZEFtdFwiLFxuICAoXCJ0b2tlbmxlYWZcIi5cImF2YWlsYWJsZUFtdFwiIC0gXCJwZW5kaW5nT3JkZXJcIi5cInNlbGxBbXRcIikgQVMgXCJhdmFpbGFibGVBbXRcIlxuRlJPTSAoU0VMRUNUIFxuICBcImFjY291bnRJZFwiLFxuICBTVU0odGkuYW1vdW50KSBBUyBcInNlbGxBbXRcIixcbiAgXCJ0b2tlbklkXCJcbkZST00gXCJUcmFuc2FjdGlvbkluZm9cIiB0aSBcbldIRVJFIHRpLlwidHhTdGF0dXNcIiA9ICdQRU5ESU5HJ1xuR1JPVVAgQlkgdGkuXCJhY2NvdW50SWRcIiwgdGkuXCJ0b2tlbklkXCJcbikgQVMgXCJwZW5kaW5nT3JkZXJcIlxuSk9JTiBcIlRva2VuTGVhZk5vZGVcIiBcInRva2VubGVhZlwiXG5PTiBcInRva2VubGVhZlwiLlwiYWNjb3VudElkXCIgPSBcInBlbmRpbmdPcmRlclwiLlwiYWNjb3VudElkXCIgQU5EIFwidG9rZW5sZWFmXCIuXCJsZWFmSWRcIiA9IFwicGVuZGluZ09yZGVyXCIuXCJ0b2tlbklkXCI7IFxuICBgXG59KVxuZXhwb3J0IGNsYXNzIEF2YWlsYWJsZVZpZXdFbnRpdHkge1xuICBAUHJpbWFyeUNvbHVtbih7XG4gICAgbmFtZTogJ2FjY291bnRJZCcsXG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDBcbiAgfSlcbiAgYWNjb3VudElkITogc3RyaW5nO1xuICBAUHJpbWFyeUNvbHVtbih7XG4gICAgbmFtZTogJ3Rva2VuSWQnLFxuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwXG4gIH0pXG4gIHRva2VuSWQhOiBzdHJpbmc7XG4gIEBDb2x1bW4oe1xuICAgIG5hbWU6ICdhdmFpbGFibGVBbXQnLFxuICAgIHR5cGU6ICdkZWNpbWFsJyxcbiAgICBwcmVjaXNpb246IDg2LFxuICAgIHNjYWxlOiAwLFxuICAgIGRlZmF1bHQ6IDBuXG4gIH0pXG4gIGF2YWlsYWJsZUFtdCE6IGJpZ2ludDtcbiAgQENvbHVtbih7XG4gICAgbmFtZTogJ2xvY2tlZEFtdCcsXG4gICAgdHlwZTogJ2RlY2ltYWwnLFxuICAgIHByZWNpc2lvbjogODYsXG4gICAgc2NhbGU6IDAsXG4gICAgZGVmYXVsdDogMG5cbiAgfSlcbiAgbG9ja2VkQW10ITogYmlnaW50O1xufVxuIiwiaW1wb3J0IHsgR2xvYmFsLCBNb2R1bGUgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBUeXBlT3JtTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy90eXBlb3JtJztcbmltcG9ydCB7IFJvbGx1cEluZm9ybWF0aW9uIH0gZnJvbSAnLi9yb2xsdXBJbmZvcm1hdGlvbi5lbnRpdHknO1xuQEdsb2JhbCgpXG5ATW9kdWxlKHtcbiAgaW1wb3J0czogW1R5cGVPcm1Nb2R1bGUuZm9yRmVhdHVyZShbUm9sbHVwSW5mb3JtYXRpb25dKV0sXG4gIGV4cG9ydHM6IFtUeXBlT3JtTW9kdWxlXVxufSlcbmV4cG9ydCBjbGFzcyBSb2xsdXBNb2R1bGUge30iLCJpbXBvcnQgeyBub3cgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgZ2V0UHJvY2Vzc05hbWUgfSBmcm9tICcuLi8uLi8uLi8uLi90cy1zZGsvc3JjL2hlbHBlcic7XG5pbXBvcnQgeyBCZWZvcmVJbnNlcnQsIEJlZm9yZVJlbW92ZSwgQmVmb3JlVXBkYXRlLCBDb2x1bW4sIENyZWF0ZURhdGVDb2x1bW4sIERlbGV0ZURhdGVDb2x1bW4sIEVudGl0eSwgUHJpbWFyeUNvbHVtbiwgVXBkYXRlRGF0ZUNvbHVtbiB9IGZyb20gJ3R5cGVvcm0nO1xuXG5ARW50aXR5KCdSb2xsdXBJbmZvcm1hdGlvbicsIHsgc2NoZW1hOiAncHVibGljJyB9KVxuZXhwb3J0IGNsYXNzIFJvbGx1cEluZm9ybWF0aW9uIHtcbiAgQFByaW1hcnlDb2x1bW4oe1xuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBuYW1lOiAnaWQnLFxuICAgIHByaW1hcnk6IHRydWUsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGdlbmVyYXRlZDogJ2luY3JlbWVudCdcbiAgfSlcbiAgaWQhOiBudW1iZXI7XG5cbiAgQENvbHVtbih7XG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIG5hbWU6ICdsYXN0U3luY0Jsb2NrbnVtYmVyRm9yUmVnaXN0ZXJFdmVudCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICB9KVxuICBsYXN0U3luY0Jsb2NrbnVtYmVyRm9yUmVnaXN0ZXJFdmVudCE6IG51bWJlcjtcblxuICBAQ29sdW1uKHtcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgbmFtZTogJ2xhc3RTeW5jQmxvY2tudW1iZXJGb3JEZXBvc2l0RXZlbnQnLFxuICAgIG51bGxhYmxlOiBmYWxzZSxcbiAgfSlcbiAgbGFzdFN5bmNCbG9ja251bWJlckZvckRlcG9zaXRFdmVudCE6IG51bWJlcjtcblxuICBAQ3JlYXRlRGF0ZUNvbHVtbih7XG4gICAgdHlwZTogJ3RpbWVzdGFtcCB3aXRob3V0IHRpbWUgem9uZScsXG4gICAgbmFtZTogJ2NyZWF0ZWRBdCcsXG4gICAgbnVsbGFibGU6IGZhbHNlLFxuICAgIGRlZmF1bHQ6ICdub3coKScsXG4gIH0pXG4gIGNyZWF0ZWRBdCE6IERhdGU7XG4gIEBVcGRhdGVEYXRlQ29sdW1uKHtcbiAgICB0eXBlOiAndGltZXN0YW1wIHdpdGhvdXQgdGltZSB6b25lJyxcbiAgICBuYW1lOiAndXBkYXRlZEF0JyxcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdDogbm93KClcbiAgfSlcbiAgdXBkYXRlZEF0ITogRGF0ZTtcbiAgQERlbGV0ZURhdGVDb2x1bW4oe1xuICAgIHR5cGU6ICd0aW1lc3RhbXAgd2l0aG91dCB0aW1lIHpvbmUnLFxuICAgIG5hbWU6ICdkZWxldGVkQXQnLFxuICAgIG51bGxhYmxlOiB0cnVlXG4gIH0pXG4gIGRlbGV0ZWRBdCE6IERhdGU7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAndXBkYXRlZEJ5JyxcbiAgICBsZW5ndGg6IDI1NixcbiAgICBudWxsYWJsZTogZmFsc2UsXG4gIH0pXG4gIHVwZGF0ZWRCeSE6IHN0cmluZyB8IG51bGw7XG4gIEBDb2x1bW4oe1xuICAgIHR5cGU6ICd2YXJjaGFyJyxcbiAgICBuYW1lOiAnZGVsZXRlZEJ5JyxcbiAgICBsZW5ndGg6IDI1NixcbiAgICBudWxsYWJsZTogdHJ1ZSxcbiAgfSlcbiAgZGVsZXRlZEJ5ITogc3RyaW5nIHwgbnVsbDtcblxuICBAQmVmb3JlSW5zZXJ0KClcbiAgQEJlZm9yZVVwZGF0ZSgpXG4gIHNldFVwZGF0ZWRCeSgpIHtcbiAgICB0aGlzLnVwZGF0ZWRCeSA9IGdldFByb2Nlc3NOYW1lKCk7XG4gIH1cblxuICBAQmVmb3JlUmVtb3ZlKClcbiAgc2V0RGVsZXRlZEJ5KCkge1xuICAgIHRoaXMuZGVsZXRlZEJ5ID0gZ2V0UHJvY2Vzc05hbWUoKTtcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibG9kYXNoXCIpOzsiLCIvKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWFyZ3VtZW50ICovXG5pbXBvcnQgeyBaa09CUyB9IGZyb20gJy4vLi4vLi4vLi4vLi4vdHlwZWNoYWluLXR5cGVzL2NvbnRyYWN0cy9aa09CUyc7XG5pbXBvcnQgeyBQaW5vTG9nZ2VyU2VydmljZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2FkYXB0ZXJzL3JlYWwvcGlub0xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IEluamVjdGFibGUsIFNjb3BlIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgQ29uZmlnU2VydmljZSB9IGZyb20gJ0BuZXN0anMvY29uZmlnJztcbmltcG9ydCB7IEluamVjdFJlcG9zaXRvcnkgfSBmcm9tICdAbmVzdGpzL3R5cGVvcm0nO1xuaW1wb3J0IHsgVHJhbnNhY3Rpb25JbmZvIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvdHJhbnNhY3Rpb25JbmZvLmVudGl0eSc7XG5pbXBvcnQgeyBCaWdOdW1iZXIsIFdhbGxldCB9IGZyb20gJ2V0aGVycyc7XG5pbXBvcnQgeyBJbmplY3RTaWduZXJQcm92aWRlciwgRXRoZXJzU2lnbmVyLCBJbmplY3RDb250cmFjdFByb3ZpZGVyLCBFdGhlcnNDb250cmFjdCwgVHJhbnNhY3Rpb25SZXNwb25zZSB9IGZyb20gJ25lc3Rqcy1ldGhlcnMnO1xuaW1wb3J0IHsgQ29ubmVjdGlvbiwgUmVwb3NpdG9yeSB9IGZyb20gJ3R5cGVvcm0nO1xuaW1wb3J0ICogYXMgQUJJIGZyb20gJy4uL2RvbWFpbi92ZXJpZmllZC1hYmkuanNvbic7XG5cbmltcG9ydCB7IFJvbGx1cEluZm9ybWF0aW9uIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL3JvbGx1cC9yb2xsdXBJbmZvcm1hdGlvbi5lbnRpdHknO1xuaW1wb3J0IHsgV29ya2VyU2VydmljZSB9IGZyb20gJ0Bjb21tb24vY2x1c3Rlci93b3JrZXIuc2VydmljZSc7XG5pbXBvcnQgeyBmaXJzdFZhbHVlRnJvbSB9IGZyb20gJ3J4anMvaW50ZXJuYWwvZmlyc3RWYWx1ZUZyb20nO1xuaW1wb3J0IHsgQWNjb3VudEluZm9ybWF0aW9uIH0gZnJvbSAnQGNvbW1vbi90cy10eXBlb3JtL2FjY291bnQvYWNjb3VudEluZm9ybWF0aW9uLmVudGl0eSc7XG5ASW5qZWN0YWJsZSh7XG4gIHNjb3BlOiBTY29wZS5ERUZBVUxULFxufSlcbmV4cG9ydCBjbGFzcyBPcGVyYXRvclByb2R1Y2VyIHtcbiAgcHJpdmF0ZSB3YWxsZXQ6IFdhbGxldDtcbiAgcHJpdmF0ZSBjb250cmFjdDogWmtPQlM7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgY29uZmlnOiBDb25maWdTZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgbG9nZ2VyOiBQaW5vTG9nZ2VyU2VydmljZSxcbiAgICBASW5qZWN0U2lnbmVyUHJvdmlkZXIoKSBwcml2YXRlIHJlYWRvbmx5IGV0aGVyc1NpZ25lcjogRXRoZXJzU2lnbmVyLFxuICAgIEBJbmplY3RDb250cmFjdFByb3ZpZGVyKCkgcHJpdmF0ZSByZWFkb25seSBldGhlcnNDb250cmFjdDogRXRoZXJzQ29udHJhY3QsXG4gICAgQEluamVjdFJlcG9zaXRvcnkoVHJhbnNhY3Rpb25JbmZvKSBwcml2YXRlIHR4UmVwb3NpdG9yeTogUmVwb3NpdG9yeTxUcmFuc2FjdGlvbkluZm8+LFxuICAgIEBJbmplY3RSZXBvc2l0b3J5KFJvbGx1cEluZm9ybWF0aW9uKSBwcml2YXRlIHJvbGx1cEluZm9SZXBvc2l0b3J5OiBSZXBvc2l0b3J5PFJvbGx1cEluZm9ybWF0aW9uPixcbiAgICBASW5qZWN0UmVwb3NpdG9yeShBY2NvdW50SW5mb3JtYXRpb24pIHByaXZhdGUgYWNjb3VudFJlcG9zaXRvcnk6IFJlcG9zaXRvcnk8QWNjb3VudEluZm9ybWF0aW9uPixcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvbm5lY3Rpb246IENvbm5lY3Rpb24sXG4gICAgcHJpdmF0ZSByZWFkb25seSB3b3JrZXJTZXJ2aWNlOiBXb3JrZXJTZXJ2aWNlLFxuICApIHtcbiAgICB0aGlzLndhbGxldCA9IHRoaXMuZXRoZXJzU2lnbmVyLmNyZWF0ZVdhbGxldCh0aGlzLmNvbmZpZy5nZXQoJ0VUSEVSRVVNX09QRVJBVE9SX1BSSVYnLCAnJykpO1xuICAgIHRoaXMuY29udHJhY3QgPSB0aGlzLmV0aGVyc0NvbnRyYWN0LmNyZWF0ZSh0aGlzLmNvbmZpZy5nZXQoJ0VUSEVSRVVNX1JPTExVUF9DT05UUkFDVF9BRERSJywgJycpLCBBQkksIHRoaXMud2FsbGV0KSBhcyB1bmtub3duIGFzIFprT0JTO1xuXG4gICAgdGhpcy5sb2dnZXIubG9nKHtcbiAgICAgIGFkZHJlc3M6IHRoaXMud2FsbGV0LmFkZHJlc3MsXG4gICAgICBjb250cmFjdDogdGhpcy5jb250cmFjdC5hZGRyZXNzLFxuICAgIH0pO1xuICAgIHRoaXMubGlzdGVuUmVnaXN0ZXJFdmVudCgpO1xuICAgIHRoaXMubGlzdGVuRGVwb3NpdEV2ZW50KCk7IC8vISBuZXdcbiAgfVxuXG4gIGFzeW5jIGxpc3RlblJlZ2lzdGVyRXZlbnQoKSB7XG4gICAgYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy53b3JrZXJTZXJ2aWNlLm9uUmVhZHlPYnNlcnZlcik7XG4gICAgdGhpcy5sb2dnZXIubG9nKGBPcGVyYXRvclByb2R1Y2VyLmxpc3RlblJlZ2lzdGVyRXZlbnQgY29udHJhY3Q9JHt0aGlzLmNvbnRyYWN0LmFkZHJlc3N9YCk7XG4gICAgY29uc3QgZmlsdGVycyA9IHRoaXMuY29udHJhY3QuZmlsdGVycy5SZWdpc3RlcigpO1xuICAgIGNvbnN0IGhhbmRsZXIgPSAobG9nOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKHtcbiAgICAgICAgcmVnaXN0ZXJMb2c6IGxvZyxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5sb2dnZXIubG9nKGBPcGVyYXRvclByb2R1Y2VyLmxpc3RlblJlZ2lzdGVyRXZlbnQgbG9nOiR7SlNPTi5zdHJpbmdpZnkobG9nKX1gKTtcbiAgICAgIHRoaXMuaGFuZGxlUmVnaXN0ZXJFdmVudChsb2cuYXJncy5zZW5kZXIsIGxvZy5hcmdzLmFjY291bnRJZCwgbG9nLmFyZ3MudHNQdWJYLCBsb2cuYXJncy50c1B1YlksIGxvZy5hcmdzLmwyQWRkciwgbG9nKTtcbiAgICB9O1xuICAgIGNvbnN0IHsgbGFzdFN5bmNCbG9ja251bWJlckZvclJlZ2lzdGVyRXZlbnQgfSA9IGF3YWl0IHRoaXMucm9sbHVwSW5mb1JlcG9zaXRvcnkuZmluZE9uZU9yRmFpbCh7IHdoZXJlOiB7IGlkOiAxIH0gfSk7XG4gICAgdGhpcy5jb250cmFjdC5xdWVyeUZpbHRlcihmaWx0ZXJzLCBsYXN0U3luY0Jsb2NrbnVtYmVyRm9yUmVnaXN0ZXJFdmVudCwgJ2xhdGVzdCcpLnRoZW4oKGxvZ3MpID0+IHtcbiAgICAgIGxvZ3MuZm9yRWFjaCgobG9nKSA9PiB7XG4gICAgICAgIGhhbmRsZXIobG9nKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHRoaXMuY29udHJhY3Qub24oZmlsdGVycywgaGFuZGxlcik7XG4gIH1cblxuICBhc3luYyBoYW5kbGVSZWdpc3RlckV2ZW50KHNlbmRlcjogc3RyaW5nLCBhY2NvdW50SWQ6IG51bWJlciwgdHNQdWJYOiBCaWdOdW1iZXIsIHRzUHViWTogQmlnTnVtYmVyLCBsMkFkZHI6IHN0cmluZywgdHg6IFRyYW5zYWN0aW9uUmVzcG9uc2UpIHtcbiAgICBjb25zdCByb2xsdXBJbmZvID0gYXdhaXQgdGhpcy5yb2xsdXBJbmZvUmVwb3NpdG9yeS5maW5kT25lT3JGYWlsKHsgd2hlcmU6IHsgaWQ6IDEgfSB9KTtcbiAgICBjb25zdCB7IGJsb2NrTnVtYmVyID0gMCB9ID0gdHg7XG5cbiAgICBpZiAoYmxvY2tOdW1iZXIgPCByb2xsdXBJbmZvLmxhc3RTeW5jQmxvY2tudW1iZXJGb3JSZWdpc3RlckV2ZW50KSB7XG4gICAgICB0aGlzLmxvZ2dlci5sb2coXG4gICAgICAgIGBPcGVyYXRvclByb2R1Y2VyLmxpc3RlblJlZ2lzdGVyRXZlbnQgU0tJUCBibG9ja051bWJlcj0ke2Jsb2NrTnVtYmVyfSBsYXN0U3luY0Jsb2NrbnVtYmVyRm9yUmVnaXN0ZXJFdmVudD0ke3JvbGx1cEluZm8ubGFzdFN5bmNCbG9ja251bWJlckZvclJlZ2lzdGVyRXZlbnR9YCxcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHR4UmVnaXN0ZXIgPSB7XG4gICAgICBMMUFkZHJlc3M6IHNlbmRlcixcbiAgICAgIGFjY291bnRJZDogYWNjb3VudElkLnRvU3RyaW5nKCksXG4gICAgICB0c1B1YktleVg6IHRzUHViWC50b1N0cmluZygpLFxuICAgICAgdHNQdWJLZXlZOiB0c1B1YlkudG9TdHJpbmcoKSxcbiAgICB9O1xuICAgIHRoaXMubG9nZ2VyLmxvZyhgT3BlcmF0b3JQcm9kdWNlci5oYW5kbGVSZWdpc3RlckV2ZW50IHR4UmVnaXN0ZXI6JHtKU09OLnN0cmluZ2lmeSh0eFJlZ2lzdGVyKX1gKTtcbiAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy5hY2NvdW50UmVwb3NpdG9yeS51cHNlcnQodHhSZWdpc3RlciwgWydMMUFkZHJlc3MnXSksXG4gICAgICB0aGlzLnR4UmVwb3NpdG9yeS5pbnNlcnQoe1xuICAgICAgICBhY2NvdW50SWQ6IDBuLFxuICAgICAgICB0b2tlbklkOiAwbixcbiAgICAgICAgYW1vdW50OiAwbixcbiAgICAgICAgYXJnMDogQmlnSW50KGFjY291bnRJZC50b1N0cmluZygpKSxcbiAgICAgICAgYXJnMTogQmlnSW50KGwyQWRkciksXG4gICAgICB9KSxcbiAgICAgIC8vIHRoaXMucm9sbHVwSW5mb1JlcG9zaXRvcnkudXBkYXRlKHsgaWQ6IDEgfSwgeyBsYXN0U3luY0Jsb2NrbnVtYmVyRm9yUmVnaXN0ZXJFdmVudDogYmxvY2tOdW1iZXIgfSksXG4gICAgXSk7XG4gIH1cblxuICAvLyEgRGVwb3NpdCBFdmVudFxuICBhc3luYyBsaXN0ZW5EZXBvc2l0RXZlbnQoKSB7XG4gICAgYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy53b3JrZXJTZXJ2aWNlLm9uUmVhZHlPYnNlcnZlcik7XG4gICAgdGhpcy5sb2dnZXIubG9nKGBPcGVyYXRvclByb2R1Y2VyLmxpc3RlbkRlcG9zaXRFdmVudCBjb250cmFjdD0ke3RoaXMuY29udHJhY3QuYWRkcmVzc31gKTtcbiAgICBjb25zdCBmaWx0ZXJzID0gdGhpcy5jb250cmFjdC5maWx0ZXJzLkRlcG9zaXQoKTtcbiAgICBjb25zdCB7IGxhc3RTeW5jQmxvY2tudW1iZXJGb3JEZXBvc2l0RXZlbnQgfSA9IGF3YWl0IHRoaXMucm9sbHVwSW5mb1JlcG9zaXRvcnkuZmluZE9uZU9yRmFpbCh7IHdoZXJlOiB7IGlkOiAxIH0gfSk7XG4gICAgY29uc3QgaGFuZGxlciA9IChsb2c6IGFueSkgPT4ge1xuICAgICAgdGhpcy5sb2dnZXIubG9nKGBPcGVyYXRvclByb2R1Y2VyLmxpc3RlbkRlcG9zaXRFdmVudCBsb2c6JHtKU09OLnN0cmluZ2lmeShsb2cpfWApO1xuICAgICAgY29uc29sZS5sb2coe1xuICAgICAgICBkZXBvc2l0TG9nOiBsb2csXG4gICAgICB9KTtcbiAgICAgIHRoaXMuaGFuZGxlRGVwb3NpdEV2ZW50KGxvZy5hcmdzLnNlbmRlciwgbG9nLmFyZ3MuYWNjb3VudElkLCBsb2cuYXJncy50b2tlbklkLCBsb2cuYXJncy5hbW91bnQsIGxvZy50cmFuc2FjdGlvbkhhc2gpO1xuICAgIH07XG4gICAgdGhpcy5jb250cmFjdC5xdWVyeUZpbHRlcihmaWx0ZXJzLCBsYXN0U3luY0Jsb2NrbnVtYmVyRm9yRGVwb3NpdEV2ZW50LCAnbGF0ZXN0JykudGhlbigobG9ncykgPT4ge1xuICAgICAgbG9ncy5mb3JFYWNoKChsb2cpID0+IHtcbiAgICAgICAgaGFuZGxlcihsb2cpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5jb250cmFjdC5vbihmaWx0ZXJzLCBoYW5kbGVyKTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZURlcG9zaXRFdmVudChzZW5kZXI6IHN0cmluZywgYWNjb3VudElkOiBCaWdOdW1iZXIsIHRva2VuSWQ6IEJpZ051bWJlciwgYW1vdW50OiBCaWdOdW1iZXIsIHR4OiBUcmFuc2FjdGlvblJlc3BvbnNlKSB7XG4gICAgY29uc3Qgcm9sbHVwSW5mbyA9IGF3YWl0IHRoaXMucm9sbHVwSW5mb1JlcG9zaXRvcnkuZmluZE9uZU9yRmFpbCh7IHdoZXJlOiB7IGlkOiAxIH0gfSk7XG4gICAgY29uc3QgeyBibG9ja051bWJlciA9IDAgfSA9IHR4O1xuXG4gICAgaWYgKGJsb2NrTnVtYmVyIDwgcm9sbHVwSW5mby5sYXN0U3luY0Jsb2NrbnVtYmVyRm9yRGVwb3NpdEV2ZW50KSB7XG4gICAgICB0aGlzLmxvZ2dlci5sb2coXG4gICAgICAgIGBPcGVyYXRvclByb2R1Y2VyLmxpc3RlbkRlcG9zaXRFdmVudCBTS0lQIGJsb2NrTnVtYmVyPSR7YmxvY2tOdW1iZXJ9IGxhc3RTeW5jQmxvY2tudW1iZXJGb3JEZXBvc2l0RXZlbnQ9JHtyb2xsdXBJbmZvLmxhc3RTeW5jQmxvY2tudW1iZXJGb3JEZXBvc2l0RXZlbnR9YCxcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMubG9nZ2VyLmxvZyhgT3BlcmF0b3JQcm9kdWNlci5oYW5kbGVEZXBvc2l0RXZlbnQgdHhEZXBvc2l0OiR7SlNPTi5zdHJpbmdpZnkoeyB0b2tlbklkLCBhbW91bnQsIGFjY291bnRJZCB9KX1gKTtcblxuICAgIGF3YWl0IHRoaXMudHhSZXBvc2l0b3J5Lmluc2VydCh7XG4gICAgICB0b2tlbklkOiBCaWdJbnQodG9rZW5JZC50b1N0cmluZygpKSxcbiAgICAgIGFtb3VudDogQmlnSW50KGFtb3VudC50b1N0cmluZygpKSxcbiAgICAgIGFyZzA6IEJpZ0ludChhY2NvdW50SWQudG9TdHJpbmcoKSksXG4gICAgfSk7XG4gICAgLy8gYXdhaXQgdGhpcy5yb2xsdXBJbmZvUmVwb3NpdG9yeS51cGRhdGUoeyBpZDogMSB9LCB7IGxhc3RTeW5jQmxvY2tudW1iZXJGb3JEZXBvc2l0RXZlbnQ6IGJsb2NrTnVtYmVyIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBfY2x1c3RlciBmcm9tICdjbHVzdGVyJztcbmltcG9ydCB0eXBlIHsgQ2x1c3RlciB9IGZyb20gJ2NsdXN0ZXInO1xuaW1wb3J0IHsgUmVwbGF5U3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgUGlub0xvZ2dlclNlcnZpY2UgfSBmcm9tICdAY29tbW9uL2xvZ2dlci9hZGFwdGVycy9yZWFsL3Bpbm9Mb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBDbHVzdGVyTWVzc2FnZUV2ZW50UGF5bG9hZCwgQ2x1c3Rlck1lc3NhZ2VUeXBlIH0gZnJvbSAnQHRzLXNkay9kb21haW4vZXZlbnRzL2NsdXN0ZXInO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSwgU2NvcGUgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBUc1dvcmtlck5hbWUgfSBmcm9tICdAdHMtc2RrL2NvbnN0YW50JztcbmltcG9ydCB7IGdldFdvcmtlck5hbWUgfSBmcm9tICdAdHMtc2RrL2hlbHBlcic7XG5jb25zdCBjbHVzdGVyID0gX2NsdXN0ZXIgYXMgdW5rbm93biBhcyBDbHVzdGVyO1xuXG5ASW5qZWN0YWJsZSh7XG4gIHNjb3BlOiBTY29wZS5ERUZBVUxULFxufSlcbmV4cG9ydCBjbGFzcyBXb3JrZXJTZXJ2aWNlIHtcbiAgaXNMaXN0ZW5pbmcgPSBmYWxzZTtcbiAgcHVibGljIHdvcmtlck5hbWU6IFRzV29ya2VyTmFtZTtcbiAgcHJpdmF0ZSB3b3JrZXJSZWFkeVN1YmplY3QgPSBuZXcgUmVwbGF5U3ViamVjdCgxKTtcbiAgcHVibGljIG9uUmVhZHlPYnNlcnZlciA9IHRoaXMud29ya2VyUmVhZHlTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICBcbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgbG9nZ2VyOiBQaW5vTG9nZ2VyU2VydmljZSxcbiAgKSB7XG4gICAgdGhpcy53b3JrZXJOYW1lID0gZ2V0V29ya2VyTmFtZSgpO1xuICAgIGlmKCFjbHVzdGVyLmlzUHJpbWFyeSl7XG4gICAgICB0aGlzLnN0YXJ0TGlzdGVuKCk7XG4gICAgfVxuICB9XG5cbiAgb25SZWNlaXZlZE1lc3NhZ2UocGF5bG9hZDogQ2x1c3Rlck1lc3NhZ2VFdmVudFBheWxvYWQpIHtcbiAgICB0aGlzLmxvZ2dlci5sb2coe1xuICAgICAgbXNnOiAnT04gTUVTU0FHRScsIHdvcmtlck5hbWU6IHRoaXMud29ya2VyTmFtZSwgcGF5bG9hZFxuICAgIH0pO1xuICAgIHN3aXRjaCAocGF5bG9hZC50eXBlKSB7XG4gICAgICBjYXNlIENsdXN0ZXJNZXNzYWdlVHlwZS5SRUFEWTpcbiAgICAgICAgdGhpcy53b3JrZXJSZWFkeVN1YmplY3QubmV4dCh0cnVlKTtcbiAgICAgICAgdGhpcy53b3JrZXJSZWFkeVN1YmplY3QuY29tcGxldGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgc3RhcnRMaXN0ZW4oKSB7XG4gICAgaWYodGhpcy5pc0xpc3RlbmluZykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdXb3JrZXJTZXJ2aWNlIGlzIGFscmVhZHkgbGlzdGVuaW5nJyk7XG4gICAgfVxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdPTiBMSVNURU4nLCB0aGlzLndvcmtlck5hbWUpO1xuICAgIHByb2Nlc3Mub24oJ21lc3NhZ2UnLCAocGF5bG9hZDogQ2x1c3Rlck1lc3NhZ2VFdmVudFBheWxvYWQpID0+IHtcbiAgICAgIGlmKHBheWxvYWQudG8gPT09IHRoaXMud29ya2VyTmFtZSkge1xuICAgICAgICB0aGlzLm9uUmVjZWl2ZWRNZXNzYWdlKHBheWxvYWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBtZXNzYWdlIHNlbmQgdG8gd3JvbmcgV29ya2VyIHRvPSR7cGF5bG9hZC50b30sIGN1cnJlbnQ9JHt0aGlzLndvcmtlck5hbWV9YCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzZW5kTWVzc2FnZShwYXlsb2FkOiBPbWl0PENsdXN0ZXJNZXNzYWdlRXZlbnRQYXlsb2FkLCAnZnJvbSc+KSB7XG4gICAgaWYocHJvY2Vzcz8uc2VuZCkge1xuICAgICAgcHJvY2Vzcy5zZW5kKHtcbiAgICAgICAgZnJvbTogdGhpcy53b3JrZXJOYW1lLFxuICAgICAgICAuLi5wYXlsb2FkLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5zZW5kIGlzIG5vdCBkZWZpbmVkJyk7XG4gIH1cblxuICByZWFkeSgpIHtcbiAgICB0aGlzLnNlbmRNZXNzYWdlKHtcbiAgICAgIHRvOiBUc1dvcmtlck5hbWUuQ09SRSxcbiAgICAgIHR5cGU6IENsdXN0ZXJNZXNzYWdlVHlwZS5SRUFEWSxcbiAgICB9KTtcbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICB0bzogVHNXb3JrZXJOYW1lLkNPUkUsXG4gICAgICB0eXBlOiBDbHVzdGVyTWVzc2FnZVR5cGUuU1RPUCxcbiAgICB9KTtcbiAgfVxuXG59IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicnhqc1wiKTs7IiwiaW1wb3J0IHsgVHNXb3JrZXJOYW1lIH0gZnJvbSAnQHRzLXNkay9jb25zdGFudCc7XG5pbXBvcnQgeyBSZWNvcmQsIFN0cmluZyB9IGZyb20gJ3J1bnR5cGVzJztcblxuY29uc3QgVHNXb3JrZXJOYW1lQnJhbmQgPSBTdHJpbmcud2l0aENvbnN0cmFpbnQoKHMpID0+IE9iamVjdC52YWx1ZXMoVHNXb3JrZXJOYW1lKS5pbmNsdWRlcyhzIGFzIFRzV29ya2VyTmFtZSkpO1xuXG5leHBvcnQgZW51bSBDbHVzdGVyTWVzc2FnZVR5cGUge1xuICBVTktOT1dOLFxuICBTVEFSVCxcbiAgUkVBRFksXG4gIEFMTF9SRUFEWSxcbiAgU1RPUCxcbiAgTUVTU0FHRSxcblxufVxuXG5leHBvcnQgY29uc3QgQ2x1c3Rlck1lc3NhZ2VFdmVudFBheWxvYWQgPSBSZWNvcmQoe1xuICBmcm9tOiBUc1dvcmtlck5hbWVCcmFuZCxcbiAgdG86IFRzV29ya2VyTmFtZUJyYW5kLFxuICAvLyBwYXlsb2FkOiBhbnksXG59KTtcblxuZXhwb3J0IHR5cGUgQ2x1c3Rlck1lc3NhZ2VFdmVudFBheWxvYWQgPSB7XG4gIGZyb206IFRzV29ya2VyTmFtZTtcbiAgdG86IFRzV29ya2VyTmFtZTtcbiAgdHlwZTogQ2x1c3Rlck1lc3NhZ2VUeXBlLFxuICBtZXNzYWdlPzogc3RyaW5nO1xuICBkYXRhPzogYW55O1xufSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInJ1bnR5cGVzXCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJyeGpzL2ludGVybmFsL2ZpcnN0VmFsdWVGcm9tXCIpOzsiLCJpbXBvcnQgeyBMb2dnZXJNb2R1bGUgfSBmcm9tICdAY29tbW9uL2xvZ2dlci9sb2dnZXIubW9kdWxlJztcbmltcG9ydCB7IEdsb2JhbCwgTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgQ29uZmlnTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy9jb25maWcnO1xuaW1wb3J0IHsgTWFpblByb2Nlc3NTZXJ2aWNlIH0gZnJvbSAnLi9tYWluLXByb2Nlc3Muc2VydmljZSc7XG5pbXBvcnQgeyBXb3JrZXJTZXJ2aWNlIH0gZnJvbSAnLi93b3JrZXIuc2VydmljZSc7XG5AR2xvYmFsKClcbkBNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgQ29uZmlnTW9kdWxlLFxuICAgIExvZ2dlck1vZHVsZSxcbiAgXSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgTWFpblByb2Nlc3NTZXJ2aWNlLFxuICBdLFxuICBleHBvcnRzOiBbTWFpblByb2Nlc3NTZXJ2aWNlXVxufSlcbmV4cG9ydCBjbGFzcyBNYWluUHJvY2Vzc01vZHVsZSB7fVxuXG5AR2xvYmFsKClcbkBNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgQ29uZmlnTW9kdWxlLFxuICAgIExvZ2dlck1vZHVsZSxcbiAgXSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgV29ya2VyU2VydmljZSxcbiAgXSxcbiAgZXhwb3J0czogW1dvcmtlclNlcnZpY2VdXG59KVxuZXhwb3J0IGNsYXNzIFdvcmtlck1vZHVsZSB7fVxuIiwiaW1wb3J0IHR5cGUgeyBDbHVzdGVyIH0gZnJvbSAnY2x1c3Rlcic7XG5pbXBvcnQgKiBhcyBfY2x1c3RlciBmcm9tICdjbHVzdGVyJztcbmNvbnN0IGNsdXN0ZXIgPSBfY2x1c3RlciBhcyB1bmtub3duIGFzIENsdXN0ZXI7XG5pbXBvcnQgeyBDbHVzdGVyTWVzc2FnZUV2ZW50UGF5bG9hZCwgQ2x1c3Rlck1lc3NhZ2VUeXBlIH0gZnJvbSAnQHRzLXNkay9kb21haW4vZXZlbnRzL2NsdXN0ZXInO1xuaW1wb3J0IHsgUGlub0xvZ2dlclNlcnZpY2UgfSBmcm9tICdAY29tbW9uL2xvZ2dlci9hZGFwdGVycy9yZWFsL3Bpbm9Mb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBJbmplY3RhYmxlLCBTY29wZSB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IFRzV29ya2VyTmFtZSwgV29ya2VySXRlbSB9IGZyb20gJ0B0cy1zZGsvY29uc3RhbnQnO1xuaW1wb3J0IHsgZ2V0V29ya2VyTmFtZSB9IGZyb20gJ0B0cy1zZGsvaGVscGVyJztcbmltcG9ydCB7IGRlbGF5LCBmaWx0ZXIsIGZpcnN0LCBwaXBlLCBSZXBsYXlTdWJqZWN0LCBza2lwVW50aWwgfSBmcm9tICdyeGpzJztcblxuQEluamVjdGFibGUoe1xuICBzY29wZTogU2NvcGUuREVGQVVMVCxcbn0pXG5leHBvcnQgY2xhc3MgTWFpblByb2Nlc3NTZXJ2aWNlIHtcbiAgcHVibGljIHdvcmtlck1hcDoge1xuICAgIFtuYW1lOiBzdHJpbmddOiBXb3JrZXJJdGVtO1xuICB9ID0ge307XG4gIHByaXZhdGUgc2VsZldvcmtlck5hbWU6IFRzV29ya2VyTmFtZTtcbiAgcHJpdmF0ZSB3b3JrZXJSZWFkeVN1YmplY3QgPSBuZXcgUmVwbGF5U3ViamVjdDxib29sZWFuPigxKTtcbiAgcHVibGljIGlzUmVhZHkgPSB0aGlzLndvcmtlclJlYWR5U3ViamVjdC5hc09ic2VydmFibGUoKTtcblxuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGxvZ2dlcjogUGlub0xvZ2dlclNlcnZpY2UpIHtcbiAgICB0aGlzLnNlbGZXb3JrZXJOYW1lID0gZ2V0V29ya2VyTmFtZSgpO1xuICAgIHRoaXMud29ya2VyUmVhZHlTdWJqZWN0Lm5leHQoZmFsc2UpO1xuICAgIHRoaXMubG9nZ2VyLnNldENvbnRleHQoJ01haW5Qcm9jZXNzU2VydmljZScpO1xuXG4gICAgdGhpcy5oYW5kbGVBbGxXb3JrZXJSZWFkeSgpO1xuICB9XG5cbiAgaGFuZGxlQWxsV29ya2VyUmVhZHkoKSB7XG4gICAgLy8gVE9ETzogb25seSBoYW5kbGUgZmlyc3QgP1xuICAgIHRoaXMuaXNSZWFkeS5waXBlKFxuICAgICAgZmlsdGVyKChpc1JlYWR5KSA9PiBpc1JlYWR5KSxcbiAgICAgIGZpcnN0KCksXG4gICAgICBkZWxheSgxMDAwICogMyksXG4gICAgKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgT2JqZWN0LnZhbHVlcyh0aGlzLndvcmtlck1hcCkuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICBmcm9tOiB0aGlzLnNlbGZXb3JrZXJOYW1lLFxuICAgICAgICAgIHRvOiBpdGVtLm5hbWUsXG4gICAgICAgICAgdHlwZTogQ2x1c3Rlck1lc3NhZ2VUeXBlLlJFQURZLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgb25SZWNlaXZlZE1lc3NhZ2UocGF5bG9hZDogQ2x1c3Rlck1lc3NhZ2VFdmVudFBheWxvYWQpIHtcbiAgICB0aGlzLmxvZ2dlci5sb2coeyBuYW1lOiB0aGlzLnNlbGZXb3JrZXJOYW1lLCB0eXBlOiAnbWVzc2FnZScsIHBheWxvYWQgfSk7XG4gICAgc3dpdGNoIChwYXlsb2FkLnR5cGUpIHtcbiAgICAgIGNhc2UgQ2x1c3Rlck1lc3NhZ2VUeXBlLlJFQURZOlxuICAgICAgICAvLyBXb3JrZXIgaW5pdGVkIC0tIHNlbmRNZXNzYWdlKFJFQURZLCBDb3JlKSAtPiBNYWluUHJvY2VzcyAtLSBjaGVjayBBbGwgd29ya2VyIHJlYWR5IC0+ICBoYW5kbGVBbGxXb3JrZXJSZWFkeSAtLSBzZW5kTWVzc2FnZShSRUFEWSwgV29ya2VyKSAtPiBXb3JrZXIgb25SZWFkeVxuICAgICAgICB0aGlzLmdldFdvcmtlcihwYXlsb2FkLmZyb20pLmlzUmVhZHkgPSB0cnVlO1xuICAgICAgICBjb25zdCBpc0FsbFJlYWR5ID0gT2JqZWN0LnZhbHVlcyh0aGlzLndvcmtlck1hcCkuZXZlcnkoKGl0ZW0pID0+IGl0ZW0uaXNSZWFkeSk7XG4gICAgICAgIHRoaXMud29ya2VyUmVhZHlTdWJqZWN0Lm5leHQoaXNBbGxSZWFkeSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgc2V0V29ya2VyKG5hbWU6IFRzV29ya2VyTmFtZSwgd29ya2VySXRlbTogV29ya2VySXRlbSkge1xuICAgIGlmKCFjbHVzdGVyLmlzUHJpbWFyeSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZXRXb3JrZXIoKSBzaG91bGQgb25seSBiZSBjYWxsZWQgaW4gcHJpbWFyeSBwcm9jZXNzJyk7XG4gICAgfVxuICAgIHRoaXMud29ya2VyTWFwW25hbWVdID0gd29ya2VySXRlbTtcbiAgfVxuICBnZXRXb3JrZXIobmFtZTogVHNXb3JrZXJOYW1lKSB7XG4gICAgY29uc3Qgd29ya2VyID0gdGhpcy53b3JrZXJNYXBbbmFtZV07XG4gICAgaWYoIXdvcmtlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGB3b3JrZXIgJHtuYW1lfSBpcyBub3QgZm91bmRgKTtcbiAgICB9XG4gICAgcmV0dXJuIHdvcmtlcjtcbiAgfVxuXG4gIHNlbmRNZXNzYWdlKHBheWxvYWQ6IENsdXN0ZXJNZXNzYWdlRXZlbnRQYXlsb2FkKSB7XG4gICAgdGhpcy5sb2dnZXIubG9nKHsgdHlwZTogJ3NlbmRNZXNzYWdlJywgcGF5bG9hZCB9KTtcbiAgICBpZihwYXlsb2FkLnRvID09PSB0aGlzLnNlbGZXb3JrZXJOYW1lKSB7XG4gICAgICB0aGlzLm9uUmVjZWl2ZWRNZXNzYWdlKHBheWxvYWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZighdGhpcy53b3JrZXJNYXBbcGF5bG9hZC50b10pIHtcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKGBXb3JrZXIgJHtwYXlsb2FkLnRvfSBub3QgZm91bmRgKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgV29ya2VyICR7cGF5bG9hZC50b30gbm90IGZvdW5kYCk7XG4gICAgfVxuICAgIHRoaXMud29ya2VyTWFwW3BheWxvYWQudG9dLndvcmtlcj8uc2VuZChwYXlsb2FkKTtcbiAgfVxuXG4gIGNsdXN0ZXJpemUod29ya2VyczogV29ya2VySXRlbVtdKSB7XG4gICAgaWYoIWNsdXN0ZXIuaXNQcmltYXJ5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsdXN0ZXJpemUoKSBzaG91bGQgb25seSBiZSBjYWxsZWQgaW4gcHJpbWFyeSBwcm9jZXNzJyk7XG4gICAgfVxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB3b3JrZXJzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3QgaXRlbSA9IHdvcmtlcnNbaW5kZXhdO1xuICAgICAgdGhpcy5sb2dnZXIubG9nKGAke1RzV29ya2VyTmFtZS5DT1JFfTogZm9yayBjbHVzdGVyICR7aXRlbS5uYW1lfWApO1xuICAgICAgY29uc3Qgd29ya2VyID0gY2x1c3Rlci5mb3JrKHtcbiAgICAgICAgVFNfV09SS0VSX05BTUU6IGl0ZW0ubmFtZSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5zZXRXb3JrZXIoaXRlbS5uYW1lLCB7XG4gICAgICAgIC4uLml0ZW0sXG4gICAgICAgIHdvcmtlcixcbiAgICAgIH0pO1xuICAgICAgd29ya2VyLm9uY2UoJ29ubGluZScsICgpID0+IHtcbiAgICAgICAgdGhpcy5sb2dnZXIubG9nKGBXb3JrZXIgJHtpdGVtLm5hbWV9LSR7d29ya2VyLnByb2Nlc3MucGlkfSBvbmxpbmUhYCk7XG4gICAgICB9KTtcbiAgICAgIHdvcmtlci5vbmNlKCdleGl0JywgKCkgPT4ge1xuICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcihgV29ya2VyICR7aXRlbS5uYW1lfS0ke3dvcmtlci5wcm9jZXNzLnBpZH0gZGllZC5gKTtcbiAgICAgIH0pO1xuICAgICAgd29ya2VyLm9uKCdtZXNzYWdlJywgdGhpcy5zZW5kTWVzc2FnZS5iaW5kKHRoaXMpKTtcbiAgICB9XG4gIH1cbiAgXG59IiwiaW1wb3J0IHsgUGlub0xvZ2dlclNlcnZpY2UgfSBmcm9tICdAY29tbW9uL2xvZ2dlci9hZGFwdGVycy9yZWFsL3Bpbm9Mb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBDb25maWdTZXJ2aWNlIH0gZnJvbSAnQG5lc3Rqcy9jb25maWcnO1xuaW1wb3J0IHsgTmVzdEZhY3RvcnkgfSBmcm9tICdAbmVzdGpzL2NvcmUnO1xuaW1wb3J0IHsgZ2V0V29ya2VyTmFtZSwgZ2V0UHJvY2Vzc05hbWUgfSBmcm9tICcuL2hlbHBlcic7XG5cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldHVwQXBwKG1vZHVsZTogYW55KSB7XG4gIGNvbnN0IGFwcCA9IGF3YWl0IE5lc3RGYWN0b3J5LmNyZWF0ZUFwcGxpY2F0aW9uQ29udGV4dChtb2R1bGUpO1xuICBjb25zdCBjb25maWdTZXJ2aWNlID0gYXBwLmdldChDb25maWdTZXJ2aWNlKTtcbiAgY29uc3Qgd29ya2VyTmFtZSA9IGdldFdvcmtlck5hbWUoKTtcbiAgY29uc3QgbG9nZ2VyID0gYXBwLmdldChQaW5vTG9nZ2VyU2VydmljZSk7XG5cbiAgbG9nZ2VyLnNldENvbnRleHQoZ2V0UHJvY2Vzc05hbWUoKSk7XG4gIGFwcC51c2VMb2dnZXIobG9nZ2VyKTtcblxuICBsb2dnZXIubG9nKGAke2dldFByb2Nlc3NOYW1lKCl9OiBzZXJ2ZXIgc3RhcnRlZCFgKTtcbiAgcmV0dXJuIGFwcDtcbn1cblxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQG5lc3Rqcy9jb3JlXCIpOzsiLCJpbXBvcnQgeyBUc1NlcXVlbmNlck1vZHVsZSB9IGZyb20gJy4vdHMtc2VxdWVuY2VyLm1vZHVsZSc7XG5pbXBvcnQgeyBzZXR1cEFwcCB9IGZyb20gJ0B0cy1zZGsvc2V0dXAuaGVscGVyJztcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBib290c3RyYXAoKSB7XG4gIGNvbnN0IGFwcCA9IGF3YWl0IHNldHVwQXBwKFRzU2VxdWVuY2VyTW9kdWxlKTtcblxuICByZXR1cm4gYXBwO1xufSIsImltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgTW9kdWxlLCBPbk1vZHVsZUluaXQgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBMb2dnZXJNb2R1bGUgfSBmcm9tICdAY29tbW9uL2xvZ2dlci9sb2dnZXIubW9kdWxlJztcbmltcG9ydCB7IENvbmZpZ01vZHVsZSB9IGZyb20gJ0BuZXN0anMvY29uZmlnJztcbmltcG9ydCB7IFRzV29ya2VyTmFtZSB9IGZyb20gJ0B0cy1zZGsvY29uc3RhbnQnO1xuaW1wb3J0IHsgQnVsbFF1ZXVlTW9kdWxlIH0gZnJvbSAnLi4vLi4vY29tbW9uL2J1bGwtcXVldWUvc3JjL0J1bGxRdWV1ZS5tb2R1bGUnO1xuaW1wb3J0IHsgU2VxdWVuY2VyQ29uc3VtZXIgfSBmcm9tICcuL2luZnJhc3RydWN0dXJlL3NlcXVlbmNlci5wcm9jZXNzb3InO1xuaW1wb3J0IHsgQnVsbE1vZHVsZSB9IGZyb20gJ0BhbmNoYW44MjgvbmVzdC1idWxsbXEnO1xuaW1wb3J0IHsgU2NoZWR1bGVNb2R1bGUgfSBmcm9tICdAbmVzdGpzL3NjaGVkdWxlJztcbmltcG9ydCB7IFR5cGVPcm1Nb2R1bGUgfSBmcm9tICdAbmVzdGpzL3R5cGVvcm0nO1xuaW1wb3J0IHsgQmxvY2tJbmZvcm1hdGlvbiB9IGZyb20gJ2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L2Jsb2NrSW5mb3JtYXRpb24uZW50aXR5JztcbmltcG9ydCB7IFRyYW5zYWN0aW9uSW5mbyB9IGZyb20gJ2NvbW1vbi90cy10eXBlb3JtL3NyYy9hY2NvdW50L3RyYW5zYWN0aW9uSW5mby5lbnRpdHknO1xuaW1wb3J0IHsgVHNUeXBlT3JtTW9kdWxlIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL3RzdHlwZW9ybS5tb2R1bGUnO1xuaW1wb3J0IHsgV29ya2VyTW9kdWxlIH0gZnJvbSAnQGNvbW1vbi9jbHVzdGVyL2NsdXN0ZXIubW9kdWxlJztcbmltcG9ydCB7IFdvcmtlclNlcnZpY2UgfSBmcm9tICdAY29tbW9uL2NsdXN0ZXIvd29ya2VyLnNlcnZpY2UnO1xuXG5ATW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbmZpZ01vZHVsZSxcbiAgICBMb2dnZXJNb2R1bGUsXG4gICAgU2NoZWR1bGVNb2R1bGUuZm9yUm9vdCgpLFxuICAgIEJ1bGxRdWV1ZU1vZHVsZSxcbiAgICBCdWxsTW9kdWxlLnJlZ2lzdGVyUXVldWUoVHNXb3JrZXJOYW1lLlNFUVVFTkNFUiksXG4gICAgVHNUeXBlT3JtTW9kdWxlLFxuICAgIFR5cGVPcm1Nb2R1bGUuZm9yRmVhdHVyZShcbiAgICAgIFtcbiAgICAgICAgVHJhbnNhY3Rpb25JbmZvLFxuICAgICAgICBCbG9ja0luZm9ybWF0aW9uLFxuICAgICAgXSksXG4gICAgV29ya2VyTW9kdWxlLFxuICBdLFxuICBjb250cm9sbGVyczogW10sXG4gIHByb3ZpZGVyczogW1xuICAgIFNlcXVlbmNlckNvbnN1bWVyLFxuICAgIC8vIFNlcVByb2R1Y2VyU2VydmljZSxcbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBUc1NlcXVlbmNlck1vZHVsZSBpbXBsZW1lbnRzIE9uTW9kdWxlSW5pdCB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1lbXB0eS1mdW5jdGlvblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlcjogUGlub0xvZ2dlclNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSB3b3JrZXJTZXJ2aWNlOiBXb3JrZXJTZXJ2aWNlLFxuICApIHsgfVxuXG4gIG9uTW9kdWxlSW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLndvcmtlclNlcnZpY2UucmVhZHkoKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgVHNXb3JrZXJOYW1lIH0gZnJvbSAnQHRzLXNkay9jb25zdGFudCc7XG5pbXBvcnQgeyBQaW5vTG9nZ2VyU2VydmljZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2FkYXB0ZXJzL3JlYWwvcGlub0xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IEJ1bGxXb3JrZXIsIEJ1bGxXb3JrZXJQcm9jZXNzIH0gZnJvbSAnQGFuY2hhbjgyOC9uZXN0LWJ1bGxtcSc7XG5pbXBvcnQgeyBKb2IgfSBmcm9tICdidWxsbXEnO1xuaW1wb3J0IHsgSW5qZWN0UmVwb3NpdG9yeSB9IGZyb20gJ0BuZXN0anMvdHlwZW9ybSc7XG5pbXBvcnQgeyBCbG9ja0luZm9ybWF0aW9uIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvYmxvY2tJbmZvcm1hdGlvbi5lbnRpdHknO1xuaW1wb3J0IHsgVHJhbnNhY3Rpb25JbmZvIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvdHJhbnNhY3Rpb25JbmZvLmVudGl0eSc7XG5pbXBvcnQgeyBSZXBvc2l0b3J5IH0gZnJvbSAndHlwZW9ybSc7XG5pbXBvcnQgeyBUU19TVEFUVVMgfSBmcm9tICdjb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC90c1N0YXR1cy5lbnVtJztcblxuQEJ1bGxXb3JrZXIoe1xuICBxdWV1ZU5hbWU6IFRzV29ya2VyTmFtZS5TRVFVRU5DRVIsXG4gIG9wdGlvbnM6IHtcbiAgICBjb25jdXJyZW5jeTogMVxuICB9XG59KVxuZXhwb3J0IGNsYXNzIFNlcXVlbmNlckNvbnN1bWVyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBsb2dnZXI6IFBpbm9Mb2dnZXJTZXJ2aWNlLFxuICAgIEBJbmplY3RSZXBvc2l0b3J5KFRyYW5zYWN0aW9uSW5mbylcbiAgICBwcml2YXRlIHR4UmVwb3NpdG9yeTogUmVwb3NpdG9yeTxUcmFuc2FjdGlvbkluZm8+LFxuICAgIEBJbmplY3RSZXBvc2l0b3J5KEJsb2NrSW5mb3JtYXRpb24pXG4gICAgcHJpdmF0ZSBibG9ja1JlcG9zaXRvcnk6IFJlcG9zaXRvcnk8QmxvY2tJbmZvcm1hdGlvbj4sXG5cbiAgKSB7XG4gICAgdGhpcy5sb2dnZXIubG9nKCdTRVFVRU5DRVIucHJvY2VzcyBTVEFSVCcpO1xuICB9XG4gIEBCdWxsV29ya2VyUHJvY2Vzcyh7XG4gICAgYXV0b3J1bjogdHJ1ZSxcbiAgfSlcbiAgYXN5bmMgcHJvY2Vzcyhqb2I6IEpvYjxUcmFuc2FjdGlvbkluZm8+KSB7XG4gICAgdGhpcy5sb2dnZXIubG9nKGBTRVFVRU5DRVIucHJvY2VzcyAke2pvYi5kYXRhLnR4SWR9YCk7XG4gICAgLy8gVE9ETzogU2VxdWVuY2VyIHByb2Nlc3NcbiAgICBhd2FpdCB0aGlzLnR4UmVwb3NpdG9yeS51cGRhdGUoe1xuICAgICAgdHhJZDogam9iLmRhdGEudHhJZCxcbiAgICB9LCB7XG4gICAgICB0eFN0YXR1czogVFNfU1RBVFVTLlBST0NFU1NJTkdcbiAgICB9KTtcbiAgICBhd2FpdCBkZWxheSgxMDAwICogMS41KTtcbiAgICBhd2FpdCB0aGlzLnR4UmVwb3NpdG9yeS51cGRhdGUoe1xuICAgICAgdHhJZDogam9iLmRhdGEudHhJZCxcbiAgICB9LCB7XG4gICAgICB0eFN0YXR1czogVFNfU1RBVFVTLkwyRVhFQ1VURURcbiAgICB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkZWxheShtczogbnVtYmVyKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSApO1xufSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIkBuZXN0anMvc2NoZWR1bGVcIik7OyIsImltcG9ydCB7IENsdXN0ZXJNZXNzYWdlRXZlbnRQYXlsb2FkIH0gZnJvbSAnQHRzLXNkay9kb21haW4vZXZlbnRzL2NsdXN0ZXInO1xuaW1wb3J0IHsgVHNQcm92ZXJNb2R1bGUgfSBmcm9tICcuL3RzLXByb3Zlci5tb2R1bGUnO1xuaW1wb3J0IHsgc2V0dXBBcHAgfSBmcm9tICdAdHMtc2RrL3NldHVwLmhlbHBlcic7XG5pbXBvcnQgeyBQaW5vTG9nZ2VyU2VydmljZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2FkYXB0ZXJzL3JlYWwvcGlub0xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IFRzV29ya2VyTmFtZSB9IGZyb20gJ0B0cy1zZGsvY29uc3RhbnQnO1xuXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBib290c3RyYXAoKSB7XG4gIGNvbnN0IGFwcCA9IGF3YWl0IHNldHVwQXBwKFRzUHJvdmVyTW9kdWxlKTtcbiAgY29uc3QgbG9nZ2VyID0gYXBwLmdldChQaW5vTG9nZ2VyU2VydmljZSk7XG4gIGxvZ2dlci5zZXRDb250ZXh0KFRzV29ya2VyTmFtZS5QUk9WRVIpO1xuXG4gIHJldHVybiBhcHA7XG59IiwiaW1wb3J0IHsgUGlub0xvZ2dlclNlcnZpY2UgfSBmcm9tICdAY29tbW9uL2xvZ2dlci9hZGFwdGVycy9yZWFsL3Bpbm9Mb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBNb2R1bGUsIE9uTW9kdWxlSW5pdCB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IExvZ2dlck1vZHVsZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2xvZ2dlci5tb2R1bGUnO1xuaW1wb3J0IHsgQ29uZmlnTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy9jb25maWcnO1xuaW1wb3J0IHsgVHNXb3JrZXJOYW1lIH0gZnJvbSAnQHRzLXNkay9jb25zdGFudCc7XG5pbXBvcnQgeyBCdWxsUXVldWVNb2R1bGUgfSBmcm9tICdjb21tb24vYnVsbC1xdWV1ZS9zcmMvQnVsbFF1ZXVlLm1vZHVsZSc7XG5pbXBvcnQgeyBQcm92ZXJDb25zdW1lciB9IGZyb20gJy4vaW5mcmFzdHJ1Y3R1cmUvcHJvdmVyLnByb2Nlc3Nvcic7XG5pbXBvcnQgeyBCdWxsTW9kdWxlIH0gZnJvbSAnQGFuY2hhbjgyOC9uZXN0LWJ1bGxtcSc7XG5pbXBvcnQgeyBUeXBlT3JtTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy90eXBlb3JtJztcbmltcG9ydCB7IEJsb2NrSW5mb3JtYXRpb24gfSBmcm9tICdjb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC9ibG9ja0luZm9ybWF0aW9uLmVudGl0eSc7XG5pbXBvcnQgeyBUcmFuc2FjdGlvbkluZm8gfSBmcm9tICdjb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC90cmFuc2FjdGlvbkluZm8uZW50aXR5JztcbmltcG9ydCB7IFRzVHlwZU9ybU1vZHVsZSB9IGZyb20gJ2NvbW1vbi90cy10eXBlb3JtL3NyYy90c3R5cGVvcm0ubW9kdWxlJztcbmltcG9ydCB7IFdvcmtlclNlcnZpY2UgfSBmcm9tICdAY29tbW9uL2NsdXN0ZXIvd29ya2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgV29ya2VyTW9kdWxlIH0gZnJvbSAnLi4vLi4vY29tbW9uL2NsdXN0ZXIvc3JjL2NsdXN0ZXIubW9kdWxlJztcblxuQE1vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBDb25maWdNb2R1bGUsXG4gICAgTG9nZ2VyTW9kdWxlLFxuICAgIEJ1bGxRdWV1ZU1vZHVsZSxcbiAgICBCdWxsTW9kdWxlLnJlZ2lzdGVyUXVldWUoVHNXb3JrZXJOYW1lLlBST1ZFUiksXG4gICAgVHNUeXBlT3JtTW9kdWxlLFxuICAgIFR5cGVPcm1Nb2R1bGUuZm9yRmVhdHVyZShcbiAgICAgIFtcbiAgICAgICAgVHJhbnNhY3Rpb25JbmZvLFxuICAgICAgICBCbG9ja0luZm9ybWF0aW9uLFxuICAgICAgXSksXG4gICAgV29ya2VyTW9kdWxlLFxuICBdLFxuICBjb250cm9sbGVyczogW10sXG4gIHByb3ZpZGVyczogW1xuICAgIFByb3ZlckNvbnN1bWVyLFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBUc1Byb3Zlck1vZHVsZSBpbXBsZW1lbnRzIE9uTW9kdWxlSW5pdCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgbG9nZ2VyOiBQaW5vTG9nZ2VyU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHdvcmtlclNlcnZpY2U6IFdvcmtlclNlcnZpY2UsXG4gICkgeyB9XG5cbiAgb25Nb2R1bGVJbml0KCk6IHZvaWQge1xuICAgIHRoaXMud29ya2VyU2VydmljZS5yZWFkeSgpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBUc1dvcmtlck5hbWUgfSBmcm9tICdAdHMtc2RrL2NvbnN0YW50JztcbmltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgcHJvdmUgfSBmcm9tICdAdHMtcHJvdmVyL2RvbWFpbi9wcm92ZXItY29yZSc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBDb25maWdTZXJ2aWNlIH0gZnJvbSAnQG5lc3Rqcy9jb25maWcnO1xuaW1wb3J0IHsgSW5qZWN0UmVwb3NpdG9yeSB9IGZyb20gJ0BuZXN0anMvdHlwZW9ybSc7XG5pbXBvcnQgeyBCbG9ja0luZm9ybWF0aW9uIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvYmxvY2tJbmZvcm1hdGlvbi5lbnRpdHknO1xuaW1wb3J0IHsgUmVwb3NpdG9yeSB9IGZyb20gJ3R5cGVvcm0nO1xuLy8gaW1wb3J0IHsgVFNfU1RBVFVTIH0gZnJvbSAnLi4vLi4vLi4vY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvdHNTdGF0dXMuZW51bSc7XG5pbXBvcnQgeyBCdWxsV29ya2VyLCBCdWxsV29ya2VyUHJvY2VzcyB9IGZyb20gJ0BhbmNoYW44MjgvbmVzdC1idWxsbXEnO1xuaW1wb3J0IHsgSm9iIH0gZnJvbSAnYnVsbG1xJztcbmltcG9ydCB7IEJMT0NLX1NUQVRVUyB9IGZyb20gJ0Bjb21tb24vdHMtdHlwZW9ybS9hY2NvdW50L2Jsb2NrU3RhdHVzLmVudW0nO1xuQEJ1bGxXb3JrZXIoe3F1ZXVlTmFtZTogVHNXb3JrZXJOYW1lLlBST1ZFUn0pXG5leHBvcnQgY2xhc3MgUHJvdmVyQ29uc3VtZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvbmZpZzogQ29uZmlnU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlcjogUGlub0xvZ2dlclNlcnZpY2UsXG4gICAgQEluamVjdFJlcG9zaXRvcnkoQmxvY2tJbmZvcm1hdGlvbilcbiAgICBwcml2YXRlIGJsb2NrUmVwb3NpdG9yeTogUmVwb3NpdG9yeTxCbG9ja0luZm9ybWF0aW9uPixcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWVtcHR5LWZ1bmN0aW9uXG4gICkgeyB9XG5cbiAgXG4gIGdldENpcmN1aXRJbnB1dFBhdGgobmFtZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHBhdGgucmVzb2x2ZSh0aGlzLmNvbmZpZy5nZXQoJ0NJUkNVSVRfSU5QVVRfUEFUSF9CQVNFJywgJycpLCBgLi8ke25hbWV9LWlucHV0Lmpzb25gKTtcbiAgfVxuXG4gIEBCdWxsV29ya2VyUHJvY2VzcygpXG4gIGFzeW5jIHByb2Nlc3Moam9iOiBKb2I8QmxvY2tJbmZvcm1hdGlvbj4pIHtcbiAgICB0aGlzLmxvZ2dlci5sb2coYFByb3ZlckNvbnN1bWVyLnByb2Nlc3MgJHtqb2IuZGF0YS5ibG9ja051bWJlcn1gKTtcblxuICAgIC8vIGNvbnN0IHsgY2lyY3VpdElucHV0IH0gPSBqb2IuZGF0YTtcbiAgICBjb25zdCBpbnB1dE5hbWUgPSBqb2IuZGF0YS5ibG9ja051bWJlci50b1N0cmluZygpO1xuICAgIGNvbnN0IGlucHV0UGF0aCA9IHRoaXMuZ2V0Q2lyY3VpdElucHV0UGF0aChpbnB1dE5hbWUpO1xuICAgIC8vIGZzLndyaXRlRmlsZVN5bmMoaW5wdXRQYXRoLCBKU09OLnN0cmluZ2lmeShjaXJjdWl0SW5wdXQpKTtcblxuICAgIGNvbnN0IHsgcHJvb2ZQYXRoLCBwdWJsaWNQYXRoIH0gPSBhd2FpdCBwcm92ZShpbnB1dE5hbWUsIGlucHV0UGF0aCwgJ2NpcmN1aXQnKTtcbiAgICBjb25zdCBwcm9vZiA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHByb29mUGF0aCwgJ3V0ZjgnKSk7XG4gICAgY29uc3QgcHVibGljSW5wdXQgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwdWJsaWNQYXRoLCAndXRmOCcpKTtcbiAgICBcbiAgICBhd2FpdCB0aGlzLmJsb2NrUmVwb3NpdG9yeS51cGRhdGUoe1xuICAgICAgYmxvY2tOdW1iZXI6IGpvYi5kYXRhLmJsb2NrTnVtYmVyLFxuICAgIH0se1xuICAgICAgYmxvY2tTdGF0dXM6IEJMT0NLX1NUQVRVUy5MMkNPTkZJUk1FRCxcbiAgICAgIHByb29mLFxuICAgICAgLy8gcHVibGljSW5wdXQsXG4gICAgfSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiIsImNvbnN0IHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5pbXBvcnQge3Jlc29sdmV9IGZyb20gJ3BhdGgnO1xuXG5jb25zdCBfZXhlYyA9IHV0aWwucHJvbWlzaWZ5KHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKS5leGVjKTtcbmNvbnN0IENJUkNVSVRfQkFTRSA9IHByb2Nlc3MuZW52LkNJUkNVSVRfQkFTRSB8fCAnJztcbmNvbnN0IFJBUElEU05BUktfUEFUSCA9IHByb2Nlc3MuZW52LlJBUElEU05BUktfUEFUSCA/IHJlc29sdmUoX19kaXJuYW1lLCBwcm9jZXNzLmVudi5SQVBJRFNOQVJLX1BBVEgpIDogJyc7XG5jb25zdCBDaXJjb21CdWlsZEJhc2VEaXIgPSByZXNvbHZlKF9fZGlybmFtZSwgJy4uLycsIENJUkNVSVRfQkFTRSk7XG5leHBvcnQgY29uc3QgQmF0Y2hlc0RpciA9IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vJywgQ0lSQ1VJVF9CQVNFKTtcbmNvbnN0IGNtZExvZ3M6IHN0cmluZ1tdID0gW107XG5jb25zdCBERUJVRyA9IHRydWU7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm92ZShpbnB1dE5hbWU6IHN0cmluZywgaW5wdXRQYXRoOiBzdHJpbmcsIGNpcmN1aXROYW1lOiBzdHJpbmcpIHtcbiAgY29uc29sZS50aW1lKGBwcm92ZSAke2lucHV0UGF0aH1gKTtcbiAgY29uc3QgeyB3aXRuZXNzUGF0aCB9ID0gYXdhaXQgZ2VuZXJhdGVXaXRuZXNzKGlucHV0TmFtZSwgaW5wdXRQYXRoLCBjaXJjdWl0TmFtZSk7XG4gIGNvbnN0IHtcbiAgICBwcm9vZlBhdGgsXG4gICAgcHVibGljUGF0aCxcbiAgfSA9IGF3YWl0IGdlbmVyYXRlUHJvb2YoaW5wdXROYW1lLCB3aXRuZXNzUGF0aCwgY2lyY3VpdE5hbWUpO1xuICBjb25zb2xlLnRpbWVFbmQoYHByb3ZlICR7aW5wdXRQYXRofWApO1xuICByZXR1cm4ge1xuICAgIHdpdG5lc3NQYXRoLFxuICAgIHByb29mUGF0aCxcbiAgICBwdWJsaWNQYXRoLFxuICB9O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVQcm9vZihpbnB1dE5hbWU6IHN0cmluZywgd2l0bmVzc1BhdGg6IHN0cmluZywgY2lyY3VpdE5hbWU6IHN0cmluZykge1xuICBjb25zdCBiYXNlRm9sZGVyUGF0aCA9IHJlc29sdmUoX19kaXJuYW1lLCBgJHtDaXJjb21CdWlsZEJhc2VEaXJ9LyR7Y2lyY3VpdE5hbWV9YCk7XG5cbiAgY29uc3QgcHJvb2ZQYXRoID0gcmVzb2x2ZShfX2Rpcm5hbWUsIGAke0JhdGNoZXNEaXJ9LyR7aW5wdXROYW1lfS1wcm9vZi5qc29uYCk7XG4gIGNvbnN0IHB1YmxpY1BhdGggPSByZXNvbHZlKF9fZGlybmFtZSwgYCR7QmF0Y2hlc0Rpcn0vJHtpbnB1dE5hbWV9LXB1YmxpYy5qc29uYCk7XG4gIGNvbnN0IHByb3ZlQ21kID0gUkFQSURTTkFSS19QQVRIID8gYCR7UkFQSURTTkFSS19QQVRIfWAgOiAnbnB4IHNuYXJranMgZ3JvdGgxNiBwcm92ZSc7XG4gIGNvbnN0IHsgc3Rkb3V0LCB9ID0gYXdhaXQgZXhlYyhgJHtwcm92ZUNtZH0gJHtiYXNlRm9sZGVyUGF0aH0vJHtjaXJjdWl0TmFtZX0uemtleSAke3dpdG5lc3NQYXRofSAke3Byb29mUGF0aH0gJHtwdWJsaWNQYXRofWApO1xuXG4gIHJldHVybiB7XG4gICAgc3Rkb3V0LFxuICAgIHByb29mUGF0aCxcbiAgICBwdWJsaWNQYXRoLFxuICB9O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVXaXRuZXNzKGlucHV0TmFtZTogc3RyaW5nLCBpbnB1dFBhdGg6IHN0cmluZywgY2lyY3VpdE5hbWU6IHN0cmluZykge1xuICBjb25zdCBidWlsZERpciA9IHJlc29sdmUoX19kaXJuYW1lLCBgJHtDaXJjb21CdWlsZEJhc2VEaXJ9LyR7Y2lyY3VpdE5hbWV9YCk7XG4gIGNvbnN0IHdpdG5lc3NQYXRoID0gcmVzb2x2ZShfX2Rpcm5hbWUsIGAke0JhdGNoZXNEaXJ9LyR7aW5wdXROYW1lfS13aXRuZXNzLnd0bnNgKTtcbiAgY29uc3QgeyBzdGRvdXQsIH0gPSBhd2FpdCBleGVjKGBub2RlICR7YnVpbGREaXJ9LyR7Y2lyY3VpdE5hbWV9X2pzL2dlbmVyYXRlX3dpdG5lc3MuanMgJHtidWlsZERpcn0vJHtjaXJjdWl0TmFtZX1fanMvJHtjaXJjdWl0TmFtZX0ud2FzbSAke2lucHV0UGF0aH0gJHt3aXRuZXNzUGF0aH1gKTtcblxuICByZXR1cm4ge1xuICAgIHN0ZG91dCxcbiAgICBjaXJjdWl0TmFtZSxcbiAgICB3aXRuZXNzUGF0aCxcbiAgfTtcbn1cblxuXG5mdW5jdGlvbiBleGVjKGNtZDogc3RyaW5nKTogUHJvbWlzZTx7aWQ6IG51bWJlciwgY21kOiBzdHJpbmcsIHN0ZG91dDogc3RyaW5nfT4ge1xuICBjbWRMb2dzLnB1c2goY21kKTtcbiAgY29uc3QgaWQgPSBjbWRMb2dzLmxlbmd0aCAtIDE7XG4gIGNvbnNvbGUubG9nKGBleGVjIGNvbW1hbmQoJHtpZH0pOiAke2NtZH1gKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBfZXhlYyhjbWQpLnRoZW4oKHtzdGRvdXQsIHN0ZGVycn06IHtzdGRvdXQ6IHN0cmluZywgc3RkZXJyOiBzdHJpbmd9KSA9PiB7XG4gICAgICBpZihzdGRlcnIpIHRocm93IG5ldyBFcnJvcihzdGRlcnIpO1xuICAgICAgaWYoREVCVUcpIGNvbnNvbGUubG9nKHN0ZG91dCk7XG4gICAgICByZXR1cm4gcmVzb2x2ZSh7aWQsIGNtZDogY21kTG9nc1tpZF0sIHN0ZG91dH0pO1xuICAgIH0pLmNhdGNoKChzdGRlcnI6IGFueSkgPT4ge1xuICAgICAgaWYoREVCVUcpIGNvbnNvbGUuZXJyb3Ioc3RkZXJyKTtcbiAgICAgIHJldHVybiByZWplY3Qoc3RkZXJyKTtcbiAgICB9KTtcbiAgfSk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ1dGlsXCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJwYXRoXCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjaGlsZF9wcm9jZXNzXCIpOzsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJmc1wiKTs7IiwiLy8gTmVzdCBpbXBvcnRzXG5pbXBvcnQgeyBQaW5vTG9nZ2VyU2VydmljZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2FkYXB0ZXJzL3JlYWwvcGlub0xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IExvZ2dlck1vZHVsZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2xvZ2dlci5tb2R1bGUnO1xuaW1wb3J0IHsgTW9kdWxlLCBPbk1vZHVsZUluaXQgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBDcXJzTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy9jcXJzJztcbmltcG9ydCB7IENvbmZpZ01vZHVsZSB9IGZyb20gJ0BuZXN0anMvY29uZmlnJztcbmltcG9ydCB7IFRzV29ya2VyTmFtZSB9IGZyb20gJy4uLy4uL3RzLXNkay9zcmMvY29uc3RhbnQnO1xuaW1wb3J0IHsgU2NoZWR1bGVNb2R1bGUgfSBmcm9tICdAbmVzdGpzL3NjaGVkdWxlJztcbmltcG9ydCB7IFByb2R1Y2VyU2VydmljZSB9IGZyb20gJy4vcHJvZHVjZXIuc2VydmljZSc7XG5pbXBvcnQgeyBCdWxsUXVldWVNb2R1bGUgfSBmcm9tICdjb21tb24vYnVsbC1xdWV1ZS9zcmMvQnVsbFF1ZXVlLm1vZHVsZSc7XG5pbXBvcnQgeyBUc1R5cGVPcm1Nb2R1bGUgfSBmcm9tICdjb21tb24vdHMtdHlwZW9ybS9zcmMvdHN0eXBlb3JtLm1vZHVsZSc7XG5pbXBvcnQgeyBUeXBlT3JtTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy90eXBlb3JtJztcbmltcG9ydCB7IEJsb2NrSW5mb3JtYXRpb24gfSBmcm9tICdjb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC9ibG9ja0luZm9ybWF0aW9uLmVudGl0eSc7XG5pbXBvcnQgeyBCdWxsTW9kdWxlIH0gZnJvbSAnQGFuY2hhbjgyOC9uZXN0LWJ1bGxtcSc7XG5pbXBvcnQgeyBEYXRhYmFzZVB1YlN1Yk1vZHVsZSB9IGZyb20gJ0Bjb21tb24vZGItcHVic3ViL2RiLXB1YnN1Yi5tb2R1bGUnO1xuaW1wb3J0IHsgVHJhbnNhY3Rpb25JbmZvIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvdHJhbnNhY3Rpb25JbmZvLmVudGl0eSc7XG5pbXBvcnQgeyBNYWluUHJvY2Vzc01vZHVsZSB9IGZyb20gJ0Bjb21tb24vY2x1c3Rlci9jbHVzdGVyLm1vZHVsZSc7XG5cbkBNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgQ29uZmlnTW9kdWxlLmZvclJvb3QoKSxcbiAgICBDcXJzTW9kdWxlLFxuICAgIExvZ2dlck1vZHVsZSxcbiAgICAvLyBOb3RpZmljYXRpb25zTW9kdWxlLFxuICAgIFNjaGVkdWxlTW9kdWxlLmZvclJvb3QoKSxcbiAgICBCdWxsUXVldWVNb2R1bGUsXG4gICAgVHNUeXBlT3JtTW9kdWxlLFxuICAgIFR5cGVPcm1Nb2R1bGUuZm9yRmVhdHVyZShcbiAgICAgIFtcbiAgICAgICAgVHJhbnNhY3Rpb25JbmZvLFxuICAgICAgICBCbG9ja0luZm9ybWF0aW9uLFxuICAgICAgXSksXG4gICAgQnVsbE1vZHVsZS5yZWdpc3RlclF1ZXVlKFxuICAgICAge1xuICAgICAgICBxdWV1ZU5hbWU6IFRzV29ya2VyTmFtZS5TRVFVRU5DRVIsXG4gICAgICB9LCB7XG4gICAgICAgIHF1ZXVlTmFtZTogVHNXb3JrZXJOYW1lLlBST1ZFUixcbiAgICAgIH0sIHtcbiAgICAgICAgcXVldWVOYW1lOiBUc1dvcmtlck5hbWUuT1BFUkFUT1IsXG4gICAgICB9XG4gICAgKSxcbiAgICBEYXRhYmFzZVB1YlN1Yk1vZHVsZSxcbiAgICBNYWluUHJvY2Vzc01vZHVsZSxcbiAgXSxcbiAgY29udHJvbGxlcnM6IFtdLFxuICBwcm92aWRlcnM6IFtcbiAgICBQcm9kdWNlclNlcnZpY2UsXG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgQXBwTW9kdWxlIGltcGxlbWVudHMgT25Nb2R1bGVJbml0IHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWVtcHR5LWZ1bmN0aW9uXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgbG9nZ2VyOiBQaW5vTG9nZ2VyU2VydmljZSkgeyB9XG5cbiAgb25Nb2R1bGVJbml0KCk6IHZvaWQge1xuICAgIHRoaXMubG9nZ2VyLnNldENvbnRleHQoVHNXb3JrZXJOYW1lLkNPUkUpO1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAbmVzdGpzL2NxcnNcIik7OyIsImltcG9ydCB7IEJ1bGxRdWV1ZUluamVjdCB9IGZyb20gJ0BhbmNoYW44MjgvbmVzdC1idWxsbXEnO1xuaW1wb3J0IHsgQ0hBTk5FTCB9IGZyb20gJ0Bjb21tb24vZGItcHVic3ViL2RvbWFpbnMvdmFsdWUtb2JqZWN0cy9wdWJTdWIuY29uc3RhbnRzJztcbmltcG9ydCB7IE1lc3NhZ2VCcm9rZXIgfSBmcm9tICdAY29tbW9uL2RiLXB1YnN1Yi9wb3J0cy9tZXNzYWdlQnJva2VyJztcbmltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSwgU2NvcGUgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBDcm9uLCBDcm9uRXhwcmVzc2lvbiB9IGZyb20gJ0BuZXN0anMvc2NoZWR1bGUnO1xuaW1wb3J0IHsgSW5qZWN0UmVwb3NpdG9yeSB9IGZyb20gJ0BuZXN0anMvdHlwZW9ybSc7XG5pbXBvcnQgeyBCbG9ja0luZm9ybWF0aW9uIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvYmxvY2tJbmZvcm1hdGlvbi5lbnRpdHknO1xuaW1wb3J0IHsgVHJhbnNhY3Rpb25JbmZvIH0gZnJvbSAnY29tbW9uL3RzLXR5cGVvcm0vc3JjL2FjY291bnQvdHJhbnNhY3Rpb25JbmZvLmVudGl0eSc7XG5pbXBvcnQgeyBUU19TVEFUVVMgfSBmcm9tICdjb21tb24vdHMtdHlwZW9ybS9zcmMvYWNjb3VudC90c1N0YXR1cy5lbnVtJztcbmltcG9ydCB7IE1vcmVUaGFuLCBSZXBvc2l0b3J5IH0gZnJvbSAndHlwZW9ybSc7XG5pbXBvcnQgeyBUc1R4VHlwZSB9IGZyb20gJ0B0cy1zZGsvZG9tYWluL2xpYi90cy10eXBlcy90cy10eXBlcyc7XG5pbXBvcnQgeyBRdWV1ZSB9IGZyb20gJ2J1bGxtcSc7XG5pbXBvcnQgeyBUc1dvcmtlck5hbWUgfSBmcm9tICcuLi8uLi90cy1zZGsvc3JjL2NvbnN0YW50JztcbmltcG9ydCB7IEJMT0NLX1NUQVRVUyB9IGZyb20gJ0Bjb21tb24vdHMtdHlwZW9ybS9hY2NvdW50L2Jsb2NrU3RhdHVzLmVudW0nO1xuXG5ASW5qZWN0YWJsZSh7XG4gIHNjb3BlOiBTY29wZS5ERUZBVUxULFxufSlcbmV4cG9ydCBjbGFzcyBQcm9kdWNlclNlcnZpY2Uge1xuICBwcml2YXRlIGN1cnJlbnRQZW5kaW5nVHhJZCA9IDA7XG4gIHByaXZhdGUgY3VycmVudFBlbmRpbmdCbG9jayA9IDA7XG4gIHByaXZhdGUgY3VycmVudFByb3ZlZEJsb2NrID0gMDtcbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgbG9nZ2VyOiBQaW5vTG9nZ2VyU2VydmljZSxcbiAgICBASW5qZWN0UmVwb3NpdG9yeShUcmFuc2FjdGlvbkluZm8pIHByaXZhdGUgdHhSZXBvc2l0b3J5OiBSZXBvc2l0b3J5PFRyYW5zYWN0aW9uSW5mbz4sXG4gICAgQEluamVjdFJlcG9zaXRvcnkoQmxvY2tJbmZvcm1hdGlvbikgcHJpdmF0ZSBibG9ja1JlcG9zaXRvcnk6IFJlcG9zaXRvcnk8QmxvY2tJbmZvcm1hdGlvbj4sXG4gICAgQEJ1bGxRdWV1ZUluamVjdChUc1dvcmtlck5hbWUuU0VRVUVOQ0VSKSBwcml2YXRlIHJlYWRvbmx5IHNlcVF1ZXVlOiBRdWV1ZSxcbiAgICBAQnVsbFF1ZXVlSW5qZWN0KFRzV29ya2VyTmFtZS5PUEVSQVRPUikgcHJpdmF0ZSByZWFkb25seSBvcGVyYXRvclF1ZXVlOiBRdWV1ZSxcbiAgICBAQnVsbFF1ZXVlSW5qZWN0KFRzV29ya2VyTmFtZS5QUk9WRVIpIHByaXZhdGUgcmVhZG9ubHkgcHJvdmVyUXVldWU6IFF1ZXVlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgbWVzc2FnZUJyb2tlclNlcnZpY2U6IE1lc3NhZ2VCcm9rZXIsXG4gICkge1xuICAgIGxvZ2dlci5sb2coJ0Rpc3BhdGNoU2VydmljZScpO1xuICAgIHRoaXMuc3Vic2NyaWJlKCk7XG4gIH1cblxuICBzdWJzY3JpYmUoKSB7XG4gICAgdGhpcy5tZXNzYWdlQnJva2VyU2VydmljZS5zdWJzY3JpYmUoQ0hBTk5FTC5PUkRFUl9DUkVBVEVELCB0aGlzLmRpc3BhdGNoUGVuZGluZ1RyYW5zYWN0aW9uLmJpbmQodGhpcykpO1xuICAgIHRoaXMubWVzc2FnZUJyb2tlclNlcnZpY2Uuc3Vic2NyaWJlKENIQU5ORUwuT1JERVJfUFJPQ0NFU1NELCB0aGlzLmRpc3BhdGNoUGVuaW5nQmxvY2suYmluZCh0aGlzKSk7XG4gICAgdGhpcy5tZXNzYWdlQnJva2VyU2VydmljZS5zdWJzY3JpYmUoQ0hBTk5FTC5PUkRFUl9WRVJJRklFRCwgdGhpcy5kaXNwYXRjaFByb3ZlZEJsb2NrLmJpbmQodGhpcykpO1xuICB9XG5cbiAgdW5zdWJzY3JpYmUoKSB7XG4gICAgdGhpcy5tZXNzYWdlQnJva2VyU2VydmljZS5jbG9zZSgpO1xuICB9XG5cblxuICBwcml2YXRlIHByZXZKb2JJZD86IHN0cmluZztcbiAgYXN5bmMgZGlzcGF0Y2hQZW5kaW5nVHJhbnNhY3Rpb24oKSB7XG4gICAgdGhpcy5sb2dnZXIubG9nKCdkaXNwYXRjaFBlbmRpbmdUcmFuc2FjdGlvbicpO1xuICAgIGNvbnN0IHRyYW5zYWN0aW9ucyA9IGF3YWl0IHRoaXMudHhSZXBvc2l0b3J5LmZpbmQoe1xuICAgICAgd2hlcmU6IHtcbiAgICAgICAgdHhJZDogTW9yZVRoYW4odGhpcy5jdXJyZW50UGVuZGluZ1R4SWQpLFxuICAgICAgICB0eFN0YXR1czogVFNfU1RBVFVTLlBFTkRJTkcsXG4gICAgICB9LFxuICAgICAgb3JkZXI6IHtcbiAgICAgICAgdHhJZDogJ2FzYycsXG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYodHJhbnNhY3Rpb25zLmxlbmd0aCkge1xuICAgICAgdGhpcy5sb2dnZXIubG9nKGBkaXNwYXRjaFBlbmRpbmdUcmFuc2FjdGlvbiBhZGQgJHt0cmFuc2FjdGlvbnMubGVuZ3RofSBibG9ja3NgKTtcbiAgICAgIHRoaXMuY3VycmVudFBlbmRpbmdUeElkID0gdHJhbnNhY3Rpb25zW3RyYW5zYWN0aW9ucy5sZW5ndGggLSAxXS50eElkO1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRyYW5zYWN0aW9ucy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgdHggPSB0cmFuc2FjdGlvbnNbaW5kZXhdO1xuICAgICAgICBjb25zdCBqb2JJZCA9IGAke1RzV29ya2VyTmFtZS5TRVFVRU5DRVJ9LSR7dHgudHhJZH1gO1xuICAgICAgICBjb25zb2xlLmxvZyh7XG4gICAgICAgICAgam9iSWQsXG4gICAgICAgICAgcHJldkpvYklkOiB0aGlzLnByZXZKb2JJZCxcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGNvbnN0IGpvYmEgPSBhd2FpdCB0aGlzLnNlcVF1ZXVlLmdldEpvYihqb2JJZCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3Qgam9iID0gYXdhaXQgdGhpcy5zZXFRdWV1ZS5hZGQodHgudHhJZC50b1N0cmluZygpLCB0eCwge1xuICAgICAgICAgICAgam9iSWQsXG4gICAgICAgICAgICAvLyBwYXJlbnQ6IHRoaXMucHJldkpvYklkID8ge1xuICAgICAgICAgICAgLy8gICBpZDogdGhpcy5wcmV2Sm9iSWQsXG4gICAgICAgICAgICAvLyAgIHF1ZXVlOiBUc1dvcmtlck5hbWUuU0VRVUVOQ0VSLFxuICAgICAgICAgICAgLy8gfSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLnByZXZKb2JJZCA9IHRoaXMuc2VxUXVldWUudG9LZXkoam9iLmlkPy50b1N0cmluZygpIHx8ICcnKTtcbiAgICAgICAgICB0aGlzLmxvZ2dlci5sb2coYEpPQjogJHtqb2IuaWR9YCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyBkaXNwYXRjaFBlbmluZ0Jsb2NrKCkge1xuICAgIHRoaXMubG9nZ2VyLmxvZygnZGlzcGF0Y2hQZW5pbmdCbG9jaycpO1xuICAgIGNvbnN0IGJsb2NrcyA9IGF3YWl0IHRoaXMuYmxvY2tSZXBvc2l0b3J5LmZpbmQoe1xuICAgICAgd2hlcmU6IHtcbiAgICAgICAgYmxvY2tOdW1iZXI6IE1vcmVUaGFuKHRoaXMuY3VycmVudFBlbmRpbmdCbG9jayksXG4gICAgICAgIGJsb2NrU3RhdHVzOiBCTE9DS19TVEFUVVMuUFJPQ0VTU0lORyxcbiAgICAgIH0sXG4gICAgICBvcmRlcjoge1xuICAgICAgICBibG9ja051bWJlcjogJ2FzYycsXG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYoYmxvY2tzLmxlbmd0aCkge1xuICAgICAgdGhpcy5sb2dnZXIubG9nKGBkaXNwYXRjaFBlbmluZ0Jsb2NrIGFkZCAke2Jsb2Nrcy5sZW5ndGh9IGJsb2Nrc2ApO1xuICAgICAgdGhpcy5jdXJyZW50UGVuZGluZ0Jsb2NrID0gYmxvY2tzW2Jsb2Nrcy5sZW5ndGggLSAxXS5ibG9ja051bWJlcjtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBibG9ja3MubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IGJsb2NrID0gYmxvY2tzW2luZGV4XTtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtYXJndW1lbnRcbiAgICAgICAgdGhpcy5wcm92ZXJRdWV1ZS5hZGQoYmxvY2suYmxvY2tOdW1iZXIudG9TdHJpbmcoKSwgYmxvY2spO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGRpc3BhdGNoUHJvdmVkQmxvY2soKSB7XG4gICAgdGhpcy5sb2dnZXIubG9nKCdkaXNwYXRjaFByb3ZlZEJsb2NrJyk7XG4gICAgY29uc3QgYmxvY2tzID0gYXdhaXQgdGhpcy5ibG9ja1JlcG9zaXRvcnkuZmluZCh7XG4gICAgICB3aGVyZToge1xuICAgICAgICBibG9ja051bWJlcjogTW9yZVRoYW4odGhpcy5jdXJyZW50UHJvdmVkQmxvY2spLFxuICAgICAgICBibG9ja1N0YXR1czogQkxPQ0tfU1RBVFVTLkwyQ09ORklSTUVELFxuICAgICAgfSxcbiAgICAgIG9yZGVyOiB7XG4gICAgICAgIGJsb2NrTnVtYmVyOiAnYXNjJyxcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZihibG9ja3MubGVuZ3RoKSB7XG4gICAgICB0aGlzLmxvZ2dlci5sb2coYGRpc3BhdGNoUHJvdmVkQmxvY2sgYWRkICR7YmxvY2tzLmxlbmd0aH0gYmxvY2tzYCk7XG4gICAgICB0aGlzLmN1cnJlbnRQcm92ZWRCbG9jayA9IGJsb2Nrc1tibG9ja3MubGVuZ3RoIC0gMV0uYmxvY2tOdW1iZXI7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYmxvY2tzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBibG9jayA9IGJsb2Nrc1tpbmRleF07XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWFyZ3VtZW50XG4gICAgICAgIHRoaXMub3BlcmF0b3JRdWV1ZS5hZGQoYmxvY2suYmxvY2tOdW1iZXIudG9TdHJpbmcoKSwgYmxvY2spO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBcbn1cbiIsImV4cG9ydCBlbnVtIENIQU5ORUwge1xuICBPUkRFUl9DUkVBVEVEID0gJ09SREVSX0NSRUFURUQnLFxuICBPUkRFUl9WRVJJRklFRCA9ICdPUkRFUl9WRVJJRklFRCcsXG4gIE9SREVSX1BST0NDRVNTRCA9ICdPUkRFUl9QUk9DQ0VTU0QnXG59XG5leHBvcnQgY29uc3QgQ0hBTk5FTFM6IENIQU5ORUxbXSA9IFtcbiAgQ0hBTk5FTC5PUkRFUl9DUkVBVEVELCBcbiAgQ0hBTk5FTC5PUkRFUl9WRVJJRklFRCwgXG4gIENIQU5ORUwuT1JERVJfUFJPQ0NFU1NEXG5dOyIsImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNZXNzYWdlQnJva2VyIHtcbiAgY29ubmVjdCE6ICgpID0+IFByb21pc2U8dm9pZD47XG4gIGFkZENoYW5uZWxzITogKGNoYW5uZWxOYW1lczpzdHJpbmdbXSkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgcmVtb3ZlQ2hhbm5lbCE6IChjaGFubmVsTmFtZTpzdHJpbmcpID0+IFByb21pc2U8dm9pZD47XG4gIHB1Ymxpc2ghOiAoY2hhbm5lbE5hbWU6IHN0cmluZywgZGF0YTogYW55KSA9PiBQcm9taXNlPHZvaWQ+O1xuICBzdWJzY3JpYmUhOiAoY2hhbm5lbE5hbWU6IHN0cmluZywgIGV2ZW50TGlzdGVuZXI6IChwYXlsb2FkOiBhbnkpPT52b2lkICkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgY2xvc2UhOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xufSAiLCJpbXBvcnQgeyBQaW5vTG9nZ2VyU2VydmljZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2FkYXB0ZXJzL3JlYWwvcGlub0xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IExvZ2dlck1vZHVsZSB9IGZyb20gJ0Bjb21tb24vbG9nZ2VyL2xvZ2dlci5tb2R1bGUnO1xuaW1wb3J0IHsgR2xvYmFsLCBNb2R1bGUgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBDb25maWdNb2R1bGUsIENvbmZpZ1NlcnZpY2UgfSBmcm9tICdAbmVzdGpzL2NvbmZpZyc7XG5pbXBvcnQgeyBNZXNzYWdlQnJva2VyU2VydmljZSB9IGZyb20gJy4vYWRhcHRlcnMvbWVzc2FnZUJyb2tlci5zZXJ2aWNlJztcbmltcG9ydCB7IE1lc3NhZ2VCcm9rZXIgfSBmcm9tICcuL3BvcnRzL21lc3NhZ2VCcm9rZXInO1xuXG5AR2xvYmFsKClcbkBNb2R1bGUoe1xuICBpbXBvcnRzOiBbQ29uZmlnTW9kdWxlLCBMb2dnZXJNb2R1bGVdLFxuICBwcm92aWRlcnM6IFtDb25maWdTZXJ2aWNlLCBQaW5vTG9nZ2VyU2VydmljZSwge1xuICAgIHByb3ZpZGU6IE1lc3NhZ2VCcm9rZXIsXG4gICAgdXNlQ2xhc3M6IE1lc3NhZ2VCcm9rZXJTZXJ2aWNlXG4gIH1dLFxuICBleHBvcnRzOiBbTWVzc2FnZUJyb2tlcl1cbn0pXG5leHBvcnQgY2xhc3MgRGF0YWJhc2VQdWJTdWJNb2R1bGUge30iLCJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgQ29uZmlnU2VydmljZSB9IGZyb20gJ0BuZXN0anMvY29uZmlnJztcbmltcG9ydCB7IE1lc3NhZ2VCcm9rZXIgfSBmcm9tICcuLi9wb3J0cy9tZXNzYWdlQnJva2VyJztcbmltcG9ydCB7IFBnUHViU3ViIH0gZnJvbSAnQGltcXVldWUvcGctcHVic3ViJztcbmltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgdGhyZWFkSWQgfSBmcm9tICd3b3JrZXJfdGhyZWFkcyc7XG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWVzc2FnZUJyb2tlclNlcnZpY2UgaW1wbGVtZW50cyBNZXNzYWdlQnJva2VyIHtcbiAgcHJpdmF0ZSBEQVRBQkFTRV9VUkw6IHN0cmluZztcbiAgcHJpdmF0ZSBwdWJTdWJJbnN0YW5jZTogUGdQdWJTdWI7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgY29uZmlnU2VydmljZTogQ29uZmlnU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlcjogUGlub0xvZ2dlclNlcnZpY2VcbiAgKSB7XG4gICAgdGhpcy5sb2dnZXIuc2V0Q29udGV4dChNZXNzYWdlQnJva2VyU2VydmljZS5uYW1lKTtcbiAgICB0aGlzLkRBVEFCQVNFX1VSTCA9IHRoaXMuY29uZmlnU2VydmljZS5nZXQ8c3RyaW5nPignREFUQUJBU0VfVVJMJywgJycpO1xuICAgIHRoaXMucHViU3ViSW5zdGFuY2UgPSBuZXcgUGdQdWJTdWIoe1xuICAgICAgY29ubmVjdGlvblN0cmluZzogdGhpcy5EQVRBQkFTRV9VUkwsXG4gICAgICBzaW5nbGVMaXN0ZW5lcjogZmFsc2VcbiAgICB9KTtcbiAgICB0aGlzLmNvbm5lY3QoKTtcbiAgfVxuICBhc3luYyBjb25uZWN0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMucHViU3ViSW5zdGFuY2UuY29ubmVjdCgpXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoZXJyKTtcbiAgICAgIH0pXG4gICAgO1xuICB9XG4gIGFzeW5jIGFkZENoYW5uZWxzKGNoYW5uZWxOYW1lczogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmxvZ2dlci5sb2coY2hhbm5lbE5hbWVzKTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChjaGFubmVsTmFtZXMubWFwKGNoYW5uZWxOYW1lID0+ICgpPT4gdGhpcy5wdWJTdWJJbnN0YW5jZS5saXN0ZW4oY2hhbm5lbE5hbWUpKSk7XG4gIH1cbiAgYXN5bmMgc3Vic2NyaWJlKGNoYW5uZWxOYW1lOiBzdHJpbmcsIGV2ZW50TGlzdGVuZXI6ICgocGF5bG9hZDogYW55KSA9PiB2b2lkKSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMubG9nZ2VyLmxvZyhgYWRkQ2hhbm5lbExpc3RlbmVyOiAke2NoYW5uZWxOYW1lfWApO1xuICAgIGNvbnNvbGUubG9nKCdzdWJzY3JpYmUnLCBjaGFubmVsTmFtZSk7XG4gICAgYXdhaXQgdGhpcy5wdWJTdWJJbnN0YW5jZS5jaGFubmVscy5vbihjaGFubmVsTmFtZSwgZXZlbnRMaXN0ZW5lcik7XG4gIH1cbiAgYXN5bmMgcmVtb3ZlQ2hhbm5lbChjaGFubmVsTmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5sb2dnZXIubG9nKGByZW1vdmVDaGFubmVsOiAke2NoYW5uZWxOYW1lfWApO1xuICAgIGF3YWl0IHRoaXMucHViU3ViSW5zdGFuY2UudW5saXN0ZW4oY2hhbm5lbE5hbWUpO1xuICB9XG4gIGFzeW5jIHB1Ymxpc2goY2hhbm5lbE5hbWU6IHN0cmluZywgZGF0YTogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc29sZS5sb2coe25hbWU6J3B1Ymxpc2gnLCBjaGFubmVsTmFtZSwgZGF0YX0pO1xuICAgIHRoaXMubG9nZ2VyLmxvZyh7bmFtZToncHVibGlzaCcsIGNoYW5uZWxOYW1lLCBkYXRhfSk7XG4gICAgYXdhaXQgdGhpcy5wdWJTdWJJbnN0YW5jZS5jaGFubmVscy5lbWl0KGNoYW5uZWxOYW1lLCBkYXRhKTtcbiAgfVxuICBhc3luYyBjbG9zZSgpOlByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMubG9nZ2VyLmxvZygnY2xvc2UnKTtcbiAgICBhd2FpdCB0aGlzLnB1YlN1Ykluc3RhbmNlLmNsb3NlKCk7XG4gIH1cbiAgXG59IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQGltcXVldWUvcGctcHVic3ViXCIpOzsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0ICogYXMgX2NsdXN0ZXIgZnJvbSAnY2x1c3Rlcic7XG5pbXBvcnQgdHlwZSB7IENsdXN0ZXIgfSBmcm9tICdjbHVzdGVyJztcbmNvbnN0IGNsdXN0ZXIgPSBfY2x1c3RlciBhcyB1bmtub3duIGFzIENsdXN0ZXI7XG4vLyBpbXBvcnQgeyBib290c3RyYXAgYXMgR2F0ZXdheUJvb3RzdHJhcCB9IGZyb20gJ0B0cy1yb2xsdXAtYXBpL21haW4nO1xuaW1wb3J0IHsgYm9vdHN0cmFwIGFzIE9wZXJhdG9yQm9vdHN0cmFwIH0gZnJvbSAnQHRzLW9wZXJhdG9yL21haW4nO1xuaW1wb3J0IHsgYm9vdHN0cmFwIGFzIFNlcXVlbmNlckJvb3RzdHJhcCB9IGZyb20gJ0B0cy1zZXF1ZW5jZXIvbWFpbic7XG5pbXBvcnQgeyBib290c3RyYXAgYXMgUHJvdmVyQm9vdHN0cmFwIH0gZnJvbSAnQHRzLXByb3Zlci9tYWluJztcbmltcG9ydCB7IFRzV29ya2VyTmFtZSwgV29ya2VySXRlbSB9IGZyb20gJ0B0cy1zZGsvY29uc3RhbnQnO1xuaW1wb3J0IHsgQXBwTW9kdWxlIH0gZnJvbSAnLi9hcHAubW9kdWxlJztcbmltcG9ydCB7IE5lc3RGYWN0b3J5IH0gZnJvbSAnQG5lc3Rqcy9jb3JlJztcbmltcG9ydCB7IFBpbm9Mb2dnZXJTZXJ2aWNlIH0gZnJvbSAnQGNvbW1vbi9sb2dnZXIvYWRhcHRlcnMvcmVhbC9waW5vTG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgZ2V0UHJvY2Vzc05hbWUsIGdldFdvcmtlck5hbWUgfSBmcm9tICdAdHMtc2RrL2hlbHBlcic7XG5pbXBvcnQgeyBNYWluUHJvY2Vzc1NlcnZpY2UgfSBmcm9tICdAY29tbW9uL2NsdXN0ZXIvbWFpbi1wcm9jZXNzLnNlcnZpY2UnO1xuXG5jbHVzdGVyaXplKFtcbiAgLy8ge1xuICAvLyAgIG5hbWU6IFRzV29ya2VyTmFtZS5HQVRFV0FZLFxuICAvLyAgIGJvb3RzdHJhcDogR2F0ZXdheUJvb3RzdHJhcCxcbiAgLy8gfSxcbiAgeyBcbiAgICBuYW1lOiBUc1dvcmtlck5hbWUuT1BFUkFUT1IsXG4gICAgYm9vdHN0cmFwOiBPcGVyYXRvckJvb3RzdHJhcCxcbiAgfSxcbiAgeyBcbiAgICBuYW1lOiBUc1dvcmtlck5hbWUuU0VRVUVOQ0VSLFxuICAgIGJvb3RzdHJhcDogU2VxdWVuY2VyQm9vdHN0cmFwLFxuICB9LFxuICB7IFxuICAgIG5hbWU6IFRzV29ya2VyTmFtZS5QUk9WRVIsXG4gICAgYm9vdHN0cmFwOiBQcm92ZXJCb290c3RyYXAsXG4gIH0sXG5dKTtcbmFzeW5jIGZ1bmN0aW9uIGNsdXN0ZXJpemUod29ya2VyczogV29ya2VySXRlbVtdKSB7XG4gIGlmKGNsdXN0ZXIuaXNQcmltYXJ5KXtcbiAgICBhd2FpdCBzZXR1cE1hc3RlckFwcChBcHBNb2R1bGUsIHdvcmtlcnMpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHdvcmtlck5hbWUgPSBnZXRXb3JrZXJOYW1lKCk7XG4gICAgY29uc3Qgd29ya2VyID0gd29ya2Vycy5maW5kKChpdGVtKSA9PiBpdGVtLm5hbWUgPT09IHdvcmtlck5hbWUpO1xuICAgIGlmKHdvcmtlcikge1xuICAgICAgYXdhaXQgd29ya2VyLmJvb3RzdHJhcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFdvcmtlciAke3dvcmtlck5hbWV9IG5vdCBmb3VuZGApO1xuICAgIH1cbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBzZXR1cE1hc3RlckFwcChtb2R1bGU6IHVua25vd24sIHdvcmtlcnM6IFdvcmtlckl0ZW1bXSkge1xuICBjb25zdCBhcHAgPSBhd2FpdCBOZXN0RmFjdG9yeS5jcmVhdGVBcHBsaWNhdGlvbkNvbnRleHQobW9kdWxlKTtcbiAgY29uc3QgbG9nZ2VyID0gYXBwLmdldChQaW5vTG9nZ2VyU2VydmljZSk7XG4gIGxvZ2dlci5zZXRDb250ZXh0KGdldFdvcmtlck5hbWUoKSk7XG4gIGNvbnN0IGNsdXN0ZXJTZXJ2aWNlID0gYXBwLmdldChNYWluUHJvY2Vzc1NlcnZpY2UpO1xuICBjbHVzdGVyU2VydmljZS5jbHVzdGVyaXplKHdvcmtlcnMpO1xuICBsb2dnZXIuc2V0Q29udGV4dChnZXRQcm9jZXNzTmFtZSgpKTtcblxuICBsb2dnZXIubG9nKGAke1RzV29ya2VyTmFtZS5DT1JFfTogc2VydmVyIHN0YXJ0ZWQhYCk7XG4gIHJldHVybiBhcHA7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9