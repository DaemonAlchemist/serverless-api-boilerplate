import { DeleteFunction, GetFunction, IApiGatewayResponse, IEvent, PatchFunction, PostFunction, PutFunction } from './api.d';
import { catchErrors } from './errors';

const parseNestedQuery = (query:any) => Object.keys(query)
    .map((q:string):[string, string[]] => [q, q.replace(/\]/g, "").split("[")])
    .reduce((all:any, [key, q]:[string, string[]]) => {
        let curObj = all;
        const lastParam:string = q.pop() as string;
        q.forEach(p => {
            if(typeof curObj[p] === 'undefined') {curObj[p] = {};}
            curObj = curObj[p];
        });
        curObj[lastParam] = query[key].length > 1 ? query[key] : query[key][0];
        return all;
    }, {});

export const get = <T, R = T>(f:GetFunction<T, R>) => async (event:IEvent<null>):Promise<IApiGatewayResponse<string>> => {
  const query = event.multiValueQueryStringParameters;
  console.log("Path:");
  console.log(event.pathParameters);
  console.log("Query:");
  console.log(query);
  return catchErrors<R>(() => f(
    event.pathParameters,
    !!query ? parseNestedQuery(query) : null,
    process.env,
    event
  ));
};
  
export const post = <T, R = T>(f:PostFunction<T, R>) => async (event:IEvent<T>):Promise<IApiGatewayResponse<string>> => {
  console.log("Path:");
  console.log(event.pathParameters);
  console.log("Body:");
  console.log(event.body);
  return catchErrors<R>(() => f(
    event.pathParameters,
    event.body,
    process.env,
    event
  ));
};

export const put = <T, R = T>(f:PutFunction<T, R>) => async (event:IEvent<T>):Promise<IApiGatewayResponse<string>> => {
  console.log("Path:");
  console.log(event.pathParameters);
  console.log("Body:");
  console.log(event.body);
  return catchErrors<R>(() => f(
    event.pathParameters,
    event.body,
    process.env,
    event
  ));
};
  
export const patch = <T, R = T>(f:PatchFunction<T, R>) => async (event:IEvent<Partial<T>>):Promise<IApiGatewayResponse<string>> => {
  console.log("Path:");
  console.log(event.pathParameters);
  console.log("Body:");
  console.log(event.body);
  return catchErrors<R>(async () => f(
    event.pathParameters,
    event.body,
    process.env,
    event
  ));
};

export const del = (f:DeleteFunction) => async (event:IEvent<null>):Promise<IApiGatewayResponse<string>> => {
  console.log("Path:");
  console.log(event.pathParameters);
  return catchErrors<null>(() => f(
    event.pathParameters,
    undefined,
    process.env,
    event
  ));
};
