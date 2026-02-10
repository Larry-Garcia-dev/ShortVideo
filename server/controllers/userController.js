const { User, Video, Comment, Like, Follow } = require('../models');
const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');

// Req 7.2: Permitir al usuario seleccionar idioma
exports.updateLanguage = async (req, res) => {
    try {
        const { userId, language } = req.body;

        const validLangs = ['en', 'es', 'zh'];
        if (!validLangs.includes(language)) {
            return res.status(400).json({ message: 'Idioma no soportado. Use: en, es, zh' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        await user.update({ language });

        res.json({ message: 'Idioma actualizado', language: user.language });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get top creators ranked by total views + likes + comments + followers
exports.getTopCreators = async (req, res) => {
    try {
        const currentUserId = req.query.userId ? parseInt(req.query.userId) : null;

        // Get all users who have uploaded at least 1 video
        const creators = await User.findAll({
            attributes: [
                'id',
                'email',
                [Sequelize.fn('COUNT', Sequelize.col('Videos.id')), 'videoCount'],
                [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('Videos.views')), 0), 'totalViews'],
            ],
            include: [
                {
                    model: Video,
                    attributes: [],
                }
            ],
           group: ['User.id'],
            // CORRECCIÓN AQUÍ: Cambiar " por ` (backticks)
            having: Sequelize.literal('COUNT(`Videos`.`id`) > 0'), 
            // CORRECCIÓN AQUÍ: Cambiar "totalViews" por `totalViews` o simplemente totalViews
            order: [[Sequelize.literal('totalViews'), 'DESC']], 
            limit: 10,
            subQuery: false,
        });

        // For each creator, get likes count, comments count, followers count
        const creatorData = await Promise.all(creators.map(async (creator) => {
            const creatorJSON = creator.toJSON();

            // Count total likes on all their videos
            const likeCount = await Like.count({
                include: [{
                    model: Video,
                    where: { userId: creator.id },
                    attributes: []
                }]
            });

            // Count total comments on all their videos
            const commentCount = await Comment.count({
                include: [{
                    model: Video,
                    where: { userId: creator.id },
                    attributes: []
                }]
            });

            // Count followers
            const followerCount = await Follow.count({
                where: { followingId: creator.id }
            });

            // Check if current user follows this creator
            let isFollowing = false;
            if (currentUserId) {
                const follow = await Follow.findOne({
                    where: { followerId: currentUserId, followingId: creator.id }
                });
                isFollowing = !!follow;
            }

            // Calculate a score for ranking
            const totalViews = parseInt(creatorJSON.totalViews) || 0;
            const score = totalViews + (likeCount * 5) + (commentCount * 3) + (followerCount * 10);

            // Extract username from email
            const username = creatorJSON.email.split('@')[0];

            return {
                id: creator.id,
                email: creatorJSON.email,
                username: `@${username}`,
                videoCount: parseInt(creatorJSON.videoCount) || 0,
                totalViews,
                totalLikes: likeCount,
                totalComments: commentCount,
                followers: followerCount,
                isFollowing,
                score,
            };
        }));

        // Sort by score descending
        creatorData.sort((a, b) => b.score - a.score);

        res.json(creatorData.slice(0, 5));
    } catch (error) {
        console.error('getTopCreators error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Follow a user
exports.followUser = async (req, res) => {
    try {
        const { followerId, followingId } = req.body;

        if (!followerId || !followingId) {
            return res.status(400).json({ message: 'followerId and followingId are required' });
        }

        if (parseInt(followerId) === parseInt(followingId)) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        // Check if already following
        const existing = await Follow.findOne({
            where: { followerId, followingId }
        });

        if (existing) {
            return res.status(400).json({ message: 'Already following this user' });
        }

        await Follow.create({ followerId, followingId });
        
        // Return updated follower count
        const followerCount = await Follow.count({ where: { followingId } });

        res.json({ message: 'Followed successfully', followers: followerCount, isFollowing: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
    try {
        const { followerId, followingId } = req.body;

        if (!followerId || !followingId) {
            return res.status(400).json({ message: 'followerId and followingId are required' });
        }

        const existing = await Follow.findOne({
            where: { followerId, followingId }
        });

        if (!existing) {
            return res.status(400).json({ message: 'Not following this user' });
        }

        await existing.destroy();

        const followerCount = await Follow.count({ where: { followingId } });

        res.json({ message: 'Unfollowed successfully', followers: followerCount, isFollowing: false });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle follow (follow/unfollow in one endpoint)
exports.toggleFollow = async (req, res) => {
    try {
        const { followerId, followingId } = req.body;

        if (!followerId || !followingId) {
            return res.status(400).json({ message: 'followerId and followingId are required' });
        }

        if (parseInt(followerId) === parseInt(followingId)) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        const existing = await Follow.findOne({
            where: { followerId, followingId }
        });

        if (existing) {
            await existing.destroy();
            const followerCount = await Follow.count({ where: { followingId } });
            return res.json({ message: 'Unfollowed', followers: followerCount, isFollowing: false });
        }

        await Follow.create({ followerId, followingId });
        const followerCount = await Follow.count({ where: { followingId } });

        res.json({ message: 'Followed', followers: followerCount, isFollowing: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get follower count for a user
exports.getFollowerCount = async (req, res) => {
    try {
        const { id } = req.params;
        const followerCount = await Follow.count({ where: { followingId: id } });
        const followingCount = await Follow.count({ where: { followerId: id } });
        res.json({ followers: followerCount, following: followingCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
