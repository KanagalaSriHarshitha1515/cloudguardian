import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// Register
export const register = asyncHandler(async (req, res) => {

    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    });

});

// Login
export const login = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
        throw new ApiError(401, "Invalid Credentials");
    }

    const token = generateToken(user);

    res.status(200).json({
        success: true,
        message: "Login Successful",
        token,
    });

});