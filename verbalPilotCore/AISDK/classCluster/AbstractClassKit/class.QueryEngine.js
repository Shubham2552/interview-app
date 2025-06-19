class QueryEngineCore {

    constructor() {
        this.parameters = [];
    }

    // Example method
    exampleMethod(param1, param2) {
        return `Params: ${param1}, ${param2}`;
    }

    // Generic invoke method
    invoke(methodName, ...args) {
        if (typeof this[methodName] === 'function') {
            return this[methodName](...args);
        } else {
            throw new Error(`Method ${methodName} does not exist`);
        }
    }
}

