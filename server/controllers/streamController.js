const { Stream, User, UserCoins, CoinTransaction, Gift } = require('../models');

// Get all active streams
exports.getLiveStreams = async (req, res) => {
    try {
        const streams = await Stream.findAll({
            where: { status: 'live' },
            include: [{
                model: User,
                attributes: ['id', 'email', 'avatar', 'googleId']
            }],
            order: [['viewerCount', 'DESC'], ['createdAt', 'DESC']]
        });
        res.json(streams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching streams', error: error.message });
    }
};

// Get stream by ID
exports.getStreamById = async (req, res) => {
    try {
        const { id } = req.params;
        const stream = await Stream.findByPk(id, {
            include: [{
                model: User,
                attributes: ['id', 'email', 'avatar', 'googleId']
            }]
        });
        if (!stream) {
            return res.status(404).json({ message: 'Stream not found' });
        }
        res.json(stream);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stream', error: error.message });
    }
};

// Start a new stream (requires Google-linked account)
exports.startStream = async (req, res) => {
    try {
        const { userId, title, description, category, thumbnailUrl } = req.body;

        // Check if user exists and has Google linked
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.googleId) {
            return res.status(403).json({ message: 'Google account must be linked to stream', code: 'GOOGLE_REQUIRED' });
        }

        // Check if user already has an active stream
        const existingStream = await Stream.findOne({
            where: { userId, status: 'live' }
        });
        if (existingStream) {
            return res.status(400).json({ message: 'You already have an active stream' });
        }

        const stream = await Stream.create({
            userId,
            title,
            description,
            category,
            thumbnailUrl,
            status: 'live',
            startedAt: new Date()
        });

        const fullStream = await Stream.findByPk(stream.id, {
            include: [{
                model: User,
                attributes: ['id', 'email', 'avatar']
            }]
        });

        res.status(201).json(fullStream);
    } catch (error) {
        res.status(500).json({ message: 'Error starting stream', error: error.message });
    }
};

// End a stream
exports.endStream = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const stream = await Stream.findByPk(id);
        if (!stream) {
            return res.status(404).json({ message: 'Stream not found' });
        }
        if (stream.userId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        stream.status = 'ended';
        stream.endedAt = new Date();
        await stream.save();

        res.json({ message: 'Stream ended', stream });
    } catch (error) {
        res.status(500).json({ message: 'Error ending stream', error: error.message });
    }
};

// Update viewer count
exports.updateViewerCount = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'join' or 'leave'

        const stream = await Stream.findByPk(id);
        if (!stream || stream.status !== 'live') {
            return res.status(404).json({ message: 'Stream not found or not live' });
        }

        if (action === 'join') {
            stream.viewerCount += 1;
            if (stream.viewerCount > stream.peakViewers) {
                stream.peakViewers = stream.viewerCount;
            }
        } else if (action === 'leave') {
            stream.viewerCount = Math.max(0, stream.viewerCount - 1);
        }

        await stream.save();
        res.json({ viewerCount: stream.viewerCount });
    } catch (error) {
        res.status(500).json({ message: 'Error updating viewer count', error: error.message });
    }
};

// Send a gift to a streamer
exports.sendGift = async (req, res) => {
    try {
        const { streamId, userId, giftId } = req.body;

        // Get the stream
        const stream = await Stream.findByPk(streamId, {
            include: [{ model: User }]
        });
        if (!stream || stream.status !== 'live') {
            return res.status(404).json({ message: 'Stream not found or not live' });
        }

        // Get gift info
        let gift = await Gift.findOne({ where: { giftId } });
        if (!gift) {
            // Use static gift data if not in DB
            const staticGifts = {
                'coin': { name: 'Coin', coinCost: 1 },
                'heart': { name: 'Heart', coinCost: 5 },
                'star': { name: 'Star', coinCost: 10 },
                'diamond': { name: 'Diamond', coinCost: 50 },
                'rocket': { name: 'Rocket', coinCost: 100 },
                'crown': { name: 'Crown', coinCost: 500 }
            };
            gift = staticGifts[giftId];
            if (!gift) {
                return res.status(404).json({ message: 'Gift not found' });
            }
            gift.coinCost = gift.coinCost;
        }

        // Check sender's balance
        let senderCoins = await UserCoins.findOne({ where: { userId } });
        if (!senderCoins) {
            senderCoins = await UserCoins.create({ userId, balance: 0 });
        }
        if (senderCoins.balance < gift.coinCost) {
            return res.status(400).json({ message: 'Insufficient coins', code: 'INSUFFICIENT_COINS' });
        }

        // Deduct from sender
        senderCoins.balance -= gift.coinCost;
        senderCoins.totalSpent += gift.coinCost;
        await senderCoins.save();

        // Add to receiver (streamer)
        let receiverCoins = await UserCoins.findOne({ where: { userId: stream.userId } });
        if (!receiverCoins) {
            receiverCoins = await UserCoins.create({ userId: stream.userId, balance: 0 });
        }
        receiverCoins.balance += gift.coinCost;
        receiverCoins.totalReceived += gift.coinCost;
        await receiverCoins.save();

        // Update stream stats
        stream.totalGiftsReceived += 1;
        stream.totalCoinsReceived += gift.coinCost;
        await stream.save();

        // Record transactions
        await CoinTransaction.create({
            userId,
            type: 'gift_sent',
            amount: gift.coinCost,
            streamId,
            giftId,
            recipientId: stream.userId
        });

        await CoinTransaction.create({
            userId: stream.userId,
            type: 'gift_received',
            amount: gift.coinCost,
            streamId,
            giftId,
            senderId: userId
        });

        res.json({
            message: 'Gift sent!',
            gift: { giftId, name: gift.name, coinCost: gift.coinCost },
            senderBalance: senderCoins.balance
        });
    } catch (error) {
        res.status(500).json({ message: 'Error sending gift', error: error.message });
    }
};

// Get user's stream history
exports.getUserStreams = async (req, res) => {
    try {
        const { userId } = req.params;
        const streams = await Stream.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            include: [{
                model: User,
                attributes: ['id', 'email', 'avatar']
            }]
        });
        res.json(streams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user streams', error: error.message });
    }
};

// Get available gifts
exports.getGifts = async (req, res) => {
    try {
        // Check DB first
        let gifts = await Gift.findAll({
            where: { isActive: true },
            order: [['sortOrder', 'ASC'], ['coinCost', 'ASC']]
        });

        // If no gifts in DB, return static list
        if (gifts.length === 0) {
            gifts = [
                { giftId: 'coin', name: 'Coin', icon: 'coin', coinCost: 1, category: 'basic' },
                { giftId: 'heart', name: 'Heart', icon: 'heart', coinCost: 5, category: 'basic' },
                { giftId: 'star', name: 'Star', icon: 'star', coinCost: 10, category: 'standard' },
                { giftId: 'fire', name: 'Fire', icon: 'fire', coinCost: 25, category: 'standard' },
                { giftId: 'diamond', name: 'Diamond', icon: 'diamond', coinCost: 50, category: 'premium' },
                { giftId: 'rocket', name: 'Rocket', icon: 'rocket', coinCost: 100, category: 'premium' },
                { giftId: 'crown', name: 'Crown', icon: 'crown', coinCost: 500, category: 'legendary' },
                { giftId: 'galaxy', name: 'Galaxy', icon: 'galaxy', coinCost: 1000, category: 'legendary' }
            ];
        }

        res.json(gifts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching gifts', error: error.message });
    }
};
