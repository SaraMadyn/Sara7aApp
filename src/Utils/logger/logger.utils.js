import fs from "node:fs";
import path from "node:path";
import morgan from "morgan";

const __diename = path.resolve();
export function attachRouterWithLogger(app, routerPath, router, logFileName){
    const logStream = fs.createWriteStream(path.join(__diename, "./src/logs", logFileName), { flags: 'a' });
    app.use(routerPath, morgan('combined', { stream: logStream }), router);
    app.use(routerPath, morgan("dev"), router);
}