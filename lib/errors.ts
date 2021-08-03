import { IApiGatewayResponse, Error, IMessage, IMsg } from "./api.d";
import { corsHeaders } from "./config";

export const isError = (obj:any): obj is Error =>
  typeof obj.statusCode === "number" &&
  (typeof obj.message === "string" || typeof obj.msg === "string");

export const getErrorMessage = (obj:Error):string => (obj as IMessage).message || (obj as IMsg).msg;

export const error = (statusCode:number, msg:string):Error => ({statusCode, msg});

// More fully type this
export const catchErrors = async <T>(f:() => Promise<T>):Promise<IApiGatewayResponse<string>> => new Promise<IApiGatewayResponse<string>>((resolve, reject) => {
    f()
        .then((response:T) => resolve({
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(response),
        }))
        .catch(e => {
            const err:Error = isError(e) ? e : {
              message: `Something bad happened. I don't know what else to tell you. :( -- ${JSON.stringify(e)}`,
              statusCode: 500,
            };
            
            resolve({
                statusCode: err.statusCode,
                headers: corsHeaders,
                body: JSON.stringify(process.env.ENV === "local"
                  ? {message: getErrorMessage(e), details: e, env: process.env}
                  : {message: getErrorMessage(e)}
                ),
            });
        });
});
