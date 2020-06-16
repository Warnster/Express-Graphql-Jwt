import {User} from "./entity/User";
import {sign} from "jsonwebtoken";

//Creates and access token
export const createAccessToken = (user: User) => {
    return sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!,
        {
            expiresIn: '15m'
        })
}

//creates a refresh token
export const createRefreshToken = (user: User) => {
    return sign({userId: user.id}, process.env.REFRESH_TOKEN_SECRET!, {
        expiresIn: "7d"
    })
}
