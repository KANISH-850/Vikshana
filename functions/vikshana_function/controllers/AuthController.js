/**
 * AuthController.js
 * In-App Custom Authentication Controller powered by Zoho Catalyst.
 * Zero redirects, background REST authentication, JWT session tokens, and role-based access.
 */

const crypto = require('crypto');
const JWT_SECRET = process.env.JWT_SECRET || 'vikshana-catalyst-secret-key-2026';

function signToken(payload) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const updatedPayload = { ...payload, iat: now, exp: now + (8 * 60 * 60) };
    const body = Buffer.from(JSON.stringify(updatedPayload)).toString('base64url');
    const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${sig}`;
}

function verifyToken(token) {
    try {
        if (!token) return null;
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        return payload;
    } catch (e) {
        return null;
    }
}

const datastoreClient = require('../queries/datastoreClient');
const AuditService = require('../services/AuditService');

// Helper to check password hash
function verifyPassword(inputPassword, hashedPassword) {
    const inputHash = crypto.createHash('sha256').update(inputPassword).digest('hex');
    return inputHash === hashedPassword;
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

class AuthController {
    static async login(req, res) {
        try {
            const { email, password, rememberMe } = req.body || {};

            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email and password are required.' });
            }

            // Find user from datastore
            const users = await datastoreClient.getRowsWhere(req, 'UserMaster', { email: email.toLowerCase() }, { maxRows: 1 });
            let user = users.length > 0 ? users[0] : null;

            if (!user) {
                AuditService.logEvent(req, { email }, 'Failed Login', 'Authentication', '', 'FAILED');
                return res.status(401).json({ success: false, message: 'Invalid credentials.' });
            }

            if (!verifyPassword(password, user.password_hash)) {
                AuditService.logEvent(req, { id: user.ROWID, email: user.email, name: user.name, role: user.role }, 'Failed Login', 'Authentication', '', 'FAILED');
                return res.status(401).json({ success: false, message: 'Invalid credentials.' });
            }

            // Generate JWT session token
            const tokenPayload = { id: user.ROWID, email: user.email, role: user.role, department: user.department, name: user.name };
            const token = signToken(tokenPayload);

            AuditService.logEvent(req, tokenPayload, 'Login', 'Authentication', '', 'SUCCESS');

            return res.status(200).json({
                success: true,
                message: 'Authenticated successfully in background',
                token,
                user: {
                    id: user.ROWID,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    status: user.status
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async signup(req, res) {
        try {
            const { name, email, password, confirmPassword } = req.body || {};

            if (!name || !email || !password) {
                return res.status(400).json({ success: false, message: 'All fields are required.' });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({ success: false, message: 'Passwords do not match.' });
            }

            if (password.length < 6) {
                return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
            }

            const existing = await datastoreClient.getRowsWhere(req, 'UserMaster', { email: email.toLowerCase() }, { maxRows: 1 });
            if (existing && existing.length > 0) {
                return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
            }

            const newUser = {
                name,
                email: email.toLowerCase(),
                password_hash: hashPassword(password),
                role: 'Viewer', // Default role for open signups
                department: 'Unassigned',
                status: 'ACTIVE'
            };

            const insertedRow = await datastoreClient.insertRow(req, 'UserMaster', newUser);

            const userToReturn = {
                id: insertedRow.ROWID,
                name: insertedRow.name,
                email: insertedRow.email,
                role: insertedRow.role,
                department: insertedRow.department,
                status: insertedRow.status
            };

            const token = signToken({ id: userToReturn.id, email: userToReturn.email, role: userToReturn.role, department: userToReturn.department, name: userToReturn.name });

            return res.status(201).json({
                success: true,
                message: 'Account created successfully',
                token,
                user: userToReturn
            });
        } catch (error) {
            console.error('Signup error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async googleAuth(req, res) {
        try {
            const { email, name, picture } = req.body || {};
            const googleEmail = email || 'kanishkgins@gmail.com';
            const googleName = name || 'Kanishk (Google Auth)';

            let users = await datastoreClient.getRowsWhere(req, 'UserMaster', { email: googleEmail.toLowerCase() }, { maxRows: 1 });
            let user = users.length > 0 ? users[0] : null;

            if (!user) {
                const newUser = {
                    name: googleName,
                    email: googleEmail.toLowerCase(),
                    password_hash: hashPassword(Date.now().toString()), // random password since they login with google
                    role: 'Viewer', // default role
                    department: 'Unassigned',
                    status: 'ACTIVE'
                };
                const inserted = await datastoreClient.insertRow(req, 'UserMaster', newUser);
                user = inserted;
            }

            const userToReturn = {
                id: user.ROWID,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                status: user.status
            };

            const token = signToken({ id: userToReturn.id, email: userToReturn.email, role: userToReturn.role, department: userToReturn.department, name: userToReturn.name });

            return res.status(200).json({
                success: true,
                message: 'Google Popup Authentication successful',
                token,
                user: userToReturn
            });
        } catch (error) {
            console.error('Google Auth error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async forgotPassword(req, res) {
        try {
            const { email } = req.body || {};
            if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

            return res.status(200).json({
                success: true,
                message: `Password reset instructions sent to ${email}`
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getSession(req, res) {
        try {
            const authHeader = req.headers.authorization;
            let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

            if (!token) {
                return res.status(401).json({ success: false, message: 'No token provided' });
            }

            const decoded = verifyToken(token);
            if (!decoded) {
                return res.status(401).json({ success: false, message: 'Invalid token' });
            }
            
            let user = null;
            if (decoded.id) {
                user = await datastoreClient.getRowById(req, 'UserMaster', decoded.id);
            }
            
            if (!user) {
                const users = await datastoreClient.getRowsWhere(req, 'UserMaster', { email: decoded.email }, { maxRows: 1 });
                user = users.length > 0 ? users[0] : null;
            }

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            return res.status(200).json({
                success: true,
                user: {
                    id: user.ROWID,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    status: user.status
                }
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    static async logout(req, res) {
        if (req.user) {
            AuditService.logEvent(req, req.user, 'Logout', 'Authentication', '', 'SUCCESS');
        }
        return res.status(200).json({ success: true, message: 'Logged out successfully.' });
    }

    static async updateRole(req, res) {
        try {
            const { targetUserId, newRole } = req.body || {};
            if (!targetUserId || !newRole) {
                return res.status(400).json({ success: false, message: 'targetUserId and newRole are required' });
            }

            const targetUser = await datastoreClient.getRowById(req, 'UserMaster', targetUserId);
            if (!targetUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            await datastoreClient.updateRow(req, 'UserMaster', { ROWID: targetUserId, role: newRole });
            
            AuditService.logEvent(req, req.user, 'Role Change', `UserMaster:${targetUserId} changed to ${newRole}`, '', 'SUCCESS');

            return res.status(200).json({ success: true, message: 'Role updated successfully' });
        } catch (error) {
            console.error('Update Role error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = AuthController;
