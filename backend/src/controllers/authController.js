import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";


export async function registerUser(req, res) {
    try {
        const { name, email, password, role = "buyer" } = req.body || {};

        // Check input types before using string methods.
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Name, email and password must be text.",
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (cleanName.length < 2 || cleanName.length > 80) {
            return res.status(400).json({
                message: "Name must contain 2 to 80 characters.",
            });
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (cleanEmail.length > 254 || !emailPattern.test(cleanEmail)) {
            return res.status(400).json({
                message: "Please provide a valid email address.",
            });
        }

        if (password.length < 15 || bcrypt.truncates(password)) {
            return res.status(400).json({
                message: "Password must contain at least 15 characters and at most 72 bytes.",
            });
        }

        // Public registration must never create an admin.
        if (role !== "buyer" && role !== "seller") {
            return res.status(400).json({
                message: "Role must be buyer or seller.",
            });
        }

        // Wait until the model's indexes, including unique email, are ready.
        await User.init();

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: cleanName,
            email: cleanEmail,
            passwordHash,
            role,
        });

        return res.status(201).json({
            message: "Account created successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "An account with this email already exists.",
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Please check your registration details.",
            });
        }

        console.error("Registration failed:", error.name);

        return res.status(500).json({
            message: "Unable to create account. Please try again later.",
        });
    }
}

export async function loginUser(req, res) {
    try {
        const { email, password } = req.body || {};

        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Email and password must be text.",
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        if (
            !cleanEmail ||
            cleanEmail.length > 254 ||
            !password ||
            bcrypt.truncates(password)
        ) {
            return res.status(400).json({
                message: "Please provide valid login details.",
            });
        }

        const secret = process.env.JWT_SECRET;

        if (!secret || secret.length < 64) {
            console.error("JWT_SECRET is missing or too short.");

            return res.status(500).json({
                message: "Login is temporarily unavailable.",
            });
        }

        const user = await User.findOne({
            email: cleanEmail,
        }).select("+passwordHash");

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        const token = jwt.sign(
            { userId: user._id.toString() },
            secret,
            {
                algorithm: "HS256",
                expiresIn: "360m",
            }
        );

        res.set("Cache-Control", "no-store");

        return res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login failed:", error.name);

        return res.status(500).json({
            message: "Unable to log in. Please try again later.",
        });
    }
}

export function getMe(req, res) {
    res.set("Cache-Control", "no-store");

    return res.status(200).json({
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
        },
    });
}