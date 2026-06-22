const Doctor = require('../../models/Doctor');
const db = require('../../config/database');
const supabase = require('../../config/supabase');
const path = require('path');

const updateProfile = async (req, res) => {
    try {
        const updatedDoctor = await Doctor.updateProfile(req.doctor.id, req.body);
        res.json(updatedDoctor);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const doctor = await Doctor.findById(req.doctor.id);
        // Need to fetch full doctor including password for verification
        const fullDoctor = await Doctor.findByEmail(req.doctor.email);
        
        const isMatch = await Doctor.verifyPassword(fullDoctor, currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        
        const strengthErrors = [];
        if (newPassword.length < 8) strengthErrors.push('At least 8 characters');
        if (!/[A-Z]/.test(newPassword)) strengthErrors.push('One uppercase letter');
        if (!/[a-z]/.test(newPassword)) strengthErrors.push('One lowercase letter');
        if (!/[0-9]/.test(newPassword)) strengthErrors.push('One number');
        if (!/[!@#$%^&*()_\-+=[\]{}|;:'",.<>/?`~]/.test(newPassword)) strengthErrors.push('One special character');

        if (strengthErrors.length > 0) {
            return res.status(400).json({
                message: 'Password must include: ' + strengthErrors.join(', ')
            });
        }

        await Doctor.updatePassword(req.doctor.id, newPassword);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: error.message });
    }
};

const uploadAvatar = async (req, res) => {
    try {
        if (!supabase) {
            return res.status(503).json({ message: 'File upload is not available (Supabase not configured)' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const doctorId = req.doctor.id;
        const file = req.file;
        const fileExt = path.extname(file.originalname);
        const fileName = `${doctorId}_${Date.now()}${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            return res.status(500).json({ message: 'Failed to upload image to storage' });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // Update doctor record in database
        await db.query('UPDATE doctors SET avatar_url = $1 WHERE id = $2', [publicUrl, doctorId]);

        res.json({
            message: 'Avatar updated successfully',
            avatar_url: publicUrl
        });
    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { updateProfile, changePassword, uploadAvatar };
