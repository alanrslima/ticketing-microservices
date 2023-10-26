import { Request, Response, Router } from "express";

const router = Router();

router.get("/api/users/currentuser", (req: Request, res: Response) => {
  res.send("Hi there!");
});

export { router as currentUserRouter };
