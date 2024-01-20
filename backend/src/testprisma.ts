import { PrismaClient } from '@prisma/client'
import * as dotenv from "dotenv"
dotenv.config()

const prisma = new PrismaClient()
// use `prisma` in your application to read and write data in your DB

const main = async () => {
    // run inside `async` function
    const newUser = await prisma.user.create({
        data: {
            pseudo: "proutator",
            isInvite: true
        },
    })

    const users = await prisma.user.findMany()
    console.log(users)

}

main()