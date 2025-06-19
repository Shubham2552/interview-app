const classBlueprints = require('./classBlueprintRegistry');
const methodRegistry = require('./methodRegistry');
const instanceConfigs = require('./instanceConfigs');
const buildDynamicClass = require('./SupersetClassBuilder');

const ClassInstanceInitializer = async (className, configKey) => {
    const classJson = classBlueprints[className];
    const methods = methodRegistry[className];
    if (!classJson || !methods) throw new Error(`Blueprint or methods missing for class ${className}`);
    const configObj = instanceConfigs.find(
        c => c._ClassName === className && c._ConfigKey === configKey
    );
    if (!configObj) throw new Error(`Config not found for class ${className} and key ${configKey}`);
    const DynamicClass = buildDynamicClass(classJson, methods);
    return new DynamicClass(configObj);
}

module.exports = ClassInstanceInitializer;