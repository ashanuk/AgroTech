import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import client, { connectToDatabase } from "@/lib/db"
import bcrypt from "bcryptjs"
import User from "@/models/user"

// const clientPromise = client.connect()

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: MongoDBAdapter(client),
    session: { strategy: "jwt" },
    providers: [GitHub, Credentials({
        credentials: {
            email: {},
            password: {},
        },
        authorize: async (credentials) => {
            if (!credentials?.email || !credentials?.password) {
                    return null; // Invalid input
                }
            
            let user = null
            
            // logic to verify if the user exists
            await client.connect()
            const db = client.db("agrotech")
            const dbUser = await db.collection("users").findOne({
                email: credentials?.email,
            })
            // console.log(dbUser)
            
            if (!dbUser) {
                return null;
                // throw new Error("No user found with the given email")
            }
            
            // Logic to salt and hash password
            const isValidPassword = await bcrypt.compare(
                credentials?.password as string, dbUser.password as string
            );

            if (!isValidPassword) {
                return null;
                // throw new Error("Invalid password")
            }

            // Convert MongoDB document to User object with required properties
            user = {
                id: dbUser._id.toString(),
                email: dbUser.email,
                name: dbUser.name || null,
                image: dbUser.image || null,
            }
            // console.log(user)

            return user
        }
    })],
    callbacks: {
        // async signIn({ account, profile }) {
        //     if (account?.provider === "github") {
        //         await connectToDatabase();
        //         const exisitngUser = await User.find({ email: profile?.email });
        //         if (!exisitngUser) {
        //             await User.create({
        //                 name: profile?.name,
        //                 email: profile?.email,
        //             })
        //         }
        //     }
        //     return true;
        // },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name || null;
                token.image = user.image || null;
            }
            return token
        },

        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string | null;
                session.user.image = token.image as string | null;
            }
            return session
        }
    },
    pages: {
        signIn: "/login",
        error: "/login",
    }
})
