const routes = require('./routes');
function setup({ server, app }) {
    routes({ server, app });
}
module.exports= setup;