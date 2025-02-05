import { Request } from "express";
import session from "express-session";

export interface GuestAuthRequest extends Request {
  session: session.Session &
    Partial<session.SessionData> & { guestId?: string };
}
