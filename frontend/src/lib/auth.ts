import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import client from "@/lib/db"

const clientPromise = client.connect()
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [GitHub, Credentials({
    credentials: {
      email: {},
      password: {},
    },
    authorize: async (credentials) => {
      let user = null

      // Logic to salt and hash password

      // logic to verify if the user exists
      await client.connect()
      const db = client.db("agrotech")
      const dbUser = await db.collection("users").findOne({
        email: credentials?.email,
      })
      console.log(dbUser)

      if (!dbUser) {
        throw new Error("No user found with the given email")
      }

      // Convert MongoDB document to User object with required properties
      user = {
        id: dbUser._id.toString(),
        email: dbUser.email,
        name: dbUser.name || null,
        image: dbUser.image || null,
      }

      return user
    }
  })],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
    newUser: "/signup",
  }
})
