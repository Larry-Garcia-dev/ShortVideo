const { Video, User, Comment, Like } = require('../../models');
const { getVideoDurationInSeconds } = require('get-video-duration');
const ffprobe = require('ffprobe-static');
const fs = require('fs');

exports.uploadVideo = async (req, res) => {
    try {
        const videoFile = req.files?.videoFile?.[0];
        const thumbnailFile = req.files?.thumbnail?.[0];

        if (!videoFile) return res.status(400).json({ message: 'No video file provided' });
        
        const videoPath = videoFile.path;
        const duration = await getVideoDurationInSeconds(videoPath, ffprobe.path);
        
        if (duration > 600) {
            fs.unlinkSync(videoPath);
            if (thumbnailFile) fs.unlinkSync(thumbnailFile.path);
            return res.status(400).json({ message: 'Video exceeds 10 minutes limit.' });
        }

        let tags = [];
        if (req.body.tags) {
            try {
                tags = typeof req.body.tags === 'string' ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
            } catch { tags = []; }
        }

        const newVideo = await Video.create({
            title: req.body.title,
            description: req.body.description,
            videoUrl: videoPath,
            thumbnailUrl: thumbnailFile ? thumbnailFile.path : null,
            category: req.body.category || 'General',
            tags: tags,
            duration: duration,
            userId: req.body.userId
        });
        res.status(201).json({ message: 'Video uploaded successfully', video: newVideo });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.updateVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        const thumbnailFile = req.files?.thumbnail?.[0] || req.file;

        const video = await Video.findByPk(id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        if (title !== undefined) video.title = title;
        if (description !== undefined) video.description = description;
        if (thumbnailFile) {
            video.thumbnailUrl = thumbnailFile.path;
        }

        await video.save();

        res.json({ message: 'Video updated', video: video.toJSON() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const video = await Video.findByPk(id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        if (video.userId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (video.videoUrl && fs.existsSync(video.videoUrl)) fs.unlinkSync(video.videoUrl);
        if (video.thumbnailUrl && fs.existsSync(video.thumbnailUrl)) fs.unlinkSync(video.thumbnailUrl);

        await Like.destroy({ where: { videoId: id } });
        await Comment.destroy({ where: { videoId: id } });
        await video.destroy();

        res.json({ message: 'Video deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllVideos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const offset = (page - 1) * limit;

        const { count, rows } = await Video.findAndCountAll({
            include: [
                { model: User, attributes: ['email'] },
                { model: Like }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            distinct: true 
        });

        res.status(200).json({
            videos: rows,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalVideos: count,
            hasMore: page < Math.ceil(count / limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener videos', error });
    }
};

exports.getVideoById = async (req, res) => {
    try {
        const { id } = req.params;
        const video = await Video.findByPk(id, {
            include: [
                { model: User, attributes: ['email'] }, 
                { model: Comment, include: [User] },    
                { model: Like }                         
            ]
        });

        if (!video) return res.status(404).json({ message: 'Video no encontrado' });

        video.views += 1;
        await video.save();

        res.json(video);
    } catch (error) {
        res.status(500).json({ message: 'Error server', error });
    }
};