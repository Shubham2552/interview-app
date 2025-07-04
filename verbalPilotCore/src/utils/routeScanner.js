const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const authMiddleware = require('./authMiddleware');

/**
 * Scans a directory for route folders and mounts their index.js on the provided Express app.
 * Each route folder must have an index.js exporting { path, handler, method, middleware?, auth? }.
 *
 * @param {Object} app - The Express app instance.
 * @param {string} routesDir - The directory containing route folders.
 */
const scanAndMountRoutes = (app, routesDir) => {
    const scanDirectory = (dir, accumulatedPath = '') => {
        fs.readdirSync(dir).forEach((entry) => {
            const entryPath = path.join(dir, entry);
            if (fs.statSync(entryPath).isDirectory()) {
                const indexFile = path.join(entryPath, 'index.js');
                if (fs.existsSync(indexFile)) {
                    const routePath = accumulatedPath.replace(/\\/g, '/');
                    const route = require(indexFile);

                    if (route.path && route.handler && route.method) {
                        const fullRoutePath = path.join('/', routePath, route.path).replace(/\\/g, '/');
                        const method = route.method.toLowerCase();
                        const context = {
                            method: route.method,
                            path: fullRoutePath,
                            file: indexFile
                        };

                        if (!['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
                            logger.error('Unsupported HTTP method', {
                                ...context,
                                error: 'Invalid HTTP method'
                            });
                            return;
                        }

                        // Compose middleware array
                        let middlewares = [];
                        if (route.auth === true) {
                            middlewares.push(authMiddleware);
                        }
                        if (Array.isArray(route.middleware) && route.middleware.length > 0) {
                            middlewares = middlewares.concat(route.middleware);
                        }

                        if (typeof app[method] === 'function') {
                            if (middlewares.length > 0) {
                                app[method](fullRoutePath, ...middlewares, route.handler);
                            } else {
                                app[method](fullRoutePath, route.handler);
                            }
                            logger.info('Route mounted successfully', {
                                ...context,
                                hasMiddleware: middlewares.length > 0
                            });
                        } else {
                            logger.error('Invalid route method', {
                                ...context,
                                error: 'Method not supported by Express'
                            });
                        }
                    }
                }
                scanDirectory(entryPath, path.join(accumulatedPath, entry));
            }
        });
    };

    scanDirectory(routesDir);
};

module.exports = scanAndMountRoutes;