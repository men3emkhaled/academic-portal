const TeachingAssistant = require('../../models/TeachingAssistant');
const db = require('../../config/database');
const supabase = require('../../config/supabase');
const path = require('path');

const updateProfile = async (req, res) => {
    try {
        const updatedTA = await TeachingAssistant.updateProfile(req.ta.id, req.body);
        res.json(updatedTA);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const ta = await TeachingAssistant.findById(req.ta.id);
        // Need to fetch full TA including password for verification
        const fullTA = await TeachingAssistant.findByEmail(req.ta.email);
        
        const isMatch = await TeachingAssistant.verifyPassword(fullTA, currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        
        await TeachingAssistant.updatePassword(req.ta.id, newPassword);
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

        const taId = req.ta.id;
        const file = req.file;
        const fileExt = path.extname(file.originalname);
        const fileName = `${taId}_${Date.now()}${fileExt}`;
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

        // Update TA record in database
        await db.query('UPDATE teaching_assistants SET avatar_url = $1 WHERE id = $2', [publicUrl, taId]);

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
