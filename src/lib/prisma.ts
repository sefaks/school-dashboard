import { PrismaClient } from "@prisma/client";
import { Return } from "@prisma/client/runtime/library";


// normaly with this command we create a new instance of PrismaClient and that is not for development, to provent that we will use the following code;
// If already exists, use it, otherwise create a new one.


const prismaClientSingleton = () => { // This code's purpose is to prevent the creation of multiple instances of PrismaClient in development mode.
    return new PrismaClient();
    }

declare const globalThis: {

    prismaGlobal:ReturnType<typeof prismaClientSingleton>; // we store the instance of PrismaClient in the global object for not creating multiple instances of PrismaClient in development mode.

} & typeof global;

const prisma= globalThis.prismaGlobal ?? prismaClientSingleton(); // if the instance of PrismaClient is already created, we will use it, otherwise we will create a new one.

export default prisma

if (process.env.NODE_ENV !== "production") { // if the environment is not production, we will use the following code.
    globalThis.prismaGlobal = prisma
}

