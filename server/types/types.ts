import { NextFunction, Request, Response } from "express"

export type API = (req: Request, res: Response, next?: NextFunction) => void
