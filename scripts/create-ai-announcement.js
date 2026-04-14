// Script para crear el anuncio de la función de videos con IA
// Ejecutar con: node scripts/create-ai-announcement.js

const sequelize = require('../server/config/db');
const Campaign = require('../server/models/Campaign');

async function createAIAnnouncement() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a la base de datos');

    // Crear anuncio sobre videos con IA
    const announcement = await Campaign.create({
      name: 'AI Video Generation Coming Soon! / Generacion de Videos con IA Proximamente! / AI视频生成即将推出!',
      description: `🚀 ENGLISH:
Exciting news! AI-powered video generation is coming soon to HURAMMY! 
Create stunning videos from your images using artificial intelligence. 
Transform your photos into amazing video content with just a few clicks.
Stay tuned for the official launch!

---

🚀 ESPANOL:
Noticias emocionantes! La generacion de videos con IA llegara pronto a HURAMMY!
Crea videos impresionantes a partir de tus imagenes usando inteligencia artificial.
Transforma tus fotos en contenido de video increible con solo unos clics.
Estate atento al lanzamiento oficial!

---

🚀 中文:
激动人心的消息！AI视频生成功能即将登陆HURAMMY！
使用人工智能从您的图片创建精美视频。
只需几次点击，即可将您的照片转换为令人惊叹的视频内容。
敬请期待正式发布！`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 días
      status: 'Active'
    });

    console.log('Anuncio creado exitosamente:', announcement.name);
    console.log('ID:', announcement.id);
    
    process.exit(0);
  } catch (error) {
    console.error('Error al crear anuncio:', error);
    process.exit(1);
  }
}

createAIAnnouncement();
