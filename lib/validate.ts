import { tuple } from "ts-functional";
import { Tuple } from "ts-functional/dist/types";
import { Handler, IApiGatewayResponse, IEvent, Validator } from "./api";
import { CodedPromise } from "./coded-promise";

export const validate = <T>(...validators:Validator<T>[]) =>
    (handler:Handler<T>):Handler<T> =>
        (event:IEvent<T>):Promise<IApiGatewayResponse<string>> =>
            CodedPromise<IApiGatewayResponse<string>, string>((resolve, reject, fail, error, notFound) => {
                Promise.all(validators.map(val =>
                    val(event).then((results:Tuple<boolean, string | undefined>) => {
                        if(!tuple.first(results)) {
                            fail(tuple.second(results) || "Validation failed");
                        }
                    }).catch((err) => {
                        error(err);
                    })
                )).then(() => {
                    handler(event).then(resolve).catch(reject);
                });
            });
