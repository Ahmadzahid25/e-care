import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { supabaseAdmin } from '../config/supabase.js';
import { createNotification } from './notifications.controller.js';

// Get user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !data) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const { password_hash, ...userWithoutPassword } = data;
        res.json({ user: userWithoutPassword });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { full_name, email, contact_no, contact_no_2, address, state } = req.body;

        const updateData: any = { updated_at: new Date().toISOString() };
        if (full_name !== undefined) updateData.full_name = full_name;
        if (email !== undefined) updateData.email = email || null;
        if (contact_no !== undefined) updateData.contact_no = contact_no;
        if (contact_no_2 !== undefined) updateData.contact_no_2 = contact_no_2 || null;
        if (address !== undefined) updateData.address = address;
        if (state !== undefined) updateData.state = state || null;

        const { data, error } = await supabaseAdmin
            .from('users')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            res.status(500).json({ error: 'Failed to update profile' });
            return;
        }

        // Notify user about profile update
        await createNotification(
            userId!,
            'user',
            'Profil Dikemaskini',
            'Profil anda telah berjaya dikemaskini.',
            'status_update',
            0
        );

        const { password_hash, ...userWithoutPassword } = data;
        res.json({ message: 'Profile updated', user: userWithoutPassword });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Change password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { current_password, new_password } = req.body;

        // Get current password hash
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('password_hash')
            .eq('id', userId)
            .single();

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Verify current password
        const validPassword = await bcrypt.compare(current_password, user.password_hash);
        if (!validPassword) {
            res.status(400).json({ error: 'Current password is incorrect' });
            return;
        }

        // Hash new password
        const password_hash = await bcrypt.hash(new_password, 10);

        // Update password
        const { error } = await supabaseAdmin
            .from('users')
            .update({ password_hash, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) {
            res.status(500).json({ error: 'Failed to change password' });
            return;
        }

        // Notify user about password change
        await createNotification(
            userId!,
            'user',
            'Kata Laluan Ditukar',
            'Kata laluan akaun anda telah berjaya ditukar. Jika anda tidak membuat perubahan ini, sila hubungi kami segera.',
            'status_update',
            0
        );

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Upload avatar
export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const file = req.file;

        if (!file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        const fileName = `${userId}_${Date.now()}.${file.originalname.split('.').pop()}`;

        const { data, error } = await supabaseAdmin.storage
            .from('user-images')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });

        if (error) {
            res.status(500).json({ error: 'Failed to upload image' });
            return;
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from('user-images')
            .getPublicUrl(data.path);

        // Update user record
        await supabaseAdmin
            .from('users')
            .update({ user_image: urlData.publicUrl, updated_at: new Date().toISOString() })
            .eq('id', userId);

        res.json({ message: 'Avatar uploaded', url: urlData.publicUrl });
    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
