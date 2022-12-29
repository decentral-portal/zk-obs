type PluginType = {
    name: string;
    srcPath: string;
}

const plugins: PluginType[] = [
  {
    name: '@common/logger',
    srcPath: 'common/logger/src'
  }, {
    name: '@common/domain-event-publisher',
    srcPath: 'common/domain-event-publisher/src'
  }, {
    name: '@common/utils',
    srcPath: 'common/utils'
  }, {
    name: '@ts-rollup-api',
    srcPath: 'ts-rollup-api/src',
  }
];

function syncConfigs() {

}


function syncJestConfigs() {
  const root = plugins[0];
    
}