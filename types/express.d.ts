// import { JwtPayload } from 'jsonwebtoken';

// declare module 'express' {
//   interface Request {
//     user?: JwtPayload;
//   }
// }

import { Request } from "express"
export interface RequestCustom extends Request {
  user?: JwtPayload // or any other type
}