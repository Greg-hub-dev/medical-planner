export default async function handler(req, res) {
  try {
    const [courses, constraints] = await Promise.all([
      Course.find(),
      Constraint.find()
    ]);

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        courses: courses,
        constraints: constraints,
        settings: {
          workingHours: { start: 9, end: 20, lunchBreak: { start: 13, end: 14 } },
          jIntervals: [0, 1, 3, 7, 15, 30, 90]
        }
      }
    };

    res.status(200).json(exportData);
  } catch (error) {
    res.status(500).json({ error: 'Erreur export' });
  }
}
