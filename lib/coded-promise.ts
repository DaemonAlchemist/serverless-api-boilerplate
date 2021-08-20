import { Func } from "ts-functional/dist/types";
import { withResponse } from "./withResponse";

export const CodedPromise = <T = undefined, E = string>(f:(
    resolve:Func<T, void>,
    reject:Func<E, void>,
    invalidRequest: Func<string, void>,
    internalError: Func<string, void>,
    notFound: Func<string, void>,
) => void):Promise<T> => new Promise((resolve, reject) => {
    const invalidRequest = (msg:string) => reject(withResponse(400, msg));
    const internalError = (msg:string) => reject(withResponse(500, msg));
    const notFound = (msg:string) => reject(withResponse(404, msg));
    f(resolve, reject, invalidRequest, internalError, notFound);
});