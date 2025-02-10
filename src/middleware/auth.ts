import type { Request, Response, NextFunction } from "express"
import basicAuth from "basic-auth"

const users: { [key: string]: string } = {
  admin: "password123",
}

export const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const user = basicAuth(req)

  if (!user || !users[user.name] || users[user.name] !== user.pass) {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required")
    res.status(401).send("Authentication required")
    return
  }

  next()
}

