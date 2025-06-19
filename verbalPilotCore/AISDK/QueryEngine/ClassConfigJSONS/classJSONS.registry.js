// engines/ClassConfigRegistry.js

const fs = require('fs');
const path = require('path');

class ClassConfigRegistry {
    constructor(folderPath) {
        this.folderPath = folderPath;
        this.classConfigs = {};
        this._loadAllConfigs();
    }

    _loadAllConfigs() {
        const files = fs.readdirSync(this.folderPath);
        files.forEach(file => {
            if (file.endsWith('.json')) {
                const filePath = path.join(this.folderPath, file);
                const configJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                // Assume config JSON has a _ClassName field to associate config with class
                if (configJson._ClassName) {
                    this.classConfigs[configJson._ClassName] = configJson;
                }
            }
        });
    }

    /**
     * Get config for a single class name.
     * @param {string} className
     * @returns {Object|null}
     */
    get(className) {
        return this.classConfigs[className] || null;
    }

    /**
     * Get configs for multiple class names.
     * @param {string[]} classNames
     * @returns {Object} Mapping of className -> config
     */
    getMany(classNames) {
        const result = {};
        classNames.forEach(name => {
            if (this.classConfigs[name]) {
                result[name] = this.classConfigs[name];
            }
        });
        return result;
    }

    /**
     * Get all registered class configs.
     * @returns {Object}
     */
    getAll() {
        return { ...this.classConfigs };
    }
}

module.exports = ClassConfigRegistry;