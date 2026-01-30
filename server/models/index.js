const User = require('./User');
const Video = require('./Video');
const Comment = require('./Comment');
const Like = require('./Like');
const Campaign = require('./Campaign');

// --- Relaciones Usuario - Video ---
// Un usuario tiene muchos videos
User.hasMany(Video, { foreignKey: 'userId' });
Video.belongsTo(User, { foreignKey: 'userId' });

// --- Relaciones Comentarios ---
// Un usuario hace muchos comentarios
User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

// Un video tiene muchos comentarios
Video.hasMany(Comment, { foreignKey: 'videoId' });
Comment.belongsTo(Video, { foreignKey: 'videoId' });

// --- Relaciones Likes (Thumbs Up) ---
// Un usuario da muchos likes
User.hasMany(Like, { foreignKey: 'userId' });
Like.belongsTo(User, { foreignKey: 'userId' });

// Un video recibe muchos likes
Video.hasMany(Like, { foreignKey: 'videoId' });
Like.belongsTo(Video, { foreignKey: 'videoId' });

// --- Relaciones Campañas ---
// Una campaña tiene muchos videos asociados (Relación muchos a muchos o uno a muchos)
// Según requerimiento 6.3, los usuarios envían videos a campañas.
Campaign.belongsToMany(Video, { through: 'CampaignVideos' });
Video.belongsToMany(Campaign, { through: 'CampaignVideos' });

module.exports = {
    User,
    Video,
    Comment,
    Like,
    Campaign
};