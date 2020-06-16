import {Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver, UseMiddleware} from "type-graphql";
import {User} from "./entity/User";
import {compare, hash} from "bcryptjs"
import {MyContext} from "./MyContext";
import {createAccessToken, createRefreshToken} from "./auth";
import {isAuth} from "./isAuth";
import {sendRefreshToken} from "./sendRefreshToken";

@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string
}

@Resolver()
export class UserResolver {
    @Query(() => String)
    hello() {
        return "hi"
    }

    @Query(() => String)
    @UseMiddleware(isAuth)
    bye(
        @Ctx() {payload}: MyContext
    ) {
        return "your user id is: " + payload!.userId
    }

    /**
     * Returns all users
     */
    @Query(() => [User])
    users()
    {
        return User.find();
    }

    @Mutation(() => Boolean)
    async register(
        @Arg('email', () => String) email: string,
        @Arg('password', () => String) password: string,
    ) {

        const hashedPassword = await hash(password, 12)
        try {
            await User.insert({
                email,
                password: hashedPassword
            });
        } catch (err) {
            console.log(err);
            return false;
        }
        return true;
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg('email', () => String) email: string,
        @Arg('password', () => String) password: string,
        @Ctx() ctx: MyContext
    ): Promise<LoginResponse> {
        //Searches for user with the email
        const user = await User.findOne({where: {email}});
        if(!user) {
            throw new Error('invalid login');
        }

        const valid = await compare(password, user.password);
        if(!valid) {
            throw new Error("Incorrect Password");
        }

        //Successful login
        //Create refresh login
        sendRefreshToken(ctx.res, createAccessToken(user));
        return {
            accessToken: createAccessToken(user)
        };
    }

}
