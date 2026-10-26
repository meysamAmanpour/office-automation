import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function verifyTokenEdge(token) {
  try {
    const { payload } = await jwtVerify(token, secret)

    return payload
  } catch (error) {
    return null
  }
}
