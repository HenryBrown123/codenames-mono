import express, { Response } from "express";
import { GuestAuthRequest } from "./auth-types";

const router = express.Router();

/**
 * @swagger
 * /auth/guest:
 *   post:
 *     summary: Creates a guest session and returns a guest ID.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Guest session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 guestId:
 *                   type: string
 *       500:
 *         description: Internal server error
 */

router.post("/guest", (req: GuestAuthRequest, res: Response) => {
  res.status(200).json({ success: true });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logs out the current guest session.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Guest session logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       500:
 *         description: Internal server error
 */

router.post("/logout", (req: GuestAuthRequest, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, error: "Failed to log out" });
    }
    res.status(200).json({ success: true });
  });
});

export { router as authRouter };
