import { connectDB, Course } from '../../lib/database';
import { generateJSessions, reorganizeAllSessions } from '../../lib/planning';

export default async function handler(req, res) {
  await connectDB();

  const { method } = req;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-API-Key');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Vérification API Key pour modifications
  if (['POST', 'PUT', 'DELETE'].includes(method)) {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'API Key invalide ou manquante' });
    }
  }

  switch (method) {
    case 'GET':
      try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.status(200).json(courses);
      } catch (error) {
        console.error('Erreur GET courses:', error);
        res.status(500).json({ error: 'Erreur serveur' });
      }
      break;

    case 'POST':
      try {
        const { name, hoursPerDay, startDate, description } = req.body;

        if (!name || !hoursPerDay) {
          return res.status(400).json({
            error: 'Nom et heures par jour requis'
          });
        }

        const courseStartDate = startDate ? new Date(startDate) : new Date();

        const course = new Course({
          name,
          hoursPerDay: parseFloat(hoursPerDay),
          startDate: courseStartDate,
          description: description || '',
          sessions: generateJSessions(courseStartDate, parseFloat(hoursPerDay))
        });

        await course.save();

        // Réorganiser si nécessaire
        setTimeout(async () => {
          await reorganizeAllSessions();
        }, 100);

        // Webhook notification
        if (process.env.WEBHOOK_URL) {
          try {
            await fetch(process.env.WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'course_created',
                course: course,
                timestamp: new Date().toISOString()
              })
            });
          } catch (webhookError) {
            console.error('Erreur webhook:', webhookError);
          }
        }

        res.status(201).json(course);
      } catch (error) {
        console.error('Erreur POST course:', error);
        res.status(500).json({ error: 'Erreur création cours' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
