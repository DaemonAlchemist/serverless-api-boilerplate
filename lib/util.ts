import { Guid } from "guid-typescript";
import { arg, pipe, prop } from "ts-functional";
import { IEvent, IPath, IQuery, Mapping } from "./api";

export const getBody = <T>(...args:any[]) => {
    console.log("getBody params:");
    console.log(args);
    return JSON.parse(arg<string>(1)(...args)) as T;
}
export const getBodyParam = <T>(name:string):((...args:any[]) => T) => (...args:any[]):T => prop<any, any>(name)(getBody(...args));
export const getPath = arg<IPath>(0);
export const getPathParam = (name:string):((...args:any[]) => string) => (...args:any[]):string => prop<any, any>(name)(getPath(...args));
export const getQuery = arg<IQuery>(1);
export const getEnv = arg<NodeJS.ProcessEnv>(2);
export const getEvent = <T>(...args:any[]) => arg<IEvent<T>>(3)(...args);

const iamStatements = () => [{
    Effect: "Allow",
    Action: "*",
    Resource: "*",
}]

export const makeHandler = (baseUrl:string, srcBase:string) => (method:string, frag:string, func:string):Mapping => [
    method, `${baseUrl}/${frag}`, `${srcBase}/handler.${func}`, iamStatements()
];

// TODO: Move this into ts-functional and figure out how to type and test it
export const pipeTo = <A extends any[], T>(f:(...args:A) => T, ...mappers:any) => (...args:any[]):T => {
    return f(...mappers.map((m:any) => m(...args)));
}

export const addNewId = <T extends {id: string}>(item:Omit<T, "id">):T => ({
    ...item,
    id: Guid.create().toString(),
}) as T;
