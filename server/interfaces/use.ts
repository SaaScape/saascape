import { NextFunction } from "express"

export type Use = (
  fn: (req: Request, res: Response, next: NextFunction) => any
) => (req: Request, res: Response, next: NextFunction) => any
