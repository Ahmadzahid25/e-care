import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { supabaseAdmin } from '../config/supabase.js';

// Get dashboard statistics
export const getStats = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get total complaints by status
        const { data: allComplaints } = await supabaseAdmin
            .from('complaints')
            .select('id, status, assigned_to');

        const stats = {
            total: allComplaints?.length || 0,
            pending: 0,
            in_process: 0,
            closed: 0,
            not_forwarded: 0,
            cancelled: 0,
        };

        allComplaints?.forEach((c) => {
            if (c.status === 'pending') stats.pending++;
            if (c.status === 'in_process') stats.in_process++;
            if (c.status === 'closed') stats.closed++;
            if (c.status === 'cancelled') stats.cancelled++;
            if (c.status === 'pending' && !c.assigned_to) stats.not_forwarded++;
        });

        res.json({ stats });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get technician statistics
export const getTechnicianStats = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get all active technicians
        const { data: technicians } = await supabaseAdmin
            .from('technicians')
            .select('id, name, department')
            .eq('is_active', true);

        if (!technicians) {
            res.json({ technicianStats: [] });
            return;
        }

        // Get complaints for each technician
        const technicianStats = await Promise.all(
            technicians.map(async (tech) => {
                const { data: complaints } = await supabaseAdmin
                    .from('complaints')
                    .select('status')
                    .eq('assigned_to', tech.id);

                const stats = {
                    technician_id: tech.id,
                    technician_name: tech.name,
                    department: tech.department,
                    total: complaints?.length || 0,
                    pending: 0,
                    in_process: 0,
                    closed: 0,
                };

                complaints?.forEach((c) => {
                    if (c.status === 'pending') stats.pending++;
                    if (c.status === 'in_process') stats.in_process++;
                    if (c.status === 'closed') stats.closed++;
                });

                return stats;
            })
        );

        res.json({ technicianStats });
    } catch (error) {
        console.error('Get technician stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get single technician
export const getTechnician = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { data, error } = await supabaseAdmin
            .from('technicians')
            .select('id, name, department, email, contact_number, username, is_active, created_at')
            .eq('id', id)
            .single();

        if (error || !data) {
            res.status(404).json({ error: 'Technician not found' });
            return;
        }

        res.json({ technician: data });
    } catch (error) {
        console.error('Get technician error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all technicians
export const getTechnicians = async (req: Request, res: Response): Promise<void> => {
    try {
        const { data, error } = await supabaseAdmin
            .from('technicians')
            .select('id, name, department, email, contact_number, username, is_active, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            res.status(500).json({ error: 'Failed to fetch technicians' });
            return;
        }

        res.json({ technicians: data });
    } catch (error) {
        console.error('Get technicians error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create technician
export const createTechnician = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, department, email, contact_number, username, password } = req.body;

        // Check if username or email already exists
        const { data: existing } = await supabaseAdmin
            .from('technicians')
            .select('id')
            .or(`username.eq.${username},email.eq.${email}`)
            .maybeSingle();

        if (existing) {
            res.status(400).json({ error: 'Username or email already exists' });
            return;
        }

        const password_hash = await bcrypt.hash(password, 10);

        const { data, error } = await supabaseAdmin
            .from('technicians')
            .insert({
                name,
                department,
                email,
                contact_number,
                username,
                password_hash,
            })
            .select()
            .single();

        if (error) {
            console.error('Create technician error:', error);
            res.status(500).json({ error: 'Failed to create technician' });
            return;
        }

        const { password_hash: _, ...techWithoutPassword } = data;
        res.status(201).json({ message: 'Technician created', technician: techWithoutPassword });
    } catch (error) {
        console.error('Create technician error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update technician
export const updateTechnician = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, department, email, contact_number, is_active } = req.body;

        const updateData: any = { updated_at: new Date().toISOString() };
        if (name !== undefined) updateData.name = name;
        if (department !== undefined) updateData.department = department;
        if (email !== undefined) updateData.email = email;
        if (contact_number !== undefined) updateData.contact_number = contact_number;
        if (is_active !== undefined) updateData.is_active = is_active;

        const { data, error } = await supabaseAdmin
            .from('technicians')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            res.status(500).json({ error: 'Failed to update technician' });
            return;
        }

        const { password_hash, ...techWithoutPassword } = data;
        res.json({ message: 'Technician updated', technician: techWithoutPassword });
    } catch (error) {
        console.error('Update technician error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Reset technician password
export const resetTechnicianPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { new_password } = req.body;

        const password_hash = await bcrypt.hash(new_password, 10);

        const { error } = await supabaseAdmin
            .from('technicians')
            .update({ password_hash, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            res.status(500).json({ error: 'Failed to reset password' });
            return;
        }

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete technician
export const deleteTechnician = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('technicians')
            .delete()
            .eq('id', id);

        if (error) {
            res.status(500).json({ error: 'Failed to delete technician' });
            return;
        }

        res.json({ message: 'Technician deleted' });
    } catch (error) {
        console.error('Delete technician error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get single user
export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const { password_hash, ...userWithoutPassword } = data as any;
        res.json({ user: userWithoutPassword });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 10, search, status } = req.query;

        let query = supabaseAdmin
            .from('users')
            .select('id, full_name, ic_number, email, contact_no, address, state, status, created_at', { count: 'exact' });

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (search) {
            query = query.or(`full_name.ilike.%${search}%,ic_number.ilike.%${search}%,email.ilike.%${search}%`);
        }

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const offset = (pageNum - 1) * limitNum;

        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + limitNum - 1);

        const { data, error, count } = await query;

        if (error) {
            res.status(500).json({ error: 'Failed to fetch users' });
            return;
        }

        res.json({
            users: data,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limitNum),
            },
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update user status
export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data, error } = await supabaseAdmin
            .from('users')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            res.status(500).json({ error: 'Failed to update user status' });
            return;
        }

        res.json({ message: 'User status updated', user: data });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get admin/technician profile
export const getAdminProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const role = (req as any).user.role;

        let data, error;

        if (role === 'technician') {
            console.log(`Fetching technician profile for ${userId}`);
            const result = await supabaseAdmin
                .from('technicians')
                .select('*')
                .eq('id', userId)
                .single();
            data = result.data;
            error = result.error;
        } else {
            console.log(`Fetching admin profile for ${userId}`);
            const result = await supabaseAdmin
                .from('admins')
                .select('*')
                .eq('id', userId)
                .single();
            data = result.data;
            error = result.error;
        }

        if (error) {
            console.error('Profile fetch Supabase error:', error);
        }

        if (error || !data) {
            res.status(404).json({ error: 'Profile not found' });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update admin/technician profile
export const updateAdminProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const role = (req as any).user.role;
        const { username, email } = req.body;

        if (!username || !username.trim()) {
            res.status(400).json({ error: 'Username is required' });
            return;
        }

        const table = role === 'technician' ? 'technicians' : 'admins';

        // Check if username already exists for another user in the same table
        const { data: existing } = await supabaseAdmin
            .from(table)
            .select('id')
            .eq('username', username.trim())
            .neq('id', userId)
            .maybeSingle();

        if (existing) {
            res.status(400).json({ error: 'Username already taken' });
            return;
        }

        const updateData: any = {
            username: username.trim(),
            email: email?.trim() || null,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabaseAdmin
            .from(table)
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            res.status(500).json({ error: 'Failed to update profile' });
            return;
        }

        res.json({ message: 'Profile updated successfully', user: data });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update admin/technician password
export const updateAdminPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const role = (req as any).user.role;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400).json({ error: 'Current password and new password are required' });
            return;
        }

        if (newPassword.length < 6) {
            res.status(400).json({ error: 'New password must be at least 6 characters' });
            return;
        }

        const table = role === 'technician' ? 'technicians' : 'admins';
        const passwordField = role === 'technician' ? 'password_hash' : 'password';

        // Get current user password hash
        const { data: user } = await supabaseAdmin
            .from(table)
            .select(passwordField)
            .eq('id', userId)
            .single();

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Verify current password
        const currentHash = user[passwordField as keyof typeof user];
        const isValid = await bcrypt.compare(currentPassword, currentHash);

        if (!isValid) {
            res.status(400).json({ error: 'Current password is incorrect' });
            return;
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        const updateData = {
            [passwordField]: hashedPassword,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabaseAdmin
            .from(table)
            .update(updateData)
            .eq('id', userId);

        if (error) {
            res.status(500).json({ error: 'Failed to update password' });
            return;
        }

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
