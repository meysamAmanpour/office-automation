import jwt from "jsonwebtoken"

const SECRET = process.env.JWT_SECRET

export function generateToken(payload) {
  return jwt.sign(payload, SECRET, {
    expiresIn: "7d",
  })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET)
  } catch (error) {
    return null
  }
}
