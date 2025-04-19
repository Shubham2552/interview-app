const fs = require('fs');
const path = require('path');

/**
 * Scans a directory for route files and mounts them on the provided Express app.
 * Each route file must export an object with `path`, `router`, and optionally `middleware` properties.
 *
 * @param {Object} app - The Express app instance.
 * @param {string} routesDir - The directory containing route files.
 */
const scanAndMountRoutes = (app, routesDir) => {
    fs.readdirSync(routesDir).forEach((file) => {
        const filePath = path.join(routesDir, file);
        if (fs.statSync(filePath).isFile() && file.endsWith('.js')) {
            const route = require(filePath);
            if (route.path && route.router) {
                if (Array.isArray(route.middleware) && route.middleware.length > 0) {
                    app.use(route.path, ...route.middleware, route.router);
                } else {
                    app.use(route.path, route.router);
                }
                console.log(`Mounted route: ${route.path}`);
            }
        }
    });
};

module.exports = scanAndMountRoutes;