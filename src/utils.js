export function calculateTotalSlots(startDate, endDate, slotSchedule) {
  if (!startDate || !endDate || !slotSchedule) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  if (slotSchedule.type === 'uniform') {
    return (slotSchedule.slots || 0) * days;
  }

  if (slotSchedule.type === 'weekday') {
    const weekdayCounts = Array(7).fill(0);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      weekdayCounts[d.getDay()]++;
    }
    return Object.entries(slotSchedule.slots || {}).reduce((sum, [day, count]) => {
      const idx = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(day);
      return sum + (count || 0) * (weekdayCounts[idx] || 0);
    }, 0);
  }

  return 0;
}
