import bcrypt from "bcryptjs";
import User from "../models/User.js";

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