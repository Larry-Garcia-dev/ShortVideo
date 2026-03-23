const { UserCoins, CoinTransaction, User } = require('../models');

// Coin packages available for purchase
const COIN_PACKAGES = [
    { id: 'pack_100', coins: 100, price: 0.99, bonus: 0, popular: false },
    { id: 'pack_500', coins: 500, price: 4.99, bonus: 25, popular: false },
    { id: 'pack_1000', coins: 1000, price: 9.99, bonus: 100, popular: true },
    { id: 'pack_2500', coins: 2500, price: 19.99, bonus: 375, popular: false },
    { id: 'pack_5000', coins: 5000, price: 39.99, bonus: 1000, popular: false },
    { id: 'pack_10000', coins: 10000, price: 74.99, bonus: 2500, popular: false }
];

// Get user's coin balance
exports.getBalance = async (req, res) => {
    try {
        const { userId } = req.params;

        let userCoins = await UserCoins.findOne({ where: { userId } });
        if (!userCoins) {
            userCoins = await UserCoins.create({ userId, balance: 0 });
        }

        res.json({
            balance: userCoins.balance,
            totalPurchased: userCoins.totalPurchased,
            totalSpent: userCoins.totalSpent,
            totalReceived: userCoins.totalReceived
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching balance', error: error.message });
    }
};

// Get available coin packages
exports.getPackages = async (req, res) => {
    try {
        res.json(COIN_PACKAGES);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching packages', error: error.message });
    }
};

// Purchase coins (simulated payment)
exports.purchaseCoins = async (req, res) => {
    try {
        const { userId, packageId, paymentMethod } = req.body;

        // Find the package
        const pkg = COIN_PACKAGES.find(p => p.id === packageId);
        if (!pkg) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Verify user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate payment success (in production, integrate real payment gateway)
        const paymentSuccess = true; // Always succeed in simulation

        if (!paymentSuccess) {
            return res.status(400).json({ message: 'Payment failed' });
        }

        // Calculate total coins (base + bonus)
        const totalCoins = pkg.coins + pkg.bonus;

        // Update user's coin balance
        let userCoins = await UserCoins.findOne({ where: { userId } });
        if (!userCoins) {
            userCoins = await UserCoins.create({ userId, balance: 0 });
        }

        userCoins.balance += totalCoins;
        userCoins.totalPurchased += totalCoins;
        await userCoins.save();

        // Record transaction
        const transaction = await CoinTransaction.create({
            userId,
            type: 'purchase',
            amount: totalCoins,
            packageId,
            priceUSD: pkg.price,
            paymentStatus: 'completed',
            paymentMethod: paymentMethod || 'card'
        });

        res.json({
            message: 'Purchase successful!',
            coinsAdded: totalCoins,
            newBalance: userCoins.balance,
            transaction: {
                id: transaction.id,
                amount: totalCoins,
                price: pkg.price
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error processing purchase', error: error.message });
    }
};

// Get transaction history
exports.getTransactions = async (req, res) => {
    try {
        const { userId } = req.params;
        const { type, limit = 50 } = req.query;

        const where = { userId };
        if (type) {
            where.type = type;
        }

        const transactions = await CoinTransaction.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit)
        });

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
};

// Add free coins (for promotions, rewards, etc.)
exports.addFreeCoins = async (req, res) => {
    try {
        const { userId, amount, reason } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        let userCoins = await UserCoins.findOne({ where: { userId } });
        if (!userCoins) {
            userCoins = await UserCoins.create({ userId, balance: 0 });
        }

        userCoins.balance += amount;
        await userCoins.save();

        // Record as a special transaction
        await CoinTransaction.create({
            userId,
            type: 'purchase',
            amount,
            packageId: 'free_' + reason,
            priceUSD: 0,
            paymentStatus: 'completed',
            paymentMethod: 'promotion'
        });

        res.json({
            message: 'Coins added!',
            coinsAdded: amount,
            newBalance: userCoins.balance
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding coins', error: error.message });
    }
};
