export const jIntervals = [
  { key: 'J0', days: 0 },
  { key: 'J+1', days: 1 },
  { key: 'J+3', days: 3 },
  { key: 'J+7', days: 7 },
  { key: 'J+15', days: 15 },
  { key: 'J+30', days: 30 },
  { key: 'J+90', days: 90 }
];

export function generateJSessions(startDate, hoursPerDay) {
  const sessions = [];

  jIntervals.forEach(interval => {
    const sessionDate = new Date(startDate);
    sessionDate.setDate(startDate.getDate() + interval.days);

    // Éviter le dimanche
    if (sessionDate.getDay() === 0) {
      sessionDate.setDate(sessionDate.getDate() + 1);
    }

    sessions.push({
      id: `${Date.now()}_${interval.key}`,
      interval: interval.key,
      date: sessionDate,
      originalDate: new Date(sessionDate),
      hoursNeeded: hoursPerDay,
      completed: false,
      rescheduled: false
    });
  });

  return sessions;
}

export async function reorganizeAllSessions() {
  const [courses, constraints] = await Promise.all([
    Course.find(),
    Constraint.find()
  ]);

  const affectedSessions = [];
  const workingHours = { availableHours: 10 };

  // Algorithme de réorganisation avec contraintes
  for (const course of courses) {
    for (const session of course.sessions) {
      if (!session.completed) {
        let targetDate = new Date(Math.max(session.originalDate.getTime(), new Date().getTime()));

        while (true) {
          // Vérifier dimanche
          if (targetDate.getDay() === 0) {
            targetDate.setDate(targetDate.getDate() + 1);
            continue;
          }

          // Vérifier contraintes
          const hasConflict = constraints.some(constraint => {
            const constraintDate = new Date(constraint.date);
            constraintDate.setHours(0, 0, 0, 0);
            targetDate.setHours(0, 0, 0, 0);

            if (constraintDate.getTime() !== targetDate.getTime()) return false;

            return constraint.startHour === 0 && constraint.endHour === 24;
          });

          if (!hasConflict) {
            // Vérifier capacité quotidienne
            const dayHours = await getDayTotalHours(targetDate);
            if (dayHours + session.hoursNeeded <= workingHours.availableHours) {
              // Date valide trouvée
              if (session.date.getTime() !== targetDate.getTime()) {
                session.date = new Date(targetDate);
                session.rescheduled = true;
                affectedSessions.push(session);
              }
              break;
            }
          }

          targetDate.setDate(targetDate.getDate() + 1);
        }
      }
    }

    await course.save();
  }

  return affectedSessions;
}
