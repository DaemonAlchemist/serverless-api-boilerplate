import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { UrlMapper } from './api';
import { format } from './simple-json-formatter';

config();

const expName = (handler:string) => handler.replace(/[\.\/]/g, "");

export const updateMappings = (mappings:UrlMapper) => {
    const newConfig = format(JSON.stringify({
        ...JSON.parse(readFileSync("serverless.json").toString()),
        functions: mappings("", ".")
            .map(([action, url, handler, iamRoleStatements]) => ({
                [`${action}${expName(handler).replace("handler", "").substr(3)}`]: {
                    handler: `index.${expName(handler)}`,
                    events: [
                        {http: {
                            path: url,
                            method: action,
                            cors: true,
                        }}
                    ],
                    iamRoleStatements,
                }
            }))
    }), "  ");
    if(newConfig) {
        writeFileSync("serverless.json", newConfig);
    } else {
        console.error("There was an error creating the new serverless config file");
    }

    writeFileSync("index.ts", mappings("", ".").map(([action, url, handler]) => {
        const imp = handler.split(".").pop();
        const impFile = handler.split(".").slice(0, -1).join(".");
        const exp = expName(handler);
        return `export {${imp} as ${exp}} from "${impFile}";`;
    }).join("\n"));
}