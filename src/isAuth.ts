import {MiddlewareFn} from "type-graphql"
import {MyContext} from "./MyContext";
import {verify} from "jsonwebtoken";
//Middleware for authentication
export const isAuth: MiddlewareFn<MyContext> = ({context}, next) => {
    const authorisation = context.req.header('authorization');
    if(!authorisation) {
        throw new Error("not authenticated")
    }
    try {
        const token = authorisation.split(' ')[1]
        const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!)
        context.payload = payload as any;
    }catch(err) {
        console.log(err)
        throw new Error("not authenticated")
    }
        return next();
}
