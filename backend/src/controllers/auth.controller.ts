import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';
import { generateReportNumber } from '../utils/helpers.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Verify IC Number (Public - no auth required)
export const verifyIC = async (req: Request, res: Response): Promise<void> => {
    try {
        const { ic_number } = req.body;

        if (!ic_number || ic_number.length !== 12) {
            res.status(400).json({ error: 'No IC mestilah 12 digit' });
            return;
        }

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, full_name, ic_number, contact_no, address, state')
            .eq('ic_number', ic_number)
            .single();

        if (error || !user) {
            res.status(404).json({
                registered: false,
                error: 'Maaf, maklumat anda belum didaftar. Sila daftar dahulu.'
            });
            return;
        }

        // Generate a temporary token for this user to submit complaint
        const token = jwt.sign(
            { id: user.id, role: 'user', ic_number: user.ic_number },
            JWT_SECRET,
            { expiresIn: '1h' } as SignOptions // Short-lived token for public complaint
        );

        res.json({
            registered: true,
            user: {
                id: user.id,
                full_name: user.full_name,
                ic_number: user.ic_number,
                contact_no: user.contact_no,
                address: user.address,
                state: user.state,
            },
            token,
        });
    } catch (error) {
        console.error('Verify IC error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// User Registration
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { full_name, ic_number, email, contact_no, contact_no_2, address, state, password } = req.body;

        // Check if IC number already exists
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('ic_number', ic_number)
            .single();

        if (existingUser) {
            res.status(400).json({ error: 'IC number already registered' });
            return;
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create user
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .insert({
                full_name,
                ic_number,
                email: email || null,
                contact_no,
                contact_no_2: contact_no_2 || null,
                address,
                state: state || null,
                password_hash,
            })
            .select()
            .single();

        if (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Failed to register user' });
            return;
        }

        // Notify Admins
        try {
            // Get all admins
            const { data: admins } = await supabaseAdmin
                .from('admins')
                .select('id');

            if (admins && admins.length > 0) {
                const notifications = admins.map(admin => ({
                    recipient_id: admin.id,
                    recipient_role: 'admin',
                    title: 'New User Registration',
                    message: `A new user has successfully registered.\nName: ${user.full_name} | IC Number: ${user.ic_number}\nClick here to view details.| uid:${user.id}`,
                    type: 'system', // Using 'system' as generic type
                    is_read: false,
                    created_at: new Date().toISOString()
                }));

                await supabaseAdmin
                    .from('notifications')
                    .insert(notifications);
            }
        } catch (notifyError) {
            console.error('Failed to notify admins:', notifyError);
            // Don't fail registration if notification fails
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: 'user', ic_number: user.ic_number },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN } as SignOptions
        );

        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: user.id,
                full_name: user.full_name,
                ic_number: user.ic_number,
                email: user.email,
            },
            token,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// User/Admin/Technician Login
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { ic_number, username, password, role } = req.body;
        const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

        let user: any = null;
        let tokenPayload: any = null;

        if (role === 'user') {
            if (!ic_number) {
                res.status(400).json({ error: 'IC number is required' });
                return;
            }

            const { data, error } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('ic_number', ic_number)
                .single();

            if (error || !data) {
                // Log failed attempt
                await supabaseAdmin.from('user_logs').insert({
                    username: ic_number,
                    user_ip: clientIp,
                    success: false,
                });
                res.status(401).json({ error: 'Invalid IC number or password' });
                return;
            }

            if (data.status !== 'Active') {
                res.status(403).json({ error: 'Account is not active. Please contact administrator.' });
                return;
            }

            user = data;
            tokenPayload = { id: user.id, role: 'user', ic_number: user.ic_number };
        } else if (role === 'admin') {
            if (!username) {
                res.status(400).json({ error: 'Username is required' });
                return;
            }

            const { data, error } = await supabaseAdmin
                .from('admins')
                .select('*')
                .eq('username', username)
                .single();

            if (error || !data) {
                res.status(401).json({ error: 'Invalid username or password' });
                return;
            }

            user = data;
            tokenPayload = { id: user.id, role: 'admin', username: user.username };
        } else if (role === 'technician') {
            if (!username) {
                res.status(400).json({ error: 'Username is required' });
                return;
            }

            const { data, error } = await supabaseAdmin
                .from('technicians')
                .select('*')
                .eq('username', username)
                .single();

            if (error || !data) {
                res.status(401).json({ error: 'Invalid username or password' });
                return;
            }

            if (!data.is_active) {
                res.status(403).json({ error: 'Account is not active' });
                return;
            }

            user = data;
            tokenPayload = { id: user.id, role: 'technician', username: user.username };
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            if (role === 'user') {
                await supabaseAdmin.from('user_logs').insert({
                    user_id: user.id,
                    username: ic_number || username,
                    user_ip: clientIp,
                    success: false,
                });
            }
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Log successful login for users
        if (role === 'user') {
            await supabaseAdmin.from('user_logs').insert({
                user_id: user.id,
                username: ic_number,
                user_ip: clientIp,
                success: true,
            });
        }

        // Generate token
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);

        // Remove password from response
        const { password_hash, ...userWithoutPassword } = user;

        res.json({
            message: 'Login successful',
            user: userWithoutPassword,
            token,
            role,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Forgot Password - Send OTP
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { ic_number, email } = req.body;

        let user: any = null;

        if (ic_number) {
            const { data } = await supabaseAdmin
                .from('users')
                .select('id, email, full_name')
                .eq('ic_number', ic_number)
                .single();
            user = data;
        } else if (email) {
            const { data } = await supabaseAdmin
                .from('users')
                .select('id, email, full_name')
                .eq('email', email)
                .single();
            user = data;
        }

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (!user.email) {
            res.status(400).json({ error: 'No email associated with this account' });
            return;
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Delete existing OTPs for this user
        await supabaseAdmin
            .from('password_resets')
            .delete()
            .eq('user_id', user.id);

        // Save OTP
        await supabaseAdmin.from('password_resets').insert({
            user_id: user.id,
            otp,
            expires_at: expiresAt.toISOString(),
        });

        // TODO: Send email with OTP
        // For now, just return success (in production, integrate with email service)
        console.log(`OTP for ${user.email}: ${otp}`);

        res.json({
            message: 'OTP sent to your email',
            email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Verify OTP
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { ic_number, email, otp } = req.body;

        let userId: string | null = null;

        if (ic_number) {
            const { data } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('ic_number', ic_number)
                .single();
            userId = data?.id;
        } else if (email) {
            const { data } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('email', email)
                .single();
            userId = data?.id;
        }

        if (!userId) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const { data: resetRecord } = await supabaseAdmin
            .from('password_resets')
            .select('*')
            .eq('user_id', userId)
            .eq('otp', otp)
            .single();

        if (!resetRecord) {
            res.status(400).json({ error: 'Invalid OTP' });
            return;
        }

        if (new Date(resetRecord.expires_at) < new Date()) {
            res.status(400).json({ error: 'OTP has expired' });
            return;
        }

        res.json({ message: 'OTP verified', valid: true });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { ic_number, email, otp, new_password } = req.body;

        let userId: string | null = null;

        if (ic_number) {
            const { data } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('ic_number', ic_number)
                .single();
            userId = data?.id;
        } else if (email) {
            const { data } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('email', email)
                .single();
            userId = data?.id;
        }

        if (!userId) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Verify OTP again
        const { data: resetRecord } = await supabaseAdmin
            .from('password_resets')
            .select('*')
            .eq('user_id', userId)
            .eq('otp', otp)
            .single();

        if (!resetRecord || new Date(resetRecord.expires_at) < new Date()) {
            res.status(400).json({ error: 'Invalid or expired OTP' });
            return;
        }

        // Hash new password
        const password_hash = await bcrypt.hash(new_password, 10);

        // Update password
        await supabaseAdmin
            .from('users')
            .update({ password_hash, updated_at: new Date().toISOString() })
            .eq('id', userId);

        // Delete OTP record
        await supabaseAdmin
            .from('password_resets')
            .delete()
            .eq('user_id', userId);

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get current user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        let table = 'users';
        if (role === 'admin') table = 'admins';
        if (role === 'technician') table = 'technicians';

        const { data, error } = await supabaseAdmin
            .from(table)
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !data) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const { password_hash, ...userWithoutPassword } = data;
        res.json({ user: userWithoutPassword, role });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
