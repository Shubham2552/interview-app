const fs = require('fs');
const path = require('path');

/**
 * Scans a directory for route files and mounts them on the provided Express app.
 * Each route file must export an object with `path`, `handler`, `method`, and optionally `middleware` properties.
 *
 * @param {Object} app - The Express app instance.
 * @param {string} routesDir - The directory containing route files.
 */
const scanAndMountRoutes = (app, routesDir) => {
    const scanDirectory = (dir, accumulatedPath = '') => {
        fs.readdirSync(dir).forEach((entry) => {
            const entryPath = path.join(dir, entry);
            const entryRoutePath = accumulatedPath.replace(/\\/g, '/'); // Exclude file name from the path

            if (fs.statSync(entryPath).isDirectory()) {
                // Recursively scan subdirectories, appending folder names to the path
                scanDirectory(entryPath, path.join(entryRoutePath, entry));
            } else if (fs.statSync(entryPath).isFile() && entry.endsWith('.js')) {
                const route = require(entryPath);

                if (route.path && route.handler && route.method) {
                    const fullRoutePath = path.join('/', entryRoutePath, route.path).replace(/\\/g, '/');
                    const method = route.method.toLowerCase();

                    if (!['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
                        console.error(`Unsupported HTTP method "${route.method}" in file: ${entryPath}`);
                        return;
                    }

                    if (typeof app[method] === 'function') {
                        if (Array.isArray(route.middleware) && route.middleware.length > 0) {
                            app[method](fullRoutePath, ...route.middleware, route.handler);
                        } else {
                            app[method](fullRoutePath, route.handler);
                        }
                        console.log(`Mounted route: [${route.method.toUpperCase()}] ${fullRoutePath}`);
                    } else {
                        console.error(`Invalid method "${route.method}" for route: ${fullRoutePath}`);
                    }
                }
            }
        });
    };

    scanDirectory(routesDir);
};

module.exports = scanAndMountRoutes;
