export const getShiftDetails = (now: Date) => {
  const hour = now.getHours();
  let shift: 'Morning' | 'Night';
  let businessDate = new Date(now);

  // Logic: 
  // Morning: 09:00 AM (9) to 08:59 PM (20) -> Same Day
  // Night: 09:00 PM (21) to 08:59 AM (8) 
  
  if (hour >= 21 || hour < 9) {
    shift = 'Night';
    // If it's early morning (e.g. 1 AM), the business date belongs to Yesterday
    if (hour < 9) {
      businessDate.setDate(businessDate.getDate() - 1);
    }
  } else {
    shift = 'Morning';
  }

  // Zero out time for clean date comparison
  businessDate.setHours(0, 0, 0, 0);
  return { shift, businessDate };
};