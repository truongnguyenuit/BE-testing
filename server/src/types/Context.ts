import { Request, Response } from "express";
import { Session, SessionData } from "express-session";

export type Context = {
  req: Request & {
    session: Session &
      Partial<SessionData> & { userId?: number } & { sessionID?: string };
  };
  res: Response; 
};
