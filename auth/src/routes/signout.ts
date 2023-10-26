import { Request, Response, Router } from "express";

const router = Router();

router.post("/api/users/signout", (req: Request, res: Response) => {
  res.send("Hi there!");
});

export { router as signoutRouter };
