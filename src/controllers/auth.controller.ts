import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/User";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

/**
 * @desc    Create MongoDB user record after Firebase signup
 * @route   POST /api/users/create-user
 * @access  PUBLIC
 */

export const createUserInDb = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, name, contact } = req.body;

    if (!email || !name || !contact) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
    let user = await User.findOne({ email });

    if (user) {
      res.status(200).json({ message: "User already exists", user });
      return;
    }

    user = await User.create({
      email,
      name,
      contact,
    });
    res.status(201).json({
      message: "User created successfully",
      user,
    });
    return;
  } catch (err) {
    console.error("createUserInDb error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

//  * @route /api/users/get-token

export const getToken = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    return;
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found – please sign up first",
    });
    return;
  }

  const payload = { email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });

  res.status(200).json({
    success: true,
    message: "Token generated successfully",
    data: { token },
  });
};

export const getMyData = async (req: Request, res: Response): Promise<void> => {
  try {
    const me = req.user as IUser | undefined;
    if (!me) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }
    const fresh = await User.findById(me._id).select("-password -__v").lean();

    if (!fresh) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: fresh,
    });
  } catch (err: any) {
    console.error("Error in getMyData:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
