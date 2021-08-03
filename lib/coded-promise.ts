import { Func } from "ts-functional/dist/types";
import { withResponse } from "./withResponse";

export const CodedPromise = <T = undefined, E = string>(f:(
    resolve:Func<T, void>,
    reject:Func<E, void>,
    fail: Func<string, void>,
    error: Func<string, void>,
    notFound: Func<string, void>,
) => void):Promise<T> => new Promise((resolve, reject) => {
    const fail = (msg:string) => reject(withResponse(400, msg));
    const error = (msg:string) => reject(withResponse(500, msg));
    const notFound = (msg:string) => reject(withResponse(404, msg));
    f(resolve, reject, fail, error, notFound);
});